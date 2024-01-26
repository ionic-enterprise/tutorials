---
title: Getting Started
sidebar_label: Getting Started
sidebar_position: 1
---

Ionic Portals is a supercharged WebView component that enables native and web teams to better collaborate to bring new and existing web experiences to native mobile apps in a safe, controlled way. With <a href="https://ionic.io/docs/portals" target="_blank">Portals</a>, organizations can achieve micro frontend use cases in native mobile applications. Unlike traditional WebView components, web experiences displayed through Portals are bundled within the native binary, can communicate with the host native code, and can be updated over-the-air (without additional store deployments).

## What you'll be doing

In this training, you will take a series of independent web experiences and present them within a single native mobile experience using Portals. This particular micro frontend use case is commonly referred to as a "superapp". 

You will integrate Portals into a fictitious intranet-themed project &mdash;  _Jobsync_ &mdash; that allows end users to perform job-related activities, such as tracking expenses and tracking project time. Each individual function has been developed as a standalone web application, and you will use Portals to bring these experiences into a native mobile app.

## What you'll be learning

This training will familiarize the reader with the foundational aspects of working with:

- How to add the Portals library to a web and/or native mobile project.
- How to communicate between web and native mobile code.
- How to improve your development workflow using the Portals CLI.

Developing for Portals differs whether you are a web developer or a native mobile developer. This training splits into modules based on developer persona, and again for native mobile expertise. Training exercises for the iOS and Android modules are identical and only differ in platform-specific instruction. 

## What you will need

In order to run an application using Portals, you will need an active <a href="https://ionic.io/docs/portals/getting-started#using-your-product-key" target="_blank">Portals product key</a>.

The monorepo containing all source code for this training is available <a href="https://github.com/ionic-enterprise/tutorials-and-training-portals" target="_blank">on GitHub</a> and can be cloned with the following command:

```bash
git clone https://github.com/ionic-enterprise/tutorials-and-training-portals.git
```

Each individual training module contains further instructions on where to start within the monorepo.

Lastly, you will need the <a href="https://ionic.io/docs/portals/cli/overview" target="_blank">Portals CLI</a>. Web developers will need either <a href="https://developer.apple.com/xcode/" target="_blank">Xcode</a> or <a href="https://developer.android.com/studio" target="_blank">Android Studio</a> to make use of the Portals CLI commands used in the web training module.

## What's next

Head to the training module that represents your developer persona:

- [Portals for web developers](../training/web/overview)
- [Portals for iOS developers](../training/ios/overview)
- [Portals for Android developers](../training/android/overview)