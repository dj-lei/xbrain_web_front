<template lang="pug">
  div(id="app")
    v-app(id="inspire")
      template
        v-card(color="grey lighten-4", dark, flat, height="50px")
          v-toolbar(dense color="yellow darken-3")
            v-toolbar-title Hunter
            //- v-divider(class="mx-4", inset, vertical)
            
            //- v-spacer
        v-row(class="d-flex justify-center")
          v-col(cols="12" sm="6" md="9")
            v-text-field(v-model="text" label="search" outlined dense)
          v-col(cols="12" sm="6" md="1")
            v-combobox(v-model="selected_mode" :items="['FileName', 'FileDir', 'FileContent', 'ImageDesc', 'ImageContent']" label="mode" outlined dense)
          v-col(cols="12" sm="6" md="1")
            v-btn(dark, @click="search") SEARCH
        v-card(flat)
          v-row(justify="center")
            v-expansion-panels(inset)
              v-expansion-panel(color="yellow darken-3" v-for="(item,i) in items" :key="i")
                v-expansion-panel-header(disable-icon-rotate) {{ item.name }}
                  template(v-slot:actions="")
                    v-icon(color="green" @click.stop="loadPdf(item.path)") mdi-export
                v-expansion-panel-content 
                  div(v-html="item.desc")
        v-dialog(v-model='dialogDocDisplay')
          v-card
            div(v-html="html")
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
      dialogDocDisplay: false,
      items: [],
      text: '',
      html: '',
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
      this.items = []
      if (this.selected_mode === 'FileName'){
        url = "http://localhost:8001/extract/semantic_search_file_name"
      }else if(this.selected_mode === 'FileDir'){
        url = "http://localhost:8001/extract/semantic_search_file_dir"
      }else if(this.selected_mode === 'FileContent'){
        url = "http://localhost:8001/extract/semantic_search_file_content"
      }else if(this.selected_mode === 'ImageDesc'){
        url = "http://localhost:8001/extract/semantic_search_image_desc"
      }else if(this.selected_mode === 'ImageContent'){
        url = "http://localhost:8001/extract/semantic_search_image_content"
      }
      await axios.get(url, {
        params: {
            text: this.text
        },
        })
        .then(response => {
          response.data.content.forEach(elm => {
            let tmp = {}
            if (this.selected_mode === 'FileName'){
              tmp['name'] = elm.name
              tmp['path'] = elm.path
              tmp['desc'] = "Doc System: SharePoint <br/>File Name: "+tmp['name']+"<br/>Location: "+elm.path.split('sites')[1]
            }else if(this.selected_mode === 'FileDir'){
              tmp['name'] = elm.path.split('\\').pop()
              tmp['path'] = elm.path
              tmp['desc'] = "Doc System: SharePoint <br/>File Name: "+tmp['name']+"<br/>Location: "+elm.path.split('sites')[1]+"<br/>Chapter: "+elm.chapter+"<br/>Title: "+elm.title
            }else if(this.selected_mode === 'FileContent'){
              tmp['name'] = elm.path.split('\\').pop()
              tmp['path'] = elm.path
              tmp['desc'] = "Doc System: SharePoint <br/>File Name: "+tmp['name']+"<br/>Location: "+elm.path.split('sites')[1]+"<br/>Origin Text: "+elm.content
            }else if(this.selected_mode === 'ImageDesc'){
              tmp['name'] = elm.path.split('\\').pop()
              tmp['path'] = elm.path
              tmp['desc'] = "Doc System: SharePoint <br/>File Name: "+tmp['name']+"<br/>Location: "+elm.path.split('sites')[1]+"<br/>Summary: "+elm.desc
            }else if(this.selected_mode === 'ImageContent'){
              tmp['name'] = elm.path.split('\\').pop()
              tmp['path'] = elm.path
              tmp['desc'] = "Doc System: SharePoint <br/>File Name: "+tmp['name']+"<br/>Location: "+elm.path.split('sites')[1]+"<br/>Image Content: "+elm.content
            }
            this.items.push(tmp)
          })
        })
    },
    async loadPdf(path){
      window.open("http://localhost:8001/extract/get_pdf_html?path="+path.replace('.docx', '.pdf'), "resizeable,scrollbar")     
    }
  },
}
</script>

