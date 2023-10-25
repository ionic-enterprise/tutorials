---
title: Getting Started with Auth Connect
sidebar_label: Getting Started
sidebar_position: 1
---

## Generate the Application

Before we explore the use of Auth Connect, we need to scaffold an application. In this section, we will generate an `@ionic/react` tabs based application, perform some basic configuration, and add the `iOS` and `Android` platforms.

<CH.Scrollycoding>

<CH.Code>

```bash Terminal
ionic start getting-started-ac tabs --type=react
```

</CH.Code>

Use the Ionic CLI to generate the application.

---

<CH.Code>

```bash Terminal focus=2
ionic start getting-started-ac tabs --type=react
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
  webDir: 'dist',
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
ionic start getting-started-ac tabs --type=react
cd getting-started-ac
npm run build
ionic cap add android
ionic cap add ios
```

</CH.Code>

Build the application and install the platforms.

---

<CH.Code>

```json package.json focus=8[33:43]
{
  "name": "getting-started-ac",
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

We should do a `cap sync` with each build. This ensures our native projects remain up to date. Change the scripts in `package.json` to do this.

---

<CH.Code>

```typescript vite.config.ts focus=8:10
import legacy from '@vitejs/plugin-legacy';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), legacy()],
  server: {
    port: 8100,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
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

## Create the "Session Store"

When using Auth Connect, the current session is defined by the current [AuthResult](https://ionic.io/docs/auth-connect/interfaces/AuthResult) which contains auth tokens as well as other session information. Auth Connect returns an `AuthResult` from the `login()` function. We will need a place to store that result. Let's create that now. Create a `src/util` directory, then create a file called `src/util/session-store.ts`.

<CH.Scrollycoding>

<CH.Code>

```typescript session-store.ts
import { AuthResult } from '@ionic-enterprise/auth';

let session: AuthResult | null = null;
```

</CH.Code>

We know we will need to store the session, and that the session is defined by the `AuthResult`.

---

<CH.Code>

```typescript session-store.ts focus=4:11
import { AuthResult } from '@ionic-enterprise/auth';

let session: AuthResult | null = null;
let listeners: any[] = [];

const subscribe = (listener: any) => {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
};
```

</CH.Code>

Eventually, this store will be used with a [useSyncExternalHook](https://react.dev/reference/react/useSyncExternalStore) hook. Because of this, we need some boilerplate code starting with a `subscribe()` function.

---

<CH.Code>

```typescript session-store.ts focus=13:15
import { AuthResult } from '@ionic-enterprise/auth';

let session: AuthResult | null = null;
let listeners: any[] = [];

const subscribe = (listener: any) => {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
};

const getSnapshot = (): AuthResult | null => {
  return session;
};
```

</CH.Code>

Add a `getSnapshot()` function that just returns the current session.

---

<CH.Code>

```typescript session-store.ts focus=17:21
import { AuthResult } from '@ionic-enterprise/auth';

let session: AuthResult | null = null;
let listeners: any[] = [];

const subscribe = (listener: any) => {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
};

const getSnapshot = (): AuthResult | null => {
  return session;
};

const emitChange = () => {
  for (let listener of listeners) {
    listener();
  }
};
```

</CH.Code>

When the `session` changes, we need to inform any subscribed listeners.

---

<CH.Code>

```typescript session-store.ts focus=23:26
import { AuthResult } from '@ionic-enterprise/auth';

let session: AuthResult | null = null;
let listeners: any[] = [];

const subscribe = (listener: any) => {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
};

const getSnapshot = (): AuthResult | null => {
  return session;
};

const emitChange = () => {
  for (let listener of listeners) {
    listener();
  }
};

const setSession = (newSession: AuthResult | null) => {
  session = newSession;
  emitChange();
};
```

</CH.Code>

We need a function that we can use to set the `session`. For now, this is the only function that changes the `session` and emits the change.

---

<CH.Code>

```typescript session-store.ts focus=28
import { AuthResult } from '@ionic-enterprise/auth';

let session: AuthResult | null = null;
let listeners: any[] = [];

const subscribe = (listener: any) => {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
};

const getSnapshot = (): AuthResult | null => {
  return session;
};

const emitChange = () => {
  for (let listener of listeners) {
    listener();
  }
};

const setSession = (newSession: AuthResult | null) => {
  session = newSession;
  emitChange();
};

export { subscribe, getSnapshot, setSession };
```

</CH.Code>

Export the functions that will need to be used elsewhere in our application.

</CH.Scrollycoding>

## Create the `Authentication` Utility Functions

All interaction with Auth Connect will be abstracted into a set of functions in an `authentication` utility module. Create an empty `src/utils/authentication.ts` file.

### Setup and Initialization

Before we use Auth Connect, we need to make sure that it is properly set up and initialized. We will build a utility function to perform the setup and initialization required by Auth Connect.

<CH.Scrollycoding>

<CH.Code>

```typescript authentication.ts
import { isPlatform } from '@ionic/react';

const isNative = isPlatform('hybrid');
```

</CH.Code>

Auth Connect needs a slightly different configuration between mobile and web, so we need to know in which context we are currently running.

---

<CH.Code>

```typescript authentication.ts focus=1,5
import { Auth0Provider } from '@ionic-enterprise/auth';
import { isPlatform } from '@ionic/react';

const isNative = isPlatform('hybrid');
const provider = new Auth0Provider();
```

</CH.Code>

For this tutorial, we are using Auth0 as the authentication vendor. We need to create an `Auth0Provider` to help Auth Connect with the communication with Auth0.

---

<CH.Code>

```typescript authentication.ts focus=1[25:39],7:19
import { Auth0Provider, ProviderOptions } from '@ionic-enterprise/auth';
import { isPlatform } from '@ionic/react';

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
```

</CH.Code>

Auth Connect needs to know how to communicate with our authentication vendor. You will likely need to get this information from the team that manages your cloud infrastructure.

---

<CH.Code>

```typescript authentication.ts focus=3,25:32
import {
  Auth0Provider,
  AuthConnect,
  ProviderOptions,
} from '@ionic-enterprise/auth';
import { isPlatform } from '@ionic/react';

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

const setupAuthConnect = async (): Promise<void> => {
  return AuthConnect.setup({
    platform: isNative ? 'capacitor' : 'web',
    logLevel: 'DEBUG',
    ios: { webView: 'private' },
    web: { uiMode: 'popup', authFlow: 'implicit' },
  });
};
```

</CH.Code>

We need to perform a one-time setup with Auth Connect. Please refer to the [documentation](https://ionic.io/docs/auth-connect/interfaces/AuthConnectConfig) if you have any questions about the individual properties. We will start here with a simple set up that is good for development.

The utility module needs to return the `setupAuthConnect` function. It will be called elsewhere.

---

<CH.Code>

```typescript authentication.ts focus=34
import {
  Auth0Provider,
  AuthConnect,
  ProviderOptions,
} from '@ionic-enterprise/auth';
import { isPlatform } from '@ionic/react';

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

const setupAuthConnect = async (): Promise<void> => {
  return AuthConnect.setup({
    platform: isNative ? 'capacitor' : 'web',
    logLevel: 'DEBUG',
    ios: { webView: 'private' },
    web: { uiMode: 'popup', authFlow: 'implicit' },
  });
};

export { setupAuthConnect };
```

</CH.Code>

The utility module needs to return the `setupAuthConnect` function. It will be called elsewhere.

</CH.Scrollycoding>

### Login and Logout

We need to create `login()` and `logout()` functions.

<CH.Scrollycoding>

<CH.Code>

```typescript authentication.ts focus=7
import {
  Auth0Provider,
  AuthConnect,
  ProviderOptions,
} from '@ionic-enterprise/auth';
import { isPlatform } from '@ionic/react';
import { getSnapshot, setSession } from './session-store';

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

const setupAuthConnect = async (): Promise<void> => {
  return AuthConnect.setup({
    platform: isNative ? 'capacitor' : 'web',
    logLevel: 'DEBUG',
    ios: { webView: 'private' },
    web: { uiMode: 'popup', authFlow: 'implicit' },
  });
};

export { setupAuthConnect };
```

</CH.Code>

Import the functions from our session store that are used to get and set the session.

---

<CH.Code>

```typescript authentication.ts focus=35:38,40[10:15]
import {
  Auth0Provider,
  AuthConnect,
  ProviderOptions,
} from '@ionic-enterprise/auth';
import { isPlatform } from '@ionic/react';
import { getSnapshot, setSession } from './session-store';

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

const setupAuthConnect = async (): Promise<void> => {
  return AuthConnect.setup({
    platform: isNative ? 'capacitor' : 'web',
    logLevel: 'DEBUG',
    ios: { webView: 'private' },
    web: { uiMode: 'popup', authFlow: 'implicit' },
  });
};

const login = async (): Promise<void> => {
  const authResult = await AuthConnect.login(provider, authOptions);
  setSession(authResult);
};

export { login, setupAuthConnect };
```

</CH.Code>

For the `login()`, we need to pass both the `provider` and the `authOptions` we established earlier. It restores an `AuthResult` that we need to store. Be sure to export the function so we can use it in the rest of our app.

---

<CH.Code>

```typescript authentication.ts focus=41:47,49[17:23]
import {
  Auth0Provider,
  AuthConnect,
  ProviderOptions,
} from '@ionic-enterprise/auth';
import { isPlatform } from '@ionic/react';
import { getSnapshot, setSession } from './session-store';

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

const setupAuthConnect = async (): Promise<void> => {
  return AuthConnect.setup({
    platform: isNative ? 'capacitor' : 'web',
    logLevel: 'DEBUG',
    ios: { webView: 'private' },
    web: { uiMode: 'popup', authFlow: 'implicit' },
  });
};

const login = async (): Promise<void> => {
  const authResult = await AuthConnect.login(provider, authOptions);
  setSession(authResult);
};

const logout = async (): Promise<void> => {
  const authResult = getSnapshot();
  if (authResult) {
    await AuthConnect.logout(provider, authResult);
    setSession(null);
  }
};

export { login, logout, setupAuthConnect };
```

</CH.Code>

For the `logout()`, when calling Auth Connect we need to pass the `provider` as well as the `AuthResult` we established with the `login()`. If the logout succeeds, the session needs to be cleared.

</CH.Scrollycoding>

## Handling the Authentication Flow

Now that the utility functions are complete, we will use them to implement the authentication flow of our application. To do this, we will need to:

- Create the `AuthActionCompletePage` and route that is used in our configuration.
- Expose the authentication state to our application via the creation of an `AuthenticationProvider`.
- Add buttons to the `Tab1` page that will be used to perform the `login()` and `logout()` operations.

### Create the `AuthActionCompletePage`

The `logoutUrl` and `redirectUri` properties are using the `/auth-action-complete` route. Create a page for the route. The page does not have to do much. We will just display a spinner in case someone sees it momentarily.

<CH.Code>

```tsx src/pages/AuthActionCompletePage.tsx
import { IonContent, IonPage, IonSpinner } from '@ionic/react';
import './AuthActionCompletePage.css';

const AuthActionCompletePage: React.FC = () => (
  <IonPage>
    <IonContent className="main-content auth-action-complete">
      <div className="container">
        <IonSpinner name="dots" />
      </div>
    </IonContent>
  </IonPage>
);
export default AuthActionCompletePage;
```

</CH.Code>

We will perform a small bit of styling to make the page look nice.

<CH.Code>

```tsx src/pages/AuthActionCompletePage.css
.auth-action-complete .container {
  text-align: center;
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}
```

</CH.Code>

Be sure to add the route in the router setup. In a production app, this likely would _not_ be put within the `IonTabs` structure. Refactoring the routing, however, to avoid this is beyond the scope of this tutorial.

<CH.Code>

```tsx src/App.tsx focus=14,54:56
import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact,
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { ellipse, square, triangle } from 'ionicons/icons';
import AuthActionCompletePage from './pages/AuthActionCompletePage';
import Tab1 from './pages/Tab1';
import Tab2 from './pages/Tab2';
import Tab3 from './pages/Tab3';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonTabs>
        <IonRouterOutlet>
          <Route exact path="/tab1">
            <Tab1 />
          </Route>
          <Route exact path="/tab2">
            <Tab2 />
          </Route>
          <Route path="/tab3">
            <Tab3 />
          </Route>
          <Route path="/auth-action-complete">
            <AuthActionCompletePage />
          </Route>
          <Route exact path="/">
            <Redirect to="/tab1" />
          </Route>
        </IonRouterOutlet>
        <IonTabBar slot="bottom">
          <IonTabButton tab="tab1" href="/tab1">
            <IonIcon aria-hidden="true" icon={triangle} />
            <IonLabel>Tab 1</IonLabel>
          </IonTabButton>
          <IonTabButton tab="tab2" href="/tab2">
            <IonIcon aria-hidden="true" icon={ellipse} />
            <IonLabel>Tab 2</IonLabel>
          </IonTabButton>
          <IonTabButton tab="tab3" href="/tab3">
            <IonIcon aria-hidden="true" icon={square} />
            <IonLabel>Tab 3</IonLabel>
          </IonTabButton>
        </IonTabBar>
      </IonTabs>
    </IonReactRouter>
  </IonApp>
);

export default App;
```

</CH.Code>

### Create the `AuthenticationProvider`

The Auth Connect related functionality will be exposed to our application via a context provider, which we will now build. Create a `src/providers` directory containing a file named `src/providers/AuthenticationProvider.tsx`

<CH.Scrollycoding>

<CH.Code>

```tsx AuthenticationProvider.tsx
import { createContext } from 'react';

type Context = {
  isAuthenticated: boolean;
};

export const AuthenticationContext = createContext<Context>({
  isAuthenticated: false,
});
```

</CH.Code>

Start with creating the context we want to provide to the application.

---

<CH.Code>

```tsx AuthenticationProvider.tsx focus=1[10:27,42:51],11:21
import { PropsWithChildren, createContext, useState } from 'react';

type Context = {
  isAuthenticated: boolean;
};

export const AuthenticationContext = createContext<Context>({
  isAuthenticated: false,
});

export const AuthenticationProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <AuthenticationContext.Provider value={{ isAuthenticated }}>
      {children}
    </AuthenticationContext.Provider>
  );
};
```

</CH.Code>

Create a shell component for the `AuthenticationProvider`. It needs to render the context we created.

---

<CH.Code>

```tsx AuthenticationProvider.tsx focus=1,2[42:52],3,17,19:21,25
import { IonSpinner } from '@ionic/react';
import { PropsWithChildren, createContext, useEffect, useState } from 'react';
import { setupAuthConnect } from '../utils/authentication';

type Context = {
  isAuthenticated: boolean;
};

export const AuthenticationContext = createContext<Context>({
  isAuthenticated: false,
});

export const AuthenticationProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSetup, setIsSetup] = useState(false);

  useEffect(() => {
    setupAuthConnect().then(() => setIsSetup(true));
  }, []);

  return (
    <AuthenticationContext.Provider value={{ isAuthenticated }}>
      {isSetup ? children : <IonSpinner />}
    </AuthenticationContext.Provider>
  );
};
```

</CH.Code>

Initialize `AuthConnect`. The child components should only be able to interact with `AuthConnect` after it has completed the initialization process, so display a spinner until this is complete.

---

<CH.Code>

```tsx AuthenticationProvider.tsx focus=7,10,25,31:33
import { IonSpinner } from '@ionic/react';
import {
  PropsWithChildren,
  createContext,
  useEffect,
  useState,
  useSyncExternalStore,
} from 'react';
import { setupAuthConnect } from '../utils/authentication';
import { getSnapshot, subscribe } from '../utils/session-store';

type Context = {
  isAuthenticated: boolean;
};

export const AuthenticationContext = createContext<Context>({
  isAuthenticated: false,
});

export const AuthenticationProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSetup, setIsSetup] = useState(false);
  const session = useSyncExternalStore(subscribe, getSnapshot);

  useEffect(() => {
    setupAuthConnect().then(() => setIsSetup(true));
  }, []);

  useEffect(() => {
    setIsAuthenticated(!!session);
  }, [session]);

  return (
    <AuthenticationContext.Provider value={{ isAuthenticated }}>
      {isSetup ? children : <IonSpinner />}
    </AuthenticationContext.Provider>
  );
};
```

</CH.Code>

Get the `session` value from our session store and update `isAuthenticated` when its value changes.

</CH.Scrollycoding>

Now that the `AuthenticationProvider` has been created, we can add it to our application, which will allow us to perform the login and logout actions. Modify `src/App.tsx` to surround the bulk of our application with the provider.

<CH.Code>

```tsx focus=14,43,79
import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact,
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { ellipse, square, triangle } from 'ionicons/icons';
import { AuthenticationProvider } from './providers/AuthenticationProvider';
import AuthActionCompletePage from './pages/AuthActionCompletePage';
import Tab1 from './pages/Tab1';
import Tab2 from './pages/Tab2';
import Tab3 from './pages/Tab3';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <AuthenticationProvider>
      <IonReactRouter>
        <IonTabs>
          <IonRouterOutlet>
            <Route exact path="/tab1">
              <Tab1 />
            </Route>
            <Route exact path="/tab2">
              <Tab2 />
            </Route>
            <Route path="/tab3">
              <Tab3 />
            </Route>
            <Route path="/auth-action-complete">
              <AuthActionCompletePage />
            </Route>
            <Route exact path="/">
              <Redirect to="/tab1" />
            </Route>
          </IonRouterOutlet>
          <IonTabBar slot="bottom">
            <IonTabButton tab="tab1" href="/tab1">
              <IonIcon aria-hidden="true" icon={triangle} />
              <IonLabel>Tab 1</IonLabel>
            </IonTabButton>
            <IonTabButton tab="tab2" href="/tab2">
              <IonIcon aria-hidden="true" icon={ellipse} />
              <IonLabel>Tab 2</IonLabel>
            </IonTabButton>
            <IonTabButton tab="tab3" href="/tab3">
              <IonIcon aria-hidden="true" icon={square} />
              <IonLabel>Tab 3</IonLabel>
            </IonTabButton>
          </IonTabBar>
        </IonTabs>
      </IonReactRouter>
    </AuthenticationProvider>
  </IonApp>
);

export default App;
```

</CH.Code>

### Hook Up the Login and Logout

We can use the first tab of our application to test the `login()` and `logout()` functions.

<CH.Scrollycoding>

<CH.Code>

```tsx Tab1.tsx
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

Currently, the `Tab1` page contains the default skeleton code.

---

<CH.Code>

```tsx Tab1.tsx focus=8:9,14
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { useContext } from 'react';
import { AuthenticationContext } from '../providers/AuthenticationProvider';
import ExploreContainer from '../components/ExploreContainer';
import './Tab1.css';

const Tab1: React.FC = () => {
  const { isAuthenticated } = useContext(AuthenticationContext);

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

Use the `AuthenticationContext` to get the `isAuthenticated` value.

---

<CH.Code>

```tsx Tab1.tsx focus=2,29:33
import {
  IonButton,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { useContext } from 'react';
import { AuthenticationContext } from '../providers/AuthenticationProvider';
import './Tab1.css';

const Tab1: React.FC = () => {
  const { isAuthenticated } = useContext(AuthenticationContext);

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
        {isAuthenticated ? (
          <IonButton>Logout</IonButton>
        ) : (
          <IonButton>Login</IonButton>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Tab1;
```

</CH.Code>

Replace the `ExploreContainer` component with a Login or Logout button, depending on the current authentication status.

---

<CH.Code>

```tsx Tab1.tsx focus=11,31[22:37],33[22:36]
import {
  IonButton,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { useContext } from 'react';
import { AuthenticationContext } from '../providers/AuthenticationProvider';
import { login, logout } from '../utils/authentication';
import './Tab1.css';

const Tab1: React.FC = () => {
  const { isAuthenticated } = useContext(AuthenticationContext);

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
        {isAuthenticated ? (
          <IonButton onClick={logout}>Logout</IonButton>
        ) : (
          <IonButton onClick={login}>Login</IonButton>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Tab1;
```

</CH.Code>

Perform a `login()` or `logout()` on click accordingly.

</CH.Scrollycoding>

Test this in the web using the following credentials:

- email: `test@ionic.io`
- password: `Ion54321`

At this point if we press the Login button, a tab should open where we can log in using Auth0. This tab will close after we log in. When we press the logout button a tab will briefly open to perform the logout and then automatically close. The button that is displayed changes based on our current authentication status.

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

## Persist the `AuthResult`

The user can perform login and logout operations, but if the browser is refreshed, the application loses the `AuthResult`. This value needs to be persisted between sessions of the application. To fix this, we will modify our session store to use the [Preferences](https://capacitorjs.com/docs/apis/preferences) plugin to persist the `AuthResult`. In a production application, we should store the result more securely by using [Identity Vault](https://ionic.io/docs/identity-vault). However, setting up Identity Vault is beyond the scope of this tutorial.

```bash Terminal
npm install @capacitor/preferences
```

Use the `@capacitor/preferences` in our session store to persist the `AuthResult` we received when logging in.

<CH.Scrollycoding>

<CH.Code>

```typescript session-store.ts focus=3,14,24
import { AuthResult } from '@ionic-enterprise/auth';

let session: AuthResult | null = null;
let listeners: any[] = [];

const subscribe = (listener: any) => {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
};

const getSnapshot = (): AuthResult | null => {
  return session;
};

const emitChange = () => {
  for (let listener of listeners) {
    listener();
  }
};

const setSession = (newSession: AuthResult | null) => {
  session = newSession;
  emitChange();
};

export { subscribe, getSnapshot, setSession };
```

</CH.Code>

Currently, the session information is _only_ stored in the `session` variable. We will modify our code to store the session information using the `Preferences` plugin.

---

<CH.Code>

```typescript session-store.ts focus=2
import { AuthResult } from '@ionic-enterprise/auth';
import { Preferences } from '@capacitor/preferences';

let session: AuthResult | null = null;
let listeners: any[] = [];

const subscribe = (listener: any) => {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
};

const getSnapshot = (): AuthResult | null => {
  return session;
};

const emitChange = () => {
  for (let listener of listeners) {
    listener();
  }
};

const setSession = (newSession: AuthResult | null) => {
  session = newSession;
  emitChange();
};

export { subscribe, getSnapshot, setSession };
```

</CH.Code>

Import the `Preferences` plugin.

---

<CH.Code>

```typescript session-store.ts focus=24[20:24],26
import { AuthResult } from '@ionic-enterprise/auth';
import { Preferences } from '@capacitor/preferences';

let session: AuthResult | null = null;
let listeners: any[] = [];

const subscribe = (listener: any) => {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
};

const getSnapshot = (): AuthResult | null => {
  return session;
};

const emitChange = () => {
  for (let listener of listeners) {
    listener();
  }
};

const setSession = async (newSession: AuthResult | null) => {
  session = newSession;
  await Preferences.set({ key: 'session', value: JSON.stringify(newSession) });
  emitChange();
};

export { subscribe, getSnapshot, setSession };
```

</CH.Code>

Save the session to `Preferences` when the session is set.

---

<CH.Code>

```typescript session-store.ts focus=30:35
import { AuthResult } from '@ionic-enterprise/auth';
import { Preferences } from '@capacitor/preferences';

let session: AuthResult | null = null;
let listeners: any[] = [];

const subscribe = (listener: any) => {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
};

const getSnapshot = (): AuthResult | null => {
  return session;
};

const emitChange = () => {
  for (let listener of listeners) {
    listener();
  }
};

const setSession = async (newSession: AuthResult | null) => {
  session = newSession;
  await Preferences.set({ key: 'session', value: JSON.stringify(newSession) });
  emitChange();
};

Preferences.get({ key: 'session' }).then((result) => {
  if (result.value) {
    session = JSON.parse(result.value);
    emitChange();
  }
});

export { subscribe, getSnapshot, setSession };
```

</CH.Code>

Get the session from `Preferences` when the code is instantiated.

</CH.Scrollycoding>

If the user logs in and either refreshes the browser or restarts the application the authentication state is preserved.

## Next Steps

Explore the specific topics that are of interest to you at this time. This application is used as the foundation to build upon as those topics are explored.

Happy coding!! 🤓
