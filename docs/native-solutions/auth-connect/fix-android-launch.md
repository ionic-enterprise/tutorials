---
title: Fix Android Launch From Home
sidebar_label: Android Launch From Home
sidebar_position: 4
---

When launched on an Android device, your application will startup and display the webview your application is served in. However, for Auth Connect this may not be the behavior you want when a user is on the login page: you will likely want your application to return to the login page.

To make this behavior possible you'll need to alter your Capacitor application using the following instructions.

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

In your Capacitor project create a new activity with the following code

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

Replace `io.ionic.starter` with your projects identifier.

---


</CH.Scrollycoding>

<CH.Scrollycoding>

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

Update the AndroidManifest.xml to set the new Activity as the launcher activity, and keep the MainActivity launchMode as singleTask

---




</CH.Scrollycoding>