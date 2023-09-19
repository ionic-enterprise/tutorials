---
title: Getting Started with Auth Connect
sidebar_label: Getting Started
sidebar_position: 1
---

Using OpenID Connect authentication standards, Auth Connect provides all the infrastructure needed to set up login, logout, and token refresh in a web-native application running on the web, iOS, and Android. For the best possible security and protection against data theft, Auth Connect uses native system components on Android and iOS rather than an embedded browser.

<iframe width="400" height="800" src="https://ionicpro.wistia.com/medias/43tint31ra" title="Auth Connect Flow" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{paddingBottom: 0}}></iframe>

For more information on OIDC, please see the Auth Connect documentation on [Understanding OpenID Connect](https://ionic.io/docs/auth-connect#addendum-understanding-openid-connect).

## Goals

In these tutorials, you will learn how to:

- Configure Auth Connect based on the configuration of your Authentication vendor.
- Set up and initialize Auth Connect within an application.
- Create a basic authentication from log in to log out.
- Manage the authentication session that is represented in Auth Connect via an `AuthResult` object.
- Use the data encapsulated in the `AuthResult` to provide authentication data to the application.
- Refresh the access token in the `AuthResult` when needed.

## Concepts

Before we start in on the coding, let's introduce some important Auth Connect related concepts.

### The `Provider` Class

While any authentication vendor that works with Auth Connect needs to be OIDC compliant, there are minor differences in the details of how to interact with the vendor's product. Auth Connect uses the concept of a `Provider` class to handle these differences. This class specifies details pertaining to communicating with the OIDC service.

Auth Connect offers specific classes for several common providers:

- `Auth0Provider`
- `AzureProvider`
- `CognitoProvider`
- `OktaProvider`
- `OneLoginProvider`

You can also create your own custom provider, though doing so is beyond the scope of this tutorial.

### The `ProviderOptions` Data

When an authentication vendor such as AWS Cognito is configured an application is created. This application includes several pieces of data that Auth Connect needs in order to communicate with it. These are specified via a `ProviderOptions` object. They include:

- `clientId`: The ID of the authentication application that was created.
- `discoveryUrl`: A publicly available URL that points to a JSON object containing metadata that is required to use the authentication application.
- `logoutUrl`: The location that the hosting application expects logout callback to redirect to. For most authentication vendors, this path must be specified as an allowable logout URL when configuring the authentication application on the server.
- `redirectUri`: The location that the hosting application expects login callback to redirect to. For most authentication vendors, this path must be specified as an allowable redirect or callback URL when configuring the authentication application on the server.
- `scope`: Scopes specify user information requested from the authentication vendor upon login. Scopes can be standard or may be custom defined scopes.
- `audience`: Some authentication vendors require an audience be defined for login attempts. That audience, once defined, should be specified with this parameter.

Setting up an application via the authentication vendor's web console is beyond the scope of this tutorial. However, we will show you our configuration so you can see what this should look like. This will help in communicating with the team that administrates your authentication vendor. We can also show you various applications that we have set up in order to give you an idea of where this information is contained for commonly used vendors.

Please note that all of this configuration data is public facing and publicly discoverable. None of it is private. Thus there are no issues including the configuration in your code.

### The `AuthResult` Data

The `AuthResult` object contains the tokens provided by the authentication vendor as well as a lot of information that Auth Connect uses to manage an Auth Connect session. The `AuthResult` object is initially obtained via a call to `AuthConnect.login()`. It is then sent to other Auth Connect API calls as your application interacts with the authentication session. You can think of this object as representing the state of your authentication session. The typical data flow with the `AuthResult` is:

1. Obtain the `AuthResult` via `AuthConnect.login()`.
1. Use the `AuthResult` in various other `AuthConnect` calls such as `getToken()`, `refreshSession()`, and `logout()`.
1. Upon `logout()`, the `AuthResult` object is no longer valid and any references to it within your application should be released.

## Next Steps

Start with the `Let's Get Coding` tutorial for your favorite application framework. This guide will walk you through building a simple application that allows the user to log in and log out. It also stores the authentication session between invocations of the application. After that, use the other tutorials to build upon that base and learn how to use Auth Connect to perform various tasks within your application.

Happy Coding!! 🤓
