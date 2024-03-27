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

Once this tutorial is complete, the Jobsync app will dynamically load the appropriate web app into a Portal configured within this detail view. 

A good first step is to configure and display a Portal, loading a sample web app to ensure the configuration works. In the next section, you will utilize the Portals CLI to download a sample web app and sync it with the Android project.

## Syncing the sample web app

The Portals CLI offers the <a href="https://ionic.io/docs/portals/cli/commands/poc" target="_blank">`poc` command</a>, which will download a prebuilt example web app that can be used to test communication through a Portal. 

Run the following command in the terminal at the *repository root*:

```bash terminal
portals poc
```

The sample web app downloads to `/portals-debug-app`. To sync the web app with your Android project, do the following:

<Admonition type="info" title="Best Practice">
Using the Portals CLI to pull web apps into an Android project is recommended. This approach can be scaled and configured with Live Updates.
</Admonition>

Create a new file `.portals.yaml` within the `/android` folder:

```yaml android/.portals.yaml
sync:
  - file-path: ../portals-debug-app
    directory-name: app/src/main/assets/portals/debug
```

The `file-path` is the bundled web app directory in relation to the root of the Android project, while the `directory-name` is the target location the command will move the bundle to.

Open your terminal again and run the following:
```bash terminal
cd ./android
portals sync
```


Next, open `portals/WebAppView.kt` and make it return a `PortalView` instead of a `Button`: 

```kotlin portals/WebAppView.kt focus=17:23
package io.ionic.cs.portals.Jobsync.portals

import androidx.compose.runtime.Composable
import androidx.compose.ui.viewinterop.AndroidView
import androidx.navigation.NavHostController
import io.ionic.cs.portals.Jobsync.network.ApiClient
import io.ionic.portals.PortalBuilder
import io.ionic.portals.PortalView

@Composable
fun WebAppView(
    navHostController: NavHostController,
    metadata: WebAppMetadata
) {
    val credentials = ApiClient.credentials

    val portal = PortalBuilder("debug")
        .setStartDir("portals/debug")
        .create();

    AndroidView(factory = {
        PortalView(it, portal)
    })
}
```

Build and run the Jobsync app and navigate to the dashboard view. Select a feature from the list, and the sample web app will load within the `PortalView` in the detail view. Nice!

Make note of the three tabs in the sample web app: 'Initial Context', 'Publish/Subscribe', and 'Capacitor Plugins'. Each tab maps to a way you can communicate through a Portal, and in the case of the latter two tabs, allows you to test the mechanism. Notice that the 'Initial Context' tab prints out `{ "name": "debug" }`. This is the `name` property set when initializing a `Portal` object, and is accessible to web apps as part of *initial context*, which you will learn about next.

## What's next

Using the Portals CLI and the Portals Android library, you have successfully created your first Portal. In the next step of this module, you will learn how to use initial context to pass immediately-available data to web apps. 
