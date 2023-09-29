---
title: Refresh the Session
sidebar_label: Refresh the Session
sidebar_position: 2
---

## Overview

When a user logs in using [Auth Connect](https://ionic.io/docs/auth-connect) the application receives an `AuthResult` that represents the authentication session. The `AuthResult` object provides access to several types of tokens:

- **ID Token**: The ID token contains information pertaining to the identity of the authenticated user. The information within this token is typically consumed by the client application.
- **Access Token**: The access token signifies that the user has properly authenticated. This token is typically sent to the application's backend APIs as a bearer token. The token is verified by the API to grant access to the protected resources exposed by the API. Since this token is used in communications with the backend API, a common security practice is to give it a very limited lifetime.
- **Refresh Token**: Since access tokens typically have a short lifetime, longer lived refresh tokens are used to extend the length of a user's authentication session by allowing the access tokens to be refreshed.

The key take away is that OIDC authentication servers are typically set up to return a short lived access token along with an much longer lived refresh token. For example, the access token may expire after one hour with the refresh token expiring after five days. This allows the application to use the access token for a period of time and then refresh it after that time has elapsed. As such, the application needs to be able to detect that the access token has expired and request a refresh of the session.

We will build upon the application we created in the [getting started tutorial](getting-started) in order to implement a token refresh workflow.

## Let's Code

As mentioned previously, this tutorial builds upon the application created when doing the [getting started tutorial](getting-started). If you have the code from when you performed that tutorial, then you are good to go. If you need the code you can make a copy from [our GitHub repository](https://github.com/ionic-enterprise/tutorials-and-demos-vue/tree/main/auth-connect/getting-started).

The refresh strategy used in this tutorial is:

1. If a session exists, determine if the access token is expired.
1. If the session token is expired it can be refreshed if a refresh token is available.
1. If a refresh token is available, refresh the session and replace the existing stale session with the refreshed one. The user's authentication has been made valid again.
1. If a refresh cannot be performed or the refresh fails, throw away the invalid stale session. The user is no longer authenticated.

Let's see how this looks in our `useAuthentication` composable.

<CH.Scrollycoding>

<CH.Code>

```typescript authentication.ts
const getAuthResult = async (): Promise<AuthResult | null> => {
  return getSession();
};
```

</CH.Code>

We currently have a `getAuthResult()` function that is a simple pass-through to a function from the session composable.

---

<CH.Code>

```typescript authentication.ts focus=5:9
const getAuthResult = async (): Promise<AuthResult | null> => {
  return getSession();
};

const refreshAuthResult = async (
  authResult: AuthResult
): Promise<AuthResult | null> => {
  return await AuthConnect.refreshSession(provider, authResult);
};
```

</CH.Code>

Add a `refreshAuthResult()` function. For now it can be a simple pass-through to `AuthConnect.refreshSession()`.

---

<CH.Code>

```typescript authentication.ts focus=2:10
const getAuthResult = async (): Promise<AuthResult | null> => {
  let authResult = await getSession();
  if (
    authResult &&
    (await AuthConnect.isAccessTokenAvailable(authResult)) &&
    (await AuthConnect.isAccessTokenExpired(authResult))
  ) {
    authResult = await refreshAuthResult(authResult);
  }
  return authResult;
};

const refreshAuthResult = async (
  authResult: AuthResult
): Promise<AuthResult | null> => {
  return await AuthConnect.refreshSession(provider, authResult);
};
```

</CH.Code>

If an `AuthResult` exists and contains an expired access token, then we need to attempt a refresh.

---

<CH.Code>

```typescript authentication.ts focus=16:20
const getAuthResult = async (): Promise<AuthResult | null> => {
  let authResult = await getSession();
  if (
    authResult &&
    (await AuthConnect.isAccessTokenAvailable(authResult)) &&
    (await AuthConnect.isAccessTokenExpired(authResult))
  ) {
    authResult = await refreshAuthResult(authResult);
  }
  return authResult;
};

const refreshAuthResult = async (
  authResult: AuthResult
): Promise<AuthResult | null> => {
  let newAuthResult: AuthResult | null = null;
  if (await AuthConnect.isRefreshTokenAvailable(authResult)) {
    newAuthResult = await AuthConnect.refreshSession(provider, authResult);
  }
  return newAuthResult;
};
```

</CH.Code>

We should only refresh the session if a refresh token exists. Otherwise the refresh should return `null` signifying that we no longer have a valid session.

---

<CH.Code>

```typescript authentication.ts focus=18:22
const getAuthResult = async (): Promise<AuthResult | null> => {
  let authResult = await getSession();
  if (
    authResult &&
    (await AuthConnect.isAccessTokenAvailable(authResult)) &&
    (await AuthConnect.isAccessTokenExpired(authResult))
  ) {
    authResult = await refreshAuthResult(authResult);
  }
  return authResult;
};

const refreshAuthResult = async (
  authResult: AuthResult
): Promise<AuthResult | null> => {
  let newAuthResult: AuthResult | null = null;
  if (await AuthConnect.isRefreshTokenAvailable(authResult)) {
    try {
      newAuthResult = await AuthConnect.refreshSession(provider, authResult);
    } catch (err) {
      null;
    }
  }
  return newAuthResult;
};
```

</CH.Code>

In rare instances, the refresh could fail. For example, if the refresh token has expired or is otherwise invalid. In such cases we should also return `null` signifying that we no longer have a valid session.

</CH.Scrollycoding>

## Next Steps

This code represents the basic flow needed for an Auth Connect session refresh. It can easily be expanded to support more advanced scenarios.

For example, let's say that rather than only refreshing expired sessions our application would like to also refresh sessions that are about to expire, let's say within the next five seconds. Rather than using `AuthConnect.isAccessTokenExpired()`, your application could use a combination of [receivedAt](https://ionic.io/docs/auth-connect/interfaces/AuthResult#receivedat) and [expiresIn](https://ionic.io/docs/auth-connect/interfaces/AuthResult#expiresin) to calculate when to access token is due to expire and use the current time to detect if the access token has either expired or is about to expire shortly. The code can then preemptively perform the refresh in those cases.

We suggesting starting with the flow documented here and modifying it as needed to fit your requirements.

Happy coding!! 🤓
