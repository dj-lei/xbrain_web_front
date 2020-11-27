<template>
  <v-carousel>
    <v-carousel-item
      v-for="(item,i) in images"
      :key="i"
      reverse-transition="fade-transition"
      transition="fade-transition"
    >
      <v-img
      max-height="500"
      contain
      :src="item"
      >
      </v-img>
    </v-carousel-item>
  </v-carousel>
</template>

<script>
export default {
  props: {
    images: {
      type: Array,
      default: () => ([])
    },
  },
  data () {
    return {
    }
  },
}
</script>
