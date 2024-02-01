---
title: Subscribing to web messages
sidebar_label: Handling Messages
sidebar_position: 4
---

import Admonition from '@theme/Admonition';

Web apps presented through a Portal can publish messages to native mobile code using the <a href="https://ionic.io/docs/portals/for-web/portals-plugin" target="_blank">publish/subscribe interface</a> (pub/sub) available with Portals.

In this step, you will subscribe to messages sent from the web to dismiss the current view.

## Exploring the problem

Look at the view code in `Portals/WebAppView.swift`, and observe that the `PortalView` occupies the entire viewport. While the method to dismiss the view is defined, there is no place to call it.

This is intentional; all web apps consolidated into the Jobsync superapp are designed with a back button in their header that should dismiss `WebAppView` (you'll see the actual web apps in a later step). When the back button is pressed, web apps use the Portals web library to send a message to the `navigate:back` topic. 

In the section below, you will use the Portals iOS library to subscribe to the topic and dismiss the view.

## Creating a subscriber

The pub/sub mechanism included in the Portals iOS library relies on two parts that work together: `PortalsPubSub` and `PortalsPlugin`. `PortalsPlugin` is a Capacitor plugin (you will learn about those in the next step) added to a Portal by default that allows web apps to send messages. `PortalsPubSub` is the class that manages the message bus to subscribe to.

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

The pub/sub mechanism available within the Portals library is ideal for simple use cases, such as allowing a web app presented through a Portal to request native navigation. In the next step of this module, you will learn about Capacitor plugins, which also communicate bi-directionally, but in a more structured manner suitable for complex use cases.