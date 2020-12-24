<template lang="pug">
  div(id="app")
    v-app(id="inspire")
      template
        v-card(color="grey lighten-4", dark, flat, height="50px")
          v-dialog(v-model="dialogSaving" max-width="500px")
            v-card
              v-card-title(class="headline") Are you sure want to save this comment?
              v-card-actions
                v-spacer
                v-btn(color="blue darken-1" text @click="dialogSaving = false") Cancel
                v-btn(color="blue darken-1" text @click="savingConfirm") OK
                v-spacer
          v-dialog(v-model="dialogClosing" max-width="550px")
            v-card
              v-card-title(class="headline") Are you sure you've finished the feedback?
              v-card-actions
                v-spacer
                v-btn(color="blue darken-1" text @click="dialogClosing = false") Cancel
                v-btn(color="blue darken-1" text @click="closingConfirm") OK
                v-spacer
          v-toolbar(dense)
            v-toolbar-title Feedbacks
            v-divider(class="mx-4", inset, vertical)
            v-btn(color="primary", dark, @click="newItem") New Feedback
            v-spacer
            v-dialog(v-model="dialogRichTextEdit", transition="dialog-bottom-transition", max-width="800px")
              v-card
                v-toolbar(dark)
                  v-btn(icon, dark, @click="dialogRichTextEdit = false")
                    v-icon mdi-close
                  v-toolbar-title COMMENTS EDIT
                  v-spacer
                  v-toolbar-items
                    v-btn(class="mr-2", dark, text, @click="save") SAVE
                template(v-if='feedback_id === ""')
                  v-container
                    v-row
                      v-col(md="8")
                        v-text-field(
                          v-model="theme"
                          :rules="[() => !!theme || 'This field is required']"
                          label="Theme"
                          placeholder="theme"
                          required
                          outlined
                          dense
                        )
                      v-col(md="2")
                        v-autocomplete(
                          v-model="pathSelect"
                          :rules="[() => !!pathSelect || 'This field is required']"
                          :items="path"
                          label="Project"
                          placeholder="Select... project"
                          required
                          outlined
                          dense
                        )
                      v-col(md="2")
                        v-autocomplete(
                          v-model="typeSelect"
                          :rules="[() => !!typeSelect || 'This field is required']"
                          :items="type"
                          label="Type"
                          placeholder="Select... type"
                          required
                          outlined
                          dense
                        )
                //- ckeditor(:editor="editor" v-model="editorData" :config="editorConfig" @ready="onReady")
                v-card(color='grey lighten-3')
                  v-container
                    v-card
                      RichText(
                        ref="richText"
                        v-bind:data='editorData'
                        v-on:uploadDataFunction="uploadDataFunction"
                        )
      v-data-table(:headers="headers", :items="data", sort-by="Date", class="elevation-1")
        template(v-slot:item.Status="{ item }")
          v-chip(:color="getColor(item.Status)", dark) {{ item.Status }}
        template(v-slot:item.actions="{ item }")
          v-tooltip(bottom)
            template(v-slot:activator="{ on,attrs }")
              v-icon(small, class="mr-2", v-bind="attrs", v-on="on", @click="editItem(item)") mdi-pencil
            span edit
          v-tooltip(bottom)
            template(v-slot:activator="{ on,attrs }")
              v-icon(small, v-bind="attrs", v-on="on", @click="closeItem(item)") mdi-checkbox-marked-circle
            span finish
</template>

<script>
import RichText from './common/rich-text.vue'
import { get, sync } from 'vuex-pathify'

export default {
  components: {
    RichText
  },
  data () {
    return {
      dialogRichTextEdit: false,
      dialogSaving: false,
      dialogClosing: false,
      headers: [
        { text: 'Username', value: 'username'},
        { text: 'Theme', align: 'start', value: 'Theme'},
        { text: 'Project', value: 'Path' },
        { text: 'Type', value: 'Type' },
        { text: 'Status', value: 'Status' },
        { text: 'CreatedTime', value: 'CreatedTime' },
        { text: 'Actions', value: 'actions', sortable: false },
      ],
      feedback_id: '',
      theme: '',
      pathSelect: '',
      typeSelect: '',
      path: [],
      type: ['BUG', 'SUGGEST'],
      data: [],
      editorData: {},
      uploadData: {},
    }
  },
  computed: {
    username: sync('username'),
    pages: sync('pages')
  },
  created () {
    this.initialize()
  },
  mounted() {
    let project = ''
    this.pages.forEach((key) => {
      if (key.k === 'header'){
        if(key.l === 'TroubleShooting'){
          project = 'MineSweeper'
        }else {
          project = key.l
        }
      }else if (key.k === 'link'){
        this.path.push(project+`/`+key.l)
      }
    })
  },
  watch: {
    dialogClosing (val) {
      if (val === false) {
        this.feedback_id = ''
      }
    }
  },
  methods: {
    async initialize () {
      await this.$http.get(this.$urls.feedback_get, {
        params: {
            operate: 'get_feedback_titles',
        },
        })
        .then(response => {
          this.data = response.data.content
        })
    },
    newItem () {
      this.feedback_id = ''
      this.editorData = {}
      this.dialogRichTextEdit = true
    },
    save () {
      this.dialogSaving = true
      this.$refs.richText.getData()
    },
    uploadDataFunction(val) {
      this.uploadData = val
    },
    async savingConfirm () {
      this.$store.set('progress', true)

      let formData = new FormData()
      formData.append("feedback_id", this.feedback_id)
      formData.append("username", this.username)
      formData.append("theme", this.theme)
      formData.append("path", this.pathSelect)
      formData.append("type", this.typeSelect)
      formData.append("content", JSON.stringify(this.uploadData))

      let config = {
        headers: {
        'Content-Type': 'multipart/form-data'
        }
      }
      await this.$http.post(this.$urls.feedback_save, formData, config)
      .then(response => {
        setTimeout(() =>{
          this.dialogSaving = false
          this.dialogRichTextEdit = false

          this.initialize()
          this.$store.set('progress', false)
        },1000)
      })
    },
    closeItem (item) {
      this.feedback_id = item.id
      this.dialogClosing = true
    },
    async closingConfirm () {
      this.$store.set('progress', true)
      await this.$http.get(this.$urls.feedback_get, {
        params: {
            operate: 'finish_feedback',
            feedback_id: this.feedback_id,
        },
        })
        .then(response => {
          setTimeout(() =>{
            this.dialogClosing = false
            this.initialize()
            this.$store.set('progress', false)
        },1000)
        })
    },
    async editItem (item) {
      await this.$http.get(this.$urls.feedback_get, {
        params: {
            operate: 'get_feedback',
            feedback_id: item.id,
        },
        })
        .then(response => {
          this.editorData = response.data.content
          this.feedback_id = response.data.id
          this.dialogRichTextEdit = true
        })
    },
    getColor (status) {
      if (status === 'finish') return 'green'
      else return 'orange'
    },
  },
}
</script>
