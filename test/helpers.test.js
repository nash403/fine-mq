import test from 'ava'
import { aliasesToMqStrings, isDimension } from '../src/helpers'

test('isDimension: should return true only for dimensions', t => {
  [
    31,
    '875',
    '354px',
    '20em',
    [786],
    ['786'],
    ['60em'],
    ['786px'],
    [786, 978],
    ['546', '1002'],
    [876, '1002px'],
    ['1002px', 1300],
    ['50em', 1300],
    ['50em', '1300'],
    [876, '89em'],
    ['876', '89em'],
    ['876', 890],
    ['87em', '89em'],
    ['87px', '89px'],
    ['87px', Infinity],
    [Infinity, 57]
  ].forEach(tc => t.true(isDimension(tc)))
})

test('isDimension: should return false when argument is not a dimension', t => {
  [
    'toto',
    '354pxd',
    Infinity,
    [786, 978, '1790']
  ].forEach(tc => t.false(isDimension(tc)))
})

test('should return media queries for each default breakpoints and their modifiers when no arguments', t => {
  t.deepEqual(aliasesToMqStrings(), {
    sm: '(max-width: 450px)',
    'sm+': '(min-width: 451px)',
    md: '(min-width: 451px) and (max-width: 1250px)',
    'md+': '(min-width: 1251px)',
    'md!': '(min-width: 451px)',
    lg: '(min-width: 1251px)'
  })
})

test('should return empty object when argument is falsy but defined', t => {
  t.deepEqual(aliasesToMqStrings(false), {})
})

test('should return media queries for each given breakpoints (with their modifiers) and aliases', t => {
  t.deepEqual(aliasesToMqStrings({
    sm: 450,
    medium: [300, '45em'],
    landscape: '(orientation: landscape)',
    screen: {
      screen: true
    },
    lg: [1250]
  }), {
    sm: '(max-width: 450px)',
    'sm+': '(min-width: 451px)',
    medium: '(min-width: 300px) and (max-width: 45em)',
    'medium+': '(min-width: 45em)',
    'medium!': '(min-width: 300px)',
    landscape: '(orientation: landscape)',
    screen: 'screen',
    lg: '(min-width: 1250px)'
  })
})

test('+ modifier should have the correct value', t => {
  t.deepEqual(aliasesToMqStrings({
    sm: 450
  }), {
    sm: '(max-width: 450px)',
    'sm+': '(min-width: 451px)'
  })
})

test('Specifiying Infinity value or not should not change output', t => {
  t.deepEqual(aliasesToMqStrings({
    sm1: [450],
    sm2: [450, Infinity]
  }), {
    sm1: '(min-width: 450px)',
    sm2: '(min-width: 450px)'
  })
})

test('Specifiying lower & upper bounds should output correct values for alias and modifiers', t => {
  t.deepEqual(aliasesToMqStrings({
    sm: [450, 700]
  }), {
    sm: '(min-width: 450px) and (max-width: 700px)',
    'sm+': '(min-width: 701px)',
    'sm!': '(min-width: 450px)'
  })
})

test('when units are provided, no calculation are made for modifiers', t => {
  t.deepEqual(aliasesToMqStrings({
    sm: ['450px', '45em']
  }), {
    sm: '(min-width: 450px) and (max-width: 45em)',
    'sm+': '(min-width: 45em)',
    'sm!': '(min-width: 450px)'
  })
})

test('supports passing object as media query', t => {
  t.deepEqual(aliasesToMqStrings({
    notHandled: 'not handled',
    ratio: {
      aspectRatio: '3/4'
    }
  }), {
    notHandled: 'not handled',
    ratio: '(aspect-ratio: 3/4)'
  })
})


// Absurd cases
test('with 0', t => {
  t.deepEqual(aliasesToMqStrings({
    sm: 0
  }), {
    sm: '(max-width: 0px)',
    'sm+': '(min-width: 1px)'
  })
})

test('with Infinity', t => {
  t.deepEqual(aliasesToMqStrings({
    sm: [Infinity]
  }), {
    sm: '(min-width: Infinity)'
  })
})
