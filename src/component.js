import toMqString from './to-mq-string'

const component = {
  name: 'MqShow',
  props: {
    if: {
      required: true,
      type: [String, Array, Object] // TODO: in docs: remember that we cannot do for example ['screen', {'min-width': 100 }] we must wrap it in another array
    },
    tag: {
      type: String,
      default: 'DIV'
    }
  },
  data() {
    return {
      localMQAliases: {}
    }
  },
  computed: {
    shouldRenderChildren() {
      return Array.isArray(this.if) ?
        this.if.some(alias => this.getMatchingHolderValue(alias)) :
        this.getMatchingHolderValue(this.if)
    }
  },
  mounted() {
    if (!this.if) return
    const ifs = Array.isArray(this.if) ? this.if : [this.if]

    ifs.forEach(_if => {
      _if = toMqString(_if)
      if (!(_if in this.$mqAliases)) {
        this.$mq.on(_if, this.enter, this)
      }
    })
  },
  methods: {
    enter({
      matcher,
      alias
    }) {
      if (alias in this.localMQAliases) {
        this.localMQAliases[alias] = matcher.matches
      } else {
        this.localMQAliases = { ...this.localMQAliases,
          [alias]: matcher.matches
        }
      }
    },
    getMatchingHolderValue(alias) {
      if (!alias) return false
      alias = toMqString(alias)
      return !!(alias in this.localMQAliases ? this.localMQAliases : this.$mqAliases)[alias]
    }
  },
  render(h) {
    return this.shouldRenderChildren ? h(this.tag, this.$slots.default) : h()
  },
  beforeDestroy() {
    Object.keys(this.localMQAliases).forEach(_if => this.$mq.off(_if, this.enter, this))
  }
}

export default component
