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

In Xcode, create a new Swift file in the `Portals` folder named `AnalyticsPlugin.swift` and populate the file with the following code:

```swift Portals/AnalyticsPlugin.swift
import Foundation
import Capacitor

class AnalyticsPlugin: CAPInstancePlugin, CAPBridgedPlugin {
    let jsName = "Analytics"
    let identifier = "Analytics"
    let pluginMethods: [CAPPluginMethod] = [
        .init(name: "logAction", returnType: CAPPluginReturnPromise),
        .init(name: "logScreen", returnType: CAPPluginReturnPromise)
    ]
    
    @objc func logAction(_ call: CAPPluginCall) {
        print("AnalyticsPlugin: logAction")
    }
    
    @objc func logScreen(_ call: CAPPluginCall) {
        print("AnalyticsPlugin: logScreen")
    }
}
```

<Admonition type="info">
Refer to <a href="https://ionic.io/docs/portals/for-ios/how-to/define-api-in-typescript" target="_blank">How To Define a Portal API</a> for detailed information on authoring a Capacitor plugin.
</Admonition>

## Adding the plugin to a Portal

Capacitor plugins can be added to a Portal that has been initialized. Update the Portal defined in `WebAppView`, adding the `AnalyticsPlugin` to the Portal:

<CH.Code rows={10}>

```swift Portals/WebAppView.swift focus=16
import SwiftUI
import IonicPortals

struct WebAppView: View {
    @EnvironmentObject var credentialsManager: CredentialsManager
    @Environment(\.dismiss) var dismiss
    let metadata: WebAppMetadata
    
    var body: some View {
        PortalView(
            portal: .init(
                name: "debug",
                startDir: "portals/debug",
                initialContext: credentialsManager.credentials!.toJSObject()
            )
            .adding(AnalyticsPlugin())
        )
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

Build and run the Jobsync app and navigate to one of the features in the dashboard view. Switch from the 'Initial Context' tab to the 'Capacitor Plugins' tab. 

Look at the list of plugins. Each Portal registers a few Capacitor plugins by default, such as `Console` and `Portals` (which provides web access to pub/sub). You'll also see that the analytics plugin has been added as `Analytics`, after the value provided for `jsName`.

Expand `Analytics` tap and tap `logAction`. You'll be taken to a detail view for the method where you can provide input as a JSON string in the 'Argument' field and a button allowing you to execute the method. Click 'Execute logAction' and the method will run, logging to Xcode's console. 

In the next section, you'll learn how to access input provided to a method in a Capacitor plugin.

## Validating plugin calls

Take a look at the signature of the `logAction` plugin method:

```swift
@objc func logAction(_ call: CAPPluginCall) 
```

`CAPPluginCall` is the call sent to the plugin method from the Capacitor bridge (which Portals uses under the hood). With it, you can access input data and either successfully resolve the call or reject the call and return an error.

Resolving or rejecting the call completes the asynchronous process initiated by the web code.

Since input data is available as part of the call, you can guard against bad input. Update `logAction` to reject any calls made to the plugin method that do not contain the `action` parameter:

```swift Portals/AnalyticsPlugin.swift
 @objc func logAction(_ call: CAPPluginCall) {
    guard let action = call.getString("action") else {
        call.reject("Input option 'action' must be provided.")
        return
    }
    print("AnalyticsPlugin: logAction")
}
```

Build, run, and navigate to the 'Capacitor Plugins' tab. Click `logAction` to get to the detail view, and then press 'Execute logAction' without providing any input. The detail view will print out the message supplied to `call.reject()`: "Input option 'action' must be provided.".

Using `logAction` as a guide, guard `logScreen` such that it rejects any calls made that do not supply `screen` as input.

Test `logScreen` and once complete, head to the next section to complete the implementation of the analytics plugin.

## Completing the implementation

For the purpose of this training, logging analytic events consists of POSTing data to an HTTP endpoint.

Modify `Portals/AnalyticsPlugin.swift` and use `NetworkManager` to complete the implementation:

<CH.Scrollycoding>

<CH.Code>

```swift Portals/AnalyticsPlugin.swift focus=5
import Foundation
import Capacitor

class AnalyticsPlugin: CAPInstancePlugin, CAPBridgedPlugin {
    private var http: NetworkManager = NetworkManager()

    let jsName = "Analytics"
    let identifier = "Analytics"
    let pluginMethods: [CAPPluginMethod] = [
        .init(name: "logAction", returnType: CAPPluginReturnPromise),
        .init(name: "logScreen", returnType: CAPPluginReturnPromise)
    ]
    
    @objc func logAction(_ call: CAPPluginCall) {
       guard let action = call.getString("action") else {
           call.reject("Input option 'action' must be provided.")
           return
       }
       print("AnalyticsPlugin: logAction")
    }
    
    @objc func logScreen(_ call: CAPPluginCall) {
        print("AnalyticsPlugin: logScreen")
    }
}
```

</CH.Code>

Start by adding a private instance of `NetworkManager` to the plugin class.

---

<CH.Code>

```swift Portals/AnalyticsPlugin.swift focus=4:13
import Foundation
import Capacitor

struct AnalyticsInput: Encodable {
    let action: String?
    let screen: String?
    let params: String?
    let platform: String
}

struct AnalyticsOutput: Decodable {
    let success: Bool
}

class AnalyticsPlugin: CAPInstancePlugin, CAPBridgedPlugin {
    private var http: NetworkManager = NetworkManager()

    let jsName = "Analytics"
    let identifier = "Analytics"
    let pluginMethods: [CAPPluginMethod] = [
        .init(name: "logAction", returnType: CAPPluginReturnPromise),
        .init(name: "logScreen", returnType: CAPPluginReturnPromise)
    ]
    
    @objc func logAction(_ call: CAPPluginCall) {
       guard let action = call.getString("action") else {
           call.reject("Input option 'action' must be provided.")
           return
       }
       print("AnalyticsPlugin: logAction")
    }
    
    @objc func logScreen(_ call: CAPPluginCall) {
        print("AnalyticsPlugin: logScreen")
    }
}
```

</CH.Code>

Add structs to encode the body of the request and to decode the response.

---

<CH.Code>

```swift Portals/AnalyticsPlugin.swift focus=31:35
import Foundation
import Capacitor

struct AnalyticsInput: Encodable {
    let action: String?
    let screen: String?
    let params: String?
    let platform: String
}

struct AnalyticsOutput: Decodable {
    let success: Bool
}

class AnalyticsPlugin: CAPInstancePlugin, CAPBridgedPlugin {
    private var http: NetworkManager = NetworkManager()

    let jsName = "Analytics"
    let identifier = "Analytics"
    let pluginMethods: [CAPPluginMethod] = [
        .init(name: "logAction", returnType: CAPPluginReturnPromise),
        .init(name: "logScreen", returnType: CAPPluginReturnPromise)
    ]
    
    @objc func logAction(_ call: CAPPluginCall) {
       guard let action = call.getString("action") else {
           call.reject("Input option 'action' must be provided.")
           return
       }
       
       var params: String? = nil
        if let paramsObject = call.getObject("params") {
            params = String(data: try! JSONSerialization.data(withJSONObject: paramsObject, options: []), encoding: .utf8)
        }
    }
    
    @objc func logScreen(_ call: CAPPluginCall) {
        print("AnalyticsPlugin: logScreen")
    }
}
```

</CH.Code>

Additional parameters are optional and untyped. They can be stringified and added to the request should they exist. 

---

<CH.Code>

```swift Portals/AnalyticsPlugin.swift focus=36:44
import Foundation
import Capacitor

struct AnalyticsInput: Encodable {
    let action: String?
    let screen: String?
    let params: String?
    let platform: String
}

struct AnalyticsOutput: Decodable {
    let success: Bool
}

class AnalyticsPlugin: CAPInstancePlugin, CAPBridgedPlugin {
    private var http: NetworkManager = NetworkManager()

    let jsName = "Analytics"
    let identifier = "Analytics"
    let pluginMethods: [CAPPluginMethod] = [
        .init(name: "logAction", returnType: CAPPluginReturnPromise),
        .init(name: "logScreen", returnType: CAPPluginReturnPromise)
    ]
    
    @objc func logAction(_ call: CAPPluginCall) {
       guard let action = call.getString("action") else {
           call.reject("Input option 'action' must be provided.")
           return
       }
       
       var params: String? = nil
        if let paramsObject = call.getObject("params") {
            params = String(data: try! JSONSerialization.data(withJSONObject: paramsObject, options: []), encoding: .utf8)
        }

        let input = AnalyticsInput(action: action, screen: nil, params: params, platform: "ios")
        http.post("/analytics", input: input, output: AnalyticsOutput.self) { result in
            switch result {
            case .success(let res):
                res.success ? call.resolve() : call.reject("Logging the analytic event failed.")
            case .failure:
                call.reject("Failed to connect to the analytics endpoint.")
            }
        }
    }
    
    @objc func logScreen(_ call: CAPPluginCall) {
        print("AnalyticsPlugin: logScreen")
    }
}
```

</CH.Code>

Make the network request. If it succeeds, `call.resolve()` will resolve the call made from the web code, otherwise `call.reject()` will throw an error to be handled by the web code. 

---

<CH.Code>

```swift Portals/AnalyticsPlugin.swift focus=51:71
import Foundation
import Capacitor

struct AnalyticsInput: Encodable {
    let action: String?
    let screen: String?
    let params: String?
    let platform: String
}

struct AnalyticsOutput: Decodable {
    let success: Bool
}

class AnalyticsPlugin: CAPInstancePlugin, CAPBridgedPlugin {
    private var http: NetworkManager = NetworkManager()

    let jsName = "Analytics"
    let identifier = "Analytics"
    let pluginMethods: [CAPPluginMethod] = [
        .init(name: "logAction", returnType: CAPPluginReturnPromise),
        .init(name: "logScreen", returnType: CAPPluginReturnPromise)
    ]
    
    @objc func logAction(_ call: CAPPluginCall) {
       guard let action = call.getString("action") else {
           call.reject("Input option 'action' must be provided.")
           return
       }
       
       var params: String? = nil
        if let paramsObject = call.getObject("params") {
            params = String(data: try! JSONSerialization.data(withJSONObject: paramsObject, options: []), encoding: .utf8)
        }

        let input = AnalyticsInput(action: action, screen: nil, params: params, platform: "ios")
        http.post("/analytics", input: input, output: AnalyticsOutput.self) { result in
            switch result {
            case .success(let res):
                res.success ? call.resolve() : call.reject("Logging the analytic event failed.")
            case .failure:
                call.reject("Failed to connect to the analytics endpoint.")
            }
        }
    }
    
    @objc func logScreen(_ call: CAPPluginCall) {
        print("AnalyticsPlugin: logScreen")
    }

    private func stringify(_ json: Capacitor.JSObject?) -> String? {
        guard let json = json else { return nil }
        
        do {
            let data = try JSONSerialization.data(withJSONObject: json, options: [])
            return String(data: data, encoding: .utf8)
        } catch {
            return nil
        }
    }
    
    private func logEvent(_ input: AnalyticsInput, completion: @escaping (Bool) -> Void) {
        http.post("/analytics", input: input, output: AnalyticsOutput.self) { result in
            switch result {
            case .success(let res):
                completion(res.success)
            case .failure:
                completion(false)
            }
        }
    }
}
```

</CH.Code>

`logScreen` also needs to stringify `params` and make the same network request. Refactor the code to add utility methods.

---

<CH.Code>

```swift Portals/AnalyticsPlugin.swift focus=25:37
import Foundation
import Capacitor

struct AnalyticsInput: Encodable {
    let action: String?
    let screen: String?
    let params: String?
    let platform: String
}

struct AnalyticsOutput: Decodable {
    let success: Bool
}

class AnalyticsPlugin: CAPInstancePlugin, CAPBridgedPlugin {
    private var http: NetworkManager = NetworkManager()

    let jsName = "Analytics"
    let identifier = "Analytics"
    let pluginMethods: [CAPPluginMethod] = [
        .init(name: "logAction", returnType: CAPPluginReturnPromise),
        .init(name: "logScreen", returnType: CAPPluginReturnPromise)
    ]
    
    @objc func logAction(_ call: CAPPluginCall) {
        guard let action = call.getString("action") else {
            call.reject("Input option 'action' must be provided.")
            return
        }
        
        let params: String? = self.stringify(call.getObject("params"))
        let input = AnalyticsInput(action: action, screen: nil, params: params, platform: "ios")
        
        self.logEvent(input) { success in
            success ? call.resolve() : call.reject("Something went wrong.")
        }
    }
    
    @objc func logScreen(_ call: CAPPluginCall) {
        print("AnalyticsPlugin: logScreen")
    }

    private func stringify(_ json: Capacitor.JSObject?) -> String? {
        guard let json = json else { return nil }
        
        do {
            let data = try JSONSerialization.data(withJSONObject: json, options: [])
            return String(data: data, encoding: .utf8)
        } catch {
            return nil
        }
    }
    
    private func logEvent(_ input: AnalyticsInput, completion: @escaping (Bool) -> Void) {
        http.post("/analytics", input: input, output: AnalyticsOutput.self) { result in
            switch result {
            case .success(let res):
                completion(res.success)
            case .failure:
                completion(false)
            }
        }
    }
}
```

</CH.Code>

Update `logAction` to use the new utility methods.

---

<CH.Code>

```swift Portals/AnalyticsPlugin.swift focus=39:51
import Foundation
import Capacitor

struct AnalyticsInput: Encodable {
    let action: String?
    let screen: String?
    let params: String?
    let platform: String
}

struct AnalyticsOutput: Decodable {
    let success: Bool
}

class AnalyticsPlugin: CAPInstancePlugin, CAPBridgedPlugin {
    private var http: NetworkManager = NetworkManager()

    let jsName = "Analytics"
    let identifier = "Analytics"
    let pluginMethods: [CAPPluginMethod] = [
        .init(name: "logAction", returnType: CAPPluginReturnPromise),
        .init(name: "logScreen", returnType: CAPPluginReturnPromise)
    ]
    
    @objc func logAction(_ call: CAPPluginCall) {
        guard let action = call.getString("action") else {
            call.reject("Input option 'action' must be provided.")
            return
        }
        
        let params: String? = self.stringify(call.getObject("params"))
        let input = AnalyticsInput(action: action, screen: nil, params: params, platform: "ios")
        
        self.logEvent(input) { success in
            success ? call.resolve() : call.reject("Something went wrong.")
        }
    }
    
    @objc func logScreen(_ call: CAPPluginCall) {
        guard let screen = call.getString("screen") else {
            call.reject("Input option 'screen' must be provided.")
            return
        }
        
        let params: String? = self.stringify(call.getObject("params"))
        let input = AnalyticsInput(action: nil, screen: screen, params: params, platform: "ios")
        
        self.logEvent(input) { success in
            success ? call.resolve() : call.reject("Something went wrong.")
        }
    }

    private func stringify(_ json: Capacitor.JSObject?) -> String? {
        guard let json = json else { return nil }
        
        do {
            let data = try JSONSerialization.data(withJSONObject: json, options: [])
            return String(data: data, encoding: .utf8)
        } catch {
            return nil
        }
    }
    
    private func logEvent(_ input: AnalyticsInput, completion: @escaping (Bool) -> Void) {
        http.post("/analytics", input: input, output: AnalyticsOutput.self) { result in
            switch result {
            case .success(let res):
                completion(res.success)
            case .failure:
                completion(false)
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

If you inspect network traffic (optional), you will see network requests made to an analytics endpoint with a data payload containing `platform: 'ios'`, confirming all requirements have been met.

## What's next

Authoring Capacitor plugins, like the analytics plugins, creates structured, contract-bound communication between native mobile and web code. So far, you have been testing Portals using the sample web app downloaded from the Portals CLI. In the final step of this module, you will sync the finished web apps to complete the Jobsync superapp.