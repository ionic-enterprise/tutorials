---
title: Creating a dynamic Portal view
sidebar_label: Creating a Portal
sidebar_position: 2
---

## 3. Build a dynamic Portals view

Our end goal is to dynamically load a web app into a Portal based on metadata passed in from navigation. Before we do that, let's set up the view that will contain the Portal along with a sample web app we can use to make sure the connection works.

[[We will do these operations in the root directory. Use a ScrollyCode here]]

Using the terminal, change directories to the root of the repository and run the following command:

```bash
portals poc
```

This will download a prebuilt example web application that we can use to be displayed within a Portal. There are two ways we can bring this web app into the iOS project:

1. We can add a folder reference in Xcode
2. We can use the Portals CLI to sync it to our project

We will want to use the Portals CLI to sync the actual web apps to our iOS project once we have Portals fully configured, so let's go with the second option.

> Note: It is highly recommended to run `portals poc` then use `portals sync` to pull the sample web app into native projects.

Create a new file named `.portals.yaml` INSIDE THE `ios` FOLDER with the following code:

```yaml .portals.yaml
sync:
  - file-path: ./portals-debug-app
    directory-name: portals/debug
```

Targets > Jobsync > Build Settings > User Script Sandboxing = NO

Targets > Jobsync > Build Phases > Add new script

```bash
# Type a script or drag a script file from your workspace to insert its path.
export PATH=$PATH:/opt/homebrew/bin
portals sync 
```


## 4. Build the view

Make the following changes to `WebAppView.swift`:

```swift WebAppView.swift focus=2,10
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