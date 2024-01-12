---
title: Handling Application Startup
sidebar_label: Startup Strategies
sidebar_position: 2
---

## Overview

When we created the application for the [getting started tutorial](getting-started) we made sure Identity Vault was
properly initialized before we used it. However, we just jumped right into the first tab of the main part of the
app. This is not a realistic experience for our users. Let's implement something more realistic.

### The Login Page

Our application currently just starts right up in the application itself and we have a button that the user can
press to store the authentication information in the vault. This is not realistic. Our application should have a
page where the user logs in.

In our case, this will still just be a button that the user presses to fake a log in, but we are getting a step
closer to an actual flow by having the login page.

### The Startup Flow

When our application starts, the session can be in one of the following states:

1. Locked:
   1. With valid authentication tokens.
   1. With invalid authentication tokens.
1. Not logged in.

If the application is locked, the application shall give the user the opportunity to unlock the vault. If the unlock
fails, the user shall be given the option to either try again or to clear the session data and log in again.

If the user unlocks the vault and the resulting authentication information is valid, the first tab shall be loaded.
For our tutorial application, if we have session data the session is, by definition, valid.

If the user unlocks the vault and the resulting authentication information is expired, the login page shall be loaded.
Having expired or otherwise invalid authentication information is not technically possible in our tutorial application,
but we will code for it none the less.

If the user is not logged in, the login page shall be loaded.

We will build upon the application we created in the [getting started tutorial](getting-started) in order to implement
a basic application startup workflow.

## Let's Code

As mentioned previously, this tutorial builds upon the application created when doing the
[getting started tutorial](getting-started). If you have the code from when you performed that tutorial, then you are
good to go. If you need the code you can make a copy from
[our GitHub repository](https://github.com/ionic-enterprise/tutorials-and-demos-ng/tree/main/auth-connect/getting-started).

### Generate New Pages

In order to implement our startup and authentication strategies, we need to have a `LoginPage`. We will also replace
the "default" page (currently the `Tab1Page`) with a `StartPage` that will contain our startup logic.

Generate these pages.

<CH.Code>

```bash terminal
ionic generate page login
ionic generate page start
```

</CH.Code>

### Update Routes

With the new pages in place, the routing needs to be fixed. The application's routing scheme has two levels: a base
page level and a sub-page level. As such, each of our routes has one of the following formats: `/base-page` or
`/base-page/sub-page`.

At the base page level, we want to have three different pages: `TabsPage`, `LoginPage`, and `StartPage`. We also want
the default route (`/`) to be the `StartPage`. Update the `src/app/app.routes.ts` file to:

- Define the `/tabs` route.
- Define the `/login` route.
- Define the `/start` route.
- Create a redirect from `/` to `/start`.

<CH.Code>

```typescript src/app/app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/start',
    pathMatch: 'full',
  },
  {
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'start',
    loadComponent: () => import('./start/start.page').then((m) => m.StartPage),
  },
];
```

</CH.Code>

The `TabsPage` (route: `/tabs`) has sub-pages. The sub-pages are already set up, but we need to make the following
adjustments to `src/app/tabs/tabs.routes.ts`:

- Remove the redirect for `/` since it was moved to `src/app/app.routes.ts`.
- Change the main path from `tabs` (which is now defined in `src/app/app.routes.ts`) to an empty string.

<CH.Code>

```typescript src/app/tabs/tabs.routes.ts
import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'tab1',
        loadComponent: () =>
          import('../tab1/tab1.page').then((m) => m.Tab1Page),
      },
      {
        path: 'tab2',
        loadComponent: () =>
          import('../tab2/tab2.page').then((m) => m.Tab2Page),
      },
      {
        path: 'tab3',
        loadComponent: () =>
          import('../tab3/tab3.page').then((m) => m.Tab3Page),
      },
      {
        path: '',
        redirectTo: '/tabs/tab1',
        pathMatch: 'full',
      },
    ],
  },
];
```

</CH.Code>

### The `AuthenticationService`

Part of our startup strategy involves authentication. We will not _really_ be performing authentication, but we will
add the service so that we have the infrastructure in place so we can later add authentication via a solution
such as [Auth Connect](https://ionic.io/docs/auth-connect).

<CH.Scrollycoding>

<CH.Code>

```bash Terminal
ionic generate service core/authentication
```

</CH.Code>

Generate the authentication service.

---

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

An empty service is created.

---

<CH.Code>

```typescript src/app/core/authentication.service.ts focus=2,8
import { Injectable } from '@angular/core';
import { SessionVaultService } from './session-vault.service';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  constructor(private sessionVault: SessionVaultService) {}
}
```

</CH.Code>

Inject the `SessionVaultService`.

---

<CH.Code>

```typescript src/app/core/authentication.service.ts focus=10:18
import { Injectable } from '@angular/core';
import { SessionVaultService } from './session-vault.service';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  constructor(private sessionVault: SessionVaultService) {}

  async login(): Promise<void> {
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

The user needs to be able to log in. Since we do not yet have an authentication strategy, we will store a fake session.

---

<CH.Code>

```typescript src/app/core/authentication.service.ts focus=20:22
import { Injectable } from '@angular/core';
import { SessionVaultService } from './session-vault.service';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  constructor(private sessionVault: SessionVaultService) {}

  async login(): Promise<void> {
    this.sessionVault.storeSession({
      email: 'test@ionic.io',
      firstName: 'Tessa',
      lastName: 'Testsmith',
      accessToken: '4abf1d79-143c-4b89-b478-19607eb5ce97',
      refreshToken: '565111b6-66c3-4527-9238-6ea2cc017126',
    });
  }

  async logout(): Promise<void> {
    this.sessionVault.clearSession();
  }
}
```

</CH.Code>

For the `logout()`, just clear the stored session.

---

<CH.Code>

```typescript src/app/core/authentication.service.ts focus=24:27
import { Injectable } from '@angular/core';
import { SessionVaultService } from './session-vault.service';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  constructor(private sessionVault: SessionVaultService) {}

  async login(): Promise<void> {
    this.sessionVault.storeSession({
      email: 'test@ionic.io',
      firstName: 'Tessa',
      lastName: 'Testsmith',
      accessToken: '4abf1d79-143c-4b89-b478-19607eb5ce97',
      refreshToken: '565111b6-66c3-4527-9238-6ea2cc017126',
    });
  }

  async logout(): Promise<void> {
    this.sessionVault.clearSession();
  }

  async isAuthenticated(): Promise<boolean> {
    const session = await this.sessionVault.getSession();
    return !!session;
  }
}
```

</CH.Code>

To determine if the user is authenticated, check for a stored session.

</CH.Scrollycoding>

We now have an `AuthenticationService` that we can use in the rest of our app. We also have a service that we can
update to add our actual authentication services using a solution such as [Auth Connect](https://ionic.io/docs/auth-connect).

### The `LoginPage`

The login page simply includes a "Login" button.

<CH.Code>

```html src/app/login/login.page.html
<ion-header [translucent]="true">
  <ion-toolbar>
    <ion-title>Login</ion-title>
  </ion-toolbar>
</ion-header>

<ion-content [fullscreen]="true">
  <ion-header collapse="condense">
    <ion-toolbar>
      <ion-title size="large">Login</ion-title>
    </ion-toolbar>
  </ion-header>

  <ion-list>
    <ion-item>
      <ion-label>
        <ion-button expand="block" (click)="login()">Login</ion-button>
      </ion-label>
    </ion-item>
  </ion-list>
</ion-content>
```

</CH.Code>

When the button is pressed the following tasks are performed:

- Attempt to log in.
- If the login succeeds, to to the `Tab1Page`.
- If the login fails we will just log it for now. When actual authentication is implemented this _may_ be a good
  place to display a "Login Failed" message, but that is beyond the scope of this tutorial.

<CH.Code>

```typescript src/app/login/login.page.ts
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
  NavController,
} from '@ionic/angular/standalone';
import { AuthenticationService } from '../core/authentication.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
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
export class LoginPage {
  constructor(
    private navController: NavController,
    private authentication: AuthenticationService
  ) {}

  async login() {
    try {
      await this.authentication.login();
      this.navController.navigateRoot(['tabs', 'tab1']);
    } catch (err: unknown) {
      console.error('Failed to log in', err);
    }
  }
}
```

</CH.Code>

### Update the `SessionVaultService`

The startup logic needs to determine if the vault is currently locked and provide a mechanism to unlock the vault
if it is locked. Update the `SessionVaultService` to provide `unlock()` and `isLocked()` methods.

<CH.Code rows={20}>

```typescript src/app/code/session-vault.service.ts focus=62:72
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
  private lockedSubject: Subject<boolean>;
  private vault: BrowserVault | Vault;

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

    this.vault.onLock(() => this.lockedSubject.next(true));
    this.vault.onUnlock(() => this.lockedSubject.next(false));
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

  async unlock(): Promise<void> {
    await this.vault.unlock();
  }

  async isLocked(): Promise<boolean> {
    return (
      this.vault.config?.type !== VaultType.SecureStorage &&
      this.vault.config?.type !== VaultType.InMemory &&
      (await this.vault.isLocked())
    );
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

In the `isLocked()` method, we are ignoring the actual state for `SecureStorage` or `InMemory` type vaults because
Identity Vault will report them as "locked" even though they logically cannot lock. This is a long standing quirk
with Identity Vault that would be a _breaking change_ to fix.

### The `StartPage`

We will start with this requirement: _If the unlock fails, the user shall be given the option to either try again
or to clear the session data and log in again._

This may _seem_ like an odd place to start, but it is the only requirement that involves the look and feel of the
page, so let's get that established first.

<CH.Code>

```html src/app/start/start.page.html
<ion-content class="ion-padding">
  <ion-list *ngIf="showUnlock">
    <ion-item>
      <ion-label>
        <ion-button expand="block" (click)="performUnlockFlow()"
          >Unlock</ion-button
        >
      </ion-label>
    </ion-item>
    <ion-item>
      <ion-label>
        <ion-button expand="block" (click)="redoLogin()">Redo Login</ion-button>
      </ion-label>
    </ion-item>
  </ion-list>
</ion-content>
```

</CH.Code>

We are only conditionally showing the "Unlock" and "Redo Login" buttons. For now, we will hard code the condition to
_not_ display these buttons. We also removed the header, toolbar and title as we want this page to be minimal.
Remove those components, add our new ones, and create empty methods for the bound click handlers.

<CH.Code>

```typescript src/app/start/start.page.ts focus=1,3:9,16,19,25,27
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  IonButton,
  IonContent,
  IonItem,
  IonLabel,
  IonList,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-start',
  templateUrl: './start.page.html',
  styleUrls: ['./start.page.scss'],
  standalone: true,
  imports: [CommonModule, IonButton, IonContent, IonItem, IonLabel, IonList],
})
export class StartPage implements OnInit {
  showUnlock: boolean = false;

  constructor() {}

  async ngOnInit() {}

  async performUnlockFlow() {}

  async redoLogin() {}
}
```

</CH.Code>

With the basics in place, let's implement the rest of the logic.

<CH.Scrollycoding>

<CH.Code>

```typescript src/app/start/start.page.ts focus=24,28:29,34,36
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  IonButton,
  IonContent,
  IonItem,
  IonLabel,
  IonList,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-start',
  templateUrl: './start.page.html',
  styleUrls: ['./start.page.scss'],
  standalone: true,
  imports: [CommonModule, IonButton, IonContent, IonItem, IonLabel, IonList],
})
export class StartPage implements OnInit {
  showUnlock: boolean = false;

  constructor() {}

  async ngOnInit() {
    await this.performUnlockFlow();
  }

  async performUnlockFlow() {
    await this.attemptUnlock();
    await this.attemptNavigation();
  }

  async redoLogin() {}

  private async attemptNavigation(): Promise<void> {}

  private async attemptUnlock(): Promise<void> {}
}
```

</CH.Code>

For the unlock flow, we will first attempt an unlock, and then see if we can navigate. Perform this flow when the
user navigates to this page.

---

<CH.Code>

```typescript src/app/start/start.page.ts focus=10,22[15:55],38:44
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  IonButton,
  IonContent,
  IonItem,
  IonLabel,
  IonList,
} from '@ionic/angular/standalone';
import { SessionVaultService } from '../core/session-vault.service';

@Component({
  selector: 'app-start',
  templateUrl: './start.page.html',
  styleUrls: ['./start.page.scss'],
  standalone: true,
  imports: [CommonModule, IonButton, IonContent, IonItem, IonLabel, IonList],
})
export class StartPage implements OnInit {
  showUnlock: boolean = false;

  constructor(private sessionVault: SessionVaultService) {}

  async ngOnInit() {
    await this.performUnlockFlow();
  }

  async performUnlockFlow() {
    await this.attemptUnlock();
    await this.attemptNavigation();
  }

  async redoLogin() {}

  private async attemptNavigation(): Promise<void> {}

  private async attemptUnlock(): Promise<void> {
    if (await this.sessionVault.isLocked()) {
      try {
        await this.sessionVault.unlock();
      } catch (err: unknown) {
        this.showUnlock = true;
      }
    }
  }
}
```

</CH.Code>

We will only attempt the unlock operation if the vault is actually locked. Try to unlock the vault. If the unlock fails,
set the "show" flag so the user can try again or give up and go back to the login step.

---

<CH.Code>

```typescript src/app/start/start.page.ts focus=9,11,25:27,42:48
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  IonButton,
  IonContent,
  IonItem,
  IonLabel,
  IonList,
  NavController,
} from '@ionic/angular/standalone';
import { AuthenticationService } from '../core/authentication.service';
import { SessionVaultService } from '../core/session-vault.service';

@Component({
  selector: 'app-start',
  templateUrl: './start.page.html',
  styleUrls: ['./start.page.scss'],
  standalone: true,
  imports: [CommonModule, IonButton, IonContent, IonItem, IonLabel, IonList],
})
export class StartPage implements OnInit {
  showUnlock: boolean = false;

  constructor(
    private authentication: AuthenticationService,
    private navController: NavController,
    private sessionVault: SessionVaultService
  ) {}

  async ngOnInit() {
    await this.performUnlockFlow();
  }

  async performUnlockFlow() {
    await this.attemptUnlock();
    await this.attemptNavigation();
  }

  async redoLogin() {}

  private async attemptNavigation(): Promise<void> {
    if (!(await this.sessionVault.isLocked())) {
      if (await this.authentication.isAuthenticated()) {
        this.navController.navigateRoot(['tabs', 'tab1']);
      } else {
        this.navController.navigateRoot(['login']);
      }
    }
  }

  private async attemptUnlock(): Promise<void> {
    if (await this.sessionVault.isLocked()) {
      try {
        await this.sessionVault.unlock();
      } catch (err: unknown) {
        this.showUnlock = true;
      }
    }
  }
}
```

</CH.Code>

If the user succeeded in unlocking the vault, determine if we should navigate to the `LoginPage` or the `Tab1Page`
based on the current authentication status.

---

<CH.Code>

```typescript src/app/start/start.page.ts focus=40,41
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  IonButton,
  IonContent,
  IonItem,
  IonLabel,
  IonList,
  NavController,
} from '@ionic/angular/standalone';
import { AuthenticationService } from '../core/authentication.service';
import { SessionVaultService } from '../core/session-vault.service';

@Component({
  selector: 'app-start',
  templateUrl: './start.page.html',
  styleUrls: ['./start.page.scss'],
  standalone: true,
  imports: [CommonModule, IonButton, IonContent, IonItem, IonLabel, IonList],
})
export class StartPage implements OnInit {
  showUnlock: boolean = false;

  constructor(
    private authentication: AuthenticationService,
    private navController: NavController,
    private sessionVault: SessionVaultService
  ) {}

  async ngOnInit() {
    await this.performUnlockFlow();
  }

  async performUnlockFlow() {
    await this.attemptUnlock();
    await this.attemptNavigation();
  }

  async redoLogin() {
    await this.authentication.logout();
    this.navController.navigateRoot(['login']);
  }

  private async attemptNavigation(): Promise<void> {
    if (!(await this.sessionVault.isLocked())) {
      if (await this.authentication.isAuthenticated()) {
        this.navController.navigateRoot(['tabs', 'tab1']);
      } else {
        this.navController.navigateRoot(['login']);
      }
    }
  }

  private async attemptUnlock(): Promise<void> {
    if (await this.sessionVault.isLocked()) {
      try {
        await this.sessionVault.unlock();
      } catch (err: unknown) {
        this.showUnlock = true;
      }
    }
  }
}
```

</CH.Code>

If the user chooses to redo the login, logout and navigate to the `LoginPage`.

</CH.Scrollycoding>

One item of note on the `redoLogin()` code. If we are using an authentication system, we need to craft our `logout()`
method such that it can be called with a locked vault. Crafting the logout as such is beyond the scope of this tutorial.

### Redirect on Lock

<CH.Code>

Update the `AppComponent` to subscribe to the `locked$` observable. When the vault locks, navigate to `/`. This will
load the `StartPage` and execute an iteration of our unlock workflow.

```typescript src/app/app.component.ts focus=5,7,8,16[27:46],19:29
import { Component, OnDestroy } from '@angular/core';
import {
  IonApp,
  IonRouterOutlet,
  NavController,
} from '@ionic/angular/standalone';
import { Subscription } from 'rxjs';
import { SessionVaultService } from './core/session-vault.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnDestroy {
  private subscription: Subscription;

  constructor(navController: NavController, sessionVault: SessionVaultService) {
    this.subscription = sessionVault.locked$.subscribe((lock) => {
      if (lock) {
        navController.navigateRoot(['/']);
      }
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
```

</CH.Code>

### Cleanup the `Tab1Page`

This step is completely optional. The tutorial application will work perfectly fine with the code as-is. There are
several items in the `Tab1Page` that no longer make sense, however, and now is a good time to clean those up. Here is
a synopsis of what can be cleaned up:

- Remove the "Store" button and all code associated with it.
- Change the "Clear" button to a "Logout" button and update the click handler accordingly.
- Remove the "Unlock" button and all code associated with it.
- Remove the code that subscribes to the `locked$` observable and clears the displayed session data when the
  vault is locked. This is no longer needed because we navigate away from the page entirely when the vault locks.

Cleaning this all up is left as an exercise to the reader but we provide the completed code here for you to compare against.

<CH.Code>

```html src/app/tab1/tab1.page.html
<ion-header [translucent]="true">
  <ion-toolbar>
    <ion-title> Tab1 </ion-title>
  </ion-toolbar>
</ion-header>

<ion-content [fullscreen]="true">
  <ion-header collapse="condense">
    <ion-toolbar>
      <ion-title size="large">Tab1</ion-title>
    </ion-toolbar>
  </ion-header>

  <ion-list>
    <ion-item>
      <ion-label>
        <ion-button expand="block" color="danger" (click)="logout()"
          >Logout</ion-button
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
  NavController,
} from '@ionic/angular/standalone';
import { SessionVaultService, UnlockMode } from '../core/session-vault.service';
import { Session } from '../models/session';
import { AuthenticationService } from '../core/authentication.service';

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
    IonTitle,
  ],
})
export class Tab1Page implements OnInit {
  session: Session | null = null;

  constructor(
    private authentication: AuthenticationService,
    private navController: NavController,
    private sessionVault: SessionVaultService
  ) {}

  async ngOnInit() {
    this.session = await this.sessionVault.getSession();
  }

  async logout(): Promise<void> {
    await this.authentication.logout();
    this.navController.navigateRoot('/');
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

## Next Steps

In this tutorial, we created a good basic application startup workflow. This is an example of a good workflow, but it
is not the only potential flow. For example, our application simply navigates to `/tabs/tab1` after unlocking the
vault. You could, however, store information about the current state of the application and then restore to that
state after unlocking the application. Do whatever is right for your application.
