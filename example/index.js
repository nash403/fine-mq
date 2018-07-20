import Vue from 'vue'
import Plugin from '../src/index.js'
import App from './App'

Vue.use(Plugin /*, {
  breakpoints: {
    sm: 450,
    md: [451, 1250],
    lg: [1251],
    orientation: '(orientation: landscape)'
  }
} */)

new Vue({
  el: '#app',
  render (h) { return h('MqShow', { props: { if: ['(max-width: 413px)', 'md+'] } }, [h(App)]) }
  // template: `
  //   <App v-mq-show="'sm'" />
  // `
  // render (h) {
  //   return h(App, {
  //     directives: [
  //       {
  //         name: 'mq-show-if',
  //         value: ['lg', 'sm']
  //       }
  //     ]
  //   })
  // }
})
