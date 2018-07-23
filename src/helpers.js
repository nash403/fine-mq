import toMqStr from './to-mq-string'

const DEFAULT_ALIASES = {
  sm: 450,
  md: [451, 1250],
  lg: [1251]
}

const toMqValue = v => (Number.isFinite(+v) ? `${+v}px` : v)

const isUnitValue = v => Number.isFinite(+v) || (typeof v === 'string' && ['px', 'em'].includes(v.slice(-2)))

export const isDimension = v =>
  (Array.isArray(v) && v.length && v.length < 3 && v.every(_v => _v === Infinity || isUnitValue(_v))) || isUnitValue(v)

export const extractModifiers = (alias, [lower, upper]) => {
  let modifiers = {}
  if (lower !== '0px' && lower !== '0em' && upper !== Infinity && typeof upper !== 'undefined')
    modifiers[`${alias}!`] = toMqStr({
      minWidth: lower
    })
  if (upper !== Infinity && typeof upper !== 'undefined')
    modifiers[`${alias}+`] = toMqStr({
      minWidth: upper
    })
  return modifiers
}

export function aliasesToMqStrings(aliases = DEFAULT_ALIASES) {
  if (!aliases && typeof aliases !== 'undefined') return {}
  return Object.entries(aliases).reduce((association, [alias, bounds]) => {
    const isDim = isDimension(bounds)
    if (isDim) {
      if (Array.isArray(bounds) && bounds.length === 1) bounds.push(Infinity)

      const lower = Array.isArray(bounds) ? toMqValue(bounds[0]) : '0px'
      const _ubound = Array.isArray(bounds) ? bounds[1] : bounds
      const upper = {
        '!': toMqValue(_ubound),
        '+': Number.isFinite(+_ubound) ? toMqValue(+_ubound + 1) : _ubound
      }
      const mqObject = {}
      if (lower !== '0px') mqObject.minWidth = lower
      if (upper['!'] !== Infinity) mqObject.maxWidth = upper['!']

      association = Object.assign(
        association,
        {
          [alias]: toMqStr(mqObject)
        },
        extractModifiers(alias, [lower, upper['+']])
      )
    } else {
      association[alias] = toMqStr(bounds)
    }
    return association
  }, {})
}
