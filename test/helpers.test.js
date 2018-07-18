import test from 'ava'
import { aliasesToMqStrings } from '../src/helpers'

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

test('4', t => {
  t.deepEqual(aliasesToMqStrings({
    sm: 450
  }), {
    sm: '(max-width: 450px)',
    'sm+': '(min-width: 451px)'
  })
})

test('2', t => {
  t.deepEqual(aliasesToMqStrings({
    sm1: [450],
    sm2: [450, Infinity]
  }), {
    sm1: '(min-width: 450px)',
    sm2: '(min-width: 450px)'
  })
})

test('5', t => {
  t.deepEqual(aliasesToMqStrings({
    sm: [450, 700]
  }), {
    sm: '(min-width: 450px) and (max-width: 700px)',
    'sm+': '(min-width: 701px)',
    'sm!': '(min-width: 450px)'
  })
})

test('6', t => {
  t.deepEqual(aliasesToMqStrings({
    sm: ['450px', '45em']
  }), {
    sm: '(min-width: 450px) and (max-width: 45em)',
    'sm+': '(min-width: 45em)',
    'sm!': '(min-width: 450px)'
  })
})

test('7', t => {
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
test('1', t => {
  t.deepEqual(aliasesToMqStrings({
    sm: 0
  }), {
    sm: '(max-width: 0px)',
    'sm+': '(min-width: 1px)'
  })
})

test('3', t => {
  t.deepEqual(aliasesToMqStrings({
    sm: [Infinity]
  }), {
    sm: '(min-width: Infinity)'
  })
})
