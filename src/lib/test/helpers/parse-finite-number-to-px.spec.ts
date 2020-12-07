import test, { Macro } from 'ava'

import { parseToPxOrKeepValue } from '../../helpers'


const parsePxUnitMacro: Macro<[any, any]> = (t, input, expected) => {
	t.is(parseToPxOrKeepValue(input), expected);
}

parsePxUnitMacro.title = (providedTitle = '', input, expected) => `${providedTitle} ${expected} if input = ${input}`.trim();

[
  31,
  '875',
  0,
  [],
  null, // eslint-disable-line unicorn/no-null
].forEach((input, index) => {
  test(`(case ${index}.) parseFiniteNumberToPxOrSame should return`, parsePxUnitMacro, input, `${+(input === null ? 0 : input)}px`)
});


[
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
  test(`(case ${index}.) parseFiniteNumberToPxOrSame should return`, parsePxUnitMacro, input, input)
});
