---
title: Publishing Messages with Pub/Sub
sidebar_label: Publishing Messages
sidebar_position: 3
---

Portals offer a seamless means of communication between web and native code via a <a href="https://ionic.io/docs/portals/for-web/portals-plugin" target="_blank">publish/subscribe interface</a>. This mechanism, commonly known as pub/sub, is primarily used for broadcasting messages from the web to native subscribers. However, it supports the reverse flow, enabling web code to subscribe and handle messages from native code.

Pub/sub communication works well for simple UI actions, like initiating native navigation or triggering native dialogs.


## Overview

This tutorial will teach you how to use the Portals module (`@ionic/portals`) to publish messages to native code from the Portal's web application. 

> **Note:** As you work through the tutorial, ensure that you are [running the _Expenses_ web application](./overview#running-the-expenses-web-application) to observe any code changes in real-time.

## Handling Native Navigation 

When a user launches Jobsync, they land on a native dashboard view that contains all available micro frontends they can navigate to, including _Expenses_.

In order to navigate back to this native view, all micro frontends need to publish a message to the `navigate:back` topic. Once published, the native application will handle the message and use native navigation code to bring the user back to the dashboard page.

The back button of the _Expenses_ web application's landing page (`ExpensesList.tsx`) fires a method called `publishNavigateBackMessage` when clicked. It currently does nothing -- in the next section we will modify it to publish a message using the Portals module.

> **Note:** All micro frontends in Jobsync use `publishNavigateBackMessage` on their landing pages. Implementing the method will allow them to publish messages as well.


## Publishing a Message

<CH.Scrollycoding>

<CH.Code>

```typescript web/shared/portals/pub-sub.ts
import { publish } from "@ionic/portals";

export const publishNavigateBackMessage = async () => {

};
```

</CH.Code>

Start by creating a new file in the `web/shared/portals` library named `pub-sub.ts`.

---

<CH.Code>

```typescript web/shared/portals/index.ts focus=10:11
/**
 *  TODO: See "Stubbing Initial Context for Development"
 */
import { resolveInitialContext } from "./initial-context";
export { resolveInitialContext };

/**
 * TODO: See "Publishing Messages with PubSub"
 */
import { publishNavigateBackMessage } from "./pub-sub";
export { publishNavigateBackMessage };

/**
 * TODO: See "Implementing a Capacitor Plugin"
 */
export const Analytics = {
  logAction: async (opts: any) => {},
  logScreenView: async (opts: any) => {},
};
```

</CH.Code>

Replace the existing `publishNavigateBackMessage()` method with an import and export of the new method created in the step above.

---

<CH.Code>

```typescript web/shared/portals/pub-sub.ts focus=3
import { publish } from "@ionic/portals";

type Messages = { topic: "navigate:back" };

export const publishNavigateBackMessage = async () => {

};
```

</CH.Code>

The `publish` method supports type-safety. Typing messages is a best practice, as it prevents publishing messages that aren't subscribed to on the native side.

---

<CH.Code>

```typescript web/shared/portals/pub-sub.ts focus=6
import { publish } from "@ionic/portals";

type Messages = { topic: "navigate:back" };

export const publishNavigateBackMessage = async () => {
  await publish<Messages>({ topic: "navigate:back" });
};
```

</CH.Code>

Finally, call `publish` with the proper message.

</CH.Scrollycoding>

If you press the back button on the _Expenses_ web application, the method fires, but there are no subscribers available to handle the messages published. While pub/sub is a simple communication mechanism to use, the tradeoff is that it requires 
integration testing from the native side to ensure it functions properly.

## Conclusion

In this tutorial, you learned how to publish a message from a web application presented within a Portal to a native application. 

On the next page, we will implement the web portion of a Capacitor plugin, the final communication mechanism available with Portals.