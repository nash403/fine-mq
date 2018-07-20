import test from 'ava'
import Vue from 'vue'
import Component from '../src/component'

test('renders', t => {
  new Vue(Component).$mount()
  t.pass()
})
