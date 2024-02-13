---
title: Getting Started with Identity Vault
sidebar_label: Getting Started
sidebar_position: 1
---

import Admonition from '@theme/Admonition';

## Generate the Application

Before we explore the use of Identity Vault, we need to scaffold an application. In this section, we will generate
a tabs-based `@ionic/react` application, perform some basic configuration, and add the `iOS` and `Android` platforms.

If you need to refresh your memory on the overall [developer workflow](https://capacitorjs.com/docs/basics/workflow)
for Capacitor, please do so now. However, here is a synopsis of the commands you will use the most while performing
this tutorial:

- `npm start`: Start the development server so the application can be run in the browser.
- `npm run build`: Build the web portion of the application.
- `npx cap sync`: Copy the web app and any new plugins into the native applications.
- `npx cap open android`: Open Android Studio in order to build, run, and debug the application on Android.
- `npx cap open ios`: Open Xcode in order to build, run, and debug the application on iOS.

Let's get started.

<CH.Scrollycoding>

<CH.Code>

```bash Terminal
ionic start iv-getting-started tabs --type=react
```

</CH.Code>

Use the Ionic CLI to generate the application.

---

<CH.Code>

```bash Terminal focus=2
ionic start iv-getting-started tabs --type=react
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
  webDir: 'dist',
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
ionic start iv-getting-started-ac tabs --type=react
cd iv-getting-started
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
  "name": "iv-getting-started",
  "version": "0.0.1",
  "author": "Ionic Framework",
  "homepage": "https://ionicframework.com/",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build && cap sync",
    "preview": "vite preview",
    "test.e2e": "cypress run",
    "test.unit": "vitest",
    "lint": "eslint"
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

## Create the Session Model

We first need to define the shape of the authentication session data via a TypeScript interface. Create a `src/models` directory and a `src/models/Session.ts` file.
```typescript src/models/Session.ts
export interface Session {
  firstName: string;
  lastName: string;
  email: string;
  accessToken: string;
  refreshToken: string;
}
```

## Create the Utility Files

Our tutorial application will have a single vault that simulates storing our application's authentication session
information. To manage this vault, we will create two utility files:

- `vault-factory`: Builds either a `Vault` or `BrowserVault` depending on the whether our application is running in a web or web-native context.
- `session-vault`: Manages the vault itself.

### `vault-factory`

Create a `src/util` folder and add a file named `src/util/vault-factory.ts` with the following contents:

<CH.Code>

```typescript src/util/vault-factory.ts
import { Capacitor } from '@capacitor/core';
import { BrowserVault, Vault } from '@ionic-enterprise/identity-vault';

export const createVault = (): Vault | BrowserVault => {
  return Capacitor.isNativePlatform() ? new Vault() : new BrowserVault();
};
```

</CH.Code>

### `session-vault`

The `session-vault` file will contain the functions that are used to manage the session vault for the application. Create the `src/util/session-vault.ts` file with the following contents. We will build the necessary functions in this tutorial.

<CH.Code>

```typescript src/util/session-vault.ts
import { createVault } from './vault-factory';
```

</CH.Code>

### Create and Initialization the Vault

Before we use Identity Vault, we need to make sure that our vault is properly created and initialized. It is
important to note that creation and initialization are different processes. Creation is performed when the
module for the `vault-factory` utility file is constructed and is limited to the creation of a JavaScript object.

The initialization involves communication with the native layer. As such it is asynchronous. Since initialization
needs to complete before we can begin normal operation of the application, we run the initialization and await
its completion before the main application component is mounted.

<Admonition type="warning">
Awaiting the completion of initialization in this manner is a best-practice that should always be followed.
</Admonition>

<CH.Scrollycoding>

<CH.Code>

```typescript src/util/session-vault.ts focus=1:4,7
import { 
  BrowserVault, 
  Vault 
} from '@ionic-enterprise/identity-vault';
import { createVault } from './vault-factory';

const vault: Vault | BrowserVault = createVault();
```

```tsx src/main.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

</CH.Code>

Create the vault using our factory function.

---

<CH.Code>

```typescript src/util/session-vault.ts focus=6,9
import { 
  BrowserVault, 
  Vault 
} from '@ionic-enterprise/identity-vault';
import { createVault } from './vault-factory';
import { Session } from '../models/Session';

const vault: Vault | BrowserVault = createVault();
let session: Session | null = null;
```

</CH.Code>

Create the `session` variable. To sync the store with React, we will use [useSyncExternalStore](https://react.dev/reference/react/useSyncExternalStore).

---

<CH.Code>

```typescript src/util/session-vault.ts focus=4,5,13:19
import { 
  BrowserVault,
  Vault,
  VaultType,
  DeviceSecurityType,
} from '@ionic-enterprise/identity-vault';
import { createVault } from './vault-factory';
import { Session } from '../models/Session';

const vault: Vault | BrowserVault = createVault();
let session: Session | null = null;

export const initializeVault = async (): Promise<void> => {
  await vault.initialize({
    key: 'io.ionic.gettingstartedivreact',
    type: VaultType.SecureStorage,
    deviceSecurityType: DeviceSecurityType.None,
  });
};
```

</CH.Code>

Create the `initializeVault` function from which we will perform all vault initialization. At this time, the only thing
we need to do is pass a configuration object to our vault. The meaning of the configuration properties will be
explained later.

---

<CH.Code>

```tsx src/main.tsx focus=5,9:13
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

import { initializeVault } from './util/session-vault';

const container = document.getElementById('root');
const root = createRoot(container!);
initializeVault().then(() => root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
));
```
</CH.Code>

In our `src/main.tsx`, execute the `initializeVault` function prior to rendering the React app.

</CH.Scrollycoding>

In this section, we created a vault using the key `io.ionic.gettingstartediv`. Our vault is a "Secure Storage" vault, which means that the information we store in the vault is encrypted in the keychain / keystore and is only visible to our application, but the vault is never locked. We will explore other types of vaults later in this tutorial.

### Store a Vault

Let's store some data in the vault. Here, we will:

- Add the necessary code to utilize `useSyncExternalStore`.
- Add a function to `session-vault` to store a session.
- Add a button to our `Tab1` page to store a fake session.

<CH.Scrollycoding>

```typescript src/util/session-vault.ts focus=12,22:37
import { 
  BrowserVault,
  Vault,
  VaultType,
  DeviceSecurityType,
} from '@ionic-enterprise/identity-vault';
import { createVault } from './vault-factory';
import { Session } from '../models/Session';

const vault: Vault | BrowserVault = createVault();
let session: Session | null = null;
let listeners: any[] = [];

export const initializeVault = async (): Promise<void> => {
  await vault.initialize({
    key: 'io.ionic.gettingstartedivreact',
    type: VaultType.SecureStorage,
    deviceSecurityType: DeviceSecurityType.None,
  });
};

export const getSnapshot = (): Session | null => {
  return session;
}

export const subscribe = (listener: any) => {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
};

export const emitChange = () => {
  for (let listener of listeners) {
    listener();
  }
};
```

Before we add the logic to update the vault, we first need to add a small bit of boilerplate code in order to track the state of our `session` variable.


---

```typescript src/util/session-vault.ts focus=39:43
import { 
  BrowserVault,
  Vault,
  VaultType,
  DeviceSecurityType,
} from '@ionic-enterprise/identity-vault';
import { createVault } from './vault-factory';
import { Session } from '../models/Session';

const vault: Vault | BrowserVault = createVault();
let session: Session | null = null;
let listeners: any[] = [];

export const initializeVault = async (): Promise<void> => {
  await vault.initialize({
    key: 'io.ionic.gettingstartedivreact',
    type: VaultType.SecureStorage,
    deviceSecurityType: DeviceSecurityType.None,
  });
};

export const getSnapshot = (): Session | null => {
  return session;
}

export const subscribe = (listener: any) => {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
};

export const emitChange = () => {
  for (let listener of listeners) {
    listener();
  }
};

export const storeSession = async (newSession: Session): Promise<void> => {
  vault.setValue('session', newSession);
  session = newSession;
  emitChange();
}
```

Now that we can track the state of our session, we can create our function to store our data. We can store multiple items within the vault, each with their own key. For this application, we will store a single
item with the key of `session`. The vault has a `setValue()` method that is used for this purpose. Modify
`src/util/session-vault.ts` to store the session.

</CH.Scrollycoding>

Notice that we have created a very light wrapper around the vault's `setValue()` method. This is often all that is required. It is best-practice to encapsulate the vault in a function like this one and only expose the functionality that makes sense for your application.

With the "store session" feature properly abstracted, add a button to the `Tab1` page that will simulate logging in by storing some fake authentication data in the vault.

<CH.Scrollycoding>

<CH.Code>

```tsx src/pages/Tab1.tsx
import { 
  IonContent, 
  IonHeader, 
  IonPage, 
  IonTitle, 
  IonToolbar,
} from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import './Tab1.css';

const Tab1: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Tab 1</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Tab 1</IonTitle>
          </IonToolbar>
        </IonHeader>
        <ExploreContainer name="Tab 1 page" />
      </IonContent>
    </IonPage>
  );
};

export default Tab1;
```

</CH.Code>

We are currently displaying the generic starter "Explore Container" data.

---

<CH.Code>

```tsx src/pages/Tab1.tsx focus=2,5,6,7,29:35
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
} from '@ionic/react';
import './Tab1.css';

const Tab1: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Tab 1</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Tab 1</IonTitle>
          </IonToolbar>
        </IonHeader>
        
        <IonList>
          <IonItem>
            <IonLabel>
              <IonButton expand="block">Store</IonButton>
            </IonLabel>
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Tab1;
```

</CH.Code>

Replace the explore container with a list containing a button.

---

<CH.Code>

```tsx src/pages/Tab1.tsx focus=16:24,43[41:63]
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
} from '@ionic/react';
import './Tab1.css';
import { storeSession } from '../util/session-vault';

const Tab1: React.FC = () => {
  const storeClicked = async (): Promise<void> => {
    await storeSession({
      email: 'test@ionic.io',
      firstName: 'Tessa',
      lastName: 'Testsmith',
      accessToken: '4abf1d79-143c-4b89-b478-19607eb5ce97',
      refreshToken: '565111b6-66c3-4527-9238-6ea2cc017126',
    });
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Tab 1</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Tab 1</IonTitle>
          </IonToolbar>
        </IonHeader>
        
        <IonList>
          <IonItem>
            <IonLabel>
              <IonButton expand="block" onClick={storeClicked}>Store</IonButton>
            </IonLabel>
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Tab1;
```

</CH.Code>

Store some fake test data.

</CH.Scrollycoding>

We have stored data in our vault. The next step is to get the data back out of the vault.

### Get a Value

In order to better illustrate the operation of the vault, we will modify the `Tab1Page` to display our session if one
is stored. We can get the current session data using `useSyncExternalStore`.


<CH.Code>

```tsx src/pages/Tab1.tsx focus=12,14[24:46],17,51:56
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
} from '@ionic/react';
import { useSyncExternalStore } from 'react';
import './Tab1.css';
import { storeSession, subscribe, getSnapshot } from '../util/session-vault';

const Tab1: React.FC = () => {
  const session = useSyncExternalStore(subscribe, getSnapshot);

  const storeClicked = async (): Promise<void> => {
    await storeSession({
      email: 'test@ionic.io',
      firstName: 'Tessa',
      lastName: 'Testsmith',
      accessToken: '4abf1d79-143c-4b89-b478-19607eb5ce97',
      refreshToken: '565111b6-66c3-4527-9238-6ea2cc017126',
    });
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Tab 1</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Tab 1</IonTitle>
          </IonToolbar>
        </IonHeader>
        
        <IonList>
          <IonItem>
            <IonLabel>
              <IonButton expand="block" onClick={storeClicked}>Store</IonButton>
            </IonLabel>
          </IonItem>

          <IonItem>
            <div>
              <div>{ session?.email }</div>
              <div>{ session?.firstName } { session?.lastName }</div>
              <div>{ session?.accessToken }</div>
              <div>{ session?.refreshToken }</div>
            </div>
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Tab1;
```
</CH.Code>

This displays the session when the user presses the "Store" button. However, if you refresh the browser or restart the
application, the session data is no longer displayed. That is because our `session` variable was cleared.



<CH.Scrollycoding>

<CH.Code>

```typescript src/util/session-vault.ts focus=45:51
import { 
  BrowserVault,
  Vault,
  VaultType,
  DeviceSecurityType,
} from '@ionic-enterprise/identity-vault';
import { createVault } from './vault-factory';
import { Session } from '../models/Session';

const vault: Vault | BrowserVault = createVault();
let session: Session | null = null;
let listeners: any[] = [];

export const initializeVault = async (): Promise<void> => {
  await vault.initialize({
    key: 'io.ionic.gettingstartedivreact',
    type: VaultType.SecureStorage,
    deviceSecurityType: DeviceSecurityType.None,
  });
};

export const getSnapshot = (): Session | null => {
  return session;
}

export const subscribe = (listener: any) => {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
};

export const emitChange = () => {
  for (let listener of listeners) {
    listener();
  }
};

export const storeSession = async (newSession: Session): Promise<void> => {
  vault.setValue('session', newSession);
  session = newSession;
  emitChange();
}

export const getSession = async (): Promise<void> => {
  if (session === null) {
    if (await vault.isEmpty()) session = null; 
    else session = await vault.getValue<Session>('session');
  }
  emitChange()
};
```

</CH.Code>

Add a function to `session-vault` that encapsulates getting the session. Checking if the vault is empty first ensures that we don't try to unlock a vault that may be locked but empty, which can happen in some cases.

---

<CH.Code>

```typescript src/util/session-vault.ts focus=21
import { 
  BrowserVault,
  Vault,
  VaultType,
  DeviceSecurityType,
} from '@ionic-enterprise/identity-vault';
import { createVault } from './vault-factory';
import { Session } from '../models/Session';

const vault: Vault | BrowserVault = createVault();
let session: Session | null = null;
let listeners: any[] = [];

export const initializeVault = async (): Promise<void> => {
  await vault.initialize({
    key: 'io.ionic.gettingstartedivreact',
    type: VaultType.SecureStorage,
    deviceSecurityType: DeviceSecurityType.None,
  });

  await getSession()
};

export const getSnapshot = (): Session | null => {
  return session;
}

export const subscribe = (listener: any) => {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
};

export const emitChange = () => {
  for (let listener of listeners) {
    listener();
  }
};

export const storeSession = async (newSession: Session): Promise<void> => {
  vault.setValue('session', newSession);
  session = newSession;
  emitChange();
}

export const getSession = async (): Promise<void> => {
  if (session === null) {
    if (await vault.isEmpty()) session = null; 
    else session = await vault.getValue<Session>('session');
  }
  emitChange()
};
```

</CH.Code>

Add our `getSession` function to the `initializeVault` function so that we fetch vault data upon initialization.

</CH.Scrollycoding>

We now have a way to store and retrieve the session. When you first run the application, the session area will be blank.
When you press the `Store` button you will see the session information on the page. If you restart the application,
you will see the session information.

If you would like to clear the session information at this point, remove the application from your device (physical
or simulated) and re-install it. On the web, you can close the running tab and open new one.

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

<Admonition type="note">
We will address locking and unlocking a vault later in this tutorial.
</Admonition>

Our vault stores session information. Having a single vault that stores _only_ the session information is the
best-practice for this type of data, and it is the practice we are using here. Thus we will use the `clear()`
method to clear the session.

<CH.Code rows={8}>

```tsx src/util/session-vault.ts focus=55:59
import { 
  BrowserVault,
  Vault,
  VaultType,
  DeviceSecurityType,
} from '@ionic-enterprise/identity-vault';
import { createVault } from './vault-factory';
import { Session } from '../models/Session';

const vault: Vault | BrowserVault = createVault();
let session: Session | null = null;
let listeners: any[] = [];

export const initializeVault = async (): Promise<void> => {
  await vault.initialize({
    key: 'io.ionic.gettingstartedivreact',
    type: VaultType.SecureStorage,
    deviceSecurityType: DeviceSecurityType.None,
  });

  await getSession()
};

export const getSnapshot = (): Session | null => {
  return session;
}

export const subscribe = (listener: any) => {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
};

export const emitChange = () => {
  for (let listener of listeners) {
    listener();
  }
};

export const storeSession = async (newSession: Session): Promise<void> => {
  vault.setValue('session', newSession);
  session = newSession;
  emitChange();
}

export const getSession = async (): Promise<void> => {
  if (session === null) {
    if (await vault.isEmpty()) session = null; 
    else session = await vault.getValue<Session>('session');
  }
  emitChange()
};

export const clearSession = async (): Promise<void> => {
  await vault.clear();
  session = null;
  emitChange();
}
```

</CH.Code>

Add a "Clear" button to the `Tab1` page.

<CH.Code rows={50}>

```tsx src/pages/Tab1.tsx focus=18,50:56
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
} from '@ionic/react';
import { useSyncExternalStore } from 'react';
import './Tab1.css';
import { 
  storeSession, 
  subscribe, 
  getSnapshot, 
  clearSession,
} from '../util/session-vault';

const Tab1: React.FC = () => {
  const session = useSyncExternalStore(subscribe, getSnapshot);

  const storeClicked = async (): Promise<void> => {
    await storeSession({
      email: 'test@ionic.io',
      firstName: 'Tessa',
      lastName: 'Testsmith',
      accessToken: '4abf1d79-143c-4b89-b478-19607eb5ce97',
      refreshToken: '565111b6-66c3-4527-9238-6ea2cc017126',
    });
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Tab 1</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Tab 1</IonTitle>
          </IonToolbar>
        </IonHeader>
        
        <IonList>
          <IonItem>
            <IonLabel>
              <IonButton expand="block" onClick={storeClicked}>Store</IonButton>
            </IonLabel>
          </IonItem>

          <IonItem>
            <IonLabel>
              <IonButton expand="block" color="danger" onClick={clearSession}>
                Clear
              </IonButton>
            </IonLabel>
          </IonItem>

          <IonItem>
            <div>
              <div>{ session?.email }</div>
              <div>{ session?.firstName } { session?.lastName }</div>
              <div>{ session?.accessToken }</div>
              <div>{ session?.refreshToken }</div>
            </div>
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Tab1;
```

</CH.Code>

Upon clicking the "Clear" button, the session data will be removed from the vault and will no longer render.


## Updating the Vault Type

We are currently using a "Secure Storage" vault, but there are several other
[vault types](https://ionic.io/docs/identity-vault/enums/vaulttype). In this section, we will explore the
`DeviceSecurity`, `InMemory`, and `SecureStorage` types.

### Setting the Vault Type

We can use the vault's `updateConfig()` method to change the type of vault that the application is using.

<CH.Scrollycoding>

<CH.Code>

```typescript src/util/session-vault.ts
import { 
  BrowserVault,
  Vault,
  VaultType,
  DeviceSecurityType,
} from '@ionic-enterprise/identity-vault';
import { createVault } from './vault-factory';
import { Session } from '../models/Session';

const vault: Vault | BrowserVault = createVault();
let session: Session | null = null;
let listeners: any[] = [];

export const initializeVault = async (): Promise<void> => {
  await vault.initialize({
    key: 'io.ionic.gettingstartedivreact',
    type: VaultType.SecureStorage,
    deviceSecurityType: DeviceSecurityType.None,
  });

  await getSession()
};

export const getSnapshot = (): Session | null => {
  return session;
}

export const subscribe = (listener: any) => {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
};

export const emitChange = () => {
  for (let listener of listeners) {
    listener();
  }
};

export const storeSession = async (newSession: Session): Promise<void> => {
  vault.setValue('session', newSession);
  session = newSession;
  emitChange();
}

export const getSession = async (): Promise<void> => {
  if (session === null) {
    if (await vault.isEmpty()) session = null; 
    else session = await vault.getValue<Session>('session');
  }
  emitChange()
};

export const clearSession = async (): Promise<void> => {
  await vault.clear();
  session = null;
  emitChange();
}
```
</CH.Code>

Here is the `session-vault.ts` we've created thus far.

---

<CH.Code>

```typescript src/util/session-vault.ts focus=10:13
import { 
  BrowserVault,
  Vault,
  VaultType,
  DeviceSecurityType,
} from '@ionic-enterprise/identity-vault';
import { createVault } from './vault-factory';
import { Session } from '../models/Session';

export type UnlockMode =
  | 'BiometricsWithPasscode'
  | 'InMemory'
  | 'SecureStorage';

const vault: Vault | BrowserVault = createVault();
let session: Session | null = null;
let listeners: any[] = [];

export const initializeVault = async (): Promise<void> => {
  await vault.initialize({
    key: 'io.ionic.gettingstartedivreact',
    type: VaultType.SecureStorage,
    deviceSecurityType: DeviceSecurityType.None,
  });

  await getSession()
};

export const getSnapshot = (): Session | null => {
  return session;
}

export const subscribe = (listener: any) => {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
};

export const emitChange = () => {
  for (let listener of listeners) {
    listener();
  }
};

export const storeSession = async (newSession: Session): Promise<void> => {
  vault.setValue('session', newSession);
  session = newSession;
  emitChange();
}

export const getSession = async (): Promise<void> => {
  if (session === null) {
    if (await vault.isEmpty()) session = null; 
    else session = await vault.getValue<Session>('session');
  }
  emitChange()
};

export const clearSession = async (): Promise<void> => {
  await vault.clear();
  session = null;
  emitChange();
}
```

</CH.Code>

The `UnlockMode` specifies the logical combinations of settings we wish to support within our application.

---

<CH.Code>

```typescript src/util/session-vault.ts focus=66:68
import { 
  BrowserVault,
  Vault,
  VaultType,
  DeviceSecurityType,
} from '@ionic-enterprise/identity-vault';
import { createVault } from './vault-factory';
import { Session } from '../models/Session';

export type UnlockMode =
  | 'BiometricsWithPasscode'
  | 'InMemory'
  | 'SecureStorage';

const vault: Vault | BrowserVault = createVault();
let session: Session | null = null;
let listeners: any[] = [];

export const initializeVault = async (): Promise<void> => {
  await vault.initialize({
    key: 'io.ionic.gettingstartedivreact',
    type: VaultType.SecureStorage,
    deviceSecurityType: DeviceSecurityType.None,
  });

  await getSession()
};

export const getSnapshot = (): Session | null => {
  return session;
}

export const subscribe = (listener: any) => {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
};

export const emitChange = () => {
  for (let listener of listeners) {
    listener();
  }
};

export const storeSession = async (newSession: Session): Promise<void> => {
  vault.setValue('session', newSession);
  session = newSession;
  emitChange();
}

export const getSession = async (): Promise<void> => {
  if (session === null) {
    if (await vault.isEmpty()) session = null; 
    else session = await vault.getValue<Session>('session');
  }
  emitChange()
};

export const clearSession = async (): Promise<void> => {
  await vault.clear();
  session = null;
  emitChange();
}

export const updateUnlockMode = async (mode: UnlockMode): Promise<void> => {
  
};
```

</CH.Code>

Add an `updateUnlockMode()` function. Take a single argument for the mode.

---

<CH.Code>

```typescript src/util/session-vault.ts focus=67:71
import { 
  BrowserVault,
  Vault,
  VaultType,
  DeviceSecurityType,
  IdentityVaultConfig,
} from '@ionic-enterprise/identity-vault';
import { createVault } from './vault-factory';
import { Session } from '../models/Session';

export type UnlockMode =
  | 'BiometricsWithPasscode'
  | 'InMemory'
  | 'SecureStorage';

const vault: Vault | BrowserVault = createVault();
let session: Session | null = null;
let listeners: any[] = [];

export const initializeVault = async (): Promise<void> => {
  await vault.initialize({
    key: 'io.ionic.gettingstartedivreact',
    type: VaultType.SecureStorage,
    deviceSecurityType: DeviceSecurityType.None,
  });

  await getSession()
};

export const getSnapshot = (): Session | null => {
  return session;
}

export const subscribe = (listener: any) => {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
};

export const emitChange = () => {
  for (let listener of listeners) {
    listener();
  }
};

export const storeSession = async (newSession: Session): Promise<void> => {
  vault.setValue('session', newSession);
  session = newSession;
  emitChange();
}

export const getSession = async (): Promise<void> => {
  if (session === null) {
    if (await vault.isEmpty()) session = null; 
    else session = await vault.getValue<Session>('session');
  }
  emitChange()
};

export const clearSession = async (): Promise<void> => {
  await vault.clear();
  session = null;
  emitChange();
}

export const updateUnlockMode = async (mode: UnlockMode): Promise<void> => {
  await vault.updateConfig({
    ...(vault.config as IdentityVaultConfig),
  });
};
```
</CH.Code>

The vault's `updateConfig()` method takes a full vault configuration object, so pass our current `config`. Cast it
to `IdentityVaultConfig` to signify that we know the value is not `undefined` at this point.

---

<CH.Code>

```typescript src/util/session-vault.ts focus=68:73,76
import { 
  BrowserVault,
  Vault,
  VaultType,
  DeviceSecurityType,
  IdentityVaultConfig,
} from '@ionic-enterprise/identity-vault';
import { createVault } from './vault-factory';
import { Session } from '../models/Session';

export type UnlockMode =
  | 'BiometricsWithPasscode'
  | 'InMemory'
  | 'SecureStorage';

const vault: Vault | BrowserVault = createVault();
let session: Session | null = null;
let listeners: any[] = [];

export const initializeVault = async (): Promise<void> => {
  await vault.initialize({
    key: 'io.ionic.gettingstartedivreact',
    type: VaultType.SecureStorage,
    deviceSecurityType: DeviceSecurityType.None,
  });

  await getSession()
};

export const getSnapshot = (): Session | null => {
  return session;
}

export const subscribe = (listener: any) => {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
};

export const emitChange = () => {
  for (let listener of listeners) {
    listener();
  }
};

export const storeSession = async (newSession: Session): Promise<void> => {
  vault.setValue('session', newSession);
  session = newSession;
  emitChange();
}

export const getSession = async (): Promise<void> => {
  if (session === null) {
    if (await vault.isEmpty()) session = null; 
    else session = await vault.getValue<Session>('session');
  }
  emitChange()
};

export const clearSession = async (): Promise<void> => {
  await vault.clear();
  session = null;
  emitChange();
}

export const updateUnlockMode = async (mode: UnlockMode): Promise<void> => {
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
```

</CH.Code>

Update the `type` based on the specified `mode`.

---

<CH.Code>

```typescript src/util/session-vault.ts focus=74:77,81
import { 
  BrowserVault,
  Vault,
  VaultType,
  DeviceSecurityType,
  IdentityVaultConfig,
} from '@ionic-enterprise/identity-vault';
import { createVault } from './vault-factory';
import { Session } from '../models/Session';

export type UnlockMode =
  | 'BiometricsWithPasscode'
  | 'InMemory'
  | 'SecureStorage';

const vault: Vault | BrowserVault = createVault();
let session: Session | null = null;
let listeners: any[] = [];

export const initializeVault = async (): Promise<void> => {
  await vault.initialize({
    key: 'io.ionic.gettingstartedivreact',
    type: VaultType.SecureStorage,
    deviceSecurityType: DeviceSecurityType.None,
  });

  await getSession()
};

export const getSnapshot = (): Session | null => {
  return session;
}

export const subscribe = (listener: any) => {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
};

export const emitChange = () => {
  for (let listener of listeners) {
    listener();
  }
};

export const storeSession = async (newSession: Session): Promise<void> => {
  vault.setValue('session', newSession);
  session = newSession;
  emitChange();
}

export const getSession = async (): Promise<void> => {
  if (session === null) {
    if (await vault.isEmpty()) session = null; 
    else session = await vault.getValue<Session>('session');
  }
  emitChange()
};

export const clearSession = async (): Promise<void> => {
  await vault.clear();
  session = null;
  emitChange();
}

export const updateUnlockMode = async (mode: UnlockMode): Promise<void> => {
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
  await vault.updateConfig({
    ...(vault.config as IdentityVaultConfig),
    type,
    deviceSecurityType,
  });
};
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

#### Update the `Tab1` Page

We can now add some buttons to the `Tab1Page` in order to try out the different vault types. Update the
`src/pages/Tab1.tsx` as shown below.

<CH.Code rows={80}>

```tsx src/pages/Tab1.tsx focus=19,56:90
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
} from '@ionic/react';
import { useSyncExternalStore } from 'react';
import './Tab1.css';
import { 
  storeSession, 
  subscribe, 
  getSnapshot, 
  clearSession,
  updateUnlockMode,
} from '../util/session-vault';

const Tab1: React.FC = () => {
  const session = useSyncExternalStore(subscribe, getSnapshot);

  const storeClicked = async (): Promise<void> => {
    await storeSession({
      email: 'test@ionic.io',
      firstName: 'Tessa',
      lastName: 'Testsmith',
      accessToken: '4abf1d79-143c-4b89-b478-19607eb5ce97',
      refreshToken: '565111b6-66c3-4527-9238-6ea2cc017126',
    });
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Tab 1</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Tab 1</IonTitle>
          </IonToolbar>
        </IonHeader>
        
        <IonList>
          <IonItem>
            <IonLabel>
              <IonButton expand="block" onClick={storeClicked}>Store</IonButton>
            </IonLabel>
          </IonItem>

          <IonItem>
            <IonLabel>
              <IonButton 
                expand="block" 
                color="secondary" 
                onClick={() => updateUnlockMode('BiometricsWithPasscode')}
              >
                Use Biometrics
              </IonButton>
            </IonLabel>
          </IonItem>

          <IonItem>
            <IonLabel>
              <IonButton 
                expand="block" 
                color="secondary" 
                onClick={() => updateUnlockMode('InMemory')}
              >
                Use In Memory
              </IonButton>
            </IonLabel>
          </IonItem>

          <IonItem>
            <IonLabel>
              <IonButton 
                expand="block"
                color="secondary" 
                onClick={() => updateUnlockMode('SecureStorage')}
              >
                Use Secure Storage
              </IonButton>
            </IonLabel>
          </IonItem>

          <IonItem>
            <IonLabel>
              <IonButton expand="block" color="danger" onClick={clearSession}>
                Clear
              </IonButton>
            </IonLabel>
          </IonItem>

          <IonItem>
            <div>
              <div>{ session?.email }</div>
              <div>{ session?.firstName } { session?.lastName }</div>
              <div>{ session?.accessToken }</div>
              <div>{ session?.refreshToken }</div>
            </div>
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Tab1;
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

If you tried the tests above on an iPhone with Face ID, your app should have crashed upon restarting when using a biometric vault. If you
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

Going forward we will begin exploring functionality that only works when the application is run on a device. As such,
you should begin testing on a device instead of using the development server.

Right now, the only way to "lock" the vault is to close the application. In this section we will look at a couple of
other ways to lock the vault as well as ways to unlock it.

### Manually Locking the Vault

In `src/util/session-vault.ts`, wrap the vault's `lock()` method so we can use it in our `Tab1Page`.

<CH.Code rows={20}>

```typescript src/util/session-vault.ts focus=85:89
import { 
  BrowserVault,
  Vault,
  VaultType,
  DeviceSecurityType,
  IdentityVaultConfig,
} from '@ionic-enterprise/identity-vault';
import { createVault } from './vault-factory';
import { Session } from '../models/Session';

export type UnlockMode =
  | 'BiometricsWithPasscode'
  | 'InMemory'
  | 'SecureStorage';

const vault: Vault | BrowserVault = createVault();
let session: Session | null = null;
let listeners: any[] = [];

export const initializeVault = async (): Promise<void> => {
  await vault.initialize({
    key: 'io.ionic.gettingstartedivreact',
    type: VaultType.SecureStorage,
    deviceSecurityType: DeviceSecurityType.None,
  });

  await getSession()
};

export const getSnapshot = (): Session | null => {
  return session;
}

export const subscribe = (listener: any) => {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
};

export const emitChange = () => {
  for (let listener of listeners) {
    listener();
  }
};

export const storeSession = async (newSession: Session): Promise<void> => {
  vault.setValue('session', newSession);
  session = newSession;
  emitChange();
}

export const getSession = async (): Promise<void> => {
  if (session === null) {
    if (await vault.isEmpty()) session = null; 
    else session = await vault.getValue<Session>('session');
  }
  emitChange()
};

export const clearSession = async (): Promise<void> => {
  await vault.clear();
  session = null;
  emitChange();
}

export const updateUnlockMode = async (mode: UnlockMode): Promise<void> => {
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
  await vault.updateConfig({
    ...(vault.config as IdentityVaultConfig),
    type,
    deviceSecurityType,
  });
};

export const lockSession = async (): Promise<void> => {
  await vault.lock();
  session = null;
  emitChange();
};
```

</CH.Code>

Add a lock button in `src/pages/Tab1.tsx`.

<CH.Code rows={50}>

```tsx src/pages/Tab1.tsx focus=20,57:63
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
} from '@ionic/react';
import { useSyncExternalStore } from 'react';
import './Tab1.css';
import { 
  storeSession, 
  subscribe, 
  getSnapshot, 
  clearSession,
  updateUnlockMode,
  lockSession,
} from '../util/session-vault';

const Tab1: React.FC = () => {
  const session = useSyncExternalStore(subscribe, getSnapshot);

  const storeClicked = async (): Promise<void> => {
    await storeSession({
      email: 'test@ionic.io',
      firstName: 'Tessa',
      lastName: 'Testsmith',
      accessToken: '4abf1d79-143c-4b89-b478-19607eb5ce97',
      refreshToken: '565111b6-66c3-4527-9238-6ea2cc017126',
    });
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Tab 1</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Tab 1</IonTitle>
          </IonToolbar>
        </IonHeader>
        
        <IonList>
          <IonItem>
            <IonLabel>
              <IonButton expand="block" onClick={storeClicked}>Store</IonButton>
            </IonLabel>
          </IonItem>

          <IonItem>
            <IonLabel>
              <IonButton expand="block" color="warning" onClick={lockSession}>
                Lock
              </IonButton>
            </IonLabel>
          </IonItem>

          <IonItem>
            <IonLabel>
              <IonButton 
                expand="block" 
                color="secondary" 
                onClick={() => updateUnlockMode('BiometricsWithPasscode')}
              >
                Use Biometrics
              </IonButton>
            </IonLabel>
          </IonItem>

          <IonItem>
            <IonLabel>
              <IonButton 
                expand="block" 
                color="secondary" 
                onClick={() => updateUnlockMode('InMemory')}
              >
                Use In Memory
              </IonButton>
            </IonLabel>
          </IonItem>

          <IonItem>
            <IonLabel>
              <IonButton 
                expand="block"
                color="secondary" 
                onClick={() => updateUnlockMode('SecureStorage')}
              >
                Use Secure Storage
              </IonButton>
            </IonLabel>
          </IonItem>

          <IonItem>
            <IonLabel>
              <IonButton expand="block" color="danger" onClick={clearSession}>
                Clear
              </IonButton>
            </IonLabel>
          </IonItem>

          <IonItem>
            <div>
              <div>{ session?.email }</div>
              <div>{ session?.firstName } { session?.lastName }</div>
              <div>{ session?.accessToken }</div>
              <div>{ session?.refreshToken }</div>
            </div>
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Tab1;
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
we need to restore the session data in our page, so we can just use our `getSession()` function. When it calls the
vault's `getValue()`, the `getValue()` will attempt to unlock the vault.

Add the following code to `src/pages/Tab1.tsx`:

<CH.Code rows={45}>

```tsx src/pages/Tab1.tsx focus=21,52:58
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
} from '@ionic/react';
import { useSyncExternalStore } from 'react';
import './Tab1.css';
import { 
  storeSession, 
  subscribe, 
  getSnapshot, 
  clearSession,
  updateUnlockMode,
  lockSession,
  getSession,
} from '../util/session-vault';

const Tab1: React.FC = () => {
  const session = useSyncExternalStore(subscribe, getSnapshot);

  const storeClicked = async (): Promise<void> => {
    await storeSession({
      email: 'test@ionic.io',
      firstName: 'Tessa',
      lastName: 'Testsmith',
      accessToken: '4abf1d79-143c-4b89-b478-19607eb5ce97',
      refreshToken: '565111b6-66c3-4527-9238-6ea2cc017126',
    });
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Tab 1</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Tab 1</IonTitle>
          </IonToolbar>
        </IonHeader>
        
        <IonList>
          <IonItem>
            <IonLabel>
              <IonButton expand="block" color="warning" onClick={getSession}>
                Unlock
              </IonButton>
            </IonLabel>
          </IonItem>

          <IonItem>
            <IonLabel>
              <IonButton expand="block" onClick={storeClicked}>Store</IonButton>
            </IonLabel>
          </IonItem>

          <IonItem>
            <IonLabel>
              <IonButton expand="block" color="warning" onClick={lockSession}>
                Lock
              </IonButton>
            </IonLabel>
          </IonItem>

          <IonItem>
            <IonLabel>
              <IonButton 
                expand="block" 
                color="secondary" 
                onClick={() => updateUnlockMode('BiometricsWithPasscode')}
              >
                Use Biometrics
              </IonButton>
            </IonLabel>
          </IonItem>

          <IonItem>
            <IonLabel>
              <IonButton 
                expand="block" 
                color="secondary" 
                onClick={() => updateUnlockMode('InMemory')}
              >
                Use In Memory
              </IonButton>
            </IonLabel>
          </IonItem>

          <IonItem>
            <IonLabel>
              <IonButton 
                expand="block"
                color="secondary" 
                onClick={() => updateUnlockMode('SecureStorage')}
              >
                Use Secure Storage
              </IonButton>
            </IonLabel>
          </IonItem>

          <IonItem>
            <IonLabel>
              <IonButton expand="block" color="danger" onClick={clearSession}>
                Clear
              </IonButton>
            </IonLabel>
          </IonItem>

          <IonItem>
            <div>
              <div>{ session?.email }</div>
              <div>{ session?.firstName } { session?.lastName }</div>
              <div>{ session?.accessToken }</div>
              <div>{ session?.refreshToken }</div>
            </div>
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Tab1;
```

</CH.Code>

We can now use the "Lock" and "Unlock" buttons to verify the behavior of each of our unlock modes.

### Locking in the Background

We can manually lock our vault, but it would be nice if the vault locked for us if the application was in the background for a period of time. We can accomplish this by doing two actions when initializing the vault:

- Set the `lockAfterBackgrounded` value in the config. This value is specified in milliseconds.
- Set the `onLock` callback so the session is cleared on lock.

<CH.Code rows={20}>

```typescript src/util/session-vault.ts focus=25,28:31
import { 
  BrowserVault,
  Vault,
  VaultType,
  DeviceSecurityType,
  IdentityVaultConfig,
} from '@ionic-enterprise/identity-vault';
import { createVault } from './vault-factory';
import { Session } from '../models/Session';

export type UnlockMode =
  | 'BiometricsWithPasscode'
  | 'InMemory'
  | 'SecureStorage';

const vault: Vault | BrowserVault = createVault();
let session: Session | null = null;
let listeners: any[] = [];

export const initializeVault = async (): Promise<void> => {
  await vault.initialize({
    key: 'io.ionic.gettingstartedivreact',
    type: VaultType.SecureStorage,
    deviceSecurityType: DeviceSecurityType.None,
    lockAfterBackgrounded: 2000,
  });

  vault.onLock(() => {
    session = null;
    emitChange();
  })

  await getSession()
};

export const getSnapshot = (): Session | null => {
  return session;
}

export const subscribe = (listener: any) => {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
};

export const emitChange = () => {
  for (let listener of listeners) {
    listener();
  }
};

export const storeSession = async (newSession: Session): Promise<void> => {
  vault.setValue('session', newSession);
  session = newSession;
  emitChange();
}

export const getSession = async (): Promise<void> => {
  if (session === null) {
    if (await vault.isEmpty()) session = null; 
    else session = await vault.getValue<Session>('session');
  }
  emitChange()
};

export const clearSession = async (): Promise<void> => {
  await vault.clear();
  session = null;
  emitChange();
}

export const updateUnlockMode = async (mode: UnlockMode): Promise<void> => {
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
  await vault.updateConfig({
    ...(vault.config as IdentityVaultConfig),
    type,
    deviceSecurityType,
  });
};

export const lockSession = async (): Promise<void> => {
  await vault.lock();
  session = null;
  emitChange();
};
```

</CH.Code>

## Architectural Considerations

### Construction vs. Initialization

Have a look at the `src/util/session-vault.ts` file. Notice that it is very intentional about separating construction and initialization. **This is very important.**

Identity Vault allows you to pass the configuration object via the `new Vault(cfg)` constructor. This, however, will make asynchronous calls which makes construction indeterminate.

Always use a pattern of:

- Construct the vault via `new Vault()` (default constructor, no configuration).
- Pass the configuration to the `vault.initialize(cfg)` function.
- Perform the initialization itself prior to mounting the application and make sure that the code is properly
  `await`ing its completion.

### Control Unlocking on Startup and Navigation

Our code is currently automatically unlocking the vault upon startup due to our `getSession` function being invoked as part of our initialization logic. This is OK for our app, but it could be a problem if we had situations where multiple calls to get data from a locked vault all happened simultaneously. Always make sure you are controlling the vault lock status in such situations to ensure that only one unlock attempt is being made at a time.

We will see various strategies for this in later tutorials. You can also refer to our
[troubleshooting guide](https://ionic.io/docs/identity-vault/troubleshooting) for further guidance.

### Initial Vault Type Configuration

When we first initialize the vault we use the following configuration:

```typescript
  await vault.initialize({
    key: 'io.ionic.gettingstartedivreact',
    type: VaultType.SecureStorage,
    deviceSecurityType: DeviceSecurityType.None,
    lockAfterBackgrounded: 2000,
  });
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
