<template>
  <div id="app">
    <v-app id="inspire">
      <v-data-table
        :headers="headers"
        :items="data"
        sort-by="TemplateName"
        class="elevation-1"
      >
        <template v-slot:top>
          <v-toolbar
            flat
          >
            <v-toolbar-title>Trouble Shooting Template</v-toolbar-title>
            <v-divider
              class="mx-4"
              inset
              vertical
            ></v-divider>
            <v-btn
              color="primary"
              dark
              class="mb-2"
              @click="newItem"
            >
              New Template
            </v-btn>
            <v-spacer></v-spacer>
            <v-dialog
              v-model="dialog"
              fullscreen
              eager
              hide-overlay
              transition="dialog-bottom-transition"
            >
              <v-card>
                <v-toolbar
                  dark
                  color="primary"
                >
                  <v-btn
                    icon
                    dark
                    @click="dialog = false"
                  >
                    <v-icon>mdi-close</v-icon>
                  </v-btn>
                  <v-toolbar-title>Edit Template</v-toolbar-title>
                  <v-spacer></v-spacer>
                  <v-toolbar-items>
                    <v-btn
                      dark
                      text
                      @click="save"
                    >
                      Save
                    </v-btn>
                  </v-toolbar-items>
                </v-toolbar>
                <MindEdit
                  ref="mindEdit"
                  v-bind:nodeData='nodeData'
                >
                </MindEdit>
              </v-card>
            </v-dialog>
            <v-dialog
              v-model="dialogSaveTemplate"
              max-width="500px"
            >
              <v-card>
                <v-card-title>
                  <span class="headline">Template Save</span>
                </v-card-title>

                <v-card-text>
                  <v-container>
                    <v-row>
                      <v-col
                        cols="12"
                        sm="6"
                        md="4"
                      >
                        <v-text-field v-model='templateName'
                          label="Template name"
                        ></v-text-field>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-card-text>

                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn
                    color="blue darken-1"
                    text
                    @click="close"
                  >
                    Cancel
                  </v-btn>
                  <v-btn
                    color="blue darken-1"
                    text
                    @click="saveToServer"
                  >
                    Save
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
            <v-dialog v-model="dialogDelete" max-width="500px">
              <v-card>
                <v-card-title class="headline">Are you sure you want to delete this item?</v-card-title>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="blue darken-1" text @click="closeDelete">Cancel</v-btn>
                  <v-btn color="blue darken-1" text @click="deleteItemConfirm">OK</v-btn>
                  <v-spacer></v-spacer>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-toolbar>
        </template>
        <template v-slot:item.actions="{ item }">
          <v-icon
            small
            class="mr-2"
            @click="editItem(item)"
          >
            mdi-pencil
          </v-icon>
          <v-icon
            small
            @click="deleteItem(item)"
          >
            mdi-delete
          </v-icon>
        </template>
      </v-data-table>
    </v-app>
  </div>
</template>

<script>
import MindEdit from './MindEdit.vue'

export default {
  components: {
    MindEdit
  },
  data () {
    return {
      nodeData: {},
      dialog: false,
      dialogDelete: false,
      dialogSaveTemplate: false,
      headers: [
        { text: 'Id', value: 'id' },
        { text: 'TemplateName', align: 'start', sortable: false, value: 'TemplateName'},
        { text: 'Date', value: 'Date' },
        { text: 'Actions', value: 'actions', sortable: false },
      ],
      data: [],
      tempData: '',
      templateName: 'new name',
      flagUpdateOrAdd: false,
      isModifyTemplate: '',
      operateId: '',
    }
  },

  watch: {
    dialog (val) {
      val || this.close()
    },
    dialogDelete (val) {
      val || this.closeDelete()
    },
  },

  created () {
    this.initialize()
  },

  // mounted () {
  //   this.newItem()
  // },

  methods: {
    async initialize () {
      await this.$http.get(this.$urls.trouble_shooting_get, {
        params: {
            operate: 'get_template_titles',
        },
        })
        .then(response => {
          this.data = response.data.content
        })
    },

    newItem () {
      this.nodeData = {
        'id': 'root',
        'topic': 'New Template',
        'root': true,
        'children': [],
      }
      this.templateName = 'new name'
      this.flagUpdateOrAdd = false
      this.dialog = true
    },

    async editItem (item) {
      await this.$http.get(this.$urls.trouble_shooting_get, {
        params: {
            operate: 'get_template',
            template_id: item.id,
        },
        })
        .then(response => {
          this.isModifyTemplate = item.TemplateName
          this.templateName = item.TemplateName
          this.operateId = response.data.id
          this.nodeData = response.data.content.nodeData
          this.flagUpdateOrAdd = true
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

    close () {
      this.flagUpdateOrAdd = false
      this.dialogSaveTemplate = false
    },

    closeDelete () {
      this.dialogDelete = false
    },

    save () {
      this.dialogSaveTemplate = true
    },

    async saveToServer () {
      let formData = new FormData()
      let saveDate = Object.assign({'TemplateName': this.templateName, 'Date': this.getTime()}, this.$refs['mindEdit'].getAllData())
      formData.append("data", JSON.stringify(saveDate))
      let config = {
        headers: {
        'Content-Type': 'multipart/form-data'
        }
      }

      if ((this.flagUpdateOrAdd === false) || (this.isModifyTemplate !== this.templateName)) {
        formData.append("operate", 'new')
      } else {
        formData.append("operate", 'update')
        formData.append("template_id", this.operateId)
      }
      await this.$http.post(this.$urls.trouble_shooting_save, formData, config).then(
        (response)=>{
          console.log(response.data)
      }, (error) => {
        console.log(error)
      })
      setTimeout(() =>{
        this.operateId = ''
        this.flagUpdateOrAdd = false
        this.dialogSaveTemplate = false
        this.dialog = false
        this.initialize()
      },1000)
    },
  },
}
</script>