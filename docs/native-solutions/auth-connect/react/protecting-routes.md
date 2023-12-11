---
title: Protect the Routes
sidebar_label: Protect the Routes
sidebar_position: 3
---

## Overview

Now that we are authenticating with a provider we need to look at protecting our routes. This protection takes two
major forms:

1. Make some of our routes private so a user cannot navigate to them unless they are logged in.
1. Protecting our backend API such that users cannot access data without a valid access token. Our role is to pass
   the access token to our API.

We will also see how to handle the possibility that our APIs may now issue 401 errors in cases where our access token
has expired or is otherwise invalid.

We will build upon the application we created in the [getting started tutorial](getting-started) in order to implement
private routes for our application. We will also add HTTP interceptors to attach access tokens to outgoing
requests and to handle potential 401 errors in responses.

## Let's Code

As mentioned previously, this tutorial builds upon the application created when doing the [getting started tutorial](getting-started). If you have the code from when you performed that tutorial, then you are good to go. If you need the code you can make a copy from [our GitHub repository](https://github.com/ionic-enterprise/tutorials-and-demos-react/tree/main/auth-connect/getting-started).

### Refactor Pages and Routing

Up to now we have taken a rather simplistic but unrealistic approach of performing the login from the `Tab1Page`. Most applications would have a dedicated `LoginPage` outside of the rest of the application. Let's refactor our application to have this.

#### Extract the Tabs

We will extract the tabs into their own component with each of pages within the tabs being served as a child of a newly created `/tabs` route.

First create the `src/routes/Tabs.tsx` component.

<CH.Code>

```typescript src/routes/Tabs.tsx
import {
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
} from '@ionic/react';
import { ellipse, square, triangle } from 'ionicons/icons';
import { Redirect, Route, useRouteMatch } from 'react-router-dom';
import Tab1 from '../pages/Tab1';
import Tab2 from '../pages/Tab2';
import Tab3 from '../pages/Tab3';

const Tabs: React.FC = () => {
  const { url } = useRouteMatch();

  return (
    <IonTabs>
      <IonRouterOutlet>
        <Route exact path={`${url}/tab1`}>
          <Tab1 />
        </Route>
        <Route exact path={`${url}/tab2`}>
          <Tab2 />
        </Route>
        <Route exact path={`${url}/tab3`}>
          <Tab3 />
        </Route>
        <Route exact path={url}>
          <Redirect to={`${url}/tab1`} />
        </Route>
      </IonRouterOutlet>
      <IonTabBar slot="bottom">
        <IonTabButton tab="tab1" href={`${url}/tab1`}>
          <IonIcon aria-hidden="true" icon={triangle} />
          <IonLabel>Tab 1</IonLabel>
        </IonTabButton>
        <IonTabButton tab="tab2" href={`${url}/tab2`}>
          <IonIcon aria-hidden="true" icon={ellipse} />
          <IonLabel>Tab 2</IonLabel>
        </IonTabButton>
        <IonTabButton tab="tab3" href={`${url}/tab3`}>
          <IonIcon aria-hidden="true" icon={square} />
          <IonLabel>Tab 3</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
};
export default Tabs;
```

</CH.Code>

Next, refactor `src/App.tsx` to use the new `Tabs` component inside a `/tabs` route, with other routes outside of it.

<CH.Code>

```typescript src/App.tsx
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Redirect, Route } from 'react-router-dom';
import AuthActionCompletePage from './pages/AuthActionCompletePage';
import { AuthenticationProvider } from './providers/AuthenticationProvider';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/display.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';

/* Theme variables */
import Tabs from './routes/Tabs';
import './theme/variables.css';

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <AuthenticationProvider>
      <IonReactRouter>
        <IonRouterOutlet>
          <Route path="/tabs">
            <Tabs />
          </Route>
          <Route path="/auth-action-complete">
            <AuthActionCompletePage />
          </Route>
          <Route exact path="/">
            <Redirect to="/tabs" />
          </Route>
        </IonRouterOutlet>
      </IonReactRouter>
    </AuthenticationProvider>
  </IonApp>
);

export default App;
```

</CH.Code>

Notice that we now have two `IonRouterOutlet` components in our application. The first is defined in `src/App.tsx` and
defines all of our root-level routes (currently `/tabs` and `/auth-action-complete`). The second is defined in
`src/routes/Tabs.tsx` and defines all of the routes under `/tabs`.

#### Create a Login Page

We want to have a dedicated login page that is outside of the `Tabs` so create a `src/pages/LoginPage.tsx` file
with the following contents:

<CH.Code>

```typescript src/pages/LoginPage.tsx
import {
  IonButton,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { login } from '../utils/authentication';
import { useHistory } from 'react-router';

const LoginPage: React.FC = () => {
  const history = useHistory();
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Login</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Login</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonButton
          onClick={async () => {
            await login();
            history.push('tabs/tab1');
          }}
        >
          Login
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default LoginPage;
```

</CH.Code>

Notice that this is very similar to the current contents of `src/pages/Tab1.tsx` with only a login button. The
login button click handler has the additional functionality of navigating to `tabs/tab1` upon successful login.

#### Limit Tab1 to Logout

Now that we have a dedicated `LoginPage`, modify `src/pages/Tab1.tsx` such that it only performs a logout operation.

<CH.Code>

```typescript src/pages/Tab1.tsx focus=9,26
import {
  IonButton,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { logout } from '../utils/authentication';
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
        <IonButton onClick={logout}>Logout</IonButton>
      </IonContent>
    </IonPage>
  );
};

export default Tab1;
```

</CH.Code>

At this point:

- When we load the app, we are directed to `http://localhost:8100/tabs/tab1` and we can navigate from tab to tab.
  This is true regardless of whether or not we are logged in or not.
- If we load `http://localhost:8100/login` we can perform a login operation and the application will navigate
  to `tabs/tab1` upon success.
- If we are on `tabs/tab1`, we can press the logout button, but we remain on `tabs/tab1` after logout.

We will address these behaviors in the next section by creating a `PrivateRoute` component.

### Private Route Component

The `PrivateRoute` needs to subscribe to the session store. It will redirect to `/login` when we are not logged in.
Otherwise it will display its child components. The code for this is:

<CH.Code>

```typescript
import { ReactNode, useSyncExternalStore } from 'react';
import { getSnapshot, subscribe } from '../utils/session-store';
import { Redirect } from 'react-router-dom';

type Props = { children?: ReactNode };

export const PrivateRoute = ({ children }: Props) => {
  const session = useSyncExternalStore(subscribe, getSnapshot);
  if (!session) return <Redirect to="/login" />;
  return <>{children}</>;
};
```

</CH.Code>

We can now wrap the `Tabs` component in `src/App.tsx` with the `PrivateRoute` component.

<CH.Code rows={15}>

```tsx src/App.tsx focus=27,37,39
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Redirect, Route } from 'react-router-dom';
import AuthActionCompletePage from './pages/AuthActionCompletePage';
import { AuthenticationProvider } from './providers/AuthenticationProvider';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/display.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';

/* Theme variables */
import LoginPage from './pages/LoginPage';
import Tabs from './routes/Tabs';
import './theme/variables.css';
import { PrivateRoute } from './routes/PrivateRoute';

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <AuthenticationProvider>
      <IonReactRouter>
        <IonRouterOutlet>
          <Route path="/tabs">
            <PrivateRoute>
              <Tabs />
            </PrivateRoute>
          </Route>
          <Route path="/auth-action-complete">
            <AuthActionCompletePage />
          </Route>
          <Route path="/login">
            <LoginPage />
          </Route>
          <Route exact path="/">
            <Redirect to="/tabs" />
          </Route>
        </IonRouterOutlet>
      </IonReactRouter>
    </AuthenticationProvider>
  </IonApp>
);

export default App;
```

</CH.Code>

With this in place:

- When we load the app, we are redirected to either `http://localhost:8100/login` or `http://localhost:8100/tabs/tab1`
  depending on our current authentication status.
- When we press the `Logout` button on `tabs/tab1` we are automatically redirected to the `LoginPage` after the
  user is logged out.

At this point we move on to handling our our HTTP requests and responses.

### Provide the Access Token

When a user logs in using [Auth Connect](https://ionic.io/docs/auth-connect) the application receives an `AuthResult` that represents the authentication session. The `AuthResult` object provides access to several types of tokens:

- **ID Token**: The ID token contains information pertaining to the identity of the authenticated user. The information within this token is typically consumed by the client application.
- **Access Token**: The access token signifies that the user has properly authenticated. This token is typically sent to the application's backend APIs as a bearer token. The token is verified by the API to grant access to the protected resources exposed by the API. Since this token is used in communications with the backend API, a common security practice is to give it a very limited lifetime.
- **Refresh Token**: Since access tokens typically have a short lifetime, longer lived refresh tokens are used to extend the length of a user's authentication session by allowing the access tokens to be refreshed.

The most common way for the backend API to protect its routes is to require that requests include a valid access token. As such, we are going to have to send the access token with each request.

It is common to use a library like [Axios](https://axios-http.com/docs/intro) to perform HTTP operations. Axios also makes it easy to modify outgoing requests via [Interceptors](https://axios-http.com/docs/interceptors). We will use these to add the access token to outbound HTTP requests. Note that this is just an example of the type of thing you need do. You do not have to use Axios, but can use whatever technology you would like to use.

<CH.Code>

```bash Terminal
npm install axios
```

</CH.Code>

We will create a utility module that manages an Axios `client` for our backend API. Once that exists, we will add an interceptor to the `client` that adds the access token to outbound requests.

<CH.Scrollycoding>

<CH.Code>

```typescript src/utils/backend-api.ts
import axios from 'axios';

const baseURL = 'https://cs-demo-api.herokuapp.com';

const client = axios.create({
  baseURL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

export { client };
```

</CH.Code>

We start with a very basic Axios client that connects to our backend API.

---

<CH.Code>

```typescript src/utils/backend-api.ts focus=1[13:44],13:15
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

export { client };
```

</CH.Code>

Create a stub for the interceptor. Since we want to modify the request, we need to attach the function to `client.interceptors.request`.

---

<CH.Code>

```typescript src/utils/backend-api.ts focus=2,15
import axios, { InternalAxiosRequestConfig } from 'axios';
import { getSnapshot } from './session-store';

const baseURL = 'https://cs-demo-api.herokuapp.com';

const client = axios.create({
  baseURL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const session = getSnapshot();
  return config;
});

export { client };
```

</CH.Code>

Get the session.

---

<CH.Code>

```typescript src/utils/backend-api.ts focus=16:18
import axios, { InternalAxiosRequestConfig } from 'axios';
import { getSnapshot } from './session-store';

const baseURL = 'https://cs-demo-api.herokuapp.com';

const client = axios.create({
  baseURL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const session = getSnapshot();
  if (session?.accessToken && config.headers) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }
  return config;
});

export { client };
```

</CH.Code>

If an access token exists, attach it to the header.

</CH.Scrollycoding>

If we have an access token, it will now be attached to any request that is sent to `https://cs-demo-api.herokuapp.com` (our backend API). Note that you _could_ have multiple APIs that all recognize the provided access token. In that case you would create various utility modules with similar code. Providing proper abstraction layers for such a scenario is left as an exercise for the reader.

If you have already implemented the code that [refreshes the session](refresh-workflow), this interceptor is also a
good place to perform a refresh. You would place that code right before getting the session to ensure that the
session you are obtaining is fresh.

### Handle 401 Errors

Now that the access token is sent to the backend, we need to also handle the case where the backend rejects the access token resulting in a [401 - Unauthorized](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/401) response status. Since we need to examine the response, this interceptor is attached to `client.interceptors.response`.

The interceptor needs to be built out to clear the session data and navigate to the login page when a 401 error occurs.

<CH.Scrollycoding>

<CH.Code>

```typescript src/utils/backend-api.ts
import axios, { InternalAxiosRequestConfig } from 'axios';
import { getSnapshot } from './session-store';

const baseURL = 'https://cs-demo-api.herokuapp.com';

const client = axios.create({
  baseURL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const session = getSnapshot();
  if (session?.accessToken && config.headers) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }
  return config;
});

export { client };
```

</CH.Code>

Start with the existing code in `src/utils/backend-api.ts`.

---

<CH.Code>

```typescript src/utils/backend-api.ts focus=22
import axios, { InternalAxiosRequestConfig } from 'axios';
import { getSnapshot } from './session-store';

const baseURL = 'https://cs-demo-api.herokuapp.com';

const client = axios.create({
  baseURL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const session = getSnapshot();
  if (session?.accessToken && config.headers) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }
  return config;
});

client.interceptors.response.use((response) => response);

export { client };
```

</CH.Code>

Create a placeholder where we will add our interceptor code to `client.interceptors.response`. Note that we do not do anything for a successful response.

---

<CH.Code>

```typescript src/utils/backend-api.ts focus=23:26
import axios, { InternalAxiosRequestConfig } from 'axios';
import { getSnapshot } from './session-store';

const baseURL = 'https://cs-demo-api.herokuapp.com';

const client = axios.create({
  baseURL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const session = getSnapshot();
  if (session?.accessToken && config.headers) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

export { client };
```

</CH.Code>

We need to handle the error. For now just reject.

---

<CH.Code>

```typescript src/utils/backend-api.ts focus=3[21:32],26:28
export { client };
import axios, { InternalAxiosRequestConfig } from 'axios';
import { getSnapshot, setSession } from './session-store';

const baseURL = 'https://cs-demo-api.herokuapp.com';

const client = axios.create({
  baseURL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const session = getSnapshot();
  if (session?.accessToken && config.headers) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response.status === 401) {
      setSession(null);
    }
    return Promise.reject(error);
  }
);

export { client };
```

</CH.Code>

If a `401` error occurs, set the session to `null`. This will clear the session and trigger our `PrivateRoute` to
redirect to `/login` if we are on a page that requires authentication.

</CH.Scrollycoding>

## Next Steps

Currently, if we have an `AuthResult` with an access token we assume the user is properly authenticated. If you would like to expand this logic to first make sure the access token has not expired, and try to refresh it if it has, then please have a look at the tutorial on [refreshing the session](refresh-workflow).

Happy coding!! 🤓
