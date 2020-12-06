import { QueryObject } from 'json2mq'

import { aliases2mq, json2mq } from './helpers'
import {
  FineMediaQueries,
  MatchingAliases,
  MediaQueryAliases,
  MediaQueryMatcherHandler,
  MediaQueryMatchListener,
  MediaQueryObject,
  MediaQueryToMatch,
  Mq,
} from './types'

export { aliases2mq, json2mq } from './helpers'

export const getMediaQueryString = (mq: Mq, aliasOrMediaQuery: string): MediaQueryToMatch =>
  mq.aliases[aliasOrMediaQuery] || aliasOrMediaQuery

export const getAliasesForMediaQuery = (mq: Mq, mediaQuery: string): string[] =>
  Object.entries(mq.aliases)
    .filter(([, mq]) => mq === mediaQuery)
    .map(([alias]) => alias)

export const getMatchListener = (mq: Mq, aliasOrMediaQuery: string): MediaQueryMatchListener =>
  mq.matchers[getMediaQueryString(mq, aliasOrMediaQuery)]

export const setMatchingAliases = (mq: Mq, matchingAliases: MatchingAliases = {}) => (mq.matchingAliases = matchingAliases)

export const createNewMediaQueryMatchListener = (
  mq: Mq,
  aliasOrMediaQuery: string,
  callback: MediaQueryMatcherHandler
): MediaQueryMatchListener => {
  let mediaQuery = getMediaQueryString(mq, aliasOrMediaQuery)
  if (!mediaQuery) {
    mediaQuery = json2mq(aliasOrMediaQuery)
  }
  if (typeof callback !== 'function')
    throw new TypeError('The callback function needs to be defined in order to create a new match listener')

  const mqMatcher: MediaQueryMatchListener = {
    handlers: [],
    matcher: window.matchMedia(mediaQuery),
    listener: (event) => {
      const aliases = getAliasesForMediaQuery(mq, mediaQuery)
      if (aliases.length > 0) {
        const matchingAliases: MatchingAliases = {}
        for (const alias of aliases) {
          matchingAliases[alias] = event.matches
        }

        mq.matchingAliases = {
          ...mq.matchingAliases,
          ...matchingAliases,
        }
      }

      mqMatcher.handlers.forEach((handler) =>
        handler.call(undefined, {
          matches: event.matches,
          mediaQuery,
          alias: aliasOrMediaQuery,
        })
      )
    },
  }

  mqMatcher.handlers.push(callback)
  mqMatcher.listener.call(undefined, { matches: mqMatcher.matcher.matches, mediaQuery, alias: aliasOrMediaQuery }) // trigger listener immediately
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
    Object.keys(mq.matchers).forEach((mediaQuery: MediaQueryToMatch) => removeMediaQueryMatchListener(mq, mediaQuery))
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
    const handlerIndex = handlers.findIndex((handler) => handler === callback)
    if (handlerIndex > -1) handlers.splice(handlerIndex, 1)

    // If no more handlers for a match listener
    if (handlers.length === 0) removeMediaQueryMatchListener(mq, aliasOrMediaQuery)
  }
}

export const addAlias = (mq: Mq, alias: string | { [key: string]: MediaQueryObject }, mediaQuery?: MediaQueryObject): void => {
  if (typeof alias === 'string' && mediaQuery) {
    mq.aliases = {
      ...mq.aliases,
      ...aliases2mq({ [alias]: mediaQuery }),
    }
  } else if (typeof alias !== 'string') {
    mq.aliases = {
      ...mq.aliases,
      ...aliases2mq(alias),
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

export const createFineMediaQueries = (
  aliases: { [key: string]: MediaQueryObject } = {},
  defaultMatchedMq: MatchingAliases = {}
): FineMediaQueries => {
  const mq: Mq = {
    aliases: aliases2mq(aliases),
    matchingAliases: defaultMatchedMq,
    matchers: {},
  }

  return {
    get mq() {
      return mq
    },
    setMatchingAliases: (matchingAliases: MatchingAliases = {}) => setMatchingAliases(mq, matchingAliases),
    on: (aliasOrMediaQuery: string, callback: MediaQueryMatcherHandler) => on(mq, aliasOrMediaQuery, callback),
    off: (aliasOrMediaQuery?: string, callback?: MediaQueryMatcherHandler) => off(mq, aliasOrMediaQuery, callback),
    addAlias: (alias: string | { [key: string]: MediaQueryObject }, mediaQuery?: MediaQueryToMatch | QueryObject) =>
      addAlias(mq, alias, mediaQuery),
    removeAlias: (alias: string) => removeAlias(mq, alias),
  }
}

export const FineMqPlugin = {
  install(app: any, options: { aliases?: MediaQueryAliases; defaultMatchingAliases?: MatchingAliases } = {}) {
    let hasSetupListeners = false
    const defaultLastActiveAlias = Object.keys(options.defaultMatchingAliases ?? {})[0]

    const reactiveSource = app.observable({
      // replace with app.reactive in the next major version to support vue3
      matchingAliases: {},
      lastActiveAlias: defaultLastActiveAlias,
    })

    const fineMq = createFineMediaQueries(
      options.aliases || { sm: 680, md: [681, 1024], lg: [1025] },
      options.defaultMatchingAliases
    )

    const onMqMatchEvent: MediaQueryMatcherHandler = ({ matches, alias, mediaQuery }) => {
      const aliases = getAliasesForMediaQuery(fineMq.mq, mediaQuery)
      const matchingAliases: MatchingAliases = {}
      for (const _alias of aliases) {
        matchingAliases[_alias] = matches
      }
      reactiveSource.matchingAliases = { ...reactiveSource.matchingAliases, ...matchingAliases }
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
