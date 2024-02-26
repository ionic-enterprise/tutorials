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
make a copy from [our GitHub repository](https://github.com/ionic-enterprise/tutorials-and-demos-vue/tree/main/identity-vault/startup-strategies).

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

```typescript src/views/Tab2Page.vue focus=15:38,47:51,56:69
<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Tab 2</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Tab 2</ion-title>
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
            <ul v-if="availableHardware?.length">
              <li v-for="h of availableHardware" :key="h">{{h}}</li>
            </ul>
            <ul v-if="availableHardware?.length === 0">
              <li>None</li>
            </ul>
          </div>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonNote,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/vue';
import { ref } from 'vue';
import { Device } from '@ionic-enterprise/identity-vault';

const hasSecureHardware = ref<boolean>(false);
const isBiometricsSupported = ref<boolean>(false);
const availableHardware = ref<Array<string>>([]);

const initialize = async (): Promise<void> => {
  hasSecureHardware.value = await Device.hasSecureHardware();
  isBiometricsSupported.value = await Device.isBiometricsSupported();
  availableHardware.value = await Device.getAvailableHardware();
}

initialize();
</script>
```

</CH.Code>

Note that these value are consistent on a particular device, regardless of whether or not biometrics is currently
configured on that device.

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

<CH.Code rows={72}>

```typescript src/views/Tab2Page.vue focus=38:64,90:95,102:107
<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Tab 2</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Tab 2</ion-title>
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
            <ul v-if="availableHardware?.length">
              <li v-for="h of availableHardware" :key="h">{{h}}</li>
            </ul>
            <ul v-if="availableHardware?.length === 0">
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
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonNote,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/vue';
import { ref } from 'vue';
import { Device } from '@ionic-enterprise/identity-vault';

const hasSecureHardware = ref<boolean>(false);
const isBiometricsSupported = ref<boolean>(false);
const availableHardware = ref<Array<string>>([]);

const biometricStrengthLevel = ref< string>('');
const isBiometricsAllowed = ref< string>('');
const isBiometricsEnabled = ref< boolean>(false);
const isHideScreenOnBackgroundEnabled = ref<boolean>(false);
const isLockedOutOfBiometrics = ref<boolean>(false);
const isSystemPasscodeSet = ref<boolean>(false);

const initialize = async (): Promise<void> => {
  hasSecureHardware.value = await Device.hasSecureHardware();
  isBiometricsSupported.value = await Device.isBiometricsSupported();
  availableHardware.value = await Device.getAvailableHardware();

  biometricStrengthLevel.value = await Device.getBiometricStrengthLevel();
  isBiometricsAllowed.value = await Device.isBiometricsAllowed();
  isBiometricsEnabled.value = await Device.isBiometricsEnabled();
  isHideScreenOnBackgroundEnabled.value = await Device.isHideScreenOnBackgroundEnabled();
  isLockedOutOfBiometrics.value = await Device.isLockedOutOfBiometrics();
  isSystemPasscodeSet.value = await Device.isSystemPasscodeSet();
}

initialize();
</script>
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

<CH.Code rows={82}>

```typescript src/views/Tab2Page.vue focus=65:81,89,128:142
<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Tab 2</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Tab 2</ion-title>
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
            <ul v-if="availableHardware?.length">
              <li v-for="h of availableHardware" :key="h">{{h}}</li>
            </ul>
            <ul v-if="availableHardware?.length === 0">
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
            <ion-button expand="block" :disabled="!isBiometricsEnabled" @click="showBiometricPrompt"
              >Show Biometric Prompt</ion-button
            >
          </ion-label>
        </ion-item>
        <ion-item>
          <ion-label>
            <ion-button expand="block" @click="toggleHideScreenOnBackground"
              >{{isHideScreenOnBackgroundEnabled ? 'Disable' : 'Enable'}} Security Screen</ion-button
            >
          </ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonButton,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonNote,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/vue';
import { ref } from 'vue';
import { Device } from '@ionic-enterprise/identity-vault';

const hasSecureHardware = ref<boolean>(false);
const isBiometricsSupported = ref<boolean>(false);
const availableHardware = ref<Array<string>>([]);

const biometricStrengthLevel = ref< string>('');
const isBiometricsAllowed = ref< string>('');
const isBiometricsEnabled = ref< boolean>(false);
const isHideScreenOnBackgroundEnabled = ref<boolean>(false);
const isLockedOutOfBiometrics = ref<boolean>(false);
const isSystemPasscodeSet = ref<boolean>(false);

const initialize = async (): Promise<void> => {
  hasSecureHardware.value = await Device.hasSecureHardware();
  isBiometricsSupported.value = await Device.isBiometricsSupported();
  availableHardware.value = await Device.getAvailableHardware();

  biometricStrengthLevel.value = await Device.getBiometricStrengthLevel();
  isBiometricsAllowed.value = await Device.isBiometricsAllowed();
  isBiometricsEnabled.value = await Device.isBiometricsEnabled();
  isHideScreenOnBackgroundEnabled.value = await Device.isHideScreenOnBackgroundEnabled();
  isLockedOutOfBiometrics.value = await Device.isLockedOutOfBiometrics();
  isSystemPasscodeSet.value = await Device.isSystemPasscodeSet();
}

const toggleHideScreenOnBackground = async (): Promise<void> => {
  await Device.setHideScreenOnBackground(!isHideScreenOnBackgroundEnabled.value);
  isHideScreenOnBackgroundEnabled.value = await Device.isHideScreenOnBackgroundEnabled();
}

const showBiometricPrompt = async (): Promise<void> => {
  try {
    await Device.showBiometricPrompt({
      iosBiometricsLocalizedReason: 'Just to show you how this works',
    });
  } catch (e) {
    // This is the most likely scenario
    alert('user cancelled biometrics prompt');
  }
}

initialize();
</script>
```

</CH.Code>

Build the code and install it on a variety of different types of devices to see how the procedures behave.

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

<CH.Code rows={75}>

```vue src/views/Tab1Page.vue focus=27,83,84,86,91:93,100
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

      <ion-list>
        <ion-item>
          <ion-label>
            <ion-button expand="block" color="danger" @click="logoutClicked" data-testid="logout">Logout</ion-button>
          </ion-label>
        </ion-item>
        <ion-item>
          <ion-label>
            <ion-button
              expand="block"
              color="secondary"
              @click="updateUnlockMode('BiometricsWithPasscode')"
              :disabled="disableBiometrics"
              data-testid="use-biometrics"
              >Use Biometrics</ion-button
            >
          </ion-label>
        </ion-item>
        <ion-item>
          <ion-label>
            <ion-button
              expand="block"
              color="secondary"
              @click="updateUnlockMode('InMemory')"
              data-testid="use-in-memory"
              >Use In Memory</ion-button
            >
          </ion-label>
        </ion-item>
        <ion-item>
          <ion-label>
            <ion-button
              expand="block"
              color="secondary"
              @click="updateUnlockMode('SecureStorage')"
              data-testid="use-secure-storage"
              >Use Secure Storage</ion-button
            >
          </ion-label>
        </ion-item>
        <ion-item>
          <div data-testid="session">
            <div>{{ session?.email }}</div>
            <div>{{ session?.firstName }} {{ session?.lastName }}</div>
            <div>{{ session?.accessToken }}</div>
            <div>{{ session?.refreshToken }}</div>
          </div>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { useAuthentication } from '@/composables/authentication';
import { useSessionVault } from '@/composables/session-vault';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/vue';
import { useRouter } from 'vue-router';
import { Device } from '@ionic-enterprise/identity-vault';
import { ref } from 'vue';

const disableBiometrics = ref(false);
const { logout } = useAuthentication();
const { session, updateUnlockMode } = useSessionVault();
const router = useRouter();

const initialize = async (): Promise<void> => {
  disableBiometrics.value = !(await Device.isBiometricsEnabled());
};

const logoutClicked = async (): Promise<void> => {
  await logout();
  router.replace('/');
};

initialize();
</script>
```

</CH.Code>

### Show the Privacy Screen

Many applications that use Identity Vault also display sensitive data that the user may not want shown if the
application is shown in the app switcher. Identity Vault has a "privacy screen" feature that will obscure the
page contents in this situation. On Android, a gray or black page will be shown instead. On iOS, the splash
screen will be displayed.

In the `Tab2Page` we show how to use `Device.setHideScreenOnBackground()` to toggle this feature on and off.
Most applications will either want this feature on or off without a toggle. In such cases, it is best to set
the feature however you wish upon application startup.

<CH.Code rows={27}>

```typescript src/main.ts focus=7,30
import { createApp } from 'vue';
import { useSessionVault } from '@/composables/session-vault';
import App from './App.vue';
import router from './router';

import { IonicVue } from '@ionic/vue';
import { Device } from '@ionic-enterprise/identity-vault';

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';

/* Theme variables */
import './theme/variables.css';

const { initializeVault } = useSessionVault();

Device.setHideScreenOnBackground(true);

initializeVault().then(async () => {
  const app = createApp(App).use(IonicVue).use(router);
  await router.isReady();
  app.mount('#app');
});
```

</CH.Code>

You could also put the `Device.setHideScreenOnBackground(true)` call within the `initializeVault().then()` callback
and then `await` it before mounting the app. Doing so is fine, but not necessary.

<Admonition type="note">

You may also be tempted to include the `Device.setHideScreenOnBackground(true)` call in the `initializeVault()`
function itself. It is a best-practice, however, to keep the code separate from the vault code to avoid confusion in
cases where the application needs to use multiple vaults.

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

```typescript src/composables/session-vault.ts focus=20:23
import { useVaultFactory } from '@/composables/vault-factory';
import { Session } from '@/models/session';
import {
  BrowserVault,
  DeviceSecurityType,
  IdentityVaultConfig,
  Vault,
  VaultType,
} from '@ionic-enterprise/identity-vault';
import { ref } from 'vue';

export type UnlockMode = 'BiometricsWithPasscode' | 'InMemory' | 'SecureStorage';

const { createVault } = useVaultFactory();
const vault: Vault | BrowserVault = createVault();
const session = ref<Session | null>(null);

const initializeVault = async (): Promise<void> => {
  await vault.initialize({
    key: 'io.ionic.gettingstartediv',
    type: VaultType.SecureStorage,
    deviceSecurityType: DeviceSecurityType.None,
    lockAfterBackgrounded: 2000,
  });

  vault.onLock(() => (session.value = null));
};

const storeSession = async (s: Session): Promise<void> => {
  vault.setValue('session', s);
  session.value = s;
};

const getSession = async (): Promise<void> => {
  if (await vault.isEmpty()) {
    session.value = null;
  } else {
    session.value = await vault.getValue<Session>('session');
  }
};

const clearSession = async (): Promise<void> => {
  await vault.clear();
  session.value = null;
};

const lockSession = async (): Promise<void> => {
  await vault.lock();
  session.value = null;
};

const unlockSession = async (): Promise<void> => {
  await vault.unlock();
  session.value = await vault.getValue<Session>('session');
};

const sessionIsLocked = async (): Promise<boolean> => {
  return (
    vault.config?.type !== VaultType.SecureStorage &&
    vault.config?.type !== VaultType.InMemory &&
    !(await vault.isEmpty()) &&
    (await vault.isLocked())
  );
};

const updateUnlockMode = async (mode: UnlockMode): Promise<void> => {
  const type =
    mode === 'BiometricsWithPasscode'
      ? VaultType.DeviceSecurity
      : mode === 'InMemory'
        ? VaultType.InMemory
        : VaultType.SecureStorage;
  const deviceSecurityType = type === VaultType.DeviceSecurity ? DeviceSecurityType.Both : DeviceSecurityType.None;
  await vault.updateConfig({
    ...(vault.config as IdentityVaultConfig),
    type,
    deviceSecurityType,
  });
};

export const useSessionVault = (): any => ({
  clearSession,
  getSession,
  initializeVault,
  lockSession,
  session,
  storeSession,
  updateUnlockMode,
});
```

</CH.Code>

Our app is written to start with a Secure Storage type vault.

---

<CH.Code>

```typescript src/composables/session-vault.ts focus=5,22,24
import { useVaultFactory } from '@/composables/vault-factory';
import { Session } from '@/models/session';
import {
  BrowserVault,
  Device,
  DeviceSecurityType,
  IdentityVaultConfig,
  Vault,
  VaultType,
} from '@ionic-enterprise/identity-vault';
import { ref } from 'vue';

export type UnlockMode = 'BiometricsWithPasscode' | 'InMemory' | 'SecureStorage';

const { createVault } = useVaultFactory();
const vault: Vault | BrowserVault = createVault();
const session = ref<Session | null>(null);

const initializeVault = async (): Promise<void> => {
  await vault.initialize({
    key: 'io.ionic.gettingstartediv',
    type: VaultType.InMemory,
    deviceSecurityType: DeviceSecurityType.None,
    lockAfterBackgrounded: 30000,
  });

  vault.onLock(() => (session.value = null));
};

const storeSession = async (s: Session): Promise<void> => {
  vault.setValue('session', s);
  session.value = s;
};

const getSession = async (): Promise<void> => {
  if (await vault.isEmpty()) {
    session.value = null;
  } else {
    session.value = await vault.getValue<Session>('session');
  }
};

const clearSession = async (): Promise<void> => {
  await vault.clear();
  session.value = null;
};

const lockSession = async (): Promise<void> => {
  await vault.lock();
  session.value = null;
};

const unlockSession = async (): Promise<void> => {
  await vault.unlock();
  session.value = await vault.getValue<Session>('session');
};

const sessionIsLocked = async (): Promise<boolean> => {
  return (
    vault.config?.type !== VaultType.SecureStorage &&
    vault.config?.type !== VaultType.InMemory &&
    !(await vault.isEmpty()) &&
    (await vault.isLocked())
  );
};

const updateUnlockMode = async (mode: UnlockMode): Promise<void> => {
  const type =
    mode === 'BiometricsWithPasscode'
      ? VaultType.DeviceSecurity
      : mode === 'InMemory'
        ? VaultType.InMemory
        : VaultType.SecureStorage;
  const deviceSecurityType = type === VaultType.DeviceSecurity ? DeviceSecurityType.Both : DeviceSecurityType.None;
  await vault.updateConfig({
    ...(vault.config as IdentityVaultConfig),
    type,
    deviceSecurityType,
  });
};

export const useSessionVault = (): any => ({
  clearSession,
  getSession,
  initializeVault,
  lockSession,
  session,
  storeSession,
  updateUnlockMode,
});
```

</CH.Code>

Import the `Device` class so we can use the API.

Change the `type` to be `InMemory` and increase the background lock time from 2 seconds to 30 seconds.

---

<CH.Code>

```typescript src/composables/session-vault.ts focus=27,32:36
import { useVaultFactory } from '@/composables/vault-factory';
import { Session } from '@/models/session';
import {
  BrowserVault,
  Device,
  DeviceSecurityType,
  IdentityVaultConfig,
  Vault,
  VaultType,
} from '@ionic-enterprise/identity-vault';
import { ref } from 'vue';

export type UnlockMode = 'BiometricsWithPasscode' | 'InMemory' | 'SecureStorage';

const { createVault } = useVaultFactory();
const vault: Vault | BrowserVault = createVault();
const session = ref<Session | null>(null);

const initializeVault = async (): Promise<void> => {
  await vault.initialize({
    key: 'io.ionic.gettingstartediv',
    type: VaultType.InMemory,
    deviceSecurityType: DeviceSecurityType.None,
    lockAfterBackgrounded: 30000,
  });

  await enhanceVault();

  vault.onLock(() => (session.value = null));
};

const enhanceVault = async (): Promise<void> => {
  if (!(await this.vault.isEmpty())) {
    return;
  }
};

const storeSession = async (s: Session): Promise<void> => {
  vault.setValue('session', s);
  session.value = s;
};

const getSession = async (): Promise<void> => {
  if (await vault.isEmpty()) {
    session.value = null;
  } else {
    session.value = await vault.getValue<Session>('session');
  }
};

const clearSession = async (): Promise<void> => {
  await vault.clear();
  session.value = null;
};

const lockSession = async (): Promise<void> => {
  await vault.lock();
  session.value = null;
};

const unlockSession = async (): Promise<void> => {
  await vault.unlock();
  session.value = await vault.getValue<Session>('session');
};

const sessionIsLocked = async (): Promise<boolean> => {
  return (
    vault.config?.type !== VaultType.SecureStorage &&
    vault.config?.type !== VaultType.InMemory &&
    !(await vault.isEmpty()) &&
    (await vault.isLocked())
  );
};

const updateUnlockMode = async (mode: UnlockMode): Promise<void> => {
  const type =
    mode === 'BiometricsWithPasscode'
      ? VaultType.DeviceSecurity
      : mode === 'InMemory'
        ? VaultType.InMemory
        : VaultType.SecureStorage;
  const deviceSecurityType = type === VaultType.DeviceSecurity ? DeviceSecurityType.Both : DeviceSecurityType.None;
  await vault.updateConfig({
    ...(vault.config as IdentityVaultConfig),
    type,
    deviceSecurityType,
  });
};

export const useSessionVault = (): any => ({
  clearSession,
  getSession,
  initializeVault,
  lockSession,
  session,
  storeSession,
  updateUnlockMode,
});
```

</CH.Code>

Add an `enhanceVault()` function. Per our first requirement, the vault should not be changed if it is already in use.

Enhance the vault as part of the initialization process.

---

<CH.Code>

```typescript src/composables/session-vault.ts focus=37:41
import { useVaultFactory } from '@/composables/vault-factory';
import { Session } from '@/models/session';
import {
  BrowserVault,
  Device,
  DeviceSecurityType,
  IdentityVaultConfig,
  Vault,
  VaultType,
} from '@ionic-enterprise/identity-vault';
import { ref } from 'vue';

export type UnlockMode = 'BiometricsWithPasscode' | 'InMemory' | 'SecureStorage';

const { createVault } = useVaultFactory();
const vault: Vault | BrowserVault = createVault();
const session = ref<Session | null>(null);

const initializeVault = async (): Promise<void> => {
  await vault.initialize({
    key: 'io.ionic.gettingstartediv',
    type: VaultType.InMemory,
    deviceSecurityType: DeviceSecurityType.None,
    lockAfterBackgrounded: 30000,
  });

  await enhanceVault();

  vault.onLock(() => (session.value = null));
};

const enhanceVault = async (): Promise<void> => {
  if (!(await this.vault.isEmpty())) {
    return;
  }

  if (await Device.isSystemPasscodeSet()) {
    await updateUnlockMode('BiometricsWithPasscode');
  } else {
    await updateUnlockMode('InMemory');
  }
};

const storeSession = async (s: Session): Promise<void> => {
  vault.setValue('session', s);
  session.value = s;
};

const getSession = async (): Promise<void> => {
  if (await vault.isEmpty()) {
    session.value = null;
  } else {
    session.value = await vault.getValue<Session>('session');
  }
};

const clearSession = async (): Promise<void> => {
  await vault.clear();
  session.value = null;
};

const lockSession = async (): Promise<void> => {
  await vault.lock();
  session.value = null;
};

const unlockSession = async (): Promise<void> => {
  await vault.unlock();
  session.value = await vault.getValue<Session>('session');
};

const sessionIsLocked = async (): Promise<boolean> => {
  return (
    vault.config?.type !== VaultType.SecureStorage &&
    vault.config?.type !== VaultType.InMemory &&
    !(await vault.isEmpty()) &&
    (await vault.isLocked())
  );
};

const updateUnlockMode = async (mode: UnlockMode): Promise<void> => {
  const type =
    mode === 'BiometricsWithPasscode'
      ? VaultType.DeviceSecurity
      : mode === 'InMemory'
        ? VaultType.InMemory
        : VaultType.SecureStorage;
  const deviceSecurityType = type === VaultType.DeviceSecurity ? DeviceSecurityType.Both : DeviceSecurityType.None;
  await vault.updateConfig({
    ...(vault.config as IdentityVaultConfig),
    type,
    deviceSecurityType,
  });
};

export const useSessionVault = (): any => ({
  clearSession,
  getSession,
  initializeVault,
  lockSession,
  session,
  storeSession,
  updateUnlockMode,
});
```

</CH.Code>

Use the proper vault type based on whether or not a system passcode is set.

---

<CH.Code>

```typescript src/composables/session-vault.ts focus=89,94
import { useVaultFactory } from '@/composables/vault-factory';
import { Session } from '@/models/session';
import {
  BrowserVault,
  Device,
  DeviceSecurityType,
  IdentityVaultConfig,
  Vault,
  VaultType,
} from '@ionic-enterprise/identity-vault';
import { ref } from 'vue';

export type UnlockMode = 'BiometricsWithPasscode' | 'InMemory' | 'SecureStorage';

const { createVault } = useVaultFactory();
const vault: Vault | BrowserVault = createVault();
const session = ref<Session | null>(null);

const initializeVault = async (): Promise<void> => {
  await vault.initialize({
    key: 'io.ionic.gettingstartediv',
    type: VaultType.InMemory,
    deviceSecurityType: DeviceSecurityType.None,
    lockAfterBackgrounded: 30000,
  });

  await enhanceVault();

  vault.onLock(() => (session.value = null));
};

const enhanceVault = async (): Promise<void> => {
  if (!(await this.vault.isEmpty())) {
    return;
  }

  if (await Device.isSystemPasscodeSet()) {
    await updateUnlockMode('BiometricsWithPasscode');
  } else {
    await updateUnlockMode('InMemory');
  }
};

const storeSession = async (s: Session): Promise<void> => {
  vault.setValue('session', s);
  session.value = s;
};

const getSession = async (): Promise<void> => {
  if (await vault.isEmpty()) {
    session.value = null;
  } else {
    session.value = await vault.getValue<Session>('session');
  }
};

const clearSession = async (): Promise<void> => {
  await vault.clear();
  session.value = null;
};

const lockSession = async (): Promise<void> => {
  await vault.lock();
  session.value = null;
};

const unlockSession = async (): Promise<void> => {
  await vault.unlock();
  session.value = await vault.getValue<Session>('session');
};

const sessionIsLocked = async (): Promise<boolean> => {
  return (
    vault.config?.type !== VaultType.SecureStorage &&
    vault.config?.type !== VaultType.InMemory &&
    !(await vault.isEmpty()) &&
    (await vault.isLocked())
  );
};

const updateUnlockMode = async (mode: UnlockMode): Promise<void> => {
  const type =
    mode === 'BiometricsWithPasscode'
      ? VaultType.DeviceSecurity
      : mode === 'InMemory'
        ? VaultType.InMemory
        : VaultType.SecureStorage;
  const deviceSecurityType = type === VaultType.DeviceSecurity ? DeviceSecurityType.Both : DeviceSecurityType.None;
  const lockAfterBackgrounded = type === VaultType.InMemory ? 30000 : 2000;
  await vault.updateConfig({
    ...(vault.config as IdentityVaultConfig),
    type,
    deviceSecurityType,
    lockAfterBackgrounded,
  });
};

export const useSessionVault = (): any => ({
  clearSession,
  getSession,
  initializeVault,
  lockSession,
  session,
  storeSession,
  updateUnlockMode,
});
```

</CH.Code>

Modify `updateUnlockMode()` to adjust the `lockAfterBackgrounded` time based on the type of vault used.

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

```typescript src/composables/session-vault.ts focus=4
import { useVaultFactory } from '@/composables/vault-factory';
import { Session } from '@/models/session';
import {
  BiometricPermissionState,
  BrowserVault,
  Device,
  DeviceSecurityType,
  IdentityVaultConfig,
  Vault,
  VaultType,
} from '@ionic-enterprise/identity-vault';
import { ref } from 'vue';

export type UnlockMode = 'BiometricsWithPasscode' | 'InMemory' | 'SecureStorage';

const { createVault } = useVaultFactory();
const vault: Vault | BrowserVault = createVault();
const session = ref<Session | null>(null);

const initializeVault = async (): Promise<void> => {
  await vault.initialize({
    key: 'io.ionic.gettingstartediv',
    type: VaultType.InMemory,
    deviceSecurityType: DeviceSecurityType.None,
    lockAfterBackgrounded: 30000,
  });

  await enhanceVault();

  vault.onLock(() => (session.value = null));
};

const enhanceVault = async (): Promise<void> => {
  if (!(await vault.isEmpty())) {
    return;
  }

  if (await Device.isSystemPasscodeSet()) {
    await updateUnlockMode('BiometricsWithPasscode');
  } else {
    await updateUnlockMode('InMemory');
  }
};

const storeSession = async (s: Session): Promise<void> => {
  vault.setValue('session', s);
  session.value = s;
};

const getSession = async (): Promise<void> => {
  if (await vault.isEmpty()) {
    session.value = null;
  } else {
    session.value = await vault.getValue<Session>('session');
  }
};

const clearSession = async (): Promise<void> => {
  await vault.clear();
  session.value = null;
};

const lockSession = async (): Promise<void> => {
  await vault.lock();
  session.value = null;
};

const unlockSession = async (): Promise<void> => {
  await vault.unlock();
  session.value = await vault.getValue<Session>('session');
};

const sessionIsLocked = async (): Promise<boolean> => {
  return (
    vault.config?.type !== VaultType.SecureStorage &&
    vault.config?.type !== VaultType.InMemory &&
    !(await vault.isEmpty()) &&
    (await vault.isLocked())
  );
};

const updateUnlockMode = async (mode: UnlockMode): Promise<void> => {
  const type =
    mode === 'BiometricsWithPasscode'
      ? VaultType.DeviceSecurity
      : mode === 'InMemory'
        ? VaultType.InMemory
        : VaultType.SecureStorage;
  const deviceSecurityType = type === VaultType.DeviceSecurity ? DeviceSecurityType.Both : DeviceSecurityType.None;
  const lockAfterBackgrounded = type === VaultType.InMemory ? 30000 : 2000;
  await vault.updateConfig({
    ...(vault.config as IdentityVaultConfig),
    type,
    deviceSecurityType,
    lockAfterBackgrounded,
  });
};

export const useSessionVault = (): any => ({
  clearSession,
  getSession,
  initializeVault,
  lockSession,
  session,
  storeSession,
  updateUnlockMode,
});
```

</CH.Code>

Add `BiometricPermissionState` to the items being imported from the Identity Vault package.

---

<CH.Code>

```typescript src/composables/session-vault.ts focus=99:107
import { useVaultFactory } from '@/composables/vault-factory';
import { Session } from '@/models/session';
import {
  BiometricPermissionState,
  BrowserVault,
  Device,
  DeviceSecurityType,
  IdentityVaultConfig,
  Vault,
  VaultType,
} from '@ionic-enterprise/identity-vault';
import { ref } from 'vue';

export type UnlockMode = 'BiometricsWithPasscode' | 'InMemory' | 'SecureStorage';

const { createVault } = useVaultFactory();
const vault: Vault | BrowserVault = createVault();
const session = ref<Session | null>(null);

const initializeVault = async (): Promise<void> => {
  await vault.initialize({
    key: 'io.ionic.gettingstartediv',
    type: VaultType.InMemory,
    deviceSecurityType: DeviceSecurityType.None,
    lockAfterBackgrounded: 30000,
  });

  await enhanceVault();

  vault.onLock(() => (session.value = null));
};

const enhanceVault = async (): Promise<void> => {
  if (!(await vault.isEmpty())) {
    return;
  }

  if (await Device.isSystemPasscodeSet()) {
    await updateUnlockMode('BiometricsWithPasscode');
  } else {
    await updateUnlockMode('InMemory');
  }
};

const storeSession = async (s: Session): Promise<void> => {
  vault.setValue('session', s);
  session.value = s;
};

const getSession = async (): Promise<void> => {
  if (await vault.isEmpty()) {
    session.value = null;
  } else {
    session.value = await vault.getValue<Session>('session');
  }
};

const clearSession = async (): Promise<void> => {
  await vault.clear();
  session.value = null;
};

const lockSession = async (): Promise<void> => {
  await vault.lock();
  session.value = null;
};

const unlockSession = async (): Promise<void> => {
  await vault.unlock();
  session.value = await vault.getValue<Session>('session');
};

const sessionIsLocked = async (): Promise<boolean> => {
  return (
    vault.config?.type !== VaultType.SecureStorage &&
    vault.config?.type !== VaultType.InMemory &&
    !(await vault.isEmpty()) &&
    (await vault.isLocked())
  );
};

const updateUnlockMode = async (mode: UnlockMode): Promise<void> => {
  const type =
    mode === 'BiometricsWithPasscode'
      ? VaultType.DeviceSecurity
      : mode === 'InMemory'
        ? VaultType.InMemory
        : VaultType.SecureStorage;
  const deviceSecurityType = type === VaultType.DeviceSecurity ? DeviceSecurityType.Both : DeviceSecurityType.None;
  const lockAfterBackgrounded = type === VaultType.InMemory ? 30000 : 2000;
  await vault.updateConfig({
    ...(vault.config as IdentityVaultConfig),
    type,
    deviceSecurityType,
    lockAfterBackgrounded,
  });
};

const provisionBiometrics = async (): Promise<void> => {
  if ((await Device.isBiometricsAllowed()) === BiometricPermissionState.Prompt) {
    try {
      await Device.showBiometricPrompt({ iosBiometricsLocalizedReason: 'Please authenticate to continue' });
    } catch (error) {
      null;
    }
  }
};

export const useSessionVault = (): any => ({
  clearSession,
  getSession,
  initializeVault,
  lockSession,
  session,
  storeSession,
  updateUnlockMode,
});
```

</CH.Code>

Add a `provisionBiometrics()` function but do not export it. Display the biometric prompt if permissions need to be prompted.

---

<CH.Code>

```typescript src/composables/session-vault.ts focus=83,94:100
import { useVaultFactory } from '@/composables/vault-factory';
import { Session } from '@/models/session';
import {
  BiometricPermissionState,
  BrowserVault,
  Device,
  DeviceSecurityType,
  IdentityVaultConfig,
  Vault,
  VaultType,
} from '@ionic-enterprise/identity-vault';
import { ref } from 'vue';

export type UnlockMode = 'BiometricsWithPasscode' | 'InMemory' | 'SecureStorage';

const { createVault } = useVaultFactory();
const vault: Vault | BrowserVault = createVault();
const session = ref<Session | null>(null);

const initializeVault = async (): Promise<void> => {
  await vault.initialize({
    key: 'io.ionic.gettingstartediv',
    type: VaultType.InMemory,
    deviceSecurityType: DeviceSecurityType.None,
    lockAfterBackgrounded: 30000,
  });

  await enhanceVault();

  vault.onLock(() => (session.value = null));
};

const enhanceVault = async (): Promise<void> => {
  if (!(await vault.isEmpty())) {
    return;
  }

  if (await Device.isSystemPasscodeSet()) {
    await updateUnlockMode('BiometricsWithPasscode');
  } else {
    await updateUnlockMode('InMemory');
  }
};

const storeSession = async (s: Session): Promise<void> => {
  vault.setValue('session', s);
  session.value = s;
};

const getSession = async (): Promise<void> => {
  if (await vault.isEmpty()) {
    session.value = null;
  } else {
    session.value = await vault.getValue<Session>('session');
  }
};

const clearSession = async (): Promise<void> => {
  await vault.clear();
  session.value = null;
};

const lockSession = async (): Promise<void> => {
  await vault.lock();
  session.value = null;
};

const unlockSession = async (): Promise<void> => {
  await vault.unlock();
  session.value = await vault.getValue<Session>('session');
};

const sessionIsLocked = async (): Promise<boolean> => {
  return (
    vault.config?.type !== VaultType.SecureStorage &&
    vault.config?.type !== VaultType.InMemory &&
    !(await vault.isEmpty()) &&
    (await vault.isLocked())
  );
};

const updateUnlockMode = async (mode: UnlockMode): Promise<void> => {
  const type = getVaultType(mode);
  const deviceSecurityType = type === VaultType.DeviceSecurity ? DeviceSecurityType.Both : DeviceSecurityType.None;
  const lockAfterBackgrounded = type === VaultType.InMemory ? 30000 : 2000;
  await vault.updateConfig({
    ...(vault.config as IdentityVaultConfig),
    type,
    deviceSecurityType,
    lockAfterBackgrounded,
  });
};

const getVaultType = async (mode: UnlockMode): Promise<VaultType> => {
  return mode === 'BiometricsWithPasscode'
    ? VaultType.DeviceSecurity
    : mode === 'InMemory'
      ? VaultType.InMemory
      : VaultType.SecureStorage;
};

const provisionBiometrics = async (): Promise<void> => {
  if ((await Device.isBiometricsAllowed()) === BiometricPermissionState.Prompt) {
    try {
      await Device.showBiometricPrompt({ iosBiometricsLocalizedReason: 'Please authenticate to continue' });
    } catch (error) {
      null;
    }
  }
};

export const useSessionVault = (): any => ({
  clearSession,
  getSession,
  initializeVault,
  lockSession,
  session,
  storeSession,
  updateUnlockMode,
});
```

</CH.Code>

Determining the proper vault type is going to get more complex, so let's start by abstracting that logic into
its own method.

---

<CH.Code>

```typescript src/composables/session-vault.ts focus=95:99
import { useVaultFactory } from '@/composables/vault-factory';
import { Session } from '@/models/session';
import {
  BiometricPermissionState,
  BrowserVault,
  Device,
  DeviceSecurityType,
  IdentityVaultConfig,
  Vault,
  VaultType,
} from '@ionic-enterprise/identity-vault';
import { ref } from 'vue';

export type UnlockMode = 'BiometricsWithPasscode' | 'InMemory' | 'SecureStorage';

const { createVault } = useVaultFactory();
const vault: Vault | BrowserVault = createVault();
const session = ref<Session | null>(null);

const initializeVault = async (): Promise<void> => {
  await vault.initialize({
    key: 'io.ionic.gettingstartediv',
    type: VaultType.InMemory,
    deviceSecurityType: DeviceSecurityType.None,
    lockAfterBackgrounded: 30000,
  });

  await enhanceVault();

  vault.onLock(() => (session.value = null));
};

const enhanceVault = async (): Promise<void> => {
  if (!(await vault.isEmpty())) {
    return;
  }

  if (await Device.isSystemPasscodeSet()) {
    await updateUnlockMode('BiometricsWithPasscode');
  } else {
    await updateUnlockMode('InMemory');
  }
};

const storeSession = async (s: Session): Promise<void> => {
  vault.setValue('session', s);
  session.value = s;
};

const getSession = async (): Promise<void> => {
  if (await vault.isEmpty()) {
    session.value = null;
  } else {
    session.value = await vault.getValue<Session>('session');
  }
};

const clearSession = async (): Promise<void> => {
  await vault.clear();
  session.value = null;
};

const lockSession = async (): Promise<void> => {
  await vault.lock();
  session.value = null;
};

const unlockSession = async (): Promise<void> => {
  await vault.unlock();
  session.value = await vault.getValue<Session>('session');
};

const sessionIsLocked = async (): Promise<boolean> => {
  return (
    vault.config?.type !== VaultType.SecureStorage &&
    vault.config?.type !== VaultType.InMemory &&
    !(await vault.isEmpty()) &&
    (await vault.isLocked())
  );
};

const updateUnlockMode = async (mode: UnlockMode): Promise<void> => {
  const type = getVaultType(mode);
  const deviceSecurityType = type === VaultType.DeviceSecurity ? DeviceSecurityType.Both : DeviceSecurityType.None;
  const lockAfterBackgrounded = type === VaultType.InMemory ? 30000 : 2000;
  await vault.updateConfig({
    ...(vault.config as IdentityVaultConfig),
    type,
    deviceSecurityType,
    lockAfterBackgrounded,
  });
};

const getVaultType = async (mode: UnlockMode): Promise<VaultType> => {
  if (mode === 'BiometricsWithPasscode') {
    return VaultType.DeviceSecurity;
  }

  return mode === 'InMemory' ? VaultType.InMemory : VaultType.SecureStorage;
};

const provisionBiometrics = async (): Promise<void> => {
  if ((await Device.isBiometricsAllowed()) === BiometricPermissionState.Prompt) {
    try {
      await Device.showBiometricPrompt({ iosBiometricsLocalizedReason: 'Please authenticate to continue' });
    } catch (error) {
      null;
    }
  }
};

export const useSessionVault = (): any => ({
  clearSession,
  getSession,
  initializeVault,
  lockSession,
  session,
  storeSession,
  updateUnlockMode,
});
```

</CH.Code>

Biometrics will be special, so let's give it its own section.

---

<CH.Code>

```typescript src/composables/session-vault.ts focus=96
import { useVaultFactory } from '@/composables/vault-factory';
import { Session } from '@/models/session';
import {
  BiometricPermissionState,
  BrowserVault,
  Device,
  DeviceSecurityType,
  IdentityVaultConfig,
  Vault,
  VaultType,
} from '@ionic-enterprise/identity-vault';
import { ref } from 'vue';

export type UnlockMode = 'BiometricsWithPasscode' | 'InMemory' | 'SecureStorage';

const { createVault } = useVaultFactory();
const vault: Vault | BrowserVault = createVault();
const session = ref<Session | null>(null);

const initializeVault = async (): Promise<void> => {
  await vault.initialize({
    key: 'io.ionic.gettingstartediv',
    type: VaultType.InMemory,
    deviceSecurityType: DeviceSecurityType.None,
    lockAfterBackgrounded: 30000,
  });

  await enhanceVault();

  vault.onLock(() => (session.value = null));
};

const enhanceVault = async (): Promise<void> => {
  if (!(await vault.isEmpty())) {
    return;
  }

  if (await Device.isSystemPasscodeSet()) {
    await updateUnlockMode('BiometricsWithPasscode');
  } else {
    await updateUnlockMode('InMemory');
  }
};

const storeSession = async (s: Session): Promise<void> => {
  vault.setValue('session', s);
  session.value = s;
};

const getSession = async (): Promise<void> => {
  if (await vault.isEmpty()) {
    session.value = null;
  } else {
    session.value = await vault.getValue<Session>('session');
  }
};

const clearSession = async (): Promise<void> => {
  await vault.clear();
  session.value = null;
};

const lockSession = async (): Promise<void> => {
  await vault.lock();
  session.value = null;
};

const unlockSession = async (): Promise<void> => {
  await vault.unlock();
  session.value = await vault.getValue<Session>('session');
};

const sessionIsLocked = async (): Promise<boolean> => {
  return (
    vault.config?.type !== VaultType.SecureStorage &&
    vault.config?.type !== VaultType.InMemory &&
    !(await vault.isEmpty()) &&
    (await vault.isLocked())
  );
};

const updateUnlockMode = async (mode: UnlockMode): Promise<void> => {
  const type = getVaultType(mode);
  const deviceSecurityType = type === VaultType.DeviceSecurity ? DeviceSecurityType.Both : DeviceSecurityType.None;
  const lockAfterBackgrounded = type === VaultType.InMemory ? 30000 : 2000;
  await vault.updateConfig({
    ...(vault.config as IdentityVaultConfig),
    type,
    deviceSecurityType,
    lockAfterBackgrounded,
  });
};

const getVaultType = async (mode: UnlockMode): Promise<VaultType> => {
  if (mode === 'BiometricsWithPasscode') {
    await provisionBiometrics();
    return VaultType.DeviceSecurity;
  }

  return mode === 'InMemory' ? VaultType.InMemory : VaultType.SecureStorage;
};

const provisionBiometrics = async (): Promise<void> => {
  if ((await Device.isBiometricsAllowed()) === BiometricPermissionState.Prompt) {
    try {
      await Device.showBiometricPrompt({ iosBiometricsLocalizedReason: 'Please authenticate to continue' });
    } catch (error) {
      null;
    }
  }
};

export const useSessionVault = (): any => ({
  clearSession,
  getSession,
  initializeVault,
  lockSession,
  session,
  storeSession,
  updateUnlockMode,
});
```

</CH.Code>

Provision the Biometrics.

---

<CH.Code>

```typescript src/composables/session-vault.ts focus=97:100
import { useVaultFactory } from '@/composables/vault-factory';
import { Session } from '@/models/session';
import {
  BiometricPermissionState,
  BrowserVault,
  Device,
  DeviceSecurityType,
  IdentityVaultConfig,
  Vault,
  VaultType,
} from '@ionic-enterprise/identity-vault';
import { ref } from 'vue';

export type UnlockMode = 'BiometricsWithPasscode' | 'InMemory' | 'SecureStorage';

const { createVault } = useVaultFactory();
const vault: Vault | BrowserVault = createVault();
const session = ref<Session | null>(null);

const initializeVault = async (): Promise<void> => {
  await vault.initialize({
    key: 'io.ionic.gettingstartediv',
    type: VaultType.InMemory,
    deviceSecurityType: DeviceSecurityType.None,
    lockAfterBackgrounded: 30000,
  });

  await enhanceVault();

  vault.onLock(() => (session.value = null));
};

const enhanceVault = async (): Promise<void> => {
  if (!(await vault.isEmpty())) {
    return;
  }

  if (await Device.isSystemPasscodeSet()) {
    await updateUnlockMode('BiometricsWithPasscode');
  } else {
    await updateUnlockMode('InMemory');
  }
};

const storeSession = async (s: Session): Promise<void> => {
  vault.setValue('session', s);
  session.value = s;
};

const getSession = async (): Promise<void> => {
  if (await vault.isEmpty()) {
    session.value = null;
  } else {
    session.value = await vault.getValue<Session>('session');
  }
};

const clearSession = async (): Promise<void> => {
  await vault.clear();
  session.value = null;
};

const lockSession = async (): Promise<void> => {
  await vault.lock();
  session.value = null;
};

const unlockSession = async (): Promise<void> => {
  await vault.unlock();
  session.value = await vault.getValue<Session>('session');
};

const sessionIsLocked = async (): Promise<boolean> => {
  return (
    vault.config?.type !== VaultType.SecureStorage &&
    vault.config?.type !== VaultType.InMemory &&
    !(await vault.isEmpty()) &&
    (await vault.isLocked())
  );
};

const updateUnlockMode = async (mode: UnlockMode): Promise<void> => {
  const type = getVaultType(mode);
  const deviceSecurityType = type === VaultType.DeviceSecurity ? DeviceSecurityType.Both : DeviceSecurityType.None;
  const lockAfterBackgrounded = type === VaultType.InMemory ? 30000 : 2000;
  await vault.updateConfig({
    ...(vault.config as IdentityVaultConfig),
    type,
    deviceSecurityType,
    lockAfterBackgrounded,
  });
};

const getVaultType = async (mode: UnlockMode): Promise<VaultType> => {
  if (mode === 'BiometricsWithPasscode') {
    await provisionBiometrics();
    return (await Device.isBiometricsEnabled()) &&
      (await Device.isBiometricsAllowed()) !== BiometricPermissionState.Granted
      ? VaultType.InMemory
      : VaultType.DeviceSecurity;
  }

  return mode === 'InMemory' ? VaultType.InMemory : VaultType.SecureStorage;
};

const provisionBiometrics = async (): Promise<void> => {
  if ((await Device.isBiometricsAllowed()) === BiometricPermissionState.Prompt) {
    try {
      await Device.showBiometricPrompt({ iosBiometricsLocalizedReason: 'Please authenticate to continue' });
    } catch (error) {
      null;
    }
  }
};

export const useSessionVault = (): any => ({
  clearSession,
  getSession,
  initializeVault,
  lockSession,
  session,
  storeSession,
  updateUnlockMode,
});
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

```typescript src/composables/session-vault.ts focus=118
import { useVaultFactory } from '@/composables/vault-factory';
import { Session } from '@/models/session';
import {
  BiometricPermissionState,
  BrowserVault,
  Device,
  DeviceSecurityType,
  IdentityVaultConfig,
  Vault,
  VaultType,
} from '@ionic-enterprise/identity-vault';
import { ref } from 'vue';

export type UnlockMode = 'BiometricsWithPasscode' | 'InMemory' | 'SecureStorage';

const { createVault } = useVaultFactory();
const vault: Vault | BrowserVault = createVault();
const session = ref<Session | null>(null);

const initializeVault = async (): Promise<void> => {
  await vault.initialize({
    key: 'io.ionic.gettingstartediv',
    type: VaultType.InMemory,
    deviceSecurityType: DeviceSecurityType.None,
    lockAfterBackgrounded: 30000,
  });

  await enhanceVault();

  vault.onLock(() => (session.value = null));
};

const enhanceVault = async (): Promise<void> => {
  if (!(await vault.isEmpty())) {
    return;
  }

  if (await Device.isSystemPasscodeSet()) {
    await updateUnlockMode('BiometricsWithPasscode');
  } else {
    await updateUnlockMode('InMemory');
  }
};

const storeSession = async (s: Session): Promise<void> => {
  vault.setValue('session', s);
  session.value = s;
};

const getSession = async (): Promise<void> => {
  if (await vault.isEmpty()) {
    session.value = null;
  } else {
    session.value = await vault.getValue<Session>('session');
  }
};

const clearSession = async (): Promise<void> => {
  await vault.clear();
  session.value = null;
};

const lockSession = async (): Promise<void> => {
  await vault.lock();
  session.value = null;
};

const unlockSession = async (): Promise<void> => {
  await vault.unlock();
  session.value = await vault.getValue<Session>('session');
};

const sessionIsLocked = async (): Promise<boolean> => {
  return (
    vault.config?.type !== VaultType.SecureStorage &&
    vault.config?.type !== VaultType.InMemory &&
    !(await vault.isEmpty()) &&
    (await vault.isLocked())
  );
};

const updateUnlockMode = async (mode: UnlockMode): Promise<void> => {
  const type = getVaultType(mode);
  const deviceSecurityType = type === VaultType.DeviceSecurity ? DeviceSecurityType.Both : DeviceSecurityType.None;
  const lockAfterBackgrounded = type === VaultType.InMemory ? 30000 : 2000;
  await vault.updateConfig({
    ...(vault.config as IdentityVaultConfig),
    type,
    deviceSecurityType,
    lockAfterBackgrounded,
  });
};

const getVaultType = async (mode: UnlockMode): Promise<VaultType> => {
  if (mode === 'BiometricsWithPasscode') {
    await provisionBiometrics();
    return (await Device.isBiometricsEnabled()) &&
      (await Device.isBiometricsAllowed()) !== BiometricPermissionState.Granted
      ? VaultType.InMemory
      : VaultType.DeviceSecurity;
  }

  return mode === 'InMemory' ? VaultType.InMemory : VaultType.SecureStorage;
};

const provisionBiometrics = async (): Promise<void> => {
  if ((await Device.isBiometricsAllowed()) === BiometricPermissionState.Prompt) {
    try {
      await Device.showBiometricPrompt({ iosBiometricsLocalizedReason: 'Please authenticate to continue' });
    } catch (error) {
      null;
    }
  }
};

export const useSessionVault = (): any => ({
  clearSession,
  enhanceVault,
  getSession,
  initializeVault,
  lockSession,
  session,
  storeSession,
  updateUnlockMode,
});
```

```vue src/views/LoginPage.vue
<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Login</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Login</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-list>
        <ion-item>
          <ion-label>
            <ion-button expand="block" @click="handleLogin" data-testid="login">Login</ion-button>
          </ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonButton,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonTitle,
  IonToolbar,
} from '@ionic/vue';
import { useRouter } from 'vue-router';
import { useAuthentication } from '@/composables/authentication';

const { login } = useAuthentication();
const router = useRouter();

const handleLogin = async () => {
  try {
    await login();
    router.replace('/tabs/tab1');
  } catch (error: unknown) {
    console.error('Failed to log in', error);
  }
};
</script>
```

</CH.Code>

Export the `enhanceVault()` function.

---

<CH.Code>

```typescript src/composables/session-vault.ts focus=34:36
import { useVaultFactory } from '@/composables/vault-factory';
import { Session } from '@/models/session';
import {
  BiometricPermissionState,
  BrowserVault,
  Device,
  DeviceSecurityType,
  IdentityVaultConfig,
  Vault,
  VaultType,
} from '@ionic-enterprise/identity-vault';
import { ref } from 'vue';

export type UnlockMode = 'BiometricsWithPasscode' | 'InMemory' | 'SecureStorage';

const { createVault } = useVaultFactory();
const vault: Vault | BrowserVault = createVault();
const session = ref<Session | null>(null);

const initializeVault = async (): Promise<void> => {
  await vault.initialize({
    key: 'io.ionic.gettingstartediv',
    type: VaultType.InMemory,
    deviceSecurityType: DeviceSecurityType.None,
    lockAfterBackgrounded: 30000,
  });

  await enhanceVault();

  vault.onLock(() => (session.value = null));
};

const enhanceVault = async (): Promise<void> => {
  if (!(await vault.isEmpty())) {
    return;
  }

  if (await Device.isSystemPasscodeSet()) {
    await updateUnlockMode('BiometricsWithPasscode');
  } else {
    await updateUnlockMode('InMemory');
  }
};

const storeSession = async (s: Session): Promise<void> => {
  vault.setValue('session', s);
  session.value = s;
};

const getSession = async (): Promise<void> => {
  if (await vault.isEmpty()) {
    session.value = null;
  } else {
    session.value = await vault.getValue<Session>('session');
  }
};

const clearSession = async (): Promise<void> => {
  await vault.clear();
  session.value = null;
};

const lockSession = async (): Promise<void> => {
  await vault.lock();
  session.value = null;
};

const unlockSession = async (): Promise<void> => {
  await vault.unlock();
  session.value = await vault.getValue<Session>('session');
};

const sessionIsLocked = async (): Promise<boolean> => {
  return (
    vault.config?.type !== VaultType.SecureStorage &&
    vault.config?.type !== VaultType.InMemory &&
    !(await vault.isEmpty()) &&
    (await vault.isLocked())
  );
};

const updateUnlockMode = async (mode: UnlockMode): Promise<void> => {
  const type = getVaultType(mode);
  const deviceSecurityType = type === VaultType.DeviceSecurity ? DeviceSecurityType.Both : DeviceSecurityType.None;
  const lockAfterBackgrounded = type === VaultType.InMemory ? 30000 : 2000;
  await vault.updateConfig({
    ...(vault.config as IdentityVaultConfig),
    type,
    deviceSecurityType,
    lockAfterBackgrounded,
  });
};

const getVaultType = async (mode: UnlockMode): Promise<VaultType> => {
  if (mode === 'BiometricsWithPasscode') {
    await provisionBiometrics();
    return (await Device.isBiometricsEnabled()) &&
      (await Device.isBiometricsAllowed()) !== BiometricPermissionState.Granted
      ? VaultType.InMemory
      : VaultType.DeviceSecurity;
  }

  return mode === 'InMemory' ? VaultType.InMemory : VaultType.SecureStorage;
};

const provisionBiometrics = async (): Promise<void> => {
  if ((await Device.isBiometricsAllowed()) === BiometricPermissionState.Prompt) {
    try {
      await Device.showBiometricPrompt({ iosBiometricsLocalizedReason: 'Please authenticate to continue' });
    } catch (error) {
      null;
    }
  }
};

export const useSessionVault = (): any => ({
  clearSession,
  enhanceVault,
  getSession,
  initializeVault,
  lockSession,
  session,
  storeSession,
  updateUnlockMode,
});
```

</CH.Code>

`enhanceVault()` currently does not enhance a vault that is in use.

---

<CH.Code>

```typescript src/composables/session-vault.ts focus=34:38
import { useVaultFactory } from '@/composables/vault-factory';
import { Session } from '@/models/session';
import {
  BiometricPermissionState,
  BrowserVault,
  Device,
  DeviceSecurityType,
  IdentityVaultConfig,
  Vault,
  VaultType,
} from '@ionic-enterprise/identity-vault';
import { ref } from 'vue';

export type UnlockMode = 'BiometricsWithPasscode' | 'InMemory' | 'SecureStorage';

const { createVault } = useVaultFactory();
const vault: Vault | BrowserVault = createVault();
const session = ref<Session | null>(null);

const initializeVault = async (): Promise<void> => {
  await vault.initialize({
    key: 'io.ionic.gettingstartediv',
    type: VaultType.InMemory,
    deviceSecurityType: DeviceSecurityType.None,
    lockAfterBackgrounded: 30000,
  });

  await enhanceVault();

  vault.onLock(() => (session.value = null));
};

const enhanceVault = async (): Promise<void> => {
  if (await Device.isSystemPasscodeSet()) {
    await updateUnlockMode('BiometricsWithPasscode');
  } else {
    await updateUnlockMode('InMemory');
  }
};

const storeSession = async (s: Session): Promise<void> => {
  vault.setValue('session', s);
  session.value = s;
};

const getSession = async (): Promise<void> => {
  if (await vault.isEmpty()) {
    session.value = null;
  } else {
    session.value = await vault.getValue<Session>('session');
  }
};

const clearSession = async (): Promise<void> => {
  await vault.clear();
  session.value = null;
};

const lockSession = async (): Promise<void> => {
  await vault.lock();
  session.value = null;
};

const unlockSession = async (): Promise<void> => {
  await vault.unlock();
  session.value = await vault.getValue<Session>('session');
};

const sessionIsLocked = async (): Promise<boolean> => {
  return (
    vault.config?.type !== VaultType.SecureStorage &&
    vault.config?.type !== VaultType.InMemory &&
    !(await vault.isEmpty()) &&
    (await vault.isLocked())
  );
};

const updateUnlockMode = async (mode: UnlockMode): Promise<void> => {
  const type = getVaultType(mode);
  const deviceSecurityType = type === VaultType.DeviceSecurity ? DeviceSecurityType.Both : DeviceSecurityType.None;
  const lockAfterBackgrounded = type === VaultType.InMemory ? 30000 : 2000;
  await vault.updateConfig({
    ...(vault.config as IdentityVaultConfig),
    type,
    deviceSecurityType,
    lockAfterBackgrounded,
  });
};

const getVaultType = async (mode: UnlockMode): Promise<VaultType> => {
  if (mode === 'BiometricsWithPasscode') {
    await provisionBiometrics();
    return (await Device.isBiometricsEnabled()) &&
      (await Device.isBiometricsAllowed()) !== BiometricPermissionState.Granted
      ? VaultType.InMemory
      : VaultType.DeviceSecurity;
  }

  return mode === 'InMemory' ? VaultType.InMemory : VaultType.SecureStorage;
};

const provisionBiometrics = async (): Promise<void> => {
  if ((await Device.isBiometricsAllowed()) === BiometricPermissionState.Prompt) {
    try {
      await Device.showBiometricPrompt({ iosBiometricsLocalizedReason: 'Please authenticate to continue' });
    } catch (error) {
      null;
    }
  }
};

export const useSessionVault = (): any => ({
  clearSession,
  enhanceVault,
  getSession,
  initializeVault,
  lockSession,
  session,
  storeSession,
  updateUnlockMode,
});
```

</CH.Code>

Preventing this is no longer necessary. Remove the `isEmpty()` check leaving the rest of the code in place.

---

<CH.Code>

```typescript src/composables/session-vault.ts focus=28
import { useVaultFactory } from '@/composables/vault-factory';
import { Session } from '@/models/session';
import {
  BiometricPermissionState,
  BrowserVault,
  Device,
  DeviceSecurityType,
  IdentityVaultConfig,
  Vault,
  VaultType,
} from '@ionic-enterprise/identity-vault';
import { ref } from 'vue';

export type UnlockMode = 'BiometricsWithPasscode' | 'InMemory' | 'SecureStorage';

const { createVault } = useVaultFactory();
const vault: Vault | BrowserVault = createVault();
const session = ref<Session | null>(null);

const initializeVault = async (): Promise<void> => {
  await vault.initialize({
    key: 'io.ionic.gettingstartediv',
    type: VaultType.InMemory,
    deviceSecurityType: DeviceSecurityType.None,
    lockAfterBackgrounded: 30000,
  });

  await enhanceVault();

  vault.onLock(() => (session.value = null));
};

const enhanceVault = async (): Promise<void> => {
  if (await Device.isSystemPasscodeSet()) {
    await updateUnlockMode('BiometricsWithPasscode');
  } else {
    await updateUnlockMode('InMemory');
  }
};

const storeSession = async (s: Session): Promise<void> => {
  vault.setValue('session', s);
  session.value = s;
};

const getSession = async (): Promise<void> => {
  if (await vault.isEmpty()) {
    session.value = null;
  } else {
    session.value = await vault.getValue<Session>('session');
  }
};

const clearSession = async (): Promise<void> => {
  await vault.clear();
  session.value = null;
};

const lockSession = async (): Promise<void> => {
  await vault.lock();
  session.value = null;
};

const unlockSession = async (): Promise<void> => {
  await vault.unlock();
  session.value = await vault.getValue<Session>('session');
};

const sessionIsLocked = async (): Promise<boolean> => {
  return (
    vault.config?.type !== VaultType.SecureStorage &&
    vault.config?.type !== VaultType.InMemory &&
    !(await vault.isEmpty()) &&
    (await vault.isLocked())
  );
};

const updateUnlockMode = async (mode: UnlockMode): Promise<void> => {
  const type = getVaultType(mode);
  const deviceSecurityType = type === VaultType.DeviceSecurity ? DeviceSecurityType.Both : DeviceSecurityType.None;
  const lockAfterBackgrounded = type === VaultType.InMemory ? 30000 : 2000;
  await vault.updateConfig({
    ...(vault.config as IdentityVaultConfig),
    type,
    deviceSecurityType,
    lockAfterBackgrounded,
  });
};

const getVaultType = async (mode: UnlockMode): Promise<VaultType> => {
  if (mode === 'BiometricsWithPasscode') {
    await provisionBiometrics();
    return (await Device.isBiometricsEnabled()) &&
      (await Device.isBiometricsAllowed()) !== BiometricPermissionState.Granted
      ? VaultType.InMemory
      : VaultType.DeviceSecurity;
  }

  return mode === 'InMemory' ? VaultType.InMemory : VaultType.SecureStorage;
};

const provisionBiometrics = async (): Promise<void> => {
  if ((await Device.isBiometricsAllowed()) === BiometricPermissionState.Prompt) {
    try {
      await Device.showBiometricPrompt({ iosBiometricsLocalizedReason: 'Please authenticate to continue' });
    } catch (error) {
      null;
    }
  }
};

export const useSessionVault = (): any => ({
  clearSession,
  enhanceVault,
  getSession,
  initializeVault,
  lockSession,
  session,
  storeSession,
  updateUnlockMode,
});
```

</CH.Code>

`enhanceVault()` is currently called from the `initialize()` function.

---

<CH.Code>

```typescript src/composables/session-vault.ts focus=20:29
import { useVaultFactory } from '@/composables/vault-factory';
import { Session } from '@/models/session';
import {
  BiometricPermissionState,
  BrowserVault,
  Device,
  DeviceSecurityType,
  IdentityVaultConfig,
  Vault,
  VaultType,
} from '@ionic-enterprise/identity-vault';
import { ref } from 'vue';

export type UnlockMode = 'BiometricsWithPasscode' | 'InMemory' | 'SecureStorage';

const { createVault } = useVaultFactory();
const vault: Vault | BrowserVault = createVault();
const session = ref<Session | null>(null);

const initializeVault = async (): Promise<void> => {
  await vault.initialize({
    key: 'io.ionic.gettingstartediv',
    type: VaultType.InMemory,
    deviceSecurityType: DeviceSecurityType.None,
    lockAfterBackgrounded: 30000,
  });

  vault.onLock(() => (session.value = null));
};

const enhanceVault = async (): Promise<void> => {
  if (await Device.isSystemPasscodeSet()) {
    await updateUnlockMode('BiometricsWithPasscode');
  } else {
    await updateUnlockMode('InMemory');
  }
};

const storeSession = async (s: Session): Promise<void> => {
  vault.setValue('session', s);
  session.value = s;
};

const getSession = async (): Promise<void> => {
  if (await vault.isEmpty()) {
    session.value = null;
  } else {
    session.value = await vault.getValue<Session>('session');
  }
};

const clearSession = async (): Promise<void> => {
  await vault.clear();
  session.value = null;
};

const lockSession = async (): Promise<void> => {
  await vault.lock();
  session.value = null;
};

const unlockSession = async (): Promise<void> => {
  await vault.unlock();
  session.value = await vault.getValue<Session>('session');
};

const sessionIsLocked = async (): Promise<boolean> => {
  return (
    vault.config?.type !== VaultType.SecureStorage &&
    vault.config?.type !== VaultType.InMemory &&
    !(await vault.isEmpty()) &&
    (await vault.isLocked())
  );
};

const updateUnlockMode = async (mode: UnlockMode): Promise<void> => {
  const type = getVaultType(mode);
  const deviceSecurityType = type === VaultType.DeviceSecurity ? DeviceSecurityType.Both : DeviceSecurityType.None;
  const lockAfterBackgrounded = type === VaultType.InMemory ? 30000 : 2000;
  await vault.updateConfig({
    ...(vault.config as IdentityVaultConfig),
    type,
    deviceSecurityType,
    lockAfterBackgrounded,
  });
};

const getVaultType = async (mode: UnlockMode): Promise<VaultType> => {
  if (mode === 'BiometricsWithPasscode') {
    await provisionBiometrics();
    return (await Device.isBiometricsEnabled()) &&
      (await Device.isBiometricsAllowed()) !== BiometricPermissionState.Granted
      ? VaultType.InMemory
      : VaultType.DeviceSecurity;
  }

  return mode === 'InMemory' ? VaultType.InMemory : VaultType.SecureStorage;
};

const provisionBiometrics = async (): Promise<void> => {
  if ((await Device.isBiometricsAllowed()) === BiometricPermissionState.Prompt) {
    try {
      await Device.showBiometricPrompt({ iosBiometricsLocalizedReason: 'Please authenticate to continue' });
    } catch (error) {
      null;
    }
  }
};

export const useSessionVault = (): any => ({
  clearSession,
  enhanceVault,
  getSession,
  initializeVault,
  lockSession,
  session,
  storeSession,
  updateUnlockMode,
});
```

</CH.Code>

Remove the call leaving the rest of `initialize()` in place.

---

<CH.Code>

```vue src/views/LoginPage.vue focus=44:51
<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Login</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Login</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-list>
        <ion-item>
          <ion-label>
            <ion-button expand="block" @click="handleLogin" data-testid="login">Login</ion-button>
          </ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonButton,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonTitle,
  IonToolbar,
} from '@ionic/vue';
import { useRouter } from 'vue-router';
import { useAuthentication } from '@/composables/authentication';

const { login } = useAuthentication();
const router = useRouter();

const handleLogin = async () => {
  try {
    await login();
    router.replace('/tabs/tab1');
  } catch (error: unknown) {
    console.error('Failed to log in', error);
  }
};
</script>
```

</CH.Code>

In the `LoginPage`, the login handler currently logs the user in and navigates to the main page.

---

<CH.Code>

```vue src/views/LoginPage.vue focus=40,43,49
<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Login</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Login</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-list>
        <ion-item>
          <ion-label>
            <ion-button expand="block" @click="handleLogin" data-testid="login">Login</ion-button>
          </ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonButton,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonTitle,
  IonToolbar,
} from '@ionic/vue';
import { useRouter } from 'vue-router';
import { useAuthentication } from '@/composables/authentication';
import { useSessionVault } from '@/composables/session-vault';

const { login } = useAuthentication();
const { enhanceVault } = useSessionVault();
const router = useRouter();

const handleLogin = async () => {
  try {
    await login();
    await enhanceVault();
    router.replace('/tabs/tab1');
  } catch (error: unknown) {
    console.error('Failed to log in', error);
  }
};
</script>
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

<CH.Code rows={15}>

```vue src/views/Tab1Page.vue focus=83[10:34],93
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

      <ion-list>
        <ion-item>
          <ion-label>
            <ion-button expand="block" color="danger" @click="logoutClicked" data-testid="logout">Logout</ion-button>
          </ion-label>
        </ion-item>
        <ion-item>
          <ion-label>
            <ion-button
              expand="block"
              color="secondary"
              @click="updateUnlockMode('BiometricsWithPasscode')"
              :disabled="disableBiometrics"
              data-testid="use-biometrics"
              >Use Biometrics</ion-button
            >
          </ion-label>
        </ion-item>
        <ion-item>
          <ion-label>
            <ion-button
              expand="block"
              color="secondary"
              @click="updateUnlockMode('InMemory')"
              data-testid="use-in-memory"
              >Use In Memory</ion-button
            >
          </ion-label>
        </ion-item>
        <ion-item>
          <ion-label>
            <ion-button
              expand="block"
              color="secondary"
              @click="updateUnlockMode('SecureStorage')"
              data-testid="use-secure-storage"
              >Use Secure Storage</ion-button
            >
          </ion-label>
        </ion-item>
        <ion-item>
          <div data-testid="session">
            <div>{{ session?.email }}</div>
            <div>{{ session?.firstName }} {{ session?.lastName }}</div>
            <div>{{ session?.accessToken }}</div>
            <div>{{ session?.refreshToken }}</div>
          </div>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { useAuthentication } from '@/composables/authentication';
import { useSessionVault } from '@/composables/session-vault';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/vue';
import { useRouter } from 'vue-router';
import { BiometricPermissionState, Device } from '@ionic-enterprise/identity-vault';
import { ref } from 'vue';

const disableBiometrics = ref(false);
const { logout } = useAuthentication();
const { session, updateUnlockMode } = useSessionVault();
const router = useRouter();

const initialize = async (): Promise<void> => {
  disableBiometrics.value =
    !(await Device.isBiometricsEnabled()) || (await Device.isBiometricsAllowed()) !== BiometricPermissionState.Granted;
};

const logoutClicked = async (): Promise<void> => {
  await logout();
  router.replace('/');
};

initialize();
</script>
```

</CH.Code>

## Next Steps

We have examined the `Device` API and several potential uses for it. Continue to explore how this API can be used
to enhance the user experience within your application.
