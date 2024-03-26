---
title: Creating a dynamic Portal view
sidebar_label: Dynamic Portal View
sidebar_position: 6
pagination_next: null
---

import Admonition from '@theme/Admonition';

In this step, you will sync the finalized web apps with the Android project and dynamically display the proper web app based on web app metadata.



## Exploring the problem

The Jobsync superapp should consolidate multiple web experience into a single mobile experience. Up to this point, you have been using a sample web app to test and debug Portals against.

In a real world scenario, you may be tasked to implement Portals and develop communication hooks while web developers are in the process of building out the actual web experiences to present through Portals.

<Admonition type="tip">
Use the sample web app downloaded from the `poc` Portals CLI command to integrate and test Portals before syncing and testing web experiences provided by web developers.
</Admonition>

The last task remaining before the Jobsync superapp is complete is to sync the individual web apps and dynamically determine which one should be displayed within `WebAppView` at any given moment.

## Syncing the web apps

Delete the sample web app downloaded from the Portals CLI, it is no longer needed:

```bash terminal
rm -rf /portals-debug-app
```

Update `/android/.portals.yaml` to match the following code:

```yaml android/.portals.yaml
sync:
  - file-path: ../web/apps/expenses
    directory-name: app/src/main/assets/portals/expenses
  - file-path: ../web/apps/tasks
    directory-name: app/src/main/assets/portals/tasks
  - file-path: ../web/apps/time-tracking
    directory-name: app/src/main/assets/portals/time_tracking
``` 

<Admonition type="note">
The monorepo contains the build outputs of all the web experiences to sync with Portals. In a typical development workflow, you would sync <a href="https://ionic.io/docs/portals/what-are-live-updates" target="_blank">Live Updates</a> pushed to Appflow. 
</Admonition>


## Dynamically configuring a Portal

Open `portals/WebApps.kt` in Android Studio and note the following code:

<CH.Code rows={7}>

```kotlin portals/WebApps.kt focus=11:15
package io.ionic.cs.portals.Jobsync.portals

import java.util.Locale

data class WebAppMetadata(val name: String, val description: String) {
    val displayName get() = name.replace('_', ' ').split(" ").map {
        it.replaceFirstChar { if (it.isLowerCase()) it.titlecase(Locale.getDefault()) else it.toString() }
    }.joinToString(" ")
}

val webApps: List<WebAppMetadata> = listOf(
    WebAppMetadata("expenses", "Submit expenses for business purchases."),
    WebAppMetadata("tasks", "Track tasks for transparent project updates."),
    WebAppMetadata("time_tracking", "Stay on schedule by tracking time spent.")
)
```
</CH.Code>

The list of features to display on the dashboard come from this list. When one of the features is selected, the `metadata` entry is passed to `WebAppView`, and the `name` property can be used to set the `name` property and compute the correct `startDir` when initializing the Portal.

Make the following changes to `portals/WebAppView.kt`:

```kotlin portals/WebAppView.kt focus=29,30
package io.ionic.cs.portals.Jobsync.portals

import androidx.compose.runtime.Composable
import androidx.compose.ui.viewinterop.AndroidView
import androidx.navigation.NavHostController
import io.ionic.cs.portals.Jobsync.network.ApiClient
import io.ionic.portals.PortalBuilder
import io.ionic.portals.PortalView
import io.ionic.portals.PortalsPlugin
import io.ionic.portals.PortalsPubSub
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

@Composable
fun WebAppView(
    navHostController: NavHostController,
    metadata: WebAppMetadata
) {
    val credentials = ApiClient.credentials
    val credentialsMap = mapOf("accessToken" to credentials?.access_token, "refreshToken" to credentials?.refresh_token)
    val pubsub = PortalsPubSub()
    pubsub.subscribe("navigate:back") {
        CoroutineScope(Dispatchers.Main).launch {
            navHostController.popBackStack()
        }
        pubsub.unsubscribe("navigate:back", it.subscriptionRef)
    }

    val portal = PortalBuilder(metadata.name)
        .setStartDir("portals/${metadata.name}")
        .setInitialContext(credentialsMap)
        .addPlugin(AnalyticsPlugin::class.java)
        .addPluginInstance(PortalsPlugin(pubsub))
        .create()

    AndroidView(factory = {
        PortalView(it, portal)
    })
}
```

Build and run the Jobsync app and navigate to the dashboard view. Select a feature from the list, and the finalized web app will load within the `PortalView`. 

Press the back arrow in the web app's header, and you'll be taken back to the dashboard view. The button publishes a message to the `navigate:back` and the subscriber previously added dismisses the view. Navigate to a different feature and observe a different web app load within a new Portal. 

<Admonition type="note">
Due to the way initial context and the analytics plugin work for the purpose of this training, validating initial context and the analytics plugin requires inspecting network requests made within the Expenses web app.
</Admonition>
 
## Conclusion

With the finalized web apps dynamically presenting through Portals, the Jobsync superapp is complete! In this training module, you learned how to create and dynamically present a web app through a Portal and exercised the various ways native mobile apps can communicate through a Portal. Furthermore, you used the Portals CLI to set up a development workflow to test and debug Portals communication without needing the finalized web artifacts.

You now have the tools in place to start integrating Portals into any Android app. Happy coding!! 🤓 