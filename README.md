# fine-mq

> A fine API to use media queries in JS with ease and with first-class integration with Vue.js/Nuxt.js.

Read the doc [here](https://nash403.github.io/fine-mq/).

```sh
# Install using NPM or Yarn:
npm i --save fine-mq
# or
yarn add fine-mq
```

## Usage

### In JS

```js
import { createFineMediaQueries }  from 'fine-mq'

const mq = createFineMediaQueries({
  // Fine Mq supports modifiers for sizes shortcuts  (see below for examples)
  sm: 680, // <=> [0, 680]
  md: [681, 1024],
  lg: [1025], // <=> [1025, Infinity]
  landscape: '(orientation: landscape)',
  custom1: 'only screen and (max-width: 480px)',
  custom2: 'only screen and (min-width: 480px) and (max-width: 720px)',
  an_alias_object: {
    screen: true,
    minWidth: '23em',
    maxWidth: '768px'
  }
})

// => This example will register the following aliases:
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

// !: means «current and above»
// +: means «above»

const defaultColor = '#FFF'

const changeColor = color => ({ matches, mediaQuery, alias }) => {
  document.body.style.backgroundColor = matches ? color : defaultColor
}

mq.on('small', changeColor('blue'))
mq.on('medium', changeColor('green'))
mq.on({
  screen: true,
  maxWidth: '1200px'
}, changeColor('cyan'))
mq.on('only screen and (min-width: 720px)', changeColor('red'))
mq.off('only screen and (min-width: 720px)')
```

_**NOTE 1:**_ Absurd modifiers will not be created for  (ex: when the lower bound is _0_, there is no need for the «!» modifier, or if the upper bound is _Infinity_, there is no need for both «!» and «+» modifiers).

_**NOTE 2:**_ If you specify the unit for your size (`px`, `em`, `rem`), the `+ 1` operation will not be performed for modifiers.

See [FineMq](#finemq-api) for details about the API.

### As a Vue plugin

```js
import { FineMqPlugin } from 'fine-mq'


// Define your aliases as plugin options (defaults to `{ sm: 680, md: [681, 1024], lg: [1025] }` for Vue.js only, not the JS API)
Vue.use(FineMqPlugin, {
  aliases: {
    sm: 680, // <=> [0, 680], can also be a size in px, em or rem
    md: [681, 1024],
    lg: [1025], // <=> [1025, Infinity]
    landscape: '(orientation: landscape)',
    an_alias_name: {
      screen: true,
      minWidth: '23em',
      maxWidth: '768px'
    }
  }
  // Define the default values for your matching aliases for SSR
  defaultMatchedMediaQueries: {
    sm: false,
    md: false,
    lg: true,
  }
})

// Three reactive properties will then be available on Vue instances:
// - `$mq` is an object that contains the matching state for each alias in the form { [alias]: true/false }.
// - `$lastActiveAlias` will contain the last alias that was matched and triggered by the listener.
// - `$fineMq` is a FineMq instance for advanced usages.
```

### With Nuxt.js

```js
// In your nuxt.config.js
export default {
  // ...
  
  // Build Configuration (https://go.nuxtjs.dev/config-build)
  build: {
    transpile: ['fine-mq'],
  },
  
  modules: ['fine-mq/nuxt'],

  // Pass options here
  fineMq: {
    defaultMatchingAliases: {
      md: true,
    },
    aliases: {
      sm: 640,
      md: [641, 768],
      lg: [769, 1024],
      xl: [1025, 1280],
      '2xl': [1281],
    },
  },

  // ...
}
```

## FineMq API

### const mq = createFineMediaQueries(aliases, defaultMatchedMediaQueries)

Initialize helpers for your media query aliases. Other aliases can be registered afterwards.

`defaultMatchedMediaQueries` is for universal apps that need default values on SSR.

### mq.addAlias(alias[, query]) / mq.removeAlias(alias)

Register an `alias` for a `query`, or register multiple aliases at once by passing an object.

```js
mq.addAlias('small', '(max-width: 100px)')
mq.addAlias({
  small: '(max-width: 100px)',
  medium: {
    screen: true,
    maxWidth: 200
  },
})
```

Then you can unregister previously registered aliases with `mq.removeAlias(alias)`.

### mq.on(query, callback)

Register a `callback` which will be executed everytime the match state (true/false) for a query or alias changes.

```js
// `alias` is the given alias, mediaQuery is the actual media query matched and `matches` is a boolean indicating the match state.
mq.on('(max-width: 400px)', ({ matches, alias, mediaQuery }) => {})
mq.on('smartphones', ({ matches, alias, mediaQuery }) => {}, {})
```

### mq.off(query, callback)

Remove all handlers for all media queries:

```js
mq.off()
```

Remove all handlers for a media query or alias:

```js
mq.off('(max-width: 400px)')
mq.off('small')
```

Remove a specific handler for a query or alias:

```js
mq.off('(max-width: 400px)', myHandler)
mq.off('small', myHandler)
```

## Browser Support

This library relies on matchMedia API to detect screensize change. You can use a polyfill if you need this package to work for older browsers. Check this out:
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
