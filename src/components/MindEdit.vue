<template lang="pug">
  .mind
    v-app
      div(id="map" style="width:100%;height:700px")
      v-dialog(v-model="dialog" max-width="1000px")
        v-card
          v-toolbar(dark)
            v-btn(icon, dark, @click="dialog = false")
              v-icon mdi-close
            v-toolbar-title Task
            v-spacer
            v-toolbar-items
              v-btn(dark, text, @click="save") Save
          v-data-table(v-model='selected', show-select, :headers="headers", :items="data", class="elevation-1")
            template(v-slot:item.data-table-select="{ isSelected, select, item }")
              v-simple-checkbox(color="green", :disabled='item.Status === "close"', :value='item.Status === "close" ? true : isSelected', @input="select($event)")
            template(v-slot:item.Status="{ item }")
              v-chip(:color="getColor(item.Status)", dark) {{ item.Status }}
</template>

<script>
import MindElixir from "mind-elixir"
import { get, sync } from 'vuex-pathify'

export default {
  props: {
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
      selected: [],
      data: [],
      mind: '',
      headers: [
        { text: 'Id', value: 'id' },
        { text: 'Task', align: 'start', value: 'Task'},
        { text: 'Status', value: 'Status' },
        { text: 'Executor', value: 'Executor' },
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
        this.getNodeDetails(node)
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
    }
  },
  methods: {
    getAllData () {
      return this.mind.getAllData()
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
    getColor (status) {
      if (status === 'close') return 'green'
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

