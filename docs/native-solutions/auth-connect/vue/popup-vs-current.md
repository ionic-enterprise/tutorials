---
title: Popup vs. Current
sidebar_label: Popup vs. Current 
sidebar_position: 4
---

## Overview

When the application is running in a web context, Auth Connect provides two different options for presenting the authentication page: `popup` or `current`. Up to this point, we have been using `popup`. In this tutorial we will explore `current`.

### `popup`

With `popup`, the authentication provider is opened in a new browser tab / window. This mode is the most consistent with how Auth Connect works on mobile where the authentication provider is displayed in a secure web view. On the web, this option requires no extra code, but it may not be the best user experience for web.

If your application is only distributed as a web-native mobile app, and the web-context is only used for development, then it is best to use `popup`.
 
### `current`

With `current`, the authentication provider is opened in the current window, replacing your application. Your application will then be called with token information on the URL upon successful login. Since this is fundamentally different than the mobile implementation, it also means that special code is needed to handle it.

If your application is distributed in a web context, it is worth considering using `current` for an improved user experience.

### General Strategy

When using `popup`, it is very common to have login logic such as the following in the comoponent used for authentication:

```typescript
const signinClicked = async () => {
  try {
    await login();
    router.replace('/');
  } catch (e) {
    loginFailed.value = true;
  }
};
```

With this code:

- The `login()` is called and Auth Connect opens the OIDC authentication provider in a new tab (web) or a secure web view (mobile).
- Auth Connect listens for that tab or secure web view to close.
- If the user successfully logs in:
   - Auth Connect unpacks the data sent back when the tab or secure web view is closed and creates an `AuthResult`.
   - Our `login()` stores the `AuthResult` and resolves.
- If the user cancels the operation, our `login()` rejects with an error.

With `current`, this code will still work like this on mobile. However, on web our app is completely replaced by the
OIDC authentication provider's login page. As such, we are no longer awaiting the login and need to use a completely
different mechanism to capture the authentication result when the app restarts.

On web, the flow becomes:

- The `login()` is called and Auth Connect replaces the application with the OIDC authentication provider's login page.
- The user logs in or cancels.
- The application is restarted using the configured `redirectUri`.
- In the case of a successful login, the authentication information will be included in the URL. It will need to be processed by our application.

In our case, the application is using the `/auth-action-complete` route. We can then use the page for that route to perform the following tasks:

- Determine if the application is running on the web.
- If so, call a process that will examine the extra parameters for the URL.
   - If parameters exist, this was a successful login, and the parameters are used to construct an `AuthResult` which is stored in the session vault.
   - If parameters do not exist, this was a logout and the session vault is cleared.

## Let's Code

This tutorial builds upon the application created when doing the [getting started tutorial](getting-started) and converts it from using `popup` to using `current`. If you have the code from when you performed that tutorial, then you are good to go. If you need the code you can make a copy from [our GitHub repository](https://github.com/ionic-enterprise/tutorials-and-demos-vue/tree/main/auth-connect/getting-started).

### The Authentication Composable

<CH.Scrollycoding>

The first thing that needs to be done is to modify the Auth Connect configuration to use `current` mode on the web.
A function is then created that handles the URL parameters when Auth Connect restarts our application after login or logout.

<CH.Code>

```typescript src/composables/authentication.ts focus=11,12,31:41
import { useSession } from '@/composables/session';
import { Capacitor } from '@capacitor/core';
import { Auth0Provider, AuthConnect, AuthResult, ProviderOptions } from '@ionic-enterprise/auth';

const isNative = Capacitor.isNativePlatform();
const provider = new Auth0Provider();
const authOptions: ProviderOptions = {
  audience: 'https://io.ionic.demo.ac',
  clientId: 'yLasZNUGkZ19DGEjTmAITBfGXzqbvd00',
  discoveryUrl: 'https://dev-2uspt-sz.us.auth0.com/.well-known/openid-configuration',
  logoutUrl: isNative ? 'io.ionic.acdemo://auth-action-complete' : 'http://localhost:8100/auth-action-complete',
  redirectUri: isNative ? 'io.ionic.acdemo://auth-action-complete' : 'http://localhost:8100/auth-action-complete',
  scope: 'openid offline_access email picture profile',
};
let authResult: AuthResult | null = null;

const { clearSession, getSession, setSession } = useSession();

const getAuthResult = async (): Promise<AuthResult | null> => {
  return getSession();
};

const saveAuthResult = async (authResult: AuthResult | null): Promise<void> => {
  if (authResult) {
    await setSession(authResult);
  } else {
    await clearSession();
  }
};

const isReady: Promise<void> = AuthConnect.setup({
  platform: isNative ? 'capacitor' : 'web',
  logLevel: 'DEBUG',
  ios: {
    webView: 'private',
  },
  web: {
    uiMode: 'popup',
    authFlow: 'PKCE',
  },
});

export const useAuthentication = () => ({
  isAuthenticated: async (): Promise<boolean> => {
    const authResult = await getAuthResult();
    return !!authResult && (await AuthConnect.isAccessTokenAvailable(authResult));
  },
  login: async (): Promise<void> => {
    await isReady;
    authResult = await AuthConnect.login(provider, authOptions);
    await saveAuthResult(authResult);
  },
  logout: async (): Promise<void> => {
    await isReady;
    const authResult = await getAuthResult();
    if (authResult) {
      await AuthConnect.logout(provider, authResult);
      saveAuthResult(null);
    }
  },
});
```

</CH.Code>

Start by having a look at the current configuration that is used for our `AuthConnect.setup()` call. Note that it is using a `uiMode` of `popup`.

Also note the return URLs. The page(s) accessed by that route is where we need to eventually modify.

---

<CH.Code>

```typescript src/composables/authentication.ts focus=38
import { useSession } from '@/composables/session';
import { Capacitor } from '@capacitor/core';
import { Auth0Provider, AuthConnect, AuthResult, ProviderOptions } from '@ionic-enterprise/auth';

const isNative = Capacitor.isNativePlatform();
const provider = new Auth0Provider();
const authOptions: ProviderOptions = {
  audience: 'https://io.ionic.demo.ac',
  clientId: 'yLasZNUGkZ19DGEjTmAITBfGXzqbvd00',
  discoveryUrl: 'https://dev-2uspt-sz.us.auth0.com/.well-known/openid-configuration',
  logoutUrl: isNative ? 'io.ionic.acdemo://auth-action-complete' : 'http://localhost:8100/auth-action-complete',
  redirectUri: isNative ? 'io.ionic.acdemo://auth-action-complete' : 'http://localhost:8100/auth-action-complete',
  scope: 'openid offline_access email picture profile',
};
let authResult: AuthResult | null = null;

const { clearSession, getSession, setSession } = useSession();

const getAuthResult = async (): Promise<AuthResult | null> => {
  return getSession();
};

const saveAuthResult = async (authResult: AuthResult | null): Promise<void> => {
  if (authResult) {
    await setSession(authResult);
  } else {
    await clearSession();
  }
};

const isReady: Promise<void> = AuthConnect.setup({
  platform: isNative ? 'capacitor' : 'web',
  logLevel: 'DEBUG',
  ios: {
    webView: 'private',
  },
  web: {
    uiMode: 'current',
    authFlow: 'PKCE',
  },
});

export const useAuthentication = () => ({
  isAuthenticated: async (): Promise<boolean> => {
    const authResult = await getAuthResult();
    return !!authResult && (await AuthConnect.isAccessTokenAvailable(authResult));
  },
  login: async (): Promise<void> => {
    await isReady;
    authResult = await AuthConnect.login(provider, authOptions);
    await saveAuthResult(authResult);
  },
  logout: async (): Promise<void> => {
    await isReady;
    const authResult = await getAuthResult();
    if (authResult) {
      await AuthConnect.logout(provider, authResult);
      saveAuthResult(null);
    }
  },
});
```

</CH.Code>

Change the `uiMode` to `current`.

---

<CH.Code>

```typescript src/composables/authentication.ts focus=44:47
import { useSession } from '@/composables/session';
import { Capacitor } from '@capacitor/core';
import { Auth0Provider, AuthConnect, AuthResult, ProviderOptions } from '@ionic-enterprise/auth';

const isNative = Capacitor.isNativePlatform();
const provider = new Auth0Provider();
const authOptions: ProviderOptions = {
  audience: 'https://io.ionic.demo.ac',
  clientId: 'yLasZNUGkZ19DGEjTmAITBfGXzqbvd00',
  discoveryUrl: 'https://dev-2uspt-sz.us.auth0.com/.well-known/openid-configuration',
  logoutUrl: isNative ? 'io.ionic.acdemo://auth-action-complete' : 'http://localhost:8100/auth-action-complete',
  redirectUri: isNative ? 'io.ionic.acdemo://auth-action-complete' : 'http://localhost:8100/auth-action-complete',
  scope: 'openid offline_access email picture profile',
};
let authResult: AuthResult | null = null;

const { clearSession, getSession, setSession } = useSession();

const getAuthResult = async (): Promise<AuthResult | null> => {
  return getSession();
};

const saveAuthResult = async (authResult: AuthResult | null): Promise<void> => {
  if (authResult) {
    await setSession(authResult);
  } else {
    await clearSession();
  }
};

const isReady: Promise<void> = AuthConnect.setup({
  platform: isNative ? 'capacitor' : 'web',
  logLevel: 'DEBUG',
  ios: {
    webView: 'private',
  },
  web: {
    uiMode: 'current',
    authFlow: 'PKCE',
  },
});

export const useAuthentication = () => ({
  handleLoginReturn: async (): Promise<void> => {
    await isReady;
    const params = new URLSearchParams(window.location.search);
  },
  isAuthenticated: async (): Promise<boolean> => {
    const authResult = await getAuthResult();
    return !!authResult && (await AuthConnect.isAccessTokenAvailable(authResult));
  },
  login: async (): Promise<void> => {
    await isReady;
    authResult = await AuthConnect.login(provider, authOptions);
    await saveAuthResult(authResult);
  },
  logout: async (): Promise<void> => {
    await isReady;
    const authResult = await getAuthResult();
    if (authResult) {
      await AuthConnect.logout(provider, authResult);
      saveAuthResult(null);
    }
  },
});
```

</CH.Code>

Since we will be coming back into the app after login, we need a function to handle that. For now, just wait for Auth Connect to be ready, then read the URL search parameters.

---

<CH.Code>

```typescript src/composables/authentication.ts focus=47:53
import { useSession } from '@/composables/session';
import { Capacitor } from '@capacitor/core';
import { Auth0Provider, AuthConnect, AuthResult, ProviderOptions } from '@ionic-enterprise/auth';

const isNative = Capacitor.isNativePlatform();
const provider = new Auth0Provider();
const authOptions: ProviderOptions = {
  audience: 'https://io.ionic.demo.ac',
  clientId: 'yLasZNUGkZ19DGEjTmAITBfGXzqbvd00',
  discoveryUrl: 'https://dev-2uspt-sz.us.auth0.com/.well-known/openid-configuration',
  logoutUrl: isNative ? 'io.ionic.acdemo://auth-action-complete' : 'http://localhost:8100/auth-action-complete',
  redirectUri: isNative ? 'io.ionic.acdemo://auth-action-complete' : 'http://localhost:8100/auth-action-complete',
  scope: 'openid offline_access email picture profile',
};
let authResult: AuthResult | null = null;

const { clearSession, getSession, setSession } = useSession();

const getAuthResult = async (): Promise<AuthResult | null> => {
  return getSession();
};

const saveAuthResult = async (authResult: AuthResult | null): Promise<void> => {
  if (authResult) {
    await setSession(authResult);
  } else {
    await clearSession();
  }
};

const isReady: Promise<void> = AuthConnect.setup({
  platform: isNative ? 'capacitor' : 'web',
  logLevel: 'DEBUG',
  ios: {
    webView: 'private',
  },
  web: {
    uiMode: 'current',
    authFlow: 'PKCE',
  },
});

export const useAuthentication = () => ({
  handleLoginReturn: async (): Promise<void> => {
    await isReady;
    const params = new URLSearchParams(window.location.search);
    if (params.size > 0) {
      const queryEntries = Object.fromEntries(params.entries());
      authResult = await AuthConnect.handleLoginCallback(queryEntries, authOptions);
    } else {
      authResult = null;
    }
    await saveAuthResult(authResult);
  },
  isAuthenticated: async (): Promise<boolean> => {
    const authResult = await getAuthResult();
    return !!authResult && (await AuthConnect.isAccessTokenAvailable(authResult));
  },
  login: async (): Promise<void> => {
    await isReady;
    authResult = await AuthConnect.login(provider, authOptions);
    await saveAuthResult(authResult);
  },
  logout: async (): Promise<void> => {
    await isReady;
    const authResult = await getAuthResult();
    if (authResult) {
      await AuthConnect.logout(provider, authResult);
      saveAuthResult(null);
    }
  },
});
```

</CH.Code>

If search parameters are present, the this is the login returning. We package the data and send it to Auth Connect to process and create an `AuthResult`.

If there are no parameter, we will assume a logout and set the `authResult` to `null`.

Either way, we will save the current `authResult`.

</CH.Scrollycoding>

### Auth Action Completed Page

The Auth Connect configuration for the application redirects back into the application via the `/auth-action-complete` route.
The code needs to determine if we are running in a web context, and if so:

- Handle the authentication.
- Route back to the root page.

<CH.Scrollycoding>

<CH.Code>

```vue src/views/AuthActionCompletePage.vue
<template>
  <ion-content class="main-content">
    <div class="container">
      <ion-spinner name="dots"></ion-spinner>
    </div>
  </ion-content>
</template>

<script setup lang="ts">
import { IonContent, IonSpinner } from '@ionic/vue';
</script>

<style scoped>
.container {
  text-align: center;

  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}
</style>
```

</CH.Code>

The AuthActionCompletePage currently just contains markup to show a spinner. No logic is in place. 

---

<CH.Code>

```vue src/views/AuthActionCompletePage.vue focus=10,13,14
<template>
  <ion-content class="main-content">
    <div class="container">
      <ion-spinner name="dots"></ion-spinner>
    </div>
  </ion-content>
</template>

<script setup lang="ts">
import { Capacitor } from '@capacitor/core';
import { IonContent, IonSpinner } from '@ionic/vue';

if (!Capacitor.isNativePlatform())) {
}
</script>

<style scoped>
.container {
  text-align: center;

  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}
</style>
```

</CH.Code>

Import Capacitor so the page can determine if it is running in a native context or not.

---

<CH.Code>

```vue src/views/AuthActionCompletePage.vue focus=12,15,16
<template>
  <ion-content class="main-content">
    <div class="container">
      <ion-spinner name="dots"></ion-spinner>
    </div>
  </ion-content>
</template>

<script setup lang="ts">
import { Capacitor } from '@capacitor/core';
import { IonContent, IonSpinner } from '@ionic/vue';
import { useAuthentication } from '@/composables/authentication'

if (!Capacitor.isNativePlatform())) {
  const { handleLoginReturn } = useAuthentication();
  handleLoginReturn();
}
</script>

<style scoped>
.container {
  text-align: center;

  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}
</style>
```

</CH.Code>

If the application is not running in a native context, handle the return from the OIDC authentication provider.

---

<CH.Code>

```vue src/views/AuthActionCompletePage.vue focus=11,17,18[22:54]
<template>
  <ion-content class="main-content">
    <div class="container">
      <ion-spinner name="dots"></ion-spinner>
    </div>
  </ion-content>
</template>

<script setup lang="ts">
import { Capacitor } from '@capacitor/core';
import { useRouter } from 'vue-router';
import { IonContent, IonSpinner } from '@ionic/vue';
import { useAuthentication } from '@/composables/authentication'

if (!Capacitor.isNativePlatform())) {
  const { handleLoginReturn } = useAuthentication();
  const router = useRouter();
  handleLoginReturn().then(() => router.replace('/'));
}
</script>

<style scoped>
.container {
  text-align: center;

  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}
</style>
```

</CH.Code>

Once the URL has been handled, redirect to the root page.

</CH.Scrollycoding>

**Note**: for this application, redirecting to the root page is the correct thing to do. In a more complex application,
it may be more appropriate to check various states before determining the route. If so, such logic should be abstracted
into a routing routine.


## Next Steps

If you have not already done so, please see the following tutorials:

- [Refresh the session](refresh-workflow).
- [Protect the routes](protecting-routes).

Happy coding!! 🤓
