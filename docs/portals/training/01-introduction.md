---
title: Introduction to Portals
sidebar_label: Introduction
sidebar_position: 1
---

import Admonition from '@theme/Admonition';

Ionic Portals is a supercharged WebView component that enables native and web teams to bring web experiences into native mobile apps, allowing organizations to achieve micro frontend use cases. 

This training familiarizes developers with Portals by exercising the core concepts and features of the product. 


## What you'll be doing

In this training, you will take a series of independent web experiences and present them within a single mobile experience using Portals. By doing so, you will create an intranet-themed superapp that allows users to perform typical employee functions such as submitting expenses and tracking time.

<Admonition type="info">

The consolidation of disparate apps into a single experience is known as a _superapp_. 

</Admonition>

## What you'll be learning

Throughout this training, you will learn how to:

- Add the Portals library to an existing project
- Sync and display web experiences within a native mobile app<sup>*</sup>
- Communicate between web and native mobile code
- Use the Portals CLI to improve your development experience

The capabilities Portals provides differ depending on the platform you develop for. This training splits into different modules after this introduction. iOS and Android modules contain the same material but diverge on platform-specific instruction.

<small><sup>*</sup> Only available in the iOS and Android training modules.</small>

## What you will need

In order to run an application using Portals, you will need an active <a href="https://ionic.io/docs/portals/getting-started#using-your-product-key" target="_blank">Portals product key</a>.

Source code for this training is available <a href="https://github.com/ionic-enterprise/tutorials-and-training-portals" target="_blank">on GitHub</a> and can be cloned with the following command:

```bash terminal
git clone https://github.com/ionic-enterprise/tutorials-and-training-portals.git
```

Each individual training module contains further instructions on where to start within the monorepo.

<a href="https://pnpm.io" target="_blank">pnpm</a> is required to build and serve the web apps contained within the monorepo.

Lastly, you will need the <a href="https://ionic.io/docs/portals/cli/overview" target="_blank">Portals CLI</a>. 


<Admonition type="note">
Web developers will need either <a href="https://developer.apple.com/xcode/" target="_blank">Xcode</a> or <a href="https://developer.android.com/studio" target="_blank">Android Studio</a> to make use of the Portals CLI commands used in the web training module.
</Admonition>

## What's next

Head to the training module that best represents your developer persona:

- [Portals for iOS developers](../training/ios/overview)
- [Portals for Android developers](../training/android/overview)
- [Portals for web developers](../training/web/overview)