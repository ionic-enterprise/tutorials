---
title: JavaScript Obfuscation
sidebar_label: JavaScript Obfuscation
sidebar_position: 3
---

import Admonition from '@theme/Admonition';

JavaScript obfuscation is the process of transforming readable JavaScript code into a confusing, unreadable form while preserving its essential functionality.

JavaScript obfuscation can be a useful tool in your security arsenal, but it should be used strategically and in conjunction with other security measures. Carefully weigh the benefits and drawbacks before employing it.

## Why Obfuscate?

While it's not a foolproof security measure, here are potential benefits:
- **Difficulty of Reverse Engineering** - Obfuscation makes it harder for malicious actors to understand and modify your code, potentially deterring theft or sabotage.

- **Protection of Intellectual Property** - If your code contains valuable algorithms or secrets, obfuscation can make it less valuable to steal outright.

- **Discouragement of Tampering** - Obfuscation might make tampering with your code more difficult, although determined attackers with enough resources may still be able to reverse-engineer it.

## How can I Obfuscate?

We'll use the free open-source tool called [javascript-obfuscator](https://github.com/javascript-obfuscator/javascript-obfuscator), however there are commercial tools such as [JScambler](https://jscrambler.com/) that you can use.

In your project install `javascript-obfuscator`:

```bash
npm install javascript-obfuscator --save-dev
````

Next, we'll add an extra line to the `scripts` section of `package.json`:

```json
...
  "scripts": {     
     "capacitor:copy:after": "npx javascript-obfuscator www --output www --self-defending true"
  }
```

You may need to replace `www` with the folder containing the built assets of your project.

Now, whenever we run the Capacitor `sync` or `copy` commands our code will be obfuscated.

## Summary
Your Capacitor application is now much more difficult to reverse engineer. Be sure to review the [other CLI options](https://github.com/javascript-obfuscator/javascript-obfuscator?tab=readme-ov-file#cli-options) to see what features you can use.

## Common Questions

### How does it Work?
Various techniques are applied to your JavaScript code including renaming variables, functions, and properties; splitting code into multiple segments; using complex expressions; inserting useless or misleading code.

### What are the Caveats?

- **Not Unbreakable** - Obfuscation doesn't guarantee protection. Skilled attackers can still reverse-engineer and exploit obfuscated code, especially with persistence and sophisticated tools.

- **Impact on Performance and Debugging** - Obfuscation can increase code size and complexity, potentially affecting performance and making debugging more challenging.

- **Slower Build Times** - As Obfuscation requires additional processing, build times can increase.

- **Limited Benefits against Large-Scale Attacks** - Obfuscation is generally more effective against casual attackers. It may not be as effective against well-funded, highly motivated adversaries.

### How can my Capacitor App be inspected?
While Apple and Google attempt to make accessing the binary file of your app difficult, the process of getting the `IPA` or `APK` of an app is relatively easy with tools like [IPATool](https://github.com/majd/ipatool) and [APK Downloader](https://github.com/rehmatworks/gplaydl).

The `IPA` and `APK` files types are simply `zip` files which can be extracted and inspected to review the JavaScript, native code and resources in your app.

<Admonition type="warning">
It is worth noting that because this process is relatively easy, you should never use secrets like API keys in the code of your app.
</Admonition>

### What about obfuscating native code?

For Android [Proguard](https://developer.android.com/build/shrink-code) is built into Android Studio. Capacitor comes with prebuilt rules to ensure Proguard's obfuscation does not break the bridge between JavaScript code and Capacitor and Cordova plugins.

For iOS, Apple already provides a good level of obfuscation with release builds (eg variable and function names).

### What does output look like?

Here is an example of obfuscated code:
<div style={{textAlign: 'center'}}>

![Screenshot of obfuscated code](/img/obfuscated-code.png)

</div>
