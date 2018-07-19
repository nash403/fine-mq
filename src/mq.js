export default class Mq {
  constructor (aliases = {}) {
    this.aliases = aliases
    this.queries = {}
  }

  alias (alias, query) {
    if (query) {
      return this.aliases[alias] = query
    }
    this.aliases = {
      ...this.aliases,
      ...alias
    }
  }

  unalias (alias) {
    const query = this.queries[this.aliases[alias]]
    if (query) query.mqMatcher
    delete this.aliases[alias]
  }

  on (query, callback, context) {
    context = context || this
    const res = this.queries[this.aliases[query] || query]

    const queryObject = res ? res : {
      handlers: [],
      mqMatcher: window.matchMedia(this.aliases[query] || query)
    }
    queryObject.listener = () => {
      queryObject.handlers.forEach(handler => handler.callback.call(handler.context, queryObject.mqMatcher.matches))
    }
    queryObject.mqMatcher.addListener(queryObject.listener)
    const handler = { callback, context }
    queryObject.handlers.push(handler)
    this.queries[query] = queryObject

    callback.call(context, queryObject.mqMatcher.matches) // initial trigger
  }

  off (query, callback) {
    if (!arguments.length) {
      Object.entries(this.queries).forEach(([key, queryObject]) => {
        this._removeQueryObject(queryObject, key)
      })
    }

    if (!callback) {
      this._removeQueryObject(query)
    }

    const queryObject = this.queries[this.aliases[query] || query]
    if (queryObject) {
      const {handlers} = queryObject
      handlers.forEach((handler, i) => {
        if (handler.callback === callback) handlers.splice(i, 1)
      })
      if (!handlers.length) this._removeQueryObject(query)
    }
  }

  _removeQueryObject (value, query) {
    if (typeof value === 'string') query = value
    query = this.aliases[query] || query
    const queryObject = this.queries[query]
    if (queryObject) {
      queryObject.mqMatcher.removeListener(queryObject.listener)
      delete this.queries[query]
    }
  }
}
