import test from 'ava'
import Mq from '../src/mq'
import { fake } from 'sinon'

test('should create a new media query wrapper with empty data', t => {
  const m = new Mq()
  t.deepEqual(m.aliases, {})
  t.deepEqual(m.queries, {})
})

test('should create a new media query wrapper with prefilled alias set', t => {
  const m = new Mq({an_alias:'something'})
  t.deepEqual(m.aliases, {an_alias:'something'})
})

test('should add the given alias in the set', t => {
  const m = new Mq()
  t.false('an_alias' in m.aliases)
  m.alias('an_alias', 'something')
  t.is(m.aliases.an_alias, 'something')

  t.false('another_alias' in m.aliases)
  m.alias({'another_alias': 'something'})
  t.is(m.aliases.another_alias, 'something')
  t.deepEqual(m.aliases, {an_alias: 'something', another_alias: 'something'})
})

test('should remove the given alias', t => {
  const m = new Mq({an_alias:'something'})
  t.true('an_alias' in m.aliases)
  m.unalias('an_alias')
  t.false('an_alias' in m.aliases)
})

test('should register event listeners', t => {
  window.matchMedia = () => ({addListener: ()=>{}, removeListener:()=>{}})
  const m = new Mq()
  const callbackOne = () => {}
  const callbackTwo = () => {}

  m.on('foo', callbackOne)
  m.on('foo', callbackTwo)

  t.deepEqual(
    m.queries.foo.handlers,
    [
      { callback: callbackOne, context: m },
      { callback: callbackTwo, context: m }
    ]
  )
})

test('should register event listener for alias', t => {
  window.matchMedia = () => ({addListener: ()=>{}, removeListener:()=>{}})
  const q = '(min-width: 450px)'
  const m = new Mq({foo: q})
  const callbackOne = () => {}

  m.on('foo', callbackOne)

  t.is(m.aliases.foo,q)
  t.deepEqual(
    m.queries[q].handlers,
    [
      { callback: callbackOne, context: m }
    ]
  )
})

test('should register event listeners with their context', t => {
  const m = new Mq()
  const callbackOne = () => {}
  const callbackTwo = () => {}
  const contextkOne = {}
  const contextkTwo = {}

  m.on('foo', callbackOne, contextkOne)
  m.on('foo', callbackTwo, contextkTwo)

  t.deepEqual(
    m.queries.foo.handlers,
    [
      { callback: callbackOne, context: contextkOne },
      { callback: callbackTwo, context: contextkTwo }
    ]
  )
})

test('should remove all event listeners', t => {
  const m = new Mq()
  const callback = () => {}
  m.on('foo', callback)
  m.on('bar', callback)
  m.on('bar', callback)
  m.off()

  t.deepEqual(m.queries, {})
})

test('should remove all event listeners for a query', t => {
  const m = new Mq()
  const callback = () => {}
  m.on('foo', callback)
  m.on('bar', callback)
  m.on('bar', callback)

  t.truthy(m.queries.bar)
  m.off('bar')
  t.falsy(m.queries.bar)
})

test('should remove event listener for alias when unaliased', t => {
  window.matchMedia = () => ({addListener: ()=>{}, removeListener:()=>{}})
  const q = '(min-width: 450px)'
  const m = new Mq({foo: q})
  const callbackOne = () => {}

  m.on('foo', callbackOne)

  t.is(m.aliases.foo,q)
  t.deepEqual(
    m.queries[q].handlers,
    [
      { callback: callbackOne, context: m }
    ]
  )

  m.unalias('foo')
  t.is(m.aliases.foo,undefined)
  t.is(m.queries[q], undefined)
})

test('should remove only the specified event handler for an alias', t => {
  window.matchMedia = () => ({addListener: ()=>{}, removeListener:()=>{}})
  const q = '(min-width: 450px)'
  const m = new Mq({foo: q})
  const callbackOne = () => {}
  const callbackTwo = () => {}

  m.on('foo', callbackOne)
  m.on('foo', callbackTwo)

  t.is(m.aliases.foo, q)
  t.deepEqual(
    m.queries[q].handlers,
    [
      { callback: callbackOne, context: m },
      { callback: callbackTwo, context: m }
    ]
  )

  m.off('foo', callbackTwo)
  t.is(m.aliases.foo, q)
  t.deepEqual(
    m.queries[q].handlers,
    [
      { callback: callbackOne, context: m }
    ]
  )
})

test('should remove only the specified event handler for a query', t => {
  const m = new Mq()
  const callback = () => {}
  const callbackTwo = () => {}
  m.on('foo', callback)
  m.on('bar', callbackTwo)
  m.on('bar', callback)

  m.off('bar', callback)

  t.deepEqual(m.queries.bar.handlers, [
    { callback: callbackTwo, context: m }
  ])
})

test('should remove query object if the last hanlder is removed for a query', t => {
  const m = new Mq()
  const callback = () => {}
  m.on('foo', callback)

  t.truthy(m.queries.foo)
  m.off('foo', callback)
  t.falsy(m.queries.foo)
})

test('should do nothing if attempting to remove a query that doesn\'t exist', t => {
  t.notThrows(() => new Mq().off('bar'))
})

test('should call listeners at leat once after registering them', t => {
  window.matchMedia = () => ({addListener: ()=>{}, removeListener:()=>{}})
  const m = new Mq()
  const callbackOne = fake()
  const callbackTwo = fake()

  m.on('foo', callbackOne)
  m.on('bar', callbackTwo)

  t.true(callbackOne.called)
  t.true(callbackTwo.called)
})
