---
title: Portals for iOS developers
sidebar_label: Overview
sidebar_position: 1
---

In this training, you will use Portals to present web experiences within an iOS application. You will learn how Portals facilitates communication between native mobile and web code, and how to incorporate the Portals CLI to run web experiences within native iOS projects as part of the development workflow.

> **Warning:** Read this training's [getting started](../getting-started) document before proceeding. 

## Setting up the project

[[TO BE DEVELOPED]]

In the terminal, change directories to the root of the repository and checkout the `start-native` tag:

```bash
git checkout tags/start-native
```

This tag includes the base iOS application you will add Portals to, and the web experiences to pull in and present through Portals.

The _Jobsync_ iOS app is written using SwiftUI. The concepts in this training are applicable to UIKit as well, but the syntax will differ.  

## Installing Portals

The Portals iOS library is available for <a href="https://ionic.io/docs/portals/for-ios/quick-start#install-the-cocoapod-file" target="_blank">Cocoapods</a> and <a href="https://ionic.io/docs/portals/for-ios/upgrade-guides#swift-package-manager-support" target="_blank">Swift Package Manager</a>. You will use Swift Package Manager (SPM) in this training, but make note of the Cocoapods installation link above if your production application uses it. 

Starting from the root of the repository, run the following terminal command to launch the iOS project in Xcode:

```bash
xed ./ios/Jobsync.xcodeproj
```

In the Xcode project configuration, navigate to the 'Package Dependencies' tab and add `https://github.com/ionic-team/ionic-portals-ios`. Set the dependency rule to 'Up to the Next Minor Version'.

## Registering Portals

Portals is licensed software, and as such requires a valid <a href="https://ionic.io/docs/portals/getting-started#using-your-product-key" target="_blank">Portals product key</a> to be registered with the Portals iOS library.

Open `JobsyncApp.swift` and register Portals within the app initializer:

```swift JobsyncApp.swift focus=2,7:10
import SwiftUI
import IonicPortals

@main
struct JobsyncApp: App {

  init() {
    // Replace "YOUR_KEY_HERE" with your Portals product key.
    PortalsRegistrationManager.shared.register(key: "YOUR_KEY_HERE")
  }

  var body: some Scene {
    WindowGroup {
      ContentView()
    }
  }
}
```

Portals must be registered before rendering a `PortalView`. General rule-of-thumb would see the Portals registration occur as early into the application lifecycle as possible. 

`PortalView` &mdash; as the name suggests &mdash; is the SwiftUI view that renders a Portal. Should you fail to register with the `PortalsRegistrationManager` or provide an invalid key, all `PortalView` UI elements will be replaced with warning messages. All non-Portals portions of your application will continue to function normally.

## What's next?

In this step, you learned how to install and register Portals in an iOS application. Next, you will learn how to use the Portals CLI to pull in a debug web application to present through a Portal.

