import Vue from 'vue'
import { FineMqPlugin } from 'fine-mq'

Vue.use(FineMqPlugin, <%= serialize(options) %>)
