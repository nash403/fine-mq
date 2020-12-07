/* eslint-disable @typescript-eslint/no-explicit-any */
import { default as _json2mq, QueryObject } from 'json2mq'

import { MediaQueryAliases, MediaQueryObject, MediaQueryObjectWithShortcuts } from './types'

export type MqDimensionBoundaries = { bounds: [any, any], boundsParsed: [any, any] }

export const parseToPxOrKeepValue = (v: any) => (Number.isFinite(+v) ? `${+v}px` : v)

export const isUnitValue = (v: any): boolean =>
v === Infinity || Number.isFinite(+v) || (typeof v === 'string' && /\d+(px|r?em)$/.test(v))

export const isDimension = (v: any): boolean =>
  (Array.isArray(v) && v.length > 0 && (v.length <= 2 ? v.every((_v) => isUnitValue(_v)) : false)) || isUnitValue(v)

export const getAliasModifiers = (
  alias: string,
  {
    bounds: [, upperBound],
    boundsParsed: [lowerBoundParsed, upperBoundParsed]
  }: MqDimensionBoundaries,
) => {
  const aboveModifierMinValue = Number.isFinite(+(upperBound ?? Number.NaN)) ? parseToPxOrKeepValue(+(upperBound ?? Number.NaN) + 1) : upperBoundParsed
  const isMinValuePossible = aboveModifierMinValue !== Infinity && typeof aboveModifierMinValue !== 'undefined'
  const modifiers: { [key: string]: any } = {}

  if (isMinValuePossible) {
    modifiers[`${alias}+`] = {
      minWidth: aboveModifierMinValue,
    }

    const isLowerBoundMeaningful = !['0px', '0em', '0rem'].includes(lowerBoundParsed)
    if (isLowerBoundMeaningful) {
      modifiers[`${alias}!`] = {
        minWidth: lowerBoundParsed,
      }
    }
  }
  return modifiers
}

export const getDimensionBounds = (dimension: any): [any, any]=> {
  let lowerBound
  let upperBound

  if (Array.isArray(dimension)) {
    if (dimension.length === 1) {
      lowerBound = dimension[0]
      upperBound = Infinity
    } else if (dimension.length === 2) {
      lowerBound = dimension[0]
      upperBound = dimension[1]
    }
  } else {
    lowerBound = '0px'
    upperBound = dimension
  }
  return [lowerBound, upperBound]
}

export const getUnshortenedMqObject = ({ boundsParsed: [lowerBoundParsed, upperBoundParsed] }: Pick<MqDimensionBoundaries, 'boundsParsed'>): MediaQueryObject => {
  const mqObject: MediaQueryObject = {}
    if (lowerBoundParsed !== '0px') mqObject.minWidth = lowerBoundParsed
    if (upperBoundParsed !== Infinity) mqObject.maxWidth = upperBoundParsed
    return mqObject
}

const unshortenAliasMq = (mqObject: MediaQueryObjectWithShortcuts): { boundaries: MqDimensionBoundaries, mq: MediaQueryObject } => {
  const [lowerBound, upperBound] = getDimensionBounds(mqObject)
  const [lowerBoundParsed, upperBoundParsed] = [parseToPxOrKeepValue(lowerBound), parseToPxOrKeepValue(upperBound)]
  const bounds: MqDimensionBoundaries = {
    bounds: [lowerBound, upperBound],
    boundsParsed: [lowerBoundParsed, upperBoundParsed]
  }

    return {
      boundaries: bounds,
      mq: getUnshortenedMqObject(bounds),
    }
}

export const expandAliases = (aliases: { [key: string]: MediaQueryObjectWithShortcuts }): { [key: string]: MediaQueryObject } => {
  const aliasesWithModifiers: { [key: string]: MediaQueryObject } = {}

  for (const [alias, mqObject] of Object.entries(aliases)) {
    const isDim = isDimension(mqObject)

    if (isDim) {
      const { boundaries, mq } = unshortenAliasMq(mqObject)
      Object.assign(
        aliasesWithModifiers,
        {
          [alias]: mq,
        },
        getAliasModifiers(alias, boundaries)
      )
    } else {
      aliasesWithModifiers[alias] = mqObject as MediaQueryObject
    }
  }

  return aliasesWithModifiers
}

export const aliases2mq = (aliases: string | { [key: string]: MediaQueryObjectWithShortcuts }): MediaQueryAliases => {
  const mqAliases: MediaQueryAliases = {}
  const aliasesExpanded = expandAliases(typeof aliases === 'string' ? { [aliases]: _json2mq(aliases as any) } : aliases)

  for (const [_alias, _mediaQuery] of Object.entries(aliasesExpanded)) {
    mqAliases[_alias] = _json2mq(_mediaQuery as QueryObject)
  }

  return mqAliases
}

export const json2mq = (mq: MediaQueryObjectWithShortcuts): string => aliases2mq({ _: mq })['_']
