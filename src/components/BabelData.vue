<template lang="pug">
  div(id="app")
    v-app(id="inspire")
      template
        v-card(flat, height="50px")
          v-toolbar(dense color="yellow darken-3" dark)
            v-toolbar-title Symbols
            v-divider(class="mx-4", inset, vertical)
            v-btn( @click="dialog = true") New Data
            v-spacer
            v-dialog(v-model="dialog", transition="dialog-bottom-transition", max-width="400px")
              v-card
                v-col
                  v-card-text
                    v-alert(v-model='errorShown', transition='slide-y-reverse-transition', color='red darken-2', tile, dark, dense, icon='mdi-alert') {{ errorInfo }}
                    v-text-field(
                      v-model="dataSourceName"
                      :rules="[() => !!dataSourceName || 'This field is required']"
                      label="Data Source Name"
                      placeholder="New name"
                      required
                    )
                    v-text-field(
                      v-model="category"
                      :rules="[() => !!category || 'This field is required']"
                      label="Category"
                      placeholder="fill in"
                      required
                    )
                    v-spacer(class="mt-3")
                    v-file-input(ref="files", v-model="files", :rules="[() => !!files || 'This field is required']", label="data file input", placeholder="Select your json txt", required)
                  v-divider(class="mt-12")
                  v-card-actions
                    v-btn(color="blue darken-1", text, @click="dialog = false") Cancel
                    v-spacer
                    v-btn(color="blue darken-1", text, @click="upload") Submit
            v-dialog(v-model="dialogDelete" max-width="550px")
              v-card(color="yellow darken-3" dark)
                v-card-title(class="headline") Are you sure you want to delete this symbol?
                v-card-actions
                  v-spacer
                  v-btn(text @click="dialogDelete = false") Cancel
                  v-btn(text @click="deleteItem") OK
                  v-spacer
      //-       v-dialog(v-model="dialogSaveTemplate", max-width="500px")
      //-         v-card(color="yellow darken-3" dark)
      //-           v-card-title
      //-             span(class="headline") Symbol Save
      //-           v-card-text
      //-             v-container
      //-               v-row
      //-                 v-combobox(v-model='symbol_type' :items="symbol_types" label="Symbol Type")
      //-               v-row
      //-                 v-text-field(v-model='symbol_name', label="Symbol name")
      //-           v-card-actions
      //-             v-spacer
      //-             v-btn(text, @click="close") Cancel
      //-             v-btn(text, @click="saveToServer") Save
      //-       v-dialog(v-model="dialogConfig" max-width="500px")
      //-         v-card(color="yellow darken-3" dark)
      //-           v-card-title
      //-             span(class="headline") Config
      //-           v-card-text
      //-             v-container
      //-               v-row
      //-                 v-combobox(v-model='symbol_type' :items="symbol_types" label="Symbol Type")
      //-               v-row
      //-                 v-text-field(v-model='symbol_name', label="Symbol name")
      //-               v-row
      //-                 v-spacer
      //-                 v-btn(class="mt-3" @click="configItemConfirm") APPLY
      //-                 v-spacer
      v-card
        v-card-title
          v-text-field(v-model="search" label="Search" single-line hide-details)
        v-data-table(:search="search" :headers="headers", :items="data", sort-by="DataSourceName" class="elevation-1")
          template(v-slot:item.actions="{ item }")
            //- v-tooltip(bottom)
            //-   template(v-slot:activator="{ on,attrs }")
            //-     v-icon(small, class="mr-2", v-bind="attrs", v-on="on", @click="editItem(item)") mdi-pencil
            //-   span edit
            v-tooltip(bottom)
              template(v-slot:activator="{ on,attrs }")
                v-icon(small, class="mr-2", v-bind="attrs", v-on="on", @click="dialogDelete = true;tempData=item") mdi-delete
              span delete
</template>

<script>
import { get, sync } from 'vuex-pathify'

export default {
  components: {
  },
  computed: {
    username: sync('username')
  },
  data () {
    return {
      dialog: false,
      dialogDelete: false,
      headers: [
        // { text: 'Id', value: 'id' },
        { text: 'Category', align: 'start', value: 'Category'},
        { text: 'DataSourceName', align: 'start', value: 'DataSourceName'},
        { text: 'CreatedTime', value: 'CreatedTime' },
        { text: 'Actions', value: 'actions', sortable: false },
      ],
      data: [],
      files: null,
      dataSourceName: '',
      category: '',
      search: '',
      tempData: '',
      formHasErrors: false,
      errorShown: false,
      errorInfo: '',
    }
  },

  created () {
    this.initialize()
  },

  methods: {
    async initialize () {
      await this.$http.get(this.$urls.babel_get, {
        params: {
            operate: 'get_datas_titles',
        },
        })
        .then(response => {
          this.data = response.data.content
        })
    },
    async editItem () {

    },
    async deleteItem () {
      this.$store.set('progress', true)
      await this.$http.get(this.$urls.babel_get, {
        params: {
            operate: 'delete_data',
            data_id: this.tempData.id,
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
    validate () {
      this.formHasErrors = false

      Object.keys(this.form).forEach(f => {
        if (!this.form[f]) {
          this.formHasErrors = true
          this.$refs[f].validate(true)
        }
      })
      return this.formHasErrors
    },
    async upload () {
      this.$store.set('progress', true)
      let formData = new FormData()
      formData.append("operate", 'data_new')
      formData.append("files", this.files)
      formData.append("data_source_name", this.dataSourceName)
      formData.append("category", this.category)
      let config = {
        headers: {
        'Content-Type': 'multipart/form-data'
        }
      }

      await this.$http.post(this.$urls.babel_save, formData, config).then(
        (response)=>{
        setTimeout(() =>{
          this.initialize()
          this.dialog = false
          this.$store.set('progress', false)
        },1000)
      }, (error) => {
        this.errorInfo = 'Wrong file format!'
        this.errorShown = true
        setTimeout(() =>{
          this.errorShown = false
        },4000)
      })
    },
  },
}
</script>
