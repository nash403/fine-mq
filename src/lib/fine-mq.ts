/* eslint-disable unicorn/prevent-abbreviations */
import { default as json2mq, QueryObject } from 'json2mq'

export type MediaQueryString = string

export type MediaQueryMatcherHandlerParams = {
  readonly matches: boolean
  readonly mediaQuery: MediaQueryString
  readonly alias: string
}

export type MediaQueryMatcherHandler = (matchedMq: MediaQueryMatcherHandlerParams) => void

export type MediaQueryMatchListener = {
  readonly handlers: MediaQueryMatcherHandler[];
  readonly matcher: MediaQueryList;
  readonly listener: (e: MediaQueryListEvent | { matches: boolean }) => void;
}

export type MediaQueryAliases = {
  [alias: string]: MediaQueryString;
}

export type MediaQueryMatchers = {
  [alias: string]: MediaQueryMatchListener;
}

export type MatchingAliases = {
  [alias: string]: boolean;
}

export type Mq = {
  aliases: MediaQueryAliases
  matchers: MediaQueryMatchers
  matchingAliases: MatchingAliases
}

export type FineMediaQueries = {
  mq: Mq
  setMatchingAliases: (matchingAliases: MatchingAliases) => void
  on: (aliasOrMediaQuery: string, callback: MediaQueryMatcherHandler) => void
  off: (aliasOrMediaQuery?: string, callback?: MediaQueryMatcherHandler) => void
  alias: (alias: string | { [key: string]: MediaQueryString | QueryObject }, mediaQuery?: MediaQueryString | QueryObject) => void
  unalias: (alias: string) => void
}

export const getMediaQueryString = (mq: Mq, aliasOrMediaQuery: string): MediaQueryString => mq.aliases[aliasOrMediaQuery] || aliasOrMediaQuery

export const getMatchListener = (mq: Mq, aliasOrMediaQuery: string): MediaQueryMatchListener => mq.matchers[getMediaQueryString(mq, aliasOrMediaQuery)]

export const setMatchingAliases = (mq: Mq, matchingAliases: MatchingAliases = {}) => mq.matchingAliases = matchingAliases

export const aliases2mq = (aliases: { [key: string]: MediaQueryString | QueryObject }): MediaQueryAliases => {
  const mqAliases: MediaQueryAliases = {}
  for (const [_alias, _mediaQuery] of Object.entries(aliases)) {
    mqAliases[_alias] = json2mq(_mediaQuery as QueryObject)
  }
  return mqAliases
}

export const createNewMediaQueryMatchListener = (mq: Mq, aliasOrMediaQuery: string, callback: MediaQueryMatcherHandler): MediaQueryMatchListener => {
  const mediaQuery = getMediaQueryString(mq, aliasOrMediaQuery)
  if (!mediaQuery) throw new TypeError('A media query string or an existing alias is required in order to create a new match listener')
  if (typeof callback !== 'function') throw new TypeError('The callback function needs to be defined in order to create a new match listener')

  const mqMatcher: MediaQueryMatchListener = {
    handlers: [],
    matcher: window.matchMedia(mediaQuery),
    listener: (e) => {
      if (mq.aliases[aliasOrMediaQuery]) {
          mq.matchingAliases= {
          ...mq.matchingAliases,
          [aliasOrMediaQuery]: e.matches,
        }
      }
      mqMatcher.handlers.forEach(
        handler => handler.call(undefined, {
          matches: e.matches,
          mediaQuery,
          alias: aliasOrMediaQuery
        })
      )
    }
  }

  mqMatcher.handlers.push(callback)
  mqMatcher.listener.call(undefined, { matches: mqMatcher.matcher.matches }) // trigger listener immediately
  mqMatcher.matcher.addEventListener('change', mqMatcher.listener)
  return mqMatcher
}

export const removeMediaQueryMatchListener = (mq: Mq, aliasOrMediaQuery: string): void => {
  const mediaQuery = getMediaQueryString(mq, aliasOrMediaQuery)
  const { [mediaQuery]: mqMatcher, ...otherMatchers } = mq.matchers
  if (mqMatcher) {
    mqMatcher.matcher.removeEventListener('change', mqMatcher.listener)
    mq.matchers = otherMatchers
  }
}

export const on = (mq: Mq, aliasOrMediaQuery: string, callback: MediaQueryMatcherHandler): void => {
  const mediaQuery = getMediaQueryString(mq, aliasOrMediaQuery)
  const mqMatcher = mq.matchers[mediaQuery] || createNewMediaQueryMatchListener(mq, aliasOrMediaQuery, callback)
  mq.matchers = {
    ...mq.matchers,
    [mediaQuery]: mqMatcher,
  }
}

export const off = (mq: Mq, aliasOrMediaQuery?: string, callback?: MediaQueryMatcherHandler): void => {
  if (!aliasOrMediaQuery) {
    // remove all listeners
    Object.keys(mq.matchers).forEach((mediaQuery: MediaQueryString) => removeMediaQueryMatchListener(mq, mediaQuery))
    return
  }

  if (!callback) {
    // remove all handlers for a match listener
    removeMediaQueryMatchListener(mq, aliasOrMediaQuery)
    return
  }

  // remove a particular handler for a match listener
  const mqMatcher = getMatchListener(mq, aliasOrMediaQuery)
  if (mqMatcher) {
    const { handlers } = mqMatcher
    const handlerIndex = handlers.findIndex(handler => handler === callback)
    if (handlerIndex > -1) handlers.splice(handlerIndex, 1)

    // If no more handlers for a match listener
    if (handlers.length === 0) removeMediaQueryMatchListener(mq, aliasOrMediaQuery)
  }
}

export const addAlias = (mq: Mq, alias: string | { [key: string]: MediaQueryString | QueryObject }, mediaQuery?: MediaQueryString | QueryObject): void => {
  if (typeof alias === 'string' && mediaQuery) {
    mq.aliases = {
      ...mq.aliases,
      [alias]: json2mq(mediaQuery as QueryObject),
    }
  } else if (typeof alias !== 'string') {
    mq.aliases = {
      ...mq.aliases,
      ...aliases2mq(alias)
    }
  }
}

export const removeAlias = (mq: Mq, alias: string): void => {
  const mqMatcher = getMatchListener(mq, alias)
  if (mqMatcher) off(mq, alias)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { [alias]: _, ...remainingAliases } = mq.aliases
  mq.aliases = remainingAliases
}

const createFineMediaQueries = (aliases: { [key: string]: MediaQueryString | QueryObject } = {}, defaultMatchedMq: MatchingAliases = {}): FineMediaQueries => {
  const mq: Mq = {
    aliases: aliases2mq(aliases),
    matchingAliases: defaultMatchedMq,
    matchers: {},
  }

  return {
    get mq () {
      return mq
    },
    setMatchingAliases: (matchingAliases: MatchingAliases = {}) => setMatchingAliases(mq, matchingAliases),
    on: (aliasOrMediaQuery: string, callback: MediaQueryMatcherHandler) => on(mq, aliasOrMediaQuery, callback),
    off: (aliasOrMediaQuery?: string, callback?: MediaQueryMatcherHandler) => off(mq, aliasOrMediaQuery, callback),
    alias: (alias: string | { [key: string]: MediaQueryString | QueryObject }, mediaQuery?: MediaQueryString | QueryObject) => addAlias(mq, alias, mediaQuery),
    unalias: (alias: string) => removeAlias(mq, alias),
  }
}

export const FineMqPlugin = {
  install (app: any, options: { aliases?: MediaQueryAliases, defaultMatchingAliases?: MatchingAliases } = {}) {
    let hasSetupListeners = false
    const defaultLastActiveAlias = Object.keys(options.defaultMatchingAliases ?? {})[0]

    const reactiveSource = app.observable({ // replace with app.reactive in the next major version to support vue3
      matchingAliases: {},
      lastActiveAlias: defaultLastActiveAlias,
    })

    const fineMq = createFineMediaQueries(options.aliases, options.defaultMatchingAliases)

    const onMqMatchEvent: MediaQueryMatcherHandler = ({ matches, alias, ...t }) => {
      if (alias in reactiveSource.matchingAliases) {
        reactiveSource.matchingAliases[alias] = matches
      } else {
        reactiveSource.matchingAliases = { ...reactiveSource.matchingAliases, [alias]: matches }
      }
      if (matches) reactiveSource.lastActiveAlias = alias
    }

    app.mixin({
      computed: {
        $mq() {
          return reactiveSource.matchingAliases
        },
        $mqLastActiveAlias() {
          return reactiveSource.lastActiveAlias
        },
      },
      created() {
        if (this.$isServer) {
          reactiveSource.matchingAliases = options.defaultMatchingAliases
          reactiveSource.lastActiveAlias = defaultLastActiveAlias
        }
      },
      mounted() {
        if (!hasSetupListeners) {
          Object.keys(fineMq.mq.aliases).forEach((alias) => fineMq.on(alias, onMqMatchEvent))
          hasSetupListeners = true
        }
      },
    })

    // remove this in the next major version to support vue3
    app.prototype.$fineMq = fineMq

    // uncomment this in the next major version to support vue3
    // app.config.globalProperties.$fineMq = fineMq
  },
}

export default createFineMediaQueries
