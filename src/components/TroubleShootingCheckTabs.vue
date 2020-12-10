<template lang="pug">
  v-card
    v-toolbar(flat dark)
      v-btn(icon, dark, @click="close")
        v-icon mdi-close
      v-toolbar-title Checkpoint Details
    v-tabs(vertical, centered)
      template(v-if='isRoot === true')
        v-tab(class="me-10")
          v-icon(left) mdi-book
          span Desc
      template(v-else)
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
          template(v-if='isRoot === true')
            v-card-text(class="body-2 pl-2")
              div(v-for="(text, index) in desc.split('\\n')", :key="index") {{ text }}
          template(v-else)
            Comment(
              v-on:uploadChecklistComments="uploadChecklistComments"
              v-bind:comments='comments'
              v-bind:role='role'
            )
      v-tab-item
        v-card(class="mx-auto")
          Images(
            v-bind:role='role'
            v-bind:images='images'
            v-on:deleteChecklistImage="deleteChecklistImage"
          )
          template(v-if='role !== "visitor"')
            v-bottom-navigation(color="primary")
              v-file-input(v-model="addImages", prepend-icon="mdi-upload", solo, accept="image/*", hide-details, color="deep-purple accent-4",  label="Upload images", multiple, placeholder="Add images", outlined)
              v-btn(:disabled='addImages.length === 0', color="blue darken-1" text @click="uploadChecklistImages") Upload
      v-tab-item
        v-card
          v-data-table(:headers="headers", :items="logs", sort-by="created_time", class="elevation-1")
            template(v-slot:item.actions="{ item }")
              v-icon(small, class="mr-2", @click="downloadItem(item)") mdi-download
              template(v-if='role !== "visitor"')
                v-icon(small, @click="deleteItem(item)") mdi-delete
          template(v-if='role !== "visitor"')
            v-bottom-navigation(color="primary")
              v-file-input(v-model="addLogs", prepend-icon="mdi-upload", solo, hide-details, color="deep-purple accent-4",  label="Upload logs", multiple, placeholder="Add logs", outlined)
              v-btn(:disabled='addLogs.length === 0', color="blue darken-1" text @click="uploadChecklistLogs") Upload
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
    role: {
      type: String,
      default () {
        return 'visitor'
      }
    },
    isRoot: {
      type: Boolean,
      default () {
        return true
      }
    },
    desc: {
      type: String,
      default () {
        return ''
      }
    },
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
      this.addImages = []
    },
    uploadChecklistLogs () {
      this.$emit('uploadChecklistLogs', this.addLogs)
      this.addLogs = []
    },
    uploadChecklistComments (newcomment) {
      this.$emit('uploadChecklistComments', newcomment)
    },
    downloadItem (item) {
      this.$emit('downloadChecklistLog', item)
    },
    deleteItem (item) {
      this.$emit('deleteChecklistLog', item)
    },
    deleteChecklistImage(item) {
      this.$emit('deleteChecklistImage', item)
    },
    close(){
      this.addImages = []
      this.addLogs = []
      this.$emit('closeDialogCheckTabs')
    }
  }
}
</script>
