import test, { Macro } from 'ava'

import { getDimensionBounds } from '../../helpers'

const getDimensionBoundsMacro: Macro<[any, any]> = (t, input, expected) => {
  t.deepEqual(getDimensionBounds(input), expected)
}

test(`getDimensionBounds sets lower bound to 0px when a single value is given`, getDimensionBoundsMacro, 2, ['0px', 2])
test(
  `getDimensionBounds sets upper bound to Infinity when an array with a single value is given`,
  getDimensionBoundsMacro,
  ['100px'],
  ['100px', Infinity]
)
;[[], [1, 2, 3], [1, 2, 3, 4, 5, 6, 7]].forEach((input: any[], index) => {
  test(
    `${index}. getDimensionBounds sets both lower and upper bounds to undefined when an array with a length === 0 or length > 2 is given`,
    getDimensionBoundsMacro,
    input,
    [undefined, undefined]
  )
})
