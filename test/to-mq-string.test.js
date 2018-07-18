import test from 'ava'
import toMq from '../src/to-mq-string'

test('should return query string for media type', t => {
  t.is(toMq({screen: true}), 'screen')
})

test('should return negated query string for media type with false value', t => {
  t.is(toMq({handled: false}), 'not handled')
})

test('should return query string for media feature', t => {
  t.is(toMq({minWidth: 750}), '(min-width: 750px)')
})

test('should return concatenated query string for multiple media features', t => {
  t.is(toMq({minWidth: 100, maxWidth: 200}), '(min-width: 100px) and (max-width: 200px)')
})

test('should return concatenated query string for media type and media features', t => {
  t.is(toMq({screen: true, minWidth: 100, maxWidth: 200}), 'screen and (min-width: 100px) and (max-width: 200px)')
})

test('should add px unit to dimension features with a number value', t => {
  t.is(toMq({minWidth: 100, aspectRatio: '3/4', minHeight: '250em'}), '(min-width: 100px) and (aspect-ratio: 3/4) and (min-height: 250em)')
})

test('should accept other units for dimension features if passed as string', t => {
  t.is(toMq({minWidth: '10em', aspectRatio: '3/4'}), '(min-width: 10em) and (aspect-ratio: 3/4)')
})

test('should return comma seperated query string for multiple media queries', t => {
  t.is(toMq([
    {minWidth: 100},
    {handheld: true, orientation: 'landscape'}
  ]), '(min-width: 100px), handheld and (orientation: landscape)')
})

test('should return query as is if passed as a string', t => {
  t.is(toMq('(min-width: 100px)'), '(min-width: 100px)')
})

test('should return query as is if passed as a string in an array', t => {
  t.is(toMq([{orientation: 'landscape'}, '(min-width: 100px)']), '(orientation: landscape), (min-width: 100px)')
})

test('should only return feature if its value is true', t => {
  t.is(toMq({all: true, monochrome: true}), 'all and monochrome')
})
