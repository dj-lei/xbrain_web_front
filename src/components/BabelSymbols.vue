<template lang="pug">
  div(id="app")
    v-app(id="inspire")
      template
        v-card(color="grey lighten-4", dark, flat, height="50px")
          v-toolbar(dense)
            v-toolbar-title Symbols
            v-divider(class="mx-4", inset, vertical)
            v-btn(color="primary", dark, @click="newItem") New Symbol
            v-spacer
            v-dialog(v-model="dialog", max-width="800px", transition="dialog-bottom-transition")
              v-card
                SymbolEditor
            v-dialog(v-model="dialogSaveTemplate", max-width="500px")
              v-card
                v-card-title
                  span(class="headline") Symbol Save
                v-card-text
                  v-container
                    v-row
                      v-text-field(v-model='templateName', label="Symbol name")
                v-card-actions
                  v-spacer
                  v-btn(color="blue darken-1", text, @click="close") Cancel
                  v-btn(color="blue darken-1", text, @click="saveToServer") Save
            v-dialog(v-model="dialogDelete" max-width="500px")
              v-card
                v-card-title(class="headline") Are you sure you want to delete this symbol?
                v-card-actions
                  v-spacer
                  v-btn(color="blue darken-1" text @click="closeDelete") Cancel
                  v-btn(color="blue darken-1" text @click="deleteItemConfirm") OK
                  v-spacer
      v-data-table(:headers="headers", :items="data", sort-by="SymbolName", class="elevation-1")
        template(v-slot:item.actions="{ item }")
          v-tooltip(bottom)
            template(v-slot:activator="{ on,attrs }")
              v-icon(small, class="mr-2", v-bind="attrs", v-on="on", @click="editItem(item)") mdi-pencil
            span edit
          v-tooltip(bottom)
            template(v-slot:activator="{ on,attrs }")
              v-icon(small, class="mr-2", v-bind="attrs", v-on="on", @click="deleteItem(item)") mdi-delete
            span delete
</template>

<script>
import SymbolEditor from './common/symbol-editor.vue'
import { get, sync } from 'vuex-pathify'

export default {
  components: {
    SymbolEditor
  },
  computed: {
    username: sync('username')
  },
  data () {
    return {
      dialog: false,
      dialogDelete: false,
      dialogSaveTemplate: false,
      headers: [
        { text: 'Id', value: 'id' },
        { text: 'Category', align: 'start', value: 'Category'},
        { text: 'SymbolName', align: 'start', value: 'SymbolName'},
        { text: 'Icon', align: 'start', value: 'Icon'},
        { text: 'CreatedTime', value: 'CreatedTime' },
        { text: 'Actions', value: 'actions', sortable: false },
      ],
      data: [],
      templateName: 'new name',
      flagUpdateOrAdd: false,
      isModifyTemplate: '',
      operateId: '',
    }
  },

  created () {
    // this.initialize()
  },

  methods: {
    async initialize () {
      await this.$http.get(this.$urls.trouble_shooting_get, {
        params: {
            operate: 'get_template_titles',
        },
        })
        .then(response => {
          this.data = response.data.content
        })
    },
    dialogClose () {
      this.dialog = false
    },
    newItem () {
      this.nodeData = {
        'id': 'root',
        'topic': 'New Template',
        'root': true,
        'children': [],
      }
      this.templateName = 'new name'
      this.flagUpdateOrAdd = false
      this.dialog = true
    },

    async editItem (item) {
      await this.$http.get(this.$urls.trouble_shooting_get, {
        params: {
            operate: 'get_template',
            template_id: item.id,
        },
        })
        .then(response => {
          this.isModifyTemplate = item.TemplateName
          this.templateName = item.TemplateName
          this.operateId = response.data.id
          this.nodeData = response.data.content.nodeData
          this.flagUpdateOrAdd = true
          this.dialog = true
        })
    },

    deleteItem (item) {
      this.tempData = item
      this.dialogDelete = true
    },

    async deleteItemConfirm () {
      this.$store.set('progress', true)
      await this.$http.get(this.$urls.trouble_shooting_get, {
        params: {
            operate: 'delete_template',
            template_id: this.tempData.id,
        },
        })
        .then(response => {
          this.tempData = ''
          setTimeout(() =>{
            this.dialogDelete = false
            this.initialize()
            this.$store.set('progress', false)
          },1000)
        })
    },

    releaseTask (item) {
      this.tempData = item
      this.dialogReleaseTask = true
    },
    uploadDataFunction(val) {
      this.editorData = val
    },
    async releaseTaskConfirm () {
      this.$store.set('progress', true)
      let formData = new FormData()
      formData.append("operate", 'release_task')
      formData.append("username", this.username)
      formData.append("template_id", this.tempData.id)
      formData.append("description", JSON.stringify(this.editorData))
      formData.append("logs_size", this.logs.length)
      // formData.append("images_size", this.images.length)

      this.logs.forEach((log, index) => {
        formData.append(`logs_${index}`, log)
      })

      // this.images.forEach((image, index) => {
      //   formData.append(`images_${index}`, image)
      // })

      let config = {
        headers: {
        'Content-Type': 'multipart/form-data'
        }
      }
      await this.$http.post(this.$urls.trouble_shooting_save, formData, config)
        .then(response => {
          this.tempData = ''
          setTimeout(() =>{
            this.$store.set('progress', false)
            this.dialogReleaseTask = false
          },1000)
        })
    },

    close () {
      this.flagUpdateOrAdd = false
      this.dialogSaveTemplate = false
    },

    closeDelete () {
      this.dialogDelete = false
    },

    closeRelease () {
      this.desc = null
      this.images = []
    },

    showImages () {
      this.uploadImages = this.$common.readImages(this.images)
      this.dialogImages = true
    },

    save () {
      this.dialogSaveTemplate = true
    },

    async saveToServer () {
      this.$store.set('progress', true)
      let formData = new FormData()
      let saveDate = Object.assign({'TemplateName': this.templateName, 'Date': this.$common.getTime()}, this.$refs['mindEdit'].getAllData())
      formData.append("data", JSON.stringify(saveDate))
      let config = {
        headers: {
        'Content-Type': 'multipart/form-data'
        }
      }

      if ((this.flagUpdateOrAdd === false) || (this.isModifyTemplate !== this.templateName)) {
        formData.append("operate", 'new')
      } else {
        formData.append("operate", 'update')
        formData.append("template_id", this.operateId)
      }
      await this.$http.post(this.$urls.trouble_shooting_save, formData, config).then(
        (response)=>{
          console.log(response.data)
      }, (error) => {
        console.log(error)
      })
      setTimeout(() =>{
        this.operateId = ''
        this.flagUpdateOrAdd = false
        this.dialogSaveTemplate = false
        this.dialog = false
        this.initialize()
        this.$store.set('progress', false)
      },1000)
    },
  },
}
</script>
