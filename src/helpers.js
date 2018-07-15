import toMq from './to-mq-string'

const toMqValue = v => Number.isFinite(+v) ? `${+v}px` : v

const isDimension = v => Array.isArray(v) ||
  Number.isFinite(+v) ||
  (typeof v === 'string' && ['px', 'em'].includes(v.slice(-2)))

const extractModifiers = (alias, [lower, upper]) =>  {
  let modifiers = {}
  if (lower !== '0px' && upper !== Infinity && typeof upper !== 'undefined') modifiers[`${alias}!`] = toMq({
    minWidth: lower
  })
  if (upper !== Infinity && typeof upper !== 'undefined') modifiers[`${alias}+`] = toMq({
    minWidth: upper
  })
  return modifiers
}

export function aliasesToMqStrings(aliases = {
  sm: 450,
  md: [451, 1250],
  lg: [1251]
}) {
  return Object.entries(aliases).reduce((association, [alias, bounds]) => {
    const isDim = isDimension(bounds)
    if (isDim) {
      if (Array.isArray(bounds) && bounds.length === 1) bounds.push(Infinity)

      const lower = Array.isArray(bounds) ? toMqValue(bounds[0]) : '0px'
      const upper = Array.isArray(bounds) ? {
        '!': toMqValue(bounds[1]),
        '+': Number.isFinite(+bounds[1]) ? toMqValue(+bounds[1] + 1) : bounds[1]
      } : {
        '!': toMqValue(bounds),
        '+': Number.isFinite(+bounds) ? toMqValue(+bounds + 1) : bounds
      }

      const mqObject = {}
      if (lower !== '0px') mqObject.minWidth = lower
      if (upper['!'] !== Infinity) mqObject.maxWidth = upper['!']

      association = Object.assign(association, {
        [alias]: toMq(mqObject)
      }, extractModifiers(alias, [lower, upper['+']]))
    } else {
      association[alias] = toMq(bounds)
    }
    return association
  }, {})
}
