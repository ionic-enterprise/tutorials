---
title: Creating and displaying a Portal
sidebar_label: Creating a Portal
sidebar_position: 2
---

import Admonition from '@theme/Admonition';

A Portal is a mobile view capable of displaying and running a web app. It uses <a href="https://capacitorjs.com/" target="_blank">Capacitor</a> to bridge native mobile code and web code, allowing communication between the two layers.

In this step, you will configure a Portal to display a web app within the Jobsync mobile application.

## Exploring the problem

Launch the Jobsync app on a device or simulator, and sign in using the preset credentials. On the dashboard view, you will find a list of features, each designed to navigate the user to a Portal containing a standalone web app. Choose any feature and notice that it navigates you to a blank detail view.

Once complete, the Jobsync app will dynamically load the appropriate web app into a Portal configured within this detail view. 

A good first step is to configure and display a Portal, loading a sample web app to ensure the configuration works. In the next section, you will utilize the Portals CLI to generate a sample web app and sync it with the iOS project.

## Syncing the sample web app

The Portals CLI offers the <a href="https://ionic.io/docs/portals/cli/commands/poc" target="_blank">`poc` command</a>, which will download a prebuilt example web app that can be used to test communication through a Portal. 

Run the following command in the terminal at the repository root:

```bash terminal
portals poc
```

The sample web app downloads to `/portals-debug-app`. There are two ways the web app can be synced with the iOS project:

1. Adding a folder reference in Xcode.
2. Write a build script that uses the Portals CLI to sync it.

The second approach is better suited for the purpose of this training module.

<Admonition type="info" title="Best Practice">
Using the Portals CLI to pull web apps into an iOS project is recommended. This approach can be scaled and configured with Live Updates.
</Admonition>

Create a new file `.portals.yaml` within the `/ios` folder:

```yaml ios/.portals.yaml
sync:
  - file-path: ../portals-debug-app
    directory-name: portals/debug
```

Next, navigate to the main project view in Xcode and select the 'Jobsync' target:

1. Click the 'Build Settings' tab and set 'User Script Sandboxing' to 'NO'.
2. Click the 'Build Phases' tab, press the plus icon and click 'New Run Script Phase'.

Add the following code to the new script:

```bash
export PATH=$PATH:/opt/homebrew/bin
portals sync 
```

<Admonition type="info">
You may need to adjust the `PATH` export if you have installed the Portals CLI using something other than Homebrew.
</Admonition>

Finally, open `Portals/WebAppView.swift` (the detail view) and replace the `Button` with a `PortalView`: 

```swift Portals/WebAppView.swift focus=2,10
import SwiftUI
import IonicPortals

struct WebAppView: View {
    @EnvironmentObject var credentialsManager: CredentialsManager
    @Environment(\.dismiss) var dismiss
    let metadata: WebAppMetadata
    
    var body: some View {
        PortalView(portal: .init(name: "debug", startDir: "portals/debug"))
            .ignoresSafeArea()
            .navigationBarBackButtonHidden()
    }
}

#Preview {
    WebAppView(metadata: WebApps.metadata[0])
        .environmentObject(CredentialsManager.preview)
}
```

<Admonition type="info">
`PortalView` is exclusive to SwiftUI; the UIKit equivalent is <a href="https://ionic.io/docs/portals/for-ios/getting-started#using-portalview-and-portaluiview" target="_blank">`PortalUIView`</a>.
</Admonition>

Build and run the Jobsync app and navigate to the dashboard view. Select a feature from the list, and the sample web app will load within the `PortalView` in the detail view. Nice!

Make note of the three tabs in the sample web app: 'Initial Context', 'Publish/Subscribe', and 'Capacitor Plugins'. Each tab maps to a way you can communicate through a Portal, and in the case of the latter two tabs, allows you to test the mechanism. Notice that the 'Initial Context' tab prints out `{ "name": "debug" }`. This is the `name` property set when initializing a `Portal` object, and is accessible to web apps as part of initial context, which you will learn about next.

## What's next

Using the Portals CLI and the Portals iOS library, you have successfully created your first Portal. In the next step of this module, you will learn how to use initial context to pass immediately-available data to web apps. 
