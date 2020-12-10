<template lang="pug">
  div(id="app")
    v-app(id="inspire")
      template
        v-card(color="grey lighten-4", dark, flat, height="50px")
          v-toolbar(dense)
            v-toolbar-title Trouble Shooting Template
            v-divider(class="mx-4", inset, vertical)
            v-btn(color="primary", dark, @click="newItem") New Template
            v-spacer
            v-dialog(v-model="dialog", fullscreen, eager, hide-overlay, transition="dialog-bottom-transition")
              v-card
                MindEdit(ref="mindEdit"
                v-bind:nodeData='nodeData'
                v-on:dialogClose="dialogClose"
                v-on:saveToServer="save"
                )
            v-dialog(v-model="dialogSaveTemplate", max-width="500px")
              v-card
                v-card-title
                  span(class="headline") Template Save
                v-card-text
                  v-container
                    v-row
                      v-text-field(v-model='templateName', label="Template name")
                v-card-actions
                  v-spacer
                  v-btn(color="blue darken-1", text, @click="close") Cancel
                  v-btn(color="blue darken-1", text, @click="saveToServer") Save
            v-dialog(v-model="dialogDelete" max-width="500px")
              v-card
                v-card-title(class="headline") Are you sure you want to delete this item?
                v-card-actions
                  v-spacer
                  v-btn(color="blue darken-1" text @click="closeDelete") Cancel
                  v-btn(color="blue darken-1" text @click="deleteItemConfirm") OK
                  v-spacer
            v-dialog(v-model="dialogReleaseTask" max-width="700px")
              v-card
                v-card-title(class="headline") Damage Detail
                v-card-text
                  v-container
                    v-textarea(v-model="desc", auto-grow, filled, color="deep-purple", label="Detailed damage text description", placeholder="description",rows="5")
                    v-row
                      v-file-input(v-model="images",  solo,  accept="image/*",  prepend-icon="mdi-camera", counter, color="deep-purple accent-4",  label="Upload images", multiple, placeholder="Upload damage images", outlined, :show-size="1000")
                      v-btn(class="mt-2", :disabled='images.length === 0', color="blue darken-1" text @click="showImages") Show
                    v-row
                      v-file-input(v-model="logs", solo, color="deep-purple accent-4",  label="Upload logs", multiple, placeholder="Upload damage logs", prepend-icon="mdi-paperclip", outlined, :show-size="1000")
                v-card-actions
                  v-spacer
                  v-btn(color="blue darken-1" text @click="releaseTaskConfirm") Release
                  v-spacer
            v-dialog(v-model='dialogImages', max-width="700px")
              v-card(class="mx-auto")
                Images(ref="images", v-bind:images='uploadImages')
      v-data-table(:headers="headers", :items="data", sort-by="TemplateName", class="elevation-1")
        template(v-slot:item.actions="{ item }")
          v-icon(small, class="mr-2", @click="editItem(item)") mdi-pencil
          v-icon(small, class="mr-2", @click="deleteItem(item)") mdi-delete
          v-icon(small, @click="releaseTask(item)") mdi-download
</template>

<script>
import MindEdit from './MindEdit.vue'
import Images from './common/images'
import { get, sync } from 'vuex-pathify'

export default {
  components: {
    MindEdit,
    Images
  },
  computed: {
    username: sync('username')
  },
  data () {
    return {
      nodeData: {},
      dialog: false,
      dialogDelete: false,
      dialogSaveTemplate: false,
      dialogReleaseTask: false,
      dialogImages: false,
      errorShown: false,
      headers: [
        { text: 'Id', value: 'id' },
        { text: 'TemplateName', align: 'start', sortable: false, value: 'TemplateName'},
        { text: 'Date', value: 'Date' },
        { text: 'Actions', value: 'actions', sortable: false },
      ],
      data: [],
      desc: null,
      images: [],
      uploadImages: [],
      logs: [],
      tempData: '',
      templateName: 'new name',
      flagUpdateOrAdd: false,
      isModifyTemplate: '',
      operateId: '',
    }
  },

  watch: {
    dialog (val) {
      val || this.close()
    },
    dialogDelete (val) {
      val || this.closeDelete()
    },
    dialogReleaseTask (val) {
      val || this.closeRelease()
    }
  },

  created () {
    this.initialize()
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

    async releaseTaskConfirm () {
      this.$store.set('progress', true)
      let formData = new FormData()
      formData.append("operate", 'release_task')
      formData.append("username", this.username)
      formData.append("template_id", this.tempData.id)
      formData.append("description", this.desc)
      formData.append("logs_size", this.logs.length)
      formData.append("images_size", this.images.length)

      this.logs.forEach((log, index) => {
        formData.append(`logs_${index}`, log)
      })

      this.images.forEach((image, index) => {
        formData.append(`images_${index}`, image)
      })

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
