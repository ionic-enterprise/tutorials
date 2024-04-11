---
title: Subscribing to web messages
sidebar_label: Handling Messages
sidebar_position: 4
---

import Admonition from '@theme/Admonition';

Web apps presented through a Portal can publish messages to native mobile code using the <a href="https://ionic.io/docs/portals/for-web/portals-plugin" target="_blank">publish/subscribe interface</a> (pub/sub) available with Portals.

In this step, you will subscribe to messages sent from the web to dismiss the current view.

## Exploring the problem

Web apps consolidated into the Jobsync superapp may consist of multiple views, and therefore need to manage navigation within their scope. Each web app designed for this training contains a header with a back button and when the web app has exhausted its navigation stack, it uses the Portals web library to communicate with Android code by sending a message to the `navigate:back` topic. 

In the section below, you will use the Portals Android library to subscribe to the `navigate:back` topic and dismiss the view when a message is received.

## Creating a subscriber

The pub/sub mechanism included in the Portals Android library relies on two parts that work together: `PortalsPubSub` and `PortalsPlugin`. `PortalsPlugin` is a Capacitor plugin (you will learn about those in the next step) added to a Portal by default that allows web apps to communicate with the native layer and vice-versa. `PortalsPubSub` is the class that manages an internal message bus.

<Admonition type="info">
Pub/sub is bi-directional; messages can be sent from native mobile code to web code as well.
</Admonition>

Modify `portals/WebAppView.kt` to a subscribe for the `navigate:back` topic:

<CH.Scrollycoding>

<CH.Code>

```kotlin portals/WebAppView.kt focus=9,25
package io.ionic.cs.portals.Jobsync.portals

import androidx.compose.runtime.Composable
import androidx.compose.ui.viewinterop.AndroidView
import androidx.navigation.NavHostController
import io.ionic.cs.portals.Jobsync.network.ApiClient
import io.ionic.portals.PortalBuilder
import io.ionic.portals.PortalView
import io.ionic.portals.PortalsPlugin

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
        .addPluginInstance(PortalsPlugin())
        .create()

    AndroidView(factory = { PortalView(it, portal) })
}
```

</CH.Code>

Add an instance of `PortalsPlugin` to the Portal.

---

<CH.Code>

```kotlin portals/WebAppView.kt focus=10,22,27[42:54]
package io.ionic.cs.portals.Jobsync.portals

import androidx.compose.runtime.Composable
import androidx.compose.ui.viewinterop.AndroidView
import androidx.navigation.NavHostController
import io.ionic.cs.portals.Jobsync.network.ApiClient
import io.ionic.portals.PortalBuilder
import io.ionic.portals.PortalView
import io.ionic.portals.PortalsPlugin
import io.ionic.portals.PortalsPubSub

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
    val portalsPubSub = PortalsPubSub()

    val portal = PortalBuilder("debug")
        .setStartDir("portals/debug")
        .setInitialContext(initialContext)
        .addPluginInstance(PortalsPlugin(portalsPubSub))
        .create()

    AndroidView(factory = { PortalView(it, portal) })
}
```

</CH.Code>

Create an instance of the `PortalsPubSub` class and pass it into the `PortalsPlugin` constructor. 

---

<CH.Code>

```kotlin portals/WebAppView.kt focus=11:13,26:30
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
    val initialContext = mapOf(
        "accessToken" to credentials?.access_token,
        "refreshToken" to credentials?.refresh_token
    )
    val portalsPubSub = PortalsPubSub()
    portalsPubSub.subscribe("navigate:back") {
        CoroutineScope(Dispatchers.Main).launch {
            navHostController.popBackStack()
        }
    }

    val portal = PortalBuilder("debug")
        .setStartDir("portals/debug")
        .setInitialContext(initialContext)
        .addPluginInstance(PortalsPlugin(portalsPubSub))
        .create()

    AndroidView(factory = { PortalView(it, portal) })
}
```

</CH.Code>

Subscribe to the `navigate:back` topic, and pop the nav stack when the topic receives a message. 

---

<CH.Code>

```kotlin portals/WebAppView.kt focus=30:33
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
    val initialContext = mapOf(
        "accessToken" to credentials?.access_token,
        "refreshToken" to credentials?.refresh_token
    )
    val portalsPubSub = PortalsPubSub()
    portalsPubSub.subscribe("navigate:back") {
        CoroutineScope(Dispatchers.Main).launch {
            navHostController.popBackStack()
        }
        portalsPubSub.unsubscribe(
            "navigate:back", 
            it.subscriptionRef
        )
    }

    val portal = PortalBuilder("debug")
        .setStartDir("portals/debug")
        .setInitialContext(initialContext)
        .addPluginInstance(PortalsPlugin(portalsPubSub))
        .create()

    AndroidView(factory = { PortalView(it, portal) })
}
```

</CH.Code>

Clean up the subscription once it's no longer needed by unsubscribing to the `navigate:back` topic.

</CH.Scrollycoding>

<Admonition type="info">
Additional ways to create subscribers can be found <a href="https://ionic.io/docs/portals/for-android/how-to/using-the-portals-plugin#communicating-via-pubsub" target="_blank"> at this link</a>.
</Admonition>

## Testing the subscription

Build and run the Jobsync app and navigate to one of the features in the dashboard view. Switch from the 'Initial Context' tab to the 'Publish/Subscribe' tab. 

Here, you can test Portal's pub/sub mechanism by entering `navigate:back` into the 'Topic:' input field under the 'Publish' heading. Press the 'Publish' button, and the view should dismiss, navigating back to the dashboard view.

## What's next

The pub/sub mechanism available within the Portals library is ideal for simple use cases, such as allowing a web app presented through a Portal to request native navigation. However, it is not suitable for more complex use cases. In the next step of this module, you will learn about Capacitor plugins, which also communicate bi-directionally, but in a more structured manner suitable for complex use cases.