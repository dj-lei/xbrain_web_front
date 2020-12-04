<template lang="pug">
  v-card
    v-toolbar(flat dark)
      v-toolbar-title Checkpoint Details
    v-tabs(vertical, centered)
      v-tab
        v-icon(left) mdi-message-text
        span Comment
      v-tab(class="me-5")
        v-icon(left) mdi-image
        span Images
      v-tab(class="me-10")
        v-icon(left) mdi-download
        span Logs
      v-tab-item
        v-card(color='grey lighten-3' class="overflow-hidden")
          Comment(v-on:uploadChecklistComments="uploadChecklistComments", v-bind:comments='comments')
      v-tab-item
        v-card(class="mx-auto")
          Images(v-bind:images='images')
          v-bottom-navigation(color="primary")
            v-file-input(v-model="addImages", prepend-icon="mdi-upload", solo, accept="image/*", hide-details, color="deep-purple accent-4",  label="Upload images", multiple, placeholder="Add images", outlined)
            v-btn(class="mt-2", :disabled='addImages.length === 0', color="blue darken-1" text @click="uploadChecklistImages") Upload
      v-tab-item
        v-card
          v-data-table(:headers="headers", :items="logs", sort-by="created_time", class="elevation-1")
            template(v-slot:item.actions="{ item }")
              v-icon(small, class="mr-2", @click="downloadItem(item)") mdi-download
              v-icon(small, @click="deleteItem(item)") mdi-delete
          v-bottom-navigation(color="primary")
            v-file-input(v-model="addLogs", prepend-icon="mdi-upload", solo, hide-details, color="deep-purple accent-4",  label="Upload logs", multiple, placeholder="Add logs", outlined)
            v-btn(class="mt-2", :disabled='addLogs.length === 0', color="blue darken-1" text @click="uploadChecklistLogs") Upload
</template>

<script>
import Images from './common/images.vue'
import Comment from './common/comments.vue'

export default {
  components: {
    Images,
    Comment
  },
  props: {
    images: {
      type: Array,
      default: () => ([])
    },
    logs: {
      type: Array,
      default: () => ([])
    },
    comments: {
      type: Array,
      default: () => ([])
    }
  },
  data () {
    return {
      addImages: [],
      addLogs: [],
      headers: [
        { text: 'Name', value: 'name' },
        { text: 'Username', value: 'username'},
        { text: 'CreatedTime', value: 'created_time' },
        { text: 'Actions', value: 'actions', sortable: false },
      ],
    }
  },
  methods: {
    uploadChecklistImages () {
      this.$emit('uploadChecklistImages', this.addImages)
    },
    uploadChecklistLogs () {
      this.$emit('uploadChecklistLogs', this.addLogs)
    },
    uploadChecklistComments (newcomment) {
      this.$emit('uploadChecklistComments', newcomment)
    },
    downloadItem (item) {
      this.$emit('downloadChecklistLog', item)
    },
    deleteItem () {

    },
  }
}
</script>
