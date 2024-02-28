---
title: Subscribing to web messages
sidebar_label: Handling Messages
sidebar_position: 4
---

import Admonition from '@theme/Admonition';

Web apps presented through a Portal can publish messages to native mobile code using the <a href="https://ionic.io/docs/portals/for-web/portals-plugin" target="_blank">publish/subscribe interface</a> (pub/sub) available with Portals.

In this step, you will subscribe to messages sent from the web to dismiss the current view.

## Exploring the problem

After you navigate to one of of the features in the Jobsync app, you'll notice a peculiar problem: there is no backwards navigation. In fact, this is by design as indicated by `Portals/WebAppView.swift`:

<CH.Code rows={3}>

```swift Portals/WebAppView.swift focus=16
import SwiftUI
import IonicPortals

struct WebAppView: View {
    @EnvironmentObject var credentialsManager: CredentialsManager
    @Environment(\.dismiss) var dismiss
    let metadata: WebAppMetadata
    
    var body: some View {
        PortalView(portal: .init(
            name: "debug",
            startDir: "portals/debug",
            initialContext: credentialsManager.credentials!.toJSObject()
        ))
        .ignoresSafeArea()
        .navigationBarBackButtonHidden()
    }
}

#Preview {
    WebAppView(metadata: WebApps.metadata[0])
        .environmentObject(CredentialsManager.preview)
}
```

</CH.Code>

Web apps consolidated into the Jobsync superapp may consist of multiple views, and therefore need to manage navigation within their scope. Each web app designed for this training contain a header with a back button and when the web app has exhausted its navigation stack, it uses the Portals web library to communicate with iOS code by sending a message to the `navigate:back` topic. 

In the section below, you will use the Portals iOS library to subscribe to the `navigate:back` topic and dismiss the view when a message is received.

## Creating a subscriber

The pub/sub mechanism included in the Portals iOS library relies on two parts that work together: `PortalsPubSub` and `PortalsPlugin`. `PortalsPlugin` is a Capacitor plugin (you will learn about those in the next step) added to a Portal by default that allows web apps to send messages. `PortalsPubSub` is the class that manages an internal message bus to subscribe to.

<Admonition type="info">
Pub/sub is bi-directional; messages can be sent from native mobile code to web code as well.
</Admonition>

Modify `Portals/WebAppView.swift` to create a subscriber for the `navigate:back` topic:

<CH.Scrollycoding>
<CH.Code>

```swift Portals/WebAppView.swift focus=17:19
import SwiftUI
import IonicPortals

struct WebAppView: View {
    @EnvironmentObject var credentialsManager: CredentialsManager
    @Environment(\.dismiss) var dismiss
    let metadata: WebAppMetadata
    
    var body: some View {
        PortalView(portal: .init(
            name: "debug",
            startDir: "portals/debug",
            initialContext: credentialsManager.credentials!.toJSObject()
        ))
        .ignoresSafeArea()
        .navigationBarBackButtonHidden()
        .task {

        }
    }
}

#Preview {
    WebAppView(metadata: WebApps.metadata[0])
        .environmentObject(CredentialsManager.preview)
}
```

</CH.Code>

Apply the `.task` modifier to `PortalView` to execute code when the view becomes active.

---

<CH.Code>

```swift Portals/WebAppView.swift focus=18:21
import SwiftUI
import IonicPortals

struct WebAppView: View {
    @EnvironmentObject var credentialsManager: CredentialsManager
    @Environment(\.dismiss) var dismiss
    let metadata: WebAppMetadata
    
    var body: some View {
        PortalView(portal: .init(
            name: "debug",
            startDir: "portals/debug",
            initialContext: credentialsManager.credentials!.toJSObject()
        ))
        .ignoresSafeArea()
        .navigationBarBackButtonHidden()
        .task {
            let stream = PortalsPubSub.subscribe(to: "navigate:back")
            for await _ in stream {

            }
        }
    }
}

#Preview {
    WebAppView(metadata: WebApps.metadata[0])
        .environmentObject(CredentialsManager.preview)
}
```

</CH.Code>

Within the `.task` closure, subscribe to the `navigate:back` topic. 

Each entry in the `stream` is a message sent to the topic.

---

<CH.Code>

```swift Portals/WebAppView.swift focus=6,20
import SwiftUI
import IonicPortals

struct WebAppView: View {
    @EnvironmentObject var credentialsManager: CredentialsManager
    @Environment(\.dismiss) var dismiss
    let metadata: WebAppMetadata
    
    var body: some View {
        PortalView(portal: .init(
            name: "debug",
            startDir: "portals/debug",
            initialContext: credentialsManager.credentials!.toJSObject()
        ))
        .ignoresSafeArea()
        .navigationBarBackButtonHidden()
        .task {
            let stream = PortalsPubSub.subscribe(to: "navigate:back")
            for await _ in stream {
                self.dismiss()
            }
        }
    }
}

#Preview {
    WebAppView(metadata: WebApps.metadata[0])
        .environmentObject(CredentialsManager.preview)
}
```

</CH.Code>

Handle the message by calling `dismiss()`, the `@Environment` method that will pop the current view from navigation.

</CH.Scrollycoding>

Once the view has navigated away, the subscriber is terminated along with `PortalView`. 

<Admonition type="info">
Additional ways to create subscribers, including UIKit examples, can be found <a href="https://ionic.io/docs/portals/for-ios/how-to/using-the-portals-plugin#communicating-via-pubsub" target="_blank">at this link</a>.
</Admonition>

## Testing the subscription

Build and run the Jobsync app and navigate to one of the features in the dashboard view. Switch from the 'Initial Context' tab to the 'Publish/Subscribe' tab. 

Here, you can test Portal's pub/sub mechanism by entering `navigate:back` into the 'Topic:' input field under the 'Publish' heading. Press the 'Publish' button, and the view should dismiss, navigating back to the dashboard view.

## What's next

The pub/sub mechanism available within the Portals library is ideal for simple use cases, such as allowing a web app presented through a Portal to request native navigation. However, it is not suitable for more complex use cases. In the next step of this module, you will learn about Capacitor plugins, which also communicate bi-directionally, but in a more structured manner suitable for complex use cases.