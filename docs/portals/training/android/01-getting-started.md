---
title: Portals for Android developers
sidebar_label: Getting Started
sidebar_position: 1
---

import Admonition from '@theme/Admonition';

Android developers configure Portals that present web experiences within mobile applications and use the Portals Android library to allow native Android code to interact with web code, and vice versa. 

In this training module, you will take an existing Android app and learn how to:

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

In the introduction to this training, you cloned a repository for this training. The repository contains branches for different training modules, the `start-android` branch corresponds to this training:

```bash terminal
cd ./tutorials-and-trainings-portals
git checkout start-android
```

In this training module, you will be working with the Jobsync superapp Android project. The project utilizes Gradle for dependency management and Jetpack Compose as the UI framework.

Launch the project located at `/android` and proceed to the next section to install the Portals library.

Once you have loaded the project in Android Studio, proceed to the next section to install the Portals library.

## Installing the Portals library

To add the Portals Android library into the Jobsync project in Android Studio, follow these steps:

1. Navigate to the project navigator and expand the Gradle Scripts folder.
2. Open the file labeled `build.gradle` that has a `Module :app` notation next to it.
3. In the file editor, navigate down to the bottom, and inside the `dependencies` object, add the following

```kotlin build.gradle
implementation 'io.ionic:portals:0.8.3'
```

## Registering your Portals key

Portals is licensed software and requires a valid <a href="https://ionic.io/docs/portals/getting-started#using-your-product-key" target="_blank">Portals product key</a> for use. 

Your Portals product key must be registered before any Portals are displayed in the UI. Register your key within the app initializer in `JobsyncApp.kt`:

```kotlin JobsyncApp.kt focus=4,7:10
package io.ionic.cs.portals.Jobsync

import android.app.Application
import io.ionic.portals.PortalManager

class Jobsync: Application() {
    override fun onCreate(): Unit {
        super.onCreate()
        PortalManager.register("Portals Key")
    }
}
```

You aren't required to register Portals during app initialization, but it is recommended to register as early into the app lifecycle as possible. Should you try to render a Portal before registering your key, a warning message will be displayed in all Portals in your app.

## What's next?

Now that you have set up the project and registered your Portals product key, you can take advantage of the Portals Android library. In the next step of this module, you will create a Portal and use the Portals CLI to sync a web app to present within it.

