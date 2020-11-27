<template lang="pug">
  div(id="app")
    v-app(id="inspire")
      template
        v-card(color="grey lighten-4", dark, flat)
          v-toolbar(dense)
            v-toolbar-title Trouble Shooting Task
            v-divider(class="mx-4", inset, vertical)
            v-spacer
          v-dialog(v-model="dialog", fullscreen, eager, hide-overlay, transition="dialog-bottom-transition")
            v-card
              v-toolbar(dark)
                v-btn(icon, dark, @click="dialog = false")
                  v-icon mdi-close
                v-toolbar-title Execute Task
                v-spacer
              MindEdit(ref="mindEdit", v-bind:nodeData='nodeData', v-bind:contextMenu='contextMenu', v-bind:template_id='template_id')
          v-dialog(v-model="dialogDelete" max-width="500px")
            v-card
              v-card-title(class="headline") Are you sure you want to delete this item?
              v-card-actions
                v-spacer
                v-btn(color="blue darken-1" text @click="dialogDelete = false") Cancel
                v-btn(color="blue darken-1" text @click="deleteItemConfirm") OK
                v-spacer
          v-dialog(v-model="dialogCloseTask" max-width="500px")
            v-card
              v-card-title(class="headline") Are you sure you want to Close this item?
              v-card-actions
                v-spacer
                v-btn(color="blue darken-1" text @click="dialogCloseTask = false") Cancel
                v-btn(color="blue darken-1" text @click="closeTaskConfirm") OK
                v-spacer
      v-data-table(:headers="headers", :items="data", sort-by="Date", class="elevation-1")
        template(v-slot:item.Status="{ item }")
          v-chip(:color="getColor(item.Status)", dark) {{ item.Status }}
        template(v-slot:item.actions="{ item }")
          v-icon(small, class="mr-2", @click="editItem(item)") mdi-pencil
          template(v-if='role === "administrator"')
            v-icon(small, class="mr-2", @click="deleteItem(item)") mdi-delete
            v-icon(small, @click="closeTask(item)") mdi-checkbox-marked-circle
</template>

<script>
import MindEdit from './MindEdit.vue'
import { get, sync } from 'vuex-pathify'

export default {
  components: {
    MindEdit
  },
  data () {
    return {
      project: 'TroubleShooting',
      role: '',
      nodeData: {},
      contextMenu: false,
      dialog: false,
      dialogDelete: false,
      dialogCloseTask: false,
      headers: [
        { text: 'Id', value: 'id' },
        { text: 'TaskName', align: 'start', sortable: false, value: 'TaskName'},
        { text: 'Status', value: 'Status' },
        { text: 'Date', value: 'Date' },
        { text: 'Actions', value: 'actions', sortable: false },
      ],
      data: [],
      template_id: '',
      tempData: '',
    }
  },
  created () {
    this.initialize()
  },
  computed: {
    groups: sync('groups')
  },
  methods: {
    async initialize () {
      await this.$http.get(this.$urls.trouble_shooting_get, {
        params: {
            operate: 'get_task_titles',
        },
        })
        .then(response => {
          this.data = response.data.content
          if (this.groups.length > 1){
            for (let key in this.groups){
              if (this.groups[key]['project'] === this.project) {
                this.role = this.groups[key]['role']
              }
            }
          }
        })
    },

    async editItem (item) {
      await this.$http.get(this.$urls.trouble_shooting_get, {
        params: {
            operate: 'get_task',
            template_id: item.id,
        },
        })
        .then(response => {
          this.nodeData = response.data.content.nodeData
          this.template_id = item.id
          this.dialog = true
        })
    },

    deleteItem (item) {
      this.tempData = item
      this.dialogDelete = true
    },

    async deleteItemConfirm () {
      await this.$http.get(this.$urls.trouble_shooting_get, {
        params: {
            operate: 'delete_task',
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

    closeTask (item) {
      this.tempData = item
      this.dialogCloseTask = true
    },

    async closeTaskConfirm () {
      await this.$http.get(this.$urls.trouble_shooting_get, {
        params: {
            operate: 'close_task',
            template_id: this.tempData.id,
        },
        })
        .then(response => {
          console.log(response.data.content)
          this.tempData = ''
          setTimeout(() =>{
            this.dialogCloseTask = false
            this.initialize()
          },1000)
        })
    },

    getColor (status) {
      if (status === 'close') return 'green'
      else return 'orange'
    },
  },
}
</script>