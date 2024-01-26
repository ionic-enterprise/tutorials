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
        .init(name: "logEvent", returnType: CAPPluginReturnPromise)
    ]
    
    @objc func logAction(_ call: CAPPluginCall) {
        print("AnalyticsPlugin: logAction")
    }
    
    @objc func logEvent(_ call: CAPPluginCall) {
        print("AnalyticsPlugin: logEvent")
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

Navigate to the "Capacitor Plugins" tab. Notice that "Analytics" now exists. Expand it, and click on `logAction` and press the "Execute logAction" button. Do the same for `logEvent`. It executes them and prints to the console. Neat!


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