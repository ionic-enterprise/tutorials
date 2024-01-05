---
title: Portals Integration for Web Developers
sidebar_label: Overview
sidebar_position: 1
---

Ionic Portals is a supercharged WebView component that enables the addition of web-based experiences to native mobile apps. <a href="https://ionic.io/docs/portals" target="_blank">Portals</a> enables native and web teams to better collaborate and bring new and existing web experiences to mobile in a safe, controlled way.

Portals provides web developers with ways to communicate with the native application presenting their web experience.

## Overview

In this training, you will integrate Portals within an existing web application by implementing communication between the web and native layers of a Portals project. This training exercises all available communication mechanisms supported by Portals: initial context, publisher-subscriber messaging, and using Capacitor plugins.  

Portals is designed to let developers work within their existing workflows. This training is designed to be completed only using web development tools and does not require any native tooling such as Android Studio and Xcode.

Jobsync is the superapp that has been created for this training. A superapp is a thin native app that facilitates launching and communicating with several micro frontend web applications that contain application features. Jobsync is an employee tool-set with features such as time tracking, expense reporting, and task management.

## Project Structure

<div style={{float: "right", maxWidth: "550px", marginLeft: "40px"}}>

![Jobsync Project Structure](/img/jobsync-project-structure-web.png)

</div>

Jobsync is comprised of several applications - both native and web - contained within a single repository as a monorepo. A monorepo setup **is not** required when using Portals. Ionic publishes Portals demos structured as monorepos as they are easier to maintain internally.

This training focuses on implementing Portals functionality in to the _Expenses_ micro frontend web application.

Micro frontends in Jobsync are written in React. To accommodate _all_ web developers, all coding in this training is isolated to the _Portals_ shared library, written in vanilla TypeScript.

<div style={{ clear: 'both'}}></div>

## Getting Started 

### Prerequisites

In order to install and build from this repo, you will need <a href="https://pnpm.io" target="_blank">pnpm</a>.

### Cloning the Repository

The Jobsync repository can be found using the following URL: <a href="https://github.com/ionic-enterprise/tutorials-and-training-portals" target="_blank">https://github.com/ionic-enterprise/tutorials-and-training-portals</a>.

Follow the steps below to clone the repo, and checkout the correct tag to start with:

```bash
git clone https://github.com/ionic-enterprise/tutorials-and-training-portals
cd ./tutorials-and-training-portals
git checkout tags/start-web
```

All web packages (micro frontends and shared libraries) reside within the `/web` subfolder. To install all dependencies and link shared libraries with micro frontends, run the following commands:

```bash
cd ./web
pnpm install
```

### Running the Expenses Web Application

Ensure that you are running the _Expenses_ micro frontend web application during this training. Doing so will allow you to view changes made in the _Portals_ shared library in the browser as you go. 

To run the _Expenses_ web application, run the command below. It will be available at the following URL: [`localhost:5173`](http://localhost:5173).

```bash
pnpm run --filter="expenses" dev
```

Proceed to the next page once you have cloned the repository and started the _Expenses_ web application.