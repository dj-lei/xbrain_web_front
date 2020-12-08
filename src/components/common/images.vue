<template lang="pug">
  v-card(class="mx-auto")
    v-container(fluid)
      v-item-group
        v-row(dense)
          v-col(v-for="item in images" :key="item.uuid" :cols="3")
            v-hover(v-slot="{ hover }")
              v-card(:elevation="hover ? 16 : 2" :class="{ 'on-hover': hover }"  @click="showCarousel")
                v-item(v-slot="{ active, toggle }")
                  v-img(height="100px" class="text-right" contain :src='`data:image/png;base64,` + item.content')
                    v-btn(icon, class="mt-16", @click.stop="deleteItem(item)")
                      v-icon mdi-close
    v-dialog(v-model='dialogImages', max-width="700px")
      v-carousel
        v-carousel-item(v-for="item in images" :key="item.uuid")
          v-img(contain :src='`data:image/png;base64,` + item.content')
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
    },
    deleteItem (item) {
      this.$emit('deleteChecklistImage', item)
    }
  }
}
</script>
