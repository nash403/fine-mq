import { default as json2mq, QueryObject } from 'json2mq'

import { MediaQueryAliases, MediaQueryObject, MediaQueryObjectWithShortcuts } from "./types"

export const parseUnitValue = (v: any) => (Number.isFinite(+v) ? `${+v}px` : v)

export const isUnitValue = (v: any) => Number.isFinite(+v) || (typeof v === 'string' && (['px', 'em'].includes(v.slice(-2)) || 'rem' === v.slice(-2)))

export const isDimension = (v: any) =>
  (Array.isArray(v) && v.length && v.length <= 2 && v.every(_v => _v === Infinity || isUnitValue(_v))) || isUnitValue(v)


type MqDimension = string | number
export const extractDimensionModifiers = (alias: string, [lower, ]: [MqDimension, MqDimension], lowerValuesForModifiers: { [key in '+' | '!']: MqDimension }) => {
  const modifiers: { [key: string]: any } = {}
  if (lowerValuesForModifiers['+'] !== Infinity && typeof lowerValuesForModifiers['+'] !== 'undefined') {
    modifiers[`${alias}+`] = {
      minWidth: lowerValuesForModifiers['+']
    }
    if (lower !== '0px' && lower !== '0em') {
      modifiers[`${alias}!`] = {
        minWidth: lower
      }
    }
  }
  return modifiers
}

export const expandAliases = (aliases: { [key: string]: MediaQueryObjectWithShortcuts }): { [key: string]: MediaQueryObject } => {
  const aliasesWithModifiers: { [key: string]: MediaQueryObject } = {}
  for (const [alias, mqObject] of Object.entries(aliases)) {
    const isDim = isDimension(mqObject)
    if (isDim) {
      let lowerBound
      let upperBound

      if (Array.isArray(mqObject)) {
        if (mqObject.length === 1) {
          lowerBound = mqObject[0]
          upperBound = Infinity
        } else if (mqObject.length === 2) {
          lowerBound = mqObject[0]
          upperBound = mqObject[1]
        }
      } else {
        lowerBound = '0px'
        upperBound = mqObject
      }

      const [lowerBoundParsed, upperBoundParsed] = [parseUnitValue(lowerBound), parseUnitValue(upperBound)]

      const lowerValuesForModifiers = {
        '!': upperBoundParsed,
        '+': Number.isFinite(+(upperBound ?? Number.NaN)) ? parseUnitValue(+(upperBound ?? Number.NaN) + 1) : upperBoundParsed,
      }

      const dimensionMqObject: MediaQueryObject = {}
      if (lowerBoundParsed !== '0px') dimensionMqObject.minWidth = lowerBoundParsed
      if (lowerValuesForModifiers['!'] !== Infinity) dimensionMqObject.maxWidth = lowerValuesForModifiers['!']

      Object.assign(
        aliasesWithModifiers,
        {
          [alias]: dimensionMqObject,
        },
        extractDimensionModifiers(alias, [lowerBoundParsed, upperBoundParsed], lowerValuesForModifiers)
      )
    } else {
      aliasesWithModifiers[alias] = mqObject as MediaQueryObject
    }
  }

  return aliasesWithModifiers
}

export const aliases2mq = (aliases: { [key: string]: MediaQueryObjectWithShortcuts }): MediaQueryAliases => {
  const mqAliases: MediaQueryAliases = {}
  const aliasesExpanded = expandAliases(aliases)

  for (const [_alias, _mediaQuery] of Object.entries(aliasesExpanded)) {
    mqAliases[_alias] = json2mq(_mediaQuery as QueryObject)
  }

  return mqAliases
}
