<template lang="pug">
  .mind
    v-app
      v-card
        div(id="map" style="width:100%;height:630px")
        template(v-if='contextMenu === false')
          v-bottom-navigation(color="primary")
            v-btn(@click="dialogDesc = true") Description
              v-icon mdi-book
            v-btn(@click="showImages") Images
              v-icon mdi-image
            v-btn(@click="downloadLogs") Logs
              v-icon mdi-download
        v-dialog(v-model="dialogDesc", width="500")
          v-card
            v-card-title(class="headline grey lighten-2") Description
            v-card-text {{ desc }}
        v-dialog(v-model="dialog" max-width="1000px")
          v-card
            v-toolbar(dark)
              v-btn(icon, dark, @click="dialog = false")
                v-icon mdi-close
              v-toolbar-title Task
              v-spacer
              v-toolbar-items
                v-btn(dark, text, @click="save") Save
            v-dialog(v-model="dialogShooting" max-width="500px")
              v-card
                v-card-title(class="headline") Are you sure this item is the cause of the damage?
                v-card-actions
                  v-spacer
                  v-btn(color="blue darken-1" text @click="dialogShooting = false") Cancel
                  v-btn(color="blue darken-1" text @click="shootingConfirm") OK
                  v-spacer
            v-data-table(v-model='selected', show-select, :headers="headers", :items="data", class="elevation-1")
              template(v-slot:item.data-table-select="{ isSelected, select, item }")
                v-simple-checkbox(color="green", :disabled='item.Status !== "active"', :value='item.Status !== "active" ? true : isSelected', @input="select($event)")
              template(v-slot:item.Status="{ item }")
                v-chip(:color="getColor(item.Status)", dark) {{ item.Status }}
              template(v-slot:item.actions="{ item }")
                v-icon(small, class="mr-2", @click="shooting(item)") mdi-access-point
        v-dialog(v-model='dialogImages', max-width="600px")
          Images(v-bind:images='downloadImages')
        v-dialog(v-model='dialogCheckTabs', dark, max-width="1000px")
          CT(
            v-on:uploadChecklistImages="uploadChecklistImages"
            v-on:uploadChecklistLogs="uploadChecklistLogs"
            v-on:downloadChecklistLog="downloadChecklistLog"
            v-on:uploadChecklistComments="uploadChecklistComments"
            v-bind:images='checklistImages'
            v-bind:logs='checklistLogs'
            v-bind:comments='checklistComments'
          )
</template>

<script>
import MindElixir from "mind-elixir"
import { get, sync } from 'vuex-pathify'
import Images from './common/images'
import CT from './TroubleShootingCheckTabs'

export default {
  components: {
    Images,
    CT
  },
  props: {
    desc: {
      type: String,
      default () {
        return ''
      }
    },
    nodeData: {
      type: Object,
      default () {
        return {}
      }
    },
    contextMenu: {
      type: Boolean,
      default: true
    },
    template_id: {
      type: String,
      default: ''
    },
  },
  data () {
    return {
      dialog: false,
      dialogShooting: false,
      dialogImages: false,
      dialogDesc: false,
      dialogCheckTabs: false,
      nodeId: '',
      downloadImages: [],
      checklistImages: [],
      checklistLogs: [],
      checklistComments: [],
      tempData: '',
      selected: [],
      data: [],
      mind: '',
      headers: [
        { text: 'Id', value: 'id' },
        { text: 'Task', align: 'start', value: 'Task'},
        { text: 'Status', value: 'Status' },
        { text: 'Executor', value: 'Executor' },
        { text: 'Actions', value: 'actions', sortable: false },
      ],
    }
  },
  computed: {
    username: sync('username')
  },
  mounted() {
    this.mind = new MindElixir({
      el: '#map',
      direction: 2,
      // create new map data
      data: MindElixir.new('new topic'),
      // or set as data that is return from `.getAllData()`
      draggable: true, // default true
      contextMenu: this.contextMenu, // default true
      toolBar: false, // default true
      nodeMenu: false, // default true
      keypress: true, // default true
      locale: 'en', // [zh_CN,zh_TW,en,ja]
      allowUndo: false,
    })
    this.mind.init()

    if (this.contextMenu === false) {
      this.mind.bus.addListener('selectNode', node => {
        if (node.hasOwnProperty('children')) {
          this.getNodeDetails(node)
        }else {
          this.getChecklistDetails(node)
        }
      })
    }
  },
  watch:{
    nodeData(val) {
      this.mind.nodeData = val
      this.mind.init()
    },
    dialog(val) {
      if (val === false){
        this.selected = []
        this.data = []
      }
    },
    dialogCheckTabs(val){
      if (val === false){
        this.checklistImages = []
        this.checklistLogs = []
      }
    }
  },
  methods: {
    getAllData () {
      return this.mind.getAllData()
    },
    getChecklistDetails (val) {
      this.nodeId = val.id
      this.getChecklistComments()
      this.getChecklistImages()
      this.getChecklistLogs()
      this.dialogCheckTabs = true
    },
    async getChecklistComments () {
      await this.$http.get(this.$urls.trouble_shooting_get, {
        params: {
            operate: 'get_checklist_comments',
            template_id: this.template_id,
            node_id: this.nodeId,
        },
        })
        .then(response => {
          this.checklistComments = response.data.content
        })
    },
    async uploadChecklistComments (newcomment) {
      let formData = new FormData()
      formData.append("operate", 'upload_checklist_comments')
      formData.append("username", this.username)
      formData.append("template_id", this.template_id)
      formData.append("node_id", this.nodeId)
      formData.append("comments", newcomment)

      let config = {
        headers: {
        'Content-Type': 'multipart/form-data'
        }
      }
      await this.$http.post(this.$urls.trouble_shooting_save, formData, config)
      .then(response => {
        setTimeout(() =>{
          this.getChecklistComments()
        },1000)
      })
    },
    async getChecklistImages () {
      await this.$http.get(this.$urls.trouble_shooting_get, {
        params: {
            operate: 'get_checklist_images',
            template_id: this.template_id,
            node_id: this.nodeId,
        },
        })
        .then(response => {
          this.checklistImages = response.data.content
        })
    },
    async uploadChecklistImages (addImages) {
      let formData = new FormData()
      formData.append("operate", 'upload_checklist_images')
      formData.append("username", this.username)
      formData.append("template_id", this.template_id)
      formData.append("node_id", this.nodeId)
      formData.append("size", addImages.length)
      addImages.forEach((image, index) => {
        formData.append(`images_${index}`, image)
      })

      let config = {
        headers: {
        'Content-Type': 'multipart/form-data'
        }
      }
      await this.$http.post(this.$urls.trouble_shooting_save, formData, config)
      .then(response => {
        setTimeout(() =>{
          this.getChecklistImages()
        },1000)
      })
    },
    async getChecklistLogs () {
      await this.$http.get(this.$urls.trouble_shooting_get, {
        params: {
            operate: 'get_checklist_logs',
            template_id: this.template_id,
            node_id: this.nodeId,
        },
        })
        .then(response => {
          this.checklistLogs = response.data.content
        })
    },
    async uploadChecklistLogs (addLogs) {
      let formData = new FormData()
      formData.append("operate", 'upload_checklist_logs')
      formData.append("username", this.username)
      formData.append("template_id", this.template_id)
      formData.append("node_id", this.nodeId)
      formData.append("size", addLogs.length)
      addLogs.forEach((log, index) => {
        formData.append(`logs_${index}`, log)
      })

      let config = {
        headers: {
        'Content-Type': 'multipart/form-data'
        }
      }
      await this.$http.post(this.$urls.trouble_shooting_save, formData, config)
      .then(response => {
        setTimeout(() =>{
          this.getChecklistLogs()
        },1000)
      })
    },
    async downloadChecklistLog (item){
      await this.$http.get(this.$urls.trouble_shooting_get, {
        params: {
            operate: 'get_checklist_log',
            template_id: this.template_id,
            node_id: this.nodeId,
            uuid_id: item.uuid,
        },
        responseType: 'blob' ,
        })
        .then(response => {
          const blob = new Blob([response.data], { type: 'application/txt' })
          const link = document.createElement('a')
          link.href = URL.createObjectURL(blob)
          link.download = response.headers['content-disposition']
          link.click()
          URL.revokeObjectURL(link.href)
        })
    },
    async getNodeDetails (val) {
      await this.$http.get(this.$urls.trouble_shooting_get, {
        params: {
            operate: 'get_task_details',
            template_id: this.template_id,
            node_id: val.id,
        },
        })
        .then(response => {
          this.data = response.data.content
          this.dialog = true
        })
    },
    async save () {
      let formData = new FormData()
      formData.append("operate", 'update_task')
      formData.append("template_id", this.template_id)
      formData.append("username", this.username)
      formData.append("selected", JSON.stringify(this.selected))
      let config = {
        headers: {
        'Content-Type': 'multipart/form-data'
        }
      }
      await this.$http.post(this.$urls.trouble_shooting_save, formData, config).then(
        (response)=>{
        this.mind.nodeData = response.data.content.nodeData
        this.mind.init()
      }, (error) => {
        console.log(error)
      })
      setTimeout(() =>{
        this.dialog = false
      },1000)
    },
    shooting(item) {
      this.tempData = item
      this.dialogShooting = true
    },
    async shootingConfirm () {
      let formData = new FormData()
      formData.append("operate", 'shooting')
      formData.append("template_id", this.template_id)
      formData.append("username", this.username)
      formData.append("selected", JSON.stringify(this.tempData))
      let config = {
        headers: {
        'Content-Type': 'multipart/form-data'
        }
      }
      await this.$http.post(this.$urls.trouble_shooting_save, formData, config).then(
        (response)=>{
        this.mind.nodeData = response.data.content.nodeData
        this.mind.init()
      }, (error) => {
        console.log(error)
      })
      setTimeout(() =>{
        this.dialog = false
      },1000)
    },
    async showImages () {
      await this.$http.get(this.$urls.trouble_shooting_get, {
        params: {
            operate: 'get_task_images',
            template_id: this.template_id,
        },
        })
        .then(response => {
          this.downloadImages = response.data.content
          this.dialogImages = true
        })
    },
    async downloadLogs () {
      await this.$http.get(this.$urls.trouble_shooting_get, {
        params: {
            operate: 'get_task_logs',
            template_id: this.template_id,
        },
        responseType: 'blob' ,
        })
        .then(response => {
          const blob = new Blob([response.data], { type: 'application/txt' })
          const link = document.createElement('a')
          link.href = URL.createObjectURL(blob)
          link.download = response.headers['content-disposition']
          link.click()
          URL.revokeObjectURL(link.href)
        })
    },
    getColor (status) {
      if (status === 'close') return 'green'
      else if (status === 'active') return 'orange'
      else return 'red'
    },
  },
}
</script>

<style>
#mind {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #c0392c;
  margin-top: 60px;
}
</style>

