import test, { Macro } from 'ava'

import { json2mq } from '../../helpers'

const testMacro: Macro<[any, any]> = (t, input, expected) => {
  t.is(json2mq(input), expected)
}

testMacro.title = (providedTitle = '', _, expected) => `${providedTitle} ${expected}`.trim()
;[
  [600, '(max-width: 600px)'],
  ['600px', '(max-width: 600px)'],
  ['600em', '(max-width: 600em)'],
  ['600rem', '(max-width: 600rem)'],

  [[600], '(min-width: 600px)'],
  [['600px'], '(min-width: 600px)'],
  [['600em'], '(min-width: 600em)'],
  [['600rem'], '(min-width: 600rem)'],

  [[600, 1200], '(min-width: 600px) and (max-width: 1200px)'],
  [['600px', '1200px'], '(min-width: 600px) and (max-width: 1200px)'],
  [['600em', '1200em'], '(min-width: 600em) and (max-width: 1200em)'],
  [['600rem', '1200rem'], '(min-width: 600rem) and (max-width: 1200rem)'],

  [{ screen: true }, 'screen'],
  [{ handheld: false }, 'not handheld'],
  [{ handheld: false, minWidth: 100 }, 'not handheld and (min-width: 100px)'],
  [{ minWidth: 100, maxWidth: '600px' }, '(min-width: 100px) and (max-width: 600px)'],
  [{ minWidth: 100, maxWidth: '600em' }, '(min-width: 100px) and (max-width: 600em)'],
  [{ minWidth: 100, maxWidth: '600rem' }, '(min-width: 100px) and (max-width: 600rem)'],

  [
    [{ handheld: false }, { minWidth: 100, maxWidth: '600rem' }, { screen: false }],
    'not handheld, (min-width: 100px) and (max-width: 600rem), not screen',
  ],

  ['a non dimension string', 'a non dimension string'],
].forEach(([input, expected]: any, index) => {
  test(`${index}. json2mq should return`, testMacro, input, expected)
})
