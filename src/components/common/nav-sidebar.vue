<template lang="pug">
  div
    v-list.py-2(dense, dark)
      template(v-for='item of items')
        v-list-item(
          v-if='item.k === `link`'
          :href='item.t'
          )
          v-list-item-title {{ item.l }}
        v-divider.my-2(v-else-if='item.k === `divider`')
        v-subheader.pl-4(v-else-if='item.k === `header`') {{ item.l }}
</template>

<script>
export default {
  data() {
    return {
      items: [
        {
          'l': 'tools',
          'k': 'header',
          't': '',
        },
        {
          'l': '',
          'k': 'divider',
          't': '',
        },
        {
          'l': 'pinmux',
          'k': 'link',
          't': '#/pinmux',
        },
        {
          'l': 'trouble_shooting_edit',
          'k': 'link',
          't': '#/trouble_shooting_template_edit',
        },
        {
          'l': 'trouble_shooting_task',
          'k': 'link',
          't': '#/trouble_shooting_task',
        }
      ]
    }
  },
}
</script>
