---
title: Refresh the Session
sidebar_label: Refresh the Session
sidebar_position: 2
---

## Overview

When a user logs in using [Auth Connect](https://ionic.io/docs/auth-connect) the application receives an `AuthResult`
that represents the authentication session. The `AuthResult` object provides access to several types of tokens:

- **ID Token**: The ID token contains information pertaining to the identity of the authenticated user.
  The information within this token is typically consumed by the client application.
- **Access Token**: The access token signifies that the user has properly authenticated. This token is typically
  sent to the application's backend APIs as a bearer token. The token is verified by the API to grant access to
  the protected resources exposed by the API. Since this token is used in communications with the backend API,
  a common security practice is to give it a very limited lifetime.
- **Refresh Token**: Since access tokens typically have a short lifetime, longer lived refresh tokens are used
  to extend the length of a user's authentication session by allowing the access tokens to be refreshed.

The key take away is that OIDC authentication servers are typically set up to return a short lived access token along
with an much longer lived refresh token. For example, the access token may expire after one hour with the refresh
token expiring after five days. This allows the application to use the access token for a period of time and then
refresh it after that time has elapsed. As such, the application needs to be able to detect that the access token
has expired and request a refresh of the session.

We will build upon the application we created in the [getting started tutorial](getting-started) in order to
implement a token refresh workflow.

## Let's Code

As mentioned previously, this tutorial builds upon the application created when doing the
[getting started tutorial](getting-started). If you have the code from when you performed that tutorial, then you are
good to go. If you need the code you can make a copy from
[our GitHub repository](https://github.com/ionic-enterprise/tutorials-and-demos-react/tree/main/auth-connect/getting-started).

### Create the Refresh Function

The refresh strategy used in this tutorial is:

1. If a session exists, determine if the access token is expired.
1. If the session token is expired it can be refreshed if a refresh token is available.
1. If a refresh token is available, refresh the session and replace the existing stale session with the refreshed one.
   The user's authentication has been made valid again.
1. If a refresh is required but either cannot be performed or fails, throw away the invalid stale session.
   The user is no longer authenticated.

Let's see how this looks in our `authentication` utility function module.

<CH.Scrollycoding>

<CH.Code>

```typescript src/utils/authentication.ts focus=11:13,15[25:41]
import { Capacitor } from '@capacitor/core';
import {
  Auth0Provider,
  AuthConnect,
  ProviderOptions,
} from '@ionic-enterprise/auth';
import { getSnapshot, setSession } from './session-store';

// Existing code cut out for clarity. Code not shown here should be left as-is in your project.

const refreshIfExpired = async (): Promise<void> => {
  null;
};

export { login, logout, refreshIfExpired, setupAuthConnect };
```

</CH.Code>

Add a function that will refresh the auth result if it is expired.

---

<CH.Code>

```typescript src/utils/authentication.ts focus=12:17,19
import { Capacitor } from '@capacitor/core';
import {
  Auth0Provider,
  AuthConnect,
  ProviderOptions,
} from '@ionic-enterprise/auth';
import { getSnapshot, setSession } from './session-store';

// Existing code cut out for clarity. Code not shown here should be left as-is in your project.

const refreshIfExpired = async (): Promise<void> => {
  const authResult = getSnapshot();
  if (
    authResult &&
    (await AuthConnect.isAccessTokenAvailable(authResult)) &&
    (await AuthConnect.isAccessTokenExpired(authResult))
  ) {
    null;
  }
};

export { login, logout, refreshIfExpired, setupAuthConnect };
```

</CH.Code>

Get the current `authResult`. If it exists, determine if it needs to be refreshed.

---

<CH.Code>

```typescript src/utils/authentication.ts focus=5,19:25
import { Capacitor } from '@capacitor/core';
import {
  Auth0Provider,
  AuthConnect,
  AuthResult,
  ProviderOptions,
} from '@ionic-enterprise/auth';
import { getSnapshot, setSession } from './session-store';

// Existing code cut out for clarity. It is left as-is in your code.

const refreshIfExpired = async (): Promise<void> => {
  const authResult = getSnapshot();
  if (
    authResult &&
    (await AuthConnect.isAccessTokenAvailable(authResult)) &&
    (await AuthConnect.isAccessTokenExpired(authResult))
  ) {
    let newAuthResult: AuthResult | null = null;
    try {
      newAuthResult = await AuthConnect.refreshSession(provider, authResult);
    } catch (err) {
      null;
    }
    setSession(newAuthResult);
  }
};

export { login, logout, refreshIfExpired, setupAuthConnect };
```

</CH.Code>

If the current auth result is expired, create a new auth result by refreshing the existing one.

---

<CH.Code>

```typescript src/utils/authentication.ts focus=20,26
import { Capacitor } from '@capacitor/core';
import {
  Auth0Provider,
  AuthConnect,
  AuthResult,
  ProviderOptions,
} from '@ionic-enterprise/auth';
import { getSnapshot, setSession } from './session-store';

// Existing code cut out for clarity. It is left as-is in your code.

const refreshIfExpired = async (): Promise<void> => {
  const authResult = getSnapshot();
  if (
    authResult &&
    (await AuthConnect.isAccessTokenAvailable(authResult)) &&
    (await AuthConnect.isAccessTokenExpired(authResult))
  ) {
    let newAuthResult: AuthResult | null = null;
    if (await AuthConnect.isRefreshTokenAvailable(authResult)) {
      try {
        newAuthResult = await AuthConnect.refreshSession(provider, authResult);
      } catch (err) {
        null;
      }
    }
    setSession(newAuthResult);
  }
};

export { login, logout, refreshIfExpired, setupAuthConnect };
```

</CH.Code>

Only attempt the refresh if a refresh token is available. Note that the session will be set to `null` if it is expired
and either there is no refresh token available or the `refreshSession()` fails.

</CH.Scrollycoding>

### Call the Refresh

With this logic in place, the next logical question is where to call it. As we will see when we
[protect-the-routes](protecting-routes), it will make sense to perform the refresh as needed prior to appending the
access token to outbound requests.

For the example here, however, we will modify our App component to check for a refresh when the application
is mounted.

<CH.Code rows={20}>

```typescript src/App.tsx focus=38,39,43[29],44:46,48,89
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
import { useEffect } from 'react';
import { refreshIfExpired } from './utils/authentication';

setupIonicReact();

const App: React.FC = () => {
  useEffect(() => {
    refreshIfExpired();
  }, [refreshIfExpired]);

  return (
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
                <IonLabel>Tab 1</IonLabel>
                <IonIcon aria-hidden="true" icon={triangle} />
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
};

export default App;
```

</CH.Code>

## Next Steps

This code represents the basic flow needed for an Auth Connect session refresh. It can easily be expanded to support more advanced scenarios.

For example, let's say that rather than only refreshing expired sessions our application would like to also refresh sessions that are about to expire, let's say within the next five seconds. Rather than using `AuthConnect.isAccessTokenExpired()`, your application could use a combination of [receivedAt](https://ionic.io/docs/auth-connect/interfaces/AuthResult#receivedat) and [expiresIn](https://ionic.io/docs/auth-connect/interfaces/AuthResult#expiresin) to calculate when to access token is due to expire and use the current time to detect if the access token has either expired or is about to expire shortly. The code can then preemptively perform the refresh in those cases.

We suggesting starting with the flow documented here and modifying it as needed to fit your requirements.

Happy coding!! 🤓
