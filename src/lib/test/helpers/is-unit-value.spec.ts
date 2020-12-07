import test, { Macro } from 'ava'

import { isUnitValue } from '../../helpers'

const isUnitValueMacro: Macro<[any, boolean]> = (t, input, expected) => {
  t.is(isUnitValue(input), expected)
}

isUnitValueMacro.title = (providedTitle = '', input, expected) => `${providedTitle} ${expected} if input = ${input}`.trim()
;[
  31,
  '875',
  '354px',
  '20em',
  '20rem',
  '0px',
  0,
  [],
  null, // eslint-disable-line unicorn/no-null
  Infinity,
].forEach((input, index) => {
  test(`(case ${index}.) isUnitValue should return`, isUnitValueMacro, input, true)
})
;[
  'toto',
  Number.NaN,
  '354pxd',
  'px',
  'em',
  'rem',
  [786, 978, '1790'],
  ['1790px'],
  ['1790rem'],
  ['1790em'],
  undefined,
  {},
].forEach((input, index) => {
  test(`(case ${index}.) isUnitValue should return`, isUnitValueMacro, input, false)
})
