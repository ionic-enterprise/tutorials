---
title: Tap Jacking
sidebar_label: Tap Jacking
sidebar_position: 5
---

import Admonition from '@theme/Admonition';

[Tap Jacking](https://developer.android.com/privacy-and-security/risks/tapjacking) is a technique where a malicious Android app tricks the user into clicking a security-relevant control (confirmation button etc.) by obscuring the UI with an overlay or by other means.

Tap Jacking is often reported as a potential vulnerability if your Capacitor application is penetration tested. You should mitigate this type of attack particularly if your app accepts sensitive information, a pin, password or credit card details.

<Admonition type="note">
Android 12 (SDK 31) and higher prevent this type of attack by blocking touch events from non-trusted overlays.
</Admonition>

## Mitigating Tap Jacking

In a Capacitor application you can mitigate this type of attack using the [@capacitor-community/tap-jacking](https://github.com/capacitor-community/tap-jacking) plugin.

It combines two native Android method calls:
- [`setFilterTouchesWhenObscured`](https://developer.android.com/reference/android/view/View#setFilterTouchesWhenObscured(boolean)) for Android 11 and below.
- [`setHideOverlayWindows`](https://developer.android.com/reference/android/view/Window#setHideOverlayWindows(boolean)) for Android 12 and above.

## Implementing

Install the plugin in your project using:
```bash
npm install @capacitor-community/tap-jacking
npx cap sync
```

Then, as part of the application startup you should call `preventOverlays`:

```typescript
import { TapJacking } from '@capacitor-community/tap-jacking';
...
await TapJacking.preventOverlays();
```

On Android, calling `preventOverlays` will call the right method to mitigate Tap Jacking. You can call `enableOverlays` if you application needs overlays to work or if you conditionally want to prevent tap jacking on certain screens.

On iOS and Web, calling `preventOverlays` will do nothing, so we do not need to conditionally call it for Android.

## Summary

Mitigating tap jacking is an important additional step in maintaining the security of your Capacitor application.