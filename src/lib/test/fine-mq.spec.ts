/* eslint-disable @typescript-eslint/no-empty-function */
import test, { Macro } from 'ava'
import sinon from 'sinon'

import {
  addAlias,
  createMediaQueryMatchListener,
  getAliasesForMediaQuery,
  getMatchListener,
  getMediaQueryString,
  off,
  on,
  removeAlias,
  removeMediaQueryMatchListener,
  setMatchingAliases,
} from '../fine-mq'
import { MediaQueryMatchListener, Mq } from '../types'

const fakeMatchListener: MediaQueryMatchListener = {
  handlers: [],
  listener: () => {},
  matcher: window.matchMedia(''),
}

const mq: Mq = {
  aliases: {
    an_alias: 'an_mq_value',
    alias2: 'an_mq_value',
  },
  matchers: {
    an_mq_value: fakeMatchListener,
    another_mq_value: fakeMatchListener,
  },
  matchingAliases: {},
}

const getMqStringMacro: Macro<[string, string]> = (t, input, expected) => {
  t.is(getMediaQueryString(mq, input), expected)
}

;[
  ['an_alias', 'an_mq_value'],
  ['non_existant_alias', 'non_existant_alias'],
].forEach(([input, expected], index) => {
  test(
    `${index}. getMediaQueryString returns the value associated to the given alias or returns the alias`,
    getMqStringMacro,
    input,
    expected
  )
})

test(`getAliasesForMediaQuery returns all the associated aliases for a media query`, (t) => {
  const aliases = getAliasesForMediaQuery(mq, 'an_mq_value')
  t.true(aliases.includes('an_alias'))
  t.true(aliases.includes('alias2'))
})

test(`getAliasesForMediaQuery returns an empty array if the media query is not associated to an alias`, (t) => {
  t.deepEqual(getAliasesForMediaQuery(mq, 'noop'), [])
})

test(`getMatchListener returns the associated match listener for an alias or media query`, (t) => {
  t.is(getMatchListener(mq, 'an_alias'), fakeMatchListener)
  t.is(getMatchListener(mq, 'another_mq_value'), fakeMatchListener)
})

test(`getMatchListener returns nothing if no match listener exists for an alias or media query`, (t) => {
  t.falsy(getMatchListener(mq, 'noop'))
})

test(`setMatchingAliases overrides current matching aliases`, (t) => {
  const localMq: Mq = {
    aliases: {},
    matchers: {},
    matchingAliases: {},
  }
  const matchingAliases = { alias1: true, alias2: false }

  t.deepEqual(localMq.matchingAliases, {})
  setMatchingAliases(localMq, matchingAliases)
  t.deepEqual(localMq.matchingAliases, matchingAliases)
})

test(`addAlias registers the given alias`, (t) => {
  const localMq: Mq = {
    aliases: {},
    matchers: {},
    matchingAliases: {},
  }
  addAlias(localMq, 'alias', 'a media query')
  t.true('alias' in localMq.aliases)
  t.is(localMq.aliases.alias, 'a media query')
})

test(`addAlias registers all the given aliases if an object is passed`, (t) => {
  const localMq: Mq = {
    aliases: {},
    matchers: {},
    matchingAliases: {},
  }
  addAlias(localMq, { alias: 'a media query', alias2: 'another media query' })
  t.true('alias' in localMq.aliases)
  t.true('alias2' in localMq.aliases)
  t.is(localMq.aliases.alias, 'a media query')
  t.is(localMq.aliases.alias2, 'another media query')
})

test(`removeAlias unregisters the given alias and remove the associated matcher if any`, (t) => {
  const fakeMatchListener: MediaQueryMatchListener = {
    handlers: [],
    listener: () => {},
    matcher: window.matchMedia(''),
  }
  const localMq: Mq = {
    aliases: {
      alias: 'an_mq_value',
      alias2: 'an_mq_value',
    },
    matchers: {
      an_mq_value: fakeMatchListener,
    },
    matchingAliases: {},
  }
  removeAlias(localMq, 'alias')
  t.false('alias' in localMq.aliases)
  t.false('an_mq_value' in localMq.matchers)
  removeAlias(localMq, 'alias2')
  t.false('alias2' in localMq.aliases)
})

test(`removeAlias does not unregister the matcher associated to the given media query if passing an existing media query instead of an existing alias`, (t) => {
  const fakeMatchListener: MediaQueryMatchListener = {
    handlers: [],
    listener: () => {},
    matcher: window.matchMedia(''),
  }
  const localMq: Mq = {
    aliases: {},
    matchers: {
      an_mq_value: fakeMatchListener,
    },
    matchingAliases: {},
  }
  removeAlias(localMq, 'an_mq_value')
  t.true('an_mq_value' in localMq.matchers)
})

test(`removeMediaQueryMatchListener unregisters the matcher associated to the given alias if any`, (t) => {
  const fakeMatchListener: MediaQueryMatchListener = {
    handlers: [],
    listener: () => {},
    matcher: window.matchMedia(''),
  }
  const localMq: Mq = {
    aliases: {
      alias: 'an_mq_value',
    },
    matchers: {
      an_mq_value: fakeMatchListener,
      another_mq_value: fakeMatchListener,
    },
    matchingAliases: {},
  }
  removeMediaQueryMatchListener(localMq, 'alias')
  t.true('alias' in localMq.aliases)
  t.false('an_mq_value' in localMq.matchers)
  t.true('another_mq_value' in localMq.matchers)
})

test(`removeMediaQueryMatchListener unregisters the matcher associated to the given media query if any`, (t) => {
  const fakeMatchListener: MediaQueryMatchListener = {
    handlers: [],
    listener: () => {},
    matcher: window.matchMedia(''),
  }
  const localMq: Mq = {
    aliases: {},
    matchers: {
      an_mq_value: fakeMatchListener,
      another_mq_value: fakeMatchListener,
    },
    matchingAliases: {},
  }
  removeMediaQueryMatchListener(localMq, 'an_mq_value')
  t.false('an_mq_value' in localMq.matchers)
  t.true('another_mq_value' in localMq.matchers)
})

test('createMediaQueryMatchListener throws if no callback is passed', (t) => {
  const localMq: Mq = {
    aliases: {},
    matchers: {
      an_mq_value: fakeMatchListener,
      another_mq_value: fakeMatchListener,
    },
    matchingAliases: {},
  }
  t.throws(() => createMediaQueryMatchListener(localMq, 'an alias'))
})

test('createMediaQueryMatchListener registers the callback passed as a mq listener to the existing given alias', (t) => {
  const localMq: Mq = {
    aliases: {
      alias: 'an_mq_value',
    },
    matchers: {},
    matchingAliases: {},
  }
  const callback = sinon.fake()
  const spy = sinon.spy(window, 'matchMedia')
  const newMatcher = createMediaQueryMatchListener(localMq, 'alias', callback)
  t.true(spy.calledWith('an_mq_value'))
  t.true(newMatcher.handlers.includes(callback))
  t.true(callback.calledWith({ matches: false, mediaQuery: 'an_mq_value', alias: 'alias' }))
  t.false(localMq.matchingAliases.alias)
  spy.restore()
})

test('createMediaQueryMatchListener registers the callback passed as a mq listener to the given media query', (t) => {
  const localMq: Mq = {
    aliases: {},
    matchers: {},
    matchingAliases: {},
  }
  const callback = sinon.fake()
  const spy = sinon.spy(window, 'matchMedia')
  const newMatcher = createMediaQueryMatchListener(localMq, 'a media query', callback)
  t.true(spy.calledWith('a media query'))
  t.true(newMatcher.handlers.includes(callback))
  t.true(callback.calledWith({ matches: false, mediaQuery: 'a media query', alias: 'a media query' }))
  spy.restore()
})

test('createMediaQueryMatchListener: the match listener updates the matchingAliases when called', (t) => {
  const localMq: Mq = {
    aliases: {
      alias: 'an_mq_value',
    },
    matchers: {},
    matchingAliases: {},
  }
  const callback = sinon.fake()
  t.false('alias' in localMq.matchingAliases)
  const newMatcher = createMediaQueryMatchListener(localMq, 'alias', callback)
  t.false(localMq.matchingAliases.alias)
  newMatcher.listener({ matches: true })
  t.true(callback.calledWith({ matches: true, mediaQuery: 'an_mq_value', alias: 'alias' }))
  t.true(localMq.matchingAliases.alias)
})

test('createMediaQueryMatchListener force registers the media query and matcher', (t) => {
  const localMq: Mq = {
    aliases: {},
    matchers: {},
    matchingAliases: {},
  }
  const callback = sinon.fake()
  const newMatcher = createMediaQueryMatchListener(localMq, 'a media query', callback, true)
  t.true('a media query' in localMq.aliases)
  t.is(localMq.matchers['a media query'], newMatcher)
  t.false(localMq.matchingAliases['a media query'])
})

test('createMediaQueryMatchListener force registers the matcher but not the alias if it already exists', (t) => {
  const localMq: Mq = {
    aliases: {
      alias: 'a media query',
    },
    matchers: {},
    matchingAliases: {},
  }
  const callback = sinon.fake()
  const newMatcher = createMediaQueryMatchListener(localMq, 'alias', callback, true)
  t.false('a media query' in localMq.aliases)
  t.is(localMq.matchers['a media query'], newMatcher)
  t.false(localMq.matchingAliases['alias'])
})

test('on registers the callback passed as a mq listener to the existing given alias', (t) => {
  const localMq: Mq = {
    aliases: {
      alias: 'an_mq_value',
    },
    matchers: {},
    matchingAliases: {},
  }
  const callback = sinon.fake()
  on(localMq, 'alias', callback)
  t.true('an_mq_value' in localMq.matchers)
  t.true(localMq.matchers.an_mq_value.handlers.includes(callback))
})

test('on return a function that unregister the listener', (t) => {
  const localMq: Mq = {
    aliases: {
      alias: 'an_mq_value',
    },
    matchers: {},
    matchingAliases: {},
  }
  const callback = sinon.fake()
  const unregister = on(localMq, 'alias', callback)
  t.true('an_mq_value' in localMq.matchers)
  unregister()
  t.false('an_mq_value' in localMq.matchers)
})

test('off unregisters the listener for the given alias and callback but keeps the other handlers', (t) => {
  const callback = sinon.fake()
  const localMq: Mq = {
    aliases: {
      alias: 'an_mq_value',
    },
    matchers: {
      an_mq_value: {
        handlers: [() => {}, callback],
        listener: () => {},
        matcher: window.matchMedia(''),
      },
    },
    matchingAliases: {},
  }

  const spy = sinon.spy(localMq.matchers.an_mq_value.matcher, 'removeEventListener')
  off(localMq, 'alias', callback)
  t.false(localMq.matchers.an_mq_value.handlers.includes(callback))
  t.is(localMq.matchers.an_mq_value.handlers.length, 1)
  t.is(spy.callCount, 0)
  spy.restore()
})

test('off the matcher for the given alias and callback if no handlers remains', (t) => {
  const callback = sinon.fake()
  const localMq: Mq = {
    aliases: {
      alias: 'an_mq_value',
    },
    matchers: {
      an_mq_value: {
        handlers: [callback],
        listener: () => {},
        matcher: window.matchMedia(''),
      },
    },
    matchingAliases: {},
  }

  const spy = sinon.spy(localMq.matchers.an_mq_value.matcher, 'removeEventListener')
  const listener = localMq.matchers.an_mq_value.listener
  off(localMq, 'alias', callback)
  t.true(spy.calledWith('change', listener))
  t.false('an_mq_value' in localMq.matchers)
  spy.restore()
})

test('off unregisters all handlers for the given alias', (t) => {
  const localMq: Mq = {
    aliases: {
      alias: 'an_mq_value',
    },
    matchers: {
      an_mq_value: {
        handlers: [() => {}, () => {}],
        listener: () => {},
        matcher: window.matchMedia(''),
      },
    },
    matchingAliases: {},
  }

  const spy = sinon.spy(localMq.matchers.an_mq_value.matcher, 'removeEventListener')
  const listener = localMq.matchers.an_mq_value.listener
  off(localMq, 'alias')
  t.false('an_mq_value' in localMq.matchers)
  t.true(spy.calledWith('change', listener))
  spy.restore()
})
