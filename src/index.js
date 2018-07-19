import Mq from './mq'
import toMqString from './to-mq-string'
import { aliasesToMqStrings } from './helpers'

const install = (Vue, { breakpoints } = {}) => {
  const queries = aliasesToMqStrings(breakpoints)
  const reactiveSource = new Vue({
    data: () => ({
      matchingQueries: {},
      lastActiveQuery: null
    })
  })

  const mq = new Mq(queries)
  Object.keys(mq.aliases).forEach(alias => {
    const enter = matches => {
      if (alias in reactiveSource.matchingQueries) {
        reactiveSource.matchingQueries[alias] = matches
      } else {
        reactiveSource.matchingQueries = {...reactiveSource.matchingQueries, [alias]: matches}
      }
      if (matches) reactiveSource.lastActiveQuery = alias
    }
    mq.on(alias, enter)
  })

  Vue.mixin({
    computed: {
      $matchingMQs () {
        return reactiveSource.matchingQueries
      },
      $lastActiveMQ () {
        return reactiveSource.lastActiveQuery
      }
    }
  })

  Vue.prototype.$mq = mq
}

export default { install, Mq, toMqString }
