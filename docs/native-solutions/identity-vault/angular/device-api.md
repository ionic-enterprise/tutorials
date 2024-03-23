---
title: Using the Device API
sidebar_label: The Device API
sidebar_position: 3
---

import Admonition from '@theme/Admonition';

## Overview

When we created our other Identity Vault tutorial applications we implemented several pieces of functionality without
taking the capabilities and current configuration of the device into account. We will address that now with the help
of the [Device API](https://ionic.io/docs/identity-vault/classes/device).

In this tutorial we will:

- Examine the methods available in the [Device API](https://ionic.io/docs/identity-vault/classes/device).
- Disable options based on the current device capabilities and configurations.
- Show the privacy screen when the application is in the task switcher.
- Progressively enhance the vault type when the user logs in.
- Handle the iOS Face ID permissions before setting the vault to use biometric unlock.

## Let's Code

This tutorial builds upon the application created when doing the [startup strategies tutorial](startup-strategies).
If you have the code from when you performed that tutorial, then you are ready to go. If you need the code you can
make a copy from [our GitHub repository](https://github.com/ionic-enterprise/tutorials-and-demos-ng/tree/main/identity-vault/startup-strategies).

## The Device API

The functions in the Device API can be separated into three different categories:

- **Capabilities**: The values returned by these functions are defined by the capabilities of the device.
- **Configuration and Status**: The values returned by these functions are determined by the device's current
  configuration and/or status.
- **Procedures**: These functions perform some kind of device related process such as setting a configuration
  value or displaying a prompt.

We will use the `Tab2Page` to test out how these functions work.

### Capabilities

The "capabilities" functions return information about the capabilities of the current device. The values
returned by these functions are constant for a given device.

- `getAvailableHardware`: Resolves an array of the types of biometric hardware that a device supports.
- `hasSecureHardware`: Resolves `true` if the device has hardware dedicated to storing secure data. Most modern
  devices do.
- `isBiometricsSupported`: Resolves `true` if the device supports some form of biometrics regardless of
  whether or not biometrics is configured. Most modern devices support biometrics.

Update the `Tab2Page` to display the results of these methods.

<CH.Code>

```typescript src/app/tab2/tab2.page.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Device } from '@ionic-enterprise/identity-vault';
import {
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonNote,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonItem,
    IonLabel,
    IonList,
    IonListHeader,
    IonNote,
    IonTitle,
    IonToolbar,
  ],
})
export class Tab2Page implements OnInit {
  hasSecureHardware: Boolean = false;
  isBiometricsSupported: Boolean = false;
  availableHardware: Array<string> = [];

  constructor() {}

  async ngOnInit(): Promise<void> {
    this.hasSecureHardware = await Device.hasSecureHardware();
    this.isBiometricsSupported = await Device.isBiometricsSupported();
    this.availableHardware = await Device.getAvailableHardware();
  }
}
```

```html src/app/tab2/tab2.page.html
<ion-header [translucent]="true">
  <ion-toolbar>
    <ion-title> Device API </ion-title>
  </ion-toolbar>
</ion-header>

<ion-content [fullscreen]="true" class="ion-padding">
  <ion-header collapse="condense">
    <ion-toolbar>
      <ion-title size="large">Device API</ion-title>
    </ion-toolbar>
  </ion-header>

  <ion-list>
    <ion-list-header>
      <ion-label>Capabilities</ion-label>
    </ion-list-header>
    <ion-item>
      <ion-label>Secure Hardware</ion-label>
      <ion-note slot="end">{{hasSecureHardware}}</ion-note>
    </ion-item>
    <ion-item>
      <ion-label>Biometrics Supported</ion-label>
      <ion-note slot="end">{{isBiometricsSupported}}</ion-note>
    </ion-item>
    <ion-item>
      <div>
        <p>Available Biometric Hardware:</p>
        <ul *ngIf="availableHardware?.length">
          <li *ngFor="let h of availableHardware">{{h}}</li>
        </ul>
        <ul *ngIf="availableHardware?.length === 0">
          <li>None</li>
        </ul>
      </div>
    </ion-item>
  </ion-list>
</ion-content>
```

</CH.Code>

Note that these value are consistent on a particular device, regardless of whether or not biometrics is currently
configured on the device.

<Admonition type="warning">Results may vary on a device where the user does not have a system passcode set.</Admonition>

### Configuration and Status

- `getBiometricStrengthLevel`: On iOS, this function always resolves to `strong`. On Android, the result depends
  on the [Biometrics Classes](https://source.android.com/docs/security/features/biometric/measure#biometric-classes)
  of whichever biometrics are currently configured on the device. If at least one of the configured biometric options
  is Class 3, it will return `strong`, otherwise it will return `weak`.
- `isBiometricsAllowed`: On iOS Face ID based devices this method resolves to `Prompt` if the user needs to be asked
  for permission to use Face ID, `Denied` if the user has declined permission, and `Granted` if the user has granted
  permission. On all other devices, which do not require such permissions, this method always resolves to `Granted`.
- `isBiometricsEnabled`: Resolves `true` if biometrics have been configured for the current user, `false` otherwise.
- `isHideScreenOnBackgroundEnabled`: Resolves `true` if the "hide screen" will be displayed when the app is placed
  in the background, `false` otherwise.
- `isLockedOutOfBiometrics`: Resolves `true` if the user is locked out of biometrics after too many failed attempts.
  On iOS, this information may be known upon app launch. On Android, an attempt to unlock with the current app
  session needs to be performed before this can be known.
- `isSystemPasscodeSet`: Resolves `true` if the user has established a system passcode that can be used to
  unlock the app, `false` otherwise.

Update the `Tab2Page` to display the results of these methods.

<CH.Code rows={30}>

```typescript src/app/tab2/tab2.page.ts focus=39:44,53:59
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Device } from '@ionic-enterprise/identity-vault';
import {
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonNote,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonItem,
    IonLabel,
    IonList,
    IonListHeader,
    IonNote,
    IonTitle,
    IonToolbar,
  ],
})
export class Tab2Page implements OnInit {
  hasSecureHardware: Boolean = false;
  isBiometricsSupported: Boolean = false;
  availableHardware: Array<string> = [];

  biometricStrengthLevel: string = '';
  isBiometricsAllowed: string = '';
  isBiometricsEnabled: boolean = false;
  isHideScreenOnBackgroundEnabled: boolean = false;
  isLockedOutOfBiometrics: boolean = false;
  isSystemPasscodeSet: boolean = false;

  constructor() {}

  async ngOnInit(): Promise<void> {
    this.hasSecureHardware = await Device.hasSecureHardware();
    this.isBiometricsSupported = await Device.isBiometricsSupported();
    this.availableHardware = await Device.getAvailableHardware();

    this.biometricStrengthLevel = await Device.getBiometricStrengthLevel();
    this.isBiometricsAllowed = await Device.isBiometricsAllowed();
    this.isBiometricsEnabled = await Device.isBiometricsEnabled();
    this.isHideScreenOnBackgroundEnabled = await Device.isHideScreenOnBackgroundEnabled();
    this.isLockedOutOfBiometrics = await Device.isLockedOutOfBiometrics();
    this.isSystemPasscodeSet = await Device.isSystemPasscodeSet();
  }
}
```

```html src/app/tab2/tab2.page.html focus=37:63
<ion-header [translucent]="true">
  <ion-toolbar>
    <ion-title> Device API </ion-title>
  </ion-toolbar>
</ion-header>

<ion-content [fullscreen]="true" class="ion-padding">
  <ion-header collapse="condense">
    <ion-toolbar>
      <ion-title size="large">Device API</ion-title>
    </ion-toolbar>
  </ion-header>

  <ion-list>
    <ion-list-header>
      <ion-label>Capabilities</ion-label>
    </ion-list-header>
    <ion-item>
      <ion-label>Secure Hardware</ion-label>
      <ion-note slot="end">{{hasSecureHardware}}</ion-note>
    </ion-item>
    <ion-item>
      <ion-label>Biometrics Supported</ion-label>
      <ion-note slot="end">{{isBiometricsSupported}}</ion-note>
    </ion-item>
    <ion-item>
      <div>
        <p>Available Biometric Hardware:</p>
        <ul *ngIf="availableHardware?.length">
          <li *ngFor="let h of availableHardware">{{h}}</li>
        </ul>
        <ul *ngIf="availableHardware?.length === 0">
          <li>None</li>
        </ul>
      </div>
    </ion-item>
    <ion-list-header>
      <ion-label>Configuration and Status</ion-label>
    </ion-list-header>
    <ion-item>
      <ion-label>Biometric Strength Level</ion-label>
      <ion-note slot="end">{{biometricStrengthLevel}}</ion-note>
    </ion-item>
    <ion-item>
      <ion-label>Biometric Allowed</ion-label>
      <ion-note slot="end">{{isBiometricsAllowed}}</ion-note>
    </ion-item>
    <ion-item>
      <ion-label>Biometrics Enabled</ion-label>
      <ion-note slot="end">{{isBiometricsEnabled}}</ion-note>
    </ion-item>
    <ion-item>
      <ion-label>Hide Screen Enabled</ion-label>
      <ion-note slot="end">{{isHideScreenOnBackgroundEnabled}}</ion-note>
    </ion-item>
    <ion-item>
      <ion-label>Locked Out of Biometrics</ion-label>
      <ion-note slot="end">{{isLockedOutOfBiometrics}}</ion-note>
    </ion-item>
    <ion-item>
      <ion-label>System Passcode Set</ion-label>
      <ion-note slot="end">{{isSystemPasscodeSet}}</ion-note>
    </ion-item>
  </ion-list>
</ion-content>
```

</CH.Code>

Build the application and install it on a variety of devices. Then modify the configuration of the biometrics on those devices to see how the values change.

### Procedures

- `setHideScreenOnBackground`: Set whether or not the interface is obscured when the application is placed in
  the background.
- `showBiometricPrompt`: Show a biometric prompt to the user. This method will resolve when the user dismisses
  the prompt by successfully providing biometrics, and will reject if they cancel. On iOS devices with Face ID,
  this method will also ask for permission as needed.

Add a couple of buttons to the `Tab2Page` to call these methods.

<CH.Code rows={19}>

```typescript src/app/tab2/tab2.page.ts focus=63:77
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Device } from '@ionic-enterprise/identity-vault';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonNote,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonButton,
    IonContent,
    IonHeader,
    IonItem,
    IonLabel,
    IonList,
    IonListHeader,
    IonNote,
    IonTitle,
    IonToolbar,
  ],
})
export class Tab2Page implements OnInit {
  hasSecureHardware: Boolean = false;
  isBiometricsSupported: Boolean = false;
  availableHardware: Array<string> = [];

  biometricStrengthLevel: string = '';
  isBiometricsAllowed: string = '';
  isBiometricsEnabled: boolean = false;
  isHideScreenOnBackgroundEnabled: boolean = false;
  isLockedOutOfBiometrics: boolean = false;
  isSystemPasscodeSet: boolean = false;

  constructor() {}

  async ngOnInit(): Promise<void> {
    this.hasSecureHardware = await Device.hasSecureHardware();
    this.isBiometricsSupported = await Device.isBiometricsSupported();
    this.availableHardware = await Device.getAvailableHardware();

    this.biometricStrengthLevel = await Device.getBiometricStrengthLevel();
    this.isBiometricsAllowed = await Device.isBiometricsAllowed();
    this.isBiometricsEnabled = await Device.isBiometricsEnabled();
    this.isHideScreenOnBackgroundEnabled = await Device.isHideScreenOnBackgroundEnabled();
    this.isLockedOutOfBiometrics = await Device.isLockedOutOfBiometrics();
    this.isSystemPasscodeSet = await Device.isSystemPasscodeSet();
  }

  async toggleHideScreenOnBackground(): Promise<void> {
    await Device.setHideScreenOnBackground(!this.isHideScreenOnBackgroundEnabled);
    this.isHideScreenOnBackgroundEnabled = await Device.isHideScreenOnBackgroundEnabled();
  }

  async showBiometricPrompt(): Promise<void> {
    try {
      await Device.showBiometricPrompt({
        iosBiometricsLocalizedReason: 'Just to show you how this works',
      });
    } catch (e) {
      // This is the most likely scenario
      alert('user cancelled biometrics prompt');
    }
  }
}
```

```html src/app/tab2/tab2.page.html focus=64:80
<ion-header [translucent]="true">
  <ion-toolbar>
    <ion-title> Device API </ion-title>
  </ion-toolbar>
</ion-header>

<ion-content [fullscreen]="true" class="ion-padding">
  <ion-header collapse="condense">
    <ion-toolbar>
      <ion-title size="large">Device API</ion-title>
    </ion-toolbar>
  </ion-header>

  <ion-list>
    <ion-list-header>
      <ion-label>Capabilities</ion-label>
    </ion-list-header>
    <ion-item>
      <ion-label>Secure Hardware</ion-label>
      <ion-note slot="end">{{hasSecureHardware}}</ion-note>
    </ion-item>
    <ion-item>
      <ion-label>Biometrics Supported</ion-label>
      <ion-note slot="end">{{isBiometricsSupported}}</ion-note>
    </ion-item>
    <ion-item>
      <div>
        <p>Available Biometric Hardware:</p>
        <ul *ngIf="availableHardware?.length">
          <li *ngFor="let h of availableHardware">{{h}}</li>
        </ul>
        <ul *ngIf="availableHardware?.length === 0">
          <li>None</li>
        </ul>
      </div>
    </ion-item>
    <ion-list-header>
      <ion-label>Configuration and Status</ion-label>
    </ion-list-header>
    <ion-item>
      <ion-label>Biometric Strength Level</ion-label>
      <ion-note slot="end">{{biometricStrengthLevel}}</ion-note>
    </ion-item>
    <ion-item>
      <ion-label>Biometric Allowed</ion-label>
      <ion-note slot="end">{{isBiometricsAllowed}}</ion-note>
    </ion-item>
    <ion-item>
      <ion-label>Biometrics Enabled</ion-label>
      <ion-note slot="end">{{isBiometricsEnabled}}</ion-note>
    </ion-item>
    <ion-item>
      <ion-label>Hide Screen Enabled</ion-label>
      <ion-note slot="end">{{isHideScreenOnBackgroundEnabled}}</ion-note>
    </ion-item>
    <ion-item>
      <ion-label>Locked Out of Biometrics</ion-label>
      <ion-note slot="end">{{isLockedOutOfBiometrics}}</ion-note>
    </ion-item>
    <ion-item>
      <ion-label>System Passcode Set</ion-label>
      <ion-note slot="end">{{isSystemPasscodeSet}}</ion-note>
    </ion-item>
    <ion-list-header>
      <ion-label>Actions</ion-label>
    </ion-list-header>
    <ion-item>
      <ion-label>
        <ion-button expand="block" [disabled]="!isBiometricsEnabled" (click)="showBiometricPrompt()"
          >Show Biometric Prompt</ion-button
        >
      </ion-label>
    </ion-item>
    <ion-item>
      <ion-label>
        <ion-button expand="block" (click)="toggleHideScreenOnBackground()"
          >{{this.isHideScreenOnBackgroundEnabled ? 'Disable' : 'Enable'}} Security Screen</ion-button
        >
      </ion-label>
    </ion-item>
  </ion-list>
</ion-content>
```

</CH.Code>

Build the code and install it on a variety of different types of devices to see how the procedures behave.

<Admonition type="note">
  Be sure to include the import of `IonButton` which is not shown above for reasons of brevity.
</Admonition>

## Common Uses of the Device API

Now that we have seen an overview of the [Device API](https://ionic.io/docs/identity-vault/classes/device) let's
have a look at some common tasks that we can perform using the methods from this API. In this section, we look
at how to perform the following tasks:

- Enabling or disabling various functionality based on the capabilities of the device.
- Setting the app to show the "privacy screen" when the app is being shown in the app switcher.
- Progressively enhance the vault to use the most secure options available on the device.
- Managing permissions on iOS devices that use Face ID.

### Enable / Disable Functionality

We can use various methods within the Device API to enable or disable the setting of various preferences, settings,
or workflows based on whether or not the current device has biometrics enabled or not. For example, if the
application has a preference to toggle biometric authentication on and off, we could hide or disable the
toggle for that setting based on the value of `isBiometricsEnabled()`.

We have have an example of doing this within the `Tab2Page` where the button that initiates the "Show Biometric
Prompt" workflow is disabled if biometrics is not currently enabled.

```html src/app/tab2/tab2.page.html
<ion-item>
  <ion-label>
    <ion-button expand="block" [disabled]="!isBiometricsEnabled" (click)="showBiometricPrompt()"
      >Show Biometric Prompt</ion-button
    >
  </ion-label>
</ion-item>
```

Using this code as a model, add similar functionality to the "Use Biometrics" button on the `Tab1Page`.

### Show the Privacy Screen

Many applications that use Identity Vault also display sensitive data that the user may not want shown if the
application is shown in the app switcher. Identity Vault has a "privacy screen" feature that will obscure the
page contents in this situation. On Android, a gray or black page will be shown instead. On iOS, the splash
screen will be displayed.

In the `Tab2Page` we show how to use `Device.setHideScreenOnBackground()` to toggle this feature on and off.
Most applications will either want this feature on or off without a toggle. In such cases, it is best to set
the feature however you wish upon application startup.

<CH.Code rows={18}>

```typescript src/main.ts focus=9,19
import { APP_INITIALIZER, enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { SessionVaultService } from './app/core/session-vault.service';
import { environment } from './environments/environment';
import { Device } from '@ionic-enterprise/identity-vault';

if (environment.production) {
  enableProdMode();
}

const appInitFactory =
  (vault: SessionVaultService): (() => Promise<void>) =>
  async () => {
    await vault.initialize();
    await Device.setHideScreenOnBackground(true);
  };

bootstrapApplication(AppComponent, {
  providers: [
    { provide: APP_INITIALIZER, useFactory: appInitFactory, deps: [SessionVaultService], multi: true },
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes),
  ],
});
```

</CH.Code>

<Admonition type="note">
  You may be tempted to include the `Device.setHideScreenOnBackground(true)` call in the `vault.initialize()` method.
  However, it is a best-practice to keep the code separate from the vault code to avoid confusion in cases where the
  application needs to use multiple vaults.
</Admonition>

### Progressively Enhance the Vault

It is a best practice to initially create the vault with a configuration that all devices can support and then
enhance the vault's security either based on user preferences or the capabilities of the device. In this section,
we will examine how to automatically enhance the security based on the capabilities of the device.

For our application, we would like to use biometrics with a system passcode backup if possible. Otherwise, we will
force the user to log in each time.

- If the vault is already storing a session, leave it alone.
- If the vault is not storing a session:
  - Use biometrics with a system passcode backup if it is set up.
  - Use a system passcode if biometrics is not set up.
  - If neither biometrics nor a system passcode are set, force the user to login in each time.

<CH.Scrollycoding>

<CH.Code>

```typescript src/app/core/session-vault.service.ts focus=33:38
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

export type UnlockMode = 'BiometricsWithPasscode' | 'InMemory' | 'SecureStorage';

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
    try {
      await this.vault.initialize({
        key: 'io.ionic.gettingstartediv',
        type: VaultType.SecureStorage,
        deviceSecurityType: DeviceSecurityType.None,
        lockAfterBackgrounded: 2000,
      });
    } catch (e: unknown) {
      await this.vault.clear();
      await this.updateUnlockMode('SecureStorage');
    }

    this.vault.onLock(() => this.lockedSubject.next(true));
    this.vault.onUnlock(() => this.lockedSubject.next(false));
  }

  async storeSession(session: Session): Promise<void> {
    this.vault.setValue('session', session);
  }

  async getSession(): Promise<Session | null> {
    if (await this.vault.isEmpty()) {
      return null;
    }
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
      !(await this.vault.isEmpty()) &&
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
    const deviceSecurityType = type === VaultType.DeviceSecurity ? DeviceSecurityType.Both : DeviceSecurityType.None;
    await this.vault.updateConfig({
      ...(this.vault.config as IdentityVaultConfig),
      type,
      deviceSecurityType,
    });
  }
}
```

</CH.Code>

Our app is written to start with a Secure Storage type vault.

---

<CH.Code>

```typescript src/app/core/session-vault.service.ts focus=4,36,38,42[36:43]
import { Injectable } from '@angular/core';
import {
  BrowserVault,
  Device,
  DeviceSecurityType,
  IdentityVaultConfig,
  Vault,
  VaultType,
} from '@ionic-enterprise/identity-vault';
import { Session } from '../models/session';
import { VaultFactory } from './vault.factory';
import { Observable, Subject } from 'rxjs';

export type UnlockMode = 'BiometricsWithPasscode' | 'InMemory' | 'SecureStorage';

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
    try {
      await this.vault.initialize({
        key: 'io.ionic.gettingstartediv',
        type: VaultType.InMemory,
        deviceSecurityType: DeviceSecurityType.None,
        lockAfterBackgrounded: 30000,
      });
    } catch (e: unknown) {
      await this.vault.clear();
      await this.updateUnlockMode('InMemory');
    }

    this.vault.onLock(() => this.lockedSubject.next(true));
    this.vault.onUnlock(() => this.lockedSubject.next(false));
  }

  async storeSession(session: Session): Promise<void> {
    this.vault.setValue('session', session);
  }

  async getSession(): Promise<Session | null> {
    if (await this.vault.isEmpty()) {
      return null;
    }
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
      !(await this.vault.isEmpty()) &&
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
    const deviceSecurityType = type === VaultType.DeviceSecurity ? DeviceSecurityType.Both : DeviceSecurityType.None;
    await this.vault.updateConfig({
      ...(this.vault.config as IdentityVaultConfig),
      type,
      deviceSecurityType,
    });
  }
}
```

</CH.Code>

Import the `Device` class so we can use the API.

Change the `type` to be `InMemory` and increase the background lock time from 2 seconds to 30 seconds.

---

<CH.Code>

```typescript src/app/core/session-vault.service.ts focus=96:100
import { Injectable } from '@angular/core';
import {
  BrowserVault,
  Device,
  DeviceSecurityType,
  IdentityVaultConfig,
  Vault,
  VaultType,
} from '@ionic-enterprise/identity-vault';
import { Session } from '../models/session';
import { VaultFactory } from './vault.factory';
import { Observable, Subject } from 'rxjs';

export type UnlockMode = 'BiometricsWithPasscode' | 'InMemory' | 'SecureStorage';

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
    try {
      await this.vault.initialize({
        key: 'io.ionic.gettingstartediv',
        type: VaultType.InMemory,
        deviceSecurityType: DeviceSecurityType.None,
        lockAfterBackgrounded: 30000,
      });
    } catch (e: unknown) {
      await this.vault.clear();
      await this.updateUnlockMode('InMemory');
    }

    this.vault.onLock(() => this.lockedSubject.next(true));
    this.vault.onUnlock(() => this.lockedSubject.next(false));
  }

  async storeSession(session: Session): Promise<void> {
    this.vault.setValue('session', session);
  }

  async getSession(): Promise<Session | null> {
    if (await this.vault.isEmpty()) {
      return null;
    }
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
      !(await this.vault.isEmpty()) &&
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
    const deviceSecurityType = type === VaultType.DeviceSecurity ? DeviceSecurityType.Both : DeviceSecurityType.None;
    await this.vault.updateConfig({
      ...(this.vault.config as IdentityVaultConfig),
      type,
      deviceSecurityType,
    });
  }

  private async enhanceVault(): Promise<void> {
    if (!(await this.vault.isEmpty())) {
      return;
    }
  }
}
```

</CH.Code>

Add a private method called `enhanceVault()`. Per our first requirement, the vault should not be changed if it is
already in use.

---

<CH.Code>

```typescript src/app/core/session-vault.service.ts focus=89,94,103:107
import { Injectable } from '@angular/core';
import {
  BrowserVault,
  Device,
  DeviceSecurityType,
  IdentityVaultConfig,
  Vault,
  VaultType,
} from '@ionic-enterprise/identity-vault';
import { Session } from '../models/session';
import { VaultFactory } from './vault.factory';
import { Observable, Subject } from 'rxjs';

export type UnlockMode = 'BiometricsWithPasscode' | 'InMemory' | 'SecureStorage';

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
    try {
      await this.vault.initialize({
        key: 'io.ionic.gettingstartediv',
        type: VaultType.InMemory,
        deviceSecurityType: DeviceSecurityType.None,
        lockAfterBackgrounded: 30000,
      });
    } catch (e: unknown) {
      await this.vault.clear();
      await this.updateUnlockMode('InMemory');
    }

    this.vault.onLock(() => this.lockedSubject.next(true));
    this.vault.onUnlock(() => this.lockedSubject.next(false));
  }

  async storeSession(session: Session): Promise<void> {
    this.vault.setValue('session', session);
  }

  async getSession(): Promise<Session | null> {
    if (await this.vault.isEmpty()) {
      return null;
    }
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
      !(await this.vault.isEmpty()) &&
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
    const deviceSecurityType = type === VaultType.DeviceSecurity ? DeviceSecurityType.Both : DeviceSecurityType.None;
    const lockAfterBackgrounded = type === VaultType.InMemory ? 30000 : 2000;
    await this.vault.updateConfig({
      ...(this.vault.config as IdentityVaultConfig),
      type,
      deviceSecurityType,
      lockAfterBackgrounded,
    });
  }

  private async enhanceVault(): Promise<void> {
    if (!(await this.vault.isEmpty())) {
      return;
    }

    if (await Device.isSystemPasscodeSet()) {
      await this.updateUnlockMode('BiometricsWithPasscode');
    } else {
      await this.updateUnlockMode('InMemory');
    }
  }
}
```

</CH.Code>

Use the proper vault type based on whether or not a system passcode is set. Adjust the lock time as well.

---

<CH.Code>

```typescript src/app/core/session-vault.service.ts focus=45
import { Injectable } from '@angular/core';
import {
  BrowserVault,
  Device,
  DeviceSecurityType,
  IdentityVaultConfig,
  Vault,
  VaultType,
} from '@ionic-enterprise/identity-vault';
import { Session } from '../models/session';
import { VaultFactory } from './vault.factory';
import { Observable, Subject } from 'rxjs';

export type UnlockMode = 'BiometricsWithPasscode' | 'InMemory' | 'SecureStorage';

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
    try {
      await this.vault.initialize({
        key: 'io.ionic.gettingstartediv',
        type: VaultType.InMemory,
        deviceSecurityType: DeviceSecurityType.None,
        lockAfterBackgrounded: 30000,
      });
    } catch (e: unknown) {
      await this.vault.clear();
      await this.updateUnlockMode('InMemory');
    }

    await this.enhanceVault();

    this.vault.onLock(() => this.lockedSubject.next(true));
    this.vault.onUnlock(() => this.lockedSubject.next(false));
  }

  async storeSession(session: Session): Promise<void> {
    this.vault.setValue('session', session);
  }

  async getSession(): Promise<Session | null> {
    if (await this.vault.isEmpty()) {
      return null;
    }
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
      !(await this.vault.isEmpty()) &&
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
    const deviceSecurityType = type === VaultType.DeviceSecurity ? DeviceSecurityType.Both : DeviceSecurityType.None;
    const lockAfterBackgrounded = type === VaultType.InMemory ? 30000 : 2000;
    await this.vault.updateConfig({
      ...(this.vault.config as IdentityVaultConfig),
      type,
      deviceSecurityType,
      lockAfterBackgrounded,
    });
  }

  private async enhanceVault(): Promise<void> {
    if (!(await this.vault.isEmpty())) {
      return;
    }

    if (await Device.isSystemPasscodeSet()) {
      await this.updateUnlockMode('BiometricsWithPasscode');
    } else {
      await this.updateUnlockMode('InMemory');
    }
  }
}
```

</CH.Code>

Enhance the vault as part of the initialization process.

</CH.Scrollycoding>

Build the application and test it on a variety of devices using a variety of screen unlock settings. You should see
the following behaviors:

- On devices without a system passcode or biometrics the user should be forced to login any time the application
  is restarted or is put in the background for more than 30 seconds.
- On devices with a system passcode but without biometrics set up, the session is stored between invocations
  and is unlocked via the system passcode. The application locks after 2 seconds in the background.
- On devices with a system passcode and with biometrics set up, the session is stored between invocations
  and is unlocked via biometrics using the system passcode as backup. The application locks after 2 seconds
  in the background.
- On all devices, if "Use Secure Storage" is selected, then a secure storage vault will be used. This can be
  tested by pressing "Use Secure Storage" and closing the app. When it comes back the user should still be
  logged in. This should repeat until the user logs out prior to closing the app.

<Admonition type="note">
  We are taking advantage of the fact that `DeviceSecurityType.Both` uses the system passcode not only when
  biometrics fails, but also if biometrics is not set up at all. Perhaps we want our app to behave in a more
  specific manner such as any of the following:

- Use only Biometrics with a system passcode backup _only_ if biometrics is set up.
- Use Biometrics without a system passcode backup, but use system passcode if biometrics is not set up.
- Use Biometrics with a system passcode backup _only_ if biometrics is set up. Allow the user to set
  a custom passcode in other circumstances.

Identity Vault and the Device API give you the flexibility to support any of those scenarios and more. Please
contact us if you would like to discuss your specific scenario.

</Admonition>

### Handle iOS Permissions

On iOS devices that use Face ID, the user needs to give permission in order for the application to use their
face to unlock the app. The prompt for this permission is not provided to the user until your app tries to
[use Face ID for the first time](https://developer.apple.com/documentation/localauthentication/accessing_keychain_items_with_face_id_or_touch_id#4035538). As a result, our application is not asking for
permission to use the user's face until the first time it tries to unlock the vault. It would be better if it
asked for permission before setting the vault to use biometrics. Let's do that now.

The requirements we have from our design team are;

- Keep the vault type logic as it is now. That is:
  - If there is a system passcode and biometrics, use biometrics with a system passcode backup.
  - If there is a system passcode but no biometrics, use the system passcode.
  - If there no system passcode force the user to log in each time.
- In addition, if biometrics is enabled:
  - Determine if the user needs to be prompted for permission.
  - If the user needs to be prompted for permission, show a biometric prompt. This will also trigger the
    permissions prompt in cases where permission is required.
  - If the user allows Face ID to be used, set the vault type to `DeviceSecurity`.
  - If the user denies permission to use Face ID, set the vault type to `InMemory`.

<CH.Scrollycoding>

<CH.Code>

```typescript src/app/core/session-vault.service.ts focus=101:109
import { Injectable } from '@angular/core';
import {
  BiometricPermissionState,
  BrowserVault,
  Device,
  DeviceSecurityType,
  IdentityVaultConfig,
  Vault,
  VaultType,
} from '@ionic-enterprise/identity-vault';
import { Session } from '../models/session';
import { VaultFactory } from './vault.factory';
import { Observable, Subject } from 'rxjs';

export type UnlockMode = 'BiometricsWithPasscode' | 'InMemory' | 'SecureStorage';

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
    try {
      await this.vault.initialize({
        key: 'io.ionic.gettingstartediv',
        type: VaultType.InMemory,
        deviceSecurityType: DeviceSecurityType.None,
        lockAfterBackgrounded: 30000,
      });
    } catch (e: unknown) {
      await this.vault.clear();
      await this.updateUnlockMode('InMemory');
    }

    await this.enhanceVault();

    this.vault.onLock(() => this.lockedSubject.next(true));
    this.vault.onUnlock(() => this.lockedSubject.next(false));
  }

  async storeSession(session: Session): Promise<void> {
    this.vault.setValue('session', session);
  }

  async getSession(): Promise<Session | null> {
    if (await this.vault.isEmpty()) {
      return null;
    }
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
      !(await this.vault.isEmpty()) &&
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
    const deviceSecurityType = type === VaultType.DeviceSecurity ? DeviceSecurityType.Both : DeviceSecurityType.None;
    const lockAfterBackgrounded = type === VaultType.InMemory ? 30000 : 2000;
    await this.vault.updateConfig({
      ...(this.vault.config as IdentityVaultConfig),
      type,
      deviceSecurityType,
      lockAfterBackgrounded,
    });
  }

  private async provisionBiometrics(): Promise<void> {
    if ((await Device.isBiometricsAllowed()) === BiometricPermissionState.Prompt) {
      try {
        await Device.showBiometricPrompt({ iosBiometricsLocalizedReason: 'Please authenticate to continue' });
      } catch (error) {
        null;
      }
    }
  }

  private async enhanceVault(): Promise<void> {
    if (!(await this.vault.isEmpty())) {
      return;
    }

    if (await Device.isSystemPasscodeSet()) {
      await this.updateUnlockMode('BiometricsWithPasscode');
    } else {
      await this.updateUnlockMode('InMemory');
    }
  }
}
```

</CH.Code>

Add a private method called `provisionBiometrics()`. Display the biometric prompt if permissions need to be prompted.

---

<CH.Code>

```typescript src/app/core/session-vault.service.ts focus=85,96:102
import { Injectable } from '@angular/core';
import {
  BiometricPermissionState,
  BrowserVault,
  Device,
  DeviceSecurityType,
  IdentityVaultConfig,
  Vault,
  VaultType,
} from '@ionic-enterprise/identity-vault';
import { Session } from '../models/session';
import { VaultFactory } from './vault.factory';
import { Observable, Subject } from 'rxjs';

export type UnlockMode = 'BiometricsWithPasscode' | 'InMemory' | 'SecureStorage';

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
    try {
      await this.vault.initialize({
        key: 'io.ionic.gettingstartediv',
        type: VaultType.InMemory,
        deviceSecurityType: DeviceSecurityType.None,
        lockAfterBackgrounded: 30000,
      });
    } catch (e: unknown) {
      await this.vault.clear();
      await this.updateUnlockMode('InMemory');
    }

    await this.enhanceVault();

    this.vault.onLock(() => this.lockedSubject.next(true));
    this.vault.onUnlock(() => this.lockedSubject.next(false));
  }

  async storeSession(session: Session): Promise<void> {
    this.vault.setValue('session', session);
  }

  async getSession(): Promise<Session | null> {
    if (await this.vault.isEmpty()) {
      return null;
    }
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
      !(await this.vault.isEmpty()) &&
      (await this.vault.isLocked())
    );
  }

  async updateUnlockMode(mode: UnlockMode): Promise<void> {
    const type = await this.getVaultType(mode);
    const deviceSecurityType = type === VaultType.DeviceSecurity ? DeviceSecurityType.Both : DeviceSecurityType.None;
    const lockAfterBackgrounded = type === VaultType.InMemory ? 30000 : 2000;
    await this.vault.updateConfig({
      ...(this.vault.config as IdentityVaultConfig),
      type,
      deviceSecurityType,
      lockAfterBackgrounded,
    });
  }

  private async getVaultType(mode: UnlockMode): Promise<VaultType> {
    return mode === 'BiometricsWithPasscode'
      ? VaultType.DeviceSecurity
      : mode === 'InMemory'
        ? VaultType.InMemory
        : VaultType.SecureStorage;
  }

  private async provisionBiometrics(): Promise<void> {
    if ((await Device.isBiometricsAllowed()) === BiometricPermissionState.Prompt) {
      try {
        await Device.showBiometricPrompt({ iosBiometricsLocalizedReason: 'Please authenticate to continue' });
      } catch (error) {
        null;
      }
    }
  }

  private async enhanceVault(): Promise<void> {
    if (!(await this.vault.isEmpty())) {
      return;
    }

    if (await Device.isSystemPasscodeSet()) {
      await this.updateUnlockMode('BiometricsWithPasscode');
    } else {
      await this.updateUnlockMode('InMemory');
    }
  }
}
```

</CH.Code>

Determining the proper vault type is going to get more complex, so let's start by abstracting that logic into
its own method.

---

<CH.Code>

```typescript src/app/core/session-vault.service.ts focus=97:101
import { Injectable } from '@angular/core';
import {
  BiometricPermissionState,
  BrowserVault,
  Device,
  DeviceSecurityType,
  IdentityVaultConfig,
  Vault,
  VaultType,
} from '@ionic-enterprise/identity-vault';
import { Session } from '../models/session';
import { VaultFactory } from './vault.factory';
import { Observable, Subject } from 'rxjs';

export type UnlockMode = 'BiometricsWithPasscode' | 'InMemory' | 'SecureStorage';

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
    try {
      await this.vault.initialize({
        key: 'io.ionic.gettingstartediv',
        type: VaultType.InMemory,
        deviceSecurityType: DeviceSecurityType.None,
        lockAfterBackgrounded: 30000,
      });
    } catch (e: unknown) {
      await this.vault.clear();
      await this.updateUnlockMode('InMemory');
    }

    await this.enhanceVault();

    this.vault.onLock(() => this.lockedSubject.next(true));
    this.vault.onUnlock(() => this.lockedSubject.next(false));
  }

  async storeSession(session: Session): Promise<void> {
    this.vault.setValue('session', session);
  }

  async getSession(): Promise<Session | null> {
    if (await this.vault.isEmpty()) {
      return null;
    }
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
      !(await this.vault.isEmpty()) &&
      (await this.vault.isLocked())
    );
  }

  async updateUnlockMode(mode: UnlockMode): Promise<void> {
    const type = await this.getVaultType(mode);
    const deviceSecurityType = type === VaultType.DeviceSecurity ? DeviceSecurityType.Both : DeviceSecurityType.None;
    const lockAfterBackgrounded = type === VaultType.InMemory ? 30000 : 2000;
    await this.vault.updateConfig({
      ...(this.vault.config as IdentityVaultConfig),
      type,
      deviceSecurityType,
      lockAfterBackgrounded,
    });
  }

  private async getVaultType(mode: UnlockMode): Promise<VaultType> {
    if (mode === 'BiometricsWithPasscode') {
      return VaultType.DeviceSecurity;
    }

    return mode === 'InMemory' ? VaultType.InMemory : VaultType.SecureStorage;
  }

  private async provisionBiometrics(): Promise<void> {
    if ((await Device.isBiometricsAllowed()) === BiometricPermissionState.Prompt) {
      try {
        await Device.showBiometricPrompt({ iosBiometricsLocalizedReason: 'Please authenticate to continue' });
      } catch (error) {
        null;
      }
    }
  }

  private async enhanceVault(): Promise<void> {
    if (!(await this.vault.isEmpty())) {
      return;
    }

    if (await Device.isSystemPasscodeSet()) {
      await this.updateUnlockMode('BiometricsWithPasscode');
    } else {
      await this.updateUnlockMode('InMemory');
    }
  }
}
```

</CH.Code>

Biometrics will be special, so let's give it its own section.

---

<CH.Code>

```typescript src/app/core/session-vault.service.ts focus=98
import { Injectable } from '@angular/core';
import {
  BiometricPermissionState,
  BrowserVault,
  Device,
  DeviceSecurityType,
  IdentityVaultConfig,
  Vault,
  VaultType,
} from '@ionic-enterprise/identity-vault';
import { Session } from '../models/session';
import { VaultFactory } from './vault.factory';
import { Observable, Subject } from 'rxjs';

export type UnlockMode = 'BiometricsWithPasscode' | 'InMemory' | 'SecureStorage';

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
    try {
      await this.vault.initialize({
        key: 'io.ionic.gettingstartediv',
        type: VaultType.InMemory,
        deviceSecurityType: DeviceSecurityType.None,
        lockAfterBackgrounded: 30000,
      });
    } catch (e: unknown) {
      await this.vault.clear();
      await this.updateUnlockMode('InMemory');
    }

    await this.enhanceVault();

    this.vault.onLock(() => this.lockedSubject.next(true));
    this.vault.onUnlock(() => this.lockedSubject.next(false));
  }

  async storeSession(session: Session): Promise<void> {
    this.vault.setValue('session', session);
  }

  async getSession(): Promise<Session | null> {
    if (await this.vault.isEmpty()) {
      return null;
    }
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
      !(await this.vault.isEmpty()) &&
      (await this.vault.isLocked())
    );
  }

  async updateUnlockMode(mode: UnlockMode): Promise<void> {
    const type = await this.getVaultType(mode);
    const deviceSecurityType = type === VaultType.DeviceSecurity ? DeviceSecurityType.Both : DeviceSecurityType.None;
    const lockAfterBackgrounded = type === VaultType.InMemory ? 30000 : 2000;
    await this.vault.updateConfig({
      ...(this.vault.config as IdentityVaultConfig),
      type,
      deviceSecurityType,
      lockAfterBackgrounded,
    });
  }

  private async getVaultType(mode: UnlockMode): Promise<VaultType> {
    if (mode === 'BiometricsWithPasscode') {
      await this.provisionBiometrics();
      return VaultType.DeviceSecurity;
    }

    return mode === 'InMemory' ? VaultType.InMemory : VaultType.SecureStorage;
  }

  private async provisionBiometrics(): Promise<void> {
    if ((await Device.isBiometricsAllowed()) === BiometricPermissionState.Prompt) {
      try {
        await Device.showBiometricPrompt({ iosBiometricsLocalizedReason: 'Please authenticate to continue' });
      } catch (error) {
        null;
      }
    }
  }

  private async enhanceVault(): Promise<void> {
    if (!(await this.vault.isEmpty())) {
      return;
    }

    if (await Device.isSystemPasscodeSet()) {
      await this.updateUnlockMode('BiometricsWithPasscode');
    } else {
      await this.updateUnlockMode('InMemory');
    }
  }
}
```

</CH.Code>

Provision the Biometrics.

---

<CH.Code>

```typescript src/app/core/session-vault.service.ts focus=99:102
import { Injectable } from '@angular/core';
import {
  BiometricPermissionState,
  BrowserVault,
  Device,
  DeviceSecurityType,
  IdentityVaultConfig,
  Vault,
  VaultType,
} from '@ionic-enterprise/identity-vault';
import { Session } from '../models/session';
import { VaultFactory } from './vault.factory';
import { Observable, Subject } from 'rxjs';

export type UnlockMode = 'BiometricsWithPasscode' | 'InMemory' | 'SecureStorage';

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
    try {
      await this.vault.initialize({
        key: 'io.ionic.gettingstartediv',
        type: VaultType.InMemory,
        deviceSecurityType: DeviceSecurityType.None,
        lockAfterBackgrounded: 30000,
      });
    } catch (e: unknown) {
      await this.vault.clear();
      await this.updateUnlockMode('InMemory');
    }

    await this.enhanceVault();

    this.vault.onLock(() => this.lockedSubject.next(true));
    this.vault.onUnlock(() => this.lockedSubject.next(false));
  }

  async storeSession(session: Session): Promise<void> {
    this.vault.setValue('session', session);
  }

  async getSession(): Promise<Session | null> {
    if (await this.vault.isEmpty()) {
      return null;
    }
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
      !(await this.vault.isEmpty()) &&
      (await this.vault.isLocked())
    );
  }

  async updateUnlockMode(mode: UnlockMode): Promise<void> {
    const type = await this.getVaultType(mode);
    const deviceSecurityType = type === VaultType.DeviceSecurity ? DeviceSecurityType.Both : DeviceSecurityType.None;
    const lockAfterBackgrounded = type === VaultType.InMemory ? 30000 : 2000;
    await this.vault.updateConfig({
      ...(this.vault.config as IdentityVaultConfig),
      type,
      deviceSecurityType,
      lockAfterBackgrounded,
    });
  }

  private async getVaultType(mode: UnlockMode): Promise<VaultType> {
    if (mode === 'BiometricsWithPasscode') {
      await this.provisionBiometrics();
      return (await Device.isBiometricsEnabled()) &&
        (await Device.isBiometricsAllowed()) !== BiometricPermissionState.Granted
        ? VaultType.InMemory
        : VaultType.DeviceSecurity;
    }

    return mode === 'InMemory' ? VaultType.InMemory : VaultType.SecureStorage;
  }

  private async provisionBiometrics(): Promise<void> {
    if ((await Device.isBiometricsAllowed()) === BiometricPermissionState.Prompt) {
      try {
        await Device.showBiometricPrompt({ iosBiometricsLocalizedReason: 'Please authenticate to continue' });
      } catch (error) {
        null;
      }
    }
  }

  private async enhanceVault(): Promise<void> {
    if (!(await this.vault.isEmpty())) {
      return;
    }

    if (await Device.isSystemPasscodeSet()) {
      await this.updateUnlockMode('BiometricsWithPasscode');
    } else {
      await this.updateUnlockMode('InMemory');
    }
  }
}
```

</CH.Code>

If biometrics has been set up, return the vault type based on whether the user has granted or denied access to Face ID.

</CH.Scrollycoding>

Perform a fresh install on several different devices. On iOS devices that use Face ID, the app should ask permission
to use the Face ID upon the first start after application install. If you allow the use of Face ID, the application
will use Biometrics with a System Passcode backup. If you disallow the use of Face ID, the application will use an
"In Memory" vault.

On all other devices, you should not receive any permission requests and application will use Biometrics with a
System Passcode backup by default.

Notice that the permission request comes during application startup. This may be jarring to some users.
For this application it may be better to ask for the Face ID permission right after the user logs in.
Since the provisioning is tied to the enhancement of the vault to use biometrics, this means delaying
the enhancement of the vault until after login.

<CH.Scrollycoding>

<CH.Code>

```typescript src/app/core/session-vault.service.ts focus=118:128
import { Injectable } from '@angular/core';
import {
  BiometricPermissionState,
  BrowserVault,
  Device,
  DeviceSecurityType,
  IdentityVaultConfig,
  Vault,
  VaultType,
} from '@ionic-enterprise/identity-vault';
import { Session } from '../models/session';
import { VaultFactory } from './vault.factory';
import { Observable, Subject } from 'rxjs';

export type UnlockMode = 'BiometricsWithPasscode' | 'InMemory' | 'SecureStorage';

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
    try {
      await this.vault.initialize({
        key: 'io.ionic.gettingstartediv',
        type: VaultType.InMemory,
        deviceSecurityType: DeviceSecurityType.None,
        lockAfterBackgrounded: 30000,
      });
    } catch (e: unknown) {
      await this.vault.clear();
      await this.updateUnlockMode('InMemory');
    }

    await this.enhanceVault();

    this.vault.onLock(() => this.lockedSubject.next(true));
    this.vault.onUnlock(() => this.lockedSubject.next(false));
  }

  async storeSession(session: Session): Promise<void> {
    this.vault.setValue('session', session);
  }

  async getSession(): Promise<Session | null> {
    if (await this.vault.isEmpty()) {
      return null;
    }
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
      !(await this.vault.isEmpty()) &&
      (await this.vault.isLocked())
    );
  }

  async updateUnlockMode(mode: UnlockMode): Promise<void> {
    const type = await this.getVaultType(mode);
    const deviceSecurityType = type === VaultType.DeviceSecurity ? DeviceSecurityType.Both : DeviceSecurityType.None;
    const lockAfterBackgrounded = type === VaultType.InMemory ? 30000 : 2000;
    await this.vault.updateConfig({
      ...(this.vault.config as IdentityVaultConfig),
      type,
      deviceSecurityType,
      lockAfterBackgrounded,
    });
  }

  private async getVaultType(mode: UnlockMode): Promise<VaultType> {
    if (mode === 'BiometricsWithPasscode') {
      await this.provisionBiometrics();
      return (await Device.isBiometricsEnabled()) &&
        (await Device.isBiometricsAllowed()) !== BiometricPermissionState.Granted
        ? VaultType.InMemory
        : VaultType.DeviceSecurity;
    }

    return mode === 'InMemory' ? VaultType.InMemory : VaultType.SecureStorage;
  }

  private async provisionBiometrics(): Promise<void> {
    if ((await Device.isBiometricsAllowed()) === BiometricPermissionState.Prompt) {
      try {
        await Device.showBiometricPrompt({ iosBiometricsLocalizedReason: 'Please authenticate to continue' });
      } catch (error) {
        null;
      }
    }
  }

  private async enhanceVault(): Promise<void> {
    if (!(await this.vault.isEmpty())) {
      return;
    }

    if (await Device.isSystemPasscodeSet()) {
      await this.updateUnlockMode('BiometricsWithPasscode');
    } else {
      await this.updateUnlockMode('InMemory');
    }
  }
}
```

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
  imports: [IonButton, IonContent, IonHeader, IonItem, IonLabel, IonList, IonTitle, IonToolbar],
})
export class LoginPage {
  constructor(
    private navController: NavController,
    private authentication: AuthenticationService,
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

The `enhanceVault()` method is currently `private`.

---

<CH.Code>

```typescript src/app/core/session-vault.service.ts focus=118
import { Injectable } from '@angular/core';
import {
  BiometricPermissionState,
  BrowserVault,
  Device,
  DeviceSecurityType,
  IdentityVaultConfig,
  Vault,
  VaultType,
} from '@ionic-enterprise/identity-vault';
import { Session } from '../models/session';
import { VaultFactory } from './vault.factory';
import { Observable, Subject } from 'rxjs';

export type UnlockMode = 'BiometricsWithPasscode' | 'InMemory' | 'SecureStorage';

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
    try {
      await this.vault.initialize({
        key: 'io.ionic.gettingstartediv',
        type: VaultType.InMemory,
        deviceSecurityType: DeviceSecurityType.None,
        lockAfterBackgrounded: 30000,
      });
    } catch (e: unknown) {
      await this.vault.clear();
      await this.updateUnlockMode('InMemory');
    }

    await this.enhanceVault();

    this.vault.onLock(() => this.lockedSubject.next(true));
    this.vault.onUnlock(() => this.lockedSubject.next(false));
  }

  async storeSession(session: Session): Promise<void> {
    this.vault.setValue('session', session);
  }

  async getSession(): Promise<Session | null> {
    if (await this.vault.isEmpty()) {
      return null;
    }
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
      !(await this.vault.isEmpty()) &&
      (await this.vault.isLocked())
    );
  }

  async updateUnlockMode(mode: UnlockMode): Promise<void> {
    const type = await this.getVaultType(mode);
    const deviceSecurityType = type === VaultType.DeviceSecurity ? DeviceSecurityType.Both : DeviceSecurityType.None;
    const lockAfterBackgrounded = type === VaultType.InMemory ? 30000 : 2000;
    await this.vault.updateConfig({
      ...(this.vault.config as IdentityVaultConfig),
      type,
      deviceSecurityType,
      lockAfterBackgrounded,
    });
  }

  private async getVaultType(mode: UnlockMode): Promise<VaultType> {
    if (mode === 'BiometricsWithPasscode') {
      await this.provisionBiometrics();
      return (await Device.isBiometricsEnabled()) &&
        (await Device.isBiometricsAllowed()) !== BiometricPermissionState.Granted
        ? VaultType.InMemory
        : VaultType.DeviceSecurity;
    }

    return mode === 'InMemory' ? VaultType.InMemory : VaultType.SecureStorage;
  }

  private async provisionBiometrics(): Promise<void> {
    if ((await Device.isBiometricsAllowed()) === BiometricPermissionState.Prompt) {
      try {
        await Device.showBiometricPrompt({ iosBiometricsLocalizedReason: 'Please authenticate to continue' });
      } catch (error) {
        null;
      }
    }
  }

  async enhanceVault(): Promise<void> {
    if (!(await this.vault.isEmpty())) {
      return;
    }

    if (await Device.isSystemPasscodeSet()) {
      await this.updateUnlockMode('BiometricsWithPasscode');
    } else {
      await this.updateUnlockMode('InMemory');
    }
  }
}
```

</CH.Code>

Make it public.

---

<CH.Code>

```typescript src/app/core/session-vault.service.ts focus=119:121
import { Injectable } from '@angular/core';
import {
  BiometricPermissionState,
  BrowserVault,
  Device,
  DeviceSecurityType,
  IdentityVaultConfig,
  Vault,
  VaultType,
} from '@ionic-enterprise/identity-vault';
import { Session } from '../models/session';
import { VaultFactory } from './vault.factory';
import { Observable, Subject } from 'rxjs';

export type UnlockMode = 'BiometricsWithPasscode' | 'InMemory' | 'SecureStorage';

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
    try {
      await this.vault.initialize({
        key: 'io.ionic.gettingstartediv',
        type: VaultType.InMemory,
        deviceSecurityType: DeviceSecurityType.None,
        lockAfterBackgrounded: 30000,
      });
    } catch (e: unknown) {
      await this.vault.clear();
      await this.updateUnlockMode('InMemory');
    }

    await this.enhanceVault();

    this.vault.onLock(() => this.lockedSubject.next(true));
    this.vault.onUnlock(() => this.lockedSubject.next(false));
  }

  async storeSession(session: Session): Promise<void> {
    this.vault.setValue('session', session);
  }

  async getSession(): Promise<Session | null> {
    if (await this.vault.isEmpty()) {
      return null;
    }
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
      !(await this.vault.isEmpty()) &&
      (await this.vault.isLocked())
    );
  }

  async updateUnlockMode(mode: UnlockMode): Promise<void> {
    const type = await this.getVaultType(mode);
    const deviceSecurityType = type === VaultType.DeviceSecurity ? DeviceSecurityType.Both : DeviceSecurityType.None;
    const lockAfterBackgrounded = type === VaultType.InMemory ? 30000 : 2000;
    await this.vault.updateConfig({
      ...(this.vault.config as IdentityVaultConfig),
      type,
      deviceSecurityType,
      lockAfterBackgrounded,
    });
  }

  private async getVaultType(mode: UnlockMode): Promise<VaultType> {
    if (mode === 'BiometricsWithPasscode') {
      await this.provisionBiometrics();
      return (await Device.isBiometricsEnabled()) &&
        (await Device.isBiometricsAllowed()) !== BiometricPermissionState.Granted
        ? VaultType.InMemory
        : VaultType.DeviceSecurity;
    }

    return mode === 'InMemory' ? VaultType.InMemory : VaultType.SecureStorage;
  }

  private async provisionBiometrics(): Promise<void> {
    if ((await Device.isBiometricsAllowed()) === BiometricPermissionState.Prompt) {
      try {
        await Device.showBiometricPrompt({ iosBiometricsLocalizedReason: 'Please authenticate to continue' });
      } catch (error) {
        null;
      }
    }
  }

  async enhanceVault(): Promise<void> {
    if (!(await this.vault.isEmpty())) {
      return;
    }

    if (await Device.isSystemPasscodeSet()) {
      await this.updateUnlockMode('BiometricsWithPasscode');
    } else {
      await this.updateUnlockMode('InMemory');
    }
  }
}
```

</CH.Code>

The method does not enhance a vault that is in use.

---

<CH.Code>

```typescript src/app/core/session-vault.service.ts focus=118:124
import { Injectable } from '@angular/core';
import {
  BiometricPermissionState,
  BrowserVault,
  Device,
  DeviceSecurityType,
  IdentityVaultConfig,
  Vault,
  VaultType,
} from '@ionic-enterprise/identity-vault';
import { Session } from '../models/session';
import { VaultFactory } from './vault.factory';
import { Observable, Subject } from 'rxjs';

export type UnlockMode = 'BiometricsWithPasscode' | 'InMemory' | 'SecureStorage';

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
    try {
      await this.vault.initialize({
        key: 'io.ionic.gettingstartediv',
        type: VaultType.InMemory,
        deviceSecurityType: DeviceSecurityType.None,
        lockAfterBackgrounded: 30000,
      });
    } catch (e: unknown) {
      await this.vault.clear();
      await this.updateUnlockMode('InMemory');
    }

    await this.enhanceVault();

    this.vault.onLock(() => this.lockedSubject.next(true));
    this.vault.onUnlock(() => this.lockedSubject.next(false));
  }

  async storeSession(session: Session): Promise<void> {
    this.vault.setValue('session', session);
  }

  async getSession(): Promise<Session | null> {
    if (await this.vault.isEmpty()) {
      return null;
    }
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
      !(await this.vault.isEmpty()) &&
      (await this.vault.isLocked())
    );
  }

  async updateUnlockMode(mode: UnlockMode): Promise<void> {
    const type = await this.getVaultType(mode);
    const deviceSecurityType = type === VaultType.DeviceSecurity ? DeviceSecurityType.Both : DeviceSecurityType.None;
    const lockAfterBackgrounded = type === VaultType.InMemory ? 30000 : 2000;
    await this.vault.updateConfig({
      ...(this.vault.config as IdentityVaultConfig),
      type,
      deviceSecurityType,
      lockAfterBackgrounded,
    });
  }

  private async getVaultType(mode: UnlockMode): Promise<VaultType> {
    if (mode === 'BiometricsWithPasscode') {
      await this.provisionBiometrics();
      return (await Device.isBiometricsEnabled()) &&
        (await Device.isBiometricsAllowed()) !== BiometricPermissionState.Granted
        ? VaultType.InMemory
        : VaultType.DeviceSecurity;
    }

    return mode === 'InMemory' ? VaultType.InMemory : VaultType.SecureStorage;
  }

  private async provisionBiometrics(): Promise<void> {
    if ((await Device.isBiometricsAllowed()) === BiometricPermissionState.Prompt) {
      try {
        await Device.showBiometricPrompt({ iosBiometricsLocalizedReason: 'Please authenticate to continue' });
      } catch (error) {
        null;
      }
    }
  }

  async enhanceVault(): Promise<void> {
    if (await Device.isSystemPasscodeSet()) {
      await this.updateUnlockMode('BiometricsWithPasscode');
    } else {
      await this.updateUnlockMode('InMemory');
    }
  }
}
```

</CH.Code>

Remove the `isEmpty()` check leaving the rest of the code in place.

---

<CH.Code>

```typescript src/app/core/session-vault.service.ts focus=46
import { Injectable } from '@angular/core';
import {
  BiometricPermissionState,
  BrowserVault,
  Device,
  DeviceSecurityType,
  IdentityVaultConfig,
  Vault,
  VaultType,
} from '@ionic-enterprise/identity-vault';
import { Session } from '../models/session';
import { VaultFactory } from './vault.factory';
import { Observable, Subject } from 'rxjs';

export type UnlockMode = 'BiometricsWithPasscode' | 'InMemory' | 'SecureStorage';

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
    try {
      await this.vault.initialize({
        key: 'io.ionic.gettingstartediv',
        type: VaultType.InMemory,
        deviceSecurityType: DeviceSecurityType.None,
        lockAfterBackgrounded: 30000,
      });
    } catch (e: unknown) {
      await this.vault.clear();
      await this.updateUnlockMode('InMemory');
    }

    await this.enhanceVault();

    this.vault.onLock(() => this.lockedSubject.next(true));
    this.vault.onUnlock(() => this.lockedSubject.next(false));
  }

  async storeSession(session: Session): Promise<void> {
    this.vault.setValue('session', session);
  }

  async getSession(): Promise<Session | null> {
    if (await this.vault.isEmpty()) {
      return null;
    }
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
      !(await this.vault.isEmpty()) &&
      (await this.vault.isLocked())
    );
  }

  async updateUnlockMode(mode: UnlockMode): Promise<void> {
    const type = await this.getVaultType(mode);
    const deviceSecurityType = type === VaultType.DeviceSecurity ? DeviceSecurityType.Both : DeviceSecurityType.None;
    const lockAfterBackgrounded = type === VaultType.InMemory ? 30000 : 2000;
    await this.vault.updateConfig({
      ...(this.vault.config as IdentityVaultConfig),
      type,
      deviceSecurityType,
      lockAfterBackgrounded,
    });
  }

  private async getVaultType(mode: UnlockMode): Promise<VaultType> {
    if (mode === 'BiometricsWithPasscode') {
      await this.provisionBiometrics();
      return (await Device.isBiometricsEnabled()) &&
        (await Device.isBiometricsAllowed()) !== BiometricPermissionState.Granted
        ? VaultType.InMemory
        : VaultType.DeviceSecurity;
    }

    return mode === 'InMemory' ? VaultType.InMemory : VaultType.SecureStorage;
  }

  private async provisionBiometrics(): Promise<void> {
    if ((await Device.isBiometricsAllowed()) === BiometricPermissionState.Prompt) {
      try {
        await Device.showBiometricPrompt({ iosBiometricsLocalizedReason: 'Please authenticate to continue' });
      } catch (error) {
        null;
      }
    }
  }

  async enhanceVault(): Promise<void> {
    if (await Device.isSystemPasscodeSet()) {
      await this.updateUnlockMode('BiometricsWithPasscode');
    } else {
      await this.updateUnlockMode('InMemory');
    }
  }
}
```

</CH.Code>

The `enhanceVault()` method is currently called from the `initialize()` method.

---

<CH.Code>

```typescript src/app/core/session-vault.service.ts focus=33:48
import { Injectable } from '@angular/core';
import {
  BiometricPermissionState,
  BrowserVault,
  Device,
  DeviceSecurityType,
  IdentityVaultConfig,
  Vault,
  VaultType,
} from '@ionic-enterprise/identity-vault';
import { Session } from '../models/session';
import { VaultFactory } from './vault.factory';
import { Observable, Subject } from 'rxjs';

export type UnlockMode = 'BiometricsWithPasscode' | 'InMemory' | 'SecureStorage';

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
    try {
      await this.vault.initialize({
        key: 'io.ionic.gettingstartediv',
        type: VaultType.InMemory,
        deviceSecurityType: DeviceSecurityType.None,
        lockAfterBackgrounded: 30000,
      });
    } catch (e: unknown) {
      await this.vault.clear();
      await this.updateUnlockMode('InMemory');
    }

    this.vault.onLock(() => this.lockedSubject.next(true));
    this.vault.onUnlock(() => this.lockedSubject.next(false));
  }

  async storeSession(session: Session): Promise<void> {
    this.vault.setValue('session', session);
  }

  async getSession(): Promise<Session | null> {
    if (await this.vault.isEmpty()) {
      return null;
    }
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
      !(await this.vault.isEmpty()) &&
      (await this.vault.isLocked())
    );
  }

  async updateUnlockMode(mode: UnlockMode): Promise<void> {
    const type = await this.getVaultType(mode);
    const deviceSecurityType = type === VaultType.DeviceSecurity ? DeviceSecurityType.Both : DeviceSecurityType.None;
    const lockAfterBackgrounded = type === VaultType.InMemory ? 30000 : 2000;
    await this.vault.updateConfig({
      ...(this.vault.config as IdentityVaultConfig),
      type,
      deviceSecurityType,
      lockAfterBackgrounded,
    });
  }

  private async getVaultType(mode: UnlockMode): Promise<VaultType> {
    if (mode === 'BiometricsWithPasscode') {
      await this.provisionBiometrics();
      return (await Device.isBiometricsEnabled()) &&
        (await Device.isBiometricsAllowed()) !== BiometricPermissionState.Granted
        ? VaultType.InMemory
        : VaultType.DeviceSecurity;
    }

    return mode === 'InMemory' ? VaultType.InMemory : VaultType.SecureStorage;
  }

  private async provisionBiometrics(): Promise<void> {
    if ((await Device.isBiometricsAllowed()) === BiometricPermissionState.Prompt) {
      try {
        await Device.showBiometricPrompt({ iosBiometricsLocalizedReason: 'Please authenticate to continue' });
      } catch (error) {
        null;
      }
    }
  }

  async enhanceVault(): Promise<void> {
    if (!(await this.vault.isEmpty())) {
      return;
    }

    if (await Device.isSystemPasscodeSet()) {
      await this.updateUnlockMode('BiometricsWithPasscode');
    } else {
      await this.updateUnlockMode('InMemory');
    }
  }
}
```

</CH.Code>

Remove the call leaving the rest of `initialize()` in place.

---

<CH.Code>

```typescript src/app/login/login.page.ts focus=28:35
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
  imports: [IonButton, IonContent, IonHeader, IonItem, IonLabel, IonList, IonTitle, IonToolbar],
})
export class LoginPage {
  constructor(
    private navController: NavController,
    private authentication: AuthenticationService,
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

The login method currently logs the user in and navigates to the main page.

---

<CH.Code>

```typescript src/app/login/login.page.ts focus=14,27,33
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
import { SessionVaultService } from '../core/session-vault.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonButton, IonContent, IonHeader, IonItem, IonLabel, IonList, IonTitle, IonToolbar],
})
export class LoginPage {
  constructor(
    private navController: NavController,
    private authentication: AuthenticationService,
    private sessionVault: SessionVaultService,
  ) {}

  async login() {
    try {
      await this.authentication.login();
      await this.sessionVault.enhanceVault();
      this.navController.navigateRoot(['tabs', 'tab1']);
    } catch (err: unknown) {
      console.error('Failed to log in', err);
    }
  }
}
```

</CH.Code>

Enhance the vault as part of a successful login.

</CH.Scrollycoding>

The application now asks for Face ID permission only if needed and only after a successful login rather than
doing so as part of the startup process. In your application you may want to tie this to something else such
as setting a "Use Biometrics" preference toggle. The choice is up to you.

On the `Tab1Page`, the user can currently click the "Use Biometrics" button even if the user has rejected
Face ID. According to the rules we are enforcing, though, we will end up using an "In Memory" vault in that
case. We can enhance the "disable biometrics" code that we added earlier.

<CH.Code rows={30}>

```typescript src/app/tab1/tab1.page.ts focus=16[10:34],37:39
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
import { BiometricPermissionState, Device } from '@ionic-enterprise/identity-vault';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [IonButton, IonContent, IonHeader, IonItem, IonLabel, IonList, IonTitle, IonToolbar, IonTitle],
})
export class Tab1Page implements OnInit {
  session: Session | null = null;
  disableBiometrics: boolean = false;

  constructor(
    private authentication: AuthenticationService,
    private navController: NavController,
    private sessionVault: SessionVaultService,
  ) {}

  async ngOnInit() {
    this.session = await this.sessionVault.getSession();
    this.disableBiometrics =
      !(await Device.isBiometricsEnabled()) ||
      (await Device.isBiometricsAllowed()) !== BiometricPermissionState.Granted;
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

```html src/app/tab1/tab1.page.html focus=25
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
        <ion-button expand="block" color="danger" (click)="logout()">Logout</ion-button>
      </ion-label>
    </ion-item>
    <ion-item>
      <ion-label>
        <ion-button
          expand="block"
          color="secondary"
          [disabled]="disableBiometrics"
          (click)="changeUnlockMode('BiometricsWithPasscode')"
          >Use Biometrics</ion-button
        >
      </ion-label>
    </ion-item>
    <ion-item>
      <ion-label>
        <ion-button expand="block" color="secondary" (click)="changeUnlockMode('InMemory')">Use In Memory</ion-button>
      </ion-label>
    </ion-item>
    <ion-item>
      <ion-label>
        <ion-button expand="block" color="secondary" (click)="changeUnlockMode('SecureStorage')"
          >Use Secure Storage</ion-button
        >
      </ion-label>
    </ion-item>
    <ion-item>
      <ion-label>
        <ion-button expand="block" color="warning" (click)="lock()">Lock</ion-button>
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

## Next Steps

We have examined the `Device` API and several potential uses for it. Continue to explore how this API can be used
to enhance the user experience within your application.
