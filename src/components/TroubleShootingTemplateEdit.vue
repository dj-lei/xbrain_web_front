<template lang="pug">
  div(id="app")
    v-app(id="inspire")
      template
        v-card(color="grey lighten-4", dark, flat, height="50px")
          v-toolbar(dense color="yellow darken-3" dark)
            v-toolbar-title MineSweeper Template
            v-divider(class="mx-4", inset, vertical)
            template(v-if='isAuthenticated === true')
              v-btn(@click="newItem") New Template
            v-spacer
            v-btn(@click="dialogVideo = true") Instruction
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
            v-dialog(v-model="dialogReleaseTask" max-width="800px")
              v-card(color='grey lighten-3')
                v-card-title(class="headline") Detail
                v-container
                  v-text-field(ref="group" v-model="group" required :rules="[() => !!group || 'This field is required']" dense outlined label="fill group or project")
                  v-card  
                    div(id='editor')
                  v-spacer(class="mt-8")
                  v-row
                    v-file-input(v-model="logs", solo, color="deep-purple accent-4",  label="Upload logs", multiple, placeholder="Upload damage logs", prepend-icon="mdi-paperclip", outlined, :show-size="1000")
                v-card-actions
                  v-spacer
                  v-btn(color="blue darken-1" text @click="releaseTaskConfirm") Release
                  v-spacer
            v-dialog(v-model='dialogImages', max-width="700px")
              v-card(class="mx-auto")
                Images(ref="images", v-bind:images='uploadImages')
      v-card
        v-card-title
          v-text-field(v-model="search" label="Search" single-line hide-details)
        v-data-table(:search="search" :headers="headers", :items="data", sort-by="Date", class="elevation-1")
          template(v-slot:item.actions="{ item }")
            v-tooltip(bottom)
              template(v-slot:activator="{ on,attrs }")
                v-icon(small, class="mr-2", v-bind="attrs", v-on="on", @click="editItem(item)") mdi-pencil
              span edit
            template(v-if='isAuthenticated === true')
              v-tooltip(bottom)
                template(v-slot:activator="{ on,attrs }")
                  v-icon(small, class="mr-2", v-bind="attrs", v-on="on", @click="deleteItem(item)") mdi-delete
                span delete
              v-tooltip(bottom)
                template(v-slot:activator="{ on,attrs }")
                  v-icon(small, v-bind="attrs", v-on="on", @click="releaseTask(item)") mdi-antenna
                span release
      v-dialog(v-model='dialogVideo', max-width="1024px")
        v-card(class="mx-auto")
          video-player(:options="videoOptions")
</template>

<script>
import MindEdit from './MindEdit.vue'
import VideoPlayer from "./common/video.vue"
import EditorJS from '@editorjs/editorjs'
import { get, sync } from 'vuex-pathify'
import MineSweeperEditMP4 from '../assets/FinalMineSweeperEdit.mp4'

export default {
  components: {
    MindEdit,
    VideoPlayer
  },
  computed: {
    username: sync('username'),
    isAuthenticated: sync('isAuthenticated')
  },
  data () {
    return {
      nodeData: {},
      dialog: false,
      dialogDelete: false,
      dialogSaveTemplate: false,
      dialogReleaseTask: false,
      dialogImages: false,
      dialogVideo: false,
      errorShown: false,
      headers: [
        // { text: 'Id', value: 'id' },
        { text: 'TemplateName', align: 'start', value: 'TemplateName'},
        { text: 'Date', value: 'Date' },
        { text: 'Actions', value: 'actions', sortable: false },
      ],
      group: '',
      search: '',
      data: [],
      editorData: {},
      desc: {},
      images: [],
      uploadImages: [],
      logs: [],
      tempData: '',
      templateName: 'new name',
      flagUpdateOrAdd: false,
      isModifyTemplate: '',
      operateId: '',
      videoOptions: {
				autoplay: true,
				controls: true,
				sources: [
					{
						src:
							MineSweeperEditMP4,
						  type: "video/mp4"
					}
				]
			}
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
      this.$nextTick(function(){
        this.editorData = new EditorJS(this.$common.getEditorJSConfig('editor',{}))
      })
    },
    uploadDataFunction(val) {
      this.editorData = val
    },
    async releaseTaskConfirm () {
      if(this.group === ''){
        this.$refs['group'].error = true 
        return 
      }
      this.$store.set('progress', true)
      this.editorData.save()
      .then((savedData) => {
        let formData = new FormData()
        formData.append("operate", 'release_task')
        formData.append("username", this.username)
        formData.append("group", this.group)
        formData.append("template_id", this.tempData.id)
        formData.append("description", JSON.stringify(savedData))
        formData.append("logs_size", this.logs.length)
        // formData.append("images_size", this.images.length)

        this.logs.forEach((log, index) => {
          formData.append(`logs_${index}`, log)
        })

        let config = {
          headers: {
          'Content-Type': 'multipart/form-data'
          }
        }
        this.$http.post(this.$urls.trouble_shooting_save, formData, config)
          .then(response => {
            this.tempData = ''
            setTimeout(() =>{
              this.$store.set('progress', false)
              this.dialogReleaseTask = false
            },1000)
          })
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
