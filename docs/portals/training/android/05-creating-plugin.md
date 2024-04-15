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

Capacitor plugins can be added to a Portal that has been initialized. Update the Portal defined in `WebAppView`, adding the `AnalyticsPlugin` to the Portal:

<CH.Code rows={10}>

```kotlin portals/WebAppView.kt focus=33
package io.ionic.cs.portals.Jobsync.portals

import androidx.compose.runtime.Composable
import androidx.compose.ui.viewinterop.AndroidView
import androidx.navigation.NavHostController
import io.ionic.cs.portals.Jobsync.network.ApiClient
import io.ionic.portals.PortalBuilder
import io.ionic.portals.PortalView
import io.ionic.portals.PortalsPlugin
import io.ionic.portals.PortalsPubSub
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

@Composable
fun WebAppView(
    navHostController: NavHostController,
    metadata: WebAppMetadata
) {
    val credentials = ApiClient.credentials
    val credentialsMap = mapOf("accessToken" to credentials?.access_token, "refreshToken" to credentials?.refresh_token)
    val pubsub = PortalsPubSub()
    pubsub.subscribe("navigate:back") {
        CoroutineScope(Dispatchers.Main).launch {
            navHostController.popBackStack()
        }
        pubsub.unsubscribe("navigate:back", it.subscriptionRef)
    }

    val portal = PortalBuilder("debug")
        .setStartDir("portals/debug")
        .setInitialContext(credentialsMap)
        .addPlugin(AnalyticsPlugin::class.java)
        .addPluginInstance(PortalsPlugin(pubsub))
        .create()

    AndroidView(factory = { PortalView(it, portal) })
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
    val action = call.getString("action")
    if (action != null) {
        println("AnalyticsPlugin: logAction")
        call.resolve()
    } else {
        call.reject("Input option 'action' must be provided.")
    }
}
```

Build, run, and navigate to the 'Capacitor Plugins' tab. Click `logAction` to get to the detail view, and then press 'Execute logAction' without providing any input. The detail view will print out the message supplied to `call.reject()`: "Input option 'action' must be provided.".

Using `logAction` as a guide, guard `logScreen` such that it rejects any calls made that do not supply `screen` as input.

Test `logScreen` and once complete, head to the next section to complete the implementation of the analytics plugin.

## Completing the implementation

For the purpose of this training, logging analytic events consists of POSTing data to an HTTP endpoint.

Modify `portals/AnalyticsPlugin.kt` and use `NetworkManager` to complete the implementation:

<CH.Scrollycoding>

<CH.Code>

```kotlin portals/AnalyticsPlugin.kt focus=17:34
package io.ionic.cs.portals.Jobsync.portals

import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import io.ionic.cs.portals.Jobsync.network.AnalyticsBody
import io.ionic.cs.portals.Jobsync.network.AnalyticsResult
import io.ionic.cs.portals.Jobsync.network.ApiClient
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

@CapacitorPlugin(name="Analytics")
class AnalyticsPlugin: Plugin() {
    @PluginMethod()
    fun logAction(call: PluginCall) {
        val action = call.getString("action")
        if (action != null) {
            val params = call.getObject("params")?.toString() ?: ""

            val input = AnalyticsBody(action = action, screen = null, params = params, platform = "android")
            ApiClient.apiService.analytics(input).enqueue(object: Callback<AnalyticsResult> {
                override fun onResponse(apiCall: Call<AnalyticsResult>, response: Response<AnalyticsResult>) {
                    val body = response.body()
                    body?.success?.let {
                        if(it) {
                            call.resolve()
                            return
                        }
                    }
                    call.reject("Logging the analytic event failed.")
                }

                override fun onFailure(apiCall: Call<AnalyticsResult>, t: Throwable) {
                    call.reject("Failed to connect to the analytics endpoint.")
                }
            })
        } else call.reject("Input option 'action' must be provided.")
    }

    @PluginMethod()
    fun logScreen(call: PluginCall) {
        println("AnalyticsPlugin: logScreen")
    }
}
```

</CH.Code>

Make the network request. If it succeeds, `call.resolve()` will resolve the call made from the web code, otherwise `call.reject()` will throw an error to be handled by the web code. 

---

<CH.Code>

```kotlin portals/AnalyticsPlugin.kt focus=32:61
package io.ionic.cs.portals.Jobsync.portals

import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import io.ionic.cs.portals.Jobsync.network.AnalyticsBody
import io.ionic.cs.portals.Jobsync.network.AnalyticsResult
import io.ionic.cs.portals.Jobsync.network.ApiClient
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

@CapacitorPlugin(name="Analytics")
class AnalyticsPlugin: Plugin() {
    @PluginMethod()
    fun logAction(call: PluginCall) {
        val action = call.getString("action")
        if (action != null) {
            val params = call.getObject("params")?.toString() ?: ""

            val input = AnalyticsBody(action = action, screen = null, params = params, platform = "android")
            logEvent(input) {
                if (it) call.resolve()
                else call.reject("Something went wrong")
            }

        } else call.reject("Input option 'action' must be provided.")

    }

    @PluginMethod()
    fun logScreen(call: PluginCall) {
        val screen = call.getString("screen")
        if (screen != null) {
            val params = call.getObject("params")?.toString() ?: ""

            val input = AnalyticsBody(action = null, screen = screen, params = params, platform = "android")
            logEvent(input) {
                if (it) call.resolve()
                else call.reject("Something went wrong")
            }

        } else call.reject("Input option 'action' must be provided.")
    }

    private fun logEvent(input: AnalyticsBody, completion: (Boolean) -> Unit) {
        ApiClient.apiService.analytics(input).enqueue(object: Callback<AnalyticsResult> {
            override fun onResponse(apiCall: Call<AnalyticsResult>, response: Response<AnalyticsResult>) {
                val body = response.body()
                body?.success?.let {
                    completion(it)
                } ?: completion(false)
            }

            override fun onFailure(apiCall: Call<AnalyticsResult>, t: Throwable) {
                completion(false)
            }
        })
    }
}
```

</CH.Code>

`logScreen` also needs to stringify `params` and make the same network request. Refactor the code to add utility methods and update `logAction` to use the new utility methods.

---

</CH.Scrollycoding>

Build, run, and navigate to the 'Capacitor Plugins' tab. Test out the method calls by providing the following input arguments:

- `logAction`: `{ "action": "Submit time", "params": { "time": "600" } }`
- `logScreen`: `{ "screen": "Edit Expense View", "params": {"expenseId": "123" } }`

If you inspect network traffic (optional), you will see network requests made to an analytics endpoint with a data payload containing `platform: 'android'`, confirming all requirements have been met.

## What's next

Authoring Capacitor plugins, like the analytics plugins, creates structured, contract-bound communication between native mobile and web code. So far, you have been testing Portals using the sample web app downloaded from the Portals CLI. In the final step of this module, you will sync the finished web apps to complete the Jobsync superapp.