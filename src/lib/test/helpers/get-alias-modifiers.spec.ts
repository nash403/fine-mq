import test from 'ava'

import { getAliasModifiers, MqDimensionBoundaries } from '../../helpers'

test(`getAliasModifiers returns modifiers for normal boundaries`, (t) => {
  const alias = 'an_alias'
  const input: MqDimensionBoundaries = {
    bounds: [400, 600],
    boundsParsed: ['400px', '600px'],
  }
  t.deepEqual(getAliasModifiers(alias, input), {
    [`${alias}+`]: {
      minWidth: input.bounds[1] + 1 + 'px',
    },
    [`${alias}!`]: {
      minWidth: input.boundsParsed[0],
    },
  })
})

test(`getAliasModifiers: minWidth is not incremented for the + modifier if upper bounds is not castable to a number`, (t) => {
  const alias = 'an_alias'
  const input: MqDimensionBoundaries = {
    bounds: [400, '600px'],
    boundsParsed: ['400px', '600px'],
  }
  t.deepEqual(getAliasModifiers(alias, input), {
    [`${alias}+`]: {
      minWidth: input.bounds[1],
    },
    [`${alias}!`]: {
      minWidth: input.boundsParsed[0],
    },
  })
})

test(`getAliasModifiers does not return modifiers if the upper bound is Infinity returns modifiers for normal boundaries`, (t) => {
  const alias = 'an_alias'
  const input: MqDimensionBoundaries = {
    bounds: [400, Infinity],
    boundsParsed: ['400px', Infinity],
  }
  t.deepEqual(getAliasModifiers(alias, input), {})
})

test(`getAliasModifiers does not return modifiers if the upper bound is undefined returns modifiers for normal boundaries`, (t) => {
  const alias = 'an_alias'
  const input: MqDimensionBoundaries = {
    bounds: [400, undefined],
    boundsParsed: ['400px', undefined],
  }
  t.deepEqual(getAliasModifiers(alias, input), {})
})

test(`getAliasModifiers does not return the ! modifiers if the lower bound is 0px`, (t) => {
  const alias = 'an_alias'
  const input: MqDimensionBoundaries = {
    bounds: [0, 100],
    boundsParsed: ['0px', '100px'],
  }
  t.deepEqual(getAliasModifiers(alias, input), {
    [`${alias}+`]: {
      minWidth: input.bounds[1] + 1 + 'px',
    },
  })
})

test(`getAliasModifiers does not return the ! modifiers if the lower bound is 0em`, (t) => {
  const alias = 'an_alias'
  const input: MqDimensionBoundaries = {
    bounds: ['0em', 100],
    boundsParsed: ['0em', '100px'],
  }
  t.deepEqual(getAliasModifiers(alias, input), {
    [`${alias}+`]: {
      minWidth: input.bounds[1] + 1 + 'px',
    },
  })
})

test(`getAliasModifiers does not return the ! modifiers if the lower bound is 0rem`, (t) => {
  const alias = 'an_alias'
  const input: MqDimensionBoundaries = {
    bounds: ['0rem', 100],
    boundsParsed: ['0rem', '100px'],
  }
  t.deepEqual(getAliasModifiers(alias, input), {
    [`${alias}+`]: {
      minWidth: input.bounds[1] + 1 + 'px',
    },
  })
})
