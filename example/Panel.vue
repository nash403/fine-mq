<script>
export default {
  name: 'Panel',
  components: {
    Prism: window.PrismComponent
  },
  props: ['title', 'descr', 'code', 'mq'],
  data () {
    return {
      defaultColor: '#9e9e9e'
    }
  }
}
</script>

<template>
  <div class="panel">
    <div class="panel-head" :style="{ backgroundColor: $mqAliases[mq] ? defaultColor : undefined }">
      <span class="panel-title">{{ title }}</span>
    </div>
    <div class="panel-body">
      <p><strong>The following paragraph will only show {{ descr }}</strong></p>
      <p v-mq-show-if="mq">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Velit ipsam omnis repellat, dolor incidunt, illo recusandae?</p>
    </div>

    <div class="panel-footer">
      <prism :code="code" language="html"/>
    </div>
  </div>
</template>
