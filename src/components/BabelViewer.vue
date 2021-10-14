<template lang="pug">
  div(id="app")
    v-app(id="inspire")
      template
        v-card(color="grey lighten-4", flat, height="50px")
          v-toolbar(dense color="yellow darken-3" dark)
            v-toolbar-title Viewers
            v-divider(class="mx-4", inset, vertical)
            v-spacer
            template(v-if="dialog")
              v-dialog(v-model="dialog", fullscreen, transition="dialog-bottom-transition")
                v-card
                  SymbolEditor(
                    ref="symbolEditor"
                    v-bind:svg_content='svg_content'
                    v-bind:tools_category='symbols'
                    v-bind:is_viewer='is_viewer'
                    v-bind:username='username'
                    v-on:dialogClose="dialogClose"
                  )
            v-dialog(v-model="dialogDelete" max-width="550px")
              v-card(color="yellow darken-3" dark)
                v-card-title(class="headline") Are you sure you want to delete this viewer?
                v-card-actions
                  v-spacer
                  v-btn(text @click="dialogDelete = false") Cancel
                  v-btn(text @click="deleteItemConfirm") OK
                  v-spacer
            v-dialog(v-model="dialogConfig" max-width="500px")
              v-card(color="yellow darken-3" dark)
                v-card-title
                  span(class="headline") Config
                v-card-text
                  v-container
                    v-row
                      v-text-field(v-model='viewer_group' label="Group Or Project Name")
                    v-row
                      v-text-field(v-model='viewer_name', label="Viewer name")
                    v-row
                      v-spacer
                      v-btn(class="mt-3" dark, @click="configItemConfirm") APPLY
                      v-spacer
      v-card
        v-card-title
          v-text-field(v-model="search" label="Search" single-line hide-details)
        v-data-table(:search="search" :headers="headers", :items="data", sort-by="ViewerName", class="elevation-1")
          template(v-slot:item.actions="{ item }")
            v-tooltip(bottom)
              template(v-slot:activator="{ on,attrs }")
                v-icon(small, class="mr-2", v-bind="attrs", v-on="on", @click="browseItem(item)") mdi-book
              span browse
            template(v-if="username === 'admin'")
              v-tooltip(bottom)
                template(v-slot:activator="{ on,attrs }")
                  v-icon(small, class="mr-2", v-bind="attrs", v-on="on", @click="deleteItem(item)") mdi-delete
                span delete
              v-tooltip(bottom)
                template(v-slot:activator="{ on,attrs }")
                  v-icon(small, class="mr-2", v-bind="attrs", v-on="on", @click="configItem(item)") mdi-memory
                span config
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
      dialogConfig: false,
      headers: [
        // { text: 'Id', value: 'id' },
        { text: 'ViewerName', align: 'start', value: 'ViewerName'},
        { text: 'Group', align: 'start', value: 'Group'},
        { text: 'CreatedTime', value: 'CreatedTime' },
        { text: 'Actions', value: 'actions', sortable: false },
      ],
      data: [],
      search: '',
      is_viewer: true,
      symbols:[{ title: 'BASIC', symbols:[{'id':'0', 'symbol':'path'},{'id':'1', 'symbol':'polygon'},{'id':'2', 'symbol':'text'},{'id':'3', 'symbol':'data'}]}],
      svg_content: '',
      svg_temp: {},
      viewer_name: '',
      viewer_group: '',
      operateId: '',
    }
  },

  created () {
    this.initialize()
  },

  methods: {
    async initialize () {
      await this.$http.get(this.$urls.babel_get, {
        params: {
          operate: 'get_viewers_titles',
        },
        })
        .then(response => {
          this.data = response.data.content
        })

    },
    dialogClose () {
      this.dialog = false
    },
    async browseItem (item) {
      await this.$http.get(this.$urls.babel_get, {
        params: {
            operate: 'get_symbol',
            symbol_id: item.id,
        },
        })
        .then(response => {
          this.operateId = response.data.id
          this.svg_content = response.data.content.content
          this.dialog = true
          this.$nextTick(function(){
            this.$store.set('progress', true)
            this.$refs.symbolEditor.updateNodeData(JSON.parse(response.data.content.node_data))
            this.$refs.symbolEditor.updateItem(this.svg_content)
            setTimeout(() =>{
              this.$refs.symbolEditor.updateSymbols()
            },400)
          })
        })
    },
    deleteItem (item) {
      this.tempData = item
      this.dialogDelete = true
    },
    async deleteItemConfirm () {
      this.$store.set('progress', true)
      await this.$http.get(this.$urls.babel_get, {
        params: {
            operate: 'delete_viewer',
            viewer_id: this.tempData.id,
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

    configItem (item) {
      this.dialogConfig = true
      this.operateId = item.id
      this.viewer_group = item.Group
      this.viewer_name = item.ViewerName
    },

    async configItemConfirm () {
      this.$store.set('progress', true)

      let formData = new FormData()
      formData.append("viewer_id", this.operateId)
      formData.append("group", this.viewer_group)
      formData.append("viewer_name", this.viewer_name)
      formData.append("operate", 'viewer_update')
      let config = {
        headers: {
        'Content-Type': 'multipart/form-data'
        }
      }

      await this.$http.post(this.$urls.babel_save, formData, config).then(
        (response)=>{
          console.log(response.data)
      }, (error) => {
        console.log(error)
      })
      setTimeout(() =>{
        this.dialogConfig = false
        this.initialize()
        this.$store.set('progress', false)
      },1000)
    },

    close () {
      this.dialogSaveTemplate = false
    },
  },
}
</script>
