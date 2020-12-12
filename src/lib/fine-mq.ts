import { QueryObject } from 'json2mq'

import { aliases2mq, json2mq } from './helpers'
import {
  FineMediaQueries,
  MatchingAliases,
  MediaQueryMatcherHandler,
  MediaQueryMatchListener,
  MediaQueryObject,
  MediaQueryToMatch,
  Mq,
} from './types'

export { aliases2mq, json2mq } from './helpers'
export * from './types'

export const getMediaQueryString = (mq: Mq, aliasOrMediaQuery: string): MediaQueryToMatch =>
  mq.aliases[aliasOrMediaQuery] || aliasOrMediaQuery

export const getAliasesForMediaQuery = (mq: Mq, mediaQuery: string): string[] =>
  Object.entries(mq.aliases)
    .filter(([, mq]) => mq === mediaQuery)
    .map(([alias]) => alias)

export const getMatchListener = (mq: Mq, aliasOrMediaQuery: string): MediaQueryMatchListener =>
  mq.matchers[getMediaQueryString(mq, aliasOrMediaQuery)]

export const setMatchingAliases = (mq: Mq, matchingAliases: MatchingAliases = {}) => (mq.matchingAliases = matchingAliases)

export const createMediaQueryMatchListener = (
  mq: Mq,
  aliasOrMediaQuery: string,
  callback?: MediaQueryMatcherHandler,
  forceRegistration?: boolean
): MediaQueryMatchListener => {
  if (typeof callback !== 'function')
    throw new TypeError('The callback function needs to be defined in order to create a new match listener')

  let mediaQuery = getMediaQueryString(mq, aliasOrMediaQuery)
  if (!mediaQuery) {
    mediaQuery = json2mq(aliasOrMediaQuery)
  }

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

  if (forceRegistration) {
    if (!(aliasOrMediaQuery in mq.aliases)) {
      mq.aliases = { ...mq.aliases, [mediaQuery]: mediaQuery }
    }
    mq.matchers[mediaQuery] = mqMatcher
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

export const on = (mq: Mq, aliasOrMediaQuery: string, callback: MediaQueryMatcherHandler): (() => void) => {
  const mediaQuery = getMediaQueryString(mq, aliasOrMediaQuery)
  const mqMatcher = mq.matchers[mediaQuery] || createMediaQueryMatchListener(mq, aliasOrMediaQuery, callback)
  mq.matchers = {
    ...mq.matchers,
    [mediaQuery]: mqMatcher,
  }

  return () => off(mq, aliasOrMediaQuery, callback)
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
  } // else Trying to register alias "${alias}" with no media query associated. Nothing to do.
}

export const removeAlias = (mq: Mq, alias: string): void => {
  if (!(alias in mq.aliases)) {
    // Trying to unregister inexistant alias "${alias}". Nothing to do.
    return
  }
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
