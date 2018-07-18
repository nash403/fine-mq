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
    delete this.aliases[alias]
    return this
  }

  on (query, callback, context) {
    const res = this.queries[this.aliases[query] || query]

    const queryObject = res ? res : {
      handlers: [],
      mql: window.matchMedia(query)
    }
    queryObject.listener = () => {
      if (queryObject.mql.matches) {
        queryObject.handlers.forEach(handler => handler.callback.call(handler.context))
      }
    }
    queryObject.mql.addListener(queryObject.listener)
    const handler = { callback, context: context || this }
    queryObject.handlers.push(handler)
    this.queries[query] = queryObject

    if (queryObject.mql.matches) callback.call(context || this)
    return this
  }

  off (query, callback) {
    if (!arguments.length) {
      Object.entries(this.queries).forEach(([queryObject, key]) => {
        this._removeQueryObject(queryObject, key)
      })
      return this
    }

    if (!callback) {
      this._removeQueryObject(query)
      return this
    }

    const queryObject = this.queries[this.aliases[query] || query]
    if (queryObject) {
      const {handlers} = queryObject
      handlers.forEach((handler, i) => {
        if (handler.callback === callback) handlers.splice(i, 1)
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
      queryObject.mql.removeListener(queryObject.listener)
      delete this.queries[query]
    }
  }
}
