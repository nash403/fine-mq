import test, { Macro } from 'ava'

import { isDimension } from '../../helpers'

const isDimensionMacro: Macro<[any, boolean]> = (t, input, expected) => {
  t.is(isDimension(input), expected)
}

isDimensionMacro.title = (providedTitle = '', input, expected) => `${providedTitle} ${expected} if input = ${input}`.trim()
;[
  [],
  31,
  '875',
  '354px',
  '20em',
  '36rem',

  [786],
  ['786'],
  ['786px'],
  ['60em'],
  ['6rem'],

  [786, 978],
  ['546', '1002'],
  [876, '1002px'],
  ['600px', '1002px'],
  ['10em', 1300],
  ['50em', '89em'],
  ['50em', '77rem'],
  [[], '77rem'],
  [670, []],

  ['87px', Infinity],
  [Infinity, 57],
].forEach((input, index) => {
  test(`(case ${index}.) isDimension should return`, isDimensionMacro, input, true)
})
;[
  'toto',
  Number.NaN,
  '354pxd',
  [786, 978, '1790'],
  ['640px', 978, '80rem'],
  [12, '978', '93em'],
  [12, '978', '93em', '1700px'],
].forEach((input, index) => {
  test(`(case ${index}.) isDimension should return`, isDimensionMacro, input, false)
})
