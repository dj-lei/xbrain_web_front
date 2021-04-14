<template lang="pug">
  .mind
    v-app
      v-card
        v-toolbar(dark dense color="yellow darken-3")
          v-btn(icon, dark, @click="$emit('dialogClose')")
            v-icon mdi-close
          template(v-if='contextMenu === false')
            v-toolbar-title Executor Task
            v-spacer
            v-toolbar-items
              v-btn(color="grey darken-3" @click="details") DETAILS
              v-btn(color="grey darken-3" @click="shareUrl") SHARE
              //- button(type="button" @click="shareUrl") SHARE
          template(v-else)
            v-toolbar-title Edit Template
            v-spacer
            v-toolbar-items
              template(v-if='isAuthenticated === true')
                v-btn(dark, text, @click="$emit('saveToServer')") SAVE
        div(id="map" :style='`width:100%;height:`+ screeHeight +`px`')
        v-dialog(v-model="dialog" :persistent="true" max-width="1000px")
          v-card
            v-toolbar(dark)
              v-btn(icon, dark, @click="dialog = false")
                v-icon mdi-close
              v-toolbar-title Task
              v-spacer
              v-toolbar-items
                v-btn(class="mr-2", dark, text, @click="apply") APPLY
                //- v-btn(dark, text, @click="save") Close
            v-dialog(v-model="dialogApply" max-width="630px")
              v-card
                v-card-title(class="headline") Are you sure you want to change these options?
                v-card-actions
                  v-spacer
                  v-btn(color="blue darken-1" text @click="dialogApply = false") Cancel
                  v-btn(color="blue darken-1" text @click="applyConfirm") OK
                  v-spacer
            v-data-table(:headers="headers", :items="data", class="elevation-1")
              template(v-slot:item.Status="{ item }")
                v-slider.caption(v-model="item.Status" :tick-labels="ticksLabels" :max="3" step="1" tick-size="4")
                //- v-chip(:color="getColor(item.Status)", dark) {{ item.Status }}
              template(v-slot:item.Schedule="{ item }")
                v-slider(v-model="item.Schedule" :thumb-size="24" thumb-label="always")
        template(v-if='dialogCheckTabs === true')
          v-dialog(v-model='dialogCheckTabs', dark, max-width="1400px")
            CT(
              v-on:uploadChecklistImages="uploadChecklistImages"
              v-on:deleteChecklistImage="deleteChecklistImage"
              v-on:uploadChecklistLogs="uploadChecklistLogs"
              v-on:downloadChecklistLog="downloadChecklistLog"
              v-on:deleteChecklistLog="deleteChecklistLog"
              v-on:uploadChecklistComments="uploadChecklistComments"
              v-on:closeDialogCheckTabs="closeDialogCheckTabs"
              v-bind:role='role'
              v-bind:desc='desc'
              v-bind:images='checklistImages'
              v-bind:logs='checklistLogs'
              v-bind:comments='checklistComments'
              v-bind:isRoot='isRoot'
            )
        v-dialog(v-model="dialogShareUrl" max-width="600px")
          v-card
            v-card-text {{ addrShareUrl }}

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
    role: {
      type: String,
      default () {
        return 'visitor'
      }
    },
    desc: {
      type: Object,
      default () {
        return {}
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
      dialogApply: false,
      dialogCheckTabs: false,
      dialogShareUrl: false,
      dialogSaving: false,
      isRoot: true,
      nodeId: '',
      nodeTopic: '',
      addrShareUrl: '',
      checklistImages: [],
      checklistLogs: [],
      checklistComments: {},
      screeHeight: (document.documentElement.clientHeight-65).toString(),
      tempData: '',
      selected: [],
      data: [],
      mind: '',
      headers: [
        // { text: 'Id', value: 'id' },
        { text: 'TaskName', align: 'start', value: 'Task'},
        { text: 'Status', value: 'Status' },
        { text: 'Schedule', value: 'Schedule'},
        // { text: 'Executor', value: 'Executor' },
        // { text: 'Shooting/Close', value: 'actions', sortable: false },
      ],
      ticksLabels: ['GoOn','Done','Uncert','Shoot']
    }
  },
  computed: {
    username: sync('username'),
    isAuthenticated: sync('isAuthenticated')
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
      overflowHidden: true,
      toolBar: false, // default true
      nodeMenu: false, // default true
      keypress: true, // default true
      locale: 'en', // [zh_CN,zh_TW,en,ja]
      allowUndo: true,
    })
    this.mind.init()

    if (this.contextMenu === false) {
      this.mind.bus.addListener('selectNode', node => {
        if (node.hasOwnProperty('children') && this.isAuthenticated === true) {
          this.getNodeDetails(node)
        }else if (node.hasOwnProperty('children') !== true) {
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
    dialogCheckTabs(val) {
      if (val === false){
        this.closeDialogCheckTabs()
      }
    }
  },
  methods: {
    getAllData () {
      return this.mind.getAllData()
    },
    closeDialogCheckTabs () {
      // if (this.checklistLogs.length > 0 || this.checklistComments.blocks.length > 0) {
      //   if (this.nodeTopic.indexOf("(*)") === -1){
      //     this.updateChecklistAsterisk()
      //   }
      // }else if (this.checklistLogs.length === 0 && this.checklistComments.blocks.length === 0) {
      //   if (this.nodeTopic.indexOf("(*)") >= 0 ){
      //     this.updateChecklistAsterisk()
      //   }
      // }
      this.dialogCheckTabs = false
      this.checklistComments = {}
      this.checklistLogs = []
    },
    details () {
      this.isRoot = true
      this.nodeId = 'root'
      // this.getChecklistImages()
      this.getChecklistLogs().then(this.dialogCheckTabs = true)
    },
    shareUrl () {
      this.addrShareUrl = 'http://'+window.location.host+'/?trouble_shooting_task_id='+this.template_id
      this.dialogShareUrl = true
    },
    async getChecklistDetails (val) {
      this.isRoot = false
      this.nodeId = val.id
      this.nodeTopic = val.topic
      await this.getChecklistLogs()
      await this.getChecklistComments().then(this.dialogCheckTabs = true)
      // this.getChecklistImages()
    },
    async updateChecklistAsterisk () {
      await this.$http.get(this.$urls.trouble_shooting_get, {
        params: {
            operate: 'update_checklist_asterisk',
            template_id: this.template_id,
            node_id: this.nodeId,
        },
        })
        .then(response => {
          this.mind.nodeData = response.data.content.nodeData
          this.mind.init()
        })
    },
    async getChecklistComments () {
      let comments = {}
      await this.$http.get(this.$urls.trouble_shooting_get, {
        params: {
            operate: 'get_checklist_comments',
            template_id: this.template_id,
            node_id: this.nodeId,
        },
        })
        .then(response => {
          let comment = []
          let res = response.data.content
          res.forEach((item, index) => {
            comment = comment.concat(
              [{
                "type" : "delimiter",
                "data" : {}
              },
              {
                "data": {"text": item.username + " | " + item.created_time},
                "type": "paragraph"
              }]
            )
            comment = comment.concat(item.comment.blocks)
            comments['time'] = item.comment.time
            comments['version'] = item.comment.version
          })
          comments['blocks'] = comment
        })
      this.checklistComments = comments
    },
    async uploadChecklistComments (newcomment) {
      this.$store.set('progress', true)
      let formData = new FormData()
      formData.append("operate", 'upload_checklist_comments')
      formData.append("username", this.username)
      formData.append("template_id", this.template_id)
      formData.append("node_id", this.nodeId)
      formData.append("comments", JSON.stringify(newcomment))

      let config = {
        headers: {
        'Content-Type': 'multipart/form-data'
        }
      }
      await this.$http.post(this.$urls.trouble_shooting_save, formData, config)
      .then(response => {
        setTimeout(() =>{
          this.getChecklistComments()
          this.$store.set('progress', false)
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
      this.$store.set('progress', true)
      let formData = new FormData()
      formData.append("operate", 'upload_checklist_images')
      formData.append("username", this.username)
      formData.append("template_id", this.template_id)
      formData.append("node_id", this.nodeId)
      formData.append("images_size", addImages.length)
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
          this.$store.set('progress', false)
        },1000)
      })
    },
    async deleteChecklistImage (item){
      this.$store.set('progress', true)
      const temp_nodeId = this.isRoot ? 'root' : this.nodeId
      await this.$http.get(this.$urls.trouble_shooting_get, {
        params: {
            operate: 'delete_checklist_image',
            template_id: this.template_id,
            node_id: temp_nodeId,
            uuid_id: item.uuid,
        },
        })
        .then(response => {
          setTimeout(() =>{
            this.getChecklistImages()
            this.$store.set('progress', false)
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
      this.$store.set('progress', true)
      let formData = new FormData()
      formData.append("operate", 'upload_checklist_logs')
      formData.append("username", this.username)
      formData.append("template_id", this.template_id)
      formData.append("node_id", this.nodeId)
      formData.append("logs_size", addLogs.length)
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
          this.$store.set('progress', false)
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
    async deleteChecklistLog (item){
      this.$store.set('progress', true)
      const temp_nodeId = this.isRoot ? 'root' : this.nodeId
      await this.$http.get(this.$urls.trouble_shooting_get, {
        params: {
            operate: 'delete_checklist_log',
            template_id: this.template_id,
            node_id: temp_nodeId,
            uuid_id: item.uuid,
        },
        })
        .then(response => {
          setTimeout(() =>{
            this.getChecklistLogs()
            this.$store.set('progress', false)
          },1000)
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
    apply() {
      this.dialogApply = true
    },
    async applyConfirm () {
      this.$store.set('progress', true)
      let formData = new FormData()
      formData.append("operate", 'apply')
      formData.append("template_id", this.template_id)
      formData.append("username", this.username)
      formData.append("selected", JSON.stringify(this.data))
      let config = {
        headers: {
        'Content-Type': 'multipart/form-data'
        }
      }
      await this.$http.post(this.$urls.trouble_shooting_save, formData, config).then(
        (response)=>{
        this.mind.nodeData = response.data.content.nodeData
        this.mind.init()
        setTimeout(() =>{
          this.dialog = false
          this.$store.set('progress', false)
        },1000)
      }, (error) => {
        console.log(error)
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

