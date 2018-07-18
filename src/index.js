import MqInterface from './mq'
import toMqString from './to-mq-string'
import { aliasesToMqStrings } from './helpers'

const install = (Vue, { breakpoints = {} } = {}) => {
  const queries = aliasesToMqStrings(breakpoints)
  const reactorComponent = new Vue({
    data: () => ({
      queries: {},
    })
  })

  const mq = new MqInterface(queries)
  Object.entrie(mq.aliases).forEach(([alias]) => {
    const callback = qo => Vue.set(reactorComponent.$data.queries, alias, qo.mql.matches)
    mq.on(alias, callback)
  })

  Vue.directive('mdqIf', {
    bind (el, {value:alias}, vnode) {
      mq.on(alias, qo => {
        if (qo.mql.matches) vnode.elm.parentElement.removeChild(vnode.elm)
      })
    },
    inserted (el, {value:alias}, vnode) {
      if (reactorComponent.$data.queries[alias] && reactorComponent.$data.queries[alias].mql.matches) {
        vnode.elm.parentElement.removeChild(vnode.elm)
      }
    },
    update (el, {value:alias}, vnode) {
      if (reactorComponent.$data.queries[alias] && reactorComponent.$data.queries[alias].mql.matches) {
        vnode.elm.parentElement.removeChild(vnode.elm)
      }
    }
  })

}

export default { install, MqInterface, toMqString }
