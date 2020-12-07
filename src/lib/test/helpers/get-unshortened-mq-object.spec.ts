import test from 'ava'

import { getUnshortenedMqObject, MqDimensionBoundaries } from '../../helpers'

test(`getUnshortenedMqObject unshortens input to a media query object`, (t) => {
  const input: MqDimensionBoundaries['boundsParsed'] = ['400px', '600px']
  t.deepEqual(getUnshortenedMqObject({ boundsParsed: input }), { minWidth: input[0], maxWidth: input[1] })
})

test(`getUnshortenedMqObject does not set minWidth when lower bound is 0px`, (t) => {
  const input: MqDimensionBoundaries['boundsParsed'] = ['0px', '600px']
  t.deepEqual(getUnshortenedMqObject({ boundsParsed: input }), { maxWidth: input[1] })
})

test(`getUnshortenedMqObject does not set maxWidth when upper bound is Infinity`, (t) => {
  const input: MqDimensionBoundaries['boundsParsed'] = ['1200px', Infinity]
  t.deepEqual(getUnshortenedMqObject({ boundsParsed: input }), { minWidth: input[0] })
})

test(`getUnshortenedMqObject returns an empty object when lower bound is 0px and upper bound is Infinity`, (t) => {
  const input: MqDimensionBoundaries['boundsParsed'] = ['0px', Infinity]
  t.deepEqual(getUnshortenedMqObject({ boundsParsed: input }), {})
})
