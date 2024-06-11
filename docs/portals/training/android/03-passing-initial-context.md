---
title: Passing data through a Portal
sidebar_label: Passing Initial Context
sidebar_position: 3
---

import Admonition from '@theme/Admonition';

Data can be passed through a Portal and made available before a web app renders using <a href="https://ionic.io/docs/portals/choosing-a-communication#initial-context" target="_blank">initial context</a>. 

In this step, you will set initial context to pass session information to the sample web app.

## Exploring the problem

When the Jobsync superapp is first opened, the current user is requested to sign in. From there, they are sent to a dashboard view containing functions that should be scoped to the current user, such as submitting expenses or tracking time. 

Web apps being presented through a Portal are unaware of the fact that the current user has signed in from the native app. You could ask the user to sign in a second time, but that isn't an ideal user experience.

The Portals library allows you to pass data that is immediately available to the presenting web app as part of Portals configuration. In the case of the Jobsync app, the `accessToken` and `refreshToken` returned after a user signs in can be passed to web apps and used to authenticate requests. 

## Formatting for initial context

After the current user signs in, the `accessToken` and `refreshToken` are stored within the `CredentialsManager.credentials` property. The network request returns the property names using snake case, and they need to be converted to camel case for the web application.   

Map the credential values to set the correct key-value-pairs using the code below: 

<CH.Code rows={18}>

```kotlin util/CredentialsManager.kt focus=10,14:26
package io.ionic.cs.portals.jobsync.util

import androidx.annotation.Keep
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import retrofit2.http.Body
import retrofit2.http.POST
import com.google.gson.annotations.SerializedName

@Keep
data class LoginBody(val username: String, val password: String)
@Keep
data class Credentials(
  @SerializedName("access_token") val accessToken: String,
  @SerializedName("refresh_token") val refreshToken: String
) {
  fun toMap(): Map<String, String> {
    return mapOf(
      "accessToken" to accessToken,
      "refreshToken" to refreshToken
    )
  }
}

interface CredentialsAPIService {
  @POST("auth")
  suspend fun login(@Body loginBody: LoginBody): Credentials
}

object CredentialsManager {
  private val http: CredentialsAPIService by lazy {
    NetworkManager.instance.create(CredentialsAPIService::class.java)
  }
  private var _credentials: Credentials? = null

  val credentials: Credentials?
    get() = _credentials

  fun login(username: String, password: String, callback: () -> Unit) {
    CoroutineScope(Dispatchers.IO).launch {
      val result = runCatching { http.login(LoginBody(username, password)) }
      result.onSuccess { _credentials = it }
        .onFailure { _credentials = getDefaultCredentials() }
      withContext(Dispatchers.Main) { callback() }
    }
  }

  private fun getDefaultCredentials(): Credentials {
    return Credentials("8f633ea6-de27-4110-96cf-bc10fa3a0b86", "da5ca0ea-5831-4373-a298-879dfa5a6fcb")
  }
}
```
</CH.Code>

## Configuring initial context

Once the mapping has been performed, update the Portal configuration in `portals/WebAppScreen.kt` to include the current user's credentials as initial context:

<CH.Code rows={5}>

```kotlin portals/WebAppScreen.kt focus=30
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

@Composable
fun WebAppScreen(navController: NavHostController, metadata: WebAppMetadata) {
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
            .create()
          PortalView(context, portal)
        }
      )
    }
  }
}
```

</CH.Code>

Build and run the Jobsync app and navigate to one of the features in the dashboard view. The sample web app loads the 'Initial Context' tab, but now in addition to the `name` of the Portal configured, you will now see a `value` property printed out, containing the `accessToken` and `refreshToken` web apps need to authenticate requests. 

## What's next

You established communication through a Portal using initial context to share session information to web apps being presented through a Portal. Initial context is uni-directional communication, from native code to web code. In the next step in this module, you will learn about Portals *pub/sub* mechanism to subscribe to messages sent from web code to native code.
