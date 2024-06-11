---
title: Implementing a Capacitor plugin
sidebar_label: Capacitor Plugin
sidebar_position: 5
---

import Admonition from '@theme/Admonition';

<a href="https://ionic.io/docs/portals/choosing-a-communication#capacitor-plugins" target="_blank">Capacitor plugins</a> provide a practical approach to structured communication through a Portal. The <a href="https://capacitorjs.com/" target="_blank">Capacitor bridge</a> is used under the hood in Portals, allowing Capacitor plugins to be used.

In this step, you will author a Capacitor plugin to log analytics.

## Exploring the problem

Business sponsors of the Jobsync superapp would like to allow the web apps presented through Portals to log analytic events, with the following requirements: 

1. The ability to log navigation to a new screen shall exist.
2. The ability to log specific actions taken in the app shall exist.
3. Every analytic entry shall track the platform the log occurred on.

You could use Portal's pub/sub mechanism to satisfy the requirements, but authoring a Capacitor plugin to handle analytics provides a structured, OOP-based approach to communicate through a Portal without the need to manage subscriptions.

## Defining the API contract

Capacitor plugins are bound to a shared API which platform developers (iOS/Android/web) implement. During runtime, a Capacitor plugin dynamically directs calls to the appropriate implementation. 

<Admonition type="info">
Capacitor plugins perform platform-detection under the hood, making them a good abstraction for processes that require different implementations on different platforms.
</Admonition>

Ionic recommends using TypeScript to define the API of a Capacitor plugin. This provides a central source of truth for the API across iOS and Android as well as providing type definitions for web code. 

Based on the requirements above, the following interface is reasonable for the analytics plugin:

```typescript
interface AnalyticsPlugin {
  logAction(opts: { action: string, params?: any }): Promise<void>;
  logScreen(opts: { screen: string, params?: any }): Promise<void>;
}
```

Notice that the interface doesn't address the requirement of tracking the running platform. This is an implementation detail that can be addressed when platform-specific code is written.

In Android Studio, create a new Kotlin file in the `portals` folder named `AnalyticsPlugin.kt` and populate the file with the following code:

```kotlin portals/AnalyticsPlugin.kt
package io.ionic.cs.portals.Jobsync.portals

import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin

@CapacitorPlugin(name="Analytics")
class AnalyticsPlugin: Plugin() {
    @PluginMethod()
    fun logAction(call: PluginCall) {
        println("AnalyticsPlugin: logAction")
        call.resolve()
    }

    @PluginMethod()
    fun logScreen(call: PluginCall) {
        println("AnalyticsPlugin: logScreen")
        call.resolve()
    }
}
```

<Admonition type="info">
Refer to <a href="https://ionic.io/docs/portals/for-android/how-to/define-api-in-typescript" target="_blank">How To Define a Portal API</a> for detailed information on authoring a Capacitor plugin.
</Admonition>

## Adding the plugin to a Portal

Capacitor plugins can be added to a Portal that has been initialized. Update the Portal defined in `WebAppScreen`, adding the `AnalyticsPlugin` to the Portal:

<CH.Code rows={10}>

```kotlin portals/WebAppScreen.kt focus=44
package io.ionic.cs.portals.jobsync.portals

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView
import androidx.navigation.NavHostController
import io.ionic.cs.portals.jobsync.util.CredentialsManager
import io.ionic.portals.PortalBuilder
import io.ionic.portals.PortalView
import io.ionic.portals.PortalsPlugin
import io.ionic.portals.PortalsPubSub
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

@Composable
fun WebAppScreen(navController: NavHostController, metadata: WebAppMetadata) {
  val pubSub = PortalsPubSub()
  pubSub.subscribe("navigate:back") {
    CoroutineScope(Dispatchers.Main).launch {
      navController.popBackStack()
    }
    pubSub.unsubscribe("navigate:back", it.subscriptionRef)
  }

  Scaffold { innerPadding ->
    Column(
      Modifier.fillMaxSize().padding(innerPadding),
      verticalArrangement = Arrangement.Center,
      horizontalAlignment = Alignment.CenterHorizontally
    ) {
      AndroidView(
        modifier = Modifier.fillMaxSize(),
        factory = { context ->
          val portal = PortalBuilder("debug")
            .setStartDir("portals/debug")
            .setInitialContext(CredentialsManager.credentials!!.toMap())
            .addPlugin(AnalyticsPlugin::class.java)
            .addPluginInstance(PortalsPlugin(pubSub))
            .create()
          PortalView(context, portal)
        }
      )
    }
  }
}
```

</CH.Code>

Build and run the Jobsync app and navigate to one of the features in the dashboard view. Switch from the 'Initial Context' tab to the 'Capacitor Plugins' tab. 

Look at the list of plugins. Each Portal registers a few Capacitor plugins by default, such as `Console` and `Portals` (which provides web access to pub/sub). You'll also see that the analytics plugin has been added as `Analytics`, after the value provided in the `CapacitorPlugin` decorator.

Expand `Analytics` tap and tap `logAction`. You'll be taken to a detail view for the method where you can provide input as a JSON string in the 'Argument' field and a button allowing you to execute the method. Click 'Execute logAction' and the method will run, logging to Android Studio's logcat. 

In the next section, you'll learn how to access input provided to a method in a Capacitor plugin.

## Validating plugin calls

Take a look at the signature of the `logAction` plugin method:

```kotlin
@PluginMethod() fun logAction(call: PluginCall)
```

`PluginCall` is the call sent to the plugin method from the Capacitor bridge (which Portals uses under the hood). With it, you can access input data and either successfully resolve the call or reject the call and return an error.

Resolving or rejecting the call completes the asynchronous process initiated by the web code.

Since input data is available as part of the call, you can guard against bad input. Update `logAction` to reject any calls made to the plugin method that do not contain the `action` parameter:

```kotlin portals/AnalyticsPlugin.kt
@PluginMethod()
fun logAction(call: PluginCall) {
    val action = call.getString("action");
    if(action == null) {
        call.reject("Input option 'action' must be provided.")
        return
    }
    println("AnalyticsPlugin: logAction")
    call.resolve()
}
```

Build, run, and navigate to the 'Capacitor Plugins' tab. Click `logAction` to get to the detail view, and then press 'Execute logAction' without providing any input. The detail view will print out the message supplied to `call.reject()`: "Input option 'action' must be provided.".

Using `logAction` as a guide, guard `logScreen` such that it rejects any calls made that do not supply `screen` as input.

Test `logScreen` and once complete, head to the next section to complete the implementation of the analytics plugin.

## Completing the implementation

For the purpose of this training, logging analytic events consists of POSTing data to an HTTP endpoint.

Modify `portals/AnalyticsPlugin.kt` and use the `NetworkManager` to complete the implementation:

<CH.Scrollycoding>

<CH.Code>

```kotlin portals/AnalyticsPlugin.kt focus=7,9:17
package io.ionic.cs.portals.jobsync.portals

import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import androidx.annotation.Keep

@Keep
data class AnalyticsBody(
  val action: String?,
  val screen: String?,
  val params: String?,
  val platform: String
)
@Keep
data class AnalyticsResult(val success: Boolean)

@CapacitorPlugin(name = "Analytics")
class AnalyticsPlugin: Plugin() {
  @PluginMethod()
  fun logAction(call: PluginCall) {
    val action = call.getString("action");
    if(action == null) {
      call.reject("Input option 'action' must be provided.")
      return
    }
    println("AnalyticsPlugin: logAction")
    call.resolve()
  }

  @PluginMethod()
  fun logScreen(call: PluginCall) {
    val screen = call.getString("screen");
    if(screen == null) {
      call.reject("Input option 'screen' must be provided.")
      return
    }
    println("AnalyticsPlugin: logEvent")
    call.resolve()
  }
}
```

</CH.Code>

Start by adding the request and response data types for calls made to the analytics endpoint.

---

<CH.Code>

```kotlin portals/AnalyticsPlugin.kt focus=8:10,22:25,29:31
package io.ionic.cs.portals.jobsync.portals

import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import androidx.annotation.Keep
import io.ionic.cs.portals.jobsync.util.NetworkManager
import retrofit2.http.Body
import retrofit2.http.POST

@Keep
data class AnalyticsBody(
  val action: String?,
  val screen: String?,
  val params: String?,
  val platform: String
)
@Keep
data class AnalyticsResult(val success: Boolean)

interface AnalyticsAPIService {
  @POST("analytics")
  suspend fun analytics(@Body body: AnalyticsBody): AnalyticsResult
}

@CapacitorPlugin(name = "Analytics")
class AnalyticsPlugin: Plugin() {
  private val http: AnalyticsAPIService by lazy {
    NetworkManager.instance.create(AnalyticsAPIService::class.java)
  }

  @PluginMethod()
  fun logAction(call: PluginCall) {
    val action = call.getString("action");
    if(action == null) {
      call.reject("Input option 'action' must be provided.")
      return
    }
    println("AnalyticsPlugin: logAction")
    call.resolve()
  }

  @PluginMethod()
  fun logScreen(call: PluginCall) {
    val screen = call.getString("screen");
    if(screen == null) {
      call.reject("Input option 'screen' must be provided.")
      return
    }
    println("AnalyticsPlugin: logEvent")
    call.resolve()
  }
}
```

</CH.Code>

Add a private instance of `NetworkManager` to the plugin class.

---

<CH.Code>

```kotlin portals/AnalyticsPlugin.kt focus=40
package io.ionic.cs.portals.jobsync.portals

import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import androidx.annotation.Keep
import io.ionic.cs.portals.jobsync.util.NetworkManager
import retrofit2.http.Body
import retrofit2.http.POST

@Keep
data class AnalyticsBody(
  val action: String?,
  val screen: String?,
  val params: String?,
  val platform: String
)
@Keep
data class AnalyticsResult(val success: Boolean)

interface AnalyticsAPIService {
  @POST("analytics")
  suspend fun analytics(@Body body: AnalyticsBody): AnalyticsResult
}

@CapacitorPlugin(name = "Analytics")
class AnalyticsPlugin: Plugin() {
  private val http: AnalyticsAPIService by lazy {
    NetworkManager.instance.create(AnalyticsAPIService::class.java)
  }

  @PluginMethod()
  fun logAction(call: PluginCall) {
    val action = call.getString("action");
    if(action == null) {
      call.reject("Input option 'action' must be provided.")
      return
    }
    val params = call.getObject("params")?.toString() ?: ""
    call.resolve()
  }

  @PluginMethod()
  fun logScreen(call: PluginCall) {
    val screen = call.getString("screen");
    if(screen == null) {
      call.reject("Input option 'screen' must be provided.")
      return
    }
    println("AnalyticsPlugin: logEvent")
    call.resolve()
  }
}
```
</CH.Code>

Additional parameters are optional and untyped. They can be stringified and added to the request should they exist.

---

<CH.Code>

```kotlin portals/AnalyticsPlugin.kt focus=45:57
package io.ionic.cs.portals.jobsync.portals

import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import androidx.annotation.Keep
import io.ionic.cs.portals.jobsync.util.NetworkManager
import retrofit2.http.Body
import retrofit2.http.POST
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

@Keep
data class AnalyticsBody(
  val action: String?,
  val screen: String?,
  val params: String?,
  val platform: String
)
@Keep
data class AnalyticsResult(val success: Boolean)

interface AnalyticsAPIService {
  @POST("analytics")
  suspend fun analytics(@Body body: AnalyticsBody): AnalyticsResult
}

@CapacitorPlugin(name = "Analytics")
class AnalyticsPlugin: Plugin() {
  private val http: AnalyticsAPIService by lazy {
    NetworkManager.instance.create(AnalyticsAPIService::class.java)
  }

  @PluginMethod()
  fun logAction(call: PluginCall) {
    val action = call.getString("action");
    if(action == null) {
      call.reject("Input option 'action' must be provided.")
      return
    }
    val params = call.getObject("params")?.toString() ?: ""
    val body = AnalyticsBody(action, null, params, "android")
    CoroutineScope(Dispatchers.IO).launch {
      val result = runCatching { http.analytics(body) }
      withContext(Dispatchers.Main) {
        result.onSuccess {
          if(it.success) {
            call.resolve()
          } else {
          call.reject("Logging the analytic event failed.")
          }}
          .onFailure { call.reject("Failed to connect to the analytics endpoint.") }
      }
    }
  }

  @PluginMethod()
  fun logScreen(call: PluginCall) {
    val screen = call.getString("screen");
    if(screen == null) {
      call.reject("Input option 'screen' must be provided.")
      return
    }
    println("AnalyticsPlugin: logEvent")
    call.resolve()
  }
}
```
</CH.Code>

Make the network request. If it succeeds, `call.resolve()` will resolve the call made from the web code, otherwise `call.reject()` will thrown an error to be handled by the web code.

---

<CH.Code>

```kotlin portals/AnalyticsPlugin.kt focus=46:48,62:70
package io.ionic.cs.portals.jobsync.portals

import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import androidx.annotation.Keep
import io.ionic.cs.portals.jobsync.util.NetworkManager
import retrofit2.http.Body
import retrofit2.http.POST
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

@Keep
data class AnalyticsBody(
  val action: String?,
  val screen: String?,
  val params: String?,
  val platform: String
)
@Keep
data class AnalyticsResult(val success: Boolean)

interface AnalyticsAPIService {
  @POST("analytics")
  suspend fun analytics(@Body body: AnalyticsBody): AnalyticsResult
}

@CapacitorPlugin(name = "Analytics")
class AnalyticsPlugin: Plugin() {
  private val http: AnalyticsAPIService by lazy {
    NetworkManager.instance.create(AnalyticsAPIService::class.java)
  }

  @PluginMethod()
  fun logAction(call: PluginCall) {
    val action = call.getString("action");
    if(action == null) {
      call.reject("Input option 'action' must be provided.")
      return
    }
    val params = call.getObject("params")?.toString() ?: ""
    val body = AnalyticsBody(action, null, params, "android")
    logEvent(body) { success ->
      if(success) { call.resolve() } else { call.reject("Something went wrong.") }
    }
  }

  @PluginMethod()
  fun logScreen(call: PluginCall) {
    val screen = call.getString("screen");
    if(screen == null) {
      call.reject("Input option 'screen' must be provided.")
      return
    }
    println("AnalyticsPlugin: logEvent")
    call.resolve()
  }

  private fun logEvent(body: AnalyticsBody, completion: (Boolean) -> Unit) {
    CoroutineScope(Dispatchers.IO).launch {
      withContext(Dispatchers.Main) {
        val result = runCatching { http.analytics(body) }
        result.onSuccess { completion(it.success) }
          .onFailure { completion(false) }
      }
    }
  }
}
```
</CH.Code>

`logScreen` needs to make the same network request. Refactor the code to add a utility method.

---

<CH.Code>

```kotlin portals/AnalyticsPlugin.kt focus=51:63
package io.ionic.cs.portals.jobsync.portals

import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import androidx.annotation.Keep
import io.ionic.cs.portals.jobsync.util.NetworkManager
import retrofit2.http.Body
import retrofit2.http.POST
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

@Keep
data class AnalyticsBody(
  val action: String?,
  val screen: String?,
  val params: String?,
  val platform: String
)
@Keep
data class AnalyticsResult(val success: Boolean)

interface AnalyticsAPIService {
  @POST("analytics")
  suspend fun analytics(@Body body: AnalyticsBody): AnalyticsResult
}

@CapacitorPlugin(name = "Analytics")
class AnalyticsPlugin: Plugin() {
  private val http: AnalyticsAPIService by lazy {
    NetworkManager.instance.create(AnalyticsAPIService::class.java)
  }

  @PluginMethod()
  fun logAction(call: PluginCall) {
    val action = call.getString("action");
    if(action == null) {
      call.reject("Input option 'action' must be provided.")
      return
    }
    val params = call.getObject("params")?.toString() ?: ""
    val body = AnalyticsBody(action, null, params, "android")
    logEvent(body) { success ->
      if(success) { call.resolve() } else { call.reject("Something went wrong.") }
    }
  }

  @PluginMethod()
  fun logScreen(call: PluginCall) {
    val screen = call.getString("screen");
    if(screen == null) {
      call.reject("Input option 'screen' must be provided.")
      return
    }
    val params = call.getObject("params")?.toString() ?: ""
    val body = AnalyticsBody(null, screen, params, "android")
    logEvent(body) { success ->
      if(success) { call.resolve() } else { call.reject("Something went wrong.") }
    }
  }

  private fun logEvent(body: AnalyticsBody, completion: (Boolean) -> Unit) {
    CoroutineScope(Dispatchers.IO).launch {
      withContext(Dispatchers.Main) {
        val result = runCatching { http.analytics(body) }
        result.onSuccess { completion(it.success) }
          .onFailure { completion(false) }
      }
    }
  }
}
```
</CH.Code>

Finally, implement the `logScreen` plugin method.

</CH.Scrollycoding>

Build, run, and navigate to the 'Capacitor Plugins' tab. Test out the method calls by providing the following input arguments:

- `logAction`: `{ "action": "Submit time", "params": { "time": "600" } }`
- `logScreen`: `{ "screen": "Edit Expense View", "params": {"expenseId": "123" } }`

If you inspect network traffic (optional), you will see network requests made to an analytics endpoint with a data payload containing `platform: 'android'`, confirming all requirements have been met.

## What's next

Authoring Capacitor plugins, like the analytics plugins, creates structured, contract-bound communication between native mobile and web code. So far, you have been testing Portals using the sample web app downloaded from the Portals CLI. In the final step of this module, you will sync the finished web apps to complete the Jobsync superapp.