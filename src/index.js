import Mq from './mq'
import toMqString from './to-mq-string'
import { aliasesToMqStrings } from './helpers'
import MqShowComponent from './component'
import MqShowDirective from './directive'

const install = (Vue, { breakpoints } = {}) => {
  const queries = aliasesToMqStrings(breakpoints)
  const reactiveSource = new Vue({
    data: () => ({
      matchingQueries: {},
      lastActiveAlias: null
    })
  })

  const mq = new Mq(queries)
  Object.keys(mq.aliases).forEach(alias => {
    const enter = ({matcher}) => {
      if (alias in reactiveSource.matchingQueries) {
        reactiveSource.matchingQueries[alias] = matcher.matches
      } else {
        reactiveSource.matchingQueries = {...reactiveSource.matchingQueries, [alias]: matcher.matches}
      }
      if (matcher.matches) reactiveSource.lastActiveAlias = alias
    }
    mq.on(alias, enter)
  })

  Vue.mixin({
    computed: {
      $mqAliases () {
        return reactiveSource.matchingQueries
      },
      $lastActiveMQAlias () {
        return reactiveSource.lastActiveAlias
      }
    }
  })

  Vue.prototype.$mq = mq

  Vue.component(MqShowComponent.name, MqShowComponent)
  Vue.directive(MqShowDirective.name, MqShowDirective)
}

export default { install, Mq, toMqString }
