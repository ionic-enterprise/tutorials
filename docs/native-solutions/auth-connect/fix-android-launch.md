---
title: Fix Android Launch From Home
sidebar_label: Android Launch From Home
sidebar_position: 4
---

Launching a Capacitor app on an Android device typically initiates the display of your application's content in a webview. However, if the user is in the process of authentication and leaves the app it might not display the login page in the same state when the user returns. To fix this behavior you would want the app to direct users back to the login page instead of the application's content in such scenarios. To achieve this, specific modifications are necessary, as outlined in the following steps.

Go to your Capacitor Android project and navigate to the directory that contains your application's package. Your path will be something like `android/app/src/main/java/io/ionic/starter/`. However, the end of the path will reflect your unique bundle ID.

Created a new Java file in this folder named `LauncherActivity.java`.

<CH.Scrollycoding>

<CH.Code>

```java LauncherActivity.java
package io.ionic.starter;

import android.content.Intent;
import android.os.Bundle;
import androidx.appcompat.app.AppCompatActivity;

public class LauncherActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Intent i = new Intent(this, MainActivity.class);
        i.replaceExtras(this.getIntent());
        startActivity(i);
        finish();
    }
}
```

</CH.Code>

Copy and paste the provided code into the new activity file (`LauncherActivity.java`).

---

<CH.Code>

```java LauncherActivity.java
package your.project.identifier;

import android.content.Intent;
import android.os.Bundle;
import androidx.appcompat.app.AppCompatActivity;

public class LauncherActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Intent i = new Intent(this, MainActivity.class);
        i.replaceExtras(this.getIntent());
        startActivity(i);
        finish();
    }
}
```

</CH.Code>

Replace `io.ionic.starter` with your project's identifier.

---

<CH.Code>

```xml AndroidManifest.xml
<activity
    android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
    android:name="io.ionic.starter.MainActivity"
    android:label="@string/title_activity_main"
    android:theme="@style/AppTheme.NoActionBarLaunch"
    android:launchMode="singleTask"
    android:exported="true">
    <intent-filter>
        <action android:name="android.intent.action.MAIN" />
        <category android:name="android.intent.category.LAUNCHER" />
    </intent-filter>
</activity>
```

</CH.Code>

Navigate to the `AndroidManifest.xml` file which is located at the following file path `android/app/src/main/` and locate the activity section.

---

<CH.Code>

```xml AndroidManifest.xml
<activity android:name="io.ionic.starter.LauncherActivity"
    android:label="@string/title_activity_main"
    android:theme="@style/AppTheme.NoActionBarLaunch"
    android:exported="true">
    <intent-filter>
        <action android:name="android.intent.action.MAIN" />
        <category android:name="android.intent.category.LAUNCHER" />
    </intent-filter>
</activity>
<activity
    android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
    android:name="io.ionic.starter.MainActivity"
    android:label="@string/title_activity_main"
    android:theme="@style/AppTheme.NoActionBarLaunch"
    android:launchMode="singleTask"
    android:exported="true">
    <intent-filter>
        <action android:name="android.intent.action.MAIN" />
        <category android:name="android.intent.category.LAUNCHER" />
    </intent-filter>
</activity>
```

</CH.Code>

Update the `AndroidManifest.xml` to set the new Activity as the launcher activity. Add an `intent-filter` to `LauncherActivity` to define it as the launcher.

---

<CH.Code>

```xml AndroidManifest.xml
<activity android:name="io.ionic.starter.LauncherActivity"
    android:label="@string/title_activity_main"
    android:theme="@style/AppTheme.NoActionBarLaunch"
    android:exported="true">
    <intent-filter>
        <action android:name="android.intent.action.MAIN" />
        <category android:name="android.intent.category.LAUNCHER" />
    </intent-filter>
</activity>
<activity
    android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
    android:name="io.ionic.starter.MainActivity"
    android:label="@string/title_activity_main"
    android:theme="@style/AppTheme.NoActionBarLaunch"
    android:launchMode="singleTask"
    android:exported="true">
</activity>
```

</CH.Code>

Remove the `intent-filter` on the `MainActivity` that previously defined it as the launcher.

---

<CH.Code>

```xml AndroidManifest.xml
<activity android:name="io.ionic.starter.LauncherActivity"
    android:label="@string/title_activity_main"
    android:theme="@style/AppTheme.NoActionBarLaunch"
    android:exported="true">
    <intent-filter>
        <action android:name="android.intent.action.MAIN" />
        <category android:name="android.intent.category.LAUNCHER" />
    </intent-filter>
</activity>
<activity
    android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
    android:name="io.ionic.starter.MainActivity"
    android:label="@string/title_activity_main"
    android:theme="@style/AppTheme.NoActionBarLaunch"
    android:launchMode="singleTask"
    android:exported="false">
</activity>
```

</CH.Code>

On the `MainActivity` change exported to `false` and make sure to keep `launchMode` as `singleTask`.

---


</CH.Scrollycoding>

Be sure to run `npx cap sync` after applying these changes.

To test that you have correctly applied these changes:
1) Launch your application with an Android device.
2) Go to the login page.
3) Return to the home screen of your Android device.
4) Launch your app again by pressing the icon.
5) Your application should now open displaying the login page in the state it was left in.