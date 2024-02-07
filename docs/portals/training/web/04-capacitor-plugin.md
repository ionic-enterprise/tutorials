---
title: Implementing a Capacitor Plugin
sidebar_label: Implementing a Plugin
sidebar_position: 4
pagination_next: null
---

import Admonition from '@theme/Admonition';

<a href="https://ionic.io/docs/portals/choosing-a-communication#capacitor-plugins" target="_blank">Capacitor plugins</a> provide a practical approach to structured communication through a Portal. The <a href="https://capacitorjs.com/" target="_blank">Capacitor bridge</a> is used under the hood in Portals, allowing any Capacitor plugin to be used.

In this step, you will author a Capacitor plugin to log analytics.

<Admonition type="note">
Ensure you are [serving the Expenses web app using the Portals CLI](./getting-started) before proceeding.
</Admonition>

## Exploring the problem

Business sponsors of the Expenses web app would like to introduce analytics, with the following requirements: 

1. There should be the ability to log when a user navigates to a new screen.
2. There should be the ability to log specified actions taken in the app.
3. Every analytic entry should track the platform the log occurred on.
4. Analytics should be logged when the web app is accessed through mobile or on the web.

Based on the requirements, the same actions must be available whether the Expenses web app is presented through a Portal or accessed on a web browser, but the implementation of the actions differ based on platform.

Authoring a Capacitor plugin is ideal in this case. The functionality of a Capacitor plugin is specified by a TypeScript API, which iOS, Android, and web developers write platform-specific implementations adhering to. During runtime, a Capacitor plugin dynamically directs calls to the appropriate implementation. 

<Admonition type="info">
Capacitor plugins perform platform-detection under the hood, making them a good abstraction for processes that require different implementations on different platforms.
</Admonition>


## Defining the API contract

Based on the requirements above, the following interface is reasonable for the analytics plugin:

```typescript
interface AnalyticsPlugin {
  logAction(opts: { action: string, params?: any }): Promise<void>;
  logScreen(opts: { screen: string, params?: any }): Promise<void>;
}
```

Notice that the interface doesn't address the requirement of tracking the running platform. This is an implementation detail that can be addressed when platform-specific code is written.

Create a new file, `web/shared/portals/analytics-plugin.ts` and populate the file with the interface above.

## Registering the plugin

The Capacitor plugin API is available as part of the `@capacitor/core` npm package. For the purpose of this training, it will be added as a dependency of the web package containing the project's shared Portals code:

```bash terminal
cd ./web/shared/portals
pnpm add @capacitor/core
```

Use `@capacitor/core` to register the plugin with the Expenses web app:

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

Register the analytics plugin using the `registerPlugin()` method.

<Admonition type="info">
The string `"Analytics"` sets the plugin name, and it must be consistent across different platform implementations.
</Admonition>

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

Replace the existing implementation in `web/shared/portals/index.ts` and point to the new implementation.  

</CH.Scrollycoding>

Save the code, then tap either the plus icon or an individual expense's edit (pencil) icon. If you were to monitor network traffic (optional), you would notice requests sent to an analytics endpoint. These requests contain data about the event, including a property `platform` indicating the running platform. For this demo, the analytics plugin has been implemented in the native binary running on your device or simulator.

All works when the plugin runs on a mobile platform, but if you navigate to `http://localhost:5173` you will encounter the following error:

```bash
"Analytics" plugin is not implemented on web
```

As a web developer, your responsibility includes implementing a Capacitor plugin for the web. In the following section, you will write the web implementation of the analytics plugin to meet the requirements outlined at the beginning of this step.

## Web implementation

The Expenses web app needs to record analytic events whether it is being presented through a Portal, or running as a standalone application on the web.

To that end, the analytics Capacitor plugin must contain an implementation when it is used on the web. You can write the web implementation for a Capacitor plugin by writing a class that extends `WebPlugin` and providing an instance of the class as part of `registerPlugin()`:

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

Add a class that extends `WebPlugin` and implements `AnalyticsPlugin` in `web/shared/portals/analytics-plugin.ts`.

---

<CH.Code>

```typescript web/shared/portals/analytics-plugin.ts focus=17:21
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

Register an instance of this class for the web implementation as part of the `registerPlugin()` call.

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
    const { action, params } = opts;
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

Use utility methods available as part of the local `@jobsync/api` package to make calls to the analytics backend.

Note that `platform: 'web'` is being added to the event payload.

</CH.Scrollycoding>

Return to the browser and notice that no more errors remain. If you inspect network traffic (optional), you will see network requests made to an analytics endpoint with a data payload containing `platform: 'web'`, confirming that the web implementation is in use. The analytics plugin determined that the Expenses web app is running on a web platform, and picked the appropriate plugin implementation to use.

<Admonition type="info">
Detailed information about Capacitor plugins and the Capacitor Plugin API can be found <a href="https://capacitorjs.com/docs/plugins" target="_blank">here</a>.
</Admonition>

## Conclusion

With the completion of the analytics Capacitor plugin, the Expenses web app is ready to be bundled within the Jobsync superapp! In this training module, you exercised the various ways web apps can communicate through a Portal. Furthermore, you used the Portals CLI to set up a development workflow to test and debug a web app running within the Portal the mobile application will present it in.

You now have the tools in place to take any web app and make it Portals-ready. Happy coding!! 🤓 