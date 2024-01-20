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

### Create the New Pages

In order to implement our startup and authentication strategies, we need to have a `LoginPage`. We will also replace
the "default" page (currently the `Tab1Page`) with a `StartPage` that will contain our startup logic.

Create basic shells for these pages.

<CH.Code>

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
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/vue';
</script>
```

```vue src/views/StartPage.vue
<template>
  <ion-page>
    <ion-content> </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonPage } from '@ionic/vue';
</script>
```

</CH.Code>

Be sure to check the code for both pages. The `StartPage` is very minimal and that is intentional.

### Update Routes

With the new pages in place, the routing needs to be fixed. The application's routing scheme has two levels: a base
page level and a sub-page level. As such, each of our routes has one of the following formats: `/base-page` or
`/base-page/sub-page`.

At the base page level, we want to have three different pages: `TabsPage`, `LoginPage`, and `StartPage`. We also want
the default route (`/`) to be the `StartPage`. Update the `src/router/index.ts` accordingly.

<CH.Scrollycoding>

<CH.Code>

```typescript src/router/index.ts
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
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
```

</CH.Code>

Currently we only have routes for the `TabsPage` and its children.

---

<CH.Code>

```typescript src/router/index.ts focus=11
import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/tabs/tab1',
  },
  {
    path: '/tabs/',
    component: () => import('@/views/TabsPage.vue'),
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
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
```

</CH.Code>

Lazy-load the `TabsPage`.

---

<CH.Code>

```typescript src/router/index.ts focus=3,8[16:21],10:13
import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import StartPage from '@/views/StartPage.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/start',
  },
  {
    path: '/start',
    component: StartPage,
  },
  {
    path: '/tabs/',
    component: () => import('@/views/TabsPage.vue'),
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
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
```

</CH.Code>

Eager-load the `StartPage` and change the `/` to redirect to it.

---

<CH.Code>

```typescript src/router/index.ts focus=14:17
import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import StartPage from '@/views/StartPage.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/start',
  },
  {
    path: '/start',
    component: StartPage,
  },
  {
    path: '/login',
    component: () => import('@/views/LoginPage.vue'),
  },
  {
    path: '/tabs/',
    component: () => import('@/views/TabsPage.vue'),
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
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
```

</CH.Code>

Lazy-load the `LoginPage`.

</CH.Scrollycoding>

### The `useAuthentication` Composable

Part of our startup strategy involves authentication. We will not _really_ be performing authentication, but we will
add the composable so that we have the infrastructure in place so we can later add authentication via a solution
such as [Auth Connect](https://ionic.io/docs/auth-connect).

<CH.Scrollycoding>

<CH.Code>

```typescript src/composables/authentication.ts
export const useAuthentication = (): any => ({});
```

</CH.Code>

Start with an empty composable.

---

<CH.Code>

```typescript src/composables/authentication.ts focus=1:3
import { useSessionVault } from './session-vault';

const { clearSession, getSession, session, storeSession } = useSessionVault();

export const useAuthentication = (): any => ({});
```

</CH.Code>

Get the functions and data that we need from the `useSessionVault` composable.

---

<CH.Code>

```typescript src/composables/authentication.ts focus=5:12,14[48:52]
import { useSessionVault } from './session-vault';

const { clearSession, getSession, session, storeSession } = useSessionVault();

const login = (): Promise<void> =>
  storeSession({
    email: 'test@ionic.io',
    firstName: 'Tessa',
    lastName: 'Testsmith',
    accessToken: '4abf1d79-143c-4b89-b478-19607eb5ce97',
    refreshToken: '565111b6-66c3-4527-9238-6ea2cc017126',
  });

export const useAuthentication = (): any => ({ login });
```

</CH.Code>

The user needs to be able to log in. Since we do not yet have an authentication strategy, we will store a fake session.

---

<CH.Code>

```typescript src/composables/authentication.ts focus=14,16[53:60]
import { useSessionVault } from './session-vault';

const { clearSession, getSession, session, storeSession } = useSessionVault();

const login = (): Promise<void> =>
  storeSession({
    email: 'test@ionic.io',
    firstName: 'Tessa',
    lastName: 'Testsmith',
    accessToken: '4abf1d79-143c-4b89-b478-19607eb5ce97',
    refreshToken: '565111b6-66c3-4527-9238-6ea2cc017126',
  });

const logout = (): Promise<void> => clearSession();

export const useAuthentication = (): any => ({ login, logout });
```

</CH.Code>

For the `logout()`, just clear the stored session.

---

<CH.Code>

```typescript src/composables/authentication.ts focus=16:19,22
import { useSessionVault } from './session-vault';

const { clearSession, getSession, session, storeSession } = useSessionVault();

const login = (): Promise<void> =>
  storeSession({
    email: 'test@ionic.io',
    firstName: 'Tessa',
    lastName: 'Testsmith',
    accessToken: '4abf1d79-143c-4b89-b478-19607eb5ce97',
    refreshToken: '565111b6-66c3-4527-9238-6ea2cc017126',
  });

const logout = (): Promise<void> => clearSession();

const isAuthenticated = async (): Promise<boolean> => {
  await getSession();
  return !!session.value;
};

export const useAuthentication = (): any => ({
  isAuthenticated,
  login,
  logout,
});
```

</CH.Code>

To determine if the user is authenticated, check for a stored session.

</CH.Scrollycoding>

We now have a `useAuthentication` composable that we can use in the rest of our app. This also gives us the hooks we need when we begin
using an actual authentication solution such as [Auth Connect](https://ionic.io/docs/auth-connect).

### The `LoginPage`

The login page simply includes a "Login" button.

<CH.Code>

```vue src/views/LoginPage.vue focus=15:21,28,31:33
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
            <ion-button expand="block">Login</ion-button>
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
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/vue';
</script>
```

</CH.Code>

When the button is pressed the following tasks are performed:

- Attempt to log in.
- If the login succeeds, go to the `Tab1Page`.
- If the login fails we will just log it for now. When actual authentication is implemented this _may_ be a good
  place to display a "Login Failed" message, but that is beyond the scope of this tutorial.

<CH.Code>

```typescript src/app/login/login.page.ts focus=18[40:59],38:51
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
            <ion-button expand="block" @click="handleLogin">Login</ion-button>
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
  IonPage,
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

### Update `useSessionVault`

The startup logic needs to determine if the vault is currently locked and provide a mechanism to unlock the vault
if it is locked. Update the `useSessionVault` composable to provide `unlockSession()` and `sessionIsLocked()` functions.

<CH.Code rows={40}>

```typescript src/composables/session-vault.ts focus=51:63,84,86
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

export type UnlockMode =
  | 'BiometricsWithPasscode'
  | 'InMemory'
  | 'SecureStorage';

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
  await vault.updateConfig({
    ...(vault.config as IdentityVaultConfig),
    type,
  });
};

export const useSessionVault = (): any => ({
  clearSession,
  getSession,
  initializeVault,
  lockSession,
  session,
  sessionIsLocked,
  storeSession,
  unlockSession,
  updateUnlockMode,
});
```

</CH.Code>

In the `sessionIsLocked()` method, we do not get the reported state for vaults of type `SecureStorage` or `InMemory`
because Identity Vault will report them as "locked" even though they logically cannot lock. This is a long standing
quirk with Identity Vault that would be a _breaking change_ to fix.

### The `StartPage`

We will start with this requirement: _If the unlock fails, the user shall be given the option to either try again
or to clear the session data and log in again._

This may _seem_ like an odd place to start, but it is the only requirement that involves the look and feel of the
`StartPage`, so let's get that established first.

<CH.Code>

```vue src/views/StartPage.vue
<template>
  <ion-page>
    <ion-content class="ion-padding">
      <ion-list v-if="showUnlock">
        <ion-item>
          <ion-label>
            <ion-button expand="block" @click="performUnlockFlow"
              >Unlock</ion-button
            >
          </ion-label>
        </ion-item>
        <ion-item>
          <ion-label>
            <ion-button expand="block" @click="redoLogin"
              >Redo Login</ion-button
            >
          </ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  IonButton,
  IonContent,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
} from '@ionic/vue';

const showUnlock = ref(false);

const performUnlockFlow = async (): Promise<void> => {};

const redoLogin = async (): Promise<void> => {};
</script>
```

</CH.Code>

We are only conditionally showing the "Unlock" and "Redo Login" buttons. For now, we will hard code the condition to
_not_ display these buttons. With the basics in place, let's implement the rest of the logic.

We are only changing the `<script>` block. The `<template>` block stays the same as above. It is elided in the following
code for simplicity.

<CH.Scrollycoding>

<CH.Code>

```vue src/views/StartPage.vue focus=10,16,17,22,24,26:28
<script setup lang="ts">
import { ref } from 'vue';
import {
  IonButton,
  IonContent,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  onIonViewDidEnter,
} from '@ionic/vue';

const showUnlock = ref(false);

const performUnlockFlow = async (): Promise<void> => {
  await attemptUnlock();
  await attemptNavigation();
};

const redoLogin = async (): Promise<void> => {};

const attemptNavigation = async (): Promise<void> => {};

const attemptUnlock = async (): Promise<void> => {};

onIonViewDidEnter(() => {
  performUnlockFlow();
});
</script>
```

</CH.Code>

For the unlock flow, we will first attempt an unlock, and then see if we can navigate.

Perform this flow automatically after the user navigates to this page as well as via the "Unlock" button.

---

<CH.Code>

```vue src/views/StartPage.vue focus=12,15,27:33
<script setup lang="ts">
import { ref } from 'vue';
import {
  IonButton,
  IonContent,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  onIonViewDidEnter,
} from '@ionic/vue';
import { useSessionVault } from '@/composables/session-vault';

const showUnlock = ref(false);
const { sessionIsLocked, unlockSession } = useSessionVault();

const performUnlockFlow = async (): Promise<void> => {
  await attemptUnlock();
  await attemptNavigation();
};

const redoLogin = async (): Promise<void> => {};

const attemptNavigation = async (): Promise<void> => {};

const attemptUnlock = async (): Promise<void> => {
  if (await sessionIsLocked()) {
    try {
      await unlockSession();
    } catch (err: unknown) {
      showUnlock.value = true;
    }
  }
};

onIonViewDidEnter(() => {
  performUnlockFlow();
});
</script>
```

</CH.Code>

We will only attempt the unlock operation if the vault is actually locked. Try to unlock the vault. If the unlock fails,
set the "show" flag so the user can try again or give up and go back to the login step.

---

<CH.Code>

```vue src/views/StartPage.vue focus=12,13,17,19,29:35
<script setup lang="ts">
import { ref } from 'vue';
import {
  IonButton,
  IonContent,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  onIonViewDidEnter,
} from '@ionic/vue';
import { useRouter } from 'vue-router';
import { useAuthentication } from '@/composables/authentication';
import { useSessionVault } from '@/composables/session-vault';

const showUnlock = ref(false);
const { isAuthenticated } = useAuthentication();
const { sessionIsLocked, unlockSession } = useSessionVault();
const router = useRouter();

const performUnlockFlow = async (): Promise<void> => {
  await attemptUnlock();
  await attemptNavigation();
};

const redoLogin = async (): Promise<void> => {};

const attemptNavigation = async (): Promise<void> => {
  if (!(await sessionIsLocked())) {
    if (await isAuthenticated()) {
      router.replace('/tabs/tab1');
    } else {
      router.replace('/login');
    }
  }
};

const attemptUnlock = async (): Promise<void> => {
  if (await sessionIsLocked()) {
    try {
      await unlockSession();
    } catch (err: unknown) {
      showUnlock.value = true;
    }
  }
};

onIonViewDidEnter(() => {
  performUnlockFlow();
});
</script>
```

</CH.Code>

If the user succeeded in unlocking the vault, determine if we should navigate to the `LoginPage` or the `Tab1Page`
based on the current authentication status.

---

<CH.Code>

```vue src/views/StartPage.vue focus=17[24:31],27:28
<script setup lang="ts">
import { ref } from 'vue';
import {
  IonButton,
  IonContent,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  onIonViewDidEnter,
} from '@ionic/vue';
import { useRouter } from 'vue-router';
import { useAuthentication } from '@/composables/authentication';
import { useSessionVault } from '@/composables/session-vault';

const showUnlock = ref(false);
const { isAuthenticated, logout } = useAuthentication();
const { sessionIsLocked, unlockSession } = useSessionVault();
const router = useRouter();

const performUnlockFlow = async (): Promise<void> => {
  await attemptUnlock();
  await attemptNavigation();
};

const redoLogin = async (): Promise<void> => {
  await logout();
  router.replace('/login');
};

const attemptNavigation = async (): Promise<void> => {
  if (!(await sessionIsLocked())) {
    if (await isAuthenticated()) {
      router.replace('/tabs/tab1');
    } else {
      router.replace('/login');
    }
  }
};

const attemptUnlock = async (): Promise<void> => {
  if (await sessionIsLocked()) {
    try {
      await unlockSession();
    } catch (err: unknown) {
      showUnlock.value = true;
    }
  }
};

onIonViewDidEnter(() => {
  performUnlockFlow();
});
</script>
```

</CH.Code>

If the user chooses to redo the login, logout and navigate to the `LoginPage`.

</CH.Scrollycoding>

One item of note on the `redoLogin()` code. If we are using an authentication system, we need to craft our `logout()`
method such that it can be called with a locked vault. Crafting the logout as such is beyond the scope of this tutorial.

### Redirect on Lock

Upon locking, the `session` will be set to `null`. Update the `App` component to watch to the `session`. When the sessions
changes, check the vault's lock status. If the vault is locked navigate to `/`. This will load the `StartPage` and execute an
iteration of our unlock workflow.

<CH.Code>

```vue src/App.vue focus=9:20
<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { watch } from 'vue';
import { useRouter } from 'vue-router';
import { useSessionVault } from '@/composables/session-vault';

const router = useRouter();
const { session, sessionIsLocked } = useSessionVault();

watch(session, async () => {
  if (await sessionIsLocked()) {
    router.replace('/');
  }
});
</script>
```

</CH.Code>

### Cleanup the `Tab1Page`

There are several items in the `Tab1Page` that no longer make sense, however, and now is a good time to clean those up.
Here is a synopsis of what needs to be cleaned up:

- Remove the "Store" button and all code associated with it.
- Change the "Clear" button to a "Logout" button and update the click handler accordingly.
- Remove the "Lock" and "Unlock" buttons and all code associated with them.

Cleaning this all up is left as an exercise to the reader but we provide the completed code here for you to compare against.

<CH.Code>

```vue src/views/Tab1Page.vue
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
            <ion-button expand="block" color="danger" @click="logoutClicked"
              >Logout</ion-button
            >
          </ion-label>
        </ion-item>
        <ion-item>
          <ion-label>
            <ion-button
              expand="block"
              color="secondary"
              @click="updateUnlockMode('BiometricsWithPasscode')"
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
              >Use Secure Storage</ion-button
            >
          </ion-label>
        </ion-item>
        <ion-item>
          <div>
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

const { logout } = useAuthentication();
const { session, updateUnlockMode } = useSessionVault();
const router = useRouter();

const logoutClicked = async (): Promise<void> => {
  await logout();
  router.replace('/');
};
</script>
```

</CH.Code>

## Next Steps

In this tutorial, we created a good basic application startup workflow. This is an example of a good workflow, but it
is not the only potential flow. For example, our application simply navigates to `/tabs/tab1` after unlocking the
vault. You could, however, store information about the current state of the application and then restore to that
state after unlocking the application. Do whatever is right for your application.
