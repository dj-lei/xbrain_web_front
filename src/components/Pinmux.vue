<template lang="pug">
  div(id="app")
    v-app(id="inspire")
      template
        v-card(color="grey lighten-4", dark, flat, height="50px")
          v-toolbar(dense)
            v-toolbar-title Pinmux Template
            v-divider(class="mx-4", inset, vertical)
            v-btn(color="primary", dark, @click="newItem") New Template
            v-spacer
            v-dialog(v-model="dialog", transition="dialog-bottom-transition", max-width="400px")
              v-card
                v-col
                  v-card-text
                    v-alert(v-model='errorShown', transition='slide-y-reverse-transition', color='red darken-2', tile, dark, dense, icon='mdi-alert') {{ errorInfo }}
                    v-text-field(
                      ref="templateName"
                      v-model="templateName"
                      :rules="[() => !!templateName || 'This field is required']"
                      label="Template Name"
                      placeholder="New name"
                      required
                    )
                    v-autocomplete(
                      ref="asicSelect"
                      v-model="asicSelect"
                      :rules="[() => !!asicSelect || 'This field is required']"
                      :items="asic"
                      label="Asic"
                      placeholder="Select... asic"
                      required
                    )
                    v-spacer(class="mt-3")
                    v-file-input(ref="files", v-model="files", :rules="[() => !!files || 'This field is required']", label="Pinmux Gpio file input", placeholder="Select your pinmux xlsx", required)
                  v-divider(class="mt-12")
                  v-card-actions
                    v-btn(color="blue darken-1", text, @click="dialog = false") Cancel
                    v-spacer
                    v-btn(color="blue darken-1", text, @click="upload") Submit
            v-dialog(v-model="dialogDelete" max-width="500px")
              v-card
                v-card-title(class="headline") Are you sure you want to delete this item?
                v-card-actions
                  v-spacer
                  v-btn(color="blue darken-1" text @click="dialogDelete = false") Cancel
                  v-btn(color="blue darken-1" text @click="deleteItemConfirm") OK
                  v-spacer
            v-dialog(v-model="dialogDiff", fullscreen, transition="dialog-bottom-transition")
              v-card(min-width="1920px")
                v-toolbar(dark)
                  v-btn(icon, dark, @click="dialogDiff = false")
                    v-icon mdi-close
                  v-toolbar-title Diff
                  v-spacer
                div(v-html="diffHtml")
      v-data-table(v-model="selected", :headers="headers", :items="templateData", show-select, sort-by="Date", class="elevation-1")
          template(v-slot:item.actions="{ item }")
            v-icon(small, class="mr-2", @click="downloadItem(item)") mdi-download
            v-icon(small, @click="deleteItem(item)") mdi-delete
</template>

<script>
export default {
  data () {
    return {
      selected: [],
      dialog: false,
      dialogDelete: false,
      dialogDiff: false,
      headers: [
        { text: 'Id', value: 'id' },
        { text: 'TemplateName', align: 'start', value: 'TemplateName'},
        { text: 'Asic', value: 'Asic' },
        { text: 'Date', value: 'Date' },
        { text: 'Actions', value: 'actions', sortable: false },
      ],
      templateName: null,
      asicSelect: null,
      files: null,
      asic: ['xenon', 'radon'],
      templateData: [],
      tempData: '',
      diffHtml: '',
      formHasErrors: false,
      errorShown: false,
      errorInfo: '',
    }
  },
  created () {
    this.initialize()
  },
  computed: {
    form () {
      return {
        templateName: this.templateName,
        asicSelect: this.asicSelect,
        files: this.files,
      }
    },
  },
  watch: {
    async selected (val) {
      if (val.length >= 3) {
        this.selected = []
      }
      if (val.length === 2) {
        await this.$http.get(this.$urls.pinmux_get, {
        params: {
            operate: 'get_template_diff',
            template_id_a: val[0].id,
            template_id_b: val[1].id,
        },
        })
        .then(response => {
          this.selected = []
          this.dialogDiff = true
          this.diffHtml = response.data
          // console.log(this.diffHtml)
        })
      }
    },
  },
  methods: {
    async initialize () {
      await this.$http.get(this.$urls.pinmux_get, {
        params: {
            operate: 'get_template_titles',
        },
        })
        .then(response => {
          this.templateData = response.data.content
        })
    },
    newItem () {
      this.dialog = true
    },
    async downloadItem (item) {
      await this.$http.get(this.$urls.pinmux_get, {
        params: {
            operate: 'download',
            template_id: item.id,
        },
        responseType: 'blob' ,
        })
        .then(response => {
          const blob = new Blob([response.data], { type: 'application/txt' })
          const link = document.createElement('a')
          link.href = URL.createObjectURL(blob)
          link.download = item.TemplateName + '.dts'
          link.click()
          URL.revokeObjectURL(link.href)
        })
    },
    deleteItem (item) {
      this.tempData = item
      this.dialogDelete = true
    },
    async deleteItemConfirm () {
      await this.$http.get(this.$urls.pinmux_get, {
        params: {
            operate: 'delete_template',
            template_id: this.tempData.id,
        },
        })
        .then(response => {
          console.log(response.data.content)
          this.tempData = ''
          setTimeout(() =>{
            this.dialogDelete = false
            this.initialize()
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
      if (!this.validate()) {
        let formData = new FormData()
        formData.append("files", this.files);
        formData.append("asic", this.asicSelect)
        formData.append("file_name", this.templateName)
        formData.append("date", this.$common.getTime())
        let config = {
          headers: {
          'Content-Type': 'multipart/form-data'
          }
        }

        await this.$http.post(this.$urls.pinmux_save, formData, config).then(
          (response)=>{
          setTimeout(() =>{
            this.initialize()
            this.dialog = false
          },1000)
        }, (error) => {
          this.errorInfo = 'Wrong file format or Pinmux Gpio is not on the first sheet!'
          this.errorShown = true
          setTimeout(() =>{
            this.errorShown = false
          },4000)
        })
      }
    },
  },
}
</script>
