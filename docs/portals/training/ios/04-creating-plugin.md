---
title: Creating a Capacitor plugin
sidebar_label: Capacitor Plugin
sidebar_position: 3
---

## What plugin do we need?




## Interface

```swift AnalyticsPlugin.swift
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

## Add to Portal

```swift WebAppView.swift focus=14
//
//  WebAppView.swift
//  Jobsync
//
//  Created by Eric Horodyski on 1/3/24.
//

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
        ).adding(AnalyticsPlugin()))
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

Navigate to the "Capacitor Plugins" tab. Notice that "Analytics" now exists. Expand it, and click on `logAction` and press the "Execute logAction" button. Do the same for `logScreen`. It executes them and prints to the console. Neat!


## Add guards

USE SCROLLYCODING HERE


```swift AnalyticsPlugin.swift
 @objc func logAction(_ call: CAPPluginCall) {
    guard let action = call.getString("action") else {
        call.reject("Input option 'action' must be provided.")
        return
    }
    print("AnalyticsPlugin: logAction")
}
```

Mention trying this out in the simulator, and supplying an empty payload. Note how the error message is printed here.

## Implementing the plugin:

1. Add the structs
2. Fill out the method

```swift AnalyticsPlugin.swift
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
    
        let params: String? = nil
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

## Refactoring the plugin call and implementing `logScreen`


```swift
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
        .init(name: "logEvent", returnType: CAPPluginReturnPromise)
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