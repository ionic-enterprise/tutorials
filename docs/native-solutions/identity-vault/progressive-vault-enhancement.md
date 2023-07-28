---
title: Progressively Enhancing Vault Security
sidebar_label: Progressive Vault Security
---

Identity Vault offers various configuration options for securing a Vault, including `VaultType` and `DeviceSecurityType`. These options allow developers to dynamically select the most appropriate Vault configuration based on the end user's device capabilities.

In this tutorial, we'll explore how developers can take advantage of Identity Vault's `Device` API to enhance security progressively based on the user's device capabilities.    

<CH.Scrollycoding>

## Create an initialization factory

```typescript 
import { isPlatform } from '@ionic/core';
import { BrowserVault, IdentityVaultConfig, Vault } from '@ionic-enterprise/identity-vault';

const createVault = (config: IdentityVaultConfig): Vault | BrowserVault => {
  return isPlatform("hybrid") ? new Vault(config) : new BrowserVault(config);
};
```
Start by creating a factory function that builds either the actual Vault, if we are on a device, or a browser-based "Vault" suitable for development in the browser. 

This is a standard step Ionic recommends taking as you develop any project with Identity Vault, so your development workflow is unimpeded.   

---

## Initialize the Vault

### Start with the least restrictive security options

The least restrictive security option a Vault can have is the `SecureStorage` vault type mode. 

This configuration does not require the device to have _any_ security hardware to store data within a Vault.

```typescript focus=8:22
import { isPlatform } from '@ionic/core';
import { BrowserVault, IdentityVaultConfig, Vault, VaultType, DeviceSecurityType } from '@ionic-enterprise/identity-vault';

const createVault = (config: IdentityVaultConfig): Vault | BrowserVault => {
  return isPlatform("hybrid") ? new Vault(config) : new BrowserVault(config);
};

const initialOptions: IdentityVaultConfig = {
  key: 'io.ionic.progressiveSecurityVault',
  type: VaultType.SecureStorage,
  deviceSecurityType: DeviceSecurityType.None,
  lockAfterBackgrounded: 2000,
  shouldClearVaultAfterTooManyFailedAttempts: true,
  customPasscodeInvalidUnlockAttempts: 2,
  unlockVaultOnLoad: false
};

const createProgressivelyEnhancedVault = async () => {
  const vault = createVault(initialOptions);
  return vault;
};
export createProgressivelyEnhancedVault;
```
---

## Progressively enhance security

### Check for device security hardware

```typescript focus=20:25
import { isPlatform } from '@ionic/core';
import { BrowserVault, IdentityVaultConfig, Vault, VaultType, DeviceSecurityType, Device } from '@ionic-enterprise/identity-vault';

const createVault = (config: IdentityVaultConfig): Vault | BrowserVault => {
  return isPlatform("hybrid") ? new Vault(config) : new BrowserVault(config);
};

const initialOptions: IdentityVaultConfig = {
  key: 'io.ionic.progressiveSecurityVault',
  type: VaultType.SecureStorage,
  deviceSecurityType: DeviceSecurityType.None,
  lockAfterBackgrounded: 2000,
  shouldClearVaultAfterTooManyFailedAttempts: true,
  customPasscodeInvalidUnlockAttempts: 2,
  unlockVaultOnLoad: false
};

const createProgressivelyEnhancedVault = async () => {
  const vault = createVault(initialOptions);
  if (!(await Device.isSystemPasscodeSet())) {
    await vault.updateConfig({ 
      ...vault.config, 
      type: VaultType.CustomPasscode
      });
  }
  return vault;
};
export default createProgressivelyEnhancedVault;
```

You can test if a device has security hardware enabled by checking if a device passcode has been set. 

If not, we can add a layer of security to the Vault by using the `CustomPasscode` vault type. This will require a user to set a custom passcode that will be used to access the Vault.

> **Note:** Learn more about `CustomPasscode` <a href="https://ionic.io/docs/identity-vault/cookbook-custom-passcode" target="_blank">in this cookbook</a>.

---

### Check for biometric hardware

```typescript focus=25:31
import { isPlatform } from '@ionic/core';
import { BrowserVault, IdentityVaultConfig, Vault, VaultType, DeviceSecurityType, Device } from '@ionic-enterprise/identity-vault';

const createVault = (config: IdentityVaultConfig): Vault | BrowserVault => {
  return isPlatform("hybrid") ? new Vault(config) : new BrowserVault(config);
};

const initialOptions: IdentityVaultConfig = {
  key: 'io.ionic.progressiveSecurityVault',
  type: VaultType.SecureStorage,
  deviceSecurityType: DeviceSecurityType.None,
  lockAfterBackgrounded: 2000,
  shouldClearVaultAfterTooManyFailedAttempts: true,
  customPasscodeInvalidUnlockAttempts: 2,
  unlockVaultOnLoad: false
};

const createProgressivelyEnhancedVault = async () => {
  const vault = createVault(initialOptions);
  if (!(await Device.isSystemPasscodeSet())) {
    await vault.updateConfig({ 
      ...vault.config, 
      type: VaultType.CustomPasscode
      });
  } else if (!(await Device.isBiometricsEnabled())) {
    await vault.updateConfig({
      ...vault.config,
      type: VaultType.DeviceSecurity,
      deviceSecurityType: DeviceSecurityType.SystemPasscode,
    });
  }
  return vault;
};
export default createProgressivelyEnhancedVault;
```

If the previous check passes, we'll want to check to see if the device has biometrics enabled and enrolled.

In the event the device only has a device passcode enabled, we can still use device level security letting Identity Vault know that this Vault will be secured using it.

---

```typescript focus=31:37
import { isPlatform } from '@ionic/core';
import { BrowserVault, IdentityVaultConfig, Vault, VaultType, DeviceSecurityType, Device } from '@ionic-enterprise/identity-vault';

const createVault = (config: IdentityVaultConfig): Vault | BrowserVault => {
  return isPlatform("hybrid") ? new Vault(config) : new BrowserVault(config);
};

const initialOptions: IdentityVaultConfig = {
  key: 'io.ionic.progressiveSecurityVault',
  type: VaultType.SecureStorage,
  deviceSecurityType: DeviceSecurityType.None,
  lockAfterBackgrounded: 2000,
  shouldClearVaultAfterTooManyFailedAttempts: true,
  customPasscodeInvalidUnlockAttempts: 2,
  unlockVaultOnLoad: false
};

const createProgressivelyEnhancedVault = async () => {
  const vault = createVault(initialOptions);
  if (!(await Device.isSystemPasscodeSet())) {
    await vault.updateConfig({ 
      ...vault.config, 
      type: VaultType.CustomPasscode
      });
  } else if (!(await Device.isBiometricsEnabled())) {
    await vault.updateConfig({
      ...vault.config,
      type: VaultType.DeviceSecurity,
      deviceSecurityType: DeviceSecurityType.SystemPasscode,
    });
  } else {
    await vault.updateConfig({
      ...vault.config,
      type: VaultType.DeviceSecurity,
      deviceSecurityType: DeviceSecurityType.SystemPasscode,
    });
  }
  return vault;
};
export default createProgressivelyEnhancedVault;
```

### Secure the Vault using biometric security

If both checks pass the device can use biometrics to lock and unlock the Vault. 

Identity Vault has the ability to lock/unlock using the device passcode, biometrics, or both. 

> **Note:** Take a look at the <a href="https://ionic.io/docs/identity-vault/enums/devicesecuritytype" target="_blank">DeviceSecurityType enumeration</a> for more information.

</CH.Scrollycoding>