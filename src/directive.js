import toMqString from './to-mq-string'

export default {
  name: 'mq-show-if',
  bind (el, {value:alias}, {context:vm}) {
    if (!alias) return
    const ifs = Array.isArray(alias) ? alias : [alias]

    ifs.forEach(_if => {
      _if = toMqString(_if)
      if (!(_if in vm.$mqAliases)) {
        vm.$mq.on(_if, enter, el)
      }
    })
  },
  inserted: handleUpdate,
  updated: handleUpdate,
  componentUpdated: handleUpdate,
  unbind (el, {value:alias}, {context:vm}) {
    (Array.isArray(alias) ? alias : [alias]).forEach(a => {
      a = toMqString(a); // eslint-disable-line
      !(a in vm.$mqAliases) && vm.off(a, enter, el)
    })
  }
}

function handleUpdate (el, {value:alias}, {context:vm}) {
  const matches = (Array.isArray(alias) ? alias : [alias]).some(a => getMatchingHolderValue.call(vm, a))
  toggle(el, matches)
}

function getMatchingHolderValue (alias) {
  if (!alias) return false
  alias = toMqString(alias)
  if (alias in this.$mqAliases) return !!this.$mqAliases[alias]
  const q = this.$mq.aliases[alias] || alias
  return this.$mq.queries[q] ? this.$mq.queries[q].mqMatcher.matches : false
}

function enter ({matcher}) {
  toggle(this, matcher.matches)
}

function toggle (el, value) {
  if (!value) el.style.display = 'none'
  else el.style.display = ''
}
