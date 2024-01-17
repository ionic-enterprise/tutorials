---
title: Play Integrity
sidebar_label: Play Integrity
sidebar_position: 1
---

The [Play Integrity API](https://developer.android.com/google/play/integrity/overview) is used to verify that your Android app:
1. Has not been altered compared to what was submitted to the Play Store.
2. Has a user account that is licensed (the user installed or paid for your app on Google Play)
3. Is installed on a genuine Android device powered by Google Play services
4. Is free from malware as determined by Google Play Protect

Using the Play Integrity API is a powerful way to ensure that API services that you expose are only accessed by your mobile application. This can prevent API access by bots, scripts etc which is a powerful tool to protect your users and your services.

This tutorial shows you how to use the Play Integrity API in your Capacitor application to take advantage of these features in 2 steps:
- [Adding to your app](#adding-to-your-app)
- [Backend Verification](#backend-verification)

## Adding to your App

The first step is calling the [`requestIntegrityToken`](https://developer.android.com/google/play/integrity/classic) method in our Capacitor app. 

For this we can use a plugin called [`@capacitor-community/play-integrity`](https://github.com/capacitor-community/play-integrity) which can be installed with:
```bash
npm install @capacitor-community/play-integrity
npx cap sync
```

The plugin is used to get an **Integrity Token**. The Integrity Token is provided by the Android device and represents an encrypted reference that your backend can use to check the integrity of the device. So, we'll send this token to our backend later in the tutorial.

On the startup of our application we call to get the Integrity Token:
```typescript
import { PlayIntegrity } from '@capacitor-community/play-integrity';
...
try {
    const result = await PlayIntegrity.requestIntegrityToken({
        nonce: nonce,
        googleCloudProjectNumber: 0
    });
} catch (err) {
    // Recommendation: Report to backend and exit the application
}
```

The Integrity Token is returned in `result.token`.

There are two parameters we needed to supply:
- **nonce** - This is a unique value that that you will strategically generate (see [Docs for generating a nonce](https://developer.android.com/google/play/integrity/classic#nonce))
- **googleCloudProjectNumber** - This number can be set to `0` or can be set to the `Project Number` you find in [Firebase Console](https://console.firebase.google.com) in `Project Settings` > `General`. If set to `0` it will default to the project associated with application.

Note: In the [Google Play Console](https://play.google.com/console) you need to go to `App Integrity` and link your Google Cloud Project by clicking the `Link Cloud project` button.

### Where to use an Integrity Token
Integrity Tokens are combined with API calls to your backend. It is usually associated with an API call that is "High Value" such as a login (or first call after), obtaining or modifying personal information, performing a transaction or even as an initial check on the first startup of the app. 

You may include the integrity token as an additional header in the call to your backend.

### When not to to use an Integrity Token
Google will validate up to 10,000 Integrity Tokens per day. This limit can be expanded, or you can decrypt tokens on your backend without calling Google's APIs. Given these limitations, and the fact that obtaining a token can take [a few seconds](https://developer.android.com/google/play/integrity/classic#compare-standard), you should be selective about when to obtain and verify integrity tokens.

This means that you should not request and validate on every API call, instead on first startup or as part of a login process.

### Send to Backend
You will need to send the Integrity Token to your backend. You may add this as an additional header to an existing API call.

The important part is that your App handles an integrity check failure and takes appropriate action, such as preventing further interaction in the app.

## Backend Verification
An Integrity Token is not a guarantee of device being legitimate. To get a verdict on whether a device is "ok" you must check the token on your backend.

For this tutorial we are using a Cloudflare Worker as our backend.

These are the steps in creating the backend:
- [Create a Service Account](#creating-a-service-account) for our App's Google Cloud Project
- [Create a backend API](#our-backend-code) that accepts the Integrity Token. See the [Sample Project](https://github.com/ionic-enterprise/play-integrity)
- Call the Play Integrity API with the Integrity Token to get a Verdict Response
- Allow or Deny the App based on the verdict

### Creating a Service Account
In the [Play Console](https://play.google.com/console/) visit `App Integrity` > Google Cloud project: `View project`. This visits `console.cloud.google.com` and allows us to click `Create Credentials`:
- The API should be "`Google Play Integrity API`"
- Check the radio button `Application Data`
- Click `Next`
- Give the account a name (eg `play-integrity`)
- Give the account a description (eg `Verify my app Play Integrity`)
- Click the `Create and Continue` button
- Choose a Role (I chose Firebase Admin SDK)
- Click `Done`

Next, we need a key for this service account:
- Click the service account you created
- Click the `Keys` tab
- Click `Add Key` and choose `Create new key`
- Choose the `JSON` key type and click `Create`
- This file is a secret and in our [Sample Project](https://github.com/ionic-enterprise/play-integrity) we upload it to Cloudflare as an environment variable (we call it `GOOGLE_CLOUD_CREDENTIALS`).

### Our Backend Code
We'll follow [this guide](https://developer.android.com/google/play/integrity/classic) to use Google's servers to decrypt the Play Integrity token.

First we need an access token:
```typescript
	const accessToken = await getAccessToken({
		credentials: env.GOOGLE_CLOUD_CREDENTIALS,
		scope: "https://www.googleapis.com/auth/playintegrity",
	  });
```

Note that we are using `env.GOOGLE_CLOUD_CREDENTIALS` which is the contents of the JSON file we obtained earlier.

We can then call to decode the integrity token:

```typescript
const res = await fetch(
    `https://playintegrity.googleapis.com/v1/${env.PACKAGE_NAME}:decodeIntegrityToken`,
    {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': `application/json`
        },
        body: JSON.stringify({ integrity_token: integrityToken })
    }
);
const response = await res.json();
```

In the above code:
- `integrityToken` is a variable passed in from the mobile application. 
- `env.PACKAGE_NAME` is a variable which is our Android app's package name.
- `response` is a json object which gives us the verict of whether the mobile application client looks legitimate.

Here's an example `response` that it may return:

```json
{
    "tokenPayloadExternal": {
        "requestDetails": {
        "requestPackageName": "com.myapp",
        "timestampMillis": "1705428550115",
        "nonce": "3e8a756e-9555-40ea-bb18-18ebe68fcd90"
        },
        "appIntegrity": {
            "appRecognitionVerdict": "UNRECOGNIZED_VERSION",
            "packageName": "com.myapp",
            "certificateSha256Digest": [
                "lDDakzlkObg9sTcq2Rh8VnTBu7bUVtNPJnWogSiaiLM"
            ],
            "versionCode": "49"
        },
        "deviceIntegrity": {
            "deviceRecognitionVerdict": [
                "MEETS_DEVICE_INTEGRITY"
            ]
        },
        "accountDetails": {
            "appLicensingVerdict": "LICENSED"
        }
    }
}
```

Based on this response's `appLicensingVerdict`, `appRecognitionVerdict`, `deviceRecognitionVerdict` we make a judgement call as to whether we think this device should pass. 

For example this code returns a status code `200` back to the mobile app if it looks ok, otherwise a status code of `401`.

```typescript
if (response.tokenPayloadExternal.appIntegrity.appRecognitionVerdict == 'PLAY_RECOGNIZED' &&
    response.tokenPayloadExternal.deviceIntegrity.deviceRecognitionVerdict.includes('MEETS_DEVICE_INTEGRITY') &&
    response.tokenPayloadExternal.accountDetails.appLicensingVerdict == 'LICENSED'
) {
    return new Response('Your device looks legit!');
} else {
    console.error('Failed Play Integrity', response);
    return new Response("Failed", { status: 401 });
}
```

This covers the most basic use case. If you have gotten this far, Congratulations! You have a rudimentary check on the integrity of the device calling your API. 

## Next Steps
There is more to learn and your best resource is the official docs:
- Enable features like [verifying Play Protect, or device activity](https://developer.android.com/google/play/integrity/verdicts).
- Handle and understand [possible error codes](https://developer.android.com/google/play/integrity/error-codes).
- Avoid [common security and performance mistakes](https://developer.android.com/google/play/integrity/classic#make-classic).

## Summary
If you are reading this tutorial you understand that your API may be accessed by someone other than legitimate users. Using the Play Integrity API will help you enforce limiting that access.

The Play Integrity API is one layer in the overall security with your App. Other topics you may like to explore include Root Kit Detection, Code Obsfucation, SSL Pinning, Security provider updates and storage security.

## Common Questions
- **What about iOS?** - For the iOS platform the [Device Check](https://developer.apple.com/documentation/devicecheck/) provides an equivalent.

- **What about the standard request?** - The plugin in this tutorial uses a [classic request](https://developer.android.com/google/play/integrity/classic). A [standard request](https://developer.android.com/google/play/integrity/standard) is not supported yet but may be in the future as standard requests can be faster after the initial call.

- **What about QA/Dev testing?** - Your application may want to have different rules for checking the verdict when it is in a staging/dev environment. For example you may allow `UNRECOGNIZED_VERSION` for the `appRecognitionVerdict` as the app may be installed from Android Studio.

- **What about SafetyNet Attestation?** - The [SafetyNet Attestation API](https://developer.android.com/training/safetynet/attestation) is the predecessor to the Play Integrity API. If you are using it you should [migrate to the Play Integrity API](https://developer.android.com/google/play/integrity/migrate).