---
title: Portals for web developers
sidebar_label: Getting Started
sidebar_position: 1
pagination_prev: portals/training/introduction
---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Web developers provide web apps to be presented through Portals in a mobile application. Communication through a Portal can be achieved, allowing web code to interact with native mobile code, and vice versa.

In this training module, you will take an existing web app and learn how to:

- Obtain and use data passed from the native app.
- Send messages from the web app to the native app.
- Define, implement, and register a Capacitor plugin.
- Serve the web app within a mobile application using the Portals CLI. 

<Admonition type="note">
Make sure you have read the [training introduction](../introduction) before proceeding. 
</Admonition>

## Setting up the project

In the introduction to this training, you cloned a repository for this training. The repository contains branches for different training modules, the `start-web` branch corresponds to this training:

```bash terminal
cd ./tutorials-and-training-portals
git checkout start-web
```

All work in this training module will occur within the `/web` directory. In this directory, you will find the following sub directories:

- `/apps` contains the individual web apps to be presented through Portals in the native mobile app.
- `/artifacts` contains build artifacts of the iOS and Android apps.
- `/shared` contains code libraries shared between web apps in `/apps`.

Go ahead and install dependencies for the workspace:

```bash terminal
cd ./web
pnpm install
```

In this training module, you will be working with the following web projects in the monorepo:

- `/apps/expenses` contains the Expenses web app to add Portals features to.
- `/shared/portals` contains shared code that will implement Portals features.

<Admonition type="info">
Web apps in this monorepo are written in React. However, no knowledge of React is needed for this training module. All coding exercises will be performed within the shared Portals library using vanilla TypeScript. 
</Admonition>

## Serving the Expenses web app

One key consideration when Portals was developed was to ensure web developers could continue developing using existing tooling and processes. After all, there are cases where web apps should both be presented within a Portal and also hosted online. However, the Portals library provides mechanisms to communicate between web and native mobile code, which can't be debugged or tested through the browser. 

The Portals CLI solves for this limitation, allowing web developers to slot local web servers where Portals are designated in native binaries. In doing so, web developers can debug and test interactions between web and native code.

<Admonition type="info">
In a production setting, native mobile development teams should supply you with debug iOS and/or Android binaries to develop, debug, and test with.
</Admonition>

Serving a web app within a native binary using the Portals CLI is a two-step process. As you follow the steps below, ensure that any terminals start at the `/web` subdirectory.

First, you will need to serve the Expenses web app on a local web server:

```bash terminal
pnpm run --filter="expenses" dev
```

In a web browser, navigate to `http://localhost:5173` and familiarize yourself with the Expenses web app.

Next, in a separate terminal, run the Portals CLI's `serve` command. The commands differ depending on whether you wish to use an iOS or Android native binary:

<Tabs groupid="platforms">
  <TabItem label="iOS" value="ios" default>
    
  The command differs slightly depending on whether you wish to use a device or a simulator:

  <Tabs>
    <TabItem label="Simulator" value="sim" default>

    ```bash terminal
    export SIMCTL_CHILD_PORTALS_KEY=YOUR_KEY
    portals serve ios simulator --application ./artifacts/Jobsync.app --dev-server http://localhost:5173
    ```

    </TabItem>
    <TabItem label="Device" value="device">
    
    ```bash terminal
    export DEVICECTL_CHILD_PORTALS_KEY=YOUR_KEY
    portals serve ios simulator --application ./artifacts/Jobsync.app --dev-server http://localhost:5173
    ```

    </TabItem>
  </Tabs>

  Make sure you replace `YOUR_KEY` with your Portals registration key.

  <Admonition type="note">
  Setting `SIMCTL_CHILD_PORTALS_KEY` or `DEVICECTL_CHILD_PORTALS_KEY` is atypical, and required for this specific iOS app only where the Portals registration key must be provided by the reader. 
  </Admonition>

  </TabItem>
  <TabItem label="Android" value="android">
    <Admonition type="info">
      Android instructions coming soon!   
    </Admonition>
  </TabItem>
</Tabs>

Then, select either a simulator or a device to test on and "Jobsync" (the name of the superapp) will run.

Finally, press "Login" and select "Expenses" from the dashboard view. You will see the Expenses web app load within a Portal that has been configured within the native app.

## What's next

After setting up the project and using the Portals CLI to establish a development workflow, you can now take advantage of the features Portals provides to communicate through a Portal. In the next step of this module, you will learn how to obtain and use data passed from a Portal within a web app.