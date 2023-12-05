---
title: Stubbing Initial Context for Development
sidebar_label: Initial Context
sidebar_position: 2
---

Initial context is a communication mechanism shipped with Portals that allows data to be passed from native code to a web application. Data shared using <a href="https://ionic.io/docs/portals/choosing-a-communication#initial-context" target="_blank">initial context</a> is immediately available to the web application, synchronously, before the web application renders. 

Initial context is useful when you want to pass authentication information, navigate to a specific path, or any case where having data _before_ the web application loads would prevent re-renders or UI jank.  

## Overview

This tutorial will teach you:

- How to use initial context to obtain session information passed from native code to the Portal's web application.
- How to stub initial context within the web application's development workflow. 

> **Note:** As you work through the tutorial, ensure that you are [running the _Expenses_ web application](./overview#running-the-expenses-web-application) to observe any code changes in real-time.

## Obtaining Session Information

The _Expenses_ web application needs to provide user session information in order to return a filtered list of expenses tied to the user. Without that information, the backend will return all expenses stored in the backend (for illustration purposes, you would not do this in a real project).

In order to get session information, all micro frontends in the Jobsync app need to:

1. Obtain the `accessToken` and `refreshToken` from initial context.
2. Pass those tokens to an endpoint that refreshes the session.

> **Note:** It is best practice to refresh the user's session upon launching a Portal to ensure the session stays active.

Open the _Expenses_ web application in the browser, if you have not done so already. 

Notice that expenses for multiple user IDs are displayed. Inspect the network traffic for the `/auth/refresh` endpoint. The request payload sends empty string values for `accessToken` and `refreshToken`, and subsequently, the response payload has an empty string value for `sub` (the user ID). This explains why the `/expenses` endpoint returns all expenses instead of a filtered list.

Let's review the code that refreshes the user session:

<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

  <div>

  Upon navigating to any route in the _Expenses_ web application, a utility method checks to see if the session needs to be refreshed.

  If so, a utility method obtains `accessToken` and `refreshToken` from `resolveInitialContext()` a method exported as part of `@jobsync/portals`.
  
  The implementation of `resolveInitialContext()` returns hardcoded empty string values at the moment. 

  </div>

  <div>
    <CH.Code>

```typescript web/apps/expenses/src/router.ts
const refreshSessionIfNeeded = async (): Promise<void> => {
  if (!session) {
    const { accessToken, refreshToken } = resolveInitialContext();
    return refreshSession(accessToken, refreshToken);
  }
  return Promise.resolve();
};
```
---
```typescript web/shared/portals/index.ts
export const resolveInitialContext = () => 
  ({ accessToken: "", refreshToken: "" });
```
    </CH.Code>

  </div>
</div>

Passing an empty access token and refresh token results in the backend returning an incomplete session when attempting to refresh the session.

Mentioned above, `accessToken` and `refreshToken` will be passed to the _Expenses_ web application as initial context. In the next section, `resolveInitialContext()` will be modified to use the Portals module to extract the initial context.

## Extracting Initial Context

The Portals module (`@ionic/portals`) contains the API that allows us to extract initial context.

<CH.Scrollycoding>

<CH.Code>

```typescript web/shared/portals/initial-context.ts
import { getInitialContext } from '@ionic/portals';

interface InitialContext {
  accessToken: string;
  refreshToken: string;
}

export const resolveInitialContext = (): InitialContext => ({
  accessToken: "",
  refreshToken: "",
});
```

</CH.Code>

Start by creating a new file in the `web/shared/portals` library named `initial-context.ts`. 


---

<CH.Code>

```typescript web/shared/portals/index.ts focus=1:2
import { resolveInitialContext } from "./initial-context";
export { resolveInitialContext };

/**
 * TODO: See "Publishing Messages with PubSub"
 */
export const publishNavigateBackMessage = async () => {};

/**
 * TODO: See "Implementing a Capacitor Plugin"
 */
export const Analytics = {
  logAction: (opts: any) => {},
  logScreen: (opts: any) => {},
};
```

</CH.Code>

Replace the existing `resolveInitialContext()` method with an import and export of the new method created in the step above.

---

<CH.Code>

```typescript shared/portals/initial-context.ts focus=8:11
import { getInitialContext } from "@ionic/portals";

interface InitialContext {
  accessToken: string;
  refreshToken: string;
}

export const resolveInitialContext = (): InitialContext => {
  const initialContext = getInitialContext<InitialContext>();
  return initialContext?.value;
};
```

</CH.Code>

Adjust `resolveInitialContext()` to use the Portals module. Data passed through as initial context is available in the `value` property.


</CH.Scrollycoding>


The code above defines an interface representing the shape of the initial context we expect to receive. This is a best practice, and allows us to type the `value` property by supplying the type as `T` to the method signature: `getInitialContext<T>()`.

While we have implemented `getInitialContext()` correctly, it is throwing an error when viewed within the browser:

```
Cannot destructure property 'accessToken' of 'resolveInitialContext(...)' as it is undefined.
```

This error occurs because initial context is only available when running the entire Portals project. We will stub the initial context to continue development uninterrupted. 

## Stubbing Initial Context for Development

Most developers build web applications for Portals projects in isolation, without building and running native projects. This development workflow is encouraged; however, initial context is not available in this context. 

When developing in isolation, initial context should be stubbed. Stubbing the initial context is a pretty straightforward procedure. Modify `initial-context.ts` to add the highlighted code below:

```typescript web/shared/portals/initial-context.ts focus=8:11,15[31:57]
import { getInitialContext } from "@ionic/portals";

interface InitialContext {
  accessToken: string;
  refreshToken: string;
}

const initialContextDefaults: InitialContext = {
  accessToken: "0b12e808-4621-4e66-8dc7-2202390e97df",
  refreshToken: "6eccb693-6216-4991-bf17-4b4e7164d38f",
};

export const resolveInitialContext = (): InitialContext => {
  const initialContext = getInitialContext<InitialContext>();
  return initialContext?.value || initialContextDefaults;
};

```

After saving the file, view the _Expenses_ web application in the browser. It is now filtering the list of expenses by the user ID in the session!

## Conclusion

In this tutorial, you learned how to use initial context to retrieve data shared from a native application to a web application presented within a Portal. You also learned that initial context is only available when a Portals project is run, and stubbed initial context for development purposes.

On the next page, we will use the pub/sub communication mechanism available with Portals. 