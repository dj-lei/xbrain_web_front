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
            template(v-if="dialog")
              v-dialog(v-model="dialog", fullscreen, transition="dialog-bottom-transition")
                v-card
                  SymbolEditor(
                    ref="symbolEditor"
                    v-bind:svg_content='svg_content'
                    v-bind:flagUpdateOrAdd='flagUpdateOrAdd'
                    v-bind:tools_category='symbols'
                    v-on:dialogClose="dialogClose"
                    v-on:saveToServer="save"
                    v-on:newItem="newItem"
                    v-on:editItem="editItem"
                    v-on:saveApiBindData="saveApiBindData"
                  )
            v-dialog(v-model="dialogSaveTemplate", max-width="500px")
              v-card
                v-card-title
                  span(class="headline") Symbol Save
                v-card-text
                  v-container
                    v-row
                      v-combobox(v-model='symbol_type' :items="symbol_types" label="Symbol Type")
                    v-row
                      v-text-field(v-model='symbol_name', label="Symbol name")
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
            v-dialog(v-model="dialogConfig" max-width="500px")
              v-card
                v-card-title
                  span(class="headline") Config
                v-card-text
                  v-container
                    v-row
                      v-combobox(v-model='symbol_type' :items="symbol_types" label="Symbol Type")
                    v-row
                      v-text-field(v-model='symbol_name', label="Symbol name")
                    v-row
                      v-spacer
                      v-btn(class="mt-3" color="primary", dark, @click="configItemConfirm") APPLY
                      v-spacer
      v-card
        v-card-title
          v-text-field(v-model="search" label="Search" single-line hide-details)
        v-data-table(:search="search" :headers="headers", :items="data", sort-by="SymbolName", class="elevation-1")
          template(v-slot:item.actions="{ item }")
            v-tooltip(bottom)
              template(v-slot:activator="{ on,attrs }")
                v-icon(small, class="mr-2", v-bind="attrs", v-on="on", @click="editItem(item)") mdi-pencil
              span edit
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
      dialogSaveTemplate: false,
      headers: [
        // { text: 'Id', value: 'id' },
        { text: 'Category', align: 'start', value: 'Category'},
        { text: 'SymbolName', align: 'start', value: 'SymbolName'},
        // { text: 'Icon', align: 'start', value: 'Icon'},
        { text: 'CreatedTime', value: 'CreatedTime' },
        { text: 'Actions', value: 'actions', sortable: false },
      ],
      data: [],
      search: '',
      symbols:[{ title: 'basic', symbols:[{'id':'0', 'symbol':'path'},{'id':'1', 'symbol':'polygon'},{'id':'2', 'symbol':'text'},{'id':'3', 'symbol':'data'}]}],
      svg_content: '',
      svg_temp: {},
      symbol_name: '',
      symbol_type: 'circuit',
      symbol_types: [],
      flagUpdateOrAdd: false,
      operateId: '',
      url_get_bind_data: '',
    }
  },

  created () {
    this.initialize()
  },

  methods: {
    async initialize () {
      await this.$http.get(this.$urls.babel_get, {
        params: {
            operate: 'get_symbols_titles',
        },
        })
        .then(response => {
          this.data = response.data.content
          this.symbols = [{ title: 'basic', symbols:[{'id':'0', 'symbol':'path'},{'id':'1', 'symbol':'polygon'},{'id':'2', 'symbol':'text'},{'id':'3', 'symbol':'data'}]}]
          this.symbols = this.symbols.concat(response.data.symbols)
          this.symbol_types = []
          response.data.symbols.forEach((symbol) => {
            this.symbol_types.push(symbol.title)
          })
        })
    },
    dialogClose () {
      this.dialog = false
    },
    newItem () {
      this.flagUpdateOrAdd = false
      this.dialog = true
    },
    async editItem (item) {
      await this.$http.get(this.$urls.babel_get, {
        params: {
            operate: 'get_symbol',
            symbol_id: item.id,
        },
        })
        .then(response => {
          this.operateId = response.data.id
          this.flagUpdateOrAdd = true
          this.svg_content = response.data.content.content
          this.dialog = true
          this.$nextTick(function(){
            this.$refs.symbolEditor.updateSymbolsUrl(response.data.content.api_bind_data)
            this.$refs.symbolEditor.updateItem(this.svg_content)
            this.$refs.symbolEditor.queryBackendData()
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
            operate: 'delete_symbol',
            symbol_id: this.tempData.id,
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
      this.symbol_type = item.Category
      this.symbol_name = item.SymbolName
    },

    async configItemConfirm () {
      this.$store.set('progress', true)

      let formData = new FormData()
      formData.append("symbol_id", this.operateId)
      formData.append("category", this.symbol_type)
      formData.append("symbol_name", this.symbol_name)
      formData.append("operate", 'symbol_update')
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
      this.flagUpdateOrAdd = false
      this.dialogSaveTemplate = false
    },

    closeDelete () {
      this.dialogDelete = false
    },

    save (svg, url) {
      this.svg_temp = svg
      this.url_get_bind_data = url
      if (this.flagUpdateOrAdd === false) {
        this.dialogSaveTemplate = true
      }else{
        this.saveToServer()
      }
    },

    async saveToServer () {
      this.$store.set('progress', true)
      let serializer = new XMLSerializer()
      let source = serializer.serializeToString(this.svg_temp.node())

      //add name spaces.
      if(!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)){
          source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
      }
      if(!source.match(/^<svg[^>]+"http\:\/\/www\.w3\.org\/1999\/xlink"/)){
          source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
      }
      //add xml declaration
      source = '<?xml version="1.0" standalone="no"?>\r\n' + source
      //convert svg source to URI data scheme.
      let url = "data:image/svg+xml;charset=utf-8,"+encodeURIComponent(source)

      let formData = new FormData()
      formData.append("data", url)
      formData.append("category", this.symbol_type)
      formData.append("symbol_name", this.symbol_name)
      formData.append("api_url", this.url_get_bind_data)
      let config = {
        headers: {
        'Content-Type': 'multipart/form-data'
        }
      }

      if (this.flagUpdateOrAdd === false) {
        formData.append("operate", 'symbol_new')
      } else {
        formData.append("operate", 'symbol_update')
        formData.append("symbol_id", this.operateId)
      }

      await this.$http.post(this.$urls.babel_save, formData, config).then(
        (response)=>{
          console.log(response.data)
      }, (error) => {
        console.log(error)
      })
      setTimeout(() =>{
        this.dialogSaveTemplate = false
        this.flagUpdateOrAdd = true
        this.initialize()
        this.$store.set('progress', false)
      },1000)
    },

    async saveApiBindData(api_url){
      this.$store.set('progress', true)
      let formData = new FormData()
      formData.append("operate", 'save_api_bind_data')
      formData.append("symbol_id", this.operateId)
      formData.append("api_url", api_url)

      let config = {
        headers: {
        'Content-Type': 'multipart/form-data'
        }
      }

      await this.$http.post(this.$urls.babel_save, formData, config).then(
        (response)=>{
          this.url_get_bind_data = api_url
      }, (error) => {
        console.log(error)
      })
      setTimeout(() =>{
        // this.initialize()
        this.$store.set('progress', false)
      },1000)
    },
  },
}
</script>
