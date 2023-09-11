---
title: Code Hike Samples
---

This site uses <a href="https://codehike.org/" target="_blank">Code Hike</a> to enhance the code-reading experience. 

<a href="https://codehike.org/docs/introduction" target="_blank">Code Hike's documentation</a> is sparse and tricky to follow at some points. This document will walk you through some basic samples of how to use Code Hike features.

The best way to learn what Code Hike is capable of is to look at some of the code accompanying the examples in the <a href="https://codehike.org/docs/styling" target="_blank">Styling</a> portion of their documentation.

## Basic Formatting

### Code Blocks

Like traditional Markdown, CodeHike wraps code using triple backticks:

````mdx
## Lorem Ipsum

```javascript
console.log("Hello world!");
```

Dolor **sit** amet
````

If you add a title after the language, Code Hike will modify the UI to feature the filename (as in the example below):

````mdx lorem.md
## Lorem Ipsum

```javascript hello.js
console.log("Hello world!");
```

Dolor **sit** amet
````

### Annotations

Annotations allow you to add focus to code by highlighting lines or inline tokens:

````mdx lorem.md focus=3:6,5[12:28]
## Lorem Ipsum

```javascript hello.js focus=1,2[12:28]
console.log("Hello world!");
console.log("Goodbye world!")
```

Dolor **sit** amet
````

The <a href="https://codehike.org/docs/annotations" target="_blank">Annotations documentation</a> is very thorough for this feature. 

## Custom Components

There are a few components that ship with Code Hike that provide additional features beyond what is capable with traditional triple backtick code blocks.

### &lt;CH.Code&gt;

When you include more than one code block inside a `<CH.Code>` component, Code Hike will show them as tabs:

````mdx
<CH.Code>

```python one.py
print("Hello, one!")
```

```python two.py
print("Hello, two!")
```

</CH.Code>
````

<CH.Code>

```python one.py
print("Hello, one!")
```

```python two.py
print("Hello, two!")
```

</CH.Code>

You can also show multiple files at the same time in panels. Use a divider `---` to separate the tabs:

````mdx
<CH.Code>

```python one.py
print("Hello, one!")
```

---

```python two.py
print("Hello, two!")
```

</CH.Code>
````

<CH.Code>

```python one.py
print("Hello, one!")
```

---

```python two.py
print("Hello, two!")
```

</CH.Code>

### &lt;CH.Section&gt;

You can use `<CH.Section>` to reference code from a section of text. Using a <a href="https://codehike.org/docs/ch-section#inline-code" target="_target">special syntax</a>, you can write inline code with the appropriate language syntax.

Code mentions are a way to link code and text:

````mdx
<CH.Section>

```python
def lorem(ipsum):
  ipsum + 1
```

Hello, [hover me](focus://1[5:16])

</CH.Section>
````

<CH.Section>

```python
def lorem(ipsum):
  ipsum + 1
```

Hello, [hover me](focus://1[5:16])

</CH.Section>

### &lt;CH.Scrollycoding&gt;

This feature is easier to demo than explain. Look at this doc's source code to see how the display below was generated:

<CH.Scrollycoding>

Lorem ipsum dolor sit amet, consectetur adipiscing something about points, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

> Nova in illis at dabat legi harundine non, ova miratur? _Quid in_ sole aer
> ad diffusa illis voluisti fidensque coniugiale laniata curam. Aras rivus
> eripuit, qua fistula haec partus; serpens, negat.

Praesent elementum facilisis leo vel fringilla est ullamcorper eget. At imperdiet dui accumsan sit amet nulla facilities morbi tempus.

```js app.js focus=3:10
const { lorem, ipsum } = dolor({
  sit: {
    amet: 1,
    consectetur: 2,
    adipiscing: (elit) => ({
      sed: elit,
    }),
    eiusmod: (tempor) => ({
      incididunt: tempor,
    }),
    ut: (labore) => ({
      et: labore,
      dolore: labore + 1,
    }),
    magna: (aliqua) => ({
      ut: aliqua,
    }),
    nostrud: (elit) => ({
      exercitation: elit,
      ullamco: elit,
    }),
    laboris: (elit) => ({
      nisi: elit,
    }),
  },
})
```

---

Velit euismod in pellentesque massa placerat. Mi bibendum neque egestas congue quisque egestas diam in arcu. Nisi lacus sed viverra tellus in.

Praesent elementum facilisis leo vel fringilla est ullamcorper eget.

Id aliquet risus feugiat in ante metus dictum at tempor. Sed blandit libero volutpat sed cras. Sed odio morbi quis commodo odio aenean sed adipiscing. Velit euismod in pellentesque massa placerat. Mi bibendum neque egestas congue quisque egestas diam in arcu. Nisi lacus sed viverra tellus in. Nibh cras pulvinar mattis nunc sed. Luctus accumsan tortor posuere ac ut consequat semper viverra. Fringilla ut morbi tincidunt augue interdum velit euismod.

Morbi quis commodo.

```js app.js focus=11:17

```

---

Id aliquet risus feugiat in ante metus dictum at tempor. Sed blandit libero volutpat sed cras. Sed odio morbi quis commodo odio aenean sed adipiscing. Velit euismod in pellentesque massa placerat. Mi bibendum neque egestas congue quisque egestas diam in arcu.

- Nisi lacus sed viverra tellus in
- Nibh cras pulvinar mattis nunc sed
- Luctus accumsan tortor posuere ac

Ut consequat semper viverra. Fringilla ut morbi tincidunt augue interdum velit euismod.

```js app.js focus=11:14
const { lorem, ipsum } = dolor({
  sit: {
    amet: 1,
    consectetur: 2,
    adipiscing: (elit) => ({
      sed: elit,
    }),
    eiusmod: (tempor) => ({
      incididunt: tempor,
    }),
    ut: (labore) => ({
      et: lorem(labore * ipsum),
      dolore: lorem(labore + 1),
    }),
    nostrud: (elit) => ({
      exercitation: elit,
      ullamco: elit,
    }),
    laboris: (elit) => ({
      nisi: elit,
    }),
  },
})
```

---

Velit euismod in pellentesque massa placerat. Mi bibendum neque egestas congue quisque egestas diam in arcu. Nisi lacus sed viverra tellus in. Venenatis cras sed felis eget velit. Consectetur libero id faucibus nisl tincidunt.

Sed blandit libero volutpat sed cras.

- Nisi lacus sed viverra tellus in
- Nibh cras pulvinar mattis nunc sed

Gravida in fermentum et sollicitudin ac orci phasellus egestas tellus. Volutpat consequat mauris nunc congue nisi vitae.

```js app.js focus=15:21

```

---

Velit euismod in pellentesque massa placerat. Mi bibendum neque egestas congue quisque egestas diam in arcu. Nisi lacus sed viverra tellus in.

Praesent elementum facilisis leo vel fringilla est ullamcorper eget.

Id aliquet risus feugiat in ante metus dictum at tempor. Sed blandit libero volutpat sed cras. Sed odio morbi quis commodo odio aenean sed adipiscing. Velit euismod in pellentesque massa placerat.

Mi bibendum neque egestas congue quisque egestas diam in arcu. Nisi lacus sed viverra tellus in. Nibh cras pulvinar mattis nunc sed. Luctus accumsan tortor posuere ac ut consequat semper viverra.

- Fringilla ut morbi tincidunt augue interdum velit euismod.
- Luctus accumsan tortor posuere ac ut consequat semper viverra.

Morbi quis commodo.

```js app.js

```

</CH.Scrollycoding>

### &lt;CH.Spotlight&gt;

Spotlight is similar to Scrollycoding but differs in that the user must activate the next step by click. Look at this doc's source code to see how the display below was generated:

<CH.Spotlight>

```js app.js
function lorem(ipsum, dolor = 1) {
  const sit = ipsum == null && 0;
  dolor = sit - amet(dolor);
  return sit ? consectetur(ipsum) : [];
}
```

---

Change focus

```js app.js focus=2:4

```

---

Or change the code

```js app.js focus=6:10
function lorem(ipsum, dolor = 1) {
  const sit = ipsum == null && 0;
  dolor = sit - amet(dolor);
  return sit ? consectetur(ipsum) : [];
}

function adipiscing(...elit) {
  console.log(elit);
  return elit.map((ipsum) => ipsum.sit);
}
```

---

Or change the file

<CH.Code>

```js app.js focus=1:4
function adipiscing(...elit) {
  console.log(elit);
  return elit.map((ipsum) => ipsum.sit);
}
```

---

```css styles.css
.lorem {
  color: #fff;
  padding: 10px;
  background: #000;
}
```

</CH.Code>

---

Just make sure to leave enough veritcal whitespace to make a readable example!



```js app.js

```

</CH.Spotlight>

### &lt;CH.Slideshow&gt;

The `<CH.Slideshow>` component provides a display where the user can step through code documentation as if it were a slideshow. Look at this doc's source code to see how the display below was generated:

<CH.Slideshow preset="https://codesandbox.io/s/rfdho" code={{minZoom: 0.5}}>

<CH.Code>

```jsx src/index.js
import React from "react"
import ReactDOM from "react-dom"

const app = React.createElement(
  "h1",
  { style: { color: "teal" } },
  "Hello React"
)

ReactDOM.render(app, document.getElementById("root"))
```

</CH.Code>

React provides a createElement function to declare what we want to render to the DOM

---

<CH.Code>

```jsx src/index.js focus=4
import React from "react"
import ReactDOM from "react-dom"

const app = <h1 style={{ color: "teal" }}>Hello React</h1>

ReactDOM.render(app, document.getElementById("root"))
```

</CH.Code>

But instead of using createElement directly you can use JSX.

---

<CH.Code>

```jsx src/index.js focus=4:10
import React from "react"
import ReactDOM from "react-dom"

function MyComponent() {
  return (
    <div>
      <button>Hello</button>
    </div>
  )
}

const app = <h1 style={{ color: "teal" }}>Hello React</h1>

ReactDOM.render(app, document.getElementById("root"))
```

</CH.Code>

To create a component you only need to write a function with a name that starts with a capital letter.

---

<CH.Code>

```jsx src/index.js focus=4[10:20],12:17
import React from "react"
import ReactDOM from "react-dom"

function MyComponent() {
  return (
    <div>
      <button>Hello</button>
    </div>
  )
}

const app = (
  <div>
    <MyComponent />
    <MyComponent />
  </div>
)

ReactDOM.render(app, document.getElementById("root"))
```

</CH.Code>

Now you can use that function in JSX.

---

<CH.Code>

```jsx src/index.js focus=14[18:29],15[18:31]
import React from "react"
import ReactDOM from "react-dom"

function MyComponent() {
  return (
    <div>
      <button>Hello</button>
    </div>
  )
}

const app = (
  <div>
    <MyComponent name="Messi" />
    <MyComponent name="Ronaldo" />
  </div>
)

ReactDOM.render(app, document.getElementById("root"))
```

</CH.Code>

You can assign attributes

---

<CH.Code>

```jsx src/index.js focus=4[22:29],14[18:29],15[18:31]
import React from "react"
import ReactDOM from "react-dom"

function MyComponent({ name }) {
  return (
    <div>
      <button>Hello</button>
    </div>
  )
}

const app = (
  <div>
    <MyComponent name="Messi" />
    <MyComponent name="Ronaldo" />
  </div>
)

ReactDOM.render(app, document.getElementById("root"))
```

</CH.Code>

And React will pass them to the component as parameters

---

<CH.Code>

```jsx src/index.js focus=4[22:29],7
import React from "react"
import ReactDOM from "react-dom"

function MyComponent({ name }) {
  return (
    <div>
      <button>{name}</button>
    </div>
  )
}

const app = (
  <div>
    <MyComponent name="Messi" />
    <MyComponent name="Ronaldo" />
  </div>
)

ReactDOM.render(app, document.getElementById("root"))
```

</CH.Code>

Inside JSX, you use curly braces to wrap dynamic data

---

<CH.Code>

```jsx src/index.js focus=5,9
import React from "react"
import ReactDOM from "react-dom"

function MyComponent({ name }) {
  const goalCount = 2
  return (
    <div>
      <button>{name}</button>
      {"⚽".repeat(goalCount)}
    </div>
  )
}

const app = (
  <div>
    <MyComponent name="Messi" />
    <MyComponent name="Ronaldo" />
  </div>
)

ReactDOM.render(app, document.getElementById("root"))
```

</CH.Code>

In fact you can wrap any javascript expression.

---

<CH.Code>

```jsx src/index.js focus=7:9,13[15:35]
import React from "react"
import ReactDOM from "react-dom"

function MyComponent({ name }) {
  const goalCount = 2

  const handleClick = event => {
    // do something
  }

  return (
    <div>
      <button onClick={handleClick}>{name}</button>
      {"⚽".repeat(goalCount)}
    </div>
  )
}

const app = (
  <div>
    <MyComponent name="Messi" />
    <MyComponent name="Ronaldo" />
  </div>
)

ReactDOM.render(app, document.getElementById("root"))
```

</CH.Code>

To add event listeners you pass a function to the corresponding attribute

---

<CH.Code>

```jsx src/index.js focus=5
import React from "react"
import ReactDOM from "react-dom"

function MyComponent({ name }) {
  const [goalCount, setCount] = React.useState(2)

  const handleClick = event => {
    // do something
  }
  return (
    <div>
      <button onClick={handleClick}>{name}</button>
      {"⚽".repeat(goalCount)}
    </div>
  )
}

const app = (
  <div>
    <MyComponent name="Messi" />
    <MyComponent name="Ronaldo" />
  </div>
)

ReactDOM.render(app, document.getElementById("root"))
```

</CH.Code>

To add state to a component there's the useState function from React.

---

<CH.Code>

```jsx src/index.js focus=5,7:9
import React from "react"
import ReactDOM from "react-dom"

function MyComponent({ name }) {
  const [goalCount, setCount] = React.useState(2)

  const handleClick = event => {
    setCount(goalCount + 1)
  }

  return (
    <div>
      <button onClick={handleClick}>{name}</button>
      {"⚽".repeat(goalCount)}
    </div>
  )
}

const app = (
  <div>
    <MyComponent name="Messi" />
    <MyComponent name="Ronaldo" />
  </div>
)

ReactDOM.render(app, document.getElementById("root"))
```

</CH.Code>

It gives you a function to update the state.

---

<CH.Code>

```jsx src/index.js focus=5,7:9,13,14

```

</CH.Code>

When you call it, React will know it needs to re-render the component.

---

<CH.Code>

```jsx src/index.js focus=19
import React from "react"
import ReactDOM from "react-dom"

function MyComponent({ name }) {
  const [goalCount, setCount] = React.useState(2)

  const handleClick = event => {
    setCount(goalCount + 1)
  }

  return (
    <div>
      <button onClick={handleClick}>{name}</button>
      {"⚽".repeat(goalCount)}
    </div>
  )
}

const players = ["Messi", "Ronaldo", "Laspada"]

const app = (
  <div>
    <MyComponent name="Messi" />
    <MyComponent name="Ronaldo" />
  </div>
)

ReactDOM.render(app, document.getElementById("root"))
```

</CH.Code>

To render a list

---

<CH.Code>

```jsx src/index.js focus=19,23[6:34],24,25[1:6]
import React from "react"
import ReactDOM from "react-dom"

function MyComponent({ name }) {
  const [goalCount, setCount] = React.useState(2)

  const handleClick = event => {
    setCount(goalCount + 1)
  }

  return (
    <div>
      <button onClick={handleClick}>{name}</button>
      {"⚽".repeat(goalCount)}
    </div>
  )
}

const players = ["Messi", "Ronaldo", "Laspada"]

const app = (
  <div>
    {players.map(playerName => (
      <MyComponent name={playerName} key={playerName} />
    ))}
  </div>
)

ReactDOM.render(app, document.getElementById("root"))
```

</CH.Code>

you can map each list item to an element using javascript.

---

<CH.Code>

```jsx src/index.js focus=24[38:54]

```

</CH.Code>

React only needs a unique key for each element, to find out when something changes.

---

<CH.Code>

```jsx src/index.js focus=21:27,30,34
import React from "react"
import ReactDOM from "react-dom"

function MyComponent({ name }) {
  const [goalCount, setCount] = React.useState(2)

  const handleClick = event => {
    setCount(goalCount + 1)
  }

  return (
    <div>
      <button onClick={handleClick}>{name}</button>
      {"⚽".repeat(goalCount)}
    </div>
  )
}

const players = ["Messi", "Ronaldo", "Laspada"]

function MyBox() {
  return (
    <div style={{ border: "8px solid deeppink" }}>
      // TODO something
    </div>
  )
}

const app = (
  <MyBox>
    {players.map(playerName => (
      <MyComponent name={playerName} key={playerName} />
    ))}
  </MyBox>
)

ReactDOM.render(app, document.getElementById("root"))
```

</CH.Code>

If you want to compose components together

---

<CH.Code>

```jsx src/index.js focus=21[16:27],24,30:34
import React from "react"
import ReactDOM from "react-dom"

function MyComponent({ name }) {
  const [goalCount, setCount] = React.useState(2)

  const handleClick = event => {
    setCount(goalCount + 1)
  }

  return (
    <div>
      <button onClick={handleClick}>{name}</button>
      {"⚽".repeat(goalCount)}
    </div>
  )
}

const players = ["Messi", "Ronaldo", "Laspada"]

function MyBox({ children }) {
  return (
    <div style={{ border: "8px solid deeppink" }}>
      {children}
    </div>
  )
}

const app = (
  <MyBox>
    {players.map(playerName => (
      <MyComponent name={playerName} key={playerName} />
    ))}
  </MyBox>
)

ReactDOM.render(app, document.getElementById("root"))
```

</CH.Code>

React passes the nested elements inside a special property called children.

</CH.Slideshow>