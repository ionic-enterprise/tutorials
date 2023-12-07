---
title: Adding Apple Wallet Passes
sidebar_label: Adding Passes
sidebar_position: 1
---

A Digital pass can be added to Apple Wallet in a Capacitor app by downloading the pass from your backend, and using a Capacitor plugin to add it. These steps and code needed are outlined below.

A [sample project](https://github.com/ionic-enterprise/tutorials-digital-passes) is available if you would like to see adding a pass in action.

## Downloading a Pass
You can download a `pkpass` file in a Capacitor app using this function called `get`:
```typescript
  async function get(url: string): Promise<string> {
    const response = await fetch(url);
    const blob = await response.blob();
    const base64 = await blobToBase64(blob);
    if (!base64 || base64 instanceof ArrayBuffer) {
      throw new Error(`Unable to get ${url}`);
    }
    return base64;
  }
```

`pkpass` data must be base64 encoded, create a helper function called `blobToBase64`:
```typescript
function blobToBase64(blob: Blob): Promise<string | ArrayBuffer | null> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });
}
```

## Adding to Apple Wallet

After downloading the pass we need to add it using a plugin. In this tutorial we'll use [`capacitor-pass-to-wallet`](https://github.com/valentinAbundo/capacitor-pass-to-wallet) which you can install by running these commands:

```bash
npm install capacitor-pass-to-wallet
npx cap sync
```

We can call the `addToWallet` function of the plugin with the result of our `get` call:

```typescript
import { CapacitorPassToWallet } from 'capacitor-pass-to-wallet';
...
   const data = await get('https://url-to-get-pass');
   await CapacitorPassToWallet.addToWallet({ base64: data });
```

You should see a standard Apple **Add Pass** dialog with details of your pass (example below). The user can click **Add** to add to Apple Wallet.

<div style={{textAlign: 'center'}}>

![App Screenshot](/img/example-pass.png)

</div>
