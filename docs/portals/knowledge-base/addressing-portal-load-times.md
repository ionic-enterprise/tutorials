---
title: Addressing Portal Load Times
---

import Admonition from '@theme/Admonition';

As you work with Portals you may notice a brief period where the Portal appears blank, which is not an ideal user experience. The duration of this period varies based on device performance and the size of the web assets being loaded within the Portal. 

To effectively address this issue, it's important to understand why it occurs. Portals builds atop the system WebView provided by iOS and Android, with the system WebView responsible for initiating the loading of web assets. Portal components adhere to the loading lifecycle of the system WebView: they begin loading once added to the view stack and stop running when removed from the view stack. As a result, it's natural to experience an initial "blank" period when adding a Portal component to the view stack. 

To minimize the impact web assets loading causes to the user experience:

## Mask with a loading view

One effective way to prevent users from seeing "blank Portals" is to add the Portal component to the view stack with no opacity to hide it as it loads, and display a loading view until the web app is ready to be presented. Once the web app is ready to be viewed, remove the loading view and set the Portal component's opacity to 1 to display it with a loaded web app.

There are two ways to approach signaling when the Portal is ready to be made visible. You can use the [communication mechanisms](https://ionic.io/docs/portals/choosing-a-communication) built into Portals to let the web app notify the native code layer when it is ready for the Portal to be visible. Tutorials on implementing this approach can be found here [here for iOS](https://ionic.io/docs/portals/for-ios/how-to/define-api-in-typescript) and [here for Android](https://ionic.io/docs/portals/for-android/how-to/define-api-in-typescript). Alternatively, you can use Portals' [Web Vitals plugin](https://ionic.io/docs/portals/for-web/web-vitals) to supply a callback that will display the Portal after First Contentful Paint (FCP) has completed.

## Optimize the web app's load time

Implementing a loading view will prevent the user from seeing "blank Portals", but it does not impact the duration it takes your web app to load. You can use Portals' [Web Vitals plugin](https://ionic.io/docs/portals/for-web/web-vitals) to measure the web app's performance.

Focus on reducing the [First Contentful Paint](https://web.dev/articles/fcp) to ensure the web app starts rendering quickly. This may mean the introduction of skeleton screens in the web app while data is being fetched from the network, etc. You can learn more about profiling your web application [here for iOS](https://ionic.io/docs/portals/for-web/ios-profiling) and [here for Android](https://ionic.io/docs/portals/for-web/android-profiling).