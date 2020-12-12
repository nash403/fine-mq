import { createFineMediaQueries, getAliasesForMediaQuery } from '../lib/fine-mq'
import { MatchingAliases, MediaQueryAliases, MediaQueryMatcherHandler } from '../lib/types'

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
