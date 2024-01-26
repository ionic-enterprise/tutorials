---
title: Device Check
sidebar_label: Device Check
sidebar_position: 2
---

import Admonition from '@theme/Admonition';

On an iOS device you can use [Device Check](https://developer.apple.com/documentation/devicecheck) to help reduce fraudulent use of your services by managing:
- [Device State](#device-state).
- [Asserting App Integrity](#asserting-app-integrity).

## Device State
This tutorial covers how to use the [DCDevice](https://developer.apple.com/documentation/devicecheck/dcdevice) API to:
- Identify devices while preserving privacy.
- Store state about the device (2 binary digits per device).

This can be used to:
- Flag a device that you've determined to be fraudulent.
- Identify devices that have taken advantage of a promotional offer.
- Store some other state that needs to be specific to the device.

The API would typically be used in combination with [Asserting App Integrity](#asserting-app-integrity).

### Asserting App Integrity

<Admonition type="warning">
This tutorial **DOES NOT** cover the topic of App Integrity. App Integrity uses the <a style={{color: 'blue'}} href="https://developer.apple.com/documentation/devicecheck/dcappattestservice">DCAppAttestService</a> API.
</Admonition>

 

If you are interested in this topic it is worth noting that it requires a backend service with database requirements to store multiple key and receipt pairs for each user of a device. It also requires a native plugin in a Capacitor project.

## Getting Started
This tutorial describes how you use the Device State feature in a Capacitor application by following these steps:
1. [Install the Device Check Plugin](#install-the-device-check-plugin)
2. [Get the Device Token](#get-the-device-token)
3. [Send the Device Token to Our Backend](#send-the-device-token-to-our-backend)
4. [Download the Device Check Key](#download-device-check-key)
5. [Verify the Device Token in the Backend](#verify-token-in-the-backend)

## Install the Device Check Plugin
We need to install a plugin called [@capacitor-community/device-check](https://www.npmjs.com/package/@capacitor-community/device-check):

```bash
npm install @capacitor-community/device-check
npx cap sync
```

The plugin is used to get a Device Token which we will send back to our backend.

## Get the Device Token
In our application we call to `generateToken`:

```typescript
import { DeviceCheck } from '@capacitor-community/device-check';
...
try {
      const result = await DeviceCheck.generateToken();     
      // Send the token to our backend
    } catch (err) {
      // Log the error, but it is likely ok to continue running the app
    }
```

The Device token is now in the variable `result.token` and we can send it to our backend.

## Send the Device Token to Our Backend

We'll send the Device Token to our backend using Capacitor HTTP:
```typescript
import { CapacitorHttp, HttpResponse } from '@capacitor/core';
...
      // Send the token to our backend
      const response: HttpResponse = await CapacitorHttp.post({
        url: 'https://myserver',
        headers: { 'Content-Type': 'application/json' },
        data: { token: result.token }
      });
      // Add your response handling here
```

We can continue running your app regardless of the response but you may want to handle the scenario of a response that indicates the device has been flagged as fraudulent by alerting the users. Other potential responses may include Apples servers being down or is error due to App being run from XCode.

## Download Device Check Key

For our next steps we'll need to download a DeviceCheck Key from the Apple Developer Portal:
- Login to your [Apple Developer Account](https://developer.apple.com/account/)
- Visit [`Certificates, Identifiers & Profiles`](https://developer.apple.com/account/resources/authkeys/add) and under `Keys` click the `+` button.
- Provide a key name and check `DeviceCheck`.
- Click `Continue`, then click `Register`
- Click `Download` and store the key securely (it will be saved with the filename format `AuthKey_[key ID].p8`)

## Accept Token in the Backend

You can use whatever backend technology you like, however in this tutorial I'll describe how to create a backend with a Cloudflare Worker.

### Creating a Cloudflare Worker
- Run `npm create cloudflare` and choose the hello world example.
- Install a JWT library by running `npm install jose`
- Install a unique ID generator by running `npm install uuid`
- Install its types by running `npm i --save-dev @types/uuid`

### Verify the Token

The following code:
- Accepts the Device Token from our app.
- Generates a JWT from our Private Key.
- Calls the Apple server to validate the Device Token.
- Returns a success response to our app.

```typescript
import { SignJWT, importPKCS8 } from 'jose';
import { v4 as uuid } from 'uuid';

export interface Env {
	AUTH_KEY: string;
	TEAM_ID: string;
	KEY_ID: string;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		if (request.method != 'POST') {
			return new Response("", { status: 404 });
		}
		return await validateDeviceCheckToken(request, env);
	},
};

async function validateDeviceCheckToken(request: Request, env: Env): Promise<Response> {
	try {
		const deviceToken = await getDeviceToken(request);
		const isDevelopment = request.url.includes('development');

		if (!deviceToken) {
			return new Response("", { status: 404 });
		}

		let privateKey;
		try {
			privateKey = await importPKCS8(env.AUTH_KEY, 'ES256')
		} catch (e) {
			console.error(`Unable to create private key`, e);
			return new Response("KeyError", { status: 401 });
		}

		const jwt = await new SignJWT({ iss: env.TEAM_ID })
			.setProtectedHeader({ alg: 'ES256', kid: env.KEY_ID, typ: 'JWT' })
			.setIssuedAt()
			.setExpirationTime('12h')
			.sign(privateKey);

			// In production this should be set to false
		const environment = isDevelopment ? "api.development" : "api";
		console.log(`POST https://${environment}.devicecheck.apple.com/v1/validate_device_token`);
		console.log(`Authorization: Bearer ${jwt}`)

		const body = JSON.stringify({
			'device_token': deviceToken, // The Device Token from our Capacitor App
			'transaction_id': uuid(), // A unique transaction id
			'timestamp': Date.now()
		});
		
		// Send the request to Apple
		const res = await fetch(
			`https://${environment}.devicecheck.apple.com/v1/validate_device_token`,
			{
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${jwt}`,
					'Content-Type': `application/json`
				},
				body
			});
		if (res.status == 200) {			
			const data = await res.text();
			console.log(`Success`, data);
			return new Response('Awesome!');
		} else {
			const text = await res.text();
			if (text == 'Missing or badly formatted authorization token') {
               // If you deployed your app to a device with Xcode this error may occur
			   // You need to deploy to testflight and test that way
			}
			console.error(`Failure ${res.status}`, await res.text());
			return new Response("Error", { status: 401 });
		}
	} catch (err) {
		console.error(`Exception`, err);
		return new Response("Error", { status: 401 });
	}
}

async function getDeviceToken(request: Request): Promise<string | undefined> {
	try {
		const body: any = await request.json();
		const deviceToken = body.token;
		if (!deviceToken) {
			return undefined;
		}
		return deviceToken;
	} catch {
		console.error(`Request is missing a JSON body`);
		return undefined;
	}
}
```

These Environment Variables need to be set in the above code:
- `AUTH_KEY` - This is the contents of the Device Check Key we downloaded from Apple in the [previous step](#download-device-check-key).
- `TEAM_ID` - This is your Team ID from your Apple Developer Account.
- `KEY_ID` - This is the Key ID that is associated with the Device Check Key from your Apple Developer Account.
- `isDevelopment` - This is a boolean value used to specify which Apple API to use. Set it to `false` during testing with Testflight/Production.

<Admonition type="warning">
A typical error response you may from Apple's API is status code <b>400</b> with the text `Missing or badly formatted authorization token`. This is likely caused by the app may have been deployed to the device using XCode. You must deploy your app to Testflight (or the Store) to get a `200` response code from Apple.
</Admonition>


## Summary
This covers our first use case of the Device Check API to validate that Apple knows about our device. We have **not** verfied that the app is untampered with (see [Asserting App Integrity](#asserting-app-integrity)).

## Next Steps
- **App Integrity** - To verify that app is not altered or distributed outside the App Store we need to use the [DCAppAttestService](https://developer.apple.com/documentation/devicecheck/dcappattestservice) class. Reading the detailed documentation from Apple will give a good sense of how much work is required to implement this.

- **Accessing Device State** - Apple can store information about the device which you can use for anything (eg is the device fraudulent). These are additional calls you can make to Apple in your backend. You should read about how to do this in [Apple's Documentation](https://developer.apple.com/documentation/devicecheck/accessing-and-modifying-per-device-data).


## Common Questions

- **What are other responses that could be returned from Apple?** - See [Apples documentation]((https://developer.apple.com/documentation/devicecheck/accessing_and_modifying_per-device_data#2910408)).

- **Does Device State survive uninstalling the App?** - Yes, so be sure to store only relevant information. For example, maybe your App has a purchase for a paid plan per device. You can use a bit flag to indicate that the user paid on this device.

- **If the user installs my App on another device does the Device State transfer?** - No, the device state is for the particular unique device.

- **During development I'm getting an error response from Apple?** - This is likely because you are not deploying the app using TestFlight or the App Store. A Device Token that is generated an App that was deployed with Xcode will return a status of `400` and message "Missing or badly formatted authorization token".


