import test from 'ava'
import Component from '../src/component'
import Plugin from '../src/index'
import { mount, createLocalVue } from '@vue/test-utils'

window.matchMedia = window.matchMedia || function() {return {addListener:()=>{}, removeListener:()=>{}}}

test('should render component when alias matches the given media query.', t => {
  const text = 'Hello World!'
  const wrapper = mount(Component, {
    mocks: {
      $mqAliases: { sm: true }
    },
    propsData: { if: 'sm' },
    slots: {
      default: text
    }
  })
  t.true(wrapper.vm.shouldRenderChildren)
  t.is(wrapper.html(), `<div>${text}</div>`)
})

test('should\'t render component when alias does not matche the media query.', t => {
  const wrapper = mount(Component, {
    mocks: {
      $mqAliases: { sm: false }
    },
    propsData: { if: 'sm' },
    slots: {
      default: 'Hello World!'
    }
  })
  t.false(wrapper.vm.shouldRenderChildren)
  t.true(wrapper.isEmpty())
})

test('should render component with a root DIV element by default.', t => {
  const wrapper = mount(Component, {
    mocks: {
      $mqAliases: { sm: true }
    },
    propsData: { if: 'sm' }
  })
  t.is(wrapper.html(), '<div></div>')
})

test('should render component with given root element if the "tag" prop is passed.', t => {
  const wrapper = mount(Component, {
    mocks: {
      $mqAliases: { md: true }
    },
    propsData: { if: 'md', tag: 'span' }
  })
  t.is(wrapper.html(), '<span></span>')
})

test('should accept object style notation for alias values when registering the plugin', t => {
  const localVue = createLocalVue()
  localVue.use(Plugin, { breakpoints: { example: {screen: true} } })
  const wrapper = mount(Component, {
    localVue,
    propsData: {if:''}
  })

  t.true('screen' in wrapper.vm.$mq.queries)
  t.true('example' in wrapper.vm.$mqAliases)
})

test('should accept object style notation for "if" prop', t => {
  const localVue = createLocalVue()
  localVue.use(Plugin)
  const wrapper1 = mount(Component, {
    localVue,
    propsData: {if:[[{screen: true}, {'min-width': 100}]]}
  })
  const wrapper2 = mount(Component, {
    localVue,
    propsData: {if:[{screen: true}, {'min-width': 100}]}
  })
  const wrapper3 = mount(Component, {
    localVue,
    propsData: {if:{handled: false, 'max-height': 300}}
  })

  t.true('screen, (min-width: 100px)' in wrapper1.vm.localMQAliases)

  t.true('screen' in wrapper2.vm.localMQAliases)
  t.true('(min-width: 100px)' in wrapper2.vm.localMQAliases)

  t.true('not handled and (max-height: 300px)' in wrapper3.vm.localMQAliases)
})
