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

After the current user signs in, the `accessToken` and `refreshToken` are stored within the `ApiClient.credentials` property. The network request returns the property names using snake case, and they need to be converted to camel case for the web application.   

Map the credential values to set the correct key-value-pairs using the code below: 

<CH.Code rows={15}>

```kotlin portals/WebAppView.kt focus=16:20
package io.ionic.cs.portals.Jobsync.portals

import androidx.compose.runtime.Composable
import androidx.compose.ui.viewinterop.AndroidView
import androidx.navigation.NavHostController
import io.ionic.cs.portals.Jobsync.network.ApiClient
import io.ionic.portals.PortalBuilder
import io.ionic.portals.PortalView

@Composable
fun WebAppView(
    navHostController: NavHostController,
    metadata: WebAppMetadata
) {
    val credentials = ApiClient.credentials
    val initialContext = mapOf(
        "accessToken" to credentials?.access_token, 
        "refreshToken" to credentials?.refresh_token
    )

    val portal = PortalBuilder("debug")
        .setStartDir("portals/debug")
        .create();

    AndroidView(factory = { PortalView(it, portal) })
}
```
</CH.Code>

## Configuring initial context

Once the mapping has been performed, update the Portal configuration in `portals/WebAppView.kt` to include the current user's credentials as initial context:

```kotlin portals/WebAppView.kt focus=21:24
package io.ionic.cs.portals.Jobsync.portals

import androidx.compose.runtime.Composable
import androidx.compose.ui.viewinterop.AndroidView
import androidx.navigation.NavHostController
import io.ionic.cs.portals.Jobsync.network.ApiClient
import io.ionic.portals.PortalBuilder
import io.ionic.portals.PortalView

@Composable
fun WebAppView(
    navHostController: NavHostController,
    metadata: WebAppMetadata
) {
    val credentials = ApiClient.credentials
    val initialContext = mapOf(
        "accessToken" to credentials?.access_token,
        "refreshToken" to credentials?.refresh_token
    )

    val portal = PortalBuilder("debug")
        .setStartDir("portals/debug")
        .setInitialContext(initialContext)
        .create()

    AndroidView(factory = { PortalView(it, portal) })
}
```

Build and run the Jobsync app and navigate to one of the features in the dashboard view. The sample web app loads the 'Initial Context' tab, but now in addition to the `name` of the Portal configured, you will now see a `value` property printed out, containing the `accessToken` and `refreshToken` web apps need to authenticate requests. 

## What's next

You established communication through a Portal using initial context to share session information to web apps being presented through a Portal. Initial context is uni-directional communication, from native code to web code. In the next step in this module, you will learn about Portals *pub/sub* mechanism to subscribe to messages sent from web code to native code.
