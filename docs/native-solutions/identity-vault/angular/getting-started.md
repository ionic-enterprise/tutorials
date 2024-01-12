---
title: Getting Started with Identity Vault
sidebar_label: Getting Started
sidebar_position: 1
---

## Generate the Application

Before we explore the use of Identity Vault, we need to scaffold an application. In this section, we will generate
a tabs-based `@ionic/angular` application, perform some basic configuration, and add the `iOS` and `Android` platforms.

If you need to refresh your memory on the overall [developer workflow](https://capacitorjs.com/docs/basics/workflow)
for Capacitor, please do so now. However, here is a synopsis of the commands you will use the most while performing
this tutorial:

- `npm start`: Start the development server so the application can be run in the browser.
- `npm run build`: Build the web portion of the application.
- `npm cap sync`: Copy the web app and any new plugins into the native applications.
- `npm cap open android`: Open Android Studio in order to build, run, and debug the application on Android.
- `npm cap open ios`: Open Xcode in order to build, run, and debug the application on iOS.

Let's get started.

<CH.Scrollycoding>

<CH.Code>

```bash Terminal
ionic start iv-getting-started tabs --type=angular-standalone
```

</CH.Code>

Use the Ionic CLI to generate the application.

---

<CH.Code>

```bash Terminal focus=2
ionic start iv-getting-started tabs --type=angular-standalone
cd iv-getting-started
```

</CH.Code>

Change directory into the newly generated project.

---

<CH.Code>

```ts capacitor.config.ts focus=4
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.gettingstartediv',
  appName: 'iv-getting-started',
  webDir: 'www',
  server: {
    androidScheme: 'https',
  },
};

export default config;
```

</CH.Code>

Change the `appId` to be something unique. The `appId` is used as the
[bundle ID](https://developer.apple.com/documentation/appstoreconnectapi/bundle_ids) /
[application ID](https://developer.android.com/build/configure-app-module#set-application-id). Therefore it should
be a string that is unique to your organization and application. We will use `io.ionic.gettingstartediv` for this
application.

It is best to do this before adding the `iOS` and `Android` platforms to ensure they are setup properly from the start.

---

<CH.Code>

```bash Terminal focus=3:5
ionic start iv-getting-started-ac tabs --type=angular-standalone
cd iv-getting-started
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
  "name": "iv-getting-started",
  "version": "0.0.1",
  "author": "Ionic Framework",
  "homepage": "https://ionicframework.com/",
  "scripts": {
    "ng": "ng",
    "start": "ng serve",
    "build": "ng build && cap sync",
    "watch": "ng build --watch --configuration development",
    "test": "ng test",
    "lint": "ng lint"
  },
  ...
}
```

</CH.Code>

We should do a `cap sync` with each build. Change the scripts in `package.json` to do this.

</CH.Scrollycoding>

## Install Identity Vault

In order to install Identity Vault, you will need to use `ionic enterprise register`
[register your product key](https://ionic.io/docs/enterprise-starter/enterprise-key). This will create a `.npmrc` file
containing the product key.

If you have already performed that step for your production application, you can just copy the `.npmrc` file from your
production project. Since this application is for learning purposes only, you don't need to obtain another key.

You can now install Identity Vault and sync the platforms:

```bash Terminal
npm install @ionic-enterprise/identity-vault
npx cap sync
```

## Create the `SessionVaultService`

Our tutorial application will have a single vault that simulates storing our application's authentication session
information. The vault is managed via our `SessionVaultService`. Generate that now.

```bash Terminal
ionic generate service core/session-vault
```

Also create a simple "Vault Factory" class.

```bash Terminal
ionic generate class core/Vault --type factory --skip-tests
```

The purpose of this class is two-fold:

1. It hides the fact that a different vault is used on native vs. browser platforms.
1. It facilitates mocking the vault, which makes unit testing easier.

<CH.Code>

```typescript src/app/core/vault.factory.ts
import { Capacitor } from '@capacitor/core';
import { BrowserVault, Vault } from '@ionic-enterprise/identity-vault';

export class VaultFactory {
  static create(): BrowserVault | Vault {
    return Capacitor.isNativePlatform() ? new Vault() : new BrowserVault();
  }
}
```

**Note:** To avoid confusion, change the name of the generated factory class from `Vault` to `VaultFactory`.

</CH.Code>

### Create and Initialization the Vault

Before we use Identity Vault, we need to make sure that our vault is properly created and initialized. It is
important to note that creation and initialization are different processes. Creation is performed when the service
is constructed and is limited to the creation of a JavaScript object.

The initialization involves communication with the native layer. As such it is asynchronous. Since initialization
needs to complete before we can begin normal operation of the application, we run the initialization using the
[APP_INITIALIZER](https://angular.io/api/core/APP_INITIALIZER) and await its completion.

**Important:** awaiting the completion of initialization in this manner is a best-practice that should always
be followed.

<CH.Scrollycoding>

<CH.Code>

```typescript src/app/core/session-vault.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SessionVaultService {
  constructor() {}
}
```

```typescript src/main.ts
import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter } from '@angular/router';
import {
  IonicRouteStrategy,
  provideIonicAngular,
} from '@ionic/angular/standalone';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes),
  ],
});
```

</CH.Code>

We will build this service up to perform the vault creation and initialization.

---

<CH.Code>

```typescript src/app/core/session-vault.service.ts focus=2,3,9,12
import { Injectable } from '@angular/core';
import { BrowserVault, Vault } from '@ionic-enterprise/identity-vault';
import { VaultFactory } from './vault.factory';

@Injectable({
  providedIn: 'root',
})
export class SessionVaultService {
  private vault: BrowserVault | Vault;

  constructor() {
    this.vault = VaultFactory.create();
  }
}
```

</CH.Code>

Create the vault using our factory class.

---

<CH.Code>

```typescript src/app/core/session-vault.service.ts focus=4,6,20:26
import { Injectable } from '@angular/core';
import {
  BrowserVault,
  DeviceSecurityType,
  Vault,
  VaultType,
} from '@ionic-enterprise/identity-vault';
import { VaultFactory } from './vault.factory';

@Injectable({
  providedIn: 'root',
})
export class SessionVaultService {
  private vault: BrowserVault | Vault;

  constructor() {
    this.vault = VaultFactory.create();
  }

  async initialize(): Promise<void> {
    await this.vault.initialize({
      key: 'io.ionic.gettingstartediv',
      type: VaultType.SecureStorage,
      deviceSecurityType: DeviceSecurityType.None,
    });
  }
}
```

</CH.Code>

Create an `initialize()` method from which we will perform all vault initialization. At this time, the only thing
we need to do is pass a configuration object to our vault. The meaning of the configuration properties will be
explained later.

---

<CH.Code>

```typescript src/main.ts focus=1[10:25],12,18:22,26:31
import { APP_INITIALIZER, enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter } from '@angular/router';
import {
  IonicRouteStrategy,
  provideIonicAngular,
} from '@ionic/angular/standalone';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';
import { SessionVaultService } from './app/core/session-vault.service';

if (environment.production) {
  enableProdMode();
}

const appInitFactory =
  (vault: SessionVaultService): (() => Promise<void>) =>
  async () => {
    await vault.initialize();
  };

bootstrapApplication(AppComponent, {
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: appInitFactory,
      deps: [SessionVaultService],
      multi: true,
    },
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes),
  ],
});
```

</CH.Code>

In `src/main.ts` use an [APP_INITIALIZER](https://angular.io/api/core/APP_INITIALIZER) to make sure our vault is
fully initialized on startup before the `AppComponent` is mounted.

</CH.Scrollycoding>

In this section, we created a vault using the key `io.ionic.gettingstartediv`. Our vault is a "Secure Storage" vault,
which means that the information we store in the vault is encrypted in the keychain / keystore and is only visible to
our application, but the vault is never locked. We will explore other types of vaults later in this tutorial.

### Store a Value

Let's store some data in the vault. Here, we will:

- Define our session information.
- Add a method to `SessionVaultService` to store a session.
- Add a button to `Tab1Page` to store a fake session.

First, let's define the shape of our authentication session data via:

```bash Terminal
ionic generate interface models/Session
```

```typescript src/app/models/session.ts
export interface Session {
  firstName: string;
  lastName: string;
  email: string;
  accessToken: string;
  refreshToken: string;
}
```

We can store multiple items within the vault, each with their own key. For this application, we will store a single
item with the key of `session`. The vault has a `setValue()` method that is used for this purpose. Modify
`src/app/core/session-vault.service.ts` to store the session.

<CH.Code>

```typescript src/app/core/session-value.service.ts focus=9,29:31
import { Injectable } from '@angular/core';
import {
  BrowserVault,
  DeviceSecurityType,
  Vault,
  VaultType,
} from '@ionic-enterprise/identity-vault';
import { VaultFactory } from './vault.factory';
import { Session } from '../models/session';

@Injectable({
  providedIn: 'root',
})
export class SessionVaultService {
  private vault: BrowserVault | Vault;

  constructor() {
    this.vault = VaultFactory.create();
  }

  async initialize(): Promise<void> {
    await this.vault.initialize({
      key: 'io.ionic.gettingstartediv',
      type: VaultType.SecureStorage,
      deviceSecurityType: DeviceSecurityType.None,
    });
  }

  async storeSession(session: Session): Promise<void> {
    this.vault.setValue('session', session);
  }
}
```

</CH.Code>

Notice that we have created a very light wrapper around the vault's `setValue()` method. This is often all that is
required. You may be tempted to just make the `SessionVaultService`'s `vault` property public and then directly use
the Identity Vault methods directly on the vault. It is best-practice, however, to encapsulate the vault in a service
like this one and only expose the functionality that makes sense for your application.

With the "store session" feature properly abstracted, add method properly dd a button to the `Tab1Page` that will
simulate logging in by storing some fake authentication data in the vault.

<CH.Scrollycoding>

<CH.Code>

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

```typescript src/app/tab1/tab1.page.ts
import { Component } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
} from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    ExploreContainerComponent,
  ],
})
export class Tab1Page {
  constructor() {}
}
```

</CH.Code>

We are currently displaying the generic starter "Explore Container" data.

---

<CH.Code>

```html src/app/tab1/tab1.page.html focus=14:20
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

  <ion-list>
    <ion-item>
      <ion-label>
        <ion-button expand="block" (click)="storeSession()">Store</ion-button>
      </ion-label>
    </ion-item>
  </ion-list>
</ion-content>
```

</CH.Code>

Replace the explore container with a list containing a button.

---

<CH.Code>

```typescript src/app/tab1/tab1.page.ts focus=3,6:8,19,22:24
import { Component } from '@angular/core';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [
    IonButton,
    IonContent,
    IonHeader,
    IonItem,
    IonLabel,
    IonList,
    IonTitle,
    IonToolbar,
  ],
})
export class Tab1Page {
  constructor() {}
}
```

</CH.Code>

Import the Ionic components that we added to the page template.

---

<CH.Code>

```typescript src/app/tab1/tab1.page.ts focus=12,31[15:55]
import { Component } from '@angular/core';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { SessionVaultService } from '../core/session-vault.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [
    IonButton,
    IonContent,
    IonHeader,
    IonItem,
    IonLabel,
    IonList,
    IonTitle,
    IonToolbar,
  ],
})
export class Tab1Page {
  constructor(private sessionVault: SessionVaultService) {}
}
```

</CH.Code>

Inject the vault service.

---

<CH.Code>

```typescript src/app/tab1/tab1.page.ts focus=33:41
import { Component } from '@angular/core';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { SessionVaultService } from '../core/session-vault.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [
    IonButton,
    IonContent,
    IonHeader,
    IonItem,
    IonLabel,
    IonList,
    IonTitle,
    IonToolbar,
  ],
})
export class Tab1Page {
  constructor(private sessionVault: SessionVaultService) {}

  async storeSession(): Promise<void> {
    await this.sessionVault.storeSession({
      email: 'test@ionic.io',
      firstName: 'Tessa',
      lastName: 'Testsmith',
      accessToken: '4abf1d79-143c-4b89-b478-19607eb5ce97',
      refreshToken: '565111b6-66c3-4527-9238-6ea2cc017126',
    });
  }
}
```

</CH.Code>

Store some made up test data.

</CH.Scrollycoding>

We have stored data in our vault. The next step is to get the data back out of the vault.

### Get a Value

The first step is to add a method to our `SessionVaultService` that encapsulates getting the session.

<CH.Code rows={8}>

```typescript src/app/core/session-value.service.ts focus=33:35
import { Injectable } from '@angular/core';
import {
  BrowserVault,
  DeviceSecurityType,
  Vault,
  VaultType,
} from '@ionic-enterprise/identity-vault';
import { VaultFactory } from './vault.factory';
import { Session } from '../models/session';

@Injectable({
  providedIn: 'root',
})
export class SessionVaultService {
  private vault: BrowserVault | Vault;

  constructor() {
    this.vault = VaultFactory.create();
  }

  async initialize(): Promise<void> {
    await this.vault.initialize({
      key: 'io.ionic.gettingstartediv',
      type: VaultType.SecureStorage,
      deviceSecurityType: DeviceSecurityType.None,
    });
  }

  async storeSession(session: Session): Promise<void> {
    this.vault.setValue('session', session);
  }

  async getSession(): Promise<Session | null> {
    return this.vault.getValue<Session>('session');
  }
}
```

</CH.Code>

In order to better illustrate the operation of the vault, we will modify the `Tab1Page` to display our session if one
is stored.

<CH.Scrollycoding>

<CH.Code>

```typescript src/app/tab1/tab1.page.ts
import { Component } from '@angular/core';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { SessionVaultService } from '../core/session-vault.service';
import { Session } from '../models/session';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [
    IonButton,
    IonContent,
    IonHeader,
    IonItem,
    IonLabel,
    IonList,
    IonTitle,
    IonToolbar,
  ],
})
export class Tab1Page {
  constructor(private sessionVault: SessionVaultService) {}

  async storeSession(): Promise<void> {
    this.sessionVault.storeSession({
      email: 'test@ionic.io',
      firstName: 'Tessa',
      lastName: 'Testsmith',
      accessToken: '4abf1d79-143c-4b89-b478-19607eb5ce97',
      refreshToken: '565111b6-66c3-4527-9238-6ea2cc017126',
    });
  }
}
```

```typescript src/app/tab1/tab1.page.html
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

  <ion-list>
    <ion-item>
      <ion-label>
        <ion-button expand="block" (click)="storeSession()">Store</ion-button>
      </ion-label>
    </ion-item>
  </ion-list>
</ion-content>
```

</CH.Code>

The `Tab1Page` currently stores the session information.

---

<CH.Code>

```typescript src/app/tab1/tab1.page.ts focus=32
import { Component } from '@angular/core';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { SessionVaultService } from '../core/session-vault.service';
import { Session } from '../models/session';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [
    IonButton,
    IonContent,
    IonHeader,
    IonItem,
    IonLabel,
    IonList,
    IonTitle,
    IonToolbar,
  ],
})
export class Tab1Page {
  session: Session | null = null;

  constructor(private sessionVault: SessionVaultService) {}

  async storeSession(): Promise<void> {
    this.sessionVault.storeSession({
      email: 'test@ionic.io',
      firstName: 'Tessa',
      lastName: 'Testsmith',
      accessToken: '4abf1d79-143c-4b89-b478-19607eb5ce97',
      refreshToken: '565111b6-66c3-4527-9238-6ea2cc017126',
    });
  }
}
```

</CH.Code>

Add a `session` property.

---

<CH.Code>

```typescript src/app/tab1/tab1.page.ts focus=1[19:26],31[23:39],36:38
import { Component, OnInit } from '@angular/core';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { SessionVaultService } from '../core/session-vault.service';
import { Session } from '../models/session';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [
    IonButton,
    IonContent,
    IonHeader,
    IonItem,
    IonLabel,
    IonList,
    IonTitle,
    IonToolbar,
  ],
})
export class Tab1Page implements OnInit {
  session: Session | null = null;

  constructor(private sessionVault: SessionVaultService) {}

  async ngOnInit() {
    this.session = await this.sessionVault.getSession();
  }

  async storeSession(): Promise<void> {
    this.sessionVault.storeSession({
      email: 'test@ionic.io',
      firstName: 'Tessa',
      lastName: 'Testsmith',
      accessToken: '4abf1d79-143c-4b89-b478-19607eb5ce97',
      refreshToken: '565111b6-66c3-4527-9238-6ea2cc017126',
    });
  }
}
```

</CH.Code>

Get the session when the page is initialized.

---

<CH.Code>

```typescript src/app/tab1/tab1.page.ts focus=48
import { Component, OnInit } from '@angular/core';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { SessionVaultService } from '../core/session-vault.service';
import { Session } from '../models/session';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [
    IonButton,
    IonContent,
    IonHeader,
    IonItem,
    IonLabel,
    IonList,
    IonTitle,
    IonToolbar,
  ],
})
export class Tab1Page implements OnInit {
  session: Session | null = null;

  constructor(private sessionVault: SessionVaultService) {}

  async ngOnInit() {
    this.session = await this.sessionVault.getSession();
  }

  async storeSession(): Promise<void> {
    this.sessionVault.storeSession({
      email: 'test@ionic.io',
      firstName: 'Tessa',
      lastName: 'Testsmith',
      accessToken: '4abf1d79-143c-4b89-b478-19607eb5ce97',
      refreshToken: '565111b6-66c3-4527-9238-6ea2cc017126',
    });
    this.session = await this.sessionVault.getSession();
  }
}
```

</CH.Code>

Also get the session immediately after it is stored.

---

<CH.Code>

```typescript src/app/tab1/tab1.page.html focus=20:27
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

  <ion-list>
    <ion-item>
      <ion-label>
        <ion-button expand="block" (click)="storeSession()">Store</ion-button>
      </ion-label>
    </ion-item>
    <ion-item>
      <div>
        <div>{{session?.email}}</div>
        <div>{{session?.firstName}} {{session?.lastName}}</div>
        <div>{{session?.accessToken}}</div>
        <div>{{session?.refreshToken}}</div>
      </div>
    </ion-item>
  </ion-list>
</ion-content>
```

</CH.Code>

In the page's template, add a `div` to display the `session`.

</CH.Scrollycoding>

We now have a way to store and retrieve the session. When you first run the application, the session area will be blank.
When you press the `Store` button you will see the session information on the page. If you restart the application,
you will see the session information.

If you would like to clear the session information at this point, remove the application from your device (physical
or simulated) and re-install it. In the web, you can close the running tab and open new one.

Next we will see how to remove this data from within our application.

### Remove the Session from the Vault

The vault has two different methods that we can use to remove the data:

- `clear`: Clear all of the data stored in the vault and remove the vault from the keystore / keychain.
  - This operation _does not_ require the vault to be unlocked.
  - This operation will remove the existing vault from the keychain / keystore.
  - Subsequent operations on the vault such as storing a new session will not require the vault to be unlocked
    since the vault had been removed.
  - Use this method if your vault stores a single logical entity, even if it uses multiple entries to do so.
- `removeValue`: Clear just the data stored with the specified key.
  - This operation _does_ require the vault to be unlocked.
  - This operation will not remove the existing vault from the keychain / keystore even though the vault may
    be empty.
  - Subsequent operations on the vault such as storing a new session _may_ require the vault to be unlocked
    since the vault had been removed.
  - Use this method if your vault stores multiple logical entities.

**Note:** We will address locking and unlocking a vault later in this tutorial.

Our vault stores session information. Having a single vault that stores _only_ the session information is the
best-practice for this type of data, and it is the practice we are using here. Thus we will use the `clear()`
method to clear the session.

<CH.Code rows={8}>

```typescript src/app/core/session-vault.service.ts focus=37:39
import { Injectable } from '@angular/core';
import {
  BrowserVault,
  DeviceSecurityType,
  Vault,
  VaultType,
} from '@ionic-enterprise/identity-vault';
import { VaultFactory } from './vault.factory';
import { Session } from '../models/session';

@Injectable({
  providedIn: 'root',
})
export class SessionVaultService {
  private vault: BrowserVault | Vault;

  constructor() {
    this.vault = VaultFactory.create();
  }

  async initialize(): Promise<void> {
    await this.vault.initialize({
      key: 'io.ionic.gettingstartediv',
      type: VaultType.SecureStorage,
      deviceSecurityType: DeviceSecurityType.None,
    });
  }

  async storeSession(session: Session): Promise<void> {
    this.vault.setValue('session', session);
  }

  async getSession(): Promise<Session | null> {
    return this.vault.getValue<Session>('session');
  }

  async clearSession(): Promise<void> {
    await this.vault.clear();
  }
}
```

</CH.Code>

Modify `src/app/tab1/tab1.page.ts` and `src/app/tab1/tab1.page.html` to have a "Clear" button.

<CH.Code rows={8}>

```typescript src/app/tab1/tab1.page.ts focus=51:54
import { Component, OnInit } from '@angular/core';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { SessionVaultService } from '../core/session-vault.service';
import { Session } from '../models/session';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [
    IonButton,
    IonContent,
    IonHeader,
    IonItem,
    IonLabel,
    IonList,
    IonTitle,
    IonToolbar,
  ],
})
export class Tab1Page implements OnInit {
  session: Session | null = null;

  constructor(private sessionVault: SessionVaultService) {}

  async ngOnInit() {
    this.session = await this.sessionVault.getSession();
  }

  async storeSession(): Promise<void> {
    this.sessionVault.storeSession({
      email: 'test@ionic.io',
      firstName: 'Tessa',
      lastName: 'Testsmith',
      accessToken: '4abf1d79-143c-4b89-b478-19607eb5ce97',
      refreshToken: '565111b6-66c3-4527-9238-6ea2cc017126',
    });
    this.session = await this.sessionVault.getSession();
  }

  async clear(): Promise<void> {
    await this.sessionVault.clearSession();
    this.session = await this.sessionVault.getSession();
  }
}
```

</CH.Code>

<CH.Code rows={8}>

```html src/app/tab1/tab1.page.html focus=20:24
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

  <ion-list>
    <ion-item>
      <ion-label>
        <ion-button expand="block" (click)="storeSession()">Store</ion-button>
      </ion-label>
    </ion-item>
    <ion-item>
      <ion-label>
        <ion-button expand="block" (click)="clear()">Clear</ion-button>
      </ion-label>
    </ion-item>
    <ion-item>
      <div>
        <div>{{session?.email}}</div>
        <div>{{session?.firstName}} {{session?.lastName}}</div>
        <div>{{session?.accessToken}}</div>
        <div>{{session?.refreshToken}}</div>
      </div>
    </ion-item>
  </ion-list>
</ion-content>
```

</CH.Code>

## Updated the Vault Type

We are currently using a "Secure Storage" vault, but there are several other
[vault types](https://ionic.io/docs/identity-vault/enums/vaulttype). In this section, we will explore the
`DeviceSecurity`, `InMemory`, and `SecureStorage` types.

### Setting the Vault Type

We can use the vault's `updateConfig()` method to change the type of vault that the application is using..

<CH.Scrollycoding>

<CH.Code>

```typescript src/app/core/session-vault.service.ts
import { Injectable } from '@angular/core';
import {
  BrowserVault,
  DeviceSecurityType,
  Vault,
  VaultType,
} from '@ionic-enterprise/identity-vault';
import { Session } from '../models/session';
import { VaultFactory } from './vault.factory';

@Injectable({
  providedIn: 'root',
})
export class SessionVaultService {
  private vault: BrowserVault | Vault;

  constructor() {
    this.vault = VaultFactory.create();
  }

  async initialize(): Promise<void> {
    await this.vault.initialize({
      key: 'io.ionic.gettingstartediv',
      type: VaultType.SecureStorage,
      deviceSecurityType: DeviceSecurityType.None,
    });
  }

  async storeSession(session: Session): Promise<void> {
    this.vault.setValue('session', session);
  }

  async getSession(): Promise<Session | null> {
    return this.vault.getValue<Session>('session');
  }

  async clearSession(): Promise<void> {
    await this.vault.clear();
  }
}
```

</CH.Code>

Here is the `src/app/core/session-vault.service.ts` that we have created thus far.

---

<CH.Code>

```typescript src/app/core/session-vault.service.ts focus=11:14
import { Injectable } from '@angular/core';
import {
  BrowserVault,
  DeviceSecurityType,
  Vault,
  VaultType,
} from '@ionic-enterprise/identity-vault';
import { Session } from '../models/session';
import { VaultFactory } from './vault.factory';

export type UnlockMode =
  | 'BiometricsWithPasscode'
  | 'InMemory'
  | 'SecureStorage';

@Injectable({
  providedIn: 'root',
})
export class SessionVaultService {
  private vault: BrowserVault | Vault;

  constructor() {
    this.vault = VaultFactory.create();
  }

  async initialize(): Promise<void> {
    await this.vault.initialize({
      key: 'io.ionic.gettingstartediv',
      type: VaultType.SecureStorage,
      deviceSecurityType: DeviceSecurityType.None,
    });
  }

  async storeSession(session: Session): Promise<void> {
    this.vault.setValue('session', session);
  }

  async getSession(): Promise<Session | null> {
    return this.vault.getValue<Session>('session');
  }

  async clearSession(): Promise<void> {
    await this.vault.clear();
  }
}
```

</CH.Code>

The `UnlockMode` specifies the logical combinations of settings we wish to support within our application.

---

<CH.Code>

```typescript src/app/core/session-vault.service.ts focus=46
import { Injectable } from '@angular/core';
import {
  BrowserVault,
  DeviceSecurityType,
  Vault,
  VaultType,
} from '@ionic-enterprise/identity-vault';
import { Session } from '../models/session';
import { VaultFactory } from './vault.factory';

export type UnlockMode =
  | 'BiometricsWithPasscode'
  | 'InMemory'
  | 'SecureStorage';

@Injectable({
  providedIn: 'root',
})
export class SessionVaultService {
  private vault: BrowserVault | Vault;

  constructor() {
    this.vault = VaultFactory.create();
  }

  async initialize(): Promise<void> {
    await this.vault.initialize({
      key: 'io.ionic.gettingstartediv',
      type: VaultType.SecureStorage,
      deviceSecurityType: DeviceSecurityType.None,
    });
  }

  async storeSession(session: Session): Promise<void> {
    this.vault.setValue('session', session);
  }

  async getSession(): Promise<Session | null> {
    return this.vault.getValue<Session>('session');
  }

  async clearSession(): Promise<void> {
    await this.vault.clear();
  }

  async updateUnlockMode(mode: UnlockMode): Promise<void> {}
}
```

</CH.Code>

Add an `updateUnlockMode()` method to the class. Take a single argument for the mode.

---

<CH.Code>

```typescript src/app/core/session-vault.service.ts focus=5,47:51
import { Injectable } from '@angular/core';
import {
  BrowserVault,
  DeviceSecurityType,
  IdentityVaultConfig,
  Vault,
  VaultType,
} from '@ionic-enterprise/identity-vault';
import { Session } from '../models/session';
import { VaultFactory } from './vault.factory';

export type UnlockMode =
  | 'BiometricsWithPasscode'
  | 'InMemory'
  | 'SecureStorage';

@Injectable({
  providedIn: 'root',
})
export class SessionVaultService {
  private vault: BrowserVault | Vault;

  constructor() {
    this.vault = VaultFactory.create();
  }

  async initialize(): Promise<void> {
    await this.vault.initialize({
      key: 'io.ionic.gettingstartediv',
      type: VaultType.SecureStorage,
      deviceSecurityType: DeviceSecurityType.None,
    });
  }

  async storeSession(session: Session): Promise<void> {
    this.vault.setValue('session', session);
  }

  async getSession(): Promise<Session | null> {
    return this.vault.getValue<Session>('session');
  }

  async clearSession(): Promise<void> {
    await this.vault.clear();
  }

  async updateUnlockMode(mode: UnlockMode): Promise<void> {
    await this.vault.updateConfig({
      ...(this.vault.config as IdentityVaultConfig),
    });
  }
}
```

</CH.Code>

The vault's `updateConfig()` method takes a full vault configuration object, so pass our current `config`. Cast it
to `IdentityVaultConfig` to signify that we know the value is not `undefined` at this point.

---

<CH.Code>

```typescript src/app/core/session-vault.service.ts focus=48:53,56
import { Injectable } from '@angular/core';
import {
  BrowserVault,
  DeviceSecurityType,
  IdentityVaultConfig,
  Vault,
  VaultType,
} from '@ionic-enterprise/identity-vault';
import { Session } from '../models/session';
import { VaultFactory } from './vault.factory';

export type UnlockMode =
  | 'BiometricsWithPasscode'
  | 'InMemory'
  | 'SecureStorage';

@Injectable({
  providedIn: 'root',
})
export class SessionVaultService {
  private vault: BrowserVault | Vault;

  constructor() {
    this.vault = VaultFactory.create();
  }

  async initialize(): Promise<void> {
    await this.vault.initialize({
      key: 'io.ionic.gettingstartediv',
      type: VaultType.SecureStorage,
      deviceSecurityType: DeviceSecurityType.None,
    });
  }

  async storeSession(session: Session): Promise<void> {
    this.vault.setValue('session', session);
  }

  async getSession(): Promise<Session | null> {
    return this.vault.getValue<Session>('session');
  }

  async clearSession(): Promise<void> {
    await this.vault.clear();
  }

  async updateUnlockMode(mode: UnlockMode): Promise<void> {
    const type =
      mode === 'BiometricsWithPasscode'
        ? VaultType.DeviceSecurity
        : mode === 'InMemory'
        ? VaultType.InMemory
        : VaultType.SecureStorage;
    await this.vault.updateConfig({
      ...(this.vault.config as IdentityVaultConfig),
      type,
    });
  }
}
```

</CH.Code>

Update the `type` based on the specified `mode`.

---

<CH.Code>

```typescript src/app/core/session-vault.service.ts focus=54:57,61
import { Injectable } from '@angular/core';
import {
  BrowserVault,
  DeviceSecurityType,
  IdentityVaultConfig,
  Vault,
  VaultType,
} from '@ionic-enterprise/identity-vault';
import { Session } from '../models/session';
import { VaultFactory } from './vault.factory';

export type UnlockMode =
  | 'BiometricsWithPasscode'
  | 'InMemory'
  | 'SecureStorage';

@Injectable({
  providedIn: 'root',
})
export class SessionVaultService {
  private vault: BrowserVault | Vault;

  constructor() {
    this.vault = VaultFactory.create();
  }

  async initialize(): Promise<void> {
    await this.vault.initialize({
      key: 'io.ionic.gettingstartediv',
      type: VaultType.SecureStorage,
      deviceSecurityType: DeviceSecurityType.None,
    });
  }

  async storeSession(session: Session): Promise<void> {
    this.vault.setValue('session', session);
  }

  async getSession(): Promise<Session | null> {
    return this.vault.getValue<Session>('session');
  }

  async clearSession(): Promise<void> {
    await this.vault.clear();
  }

  async updateUnlockMode(mode: UnlockMode): Promise<void> {
    const type =
      mode === 'BiometricsWithPasscode'
        ? VaultType.DeviceSecurity
        : mode === 'InMemory'
        ? VaultType.InMemory
        : VaultType.SecureStorage;
    const deviceSecurityType =
      type === VaultType.DeviceSecurity
        ? DeviceSecurityType.Both
        : DeviceSecurityType.None;
    await this.vault.updateConfig({
      ...(this.vault.config as IdentityVaultConfig),
      type,
      deviceSecurityType,
    });
  }
}
```

</CH.Code>

Update the `deviceSecurityType` based on the value of the `type`.

</CH.Scrollycoding>

#### Why the `UnlockMode`?

One natural question from above may be "why create an `UnlockMode` type when you can pass in the `VaultType` and
figure things out from there?" The answer to that is that any time you incorporate a third-party library into your
code like this, you should create an "adapter" service that utilizes the library within the domain of your application.

This has two major benefits:

1. It insulates the rest of the application from change. If the next major version of Identity Vault has breaking
   changes that need to be addressed, the only place in the code they need to be addressed is in this service. The
   rest of the code continues to interact with the vault via the interface defined by the service.
1. It reduces vendor tie-in, making it easier to swap to different libraries in the future if need be.

The ultimate goal is for the only modules in the application directly import from `@ionic-enterprise/identity-vault`
to be services like this one that encapsulate operations on a vault.

#### Setting the `deviceSecurityType` Value

The `deviceSecurityType` property only applies when the `type` is set to `DeviceSecurity`. We could use any of the following
`DeviceSecurityType` values:

- `Biometrics`: Use the system's default biometric option to unlock the vault.
- `SystemPasscode`: Use the system's designated system passcode (PIN, Pattern, etc.) to unlock the vault.
- `Both`: Primarily use the biometric hardware to unlock the vault, but use the system passcode as a backup for
  cases where the biometric hardware is not configured or biometric authentication has failed.

For our application, we will just keep it simple and use `Both` when using `DeviceSecurity` vault. This is a very
versatile option and makes the most sense for most applications.

With vault types other than `DeviceSecurity`, always use `DeviceSecurityType.None`.

#### Update the `Tab1Page`

We can now add some buttons to the `Tab1Page` in order to try out the different vault types. Update the
`src/app/tab1/tab1.page.ts` and `src/app/tab1/tab1.page.html` as shown below.

<CH.Code>

```typescript src/app/tab1/tab1.page.ts focus=12[29:40],56:58
import { Component, OnInit } from '@angular/core';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { SessionVaultService, UnlockMode } from '../core/session-vault.service';
import { Session } from '../models/session';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    IonButton,
    IonContent,
    IonHeader,
    IonItem,
    IonLabel,
    IonList,
    IonTitle,
    IonToolbar,
  ],
})
export class Tab1Page implements OnInit {
  session: Session | null = null;

  constructor(private sessionVault: SessionVaultService) {}

  async ngOnInit() {
    this.session = await this.sessionVault.getSession();
  }

  async storeSession(): Promise<void> {
    this.sessionVault.storeSession({
      email: 'test@ionic.io',
      firstName: 'Tessa',
      lastName: 'Testsmith',
      accessToken: '4abf1d79-143c-4b89-b478-19607eb5ce97',
      refreshToken: '565111b6-66c3-4527-9238-6ea2cc017126',
    });
    this.session = await this.sessionVault.getSession();
  }

  async clear(): Promise<void> {
    await this.sessionVault.clearSession();
    this.session = await this.sessionVault.getSession();
  }

  async changeUnlockMode(mode: UnlockMode) {
    await this.sessionVault.updateUnlockMode(mode);
  }
}
```

```html src/app/tab1/tab1.page.html focus=27:56
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

  <ion-list>
    <ion-item>
      <ion-label>
        <ion-button expand="block" (click)="storeSession()">Store</ion-button>
      </ion-label>
    </ion-item>
    <ion-item>
      <ion-label>
        <ion-button expand="block" color="danger" (click)="clear()"
          >Clear</ion-button
        >
      </ion-label>
    </ion-item>
    <ion-item>
      <ion-label>
        <ion-button
          expand="block"
          color="secondary"
          (click)="changeUnlockMode('BiometricsWithPasscode')"
          >Use Biometrics</ion-button
        >
      </ion-label>
    </ion-item>
    <ion-item>
      <ion-label>
        <ion-button
          expand="block"
          color="secondary"
          (click)="changeUnlockMode('InMemory')"
          >Use In Memory</ion-button
        >
      </ion-label>
    </ion-item>
    <ion-item>
      <ion-label>
        <ion-button
          expand="block"
          color="secondary"
          (click)="changeUnlockMode('SecureStorage')"
          >Use Secure Storage</ion-button
        >
      </ion-label>
    </ion-item>
    <ion-item>
      <ion-label>
        <div>
          <div>{{session?.email}}</div>
          <div>{{session?.firstName}} {{session?.lastName}}</div>
          <div>{{session?.accessToken}}</div>
          <div>{{session?.refreshToken}}</div>
        </div>
      </ion-label>
    </ion-item>
  </ion-list>
</ion-content>
```

</CH.Code>

Build the application and run it on a device upon which you have biometrics enabled. Perform the following steps
for each type of vault:

1. Press the "Store" button to put data in the vault.
1. Choose a vault type via one of the "Use" buttons.
1. Close the application (do not just put it in the background, but close it).
1. Restart the application.

You should see the following results:

- "Use Biometrics": On an iPhone with FaceID, this will fail. We will fix that next. On all other devices, however,
  a biometric prompt will be displayed to unlock the vault. The data will be displayed once the vault is unlocked.
- "Use In Memory": The data is no longer set. As the name implies, there is no persistence of this data.
- "Use Secure Storage": The stored data is displayed without unlocking.

### Native Configuration

If you tried the tests above, your app should have crashed upon restarting when using a biometric vault. If you
run `npx cap sync` you will see what is missing.

```
[warn] Configuration required for @ionic-enterprise/identity-vault.
       Add the following to Info.plist:
       <key>NSFaceIDUsageDescription</key>
       <string>Use Face ID to authenticate yourself and login</string>
```

Open the `ios/App/App/Info.plist` file and add the specified configuration. The actual string value can be anything
you want, but the key _must_ be `NSFaceIDUsageDescription`.

<CH.Code rows={6}>

```xml ios/App/App/Info.plist focus=48,49
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>CFBundleDevelopmentRegion</key>
    <string>en</string>
    <key>CFBundleDisplayName</key>
    <string>iv-getting-started</string>
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
    <true />
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
    <true />
    <key>NSFaceIDUsageDescription</key>
    <string>Use Face ID to authenticate yourself and login</string>
  </dict>
</plist>
```

</CH.Code>

Biometrics should work on the iPhone at this point.

## Locking and Unlocking the Vault

Right now, the only way to "lock" the vault is to close the application. In this section we will look at a couple of
other ways to lock the vault as well as ways to unlock it.

### Manually Locking the Vault

In `src/app/core/session-vault.service.ts`, wrap the vault's `lock()` method so we can use it in our `Tab1Page`.

<CH.Code rows={10}>

```typescript src/app/core/session-vault.service.ts focus=44:46
import { Injectable } from '@angular/core';
import {
  BrowserVault,
  DeviceSecurityType,
  IdentityVaultConfig,
  Vault,
  VaultType,
} from '@ionic-enterprise/identity-vault';
import { Session } from '../models/session';
import { VaultFactory } from './vault.factory';

export type UnlockMode = 'BiometricsWithPasscode' | 'InMemory' | 'SecureStorage';

@Injectable({
  providedIn: 'root',
})
export class SessionVaultService {
  private vault: BrowserVault | Vault;

  constructor() {
    this.vault = VaultFactory.create();
  }

  async initialize(): Promise<void> {
    await this.vault.initialize({
      key: 'io.ionic.gettingstartediv',
      type: VaultType.SecureStorage,
      deviceSecurityType: DeviceSecurityType.None,
    });
  }

  async storeSession(session: Session): Promise<void> {
    this.vault.setValue('session', session);
  }

  async getSession(): Promise<Session | null> {
    return this.vault.getValue<Session>('session');
  }

  async clearSession(): Promise<void> {
    await this.vault.clear();
  }

  async lock(): Promise<void> {
    await this.vault.lock();
  }

  async updateUnlockMode(mode: UnlockMode): Promise<void> {
    const type =
      mode === 'BiometricsWithPasscode'
        ? VaultType.DeviceSecurity
        : mode === 'InMemory'
          ? VaultType.InMemory
          : VaultType.SecureStorage;
    const deviceSecurityType = type === VaultType.DeviceSecurity ? DeviceSecurityType.Both : DeviceSecurityType.None;
    await this.vault.updateConfig({
      ...(this.vault.config as IdentityVaultConfig),
      type,
      deviceSecurityType,
    });
  }
```

}

</CH.Code>

Add a lock button in `src/app/tab1/tab1.page.ts` and `src/app/tab1/tab1.page.html`.

<CH.Code rows={8}>

```typescript src/app/tab1/tab1.page.ts focus=60:63
import { Component, OnInit } from '@angular/core';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { SessionVaultService, UnlockMode } from '../core/session-vault.service';
import { Session } from '../models/session';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    IonButton,
    IonContent,
    IonHeader,
    IonItem,
    IonLabel,
    IonList,
    IonTitle,
    IonToolbar,
  ],
})
export class Tab1Page implements OnInit {
  session: Session | null = null;

  constructor(private sessionVault: SessionVaultService) {}

  async ngOnInit() {
    this.session = await this.sessionVault.getSession();
  }

  async storeSession(): Promise<void> {
    this.sessionVault.storeSession({
      email: 'test@ionic.io',
      firstName: 'Tessa',
      lastName: 'Testsmith',
      accessToken: '4abf1d79-143c-4b89-b478-19607eb5ce97',
      refreshToken: '565111b6-66c3-4527-9238-6ea2cc017126',
    });
    this.session = await this.sessionVault.getSession();
  }

  async clear(): Promise<void> {
    await this.sessionVault.clearSession();
    this.session = await this.sessionVault.getSession();
  }

  async changeUnlockMode(mode: UnlockMode) {
    await this.sessionVault.updateUnlockMode(mode);
  }

  async lock(): Promise<void> {
    this.session = null;
    await this.sessionVault.lock();
  }
}
```

</CH.Code>

<CH.Code rows={8}>

```html src/app/tab1/tab1.page.html focus=57:63
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

  <ion-list>
    <ion-item>
      <ion-label>
        <ion-button expand="block" (click)="storeSession()">Store</ion-button>
      </ion-label>
    </ion-item>
    <ion-item>
      <ion-label>
        <ion-button expand="block" color="danger" (click)="clear()"
          >Clear</ion-button
        >
      </ion-label>
    </ion-item>
    <ion-item>
      <ion-label>
        <ion-button
          expand="block"
          color="secondary"
          (click)="changeUnlockMode('BiometricsWithPasscode')"
          >Use Biometrics</ion-button
        >
      </ion-label>
    </ion-item>
    <ion-item>
      <ion-label>
        <ion-button
          expand="block"
          color="secondary"
          (click)="changeUnlockMode('InMemory')"
          >Use In Memory</ion-button
        >
      </ion-label>
    </ion-item>
    <ion-item>
      <ion-label>
        <ion-button
          expand="block"
          color="secondary"
          (click)="changeUnlockMode('SecureStorage')"
          >Use Secure Storage</ion-button
        >
      </ion-label>
    </ion-item>
    <ion-item>
      <ion-label>
        <ion-button expand="block" color="warning" (click)="lock()"
          >Lock</ion-button
        >
      </ion-label>
    </ion-item>
    <ion-item>
      <ion-label>
        <div>
          <div>{{session?.email}}</div>
          <div>{{session?.firstName}} {{session?.lastName}}</div>
          <div>{{session?.accessToken}}</div>
          <div>{{session?.refreshToken}}</div>
        </div>
      </ion-label>
    </ion-item>
  </ion-list>
</ion-content>
```

</CH.Code>

When we press the "Lock" button, the session data is no longer displayed. The actual status of the vault depends on
the last "unlock mode" button pressed prior to locking the vault.

- "Use Biometrics": The vault has been locked and the session data will not be accessible until it is unlocked.
- "Use In Memory": The session data no longer exists.
- "Use In Secure Storage": The session data is in the vault, but is not locked.

### Unlocking the Vault

To verify the behaviors noted above, you need to be able to unlock the vault. To do this you can use the vault's
`unlock()` method or you can perform an operation that requires the vault to be unlocked. When we unlock the vault,
we need to restore the session data in our page, so we can just use our `getSession()` method. When it calls the
vault's `getValue()`, the `getValue()` will attempt to unlock the vault.

Add the following code to `src/app/tab1/tab1.page.ts` and `src/app/tab1/tab1.page.html`:

<CH.Code rows={8}>

```typescript src/app/tab1/tab1.page.ts focus=65:67
import { Component, OnInit } from '@angular/core';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { SessionVaultService, UnlockMode } from '../core/session-vault.service';
import { Session } from '../models/session';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    IonButton,
    IonContent,
    IonHeader,
    IonItem,
    IonLabel,
    IonList,
    IonTitle,
    IonToolbar,
  ],
})
export class Tab1Page implements OnInit {
  session: Session | null = null;

  constructor(private sessionVault: SessionVaultService) {}

  async ngOnInit() {
    this.session = await this.sessionVault.getSession();
  }

  async storeSession(): Promise<void> {
    this.sessionVault.storeSession({
      email: 'test@ionic.io',
      firstName: 'Tessa',
      lastName: 'Testsmith',
      accessToken: '4abf1d79-143c-4b89-b478-19607eb5ce97',
      refreshToken: '565111b6-66c3-4527-9238-6ea2cc017126',
    });
    this.session = await this.sessionVault.getSession();
  }

  async clear(): Promise<void> {
    await this.sessionVault.clearSession();
    this.session = await this.sessionVault.getSession();
  }

  async changeUnlockMode(mode: UnlockMode) {
    await this.sessionVault.updateUnlockMode(mode);
  }

  async lock(): Promise<void> {
    this.session = null;
    await this.sessionVault.lock();
  }

  async unlock(): Promise<void> {
    this.session = await this.sessionVault.getSession();
  }
}
```

</CH.Code>

<CH.Code rows={8}>

```html src/app/tab1/tab1.page.html focus=64:70
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

  <ion-list>
    <ion-item>
      <ion-label>
        <ion-button expand="block" (click)="storeSession()">Store</ion-button>
      </ion-label>
    </ion-item>
    <ion-item>
      <ion-label>
        <ion-button expand="block" color="danger" (click)="clear()"
          >Clear</ion-button
        >
      </ion-label>
    </ion-item>
    <ion-item>
      <ion-label>
        <ion-button
          expand="block"
          color="secondary"
          (click)="changeUnlockMode('BiometricsWithPasscode')"
          >Use Biometrics</ion-button
        >
      </ion-label>
    </ion-item>
    <ion-item>
      <ion-label>
        <ion-button
          expand="block"
          color="secondary"
          (click)="changeUnlockMode('InMemory')"
          >Use In Memory</ion-button
        >
      </ion-label>
    </ion-item>
    <ion-item>
      <ion-label>
        <ion-button
          expand="block"
          color="secondary"
          (click)="changeUnlockMode('SecureStorage')"
          >Use Secure Storage</ion-button
        >
      </ion-label>
    </ion-item>
    <ion-item>
      <ion-label>
        <ion-button expand="block" color="warning" (click)="lock()"
          >Lock</ion-button
        >
      </ion-label>
    </ion-item>
    <ion-item>
      <ion-label>
        <ion-button expand="block" color="warning" (click)="unlock()"
          >Unlock</ion-button
        >
      </ion-label>
    </ion-item>
    <ion-item>
      <ion-label>
        <div>
          <div>{{session?.email}}</div>
          <div>{{session?.firstName}} {{session?.lastName}}</div>
          <div>{{session?.accessToken}}</div>
          <div>{{session?.refreshToken}}</div>
        </div>
      </ion-label>
    </ion-item>
  </ion-list>
</ion-content>
```

</CH.Code>

We can now use the "Lock" and "Unlock" buttons to verify the behavior of each of our unlock modes.

### Locking in the Background

We can manually lock our vault, but it would be nice if the vault locked for us if the application was in the
background for a period of time. We can accomplish this by setting the `lockAfterBackgrounded` value when we
initialize the vault. Here we are setting it to 2000 milliseconds.

<CH.Code rows={10}>

```typescript src/app/core/session-vault.service.ts focus=32
import { Injectable } from '@angular/core';
import {
  BrowserVault,
  DeviceSecurityType,
  IdentityVaultConfig,
  Vault,
  VaultType,
} from '@ionic-enterprise/identity-vault';
import { Session } from '../models/session';
import { VaultFactory } from './vault.factory';

export type UnlockMode =
  | 'BiometricsWithPasscode'
  | 'InMemory'
  | 'SecureStorage';

@Injectable({
  providedIn: 'root',
})
export class SessionVaultService {
  private vault: BrowserVault | Vault;

  constructor() {
    this.vault = VaultFactory.create();
  }

  async initialize(): Promise<void> {
    await this.vault.initialize({
      key: 'io.ionic.gettingstartediv',
      type: VaultType.SecureStorage,
      deviceSecurityType: DeviceSecurityType.None,
      lockAfterBackgrounded: 2000,
    });
  }

  async storeSession(session: Session): Promise<void> {
    this.vault.setValue('session', session);
  }

  async getSession(): Promise<Session | null> {
    return this.vault.getValue<Session>('session');
  }

  async clearSession(): Promise<void> {
    await this.vault.clear();
  }

  async lock(): Promise<void> {
    await this.vault.lock();
  }

  async updateUnlockMode(mode: UnlockMode): Promise<void> {
    const type =
      mode === 'BiometricsWithPasscode'
        ? VaultType.DeviceSecurity
        : mode === 'InMemory'
        ? VaultType.InMemory
        : VaultType.SecureStorage;
    const deviceSecurityType =
      type === VaultType.DeviceSecurity
        ? DeviceSecurityType.Both
        : DeviceSecurityType.None;
    await this.vault.updateConfig({
      ...(this.vault.config as IdentityVaultConfig),
      type,
      deviceSecurityType,
    });
  }
}
```

</CH.Code>

If you now switch the app to use a mode that locks, like Biometrics, and then put the app in the background for two
seconds or more, the vault will lock even though you won't really know it.

One way to deal with this is to an `Observable` in our service and subscribe to it in our `Tab1Page`. We can then
remove the session data from our page when the vault locks.

<CH.Scrollycoding>

<CH.Code>

```typescript src/app/core/session-vault.service.ts
import { Injectable } from '@angular/core';
import {
  BrowserVault,
  DeviceSecurityType,
  IdentityVaultConfig,
  Vault,
  VaultType,
} from '@ionic-enterprise/identity-vault';
import { Session } from '../models/session';
import { VaultFactory } from './vault.factory';

export type UnlockMode =
  | 'BiometricsWithPasscode'
  | 'InMemory'
  | 'SecureStorage';

@Injectable({
  providedIn: 'root',
})
export class SessionVaultService {
  private vault: BrowserVault | Vault;

  constructor() {
    this.vault = VaultFactory.create();
  }

  async initialize(): Promise<void> {
    await this.vault.initialize({
      key: 'io.ionic.gettingstartediv',
      type: VaultType.SecureStorage,
      deviceSecurityType: DeviceSecurityType.None,
      lockAfterBackgrounded: 2000,
    });
  }

  async storeSession(session: Session): Promise<void> {
    this.vault.setValue('session', session);
  }

  async getSession(): Promise<Session | null> {
    return this.vault.getValue<Session>('session');
  }

  async clearSession(): Promise<void> {
    await this.vault.clear();
  }

  async lock(): Promise<void> {
    await this.vault.lock();
  }

  async updateUnlockMode(mode: UnlockMode): Promise<void> {
    const type =
      mode === 'BiometricsWithPasscode'
        ? VaultType.DeviceSecurity
        : mode === 'InMemory'
        ? VaultType.InMemory
        : VaultType.SecureStorage;
    const deviceSecurityType =
      type === VaultType.DeviceSecurity
        ? DeviceSecurityType.Both
        : DeviceSecurityType.None;
    await this.vault.updateConfig({
      ...(this.vault.config as IdentityVaultConfig),
      type,
      deviceSecurityType,
    });
  }
}
```

```typescript src/app/tab1/tab1.page.ts
import { Component, OnInit } from '@angular/core';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { SessionVaultService, UnlockMode } from '../core/session-vault.service';
import { Session } from '../models/session';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    IonButton,
    IonContent,
    IonHeader,
    IonItem,
    IonLabel,
    IonList,
    IonTitle,
    IonToolbar,
  ],
})
export class Tab1Page implements OnInit {
  session: Session | null = null;

  constructor(private sessionVault: SessionVaultService) {}

  async ngOnInit() {
    this.session = await this.sessionVault.getSession();
  }

  async storeSession(): Promise<void> {
    this.sessionVault.storeSession({
      email: 'test@ionic.io',
      firstName: 'Tessa',
      lastName: 'Testsmith',
      accessToken: '4abf1d79-143c-4b89-b478-19607eb5ce97',
      refreshToken: '565111b6-66c3-4527-9238-6ea2cc017126',
    });
    this.session = await this.sessionVault.getSession();
  }

  async clear(): Promise<void> {
    await this.sessionVault.clearSession();
    this.session = await this.sessionVault.getSession();
  }

  async changeUnlockMode(mode: UnlockMode) {
    await this.sessionVault.updateUnlockMode(mode);
  }

  async lock(): Promise<void> {
    this.session = null;
    await this.sessionVault.lock();
  }

  async unlock(): Promise<void> {
    this.session = await this.sessionVault.getSession();
  }
}
```

</CH.Code>

Here are our `SessionVaultService` and `Tab1Page` classes so far.

---

<CH.Code>

```typescript src/app/core/session-vault.service.ts focus=11,23,26:27
import { Injectable } from '@angular/core';
import {
  BrowserVault,
  DeviceSecurityType,
  IdentityVaultConfig,
  Vault,
  VaultType,
} from '@ionic-enterprise/identity-vault';
import { Session } from '../models/session';
import { VaultFactory } from './vault.factory';
import { Observable, Subject } from 'rxjs';

export type UnlockMode =
  | 'BiometricsWithPasscode'
  | 'InMemory'
  | 'SecureStorage';

@Injectable({
  providedIn: 'root',
})
export class SessionVaultService {
  private vault: BrowserVault | Vault;
  private lockedSubject: Subject<boolean>;

  constructor() {
    this.vault = VaultFactory.create();
    this.lockedSubject = new Subject<boolean>();
  }

  get locked$(): Observable<boolean> {
    return this.lockedSubject.asObservable();
  }

  async initialize(): Promise<void> {
    await this.vault.initialize({
      key: 'io.ionic.gettingstartediv',
      type: VaultType.SecureStorage,
      deviceSecurityType: DeviceSecurityType.None,
      lockAfterBackgrounded: 2000,
    });
  }

  async storeSession(session: Session): Promise<void> {
    this.vault.setValue('session', session);
  }

  async getSession(): Promise<Session | null> {
    return this.vault.getValue<Session>('session');
  }

  async clearSession(): Promise<void> {
    await this.vault.clear();
  }

  async lock(): Promise<void> {
    await this.vault.lock();
  }

  async updateUnlockMode(mode: UnlockMode): Promise<void> {
    const type =
      mode === 'BiometricsWithPasscode'
        ? VaultType.DeviceSecurity
        : mode === 'InMemory'
        ? VaultType.InMemory
        : VaultType.SecureStorage;
    const deviceSecurityType =
      type === VaultType.DeviceSecurity
        ? DeviceSecurityType.Both
        : DeviceSecurityType.None;
    await this.vault.updateConfig({
      ...(this.vault.config as IdentityVaultConfig),
      type,
      deviceSecurityType,
    });
  }
}
```

</CH.Code>

Create a private Subject (`lockedSubject`) and expose it publicly as an Observable (`locked$`).

---

<CH.Code>

```typescript src/app/tab1/tab1.page.ts focus=35:37
import { Component, OnInit } from '@angular/core';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { SessionVaultService, UnlockMode } from '../core/session-vault.service';
import { Session } from '../models/session';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    IonButton,
    IonContent,
    IonHeader,
    IonItem,
    IonLabel,
    IonList,
    IonTitle,
    IonToolbar,
  ],
})
export class Tab1Page implements OnInit {
  session: Session | null = null;

  constructor(private sessionVault: SessionVaultService) {
    this.sessionVault.locked$.subscribe(
      (lock) => (this.session = lock ? null : this.session)
    );
  }

  async ngOnInit() {
    this.session = await this.sessionVault.getSession();
  }

  async storeSession(): Promise<void> {
    this.sessionVault.storeSession({
      email: 'test@ionic.io',
      firstName: 'Tessa',
      lastName: 'Testsmith',
      accessToken: '4abf1d79-143c-4b89-b478-19607eb5ce97',
      refreshToken: '565111b6-66c3-4527-9238-6ea2cc017126',
    });
    this.session = await this.sessionVault.getSession();
  }

  async clear(): Promise<void> {
    await this.sessionVault.clearSession();
    this.session = await this.sessionVault.getSession();
  }

  async changeUnlockMode(mode: UnlockMode) {
    await this.sessionVault.updateUnlockMode(mode);
  }

  async lock(): Promise<void> {
    this.session = null;
    await this.sessionVault.lock();
  }

  async unlock(): Promise<void> {
    this.session = await this.sessionVault.getSession();
  }
}
```

</CH.Code>

Subscribe to the Observable in the `Tab1Page` and clear page's session data if the vault locks.

---

<CH.Code>

```typescript src/app/tab1/tab1.page.ts focus=1[21:30],14,32[40:50],33,37[5:21],46:48
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { SessionVaultService, UnlockMode } from '../core/session-vault.service';
import { Session } from '../models/session';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    IonButton,
    IonContent,
    IonHeader,
    IonItem,
    IonLabel,
    IonList,
    IonTitle,
    IonToolbar,
  ],
})
export class Tab1Page implements OnInit, OnDestroy {
  private subscription: Subscription;
  session: Session | null = null;

  constructor(private sessionVault: SessionVaultService) {
    this.subscription = this.sessionVault.locked$.subscribe(
      (lock) => (this.session = lock ? null : this.session)
    );
  }

  async ngOnInit() {
    this.session = await this.sessionVault.getSession();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  async storeSession(): Promise<void> {
    this.sessionVault.storeSession({
      email: 'test@ionic.io',
      firstName: 'Tessa',
      lastName: 'Testsmith',
      accessToken: '4abf1d79-143c-4b89-b478-19607eb5ce97',
      refreshToken: '565111b6-66c3-4527-9238-6ea2cc017126',
    });
    this.session = await this.sessionVault.getSession();
  }

  async clear(): Promise<void> {
    await this.sessionVault.clearSession();
    this.session = await this.sessionVault.getSession();
  }

  async changeUnlockMode(mode: UnlockMode) {
    await this.sessionVault.updateUnlockMode(mode);
  }

  async lock(): Promise<void> {
    this.session = null;
    await this.sessionVault.lock();
  }

  async unlock(): Promise<void> {
    this.session = await this.sessionVault.getSession();
  }
}
```

</CH.Code>

For proper housekeeping, we should save a reference to the subscription so we can unsubscribe when the page is
destroyed.

</CH.Scrollycoding>

## Architectural Considerations

### Construction vs. Initialization

Have a look at the `src/app/core/session-vault.service.ts` file. Notice that it is very intentional about
separating construction and initialization. **This is very important.**

Identity Vault allows you to pass the configuration object via the `new Vault(cfg)` constructor. This, however,
will make asynchronous calls which makes construction indeterminate. This is bad.

Always use a pattern of:

- Construct the vault via `new Vault()` (default constructor, no configuration).
- Pass the configuration to the `vault.initialize(cfg)` function.
- Perform the initialization itself via the APP_INITIALIZER and make sure that the code is properly `await`ing its
  completion.

### Control Unlocking on Startup and Navigation

Our code is currently automatically unlocking the vault upon startup due to the code in `ngOnInit()`. This is OK for
our app, but it could be a problem if we had situations where multiple calls to get data from a locked vault all
happened simultaneously. For example if we have AuthGuards and HTTP Interceptors also trying to access the vault
at the same time. Always make sure you are controlling the vault lock status in such situations to ensure that
only one unlock attempt is being made at a time.

We will see various strategies for this in later tutorials. You can also refer to our
[troubleshooting guide](https://ionic.io/docs/identity-vault/troubleshooting) for further guidance.

### Initial Vault Type Configuration

When we first initialize the vault we use the following configuration:

```typescript
  async initialize(): Promise<void> {
    await this.vault.initialize({
      key: 'io.ionic.gettingstartediv',
      type: VaultType.SecureStorage,
      deviceSecurityType: DeviceSecurityType.None,
      lockAfterBackgrounded: 2000,
    });
  }
```

It is important to note that this is an _initial_ configuration. Once a vault is created, it (and its current
configuration) persist between invocations of the application. Thus, if the configuration of the vault is updated by
the application, the updated configuration will be read when the application is reopened. For example, if the
`lockAfterBackgrounded` has been updated to 5000 milliseconds, then when we start the application again with the
vault already existing, `lockAfterBackgrounded` will remain set to 5000 milliseconds. The configuration we pass
here is _only_ used if we later destroy and re-create this vault.

Notice that we are specifying a type of `VaultType.SecureStorage`. It is best to use either `VaultType.SecureStorage`
or `VaultType.InMemeory` when calling `initialize()` to avoid the potential of creating a vault of a type that cannot
be supported. We can always update the type later after and the updated `type` will "stick." We want to start,
however, with an option that will always word regardless of the device's configuration.

### Single Vault vs Multiple Vaults

Identity Vault is ideal for storing small chunks of data such as authentication information or encryption keys. Our
sample application contains a single vault. However, it may make sense to use multiple vaults within your application's
architecture.

Ask yourself the following questions:

1. What type of data is stored?
1. Under what conditions should the data be available to the application?

Let's say the application is storing the following information:

- The authentication session data.
- A set of encryption keys.

You can use a single vault to store this data if all of the following are true:

- You only want to access the vault via a single service.
- The requirements for when the data is accessible is identical.

You should use multiple vaults to store this data if any of the following are true:

- You logically want to use different services for different types of data.
- You logically would like to use different services to access different types of data.
- The requirements for when the data is accessible differs in some way. For example, perhaps the authentication
  information is locked behind a biometric key while access to the encryption keys requires a custom set in-app
  code to be entered.

If you decide to use multiple vaults, a best-practice is to create a separate service for each vault. That is, in the
interest of proper organization within your code, each vault service should only manage a single vault.
