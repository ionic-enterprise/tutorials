---
title: Android Security Provider
sidebar_label: Android Security Provider
sidebar_position: 4
---

import Admonition from '@theme/Admonition';

Android relies on a [security provider](https://developer.android.com/privacy-and-security/security-gms-provider) for secure network communications. However, from time to time, vulnerabilities are found in the default security provider. To protect against these vulnerabilities, Google Play services provides a way to automatically update a device's security provider to protect against known exploits. By calling Google Play services methods, you can help ensure that your app is running on a device that has the latest updates to protect against known exploits.

For example, a vulnerability was discovered in OpenSSL (CVE-2014-0224) that can leave apps open to an on-path attack that decrypts secure traffic without either side knowing. Google Play services version 5.0 offers a fix, but apps must check that this fix is installed. By using the Google Play services methods, you can help ensure that your app is running on a device that's secured against that attack.

## Implementing

You can implement the Google Play Services security provider check in a Capacitor application using the [`@capacitor-community/security-provider`](https://github.com/capacitor-community/android-security-provider) plugin.

First, install the plugin:
```bash
npm install @capacitor-community/security-provider
npx cap sync
```

In your application's startup code, check if an update to the security provider is needed by adding the following code:
```typescript
import { CapacitorSecurityProvider, SecurityProviderStatus } from '@capacitor-community/security-provider';
...
const result = await CapacitorSecurityProvider.installIfNeeded();
if (result.status !== SecurityProviderStatus.Success && result.status !== SecurityProviderStatus.NotImplemented) {
    // Do not proceed. The Android Security Provider failed to verify / install.
}
```

The `status` property will return `SecurityProviderStatus.Success` on an Android device which is up to date. As this plugin has no effect on iOS the `status` property will return `SecurityProviderStatus.NotImplemented` on iOS devices.

## Further Information

Additional information about the Android security provider and the calls this plugin uses can be found in the [Android Developer Documentation](https://developer.android.com/privacy-and-security/security-gms-provider).

## Summary

Ensuring that your App verifies that you are using the latest secure version of Play Services is an additional step in maintaining the security of your Capacitor application.

