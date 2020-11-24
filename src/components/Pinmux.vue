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
            v-dialog(v-model="dialog", fullscreen, eager, hide-overlay, transition="dialog-bottom-transition")
              v-card
                PinmuxEdit(ref="pinmuxEdit", @initialize="initialize")
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
import PinmuxEdit from './PinmuxEdit.vue'

export default {
  components: {
    PinmuxEdit
  },
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
      templateData: [],
      tempData: '',
      templateName: 'new name',
      diffHtml: '',
    }
  },

  created () {
    this.initialize()
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
      this.$refs['pinmuxEdit'].dialog = true
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

    async diff () {

    },
  },
}
</script>
