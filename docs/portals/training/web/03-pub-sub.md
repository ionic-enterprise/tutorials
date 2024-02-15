---
title: Publishing messages to native
sidebar_label: Publishing Messages
sidebar_position: 3
---

import Admonition from '@theme/Admonition';

Web code can publish messages to native mobile code using the <a href="https://ionic.io/docs/portals/for-web/portals-plugin" target="_blank">publish/subscribe interface</a> (pub/sub) available with Portals.

In this step, you will publish messages from the web to trigger native mobile navigation. 

<Admonition type="note">
Ensure you are [serving the Expenses web app using the Portals CLI](./getting-started) before proceeding.
</Admonition>

## Exploring the problem

The Expenses web app can be viewed within a device or simulator, but pressing the back arrow doesn't navigate backwards. Currently, the only way to return to the dashboard view is to re-run the Portals CLI's `serve` command -- which is not an ideal user experience.

Portals within the Jobsync mobile application are configured to handle messages sent to the `navigate:back` topic and pop the view containing the Portal, navigating the application backward.

In the section below, you will use the Portals library to push messages from the web to native mobile code.

## Publishing messages

Given a topic and optional data payload, the <a href="https://ionic.io/docs/portals/for-web/portals-plugin#publish" target="blank">`publish()`</a> method within the Portals library publishes a message to native mobile code. In the Expenses web app, a method `publishNavigateBackMessage` belonging to the project's shared Portals code fires when the back button is pressed.

Use `publish` to fire a message to the `navigate:back` topic:

<CH.Scrollycoding>

<CH.Code>

```typescript web/shared/portals/pub-sub.ts
import { publish } from "@ionic/portals";

export const publishNavigateBackMessage = async () => {
  await publish({ topic: "navigate:back" });
};
```

</CH.Code>

Re-implement `publishNavigateBackMessage` using the Portals library in a new file within `web/shared/portals/` named `pub-sub.ts`.

---

<CH.Code>

```typescript web/shared/portals/pub-sub.ts focus=3,6
import { publish } from "@ionic/portals";

type Messages = { topic: "navigate:back" };

export const publishNavigateBackMessage = async () => {
  await publish<Messages>({ topic: "navigate:back" });
};

```

</CH.Code>

Type-safety can be added to the method signature of `publish`, preventing potential bugs which can be hard to troubleshoot between different tech stacks.

---

<CH.Code>

```typescript web/shared/portals/index.ts focus=7:8
/**
 *  COMPLETE: See "Stubbing Initial Context for Development"
 */
import { resolveInitialContext } from "./initial-context";
export { resolveInitialContext };

import { publishNavigateBackMessage } from "./pub-sub";
export { publishNavigateBackMessage };

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

Save the code and press the back button. Observe that the view containing the Expenses web app has popped from the native navigation stack. 

If you navigate to `http://localhost:5173` and press the back button, nothing will happen. The expenses list view is the root of the Expenses web app, and has no navigation to go back to. For the purposes of this training, leaving the back button in when the web app runs within a web browser is suitable.

<Admonition type="info">
The back button is still visible when you visit `http://localhost:5173` on a web browser. That's OK for the purposes of this training, but in a production scenario you may want to use platform detection to hide visual elements depending on the platform the web app runs on, such as hiding the back button when the Expenses web app is running on a browser.
</Admonition>

## What's next

By passing messages using Portals' pub/sub interface, you have triggered native navigation within the Jobsync mobile application. The pub/sub mechanism is ideal for simple use cases, such as telling native mobile apps to navigate. In the next step of this module, you will learn about Capacitor plugins, which communicate bi-directionally in a more structured manner suitable for complex use cases. 