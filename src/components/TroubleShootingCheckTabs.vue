<template lang="pug">
  v-card
    //- v-toolbar(flat dark)
    //-   v-btn(icon, dark, @click="close")
    //-     v-icon mdi-close
    //-   v-toolbar-title Checkpoint Details
    //- v-dialog(v-model="dialogRichTextEdit", transition="dialog-bottom-transition", max-width="800px")
      v-card
        v-toolbar(dark)
          v-btn(icon, dark, @click="dialogRichTextEdit = false")
            v-icon mdi-close
          v-toolbar-title COMMENT EDIT
          v-spacer
          v-toolbar-items
            v-btn(class="mr-2", dark, text, @click="uploadChecklistComments") SAVE
        v-card(color='grey lighten-3')
          v-container
            v-card
              div(id="commentEditor")
    v-tabs(vertical, centered)
      template(v-if='isRoot === true')
        v-tab(class="me-10")
          v-icon(left) mdi-book
          span Desc
      template(v-else)
        v-tab
          v-icon(left) mdi-message-text
          span Comment
      //- v-tab(class="me-5")
        v-icon(left) mdi-image
        span Images
      v-tab(class="me-10")
        v-icon(left) mdi-download
        span Logs
      v-tab-item
        //- v-card(color='grey lighten-3')
          v-container
            v-layout(row)
              v-flex.page-col-sd(xl2, lg12)
                v-card
                  template(v-if='isRoot === true')
                    div(id="descEditor")
                  template(v-else)
        v-container
          v-layout(row)
            v-row(class="d-flex justify-center")
              v-col(class="pa-2")
                v-flex.page-col-sd(xl2, lg12)
                  v-card
                    div(id="commentsEditor")
                v-flex.page-col-content(xs12,  xl10)
                  v-btn(color="blue darken-1" dark top fab @click="newPost")
                    v-icon mdi-plus
              template(v-if='dialogRichTextEdit === true')
                v-divider(vertical)
                v-col(class="pa-2")
                  v-flex.page-col-sd(xl2, lg12)
                    v-card
                      div(id="commentEditor")
                //- v-flex.page-col-content(xs12,  xl10)
                  //- template(v-if='isRoot === false')

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
// import Images from './common/images.vue'
import RichText from './common/rich-text.vue'
import Comment from './common/comments.vue'
import EditorJS from '@editorjs/editorjs'

export default {
  components: {
    // Images,
    RichText,
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
      type: Object,
      default () {
        return {}
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
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      dialogRichTextEdit: false,
      addImages: [],
      addLogs: [],
      headers: [
        { text: 'Name', value: 'name' },
        { text: 'Username', value: 'username'},
        { text: 'CreatedTime', value: 'created_time' },
        { text: 'Actions', value: 'actions', sortable: false },
      ],
      editData: {},
      commentEditor: {},
    }
  },
  mounted(){
    this.$nextTick(function(){
      if (this.isRoot === true){
        var editor1 = new EditorJS(this.$common.getEditorJSConfig('descEditor',this.desc))
      }
    })
  },
  watch: {
    comments(val) {
      if (val !== {}){
        var editor = new EditorJS(this.$common.getEditorJSConfig('commentsEditor',val))
      }
    },
  },
  methods: {
    newPost() {
      // var editor = new EditorJS(this.$common.getEditorJSConfig('commentEditor',{}))
      this.dialogRichTextEdit = true
      this.$nextTick(function(){
        this.commentEditor = new EditorJS(this.$common.getEditorJSConfig('commentEditor',{}))
      })
    },
    uploadDataFunction(val) {
      this.editData = val
    },
    uploadChecklistImages () {
      this.$emit('uploadChecklistImages', this.addImages)
      this.addImages = []
    },
    uploadChecklistLogs () {
      this.$emit('uploadChecklistLogs', this.addLogs)
      this.addLogs = []
    },
    uploadChecklistComments () {
      this.commentEditor.save()
      .then((savedData) => {
        this.$emit('uploadChecklistComments', savedData)
        this.dialogRichTextEdit = false
      })
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
