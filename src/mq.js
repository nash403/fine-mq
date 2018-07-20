export default class Mq {
  constructor (aliases = {}) {
    this.aliases = aliases
    this.queries = {}
  }

  alias (alias, query) {
    if (query) {
      this.aliases[alias] = query
      return this
    }
    this.aliases = {
      ...this.aliases,
      ...alias
    }
    return this
  }

  unalias (alias) {
    const query = this.queries[this.aliases[alias]]
    if (query) query.mqMatcher
    delete this.aliases[alias]
    return this
  }

  on (query, callback, context) {
    context = context || this
    const res = this.queries[this.aliases[query] || query]
    const queryObject = res ? res : {
      handlers: [],
      mqMatcher: window.matchMedia(this.aliases[query] || query)
    }

    queryObject.listener = () => {
      queryObject.handlers.forEach(
        handler => handler.callback.call(handler.context, {
          matcher: queryObject.mqMatcher,
          alias: query
        })
      )
    }
    queryObject.mqMatcher.addListener(queryObject.listener)

    const handler = { callback, context }
    queryObject.handlers.push(handler)
    this.queries[query] = queryObject

    callback.call(context, {matcher: queryObject.mqMatcher, alias: query}) // initial trigger
    return this
  }

  off (query, callback, context) {
    if (!arguments.length) {
      // remove all listeners
      Object.entries(this.queries).forEach(([key, queryObject]) => {
        this._removeQueryObject(queryObject, key)
      })
      return this
    }

    if (!callback) {
      // remove all listeners for a query
      this._removeQueryObject(query)
      return this
    }

    // remove a particular listener for a query
    const queryObject = this.queries[this.aliases[query] || query]
    if (queryObject) {
      const {handlers} = queryObject
      handlers.forEach((handler, i) => {
        let match = handler.callback === callback
        if (match && context) match = handler.context === context
        if (match) handlers.splice(i, 1)
      })
      if (!handlers.length) this._removeQueryObject(query)
    }
    return this
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
