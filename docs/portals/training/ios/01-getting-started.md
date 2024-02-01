---
title: Portals for iOS developers
sidebar_label: Getting Started
sidebar_position: 1
---

import Admonition from '@theme/Admonition';

iOS developers configure Portals that present web apps mobile applications. Communication through a Portal can be achieved, allowing native iOS code to interact with web code, and vice versa.

In this training module, you will take an existing iOS app and learn how to:

- Sync and bundle web apps to present through Portals.
- Pass contextual data to web apps loading within a Portal.
- Interact with messages sent from web apps.
- Implement and attach Capacitor plugins to Portals.
- Dynamically load web apps within a Portal. 

At the end of this training module, you will have put together a completed superapp.

<Admonition type="note">
Make sure you have read the [training introduction](../introduction) before proceeding. 
</Admonition>

## Setting up the project

In the introduction to this training, you cloned a repository for this training. The repository contains branches for different training modules, the `start-ios` branch corresponds to this training:

```bash terminal
cd ./tutorials-and-trainings-portals
git checkout start-ios
```

In this training module, you will be working with the Jobsync superapp iOS project. The project utilizes Swift Package Manager for dependency management and SwiftUI as the UI framework. Where necessary, admonitions will be provided to highlight differences when using UIKit or Cocoapods.

Launch the project located at `/ios/Jobsync.xcodeproj` and proceed to the next section to install the Portals library.

Once you have loaded the project in Xcode, proceed to the next section to install the Portals library.

## Installing the Portals library

To add the Portals iOS library into the Jobsync project in Xcode, follow these steps:

1. Navigate to the project navigator and select the Jobsync project.
2. In the main project view, locate and select the 'Package Dependencies' tab.
3. Click the Add button ('+') to add a new package.

Next, add the Portals iOS library:

1. Type `https://github.com/ionic-team/ionic-portals-ios` into the search bar.
2. Set the dependency rule to 'Up to the Next Minor Version'.
3. Click 'Add Package' and complete the prompt adding 'IonicPortals' to the Jobsync target.

<Admonition type="info">
Instructions on installing the Portals iOS library as a Cocoapod are available <a href="https://ionic.io/docs/portals/for-ios/quick-start#4-setup-portals-in-your-ios-app" target="_blank">at this link</a>.
</Admonition>

## Registering your Portals key

Portals is licensed software and requires a valid <a href="https://ionic.io/docs/portals/getting-started#using-your-product-key" target="_blank">Portals product key</a> for use. 


Your Portals product key must be registered before any Portals are displayed in the UI. Register your key within the app initializer in `JobsyncApp.swift`:

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

You aren't required to register Portals during app initialization, but it is recommended to register as early into the app lifecycle as possible. Should you try to render a Portal before registering your key, a warning message will be displayed in your app. 

<Admonition type="caution">
Avoid committing your Portals product key to source code repositories that may be publicly visible! You can use an <a href="https://nshipster.com/xcconfig/" target="_blank">`.xcconfig` file</a> to store the key outside of a public repository.
</Admonition>

## What's next?

After setting up the project and registering your Portals product key, you can now take advantage of the Portals iOS library. In the next step of this module, you will create a Portal and use the Portals CLI to sync a web app to present within it.

