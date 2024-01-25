---
title: Implementing a Capacitor Plugin
sidebar_label: Implementing a Plugin
sidebar_position: 4
---

import Admonition from '@theme/Admonition';

Portals projects can use <a href="https://ionic.io/docs/portals/for-ios/how-to/using-a-capacitor-plugin" target="_blank">Capacitor plugins</a> to communicate between web and native code. The Capacitor Plugin API provides a structured, object-oriented approach to communicating between web and native suitable for larger and more complex use-cases.

Writing a Capacitor plugin is the recommended way to expose complex native functionality to web applications presented through a Portal, such as scanning a barcode or integrating with a 3rd party native SDK.

## Overview

This tutorial will teach you:

- How to use the Capacitor Plugin API to author an analytics plugin.
- How to implement platform-specific code to log analytics when running the Portal's web application in isolation.  

<Admonition type="note">
As you work through the tutorial, ensure that you are [running the _Expenses_ web application](./overview#running-the-expenses-web-application) to observe any code changes in real-time.
</Admonition>

## Anatomy of a Capacitor Plugin

Each Capacitor plugin contains a set of functionalities written in the native language of the platform (e.g., Swift for iOS, Java/Kotlin for Android, Typescript for web). A shared Typescript interface defines the contract between the web application and platform implementations.

Both pub/sub and Capacitor plugins allow programmatic communication between web and native code, with key differences:

- Capacitor plugins focus on bridging the gap between web and native functionality, whereas Portals' pub/sub messaging system focuses on coordination between a Portal's web application and the host native application.
- Calls made to a Capacitor plugin must be made from web code. The request is directed to the appropriate implementation, its code performs the functionality, and a result is returned to the web code. Pub/sub messages can be published from native code and subscribers can reside in web code. 
- Capacitor plugins treat the web as a platform, allowing plugin developers to write platform-specific implementations that run in the web without writing any conditional code.

<Admonition type="info">
Detailed information about Capacitor plugins and the Capacitor Plugin API can be found <a href="https://capacitorjs.com/docs/plugins" target="_blank">here</a>.
</Admonition>

In the following sections, we will define the plugin's interface and write the web implementation.

## Defining the Plugin API

The Jobsync app leverages an analytics service that micro frontends can tap into. The business requirements for logging analytics are as follows:

1. There should be the ability to log when a user navigates to a new screen.
2. There should be the ability to log specified actions taken in the app.
3. Every analytic entry should track the platform the log occurred on.

Based on these requirements, the Jobsync team put together this API contract:

```typescript
interface AnalyticsPlugin {
  logAction(opts: { action: string, params?: any }): Promise<void>;
  logScreen(opts: { screen: string, params?: any }): Promise<void>;
}
```

Notice that the API contract doesn't address the 3rd requirement. That's an implementation detail that can be handled when platform-specific code is written.

Create a new file, `web/shared/portals/analytics-plugin.ts` and populate it with the interface above.

## Registering the Plugin


<CH.Scrollycoding>

<CH.Code>

```typescript web/shared/portals/analytics-plugin.ts focus=1,8:10
import { registerPlugin } from "@capacitor/core";

interface AnalyticsPlugin {
  logAction(opts: { action: string; params?: any }): Promise<void>;
  logScreen(opts: { screen: string; params?: any }): Promise<void>;
}

export const Analytics = registerPlugin<AnalyticsPlugin>(
  "Analytics"
);

```
</CH.Code>

In order to use the plugin, it must be registered using the `registerPlugin` export from the `@capacitor/core` module.


---

<CH.Code>

```typescript web/shared/portals/index.ts focus=13:14
/**
 *  COMPLETE: See "Stubbing Initial Context for Development"
 */
import { resolveInitialContext } from "./initial-context";
export { resolveInitialContext };

/**
 * COMPLETE: See "Publishing Messages with PubSub"
 */
import { publishNavigateBackMessage } from "./pub-sub";
export { publishNavigateBackMessage };

import { Analytics } from "./analytics-plugin";
export { Analytics };
```

</CH.Code>

Within the `web/shared/portals` directory, open `index.ts`. 

Replace the existing `Analytics` export with an import and export of the new constant created in the step above.

</CH.Scrollycoding>

When you see the error message `"Analytics" plugin is not implemented on the web`, it indicates that the web implementation of the Analytics plugin is missing. In the following sections, we will address this and provide a complete implementation for the web platform.

## Implementing the Plugin

<CH.Scrollycoding>

<CH.Code>

```typescript web/shared/portals/analytics-plugin.ts focus=1[10:19],8:15
import { WebPlugin, registerPlugin } from "@capacitor/core";

interface AnalyticsPlugin {
  logAction(opts: { action: string; params?: any }): Promise<void>;
  logScreen(opts: { screen: string; params?: any }): Promise<void>;
}

class AnalyticsWeb extends WebPlugin implements AnalyticsPlugin {
  async logAction(opts: { action: string; params?: any }): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async logScreen(opts: { screen: string; params?: any }): Promise<void> {
    throw new Error("Method not implemented.");
  }
}

export const Analytics = registerPlugin<AnalyticsPlugin>("Analytics");
```

</CH.Code>

Start by creating a class that implements `AnalyticsPlugin`. Web implementations of Capacitor plugins must extend `WebPlugin`, part of the `@capacitor/core` module.

---

<CH.Code>

```typescript web/shared/portals/analytics-plugin.ts focus=17:20
import { WebPlugin, registerPlugin } from "@capacitor/core";

interface AnalyticsPlugin {
  logAction(opts: { action: string; params?: any }): Promise<void>;
  logScreen(opts: { screen: string; params?: any }): Promise<void>;
}

class AnalyticsWeb extends WebPlugin implements AnalyticsPlugin {
  async logAction(opts: { action: string; params?: any }): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async logScreen(opts: { screen: string; params?: any }): Promise<void> {
    throw new Error("Method not implemented.");
  }
}

export const Analytics = registerPlugin<AnalyticsPlugin>(
  "Analytics", 
  { web: new AnalyticsWeb() }
);
```

</CH.Code>

The second parameter of `registerPlugin()` lets developers assign `WebPlugin` class instances to specific platforms.

At this point, we can see the web implementation called as the `Method not implemented.` error is thrown. 

---

<CH.Code>

```typescript web/shared/portals/analytics-plugin.ts focus=2,11:12,16:17
import { WebPlugin, registerPlugin } from "@capacitor/core";
import { httpClient } from "@jobsync/api";

interface AnalyticsPlugin {
  logAction(opts: { action: string; params?: any }): Promise<void>;
  logScreen(opts: { screen: string; params?: any }): Promise<void>;
}

class AnalyticsWeb extends WebPlugin implements AnalyticsPlugin {
  async logAction(opts: { action: string; params?: any }): Promise<void> {
    let { action, params } = opts;
    await httpClient.post("/analytics", { action, params, platform: "web" });
  }

  async logScreen(opts: { screen: string; params?: any }): Promise<void> {
    const { screen, params } = opts;
    await httpClient.post("/analytics", { screen, params, platform: "web" });
  }
}

export const Analytics = registerPlugin<AnalyticsPlugin>(
  "Analytics", 
  { web: new AnalyticsWeb() }
);
```

</CH.Code>

Shared code in `@jobsync/api` provides an HTTP client to make calls to the analytics backend. Note that the implementation passes `platform: web` to log the platform the analytic event occurred on.

</CH.Scrollycoding>

Head back to the browser. No more errors remain, and the plugin has been implemented for the web! 

If you inspect network traffic, you will see the analytic event data returned back as the response body on calls made to the `/analytics` endpoint. Response data will look something like this:

```json

{
  "success": true,
  "event": {
    "screen":"Expenses List",
    "platform":"web"
  }
}
```

## Conclusion

In this tutorial, you learned how to implement the web portion of a Capacitor plugin. With the completion of this tutorial, you have completed the Portals onboarding training for web developers! 