---
title: Leveraging Portal-provided data
sidebar_label: Initial Context
sidebar_position: 2
---

import Admonition from '@theme/Admonition';

The Portals library provides a way to set <a href="https://ionic.io/docs/portals/choosing-a-communication#initial-context" target="_blank">initial context</a> data that can be accessed by the presenting web app.  

In this step, you will use initial context to obtain session information to filter the list of Expenses.

<Admonition type="note">
Ensure you are [serving the Expenses web app using the Portals CLI](./getting-started) before proceeding.
</Admonition>

## Exploring the problem

The Expenses web app lets the current user submit, edit, and track expenses that occur on the job and stores them in a backend service.

However, if you look at the User IDs of each expense in the list - you will see that _all_ expenses are being returned, regardless of user!

The expenses backend will return all expenses if no user information has been attached to the request (for illustration purposes, you would not do this in a production setting). To filter the list of expenses, the current user's ID is required. How can that information be retrieved?

## Refreshing the user session

The current user's ID is returned as part of a session object obtained when calling an endpoint that refreshes the user's session.

<Admonition type="info" title="Best Practice">
Refresh the user's session upon launching a Portal to ensure the session stays active.
</Admonition>

The web app's router will attempt to refresh the session during navigation, if needed. In order to refresh the session, an `accessToken` and `refreshToken` are required. However, the Expenses web app does not have any way to get these values and returns hardcoded empty strings:

```typescript web/shared/portals/index.ts
export const resolveInitialContext = () => ({ accessToken: "", refreshToken: "" });
```

Portals within the Jobsync mobile application are configured to set those values as initial context. In the next section, you will use the Portals library to get the initial context within the Expenses web app. 

## Using initial context

The Portals library is available as an npm package. For the purpose of this training, it will be added as a dependency of the web package containing the project's shared Portals code:

```bash terminal
cd ./web/shared/portals
pnpm add @ionic/portals
```

<a href="https://ionic.io/docs/portals/for-web/portals-plugin#getinitialcontext" target="_blank">`getInitialContext<T>()`</a> returns data set by a Portal in the resulting object's `value` field. The method returns additional metadata (as part of the <a href="https://ionic.io/docs/portals/for-web/portals-plugin#initialcontext" target="_blank">`InitialContext` type</a>) such as the `name` of the Portal and `assets` files.


Use `getInitialContext` to get the `accessToken` and `refreshToken` set by the Portal configuration:

<CH.Scrollycoding>

<CH.Code>

```typescript web/shared/portals/initial-context.ts
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

Re-implement `resolveInitialContext()` using the Portals library in a new file within `web/shared/portals` named `initial-context.ts`.

<Admonition type="info" title="Best Practice">
Pass a type as `T` into the method signature to type the `value` property returned.
</Admonition>

---

<CH.Code>

```typescript web/shared/portals/index.ts focus=1:2
import { resolveInitialContext } from "./initial-context.ts";
export { resolveInitialContext };

/**
 * TODO: See "Publishing Messages with PubSub"
 */
export const publishNavigateBackMessage = async () => {};

/**
 * TODO: See "Implementing a Capacitor Plugin"
 */
export const Analytics = {
  logAction: async (opts: any) => {},
  logScreen: async (opts: any) => {},
};
```

</CH.Code>

Replace the existing implementation in `web/shared/portals/index.ts` and point to the new implementation.  

</CH.Scrollycoding>

Save the code and notice the Expenses list view has updated. The 'DEBUG' user interface cues have been removed, and now only a subset of the expense list is returned. If you were to inspect the network traffic (optional), you would observe that only the relevant expenses are now returned, resolving the issue.

Although the filtering problem has been fixed, a few side-effects have popped up:

1. Your IDE might be throwing some TypeScript errors.
2. An error is thrown if `http://localhost:5173` is accessed on a web browser.

The `value` property returned as part of `getInitialContext()` is optional, but the case where it returned `undefined` has not been accounted for. Initial context is not available through web browsers, which means `getInitialContext()` will always return `undefined` for the `value` property.

This error can be resolved by providing default values when initial context is not available.

## Falling back to default values

You may want to both host a web app as a standalone application on a server and include the web app in a mobile application using Portals. In that scenario, the web app must be able to adapt to the platform it is running on.

In the case of the Expenses web app, initial context can be provided a default value. Modify `web/shared/portals-initial-context.ts` to do so:

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

The code above resolves the side-effects observed in the section above by providing default values suitable for development and for the purposes of this training. 

<Admonition type="info">
In a production scenario, you may want to run completely different routines depending on the platform a web app runs on. The `@capacitor/core` npm package (which you will see later) contains <a href="https://capacitorjs.com/docs/basics/utilities" target="_blank">utility methods</a> that detect the type of platform the web app currently runs on. The concept of running different code based on the platform a web app runs on is commonly referred to as "platform-detection".
</Admonition>

## What's next

Using initial context, you have successfully established communication through a Portal! Initial context is uni-directional communication, from native mobile code to web code. In the next step of this module, you will learn about Portals' pub/sub mechanism to send messages from web code to native mobile code.