<template  lang="pug">
  div(id="app")
    v-app(id="inspire")
      template
        v-card(color="grey lighten-4", dark, flat, height="50px")
          v-toolbar(dense)
            v-toolbar-title Page Management
            v-divider(class="mx-4", inset, vertical)
            v-text-field(v-model="keywords" hide-details prepend-icon="search" label="Search")
            v-spacer
            v-dialog(v-model="dialogEdit", transition="dialog-bottom-transition", max-width="500px")
              v-card
                v-col
                  v-card-text
                    v-alert(v-model='errorShown', transition='slide-y-reverse-transition', color='red darken-2', tile, dark, dense, icon='mdi-alert') {{ errorInfo }}
                    v-card
                      v-card-title {{pageName}}
                      v-data-table(:headers="editheaders", :items="editData", class="elevation-1", hide-default-footer)
                        template(v-slot:item.actions="{ item }")
                          v-tooltip(bottom)
                            template(v-slot:activator="{ on,attrs }")
                              v-icon(small, v-bind="attrs", v-on="on", @click="deleteRole(item)") mdi-delete
                            span Delete  
                  v-divider(class="mx-4")
                  v-card-text
                    v-row(align="center", class="mx-0")
                      v-text-field(
                        ref="newRole"
                        v-model="newRole"
                        :rules="[() => !!newRole || 'This field is required']"
                        placeholder='New role...'
                        required
                      )
                      v-btn(class="mx-2" fab small @click="addRole")
                        v-icon(dark) mdi-plus
                  v-card-actions
                      v-spacer
                        v-row(type="flex" justify="end")
                          v-btn(color="blue darken-1", text, @click="dialogEdit = false") Cancel
            v-spacer
            v-dialog(v-model="dialogDelete" max-width="510px")
              v-card
                v-card-title(class="headline") Are you sure you want to delete this page?
                v-card-actions
                  v-spacer
                  v-btn(color="blue darken-1" text @click="dialogDelete = false") Cancel
                  v-btn(color="blue darken-1" text @click="deleteItemConfirm") OK
                  v-spacer
      v-data-table(:headers="headers", :items="pageData", :search="keywords", class="elevation-1")
        template(v-slot:item.actions="{ item }")
            v-tooltip(bottom)
              template(v-slot:activator="{ on,attrs }")
                v-icon(small, class="mr-2", v-bind="attrs", v-on="on", @click="editItem(item)") mdi-pencil
              span Edit
            v-tooltip(bottom)
              template(v-slot:activator="{ on,attrs }")
                v-icon(small, v-bind="attrs", v-on="on", @click="deleteItem(item)") mdi-delete
              span Delete
</template>

<script>
export default {
  data () {
    return {
      dialogDelete: false,
      dialogEdit: false,
      headers: [
        { text: 'PageName', value: 'pagename' },
        { text: 'BelongsTo', value: 'projectname' },
        { text: 'HasRole', value: 'roles', sortable: false },
        { text: 'Actions', value: 'actions', sortable: false },
      ],
      editheaders: [
        { text: 'HasRole', value: 'role', sortable: false },
        { text: 'Actions', value: 'actions', sortable: false, align: 'center' },
      ],
      roleName: '',
      pageName: '',
      hasRoles: [],
      belongs: '',
      pageData: [],
      editData: [],
      tempData: '',
      formHasErrors: false,
      errorShown: false,
      errorInfo: '',
      keywords: '',
      expanded: [],
      operate: '',
      newRole: null,
      page: '',
      project: ''
    }
  },
  created () {
    this.initialize()
  },
  computed: {
    form () {
      return {
        newRole: this.newRole
      }
    },
  },
  methods: {
    search () {
      this.$http.get(this.$urls.page_management_search, {
        params: {
          keywords: this.keywords,
          operate: 'get_specify_page'
        }
      })
      .then(response => {
        this.pageData = response.data.content
      })
    },
    async initialize () {
      await this.$http.get(this.$urls.page_management_get, {
        params: {
            operate: 'get_page_titles',
        },
        })
        .then(response => {
          this.pageData = response.data.content
        })
    },
    // update (page, project) {
    //   this.$http.get(this.$urls.page_management_get, {
    //     params: {
    //       operate: 'get_page_roles',
    //       page_name: page,
    //       project_name: project
    //     }
    //   })
    //   .then(response => {
    //     this.editData = response.data.content
    //   })
    // },
    editItem (item) {
      this.dialogEdit = true
      this.tempData = item
      this.pageName = item.pagename
      this.belongs = item.projectname
      this.$http.get(this.$urls.page_management_get, {
        params: {
          operate: 'get_page_roles',
          page_name: this.pageName,
          project_name: this.belongs
        }
      })
      .then(response => {
        this.editData = response.data.content
      })
    },
    deleteItem (item) {
      this.dialogDelete = true,
      this.tempData = item
    },
    async deleteItemConfirm () {
      this.$store.set('progress', true)
      await this.$http.get(this.$urls.page_management_get, {
        params: {
            operate: 'delete_page',
            page_name: this.tempData.pagename,
            project_name: this.tempData.projectname
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
    async upload(operate){
      this.$store.set('progress', true)
      let formData = new FormData()
      formData.append("page_name", this.pageName)
      formData.append("role", this.roleName)
      formData.append("project_name", this.belongs)
      formData.append("action", operate)
      let config = {
        headers: {
        'Content-Type': 'multipart/form-data'
        }
      }
      
      await this.$http.post(this.$urls.page_management_save, formData, config).then(
        (response => {
          if (response.data.content === 'Success'){
            setTimeout(() =>{
              this.editData = response.data.data
              this.initialize()
              this.$store.set('progress', false)
            },1000)
          } else{
            this.errorInfo = response.data.content
            this.errorShown = true
            setTimeout(() =>{
              this.errorShown = false
              this.initialize()
              this.$store.set('progress', false)
            },1000)
          }
        }), (error) => {
            this.errorInfo = 'There are something wrong!'
            this.errorShown = true
            setTimeout(() =>{
              this.errorShown = false
            },4000)
        }
      )
    },
    addRole(){
      if (!this.validate()){
        this.roleName = this.newRole
        this.upload('Add')
      }
    },
    deleteRole(item){
      this.roleName = item.role
      this.upload('Delete')
    },
  },
}
</script>