---
title: Protect the Routes
sidebar_label: Protect the Routes
sidebar_position: 3
---

## Overview

Now that we are authenticating with a provider we need to look at protecting our routes. This protection takes two major forms:

1. Guarding our routes so a user cannot navigate to various places within our application unless they are logged in.
1. Protecting our backend API such that users cannot access data without a valid access token. Our role is to pass the access token to our API.

We will also see how to handle the possibility that our APIs may now issue 401 errors in cases where our access token has expired or is otherwise invalid.

We will build upon the application we created in the [getting started tutorial](getting-started) in order to implement route guards for our application's routes as well as to add HTTP interceptors to attach access tokens to outgoing requests and to handle potential 401 errors in responses.

## Let's Code

As mentioned previously, this tutorial builds upon the application created when doing the [getting started tutorial](getting-started). If you have the code from when you performed that tutorial, then you are good to go. If you need the code you can make a copy from [our GitHub repository](https://github.com/ionic-enterprise/tutorials-and-demos-vue/tree/main/auth-connect/getting-started).

### Route Guards

We are using the `Tab1Page` to manage our authentication status. Let's assume that the `Tab2Page` and `Tab3Page` should only be accessible if the user is authenticated. We already have a method that determines if the user is authenticated or not. In its most basic form, we use the existence of an `AuthResult` with an access token to determine whether or not we are authenticated. Other tutorials show how this can be expanded.

<CH.Code rows={10}>

```typescript src/composables/authentication.ts focus=54:59
import { Capacitor } from '@capacitor/core';
import {
  Auth0Provider,
  AuthConnect,
  AuthResult,
  ProviderOptions,
} from '@ionic-enterprise/auth';
import { useSession } from '@/composables/session';

const isNative = Capacitor.isNativePlatform();
const provider = new Auth0Provider();
const authOptions: ProviderOptions = {
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
  isAuthenticated: async (): Promise<boolean> => {
    const authResult = await getAuthResult();
    return (
      !!authResult && (await AuthConnect.isAccessTokenAvailable(authResult))
    );
  },
  login: async (): Promise<void> => {
    await isReady;
    authResult = await AuthConnect.login(provider, authOptions);
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

Within the router configuration code, create a function that checks the authentication status for routes that require an authenticated user. This function will then be added to the navigation pipeline.

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

Currently, the router always allows access to all routes.

---

<CH.Code>

```typescript src/router/index.ts focus=3,4,8
import { createRouter, createWebHistory } from '@ionic/vue-router';
import {
  NavigationGuardNext,
  RouteLocationNormalized,
  RouteRecordRaw,
} from 'vue-router';
import TabsPage from '../views/TabsPage.vue';
import { useAuthentication } from '@/composables/authentication';

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

Import a couple of items related to Vue Router navigation guards. Also import our authentication composable so we will be able to access the `isAuthenticated()` function.

---

<CH.Code>

```typescript src/router/index.ts focus=48:56
import { createRouter, createWebHistory } from '@ionic/vue-router';
import {
  NavigationGuardNext,
  RouteLocationNormalized,
  RouteRecordRaw,
} from 'vue-router';
import TabsPage from '../views/TabsPage.vue';
import { useAuthentication } from '@/composables/authentication';

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

const checkAuthStatus = async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  next();
};

router.beforeEach(checkAuthStatus);

export default router;
```

</CH.Code>

Create a guard and add it to the navigation pipeline such that it runs before any navigation. For now, it runs on all routes and it simply allows navigation.

---

<CH.Code>

```typescript src/router/index.ts focus=30,35,55:57
import { createRouter, createWebHistory } from '@ionic/vue-router';
import {
  NavigationGuardNext,
  RouteLocationNormalized,
  RouteRecordRaw,
} from 'vue-router';
import TabsPage from '../views/TabsPage.vue';
import { useAuthentication } from '@/composables/authentication';

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
        meta: { requiresAuth: true },
      },
      {
        path: 'tab3',
        component: () => import('@/views/Tab3Page.vue'),
        meta: { requiresAuth: true },
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

const checkAuthStatus = async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  if (to.matched.some((r) => r.meta.requiresAuth)) {
    // TODO: something different
  }
  next();
};

router.beforeEach(checkAuthStatus);

export default router;
```

</CH.Code>

If at least one segment in the `to` route requires authentication, we should do something different.

---

<CH.Code>

```typescript src/router/index.ts focus=56:59
import { createRouter, createWebHistory } from '@ionic/vue-router';
import {
  NavigationGuardNext,
  RouteLocationNormalized,
  RouteRecordRaw,
} from 'vue-router';
import TabsPage from '../views/TabsPage.vue';
import { useAuthentication } from '@/composables/authentication';

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
        meta: { requiresAuth: true },
      },
      {
        path: 'tab3',
        component: () => import('@/views/Tab3Page.vue'),
        meta: { requiresAuth: true },
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

const checkAuthStatus = async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  if (to.matched.some((r) => r.meta.requiresAuth)) {
    const { isAuthenticated } = useAuth();
    if (!(await isAuthenticated())) {
      return next('/tabs/tab1');
    }
  }
  next();
};

router.beforeEach(checkAuthStatus);

export default router;
```

</CH.Code>

For the routes that require authentication, if the user is not authenticated, navigate to our authentication page instead.

</CH.Scrollycoding>

Test this in your app. You should see that you cannot navigate to `Tab2Page` or `Tab3Page` unless you are authenticated. This is exactly what we want and it works well.

To verify the redirection in route, run the application in a web browser and navigate directly to `http://localhost:8100/tabs/tab2` while not authenticated.

### Provide the Access Token

When a user logs in using [Auth Connect](https://ionic.io/docs/auth-connect) the application receives an `AuthResult` that represents the authentication session. The `AuthResult` object provides access to several types of tokens:

- **ID Token**: The ID token contains information pertaining to the identity of the authenticated user. The information within this token is typically consumed by the client application.
- **Access Token**: The access token signifies that the user has properly authenticated. This token is typically sent to the application's backend APIs as a bearer token. The token is verified by the API to grant access to the protected resources exposed by the API. Since this token is used in communications with the backend API, a common security practice is to give it a very limited lifetime.
- **Refresh Token**: Since access tokens typically have a short lifetime, longer lived refresh tokens are used to extend the length of a user's authentication session by allowing the access tokens to be refreshed.

The most common way for the backend API to protect its routes is to require that requests include a valid access token. As such, we are going to have to send the access token with each request.

<CH.Scrollycoding>

<CH.Code>

```typescript src/composables/authentication.service.ts focus=54:58
import { Capacitor } from '@capacitor/core';
import {
  Auth0Provider,
  AuthConnect,
  AuthResult,
  ProviderOptions,
} from '@ionic-enterprise/auth';
import { useSession } from '@/composables/session';

const isNative = Capacitor.isNativePlatform();
const provider = new Auth0Provider();
const authOptions: ProviderOptions = {
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
  getAccessToken: async (): Promise<string | undefined> => {
    await isReady;
    const res = await getAuthResult();
    return res?.accessToken;
  },
  isAuthenticated: async (): Promise<boolean> => {
    const authResult = await getAuthResult();
    return (
      !!authResult && (await AuthConnect.isAccessTokenAvailable(authResult))
    );
  },
  login: async (): Promise<void> => {
    await isReady;
    authResult = await AuthConnect.login(provider, authOptions);
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

Add a function to the `useAuthentication()` composable API that gets the access token:

---

<CH.Code>

```vue src/views/Tab1Page.vue focus=20,37[9:22],38,43
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

      <pre>{{ accessToken }}</pre>
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

const { getAccessToken, isAuthenticated, login, logout } = useAuthentication();
const accessToken = ref<string>();
const authenticated = ref<boolean>();

const checkAuthentication = async (): Promise<void> => {
  authenticated.value = await isAuthenticated();
  accessToken.value = await getAccessToken();
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

Modify the `Tab1Page` to grab the access token and display it.

</CH.Scrollycoding>

We would not normally grab the access token and display it like that. This is just being done to make sure everything is working. Log in and out a few times. You should see a token while logged in but not while logged out.

It is common to use a library like [Axios](https://axios-http.com/docs/intro) to perform HTTP operations. Axios also makes it easy to modify outgoing requests via [Interceptors](https://axios-http.com/docs/interceptors). We will use these to add the access token to outbound HTTP requests. Note that this is just an example of the type of thing you need do. You do not have to use Axios, but can use whatever technology you would like to use.

<CH.Code>

```bash Terminal
npm install axios
```

</CH.Code>

We will create a composition API function that manages an Axios `client` for our backend API. Once that exists, we will add an interceptor to the `client` that adds the access token to outbound requests.

<CH.Scrollycoding>

<CH.Code>

```typescript src/composables/backend-api.ts
import axios from 'axios';

const baseURL = 'https://cs-demo-api.herokuapp.com';

const client = axios.create({
  baseURL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

export const useBackendAPI = () => {
  return {
    client,
  };
};
```

</CH.Code>

We start with a very basic Axios client that connects to our backend API.

---

<CH.Code>

```typescript src/composables/backend-api.ts focus=1[13:44],13:15
import axios, { InternalAxiosRequestConfig } from 'axios';

const baseURL = 'https://cs-demo-api.herokuapp.com';

const client = axios.create({
  baseURL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  return config;
});

export const useBackendAPI = () => {
  return {
    client,
  };
};
```

</CH.Code>

Create a stub for the interceptor. Since we want to modify the request, we need to attach the function to `client.interceptors.request`.

---

<CH.Code>

```typescript src/composables/backend-api.ts focus=2,15:16
import axios, { InternalAxiosRequestConfig } from 'axios';
import { useAuthentication } from './authentication';

const baseURL = 'https://cs-demo-api.herokuapp.com';

const client = axios.create({
  baseURL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const { getAccessToken } = useAuthentication();
  const token = await getAccessToken();
  return config;
});

export const useBackendAPI = () => {
  return {
    client,
  };
};
```

</CH.Code>

Get the access token.

---

<CH.Code>

```typescript src/composables/backend-api.ts focus=17:19
import axios, { InternalAxiosRequestConfig } from 'axios';
import { useAuthentication } from './authentication';

const baseURL = 'https://cs-demo-api.herokuapp.com';

const client = axios.create({
  baseURL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const { getAccessToken } = useAuthentication();
  const token = await getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const useBackendAPI = () => {
  return {
    client,
  };
};
```

</CH.Code>

If a token exists, attach it to the header.

</CH.Scrollycoding>

If we have an access token, it will now be attached to any request that is sent to `https://cs-demo-api.herokuapp.com` (our backend API). Note that you _could_ have multiple APIs that all recognize the provided access token. In that case you would create various composable API functions with similar code. Providing proper abstraction layers for such a scenario is left as an exercise for the reader.

### Handle 401 Errors

Now that the access token is sent to the backend, we need to also handle the case where the backend rejects the access token resulting in a [401 - Unauthorized](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/401) response status. Since we need to examine the response, this interceptor is attached to `client.interceptors.response`.

The interceptor needs to be built out to clear the session data and navigate to the login page when a 401 error occurs.

<CH.Scrollycoding>

<CH.Code>

```typescript src/composables/backend-api.ts
import axios, { InternalAxiosRequestConfig } from 'axios';
import { useAuthentication } from './authentication';

const baseURL = 'https://cs-demo-api.herokuapp.com';

const client = axios.create({
  baseURL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const { getAccessToken } = useAuthentication();
  const token = await getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const useBackendAPI = () => {
  return {
    client,
  };
};
```

</CH.Code>

Start with the existing code in `src/composables/backend-api.ts`.

---

<CH.Code>

```typescript src/composables/backend-api.ts focus=23
import axios, { InternalAxiosRequestConfig } from 'axios';
import { useAuthentication } from './authentication';

const baseURL = 'https://cs-demo-api.herokuapp.com';

const client = axios.create({
  baseURL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const { getAccessToken } = useAuthentication();
  const token = await getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use((response) => response);

export const useBackendAPI = () => {
  return {
    client,
  };
};
```

</CH.Code>

Create a placeholder where we will add our interceptor code to `client.interceptors.response`. Note that we do not do anything for a successful response.

---

<CH.Code>

```typescript src/composables/backend-api.ts focus=25:27
import axios, { InternalAxiosRequestConfig } from 'axios';
import { useAuthentication } from './authentication';

const baseURL = 'https://cs-demo-api.herokuapp.com';

const client = axios.create({
  baseURL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const { getAccessToken } = useAuthentication();
  const token = await getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

export const useBackendAPI = () => {
  return {
    client,
  };
};
```

</CH.Code>

We need to handle the error. For now just reject.

---

<CH.Code>

```typescript src/composables/backend-api.ts focus=3,4,28:31
import axios, { InternalAxiosRequestConfig } from 'axios';
import { useAuthentication } from './authentication';
import { useSession } from './session';
import router from '@/router';

const baseURL = 'https://cs-demo-api.herokuapp.com';

const client = axios.create({
  baseURL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const { getAccessToken } = useAuthentication();
  const token = await getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response.status === 401) {
      const { clearSession } = useSession();
      clearSession().then(() => router.replace('/tabs/tab1'));
    }
    return Promise.reject(error);
  }
);
```

</CH.Code>

If a `401` error occurs, clear the session from storage and redirect to our login page.

</CH.Scrollycoding>

## Next Steps

Currently, if we have an `AuthResult` with an access token we assume the user is properly authenticated. If you would like to expand this logic to first make sure the access token has not expired, and try to refresh it if it has, then please have a look at the tutorial on [refreshing the session](refresh-workflow).

Happy coding!! 🤓
