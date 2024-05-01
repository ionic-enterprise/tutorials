---
title: Addressing Portal Load Times
---

import Admonition from '@theme/Admonition';

As you work with Portals you may notice a brief period where the Portal appears blank, which is not an ideal user experience. The duration of this period varies based on device performance and the size of the web assets being loaded within the Portal. 

To effectively address this issue, it's important to understand why it occurs. Portals builds atop the system WebView provided by iOS and Android, with the system WebView responsible for initiating the loading of web assets. Portal components adhere to the loading lifecycle of the system WebView: they begin loading once added to the view stack and stop running when removed from the view stack. As a result, it's natural to experience an initial "blank" period when adding a Portal component to the view stack. 

There are some ways you can minimize the impact loading web assets causes to the user experience:

- Optimize the web app's load time
- Mask the Portal with a loading view

## Optimize the web app's load time

The time it takes a Portal to render content depends on how long it takes your web app to load. You should take steps to manage its startup performance, for example:

- Ensure network requests do not block initial rendering.
- Prioritize rendering visible content and placeholders.
- Optimize the file size of the web app assets.

Portals ships with a [Web Vitals plugin](https://ionic.io/docs/portals/for-web/web-vitals) that can measure your web app's performance.

Focus on reducing the [First Contentful Paint](https://web.dev/articles/fcp) (FCP) to ensure the web app starts rendering quickly. This may mean the introduction of skeleton screens in the web app while data is being fetched from the network, etc. The Portals documentation has information on profile your web application [for iOS](https://ionic.io/docs/portals/for-web/ios-profiling) and [for Android](https://ionic.io/docs/portals/for-web/android-profiling).

## Mask with a loading view

There is always the risk of displaying a "blank Portal" regardless of how well optimized the web app is, due to the fact that loading doesn't start until the Portal component is added to the view stack. 

To combat this, initially display the Portal component with zero opacity and display a native loading view. Doing so will push the Portal component onto the view stack (letting the web app load) although the user cannot see it. Once ready, remove the loading view and set the Portal component's opacity to 1 (or 100%) to display the rendered content.

There are two ways to signal when the Portal component is ready to be made visible:

1. Use the [communication mechanisms](https://ionic.io/docs/portals/choosing-a-communication) built into Portals to signal the native code layer.
2. Signal when FCP completes by tapping into the callback provided by the Web Vitals plugin.

Tutorials on implementing the first approach are available for [iOS](https://ionic.io/docs/portals/for-ios/how-to/define-api-in-typescript) and [Android](https://ionic.io/docs/portals/for-android/how-to/define-api-in-typescript).