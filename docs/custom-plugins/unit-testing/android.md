---
title: Unit Testing Capacitor Plugins
sidebar_label: Android
---

Unit testing a Capacitor plugin is similar to unit testing other APIs in an Android project. Just as you would mock network calls and validate inputs and outputs, unit testing for a Capacitor plugin involves mocking the Capacitor Plugin API and verifying the expected behaviors of plugin calls. This process helps ensure that the plugin functions as intended and maintains the desired behavior over time.

In this tutorial, you will see the types of unit tests commonly written for Capacitor plugins and examples of how to create effective unit tests for your own plugins.

## Mocking Libraries

When it comes to unit testing the Capacitor Plugin API, effective mocking is essential. In this tutorial, we'll work with <a href="https://site.mockito.org/" target="_blank">Mockito</a>, a widely used mocking framework. However, you are free to choose a mocking library that aligns with your familiarity and preferences. 

If you're keen on using Mockito for your tests, you can integrate it into your project by adding the following dependencies to your build configuration:

```groovy build.gradle
testImplementation 'org.mockito:mockito-core:5.3.+'
testImplementation 'org.json:json:20200518'
```

## Unit Testing 

<CH.Scrollycoding>

<CH.Code>

```java CalculatorPlugin.java
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "Calculator")
public class CalculatorPlugin extends Plugin {
    
  @PluginMethod
  public void add(PluginCall call) {
    Integer operandOne = call.getInt("operandOne");
    Integer operandTwo = call.getInt("operandTwo");

    if(operandOne == null || operandTwo == null) {
      call.reject("Please provide two numbers.");
      return;
    }
    
    Integer sum = operandOne + operandTwo;

    JSObject ret = new JSObject();
    ret.put("sum", sum);
    
    call.resolve(ret);
  }
}
```

</CH.Code>

### Plugin Implementation

We will write unit tests based on the implementation of `CalculatorPlugin`, a simple Capacitor plugin that contains a method that adds two numbers together.

---

<CH.Code>

```java CalculatorPlugin.java focus=10,22
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "Calculator")
public class CalculatorPlugin extends Plugin {

  private Calculator implementation = new Calculator();

  @PluginMethod
  public void add(PluginCall call) {
    Integer operandOne = call.getInt("operandOne");
    Integer operandTwo = call.getInt("operandTwo");

    if(operandOne == null || operandTwo == null) {
      call.reject("Please provide two numbers.");
      return;
    }

    Integer sum = implementation.add(operandOne, operandTwo);

    JSObject ret = new JSObject();
    ret.put("sum", sum);

    call.resolve(ret);
  }
}
```
```java Calculator.java
public class Calculator {
  public Integer add(Integer a, Integer b) {
    return a + b;
  }
}
```
</CH.Code>

### Separation of Concerns

Capacitor Plugin calls return `void`, which makes it difficult to ensure the `add()` call is mathematically sound.

To make this plugin method more testable, the code should be refactored to separate concerns. 

The <a href="https://refactoring.guru/design-patterns/bridge" target="_blank">Bridge design pattern</a> is a great pattern to use when authoring Capacitor plugins for this very reason.

--- 

<CH.Code>

```java CalculatorPluginTest.java
import static org.junit.Assert.*;
import static org.mockito.Mockito.*;
import org.junit.Test;

public class CalculatorPluginTest {

  private Calculator implementation = new Calculator();

  @Test
  public void implementation_add_AdditionIsCorrect() {
    Integer result = implementation.add(5, 3);
    assertEquals(Integer.valueOf(8), result);
  }
}
```

</CH.Code>

### Testing Implementation

When the plugin code has its concerns separated, it becomes clearer to see what types of tests should be written for each distinct aspect of the functionality. 

This modular approach not only enhances the clarity of the codebase but also guides developers in devising targeted and focused tests that validate the correctness of individual components. 

As a result, the testing process becomes more efficient, manageable, and aligned with the underlying architecture, ultimately leading to more robust and reliable unit tests for your Capacitor plugin.

---


```java CalculatorPluginTest.java focus=8,16:40
import static org.junit.Assert.*;
import static org.mockito.Mockito.*;
import org.junit.Test;

public class CalculatorPluginTest {

  private Calculator implementation = new Calculator();
  private CalculatorPlugin plugin = new CalculatorPlugin();

  @Test
  public void implementation_add_AdditionIsCorrect() {
    Integer result = implementation.add(5, 3);
    assertEquals(Integer.valueOf(8), result);
  }

  @Test
  public void plugin_add_ResolveWithGoodInput() {
    PluginCall mockCall = mock(PluginCall.class);
    when(mockCall.getInt("operandOne")).thenReturn(3);
    when(mockCall.getInt("operandTwo")).thenReturn(4);

    plugin.add(mockCall);

    verify(mockCall, times(1)).resolve(argThat(argument -> {
      JSObject expected = new JSObject();
      expected.put("sum", 7);
      return expected.toString().equals(argument.toString());
    }));
  }

  @Test
  public void plugin_add_RejectWithBadInput() {
    PluginCall mockCall = mock(PluginCall.class);
    when(mockCall.getInt("operandOne")).thenReturn(null);
    when(mockCall.getInt("operandTwo")).thenReturn(4);

    plugin.add(mockCall);

    verify(mockCall, times(1)).reject("Please provide two numbers.");
  }
}
```

### Testing the Plugin Call

Since Capacitor plugins bridge functionality between web code and native mobile code, it's essential that plugin methods undergo rigorous unit testing to ensure that the input and output adhere faithfully to the plugin's API contract. 

Consequently, the unit tests crafted to exercise the Capacitor Plugin API should be designed to verify that inputs and outputs adhere to the expected data types and structures. 

By enacting these thorough tests, developers can affirm that the plugin's behavior aligns seamlessly with its intended usage, promoting stability, compatibility, and adherence to the established API conventions.

</CH.Scrollycoding>
