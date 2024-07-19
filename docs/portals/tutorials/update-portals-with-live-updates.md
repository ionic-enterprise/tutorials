---
title: Update Portals with Live Updates
sidebar_label: Update Portals with Live Updates
sidebar_position: 1
---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


Ionic Appflow's [Live Update](https://ionic.io/docs/portals/what-are-live-updates) feature allows web teams to deploy updated web assets independently on their own release cycle. Live Updates can be used in conjunction with Portals to ensure the latest version of web assets are available in Portals projects.

Tooling provided by Ionic allows native teams to synchronize Portals with Live Updates at build-time and run-time, utilizing fully compliant over-the-air updating for a seamless content delivery experience.

In this tutorial, you will learn how to leverage Live Updates to synchronize the latest web assets within a Portals project. You will also learn how to use the Live Updates SDK to deliver updated web assets to end users over-the-air.

<Admonition type="danger" title="">
This tutorial is specifically designed for **iOS and Android developers**.
</Admonition>

## Overview

In this tutorial, you will extend the Jobsync superapp built as part of the [Portals training](../training/introduction). Jobsync is an intranet-themed superapp that provides typical employee functions such as expense management. Web teams build employee functions as web apps that Jobsync presents through Portals. 

Currently, web assets are synchronized with Jobsync by copying local resources into native iOS/Android projects at build-time. This scenario is not ideal for two reasons:

1. Native developers must be able to access local paths to the web assets at build-time.
2. Web teams cannot update their web assets without the new release of the native app.

A new function, a contact directory, is to be added to Jobsync. The contact directory has been registered with Appflow; by using Appflow's Live Update feature both concerns can be addressed.

## Appflow Terminology

Appflow is primarily focused towards web teams; however, it is beneficial to understand certain Appflow terms before using Live Updates with Portals:

- **App:** Web applications registered within Appflow, each with a unique identifier (**App ID**).
- **Channel:** A channel serves as a deployment lane for an Appflow app. Native apps and the Portals CLI can subscribe to these channels to receive updates.
- **Build:** Individual web asset builds for an Appflow app are stored and can be assigned to that app's channels.
- **Live Update:** The specific build referenced by a channel, capable of delivery to native apps and the Portals CLI.

<Admonition type="note">
A deeper-dive of Appflow for native developers can be found in the <a href="https://ionic.io/docs/portals/appflow/native/getting-started" target="_blank">Getting Started</a> guide.
</Admonition>

## Setting up the project

This tutorial utilizes the same repository used for the [Portals training](../training/introduction). 

<Admonition type="info" title="">
Make sure that you have followed the instructions in the "What you will need" section of the [training introduction](../training/introduction#what-you-will-need) before proceeding.
</Admonition>

The repository contains branches for different trainings and tutorials, the `start-using-liveupdates` branch corresponds to this tutorial:

```bash terminal
cd ./tutorials-and-trainings-portals
git checkout start-using-liveupdates
```

Open either the Xcode project (`/ios/Jobsync.xcodeproj`) or the Android studio project (`/android`) depending on which platform you are developing for.

Before building or running the project, you will need to register your Portals key:

<Tabs groupId="platform">
  <TabItem value="ios" label="iOS">
  
    <CH.Code rows={5}>

    ```swift Jobsync.swift focus=8
    import SwiftUI
    import IonicPortals

    @main
    struct JobsyncApp: App {

      init() {
        PortalsRegistrationManager.shared.register(key: "YOUR_KEY_HERE")
      }

      var body: some Scene {
        WindowGroup {
          ContentView()
        }
      }
    }
    ```

    </CH.Code>
  
  </TabItem>
  <TabItem value="android" label="Android">

    <CH.Code rows={5}>
  
    ```kotlin Jobsync.kt focus=9
    package io.ionic.cs.portals.Jobsync

    import android.app.Application
    import io.ionic.portals.PortalManager

    class Jobsync: Application() {
        override fun onCreate(): Unit {
            super.onCreate()
            PortalManager.register("YOUR_KEY_HERE")
        }
    }
    ```

  </CH.Code>
  
  </TabItem>
</Tabs>

## Seed a Portal at build-time

The Jobsync project uses the <a href="https://ionic.io/docs/portals/cli/commands/sync" target="_blank">Portals CLI's `sync` command</a> to bundle the web assets that will be presented through Portals. Currently, all web assets to be bundled are synchronized from relative paths within the repository:


<Tabs groupId="platform">
  <TabItem value="ios" label="iOS">
  ```yaml ios/.portals.yaml
  sync:
    - file-path: ../web/apps/expenses/dist
      directory-name: portals/expenses
    - file-path: ../web/apps/tasks/dist
      directory-name: portals/tasks
    - file-path: ../web/apps/time-tracking/dist
      directory-name: portals/time-tracking
  ``` 
  </TabItem>
  <TabItem value="android" label="Android">
  ```yaml android/app/.portals.yaml
  sync:
    - file-path: ../../web/apps/expenses/dist
      directory-name: src/main/assets/portals/expenses
    - file-path: ../../web/apps/tasks/dist
      directory-name: src/main/assets/portals/tasks
    - file-path: ../../web/apps/time-tracking/dist
      directory-name: src/main/assets/portals/time_tracking
  ``` 
  </TabItem>
</Tabs>

The `sync` command can be configured to pull down the latest Live Update available to any given Appflow app; also referred to as "seeding a Portal". Doing so is good practice as it ensures the native release ships with the latest web assets.

Update `.portals.yaml` to include an entry for the contact directory function which has been registered with Appflow:

<Tabs groupId="platform">
  <TabItem value="ios" label="iOS">
    <CH.Code rows={5}>
    ```yaml ios/.portals.yaml focus=8:11
    sync:
      - file-path: ../web/apps/expenses/dist
        directory-name: portals/expenses
      - file-path: ../web/apps/tasks/dist
        directory-name: portals/tasks
      - file-path: ../web/apps/time-tracking/dist
        directory-name: portals/time-tracking
      - app-id: b5e647f7
        channel: initial
        directory-name: portals/contacts
    token: ion_iZtdsDl9mOxcVSXEaRiWb8GU45Ld8aSotFii25crF0
    ```
    </CH.Code>
  </TabItem>
  <TabItem value="android" label="Android">
    <CH.Code rows={5}>
    ```yaml android/app/.portals.yaml focus=8:11
    sync:
      - file-path: ../../web/apps/expenses/dist
        directory-name: src/main/assets/portals/expenses
      - file-path: ../../web/apps/tasks/dist
        directory-name: src/main/assets/portals/tasks
      - file-path: ../../web/apps/time-tracking/dist
        directory-name: src/main/assets/portals/time_tracking
      - app-id: b5e647f7
        channel: initial
        directory-name: src/main/assets/portals/contacts
    token: ion_iZtdsDl9mOxcVSXEaRiWb8GU45Ld8aSotFii25crF0
    ```
    </CH.Code>
  </TabItem>
</Tabs>

Now at build-time, Jobsync will pull down and bundle the latest version of the contact directory feature (provisioned in Appflow with the App ID `b5e647f7`) available on the `initial` Live Update channel within the designated directory.

<Admonition type="note">
An <a href="" target="_blank">Appflow Personal Access Token</a> is required for the Portals CLI to authorize with Appflow.
</Admonition>

The Jobsync app displays a list of available employee functions by iterating through a static array. Before the contact directory can be accessed at run-time, an entry for it must be added. 

Add an entry to the list for the contact directory function:

<Tabs groupId="platform">
  <TabItem value="ios" label="iOS">
    <CH.Code rows={6}>

    ```swift Portals/WebApps.swift focus=19
    import Foundation
    import IonicLiveUpdates

    struct WebAppMetadata: Hashable {
      var name: String
      var description: String
      var liveUpdate: LiveUpdate?
      
      var displayName: String {
        self.name.replacingOccurrences(of: "-", with: " ").capitalized
      }
    }

    struct WebApps {
      static let metadata: [WebAppMetadata] = [
        WebAppMetadata(name: "expenses", description: "Submit expenses for business purchases."),
        WebAppMetadata(name: "tasks", description: "Track tasks for transparent project updates."),
        WebAppMetadata(name: "time-tracking", description: "Stay on schedule by tracking time spent."),
        WebAppMetadata(name: "contacts", description: "Quickly locate and update contact records.")
      ]
    }
    ```

    </CH.Code>
  </TabItem>
  <TabItem value="android" label="Android">
    <CH.Code rows={6}>

    ```kotlin portals/WebApps.kt focus=19
    package io.ionic.cs.portals.jobsync.portals

    import android.media.Image
    import io.ionic.cs.portals.jobsync.R
    import java.util.Locale

    data class WebAppMetadata(val name: String, val description: String, val imageResource: Int) {
      val displayName get() = name.replace('_', ' ').split(" ").joinToString(" ") { name ->
        name.replaceFirstChar { if (it.isLowerCase()) it.titlecase(Locale.getDefault()) else it.toString() }
      }
    }

    class WebApps {
      companion object {
        val metadata: List<WebAppMetadata> = listOf(
          WebAppMetadata("expenses", "Submit expenses for business purposes.", R.drawable.expenses),
          WebAppMetadata("tasks", "Track tasks for transparent project updates.", R.drawable.tasks),
          WebAppMetadata("time_tracking", "Stay on schedule by tracking time spent.", R.drawable.time_tracking),
          WebAppMetadata("contacts", "Quickly locate and update contact records.", R.drawable.contacts)
        )
      }
    }
    ```

    </CH.Code>
  </TabItem>
</Tabs>

Build and run the Jobsync app and navigate to the dashboard view. Select the "Contacts" feature from the list, and the seeded Live Update will load within the Portal.  

## Update a Portal over-the-air

 

---




Web teams can publish new web artifacts that end users can download over-the-air. This can be achieved using the Live Updates SDK.

The SDK is bundled within the `IonicPortals` dependency for iOS, but must be explicitly added on Android. Adjust the app level `build.gradle.kts` file to add it:

```kotlin build.gradle.kts
implementation("io.ionic:liveupdates:[0.0,1.0)")
```

Adjust the `WebAppMetadata` type to include an optional property where we can place live update configuration:

<Tabs groupId="platform">
  <TabItem value="ios" label="iOS">

    ```swift Portals/WebApps.swift focus=7,22
    import Foundation
    import IonicLiveUpdates

    struct WebAppMetadata: Hashable {
      var name: String
      var description: String
      var liveUpdate: LiveUpdate?
      
      var displayName: String {
        self.name.replacingOccurrences(of: "-", with: " ").capitalized
      }
    }

    struct WebApps {
      static let metadata: [WebAppMetadata] = [
        WebAppMetadata(name: "expenses", description: "Submit expenses for business purchases."),
        WebAppMetadata(name: "tasks", description: "Track tasks for transparent project updates."),
        WebAppMetadata(name: "time-tracking", description: "Stay on schedule by tracking time spent."),
        WebAppMetadata(
          name: "contacts",
          description: "Quickly locate and update contact records.",
          liveUpdate: LiveUpdate(appId: "b5e647f7", channel: "production")
        )
      ]
    }
    ```

  </TabItem>
  <TabItem value="android" label="Android">

    ```kotlin portals/WebApps.kt focus=4,11,28
    package io.ionic.cs.portals.jobsync.portals

    import io.ionic.cs.portals.jobsync.R
    import io.ionic.liveupdates.LiveUpdate
    import java.util.Locale

    data class WebAppMetadata(
      val name: String,
      val description: String,
      val imageResource: Int,
      val liveUpdate: LiveUpdate? = null
    ) {
      val displayName get() = name.replace('_', ' ').split(" ").joinToString(" ") { name ->
        name.replaceFirstChar { if (it.isLowerCase()) it.titlecase(Locale.getDefault()) else it.toString() }
      }
    }

    class WebApps {
      companion object {
        val metadata: List<WebAppMetadata> = listOf(
          WebAppMetadata("expenses", "Submit expenses for business purposes.", R.drawable.expenses),
          WebAppMetadata("tasks", "Track tasks for transparent project updates.", R.drawable.tasks),
          WebAppMetadata("time_tracking", "Stay on schedule by tracking time spent.", R.drawable.time_tracking),
          WebAppMetadata(
            "contacts",
            "Quickly locate and update contact records.",
            R.drawable.contacts,
            LiveUpdate("b5e647f7", "production")
          )
        )
      }
    }
    ```

  </TabItem>
</Tabs>

Now update where the Portal is rendered:

<Tabs groupId="platform">
  <TabItem value="ios" label="iOS">
    <CH.Code>

    ```swift Portals/WebAppView.swift
    import SwiftUI
    import IonicPortals

    struct WebAppView: View {
      @EnvironmentObject var credentialsManager: CredentialsManager
      @Environment(\.dismiss) var dismiss
      let metadata: WebAppMetadata
      
      var body: some View {
        PortalView(
          portal: createPortal()
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
      
      private func createPortal() -> Portal {
        var portal = Portal(
          name: metadata.name,
          startDir: "portals/\(metadata.name)",
          initialContext: credentialsManager.credentials!.toJSObject()
        )
          .adding(AnalyticsPlugin())
        
        if let liveUpdate = metadata.liveUpdate {
          portal.liveUpdateConfig = liveUpdate
        }
        
        return portal
      }
    }

    #Preview {
      WebAppView(metadata: WebApps.metadata[0])
        .environmentObject(CredentialsManager.preview)
    }
    ```

    </CH.Code>
  </TabItem>
  <TabItem value="android" label="Android">
    <CH.Code>

    ```kotlin portals/WebAppScreen.kt
    package io.ionic.cs.portals.jobsync.portals

    import androidx.compose.foundation.layout.Arrangement
    import androidx.compose.foundation.layout.Column
    import androidx.compose.foundation.layout.fillMaxSize
    import androidx.compose.foundation.layout.padding
    import androidx.compose.material3.Scaffold
    import androidx.compose.runtime.Composable
    import androidx.compose.ui.Alignment
    import androidx.compose.ui.Modifier
    import androidx.navigation.NavHostController
    import androidx.compose.ui.viewinterop.AndroidView
    import io.ionic.cs.portals.jobsync.util.CredentialsManager
    import io.ionic.portals.PortalBuilder
    import io.ionic.portals.PortalView
    import io.ionic.portals.PortalsPlugin
    import io.ionic.portals.PortalsPubSub
    import kotlinx.coroutines.CoroutineScope
    import kotlinx.coroutines.Dispatchers
    import kotlinx.coroutines.launch

    @Composable
    fun WebAppScreen(navController: NavHostController, metadata: WebAppMetadata) {
      val pubSub = PortalsPubSub()
      pubSub.subscribe("navigate:back") {
        CoroutineScope(Dispatchers.Main).launch {
          navController.popBackStack()
        }
        pubSub.unsubscribe("navigate:back", it.subscriptionRef)
      }

      Scaffold { innerPadding ->
        Column(
          Modifier.fillMaxSize().padding(innerPadding),
          verticalArrangement = Arrangement.Center,
          horizontalAlignment = Alignment.CenterHorizontally
        ) {
          AndroidView(
            modifier = Modifier.fillMaxSize(),
            factory = { context ->
              val portal = PortalBuilder(metadata.name)
                .setStartDir("portals/${metadata.name}")
                .setInitialContext(CredentialsManager.credentials!!.toMap())
                .addPlugin(AnalyticsPlugin::class.java)
                .addPluginInstance(PortalsPlugin(pubSub))

              if(metadata.liveUpdate != null) {
                portal.setLiveUpdateConfig(context, metadata.liveUpdate)
              }

              PortalView(context, portal.create())
            })
        }
      }
    }
    ```

    </CH.Code>

  </TabItem>
</Tabs>

Run the app and open Contacts. At first, it's the same. Now press back, and re-enter. We can now see a search bar! It updated!