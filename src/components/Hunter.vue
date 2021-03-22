<template lang="pug">
  div(id="app")
    v-app(id="inspire")
      template
        v-card(color="grey lighten-4", dark, flat, height="50px")
          v-toolbar(dense)
            v-toolbar-title Hunter
            //- v-divider(class="mx-4", inset, vertical)
            //- v-spacer
        v-row(class="d-flex justify-center")
          v-col(cols="12" sm="6" md="9")
            v-text-field(v-model="text" label="search" outlined dense)
          v-col(cols="12" sm="6" md="1")
            v-combobox(v-model="selected_mode" :items="['FileName', 'FileDir', 'FileContent']" label="mode" outlined dense)
          v-col(cols="12" sm="6" md="1")
            v-btn(color="primary", dark, @click="search") SEARCH
        v-card(color="grey lighten-4", dark, flat)
          v-row(justify="center")
            v-expansion-panels(inset)
              v-expansion-panel(v-for="(item,i) in items" :key="i")
                v-expansion-panel-header(disable-icon-rotate) {{ item.name }}
                  template(v-slot:actions="")
                    v-icon(color="green" @click.stop="loadDoc") mdi-export
                v-expansion-panel-content {{ item.path }}
                
          
</template>

<script>
import axios from 'axios'
import { get, sync } from 'vuex-pathify'

export default {
  computed: {
    username: sync('username')
  },
  data () {
    return {
      dialog: false,
      items: [],
      text: '',
      selected_mode: '',
    }
  },

  created () {
    // this.initialize()
  },

  methods: {
    async initialize () {
    },
    async search(){
      let url = ''
      if (this.selected_mode === 'FileName'){
        url = "http://localhost:8001/extract/semantic_search_file_name"
      }else if(this.selected_mode === 'FileDir'){
        url = "http://localhost:8001/extract/semantic_search_file_dir"
      }else if(this.selected_mode === 'FileContent'){
        url = "http://localhost:8001/extract/semantic_search_file_content"
      }
      await axios.get(url, {
        params: {
            text: this.text
        },
        })
        .then(response => {
          this.items = response.data.content
        })
    },
    async loadDoc(){
      console.log('--------')
    }
  },
}
</script>