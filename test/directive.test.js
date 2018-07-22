import Directive from '../src/directive'
import Mq from '../src/mq'
import test from 'ava'

window.matchMedia = window.matchMedia || function() {return {addListener:()=>{}, removeListener:()=>{}}}

test('should not display element if given alias is falsy', t => {
  const el = {style:{display: 'inline'}}
  Directive.updated(el,{value: ''}, {context: {}})
  t.is(el.style.display, 'none')
})

test('should not display element if given alias exists and does not match', t => {
  const el = {style:{display: 'inline'}}
  Directive.updated(el,{value: 'sm'}, {context: {
    $mqAliases: {sm: false}
  }})
  t.is(el.style.display, 'none')
})

test('should display element if given alias exists and matches', t => {
  const el = {style:{display: 'inline'}}
  Directive.updated(el,{value: 'sm'}, {context: {
    $mqAliases: {sm: true}
  }})
  t.is(el.style.display, '')
})

test('should not display element if given alias does not exist but has been registered on bind', t => {
  const el = {style:{display: 'inline'}}
  const m =  new Mq
  Directive.bind(el, {value: 'sm'}, {context: {
    $mqAliases: {},
    $mq: m
  }})
  t.true('sm' in m.queries)
  Directive.updated(el, {value: 'sm'}, {context: {
    $mqAliases: {},
    $mq: m
  }})
  t.is(el.style.display, 'none')
})

test('should display element if given alias does not exist but has been registered on bind and the query matches', t => {
  const el = {style:{display: 'inline'}}
  const m =  new Mq
  Directive.bind(el, {value: 'sm'}, {context: {
    $mqAliases: {},
    $mq: m
  }})
  t.true('sm' in m.queries)
  m.queries.sm.mqMatcher.matches = true
  Directive.updated(el, {value: 'sm'}, {context: {
    $mqAliases: {},
    $mq: m
  }})
  t.is(el.style.display, '')
})

test('should not display element if given alias does not exist and has not been registered on bind', t => {
  const el = {style:{display: 'inline'}}
  Directive.updated(el,{value: 'sm'}, {context: {
    $mqAliases: {},
    $mq: new Mq()
  }})
  t.is(el.style.display, 'none')
})

test('should register the new query', t => {
  const el = {style:{display: 'inline'}}
  const m =  new Mq
  t.false('(orientation: landscape)' in m.queries)
  Directive.bind(el, {value: '(orientation: landscape)'}, {context: {
    $mqAliases: {},
    $mq: m
  }})
  t.true('(orientation: landscape)' in m.queries)
})

test('should accept objet notation style and register the new query', t => {
  const el = {style:{display: 'inline'}}
  const m =  new Mq
  t.false('(orientation: landscape)' in m.queries)
  Directive.bind(el, {value: {orientation: 'landscape'}}, {context: {
    $mqAliases: {},
    $mq: m
  }})
  t.true('(orientation: landscape)' in m.queries)
})

test('should accept objet notation style and register the new query (2)', t => {
  const el = {style:{display: 'inline'}}
  const m =  new Mq
  t.false('(orientation: landscape)' in m.queries)
  Directive.bind(el, {value: [{orientation: 'landscape'}]}, {context: {
    $mqAliases: {},
    $mq: m
  }})
  t.true('(orientation: landscape)' in m.queries)
})

test('should accept objet notation style and register the new query (3)', t => {
  const el = {style:{display: 'inline'}}
  const m =  new Mq
  t.false('(orientation: landscape)' in m.queries)
  t.false('screen' in m.queries)
  Directive.bind(el, {value: [{orientation: 'landscape'}, {screen: true}]}, {context: {
    $mqAliases: {},
    $mq: m
  }})
  t.true('(orientation: landscape)' in m.queries)
  t.true('screen' in m.queries)
})

test('should accept objet notation style and register the new query (4)', t => {
  const el = {style:{display: 'inline'}}
  const m =  new Mq
  t.false('(orientation: landscape), screen' in m.queries)
  Directive.bind(el, {value: [[{orientation: 'landscape'}, {screen: true}]]}, {context: {
    $mqAliases: {},
    $mq: m
  }})
  t.true('(orientation: landscape), screen' in m.queries)
})
