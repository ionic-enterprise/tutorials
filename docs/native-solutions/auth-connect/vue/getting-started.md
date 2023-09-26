---
title: Getting Started with Auth Connect
sidebar_label: Getting Started
sidebar_position: 1
---

## Generate the Application

Before we explore the use of Auth Connect, we need to scaffold an application. In this section, we will generate an `@ionic/vue` tabs based application, perform some basic configuration, and add the `iOS` and `Android` platforms.

<CH.Scrollycoding>

<CH.Code>

```bash Terminal
ionic start getting-started-ac tabs --type=vue
```

</CH.Code>

Use the Ionic CLI to generate the application.

---

<CH.Code>

```bash Terminal focus=2
ionic start getting-started-ac tabs --type=vue
cd getting-started-ac
```

</CH.Code>

Change directory into the newly generated project.

---

<CH.Code>

```ts capacitor.config.ts focus=4
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.gettingstartedac',
  appName: 'getting-started-ac',
  webDir: 'www',
  server: {
    androidScheme: 'https',
  },
};

export default config;
```

</CH.Code>

Change the `appId` to be something unique. The `appId` is used as the [bundle ID](https://developer.apple.com/documentation/appstoreconnectapi/bundle_ids) / [application ID](https://developer.android.com/build/configure-app-module#set-application-id). Therefore it should be a string that is unique to your organization and application. We will use `io.ionic.gettingstartedac` for this application.

It is best to do this before adding the `iOS` and `Android` platforms to ensure they are setup properly from the start.

---

<CH.Code>

```bash Terminal focus=3:5
ionic start getting-started-ac tabs --type=vue
cd getting-started-ac
npm run build
ionic cap add android
ionic cap add ios
```

</CH.Code>

Build the application and install the platforms.

---

<CH.Code>

```json package.json focus=8
{
  "name": "getting-started-ac",
  "version": "0.0.1",
  "author": "Ionic Framework",
  "homepage": "https://ionicframework.com/",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build && cap sync",
    "preview": "vite preview",
    "test:e2e": "cypress run",
    "test:unit": "vitest",
    "lint": "eslint"
  },
  ...
}
```

</CH.Code>

We should do a `cap sync` with each build. This ensures our native projects remain up to date. Change the scripts in `package.json` to do this.

---

<CH.Code>

```typescript vite.config.ts focus=14:16
import legacy from '@vitejs/plugin-legacy';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), legacy()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 8100,
  },
  test: {
    globals: true,
    environment: 'jsdom',
  },
});
```

</CH.Code>

Modify the `vite.config.ts` file to ensure that the development server (`npm run dev`) uses port `8100`.

</CH.Scrollycoding>

## Install Auth Connect

In order to install Auth Connect, you will need to use `ionic enterprise register` to register your product key. This will create a `.npmrc` file containing the product key.

If you have already performed that step for your production application, you can just copy the `.npmrc` file from your production project. Since this application is for learning purposes only, you don't need to obtain another key.

You can now install Auth Connect and sync the platforms:

```bash Terminal
npm install @ionic-enterprise/auth
npx cap sync
```

## Create the `Authentication` Composable

All interaction with Auth Connect will be abstracted into an `Authentication` Composable. Create a `src/composables` directory. Then create a `src/composables/authentication.ts` file containing the shell of our composable.

<CH.Code>

```typescript authentication.ts
export const useAuthentication = () => ({});
```

</CH.Code>

### Setup and Initialization

Before we use Auth Connect, we need to make sure that it is properly set up and initialized.

<CH.Scrollycoding>

<CH.Code>

```typescript authentication.ts
export const useAuthentication = () => ({});
```

</CH.Code>

We will build the composable up to perform the setup and initialization required by Auth Connect.

---

<CH.Code>

```typescript authentication.ts focus=1,3
import { isPlatform } from '@ionic/vue';

const isNative = isPlatform('hybrid');

export const useAuthentication = () => ({});
```

</CH.Code>

Auth Connect needs a slightly different configuration between mobile and web, so we need to know in which context we are currently running.

---

<CH.Code>

```typescript authentication.ts focus=1,5
import { Auth0Provider } from '@ionic-enterprise/auth';
import { isPlatform } from '@ionic/vue';

const isNative = isPlatform('hybrid');
const provider = new Auth0Provider();

export const useAuthentication = () => ({});
```

</CH.Code>

For this tutorial, we are using Auth0 as the authentication vendor. We need to create an `Auth0Provider` to help Auth Connect with the communication with Auth0.

---

<CH.Code>

```typescript authentication.ts focus=1[25:39],7:19
import { Auth0Provider, ProviderOptions } from '@ionic-enterprise/auth';
import { isPlatform } from '@ionic/vue';

const isNative = isPlatform('hybrid');
const provider = new Auth0Provider();

const authOptions: ProviderOptions = {
  audience: 'https://io.ionic.demo.ac',
  clientId: 'yLasZNUGkZ19DGEjTmAITBfGXzqbvd00',
  discoveryUrl:
    'https://dev-2uspt-sz.us.auth0.com/.well-known/openid-configuration',
  logoutUrl: isNative
    ? 'msauth://auth-action-complete'
    : 'http://localhost:8100/auth-action-complete',
  redirectUri: isNative
    ? 'msauth://auth-action-complete'
    : 'http://localhost:8100/auth-action-complete',
  scope: 'openid offline_access email picture profile',
};

export const useAuthentication = () => ({});
```

</CH.Code>

Auth Connect needs to know how to communicate with our authentication vendor. You will likely need to get this information from the team that manages your cloud infrastructure.

---

<CH.Code>

```typescript authentication.ts focus=3,25:35
import {
  Auth0Provider,
  AuthConnect,
  ProviderOptions,
} from '@ionic-enterprise/auth';
import { isPlatform } from '@ionic/vue';

const isNative = isPlatform('hybrid');
const provider = new Auth0Provider();

const authOptions: ProviderOptions = {
  audience: 'https://io.ionic.demo.ac',
  clientId: 'yLasZNUGkZ19DGEjTmAITBfGXzqbvd00',
  discoveryUrl:
    'https://dev-2uspt-sz.us.auth0.com/.well-known/openid-configuration',
  logoutUrl: isNative
    ? 'msauth://auth-action-complete'
    : 'http://localhost:8100/auth-action-complete',
  redirectUri: isNative
    ? 'msauth://auth-action-complete'
    : 'http://localhost:8100/auth-action-complete',
  scope: 'openid offline_access email picture profile',
};

const isReady: Promise<void> = AuthConnect.setup({
  platform: isNative ? 'capacitor' : 'web',
  logLevel: 'DEBUG',
  ios: {
    webView: 'private',
  },
  web: {
    uiMode: 'popup',
    authFlow: 'implicit',
  },
});

export const useAuthentication = () => ({});
```

</CH.Code>

We need to perform a one-time setup with Auth Connect. Please refer to the [documentation](https://ionic.io/docs/auth-connect/interfaces/AuthConnectConfig) if you have any questions about the individual properties. We will start here with a simple set up that is good for development.

The promise returned by `AuthConnect.setup()` is stored in our composable so we can ensure the setup has completed before we execute code in functions we will add later.

</CH.Scrollycoding>

### Create the `auth-action-complete` Page

Note that the `logoutUrl` and `redirectUri` properties are using the `/auth-action-complete` route. Create a page for the route. The page does not have to do much. We will just display a spinner in case someone sees it momentarily.

<CH.Code>

```vue AuthActionCompletePage.vue
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

Be sure to add the route in the router setup.

<CH.Code rows={10}>

```typescript router/index.ts focus=32:35
import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import TabsPage from '../views/TabsPage.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/tabs/tab1',
  },
  {
    path: '/tabs/',
    component: TabsPage,
    children: [
      {
        path: '',
        redirect: '/tabs/tab1',
      },
      {
        path: 'tab1',
        component: () => import('@/views/Tab1Page.vue'),
      },
      {
        path: 'tab2',
        component: () => import('@/views/Tab2Page.vue'),
      },
      {
        path: 'tab3',
        component: () => import('@/views/Tab3Page.vue'),
      },
    ],
  },
  {
    path: '/auth-action-complete',
    component: () => import('@/views/AuthActionCompletePage.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
```

</CH.Code>

## Handling the Authentication Flow

Auth Connect is now properly set up and initialized. We can move on to creating the basic log in and log out flow. Within this flow, an `AuthResult` is obtained during log in that represents our authentication session. So long as we have an `AuthResult` object, we have an authentication session. The `AuthResult` is no longer valid after the user logs out.

### Login and Logout

We begin by creating the `login()` and `logout()` functions.

<CH.Scrollycoding>

<CH.Code>

```typescript authentication.ts focus=4,11
import {
  Auth0Provider,
  AuthConnect,
  AuthResult,
  ProviderOptions,
} from '@ionic-enterprise/auth';
import { isPlatform } from '@ionic/vue';

const isNative = isPlatform('hybrid');
const provider = new Auth0Provider();
let authResult: AuthResult | null = null;

const authOptions: ProviderOptions = {
  audience: 'https://io.ionic.demo.ac',
  clientId: 'yLasZNUGkZ19DGEjTmAITBfGXzqbvd00',
  discoveryUrl:
    'https://dev-2uspt-sz.us.auth0.com/.well-known/openid-configuration',
  logoutUrl: isNative
    ? 'msauth://auth-action-complete'
    : 'http://localhost:8100/auth-action-complete',
  redirectUri: isNative
    ? 'msauth://auth-action-complete'
    : 'http://localhost:8100/auth-action-complete',
  scope: 'openid offline_access email picture profile',
};

const isReady: Promise<void> = AuthConnect.setup({
  platform: isNative ? 'capacitor' : 'web',
  logLevel: 'DEBUG',
  ios: {
    webView: 'private',
  },
  web: {
    uiMode: 'popup',
    authFlow: 'implicit',
  },
});

export const useAuthentication = () => ({});
```

</CH.Code>

The `AuthConnect.login()` call resolves an `AuthResult` if the operation succeeds. The `AuthResult` contains the auth tokens as well as some other information. This object needs to be passed to almost all other Auth Connect functions. As such, it needs to be saved. We will store it in our authentication composable for now.

---

<CH.Code>

```typescript authentication.ts focus=40:43
import {
  Auth0Provider,
  AuthConnect,
  AuthResult,
  ProviderOptions,
} from '@ionic-enterprise/auth';
import { isPlatform } from '@ionic/vue';

const isNative = isPlatform('hybrid');
const provider = new Auth0Provider();
let authResult: AuthResult | null = null;

const authOptions: ProviderOptions = {
  audience: 'https://io.ionic.demo.ac',
  clientId: 'yLasZNUGkZ19DGEjTmAITBfGXzqbvd00',
  discoveryUrl:
    'https://dev-2uspt-sz.us.auth0.com/.well-known/openid-configuration',
  logoutUrl: isNative
    ? 'msauth://auth-action-complete'
    : 'http://localhost:8100/auth-action-complete',
  redirectUri: isNative
    ? 'msauth://auth-action-complete'
    : 'http://localhost:8100/auth-action-complete',
  scope: 'openid offline_access email picture profile',
};

const isReady: Promise<void> = AuthConnect.setup({
  platform: isNative ? 'capacitor' : 'web',
  logLevel: 'DEBUG',
  ios: {
    webView: 'private',
  },
  web: {
    uiMode: 'popup',
    authFlow: 'implicit',
  },
});

export const useAuthentication = () => ({
  login: async (): Promise<void> => {
    await isReady;
    authResult = await AuthConnect.login(provider, authOptions);
  },
});
```

</CH.Code>

For the `login()`, we need to pass both the `provider` and the `options` we established earlier. Note that we wait for the `setup()` call to resolve and that we store the result in our session variable.

---

<CH.Code>

```typescript authentication.ts focus=44:50
import {
  Auth0Provider,
  AuthConnect,
  AuthResult,
  ProviderOptions,
} from '@ionic-enterprise/auth';
import { isPlatform } from '@ionic/vue';

const isNative = isPlatform('hybrid');
const provider = new Auth0Provider();
let authResult: AuthResult | null = null;

const authOptions: ProviderOptions = {
  audience: 'https://io.ionic.demo.ac',
  clientId: 'yLasZNUGkZ19DGEjTmAITBfGXzqbvd00',
  discoveryUrl:
    'https://dev-2uspt-sz.us.auth0.com/.well-known/openid-configuration',
  logoutUrl: isNative
    ? 'msauth://auth-action-complete'
    : 'http://localhost:8100/auth-action-complete',
  redirectUri: isNative
    ? 'msauth://auth-action-complete'
    : 'http://localhost:8100/auth-action-complete',
  scope: 'openid offline_access email picture profile',
};

const isReady: Promise<void> = AuthConnect.setup({
  platform: isNative ? 'capacitor' : 'web',
  logLevel: 'DEBUG',
  ios: {
    webView: 'private',
  },
  web: {
    uiMode: 'popup',
    authFlow: 'implicit',
  },
});

export const useAuthentication = () => ({
  login: async (): Promise<void> => {
    await isReady;
    authResult = await AuthConnect.login(provider, authOptions);
  },
  logout: async (): Promise<void> => {
    await isReady;
    if (authResult) {
      await AuthConnect.logout(provider, authResult);
      authResult = null;
    }
  },
});
```

</CH.Code>

For the `logout()`, when calling Auth Connect we need to pass the `provider` as well as the `AuthResult` we established with the `login()`.

</CH.Scrollycoding>

### Hook Up the Login and Logout

We can use the first tab of our application to test the `login()` and `logout()` functions.

<CH.Scrollycoding>
<CH.Code>

```vue Tab1Page.vue
<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Tab 1</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Tab 1</ion-title>
        </ion-toolbar>
      </ion-header>

      <ExploreContainer name="Tab 1 page" />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
} from '@ionic/vue';
import ExploreContainer from '@/components/ExploreContainer.vue';
</script>
```

</CH.Code>

Currently, the `Tab1Page` contains the default skeleton code.

---

<CH.Code>

```vue Tab1Page.vue focus=29,31
<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Tab 1</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Tab 1</ion-title>
        </ion-toolbar>
      </ion-header>

      <ExploreContainer name="Tab 1 page" />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
} from '@ionic/vue';
import ExploreContainer from '@/components/ExploreContainer.vue';
import { useAuthentication } from '@/composables/authentication';

const { login, logout } = useAuthentication();
</script>
```

</CH.Code>

Import our the `useAuthentication` composable and destructure the `login()` and `logout()` functions.

---

<CH.Code>

```vue Tab1Page.vue focus=33:39
<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Tab 1</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Tab 1</ion-title>
        </ion-toolbar>
      </ion-header>

      <ExploreContainer name="Tab 1 page" />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
} from '@ionic/vue';
import ExploreContainer from '@/components/ExploreContainer.vue';
import { useAuthentication } from '@/composables/authentication';

const { login, logout } = useAuthentication();

const loginClicked = async (): Promise<void> => {
  await login();
};

const logoutClicked = async (): Promise<void> => {
  await logout();
};
</script>
```

</CH.Code>

Create `loginClicked()` and `logoutClicked()` functions that we can bind to in our template.

---

<CH.Code>

```vue Tab1Page.vue focus=15,16,23
<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Tab 1</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Tab 1</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-button @click="loginClicked">Login</ion-button>
      <ion-button @click="logoutClicked">Logout</ion-button>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonButton,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
} from '@ionic/vue';
import { useAuthentication } from '@/composables/authentication';

const { login, logout } = useAuthentication();

const loginClicked = async (): Promise<void> => {
  await login();
};

const logoutClicked = async (): Promise<void> => {
  await logout();
};
</script>
```

</CH.Code>

Replace the `ExploreContainer` with login and logout buttons.

</CH.Scrollycoding>

Test this in the web using the following credentials:

- email: `test@ionic.io`
- password: `Ion54321`

At this point if we press the Login button, a tab should open where we can log in using Auth0. This tab will close after we log in. When we press the logout button a tab will briefly open to perform the logout and then automatically close.

Note that if you press the Login button while already logged in the login tab is closed immediately. This is expected behavior.

### Configure the Native Projects

Login and logout are working in your web browser. Build your application for mobile and try to run them there. You can use an emulator or an actual device for this test.

```bash Terminal
npm run build
npx cap open android
npx cap open ios
```

On Android, you get an error like this one:

```
Manifest merger failed : Attribute data@scheme at AndroidManifest.xml requires a placeholder substitution but no value for <AUTH_URL_SCHEME> is provided.
```

On iOS, the application runs, but you get an invalid URL error after successfully logging in on Auth0.

The problem is that on mobile we are deep-linking back into our application using `msauth://auth-action-complete`. We have not registered that scheme with the OS so it does not know to deep-link back to our application. We will set that up now.

For Android, modify the `android` section of the `android/app/build.gradle` file to include the `AUTH_URL_SCHEME`:

<CH.Code rows={10}>

```groovy app/build.gradle focus=18:20
apply plugin: 'com.android.application'

android {
    namespace "io.ionic.gettingstartedac"
    compileSdkVersion rootProject.ext.compileSdkVersion
    defaultConfig {
        applicationId "io.ionic.gettingstartedac"
        minSdkVersion rootProject.ext.minSdkVersion
        targetSdkVersion rootProject.ext.targetSdkVersion
        versionCode 1
        versionName "1.0"
        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
        aaptOptions {
             // Files and dirs to omit from the packaged assets dir, modified to accommodate modern web apps.
             // Default: https://android.googlesource.com/platform/frameworks/base/+/282e181b58cf72b6ca770dc7ca5f91f135444502/tools/aapt/AaptAssets.cpp#61
            ignoreAssetsPattern '!.svn:!.git:!.ds_store:!*.scc:.*:!CVS:!thumbs.db:!picasa.ini:!*~'
        }
        manifestPlaceholders = [
            'AUTH_URL_SCHEME': 'msauth'
        ]
    }
    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

</CH.Code>

For iOS, add a `CFBundleURLTypes` section to the `ios/App/App/Info.plist` file:

<CH.Code rows={10}>

```xml App/App/Info.plist  focus=48:56
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>CFBundleDevelopmentRegion</key>
    <string>en</string>
    <key>CFBundleDisplayName</key>
    <string>getting-started-ac</string>
    <key>CFBundleExecutable</key>
    <string>$(EXECUTABLE_NAME)</string>
    <key>CFBundleIdentifier</key>
    <string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>
    <key>CFBundleInfoDictionaryVersion</key>
    <string>6.0</string>
    <key>CFBundleName</key>
    <string>$(PRODUCT_NAME)</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>$(MARKETING_VERSION)</string>
    <key>CFBundleVersion</key>
    <string>$(CURRENT_PROJECT_VERSION)</string>
    <key>LSRequiresIPhoneOS</key>
    <true/>
    <key>UILaunchStoryboardName</key>
    <string>LaunchScreen</string>
    <key>UIMainStoryboardFile</key>
    <string>Main</string>
    <key>UIRequiredDeviceCapabilities</key>
    <array>
      <string>armv7</string>
    </array>
    <key>UISupportedInterfaceOrientations</key>
    <array>
      <string>UIInterfaceOrientationPortrait</string>
      <string>UIInterfaceOrientationLandscapeLeft</string>
      <string>UIInterfaceOrientationLandscapeRight</string>
    </array>
    <key>UISupportedInterfaceOrientations~ipad</key>
    <array>
      <string>UIInterfaceOrientationPortrait</string>
      <string>UIInterfaceOrientationPortraitUpsideDown</string>
      <string>UIInterfaceOrientationLandscapeLeft</string>
      <string>UIInterfaceOrientationLandscapeRight</string>
    </array>
    <key>UIViewControllerBasedStatusBarAppearance</key>
    <true/>
    <key>CFBundleURLTypes</key>
    <array>
      <dict>
        <key>CFBundleURLSchemes</key>
        <array>
          <string>msauth</string>
        </array>
      </dict>
    </array>
  </dict>
</plist>
```

</CH.Code>

Re-run the application from Xcode and Android Studio. You should now be able to perform the authentication properly on the mobile applications.

## Managing the Authentication Session

### Determine if Authenticated

We can log in and we can log out, but it is hard to tell what our current authentication state is. Let's fix that now.

<CH.Scrollycoding>

<CH.Code>

```typescript authentication.ts focus=39:41
import {
  Auth0Provider,
  AuthConnect,
  AuthResult,
  ProviderOptions,
} from '@ionic-enterprise/auth';
import { isPlatform } from '@ionic/vue';

const isNative = isPlatform('hybrid');
const provider = new Auth0Provider();
const authOptions: ProviderOptions = {
  audience: 'https://io.ionic.demo.ac',
  clientId: 'yLasZNUGkZ19DGEjTmAITBfGXzqbvd00',
  discoveryUrl:
    'https://dev-2uspt-sz.us.auth0.com/.well-known/openid-configuration',
  logoutUrl: isNative
    ? 'msauth://auth-action-complete'
    : 'http://localhost:8100/auth-action-complete',
  redirectUri: isNative
    ? 'msauth://auth-action-complete'
    : 'http://localhost:8100/auth-action-complete',
  scope: 'openid offline_access email picture profile',
};
let authResult: AuthResult | null = null;

const isReady: Promise<void> = AuthConnect.setup({
  platform: isNative ? 'capacitor' : 'web',
  logLevel: 'DEBUG',
  ios: {
    webView: 'private',
  },
  web: {
    uiMode: 'popup',
    authFlow: 'implicit',
  },
});

export const useAuthentication = () => ({
  isAuthenticated: (): boolean => {
    return !!authResult;
  },
  login: async (): Promise<void> => {
    await isReady;
    authResult = await AuthConnect.login(provider, authOptions);
  },
  logout: async (): Promise<void> => {
    await isReady;
    if (authResult) {
      await AuthConnect.logout(provider, authResult);
      authResult = null;
    }
  },
});
```

```vue Tab1Page.vue
<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Tab 1</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Tab 1</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-button @click="loginClicked">Login</ion-button>
      <ion-button @click="logoutClicked">Logout</ion-button>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonButton,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
} from '@ionic/vue';
import { useAuthentication } from '@/composables/authentication';

const { login, logout } = useAuthentication();

const loginClicked = async (): Promise<void> => {
  await login();
};

const logoutClicked = async (): Promise<void> => {
  await logout();
};
</script>
```

</CH.Code>

If we have an `AuthResult` we will assume that we are authenticated. The authentication session _could_ be expired or otherwise invalid, but we will work on handling that in other tutorials.

---

<CH.Code>

```vue Tab1Page.vue focus=31,34
<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Tab 1</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Tab 1</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-button @click="loginClicked">Login</ion-button>
      <ion-button @click="logoutClicked">Logout</ion-button>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonButton,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
} from '@ionic/vue';
import { useAuthentication } from '@/composables/authentication';
import { ref } from 'vue';

const { login, logout } = useAuthentication();
const authenticated = ref<boolean>();

const loginClicked = async (): Promise<void> => {
  await login();
};

const logoutClicked = async (): Promise<void> => {
  await logout();
};
</script>
```

</CH.Code>

Create an `authenticated` value for the `Tab1Page`.

---

<CH.Code>

```vue Tab1Page.vue focus=33[9:23],36:38,42,47,50
<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Tab 1</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Tab 1</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-button @click="loginClicked">Login</ion-button>
      <ion-button @click="logoutClicked">Logout</ion-button>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonButton,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
} from '@ionic/vue';
import { useAuthentication } from '@/composables/authentication';
import { ref } from 'vue';

const { isAuthenticated, login, logout } = useAuthentication();
const authenticated = ref<boolean>();

const checkAuthentication = (): void => {
  authenticated.value = isAuthenticated();
};

const loginClicked = async (): Promise<void> => {
  await login();
  checkAuthentication();
};

const logoutClicked = async (): Promise<void> => {
  await logout();
  checkAuthentication();
};

checkAuthentication();
</script>
```

</CH.Code>

Check if we are authenticated when the page is page is created as well as after a login or logout operation.

---

<CH.Code>

```vue Tab1Page.vue focus=15:18
<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Tab 1</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Tab 1</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-button v-if="authenticated" @click="logoutClicked"
        >Logout</ion-button
      >
      <ion-button v-else @click="loginClicked">Login</ion-button>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonButton,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
} from '@ionic/vue';
import { useAuthentication } from '@/composables/authentication';
import { ref } from 'vue';

const { isAuthenticated, login, logout } = useAuthentication();
const authenticated = ref<boolean>();

const checkAuthentication = (): void => {
  authenticated.value = isAuthenticated();
};

const loginClicked = async (): Promise<void> => {
  await login();
  checkAuthentication();
};

const logoutClicked = async (): Promise<void> => {
  await logout();
  checkAuthentication();
};

checkAuthentication();
</script>
```

</CH.Code>

Render the logout button if the user is authenticated. Render the login button if the user is not authenticated.

</CH.Scrollycoding>

Which button is shown on the `Tab1Page` is now determined by the current authentication state.

### Persist the `AuthResult`

The user can perform login and logout operations, but if the browser is refreshed, the application loses the `AuthResult`. This value needs to be persisted between sessions of the application. To fix this, create a `session` composable that uses the [Preferences](https://capacitorjs.com/docs/apis/preferences) plugin to persist the `AuthResult`.

```bash Terminal
npm install @capacitor/preferences
```

Build out the `useSession` composable in `src/composables/session.ts`.

<CH.Scrollycoding>
<CH.Code>

```typescript session.ts
export const useSession = () => ({});
```

```typescript authentication.ts
import {
  Auth0Provider,
  AuthConnect,
  AuthResult,
  ProviderOptions,
} from '@ionic-enterprise/auth';
import { isPlatform } from '@ionic/vue';

const isNative = isPlatform('hybrid');
const provider = new Auth0Provider();
const authOptions: ProviderOptions = {
  audience: 'https://io.ionic.demo.ac',
  clientId: 'yLasZNUGkZ19DGEjTmAITBfGXzqbvd00',
  discoveryUrl:
    'https://dev-2uspt-sz.us.auth0.com/.well-known/openid-configuration',
  logoutUrl: isNative
    ? 'msauth://auth-action-complete'
    : 'http://localhost:8100/auth-action-complete',
  redirectUri: isNative
    ? 'msauth://auth-action-complete'
    : 'http://localhost:8100/auth-action-complete',
  scope: 'openid offline_access email picture profile',
};
let authResult: AuthResult | null = null;

const isReady: Promise<void> = AuthConnect.setup({
  platform: isNative ? 'capacitor' : 'web',
  logLevel: 'DEBUG',
  ios: {
    webView: 'private',
  },
  web: {
    uiMode: 'popup',
    authFlow: 'implicit',
  },
});

export const useAuthentication = () => ({
  isAuthenticated: (): boolean => {
    return !!authResult;
  },
  login: async (): Promise<void> => {
    await isReady;
    authResult = await AuthConnect.login(provider, authOptions);
  },
  logout: async (): Promise<void> => {
    await isReady;
    if (authResult) {
      await AuthConnect.logout(provider, authResult);
      authResult = null;
    }
  },
});
```

```vue Tab1Page.vue
<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Tab 1</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Tab 1</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-button v-if="authenticated" @click="logoutClicked"
        >Logout</ion-button
      >
      <ion-button v-else @click="loginClicked">Login</ion-button>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonButton,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
} from '@ionic/vue';
import { useAuthentication } from '@/composables/authentication';
import { ref } from 'vue';

const { isAuthenticated, login, logout } = useAuthentication();
const authenticated = ref<boolean>();

const checkAuthentication = (): void => {
  authenticated.value = isAuthenticated();
};

const loginClicked = async (): Promise<void> => {
  await login();
  checkAuthentication();
};

const logoutClicked = async (): Promise<void> => {
  await logout();
  checkAuthentication();
};

checkAuthentication();
</script>
```

</CH.Code>

The `useSession` functions starts with the basic skeleton.

---

<CH.Code>

```typescript session.ts focus=1,2
import { Preferences } from '@capacitor/preferences';
import { AuthResult } from '@ionic-enterprise/auth';

export const useSession = () => ({});
```

</CH.Code>

Import the `Preferences` and `AuthResult` classes.

---

<CH.Code>

```typescript session.ts focus=4,7:16
import { Preferences } from '@capacitor/preferences';
import { AuthResult } from '@ionic-enterprise/auth';

const key = 'session';

export const useSession = () => ({
  clearSession: (): Promise<void> => {
    return Preferences.remove({ key });
  },
  getSession: async (): Promise<AuthResult | null> => {
    const { value } = await Preferences.get({ key });
    return value ? JSON.parse(value) : null;
  },
  setSession: (value: AuthResult): Promise<void> => {
    return Preferences.set({ key, value: JSON.stringify(value) });
  },
});
```

</CH.Code>

Create functions to get, set, and clear the session.

---

<CH.Code>

```typescript authentication.ts focus=8,27
import {
  Auth0Provider,
  AuthConnect,
  AuthResult,
  ProviderOptions,
} from '@ionic-enterprise/auth';
import { isPlatform } from '@ionic/vue';
import { useSession } from '@/composables/session';

const isNative = isPlatform('hybrid');
const provider = new Auth0Provider();
const authOptions: ProviderOptions = {
  audience: 'https://io.ionic.demo.ac',
  clientId: 'yLasZNUGkZ19DGEjTmAITBfGXzqbvd00',
  discoveryUrl:
    'https://dev-2uspt-sz.us.auth0.com/.well-known/openid-configuration',
  logoutUrl: isNative
    ? 'msauth://auth-action-complete'
    : 'http://localhost:8100/auth-action-complete',
  redirectUri: isNative
    ? 'msauth://auth-action-complete'
    : 'http://localhost:8100/auth-action-complete',
  scope: 'openid offline_access email picture profile',
};
let authResult: AuthResult | null = null;

const { clearSession, getSession, setSession } = useSession();

const isReady: Promise<void> = AuthConnect.setup({
  platform: isNative ? 'capacitor' : 'web',
  logLevel: 'DEBUG',
  ios: {
    webView: 'private',
  },
  web: {
    uiMode: 'popup',
    authFlow: 'implicit',
  },
});

export const useAuthentication = () => ({
  isAuthenticated: (): boolean => {
    return !!authResult;
  },
  login: async (): Promise<void> => {
    await isReady;
    authResult = await AuthConnect.login(provider, authOptions);
  },
  logout: async (): Promise<void> => {
    await isReady;
    if (authResult) {
      await AuthConnect.logout(provider, authResult);
      authResult = null;
    }
  },
});
```

</CH.Code>

Import `useSession` into our `useAuthentication` composable and destructure the `clearSession`, `getSession`, and `setSession` functions from it.

---

<CH.Code>

```typescript authentication.ts focus=29:39
import {
  Auth0Provider,
  AuthConnect,
  AuthResult,
  ProviderOptions,
} from '@ionic-enterprise/auth';
import { isPlatform } from '@ionic/vue';
import { useSession } from '@/composables/session';

const isNative = isPlatform('hybrid');
const provider = new Auth0Provider();
const authOptions: ProviderOptions = {
  audience: 'https://io.ionic.demo.ac',
  clientId: 'yLasZNUGkZ19DGEjTmAITBfGXzqbvd00',
  discoveryUrl:
    'https://dev-2uspt-sz.us.auth0.com/.well-known/openid-configuration',
  logoutUrl: isNative
    ? 'msauth://auth-action-complete'
    : 'http://localhost:8100/auth-action-complete',
  redirectUri: isNative
    ? 'msauth://auth-action-complete'
    : 'http://localhost:8100/auth-action-complete',
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
    authFlow: 'implicit',
  },
});

export const useAuthentication = () => ({
  isAuthenticated: (): boolean => {
    return !!authResult;
  },
  login: async (): Promise<void> => {
    await isReady;
    authResult = await AuthConnect.login(provider, authOptions);
  },
  logout: async (): Promise<void> => {
    await isReady;
    if (authResult) {
      await AuthConnect.logout(provider, authResult);
      authResult = null;
    }
  },
});
```

</CH.Code>

Create functions to get and save the `AuthResult`.

---

<CH.Code>

```typescript authentication.ts focus=53:56,59[5:9],60,64,67
import {
  Auth0Provider,
  AuthConnect,
  AuthResult,
  ProviderOptions,
} from '@ionic-enterprise/auth';
import { isPlatform } from '@ionic/vue';
import { useSession } from '@/composables/session';

const isNative = isPlatform('hybrid');
const provider = new Auth0Provider();
const authOptions: ProviderOptions = {
  audience: 'https://io.ionic.demo.ac',
  clientId: 'yLasZNUGkZ19DGEjTmAITBfGXzqbvd00',
  discoveryUrl:
    'https://dev-2uspt-sz.us.auth0.com/.well-known/openid-configuration',
  logoutUrl: isNative
    ? 'msauth://auth-action-complete'
    : 'http://localhost:8100/auth-action-complete',
  redirectUri: isNative
    ? 'msauth://auth-action-complete'
    : 'http://localhost:8100/auth-action-complete',
  scope: 'openid offline_access email picture profile',
};

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
    authFlow: 'implicit',
  },
});

export const useAuthentication = () => ({
  isAuthenticated: async (): Promise<boolean> => {
    const authResult = await getAuthResult();
    return !!authResult;
  },
  login: async (): Promise<void> => {
    await isReady;
    const authResult = await AuthConnect.login(provider, authOptions);
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

Use the new functions instead of the `authResult` variable, which can be removed now.

---

<CH.Code>

```vue Tab1Page.vue focus=38[29:33,39:51],39[25:29]
<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Tab 1</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Tab 1</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-button v-if="authenticated" @click="logoutClicked"
        >Logout</ion-button
      >
      <ion-button v-else @click="loginClicked">Login</ion-button>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonButton,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
} from '@ionic/vue';
import { useAuthentication } from '@/composables/authentication';
import { ref } from 'vue';

const { isAuthenticated, login, logout } = useAuthentication();
const authenticated = ref<boolean>();

const checkAuthentication = async (): Promise<void> => {
  authenticated.value = await isAuthenticated();
};

const loginClicked = async (): Promise<void> => {
  await login();
  checkAuthentication();
};

const logoutClicked = async (): Promise<void> => {
  await logout();
  checkAuthentication();
};

checkAuthentication();
</script>
```

</CH.Code>

Since `isAuthenticated()` is now `async`, minor adjustments need to be made to the `Tab1Page`. We don't need to await the `checkAuthentication()`. Nothing directly depends on it resolving.

</CH.Scrollycoding>

If the user logs in and refreshes the browser or restarts the application the authentication state is preserved.

## Next Steps

Explore the specific topics that are of interest to you at this time. This application is used as the foundation to build upon as those topics are explored.

Happy coding!! 🤓
