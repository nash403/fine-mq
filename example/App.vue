<script>
import Panel from './Panel'

export default {
  name: 'App',
  components: {
    Panel,
    Prism: window.PrismComponent
  }
}
</script>

<template lang="html">
  <div class="container-small center">
    <div><strong>Current state for media queries:</strong></div>
    <p><em><prism language="javascript" :code="JSON.stringify($mqAliases)" /></em></p>

    <Panel
      title="Only small"
      descr="on small devices"
      mq="sm"
      code="&lt;p v-mq-show-if=&quot;sm&quot;&gt;Lorem ipsum dolor sit amet, ... &lt;/p&gt;" />

    <Panel
      title="Only medium"
      descr="on medium devices"
      mq="md"
      code="&lt;p v-mq-show-if=&quot;md&quot;&gt;Lorem ipsum dolor sit amet, ... &lt;/p&gt;" />

    <Panel
      title="Medium and large"
      descr="on medium and large devices"
      mq="md!"
      code="&lt;p v-mq-show-if=&quot;md!&quot;&gt;Lorem ipsum dolor sit amet, ... &lt;/p&gt;" />

    <Panel
      title="Only larger than medium"
      descr="on devices larger than medium"
      mq="md+"
      code="&lt;p v-mq-show-if=&quot;md+&quot;&gt;Lorem ipsum dolor sit amet, ... &lt;/p&gt;" />

    <Panel
      title="Only large"
      descr="on large devices"
      mq="lg"
      code="&lt;p v-mq-show-if=&quot;lg&quot;&gt;Lorem ipsum dolor sit amet, ... &lt;/p&gt;" />
  </div>
</template>

<style>
.container-small.center {
  margin: 0 auto;
}
@media screen and (max-width: 768px) {
  .container-small {
    width: 100%;
  }
}
</style>

