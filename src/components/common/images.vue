<template lang="pug">
  v-card(class="mx-auto")
    v-container(fluid)
      v-item-group
        v-row(dense)
          v-col(v-for="(item,i) in images" :key="i" :cols="3")
            v-hover(v-slot="{ hover }")
              v-card(:elevation="hover ? 16 : 2" :class="{ 'on-hover': hover }"  @click="showCarousel")
                v-item(v-slot="{ active, toggle }")
                  v-img(height="100px" class="text-right" contain :src="item")
                    v-btn(icon class="mt-16")
                      v-icon mdi-close
    v-dialog(v-model='dialogImages', max-width="700px")
      v-carousel
        v-carousel-item(v-for="(item,i) in images" :key="i")
          v-img(contain :src="item")
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
      dialogImages: false,
    }
  },
  methods: {
    showCarousel () {
      this.dialogImages = true
    }
  }
}
</script>
