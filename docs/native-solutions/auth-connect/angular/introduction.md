---
title: Let's get Coding
sidebar_label: Introduction
sidebar_position: 1
---

## Generate the Application

Before we explore the use of Auth Connect, we need to scaffold an application. In this section, we will generate an `@ionic/angular` tabs based application, perform some basic configuration, and add the `iOS` and `Android` platforms.

<CH.Scrollycoding>

<CH.Code>

```bash Terminal
ionic start getting-started-ac-angular tabs --type=angular-standalone
```

</CH.Code>

Use the Ionic CLI to generate the application.

---

<CH.Code>

```bash Terminal focus=2
ionic start getting-started-ac-angular tabs --type=angular-standalone
cd getting-started-ac-angular
```

</CH.Code>

Change directory into the newly generated project.

---

<CH.Code>

```ts capacitor.config.ts focus=4
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.gettingstartedacangular',
  appName: 'getting-started-ac-angular',
  webDir: 'www',
  server: {
    androidScheme: 'https',
  },
};

export default config;
```

```bash Terminal focus=2
ionic start getting-started-ac-angular tabs --type=angular-standalone
cd getting-started-ac-angular
```

</CH.Code>

In the `capacitor.config.ts` file, change the `appId` to be something unique. The `appId` is used as the [bundle ID](https://developer.apple.com/documentation/appstoreconnectapi/bundle_ids) / [application ID](https://developer.android.com/build/configure-app-module#set-application-id). Therefore it should be a string that unique to your organization and application. We will use `io.ionic.gettingstartedangular` for this application.

It is best to do this before adding the `iOS` and `Android` platforms to ensure they are setup properly from the start.

---

<CH.Code>

```bash Terminal focus=3:5
ionic start getting-started-ac-angular tabs --type=angular-standalone
cd getting-started-ac-angular
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
    "name": "getting-started-ac-angular",
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

---

<CH.Code>

```bash Terminal focus=6
ionic start getting-started-ac-angular tabs --type=angular-standalone
cd getting-started-ac-angular
npm run build
ionic cap add android
ionic cap add ios
ionic g page login
```

</CH.Code>

We are going to update our routes to better conform to what our OIDC provider requires. A typical app has a Login page with a route like `/login` and our OIDC provider expects that we do too. We will get around this by adding a blank login page, which will add `/login` as a route. We will never _actually_ navigate to the page within _this_ app, though a more typical application probably would.

---

<CH.Code>

```html login.page.html
<ion-content></ion-content>
```

</CH.Code>

Since this page _may_ display for a short time in the OIDC provider popup tab, it is best to modify the HTML for it to only contain an `ion-content` tag. Open `src/app/login/login.page.html` and remove everything other than the empty `ion-content`.

</CH.Scrollycoding>

## Install Auth Connect

In order to install Auth Connect, you will need to use `ionic enterprise register` to register your product key. This will create a `.npmrc` file containing the product key.

If you have already performed that step for your production application, you can just copy the `.npmrc` file from your production project. Since this application is for learning purposes only, you don't need to obtain another key.

You can now install Auth Connect and sync the platforms:

```bash Terminal
npm install @ionic-enterprise/auth
npx cap sync
```

## Setup and Initialization

```bash Terminal
ionic generate service core/authentication
```

<CH.Scrollycoding>

<CH.Code>

```typescript authentication.service.ts
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

```typescript authentication.service.ts focus=2,8:10
import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  constructor(platform: Platform) {
    const isNative = platform.is('hybrid');
  }
}
```

</CH.Code>

Auth Connect needs a slightly different configuration between mobile and web, so we need to know in which context we are currently running.

---

<CH.Code>

```typescript authentication.service.ts focus=2,9,13
import { Injectable } from '@angular/core';
import { Auth0Provider } from '@ionic-enterprise/auth';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private provider: Auth0Provider;

  constructor(platform: Platform) {
    const isNative = platform.is('hybrid');
    this.provider = new Auth0Provider();
  }
}
```

</CH.Code>

For this tutorial, we are using Auth0 as the authentication vendor. We need to create an `Auth0Provider` to help Auth Connect with the communication with Auth0.

---

<CH.Code>

```typescript authentication.service.ts focus=2,9,15:23
import { Injectable } from '@angular/core';
import { Auth0Provider, ProviderOptions } from '@ionic-enterprise/auth';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private authOptions: ProviderOptions;
  private provider: Auth0Provider;

  constructor(platform: Platform) {
    const isNative = platform.is('hybrid');
    this.provider = new Auth0Provider();
    this.authOptions = {
      audience: 'https://io.ionic.demo.ac',
      clientId: 'yLasZNUGkZ19DGEjTmAITBfGXzqbvd00',
      discoveryUrl:
        'https://dev-2uspt-sz.us.auth0.com/.well-known/openid-configuration',
      logoutUrl: isNative ? 'msauth://login' : 'http://localhost:8100/login',
      redirectUri: isNative ? 'msauth://login' : 'http://localhost:8100/login',
      scope: 'openid offline_access email picture profile',
    };
  }
}
```

</CH.Code>

Auth Connect needs to know how to communicate with our Authentication vendor. You will likely need to get this information from the team that manages your cloud infrastructure.

---

<CH.Code>

```typescript authentication.service.ts focus=2:6,15,30:40
import { Injectable } from '@angular/core';
import {
  Auth0Provider,
  AuthConnect,
  ProviderOptions,
} from '@ionic-enterprise/auth';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private authOptions: ProviderOptions;
  private provider: Auth0Provider;
  private isReady: Promise<void>;

  constructor(platform: Platform) {
    const isNative = platform.is('hybrid');
    this.provider = new Auth0Provider();
    this.authOptions = {
      audience: 'https://io.ionic.demo.ac',
      clientId: 'yLasZNUGkZ19DGEjTmAITBfGXzqbvd00',
      discoveryUrl:
        'https://dev-2uspt-sz.us.auth0.com/.well-known/openid-configuration',
      logoutUrl: isNative ? 'msauth://login' : 'http://localhost:8100/login',
      redirectUri: isNative ? 'msauth://login' : 'http://localhost:8100/login',
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

We need to perform a one-time setup with AuthConnect. Please refer to the [documentation](https://ionic.io/docs/auth-connect/interfaces/AuthConnectConfig) if you have any questions about the individual properties. We will start here with a simple set up that is good for development.

The promise returned by `AuthConnect.setup()` is stored in our service so we can ensure the setup has completed before we execute code in methods we will add later.

</CH.Scrollycoding>

## Handling the Authentication Flow

Auth Connect is now properly set up and initialized. We can move on to creating the basic log in and log out flow. Within this flow, and `AuthResult` is obtained during log in that represents our authentication session. So long as we have an `AuthResult` object, we have an authentication session. The `AuthResult` is no longer valid after the user logs out.

### Login and Logout

We begin by creating the `login()` and `logout()` methods.

<CH.Scrollycoding>

<CH.Code>

```typescript authentication.service.ts focus=5,15
import { Injectable } from '@angular/core';
import {
  Auth0Provider,
  AuthConnect,
  AuthResult,
  ProviderOptions,
} from '@ionic-enterprise/auth';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private authOptions: ProviderOptions;
  private authResult: AuthResult | null = null;
  private provider: Auth0Provider;
  private isReady: Promise<void>;

  constructor(platform: Platform) {
    // existing constructor code cut for brevity, do not remove in your code
  }
}
```

</CH.Code>

The `AuthConnect.login()` call resolves an `AuthResult` if the operation succeeds. The `AuthResult` contains the auth tokens as well as some other information. This object needs to be passed to almost all other Auth Connect functions. As such, it needs to be saved. We will store it in our service for now.

---

<CH.Code>

```typescript authentication.service.ts focus=23:26
import { Injectable } from '@angular/core';
import {
  Auth0Provider,
  AuthConnect,
  AuthResult,
  ProviderOptions,
} from '@ionic-enterprise/auth';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private authOptions: ProviderOptions;
  private authResult: AuthResult | null = null;
  private provider: Auth0Provider;
  private isReady: Promise<void>;

  constructor(platform: Platform) {
    ...
  }

  public async login(): Promise<void> {
    await this.isReady;
    this.authResult = await AuthConnect.login(this.provider, this.authOptions);
  }
}
```

</CH.Code>

For the `login()`, we need to pass both the `provider` and the `options` we established earlier. Note that we for the `setup()` call to resolve and that we store the result in our session variable.

---

<CH.Code>

```typescript authentication.service.ts focus=28:34
import { Injectable } from '@angular/core';
import {
  Auth0Provider,
  AuthConnect,
  AuthResult,
  ProviderOptions,
} from '@ionic-enterprise/auth';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private authOptions: ProviderOptions;
  private authResult: AuthResult | null = null;
  private provider: Auth0Provider;
  private isReady: Promise<void>;

  constructor(platform: Platform) {
    ...
  }

  public async login(): Promise<void> {
    await this.isReady;
    this.authResult = await AuthConnect.login(this.provider, this.authOptions);
  }

  public async logout(): Promise<void> {
    await this.isReady;
    if (this.authResult) {
        await AuthConnect.logout(this.provider, this.authResult);
        this.authResult = null;
    }
  }
}
```

</CH.Code>

For the `logout()`, we need to pass both the `provider` and the `AuthResult` we established with the `login()`.

</CH.Scrollycoding>

### Hook Up the Login and Logout

We can use the first tab of our application to test the `login()` and `logout()` methods.

<CH.Scrollycoding>
<CH.Code>

```typescript tab1.page.ts
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

```html tab1.page.html
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

```typescript tab1.page.ts focus=4,14
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

```html tab1.page.html
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

Inject our `AuthenticationService`.

---

<CH.Code>

```typescript tab1.page.ts focus=16:22
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

  login() {
    this.authentication.login();
  }

  logout() {
    this.authentication.logout();
  }
}
```

```html tab1.page.html
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

Create `login()` and `logout()` methods that we can bind to in our template.

---

<CH.Code>

```html tab1.page.html focus=14
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

```typescript tab1.page.ts
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

  login() {
    this.authentication.login();
  }

  logout() {
    this.authentication.logout();
  }
}
```

</CH.Code>

The `app-explore-container` component is no longer needed.

---

<CH.Code>

```html tab1.page.html focus=14:15
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

```typescript tab1.page.ts
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

  login() {
    this.authentication.login();
  }

  logout() {
    this.authentication.logout();
  }
}
```

</CH.Code>

Replace it with a couple of buttons.

You can also remove any references to `ExploreContainerComponent` in `tabs1.page.ts`.

</CH.Scrollycoding>

Test this in the web using the following credentials:

- email: `test@ionic.io`
- password: `Ion54321`

At this point if we press the Login button, a tab should open where we can log in using Auth0. This tab will close after we log in. When we press the logout button a tab will briefly open to perform the logout and then automatically close.

Note that if you press the Login button while already logged in the login tag is closed immediately. This is expected behavior.

### Configure the Native Projects

This login and logout are working on the web. Build your application for mobile and try to run them there. You can an emulator or an actual device for this test.

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

The problem is that on mobile we are deep-linking back into our application using `msauth://login`. We have not registered that scheme with the OS so it does not know to deep-link back to our application. We will set that up now.

For Android, modify the `android` section of the `android/app/build.gradle` file to include the `AUTH_URL_SCHEME`:

```groovy app/build.gradle focus=16:18
android {
    namespace "io.ionic.gettingstartedacangular"
    compileSdkVersion rootProject.ext.compileSdkVersion
    defaultConfig {
        applicationId "io.ionic.gettingstartedacangular"
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

For iOS, add a `CFBundleURLTypes` section to the `ios/App/App/Info.plist` file:

```xml App/App/Info.plist  focus=10:18
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>CFBundleDevelopmentRegion</key>
	<string>en</string>
  ...
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

Re-run the application from Xcode and Android Studio. You should now be able to perform the authentication properly on the mobile applications.

## Managing the Authentication Session

### Determine if Authenticated

We can log in and we can log out, but it is hard to tell what our current authentication state is. Let's fix that now.

<CH.Scrollycoding>

<CH.Code>

```typescript authentication.service.ts focus=9,20:21,24:25
import { Injectable } from '@angular/core';
import {
  Auth0Provider,
  AuthConnect,
  AuthResult,
  ProviderOptions,
} from '@ionic-enterprise/auth';
import { Platform } from '@ionic/angular';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private authOptions: ProviderOptions;
  private authResult: AuthResult | null = null;
  private provider: Auth0Provider;
  private isReady: Promise<void>;

  private authenticationChange: BehaviorSubject<boolean>;
  public authenticationChange$: Observable<boolean>;

  constructor(platform: Platform) {
    this.authenticationChange = new BehaviorSubject(false);
    this.authenticationChange$ = this.authenticationChange.asObservable();
    ...
  }

  public async login(): Promise<void> {
    await this.isReady;
    this.authResult = await AuthConnect.login(this.provider, this.authOptions);
  }

  public async logout(): Promise<void> {
    await this.isReady;
    if (this.authResult) {
      await AuthConnect.logout(this.provider, this.authResult);
      this.authResult = null;
    }
  }
}
```

```typescript tab1.page.ts
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

  login() {
    this.authentication.login();
  }

  logout() {
    this.authentication.logout();
  }
}
```

```html tab1.page.html
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

One way to handle this is to create an `Observable` by the use of a [BehaviorSubject](https://rxjs.dev/api/index/class/BehaviorSubject).

---

<CH.Code>

```typescript authentication.service.ts focus=1[22:27],23[35:56],42:46
import { Injectable, NgZone } from '@angular/core';
import {
  Auth0Provider,
  AuthConnect,
  AuthResult,
  ProviderOptions,
} from '@ionic-enterprise/auth';
import { Platform } from '@ionic/angular';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private authOptions: ProviderOptions;
  private authResult: AuthResult | null = null;
  private provider: Auth0Provider;
  private isReady: Promise<void>;

  private authenticationChange: BehaviorSubject<boolean>;
  public authenticationChange$: Observable<boolean>;

  constructor(platform: Platform, private ngZone: NgZone) {
    this.authenticationChange = new BehaviorSubject(false);
    this.authenticationChange$ = this.authenticationChange.asObservable();
    ...
  }

  public async login(): Promise<void> {
    await this.isReady;
    this.authResult = await AuthConnect.login(this.provider, this.authOptions);
  }

  public async logout(): Promise<void> {
    await this.isReady;
    if (this.authResult) {
      await AuthConnect.logout(this.provider, this.authResult);
      this.authResult = null;
    }
  }

  private onAuthChange(isAuthenticated: boolean): void {
    this.ngZone.run(() => {
      this.authenticationChange.next(isAuthenticated);
    });
  }
}
```

</CH.Code>

Emit changes within Angular's `NgZone`.

---

<CH.Code>

```typescript authentication.service.ts focus=32,40
import { Injectable, NgZone } from '@angular/core';
import {
  Auth0Provider,
  AuthConnect,
  AuthResult,
  ProviderOptions,
} from '@ionic-enterprise/auth';
import { Platform } from '@ionic/angular';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private authOptions: ProviderOptions;
  private authResult: AuthResult | null = null;
  private provider: Auth0Provider;
  private isReady: Promise<void>;

  private authenticationChange: BehaviorSubject<boolean>;
  public authenticationChange$: Observable<boolean>;

  constructor(platform: Platform, private ngZone: NgZone) {
    this.authenticationChange = new BehaviorSubject(false);
    this.authenticationChange$ = this.authenticationChange.asObservable();
    ...
  }

  public async login(): Promise<void> {
    await this.isReady;
    this.authResult = await AuthConnect.login(this.provider, this.authOptions);
    this.onAuthChange(!!this.authResult);
  }

  public async logout(): Promise<void> {
    await this.isReady;
    if (this.authResult) {
      await AuthConnect.logout(this.provider, this.authResult);
      this.authResult = null;
      this.onAuthChange(false);
    }
  }

  private onAuthChange(isAuthenticated: boolean): void {
    this.ngZone.run(() => {
      this.authenticationChange.next(isAuthenticated);
    });
  }
}
```

</CH.Code>

Call the emit from the `login()` and `logout()` methods.

---

<CH.Code>

```typescript tab1.page.ts focus=3,14:15
import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { Observable } from 'rxjs';
import { AuthenticationService } from '../core/authentication.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [IonicModule],
})
export class Tab1Page {
  authenticated$: Observable<boolean> =
    this.authentication.authenticationChange$;

  constructor(private authentication: AuthenticationService) {}

  login() {
    this.authentication.login();
  }

  logout() {
    this.authentication.logout();
  }
}
```

</CH.Code>

Use the `authenticationChange$` observable to control which button is shown in `Tab1Page`.

---

<CH.Code>

```typescript tab1.page.ts focus=1,12[13:25]
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { Observable } from 'rxjs';
import { AuthenticationService } from '../core/authentication.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class Tab1Page {
  authenticated$: Observable<boolean> =
    this.authentication.authenticationChange$;

  constructor(private authentication: AuthenticationService) {}

  login() {
    this.authentication.login();
  }

  logout() {
    this.authentication.logout();
  }
}
```

</CH.Code>

Import the `CommonModule` so `ngIf` can be used in the page's template.

---

<CH.Code>

```html tab1.page.html focus=14:20
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

  <ion-button *ngIf="authenticated$ | async; else loggedOut" (click)="logout()"
    >Logout</ion-button
  >

  <ng-template #loggedOut>
    <ion-button (click)="login()">Login</ion-button>
  </ng-template>
</ion-content>
```

</CH.Code>

Render the logout button if the user is authenticated. Render the login button if the user is not authenticated.

</CH.Scrollycoding>

Which button is shown on the `Tab1Page` is now determined by the current authentication state.

### Persist the `AuthResult`

The user can perform login and logout operations, but if the browser is refreshed, the application loses the `AuthResult`. This value needs to be persisted between sessions of the application. To fix this, create a `session` service that uses the [Preferences](https://capacitorjs.com/docs/apis/preferences) plugin to persist the `AuthResult`.

```bash Terminal
npm install @capacitor/preferences
ionic generate service core/session
```

First build out the `SessionService`.

<CH.Scrollycoding>
<CH.Code>

```typescript session.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  constructor() {}
}
```

```typescript authentication.service.ts
import { Injectable, NgZone } from '@angular/core';
import {
  Auth0Provider,
  AuthConnect,
  AuthResult,
  ProviderOptions,
} from '@ionic-enterprise/auth';
import { Platform } from '@ionic/angular';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  // existing declarations cut for brevity, do not remove in your code

  constructor(platform: Platform, private ngZone: NgZone) {
    // existing constructor code cut for brevity, do not remove in your code
  }

  public async login(): Promise<void> {
    await this.isReady;
    this.authResult = await AuthConnect.login(this.provider, this.authOptions);
    this.onAuthChange(!!this.authResult);
  }

  public async logout(): Promise<void> {
    await this.isReady;
    if (this.authResult) {
      await AuthConnect.logout(this.provider, this.authResult);
      this.authResult = null;
      this.onAuthChange(false);
    }
  }

  private onAuthChange(isAuthenticated: boolean): void {
    this.ngZone.run(() => {
      this.authenticationChange.next(isAuthenticated);
    });
  }
}
```

</CH.Code>

The `SessionService` starts with the basic service skeleton.

---

<CH.Code>

```typescript session.service.ts focus=2,3
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

```typescript session.service.ts focus=9:22
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

```typescript authentication.service.ts focus=10,27
import { Injectable, NgZone } from '@angular/core';
import {
  Auth0Provider,
  AuthConnect,
  AuthResult,
  ProviderOptions,
} from '@ionic-enterprise/auth';
import { Platform } from '@ionic/angular';
import { BehaviorSubject, Observable } from 'rxjs';
import { SessionService } from './session.service';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private authOptions: ProviderOptions;
  private authResult: AuthResult | null = null;
  private provider: Auth0Provider;
  private isReady: Promise<void>;

  private authenticationChange: BehaviorSubject<boolean>;
  public authenticationChange$: Observable<boolean>;

  constructor(
    platform: Platform,
    private ngZone: NgZone,
    private session: SessionService
  ) {
    // existing constructor code cut for brevity, do not remove in your code
  }

  public async login(): Promise<void> {
    await this.isReady;
    this.authResult = await AuthConnect.login(this.provider, this.authOptions);
    this.onAuthChange(!!this.authResult);
  }

  public async logout(): Promise<void> {
    await this.isReady;
    if (this.authResult) {
      await AuthConnect.logout(this.provider, this.authResult);
      this.authResult = null;
      this.onAuthChange(false);
    }
  }

  private onAuthChange(isAuthenticated: boolean): void {
    this.ngZone.run(() => {
      this.authenticationChange.next(isAuthenticated);
    });
  }
}
```

</CH.Code>

Inject the `SessionService` into the `AuthenticationService`.

---

<CH.Code>

```typescript authentication.service.ts focus=47:59
import { Injectable, NgZone } from '@angular/core';
import {
  Auth0Provider,
  AuthConnect,
  AuthResult,
  ProviderOptions,
} from '@ionic-enterprise/auth';
import { Platform } from '@ionic/angular';
import { BehaviorSubject, Observable } from 'rxjs';
import { SessionService } from './session.service';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private authOptions: ProviderOptions;
  private authResult: AuthResult | null = null;
  private provider: Auth0Provider;
  private isReady: Promise<void>;

  private authenticationChange: BehaviorSubject<boolean>;
  public authenticationChange$: Observable<boolean>;

  constructor(
    platform: Platform,
    private ngZone: NgZone,
    private session: SessionService
  ) {
    // existing constructor code cut for brevity, do not remove in your code
  }

  public async login(): Promise<void> {
    await this.isReady;
    this.authResult = await AuthConnect.login(this.provider, this.authOptions);
    this.onAuthChange(!!this.authResult);
  }

  public async logout(): Promise<void> {
    await this.isReady;
    if (this.authResult) {
      await AuthConnect.logout(this.provider, this.authResult);
      this.authResult = null;
      this.onAuthChange(false);
    }
  }

  private async getAuthResult(): Promise<AuthResult | null> {
    await this.isReady;
    return this.session.getSession();
  }

  private async saveAuthResult(authResult: AuthResult | null): Promise<void> {
    if (authResult) {
      await this.session.setSession(authResult);
    } else {
      await this.session.clear();
    }
    this.onAuthChange(!!authResult);
  }

  private onAuthChange(isAuthenticated: boolean): void {
    this.ngZone.run(() => {
      this.authenticationChange.next(isAuthenticated);
    });
  }
}
```

</CH.Code>

Create methods to get and save the `AuthResult`.

---

<CH.Code>

```typescript authentication.service.ts focus=29:31,36:37,42:46
import { Injectable, NgZone } from '@angular/core';
import {
  Auth0Provider,
  AuthConnect,
  AuthResult,
  ProviderOptions,
} from '@ionic-enterprise/auth';
import { Platform } from '@ionic/angular';
import { BehaviorSubject, Observable } from 'rxjs';
import { SessionService } from './session.service';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private authOptions: ProviderOptions;
  private provider: Auth0Provider;
  private isReady: Promise<void>;

  private authenticationChange: BehaviorSubject<boolean>;
  public authenticationChange$: Observable<boolean>;

  constructor(
    platform: Platform,
    private ngZone: NgZone,
    private session: SessionService
  ) {
    // existing constructor code cut for brevity, do not remove in your code
    this.getAuthResult().then((authResult) => {
      this.onAuthChange(!!authResult);
    });
  }

  public async login(): Promise<void> {
    await this.isReady;
    const authResult = await AuthConnect.login(this.provider, this.authOptions);
    this.saveAuthResult(authResult);
  }

  public async logout(): Promise<void> {
    await this.isReady;
    const authResult = await this.getAuthResult();
    if (authResult) {
      await AuthConnect.logout(this.provider, authResult);
      this.saveAuthResult(null);
    }
  }

  private async getAuthResult(): Promise<AuthResult | null> {
    await this.isReady;
    return this.session.getSession();
  }

  private async saveAuthResult(authResult: AuthResult | null): Promise<void> {
    if (authResult) {
      await this.session.setSession(authResult);
    } else {
      await this.session.clear();
    }
    this.onAuthChange(!!authResult);
  }

  private onAuthChange(isAuthenticated: boolean): void {
    this.ngZone.run(() => {
      this.authenticationChange.next(isAuthenticated);
    });
  }
}
```

</CH.Code>

Use the new methods in instead of the `authResult` class property, which can be removed now. In the `constructor()`, use a call to `getAuthResult()` to initialize the `authenticationChange$` observable based on the value that is saved.

</CH.Scrollycoding>

If the user logs in and refreshes the browser or restart the application the authentication state is preserved.

## Next Steps

Explore the specific topics that are of interest to you at this time. This application is used as the foundation to build upon as those topics are explored.
