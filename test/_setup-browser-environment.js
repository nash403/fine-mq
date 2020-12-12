/* eslint-disable @typescript-eslint/no-var-requires, unicorn/no-null, @typescript-eslint/no-empty-function, no-undef */
const browserEnv = require('browser-env')
browserEnv()

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
})
