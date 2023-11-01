---
title: Getting Started with Auth Connect
sidebar_label: Getting Started
sidebar_position: 1
---

## Generate the Application

Before we explore the use of Auth Connect, we need to scaffold an application. In this section, we will generate an `@ionic/angular` tabs based application, perform some basic configuration, and add the `iOS` and `Android` platforms.

<CH.Scrollycoding>

<CH.Code>

```bash Terminal
ionic start getting-started-ac tabs --type=angular-standalone
```

</CH.Code>

Use the Ionic CLI to generate the application.

---

<CH.Code>

```bash Terminal focus=2
ionic start getting-started-ac tabs --type=angular-standalone
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
ionic start getting-started-ac tabs --type=angular-standalone
cd getting-started-ac
npm run build
ionic cap add android
ionic cap add ios
```

</CH.Code>

Build the application and install the platforms.

---

<CH.Code>

```json package.json focus=8,9
{
  "name": "getting-started-ac",
  "version": "0.0.1",
  "author": "Ionic Framework",
  "homepage": "https://ionicframework.com/",
  "scripts": {
    "ng": "ng",
    "start": "ng serve --port=8100",
    "build": "ng build && cap sync",
    "watch": "ng build --watch --configuration development",
    "test": "ng test",
    "lint": "ng lint"
  },
  ...
}
```

</CH.Code>

We should do a `cap sync` with each build and ensure that our application is served on port `8100` when we run the development server. Change the scripts in `package.json` to do this.

</CH.Scrollycoding>

## Install Auth Connect

In order to install Auth Connect, you will need to use `ionic enterprise register` to register your product key. This will create a `.npmrc` file containing the product key.

If you have already performed that step for your production application, you can just copy the `.npmrc` file from your production project. Since this application is for learning purposes only, you don't need to obtain another key.

You can now install Auth Connect and sync the platforms:

```bash Terminal
npm install @ionic-enterprise/auth
npx cap sync
```

## Create the `AuthenticationService`

All interaction with Auth Connect will be abstracted into an `AuthenticationService`. Generate that now.

```bash Terminal
ionic generate service core/authentication
```

### Setup and Initialization

Before we use Auth Connect, we need to make sure that it is properly set up and initialized.

<CH.Scrollycoding>

<CH.Code>

```typescript src/app/core/authentication.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  constructor() {}
}
```

</CH.Code>

We will build this service up to perform the setup and initialization required by Auth Connect.

---

<CH.Code>

```typescript src/app/core/authentication.service.ts focus=2,8:10
import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  constructor() {
    const isNative = Capacitor.isNativePlatform();
  }
}
```

</CH.Code>

Auth Connect needs a slightly different configuration between mobile and web, so we need to know in which context we are currently running.

---

<CH.Code>

```typescript src/app/core/authentication.service.ts focus=2,9,13
import { Injectable } from '@angular/core';
import { Auth0Provider } from '@ionic-enterprise/auth';
import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private provider: Auth0Provider;

  constructor() {
    const isNative = Capacitor.isNativePlatform();
    this.provider = new Auth0Provider();
  }
}
```

</CH.Code>

For this tutorial, we are using Auth0 as the authentication vendor. We need to create an `Auth0Provider` to help Auth Connect with the communication with Auth0.

---

<CH.Code>

```typescript src/app/core/authentication.service.ts focus=2,9,15:27
import { Injectable } from '@angular/core';
import { Auth0Provider, ProviderOptions } from '@ionic-enterprise/auth';
import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private authOptions: ProviderOptions;
  private provider: Auth0Provider;

  constructor() {
    const isNative = Capacitor.isNativePlatform();
    this.provider = new Auth0Provider();
    this.authOptions = {
      audience: 'https://io.ionic.demo.ac',
      clientId: 'yLasZNUGkZ19DGEjTmAITBfGXzqbvd00',
      discoveryUrl:
        'https://dev-2uspt-sz.us.auth0.com/.well-known/openid-configuration',
      logoutUrl: isNative
        ? 'io.ionic.acdemo://auth-action-complete'
        : 'http://localhost:8100/auth-action-complete',
      redirectUri: isNative
        ? 'io.ionic.acdemo://auth-action-complete'
        : 'http://localhost:8100/auth-action-complete',
      scope: 'openid offline_access email picture profile',
    };
  }
}
```

</CH.Code>

Auth Connect needs to know how to communicate with our authentication vendor. You will likely need to get this information from the team that manages your cloud infrastructure.

---

<CH.Code>

```typescript src/app/core/authentication.service.ts focus=2:6,15,34:44
import { Injectable } from '@angular/core';
import {
  Auth0Provider,
  AuthConnect,
  ProviderOptions,
} from '@ionic-enterprise/auth';
import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private authOptions: ProviderOptions;
  private provider: Auth0Provider;
  private isReady: Promise<void>;

  constructor() {
    const isNative = Capacitor.isNativePlatform();
    this.provider = new Auth0Provider();
    this.authOptions = {
      audience: 'https://io.ionic.demo.ac',
      clientId: 'yLasZNUGkZ19DGEjTmAITBfGXzqbvd00',
      discoveryUrl:
        'https://dev-2uspt-sz.us.auth0.com/.well-known/openid-configuration',
      logoutUrl: isNative
        ? 'io.ionic.acdemo://auth-action-complete'
        : 'http://localhost:8100/auth-action-complete',
      redirectUri: isNative
        ? 'io.ionic.acdemo://auth-action-complete'
        : 'http://localhost:8100/auth-action-complete',
      scope: 'openid offline_access email picture profile',
    };

    this.isReady = AuthConnect.setup({
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
  }
}
```

</CH.Code>

We need to perform a one-time setup with Auth Connect. Please refer to the [documentation](https://ionic.io/docs/auth-connect/interfaces/AuthConnectConfig) if you have any questions about the individual properties. We will start here with a simple set up that is good for development.

The promise returned by `AuthConnect.setup()` is stored in our service so we can ensure the setup has completed before we execute code in methods we will add later.

</CH.Scrollycoding>

### Create the `auth-action-complete` Page

Note that the `logoutUrl` and `redirectUri` properties are using the `/auth-action-complete` route. Generate a page for the route.

<CH.Code>

```bash terminal
ionic generate page auth-action-complete
```

</CH.Code>

This page does not need to do anything. When running on the web, the authentication provider will navigate to this route within the OIDC authentication tab. We can just show a blank page.

<CH.Code>

```html src/app/auth-action-complete/auth-action-complete.page.html
<ion-content></ion-content>
```

</CH.Code>

## Handling the Authentication Flow

Auth Connect is now properly set up and initialized. We can move on to creating the basic log in and log out flow. Within this flow, an `AuthResult` is obtained during log in that represents our authentication session. So long as we have an `AuthResult` object, we have an authentication session. The `AuthResult` is no longer valid after the user logs out.

### Login and Logout

We begin by creating the `login()` and `logout()` methods.

<CH.Scrollycoding>

<CH.Code>

```typescript src/app/core/authentication.service.ts focus=5,15
import { Injectable } from '@angular/core';
import {
  Auth0Provider,
  AuthConnect,
  AuthResult,
  ProviderOptions,
} from '@ionic-enterprise/auth';
import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private authOptions: ProviderOptions;
  private authResult: AuthResult | null = null;
  private provider: Auth0Provider;
  private isReady: Promise<void>;

  constructor() {
    // existing constructor code cut for brevity, do not remove in your code
  }
}
```

</CH.Code>

The `AuthConnect.login()` call resolves an `AuthResult` if the operation succeeds. The `AuthResult` contains the auth tokens as well as some other information. This object needs to be passed to almost all other Auth Connect functions. As such, it needs to be saved. We will store it in our service for now.

---

<CH.Code>

```typescript src/app/core/authentication.service.ts focus=23:26
import { Injectable } from '@angular/core';
import {
  Auth0Provider,
  AuthConnect,
  AuthResult,
  ProviderOptions,
} from '@ionic-enterprise/auth';
import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private authOptions: ProviderOptions;
  private authResult: AuthResult | null = null;
  private provider: Auth0Provider;
  private isReady: Promise<void>;

  constructor() {
    ...
  }

  async login(): Promise<void> {
    await this.isReady;
    this.authResult = await AuthConnect.login(this.provider, this.authOptions);
  }
}
```

</CH.Code>

For the `login()`, we need to pass both the `provider` and the `options` we established earlier. Note that we wait for the `setup()` call to resolve and that we store the result in our session variable.

---

<CH.Code>

```typescript src/app/core/authentication.service.ts focus=28:34
import { Injectable } from '@angular/core';
import {
  Auth0Provider,
  AuthConnect,
  AuthResult,
  ProviderOptions,
} from '@ionic-enterprise/auth';
import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private authOptions: ProviderOptions;
  private authResult: AuthResult | null = null;
  private provider: Auth0Provider;
  private isReady: Promise<void>;

  constructor() {
    ...
  }

  async login(): Promise<void> {
    await this.isReady;
    this.authResult = await AuthConnect.login(this.provider, this.authOptions);
  }

  async logout(): Promise<void> {
    await this.isReady;
    if (this.authResult) {
        await AuthConnect.logout(this.provider, this.authResult);
        this.authResult = null;
    }
  }
}
```

</CH.Code>

For the `logout()`, when we call Auth Connect we need to pass the `provider` as well as the `AuthResult` we established with the `login()`.

</CH.Scrollycoding>

### Hook Up the Login and Logout

We can use the first tab of our application to test the `login()` and `logout()` methods.

<CH.Scrollycoding>
<CH.Code>

```typescript src/app/tab1/tab1.page.ts
import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [IonicModule, ExploreContainerComponent],
})
export class Tab1Page {
  constructor() {}
}
```

```html src/app/tab1/tab1.page.html
<ion-header [translucent]="true">
  <ion-toolbar>
    <ion-title> Tab 1 </ion-title>
  </ion-toolbar>
</ion-header>

<ion-content [fullscreen]="true">
  <ion-header collapse="condense">
    <ion-toolbar>
      <ion-title size="large">Tab 1</ion-title>
    </ion-toolbar>
  </ion-header>

  <app-explore-container name="Tab 1 page"></app-explore-container>
</ion-content>
```

</CH.Code>

Currently, the `Tab1Page` contains the default skeleton code.

---

<CH.Code>

```typescript src/app/tab1/tab1.page.ts focus=4,14
import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { AuthenticationService } from '../core/authentication.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [IonicModule, ExploreContainerComponent],
})
export class Tab1Page {
  constructor(private authentication: AuthenticationService) {}
}
```

</CH.Code>

Inject our `AuthenticationService`.

---

<CH.Code>

```typescript src/app/tab1/tab1.page.ts focus=16:22
import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { AuthenticationService } from '../core/authentication.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [IonicModule, ExploreContainerComponent],
})
export class Tab1Page {
  constructor(private authentication: AuthenticationService) {}

  async login(): Promise<void> {
    await this.authentication.login();
  }

  async logout(): Promise<void> {
    await this.authentication.logout();
  }
}
```

</CH.Code>

Create `login()` and `logout()` methods that we can bind to in our template.

---

<CH.Code>

```html src/app/tab1/tab1.page.html focus=14
<ion-header [translucent]="true">
  <ion-toolbar>
    <ion-title> Tab 1 </ion-title>
  </ion-toolbar>
</ion-header>

<ion-content [fullscreen]="true">
  <ion-header collapse="condense">
    <ion-toolbar>
      <ion-title size="large">Tab 1</ion-title>
    </ion-toolbar>
  </ion-header>

  <app-explore-container name="Tab 1 page"></app-explore-container>
</ion-content>
```

</CH.Code>

The `app-explore-container` component is no longer needed.

---

<CH.Code>

```html src/app/tab1/tab1.page.html focus=14:15
<ion-header [translucent]="true">
  <ion-toolbar>
    <ion-title> Tab 1 </ion-title>
  </ion-toolbar>
</ion-header>

<ion-content [fullscreen]="true">
  <ion-header collapse="condense">
    <ion-toolbar>
      <ion-title size="large">Tab 1</ion-title>
    </ion-toolbar>
  </ion-header>

  <ion-button (click)="login()">Login</ion-button>
  <ion-button (click)="logout()">Logout</ion-button>
</ion-content>
```

</CH.Code>

Replace it with a couple of buttons.

You can also remove any references to `ExploreContainerComponent` in `tabs1.page.ts`.

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

The problem is that on mobile we are deep-linking back into our application using `io.ionic.acdemo://auth-action-complete`. We have not registered that scheme with the OS so it does not know to deep-link back to our application. We will set that up now.

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
            'AUTH_URL_SCHEME': 'io.ionic.acdemo'
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
          <string>io.ionic.acdemo</string>
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

```typescript src/app/core/authentication.service.ts focus=49:53
import { Injectable } from '@angular/core';
import {
  Auth0Provider,
  AuthConnect,
  AuthResult,
  ProviderOptions,
} from '@ionic-enterprise/auth';
import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private authOptions: ProviderOptions;
  private authResult: AuthResult | null = null;
  private provider: Auth0Provider;
  private isReady: Promise<void>;

  constructor() {
    const isNative = Capacitor.isNativePlatform();
    this.provider = new Auth0Provider();
    this.authOptions = {
      audience: 'https://io.ionic.demo.ac',
      clientId: 'yLasZNUGkZ19DGEjTmAITBfGXzqbvd00',
      discoveryUrl:
        'https://dev-2uspt-sz.us.auth0.com/.well-known/openid-configuration',
      logoutUrl: isNative
        ? 'io.ionic.acdemo://auth-action-complete'
        : 'http://localhost:8100/auth-action-complete',
      redirectUri: isNative
        ? 'io.ionic.acdemo://auth-action-complete'
        : 'http://localhost:8100/auth-action-complete',
      scope: 'openid offline_access email picture profile',
    };

    this.isReady = AuthConnect.setup({
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
  }

  async isAuthenticated(): Promise<boolean> {
    return (
      !!authResult && (await AuthConnect.isAccessTokenAvailable(authResult))
    );
  }

  async login(): Promise<void> {
    await this.isReady;
    this.authResult = await AuthConnect.login(this.provider, this.authOptions);
  }

  async logout(): Promise<void> {
    await this.isReady;
    if (this.authResult) {
      await AuthConnect.logout(this.provider, this.authResult);
      this.authResult = null;
    }
  }
}
```

```typescript src/app/tab1/tab1.page.ts
import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { AuthenticationService } from '../core/authentication.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [IonicModule],
})
export class Tab1Page {
  constructor(private authentication: AuthenticationService) {}

  async login(): Promise<void> {
    await this.authentication.login();
  }

  async logout(): Promise<void> {
    await this.authentication.logout();
  }
}
```

```html src/app/tab1/tab1.page.html
<ion-header [translucent]="true">
  <ion-toolbar>
    <ion-title> Tab 1 </ion-title>
  </ion-toolbar>
</ion-header>

<ion-content [fullscreen]="true">
  <ion-header collapse="condense">
    <ion-toolbar>
      <ion-title size="large">Tab 1</ion-title>
    </ion-toolbar>
  </ion-header>

  <ion-button (click)="login()">Login</ion-button>
  <ion-button (click)="logout()">Logout</ion-button>
</ion-content>
```

</CH.Code>

If we have an `AuthResult` with an access token we assume that we are authenticated. The authentication session _could_ be expired or otherwise invalid, but we will work on handling that in other tutorials.

---

<CH.Code>

```typescript src/app/tab1/tab1.page.ts focus=13,19,24,27:29
import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { AuthenticationService } from '../core/authentication.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [IonicModule],
})
export class Tab1Page {
  authenticated = false;

  constructor(private authentication: AuthenticationService) {}

  async login(): Promise<void> {
    await this.authentication.login();
    await this.checkAuthentication();
  }

  async logout(): Promise<void> {
    await this.authentication.logout();
    await this.checkAuthentication();
  }

  private async checkAuthentication(): Promise<void> {
    this.authenticated = await this.authentication.isAuthenticated();
  }
}
```

</CH.Code>

Create an `authenticated` property in the `Tab1Page` class. Recheck the status after a login and logout actions complete.

---

<CH.Code>

```typescript src/app/tab1/tab1.page.ts focus=1[21:26],12[23:39],17:19
import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { AuthenticationService } from '../core/authentication.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [IonicModule],
})
export class Tab1Page implements OnInit {
  authenticated = false;

  constructor(private authentication: AuthenticationService) {}

  async ngOnInit() {
    await this.checkAuthentication();
  }

  async login(): Promise<void> {
    await this.authentication.login();
    this.checkAuthentication();
  }

  async logout(): Promise<void> {
    await this.authentication.logout();
    this.checkAuthentication();
  }

  private async checkAuthentication(): Private<void> {
    this.authenticated = await this.authentication.isAuthenticated();
  }
}
```

</CH.Code>

To ensure that the value is initialized properly, the page should also check on initialization.

---

<CH.Code>

```typescript src/app/tab1/tab1.page.ts focus=1,11[13:25]
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { AuthenticationService } from '../core/authentication.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class Tab1Page implements OnInit {
  authenticated = false;

  constructor(private authentication: AuthenticationService) {}

  ngOnInit() {
    this.checkAuthentication();
  }

  async login(): Promise<void> {
    await this.authentication.login();
    this.checkAuthentication();
  }

  async logout(): Promise<void> {
    await this.authentication.logout();
    this.checkAuthentication();
  }

  private async checkAuthentication(): Promise<void> {
    this.authenticated = await this.authentication.isAuthenticated();
  }
}
```

</CH.Code>

Import the `CommonModule` so `ngIf` can be used in the page's template.

---

<CH.Code>

```html src/app/tab1/tab1.page.html focus=14:15
<ion-header [translucent]="true">
  <ion-toolbar>
    <ion-title> Tab 1 </ion-title>
  </ion-toolbar>
</ion-header>

<ion-content [fullscreen]="true">
  <ion-header collapse="condense">
    <ion-toolbar>
      <ion-title size="large">Tab 1</ion-title>
    </ion-toolbar>
  </ion-header>

  <ion-button *ngIf="!authenticated" (click)="login()">Login</ion-button>
  <ion-button *ngIf="authenticated" (click)="logout()">Logout</ion-button>
</ion-content>
```

</CH.Code>

Render the logout button if the user is authenticated. Render the login button if the user is not authenticated.

</CH.Scrollycoding>

Which button is shown on the `Tab1Page` is now determined by the current authentication state.

### Persist the `AuthResult`

The user can perform login and logout operations, but if the browser is refreshed, the application loses the `AuthResult`. This value needs to be persisted between sessions of the application. To fix this, create a `session` service that uses the [Preferences](https://capacitorjs.com/docs/apis/preferences) plugin to persist the `AuthResult`. In a production application, we should store the result securely using [Identity Vault](https://ionic.io/docs/identity-vault). However, setting up Identity Vault is beyond the scope of this tutorial.

```bash Terminal
npm install @capacitor/preferences
ionic generate service core/session
```

First build out the `SessionService`.

<CH.Scrollycoding>
<CH.Code>

```typescript src/app/core/session.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  constructor() {}
}
```

```typescript src/app/core/authentication.service.ts
import { Injectable } from '@angular/core';
import {
  Auth0Provider,
  AuthConnect,
  AuthResult,
  ProviderOptions,
} from '@ionic-enterprise/auth';
import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private authOptions: ProviderOptions;
  private authResult: AuthResult | null = null;
  private provider: Auth0Provider;
  private isReady: Promise<void>;

  constructor() {
    // existing constructor code cut for brevity, do not remove in your code
  }

  async isAuthenticated(): Promise<boolean> {
    return (
      !!authResult && (await AuthConnect.isAccessTokenAvailable(authResult))
    );
  }

  async login(): Promise<void> {
    await this.isReady;
    this.authResult = await AuthConnect.login(this.provider, this.authOptions);
  }

  async logout(): Promise<void> {
    await this.isReady;
    if (this.authResult) {
      await AuthConnect.logout(this.provider, this.authResult);
      this.authResult = null;
    }
  }
}
```

</CH.Code>

The `SessionService` starts with the basic service skeleton.

---

<CH.Code>

```typescript src/app/core/session.service.ts focus=2,3
import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { AuthResult } from '@ionic-enterprise/auth';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  constructor() {}
}
```

</CH.Code>

Import the `Preferences` and `AuthResult` classes.

---

<CH.Code>

```typescript src/app/core/session.service.ts focus=9:22
import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { AuthResult } from '@ionic-enterprise/auth';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private key = 'session';

  clear(): Promise<void> {
    return Preferences.remove({ key: this.key });
  }

  async getSession(): Promise<AuthResult | null> {
    const { value } = await Preferences.get({ key: this.key });
    return value ? JSON.parse(value) : null;
  }

  setSession(value: AuthResult): Promise<void> {
    return Preferences.set({ key: this.key, value: JSON.stringify(value) });
  }
}
```

</CH.Code>

Create methods to get, set, and clear the session.

---

<CH.Code>

```typescript src/app/core/authentication.service.ts focus=9,20[35:65]
import { Injectable } from '@angular/core';
import {
  Auth0Provider,
  AuthConnect,
  AuthResult,
  ProviderOptions,
} from '@ionic-enterprise/auth';
import { Capacitor } from '@capacitor/core';
import { SessionService } from './session.service';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private authOptions: ProviderOptions;
  private authResult: AuthResult | null = null;
  private provider: Auth0Provider;
  private isReady: Promise<void>;

  constructor(private session: SessionService) {
    // existing constructor code cut for brevity, do not remove in your code
  }

  async isAuthenticated(): Promise<boolean> {
    return (
      !!authResult && (await AuthConnect.isAccessTokenAvailable(authResult))
    );
  }

  async login(): Promise<void> {
    await this.isReady;
    this.authResult = await AuthConnect.login(this.provider, this.authOptions);
  }

  async logout(): Promise<void> {
    await this.isReady;
    if (this.authResult) {
      await AuthConnect.logout(this.provider, this.authResult);
      this.authResult = null;
    }
  }
}
```

</CH.Code>

Inject the `SessionService` into the `AuthenticationService`.

---

<CH.Code>

```typescript src/app/core/authentication.service.ts focus=43:53
import { Injectable } from '@angular/core';
import {
  Auth0Provider,
  AuthConnect,
  AuthResult,
  ProviderOptions,
} from '@ionic-enterprise/auth';
import { Capacitor } from '@capacitor/core';
import { SessionService } from './session.service';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private authOptions: ProviderOptions;
  private authResult: AuthResult | null = null;
  private provider: Auth0Provider;
  private isReady: Promise<void>;

  constructor(private session: SessionService) {
    // existing constructor code cut for brevity, do not remove in your code
  }

  async isAuthenticated(): Promise<boolean> {
    return (
      !!authResult && (await AuthConnect.isAccessTokenAvailable(authResult))
    );
  }

  async login(): Promise<void> {
    await this.isReady;
    this.authResult = await AuthConnect.login(this.provider, this.authOptions);
  }

  async logout(): Promise<void> {
    await this.isReady;
    if (this.authResult) {
      await AuthConnect.logout(this.provider, this.authResult);
      this.authResult = null;
    }
  }

  private async getAuthResult(): Promise<AuthResult | null> {
    return this.session.getSession();
  }

  private async saveAuthResult(authResult: AuthResult | null): Promise<void> {
    if (authResult) {
      await this.session.setSession(authResult);
    } else {
      await this.session.clear();
    }
  }
}
```

</CH.Code>

Create methods to get and save the `AuthResult`.

---

<CH.Code>

```typescript src/app/core/authentication.service.ts focus=24:27,32:33,38:41
import { Injectable } from '@angular/core';
import {
  Auth0Provider,
  AuthConnect,
  AuthResult,
  ProviderOptions,
} from '@ionic-enterprise/auth';
import { Capacitor } from '@capacitor/core';
import { SessionService } from './session.service';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private authOptions: ProviderOptions;
  private provider: Auth0Provider;
  private isReady: Promise<void>;

  constructor(private session: SessionService) {
    // existing constructor code cut for brevity, do not remove in your code
  }

  async isAuthenticated(): Promise<boolean> {
    const authResult = await this.getAuthResult();
    return (
      !!authResult && (await AuthConnect.isAccessTokenAvailable(authResult))
    );
  }

  async login(): Promise<void> {
    await this.isReady;
    const authResult = await AuthConnect.login(this.provider, this.authOptions);
    this.saveAuthResult(authResult);
  }

  async logout(): Promise<void> {
    await this.isReady;
    const authResult = await this.getAuthResult();
    if (authResult) {
      await AuthConnect.logout(this.provider, authResult);
      this.saveAuthResult(null);
    }
  }

  private async getAuthResult(): Promise<AuthResult | null> {
    return this.session.getSession();
  }

  private async saveAuthResult(authResult: AuthResult | null): Promise<void> {
    if (authResult) {
      await this.session.setSession(authResult);
    } else {
      await this.session.clear();
    }
  }
}
```

</CH.Code>

Use the new methods instead of the `authResult` class property, which can be removed now.

</CH.Scrollycoding>

If the user logs in and refreshes the browser or restarts the application the authentication state is preserved.

## Next Steps

Explore the specific topics that are of interest to you at this time. This application is used as the foundation to build upon as those topics are explored.

Happy coding!! 🤓
