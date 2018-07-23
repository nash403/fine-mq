# fine-mq

> A fine API to manage media queries in JS with ease. It has first-class integration with VueJS.

**Demo**: [here](https://nash403.github.io/fine-mq)

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
  - [Vue Plugin](#vue-plugin)
  - [Mq](#mq-api)
  - [toMqString](#tomqstring)
- [Browser Support](#browser-support)
- [Credits](#credits)
- [Contributions](#contributing)

## Installation

- Using NPM/Yarn

```sh
npm i fine-mq
# or
yarn add fine-mq
```

- Using unpkg.com

```html
<script src="https://unpkg.com/fine-mq/dist/fine-mq.min.js"></script>
```

This main file exposes a `install` function (Vue plugin), a `Mq` class and `toMqString` function.

These are all the builds available via unpkg:

* [`https://unpkg.com/fine-mq/dist/fine-mq.min.js`](https://unpkg.com/fine-mq/dist/fine-mq.min.js) (umd)
* [`https://unpkg.com/fine-mq/dist/fine-mq.cjs.js`](https://unpkg.com/fine-mq/dist/fine-mq.cjs.js) (commonjs)
* [`https://unpkg.com/fine-mq/dist/fine-mq.es.js`](https://unpkg.com/fine-mq/dist/fine-mq.es.js) (es module)
* [`https://unpkg.com/fine-mq/dist/mq.min.js`](https://unpkg.com/fine-mq/dist/mq.min.js) (umd)
* [`https://unpkg.com/fine-mq/dist/mq.cjs.js`](https://unpkg.com/fine-mq/dist/mq.cjs.js) (commonjs)
* [`https://unpkg.com/fine-mq/dist/mq.es.js`](https://unpkg.com/fine-mq/dist/mq.es.js) (es module)
* [`https://unpkg.com/fine-mq/dist/to-mq-string.min.js`](https://unpkg.com/fine-mq/dist/to-mq-string.min.js) (umd)
* [`https://unpkg.com/fine-mq/dist/to-mq-string.cjs.js`](https://unpkg.com/fine-mq/dist/to-mq-string.cjs.j) (commonjs)
* [`https://unpkg.com/fine-mq/dist/to-mq-string.es.js`](https://unpkg.com/fine-mq/dist/to-mq-string.es.js) (es module)



## Usage

This package is a set of three libs.
* A vue plugin that exposes useful properties on vue instances, a component and a directive. This lib includes the two others. (`FineMq`)
* A media query interface that lets you add/remove aliases to media queries, register/unregister handlers that listen to matching state of a media query or alias. (`Mq`)
* A lib that exposes a single function that helps you transorm a media query written as a JavaScript object to its string value. (`toMqString`)

### Vue plugin

Define your breakpoints and/or aliases to media queries and start using them with Vue.

```js
import Vue from 'vue'
import FineMq from 'fine-mq'
import App from './App'

// Define your aliases
// NOTE: any size can be expressed as a number, anything that can be casted to a finite number, Infinity, or a size in 'px' or 'em' unit.

Vue.use(FineMq, {
  aliases: {
    sm: 680, // <=> [0, 680]
    md: [681, 1024],
    lg: [1025], // <=> [1025, Infinity]
    landscape: '(orientation: landscape)',
    an_alias_name: {
      screen: true,
      minWidth: '23em',
      maxWidth: '768px'
    }
  }
})
// or just Vue.use(FineMq). By default aliases are { sm: 680, md: [681, 1024], lg: [1025] }

// => This will register the following aliases:
// {
//   sm: '(max-width: 680px)',
//   'sm+': '(min-width: 681px)',
//   md: '(min-width: 681px) and (max-width: 1024px)',
//   'md+': '(min-width: 1025px)',
//   'md!': '(min-width: 681px)',
//   lg: '(min-width: 1025px)',
//   landscape: '(orientation: landscape)',
//   an_alias_name: 'screen and (min-width: 380px) and (max-width: 768px)'
// }

// Three reactive properties will then be available on Vue instances:
// - `$mqAliases` is an object that contains the matching state for each alias in the form { [alias]: true/false }.
// - `$lastActiveMQAlias` will contains the last alias that matched and triggered the listener.
// - `$mq` is a Mq instance. See below.

```

**NOTE 1:** Absurd modifiers will not be created (ex: when the lower bound is _0_, there is no need for the «!» modifier, or if the upper bound is _Infinity_, there is no need for both «!» and «+» modifiers).

**NOTE 2:** If you specify the unit for your size, the `+ 1` operation will not be performed.

Then in your templates, you can use the globally defined `MqShow` component or `v-mq-show-if` directive.


- The `MqShow` component facilitate conditional rendering with media queries. It renders its content only when one fo the given media queries matches. _Cons:_ **If the slot content has multiple root nodes**, they will be wrapped by a DIV tag but you can customize the wrapper tag to render with the `tag` prop.

The `if` prop if required and can be a String/Array/Object. Modifiers are also supported (for both the component and the directive) by appending it at the end of the alias («+» for greater breakpoints, «!» for current AND greater breakpoints).

```html
<MqShow if="sm">
  <!-- slot ...-->
</MqShow>

<!-- or -->
<MqShow if="only screen and (min-width: 200px)"> <!-- any valid media query works -->
  <!-- slot ... -->
</MqShow>

<!-- or -->
<MqShow if="md+"> <!-- The `+` modifier here means «above md» -->
  <!-- slot ... -->
</MqShow>

<!-- or -->
<MqShow if="md!"> <!-- The `!` modifier here means «md AND above md» -->
  <!-- slot ... -->
</MqShow>

<!-- or -->
<MqShow :if="['sm', 'md+']"> <!-- array of aliases (with or without modifier) or valid media queries -->
  <!-- slot ... -->
</MqShow>

<!-- or -->
<MqShow :if="{orientation: 'landscape'}"> <!-- object notation is also supported -->
  <!-- slot ... -->
</MqShow>

<!-- or -->
<MqShow if="an_alias_name">
  <!-- slot ... -->
</MqShow>
```

- The `v-mq-show-if` directive sets the display property of the bound element's style to `'none'` only when none of the given media queries matches. _Cons:_ The rendered element will still appear in the DOM tree even if not displayed. Usage is the same as for the component.

```html
<div v-mq-show-if="'sm'">...</div>

<!-- or -->
<div v-mq-show-if="'only screen and (min-width: 200px)'">...</div>

<!-- or -->
<div v-mq-show-if="'md+'">...</div>

<!-- or -->
<div v-mq-show-if="'md!'">...</div>

<!-- or -->
<div v-mq-show-if="['sm', 'md+']">...</div>

<!-- or -->
<div v-mq-show-if="{orientation: 'landscape'}">...</div>

<!-- or -->
<div v-mq-show-if="'an_alias_name'">...</div>
```

### `Mq` API

The `Mq` class exposes a fine API that lets you handle media query changes on your page on the JavaScript side.

#### Usage example

```js
import Mq from 'fine-mq/dist/mq'

const mq = new Mq({
  small: 'only screen and (max-width: 480px)',
  medium: 'only screen and (min-width: 480px) and (max-width: 720px)'
})

const defaultColor = '#FFF'

const changeColor = color => ({matcher, alias}) => {
  document.body.style.backgroundColor = matcher.mathces ? color : defaultColor
}

mq.on('small', changeColor('blue'))
mq.on('medium', changeColor('green'))
mq.on('only screen and (min-width: 720px)', changeColor('red'))
```

#### API description

##### const mq = new Mq(aliases)

Initialise a new `Mq`. Aliases can be registered afterwards.

##### mq.alias(alias[, query]) / mq.unalias(alias)

Register an `alias` for a `query`, or register multiple aliases at once via an object.

```js
mq.alias('small', '(max-width: 100px)')
mq.alias({
  small: '(max-width: 100px)',
  medium: '(max-width: 200px)'
})
```

Then you can unregister previously registered aliases with `mq.unalias(alias)`.

##### mq.on(query, callback, context)

Register a `callback` which will be executed with the given `context` everytime the match state (true/false) for a query or alias. If `context` is not specified, it will default to the `mq` instance.

```js
// `alias` is the given alias or query and `matcher` is the matchMedia object for that query.
mq.on('(max-width: 400px)', ({matcher, alias}) => {})
mq.on('smartphones', ({matcher, alias}) => {}, {})
```

##### mq.off(query, callback, context)

Remove all callbacks for all queries:

```js
mq.off()
```

Remove all callbacks for a `query` or alias:

```js
mq.off('(max-width: 400px)')
```

Remove a specific `callback` for a `query` or alias:

```js
mq.off('(max-width: 400px)', () => {})
```

Remove a specific `callback` with a specific `context` for a `query` or alias:

```js
mq.off('(max-width: 400px)', () => {}, {})
```

**_Tip:_** All methods (`alias`, `unalias`, `on` and `off`) return `this` so that you can chain them.

**NOTE:** The Mq class is written independantly from `toMqString` meaning that the object-style notation for queries is not supported here.

### `toMqString`

This function can generate a valid media query string from a javascript object.

#### Usage example

```javascript
import toMqString from 'fine-mq/dist/to-mq-string'

toMqString({minWidth: 100, maxWidth: 200});
// -> '(min-width: 100px) and (max-width: 200px)'
```

##### Media type
```javascript
toMqString({screen: true});  // -> 'screen'
```
##### Media type with negation
```javascript
toMqString({handheld: false});  // -> 'not handheld'
```

##### Media features can be specified in camel case
```javascript
toMqString({minWidth: 100, maxWidth: 200});
// -> '(min-width: 100px) and (max-width: 200px)'
```
##### px is added to numeric dimension values
```javascript
toMqString({minWidth: 100, maxWidth: '20em'});
// -> '(min-width: 100px) and (max-width: 20em)'
```
##### Multiple media queries can be passed as an array
```javascript
toMqString([{screen: true, minWidth: 100}, {handheld: true, orientation: 'landscape'}]);
// -> 'screen and (min-width: 100px), handheld and (orientation: landscape)'
```

**NOTE:** When passing an array to the Vue component/directive and you want it to be considered as one media query like in the last example, remember to wrap it in another array like this: `[[{screen: true, minWidth: 100}, {handheld: true, orientation: 'landscape'}]]` (that will register a single listener for 'screen and (min-width: 100px), handheld and (orientation: landscape)' instead of multiple listeners, one for 'screen and (min-width: 100px)' and another for 'handheld and (orientation: landscape)' )

## Browser Support
This plugin relies on matchMedia API to detect screensize change. You can use a polyfill if you need this package to work for older browsers. Check this out:
Paul Irish: [matchMedia polyfill](https://github.com/paulirish/matchMedia.js)

## Credits

This package is highly inspired by the work made on other packages (links below), I just shamelessly copied their work and combined them !

- [media-query-facade](https://github.com/tanem/media-query-facade) by @tanem
- [vue-mq](https://github.com/AlexandreBonaventure/vue-mq/) by @AlexandreBonaventure
- [json2mq](https://github.com/akiran/json2mq) by @akiran

## Contributing

Please [open an issue](https://github.com/nash403/fine-mq/issues/new) for support. Thanks in advance for any kind of contribution !

1. Fork it!
2. Create your feature branch: git checkout -b my-new-feature
3. Commit your changes: git commit -am 'Add some feature'
4. Push to the branch: git push origin my-new-feature
5. Submit a pull request :D

## TODO

- [ ] add demo on a `gh-pages` branch
- [ ] add tests for destroy/unbind hooks

