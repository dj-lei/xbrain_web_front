<template  lang="pug">
  div(id="app")
    v-app(id="inspire")
      template
        v-card(color="grey lighten-4", dark, flat, height="50px")
          v-toolbar(dense)
            v-toolbar-title User Management
            v-divider(class="mx-4", inset, vertical)
            v-text-field(v-model="keywords" hide-details prepend-icon="search" label="Search")
            v-spacer
            v-dialog(v-model="dialogEdit", transition="dialog-bottom-transition", max-width="600px")
              v-card
                v-col
                  v-card-text
                    v-alert(v-model='errorShown', transition='slide-y-reverse-transition', color='red darken-2', tile, dark, dense, icon='mdi-alert') {{ errorInfo }}
                    v-text-field(
                      ref="userName"
                      v-model="userName"
                      label="User Name"
                      disabled=true
                    )
                    v-text-field(
                      ref="hasRoles"
                      v-model="hasRoles"
                      label="Has Roles"
                      disabled=true
                    )
                    v-data-table(:headers="editheaders", :items="editData", class="elevation-1")
                      template(v-slot:item.role="{ item }")
                        v-autocomplete(
                          ref="roleName"
                          v-model="roleName"
                          :rules="[() => !!roleName || 'This field is required']"
                          :items="item.role"
                          required
                          placeholder="Select... role"
                        )
                      template(v-slot:item.actions="{ item }")
                        v-tooltip(bottom)
                          template(v-slot:activator="{ on,attrs }")
                            v-icon(small, class="mr-2", v-bind="attrs", v-on="on", @click="addRole(item)") mdi-pencil-plus
                          span Add
                        v-tooltip(bottom)
                          template(v-slot:activator="{ on,attrs }")
                            v-icon(small, v-bind="attrs", v-on="on", @click="deleteRole(item)") mdi-delete
                          span Delete
                    v-divider(class="mt-12")
                  v-card-actions
                      v-spacer
                        v-row(type="flex" justify="end")
                          v-btn(color="blue darken-1", text, @click="dialogEdit = false") Cancel
            //- v-dialog(v-model="dialogEdit", transition="dialog-bottom-transition", max-width="400px")
            //-   v-card
            //-     v-col
            //-       v-card-text
            //-         v-alert(v-model='errorShown', transition='slide-y-reverse-transition', color='red darken-2', tile, dark, dense, icon='mdi-alert') {{ errorInfo }}
            //-         v-text-field(
            //-           ref="userName"
            //-           v-model="userName"
            //-           label="User Name"
            //-           disabled=true
            //-         )
            //-         v-text-field(
            //-           ref="hasRoles"
            //-           v-model="hasRoles"
            //-           label="Has Roles"
            //-           disabled=true
            //-         )
            //-         v-autocomplete(
            //-           ref="projectName"
            //-           v-model="projectName"
            //-           :rules="[() => !!projectName || 'This field is required']"
            //-           :items="projects"
            //-           label="Project Name"
            //-           placeholder="Select... name"
            //-           @change='change'
            //-           required
            //-         )
            //-         v-autocomplete(
            //-           ref="roleName"
            //-           v-model="roleName"
            //-           :rules="[() => !!roleName || 'This field is required']"
            //-           :items="roles"
            //-           label="Role Name"
            //-           placeholder="Select... role"
            //-           required
            //-         )
            //-         v-autocomplete(
            //-           ref="action"
            //-           v-model="action"
            //-           :rules="[() => !!action || 'This field is required']"
            //-           :items="actions"
            //-           label="Action"
            //-           placeholder="Select... action"
            //-           required
            //-         )
            //-         v-divider(class="mt-12")
            //-       v-card-actions
            //-         v-btn(color="blue darken-1", text, @click="dialogEdit = false") Cancel
            //-         v-spacer
            //-         v-btn(color="blue darken-1", text, @click="upload") Submit
            v-spacer
            v-dialog(v-model="dialogDelete" max-width="500px")
              v-card
                v-card-title(class="headline") Are you sure you want to delete this user?
                v-card-actions
                  v-spacer
                  v-btn(color="blue darken-1" text @click="dialogDelete = false") Cancel
                  v-btn(color="blue darken-1" text @click="deleteItemConfirm") OK
                  v-spacer
      v-data-table(:headers="headers", :items="userData", :search="keywords", class="elevation-1", :expanded.sync="expanded", show-expand) 
        //- 还没想好怎么样好看的显示description
        template(v-slot:expanded-item="{ headers, item }")
          td(:colspan="headers.length") {{ item.roles }}
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
import { get, sync } from 'vuex-pathify'

export default {
  data () {
    return {
      dialogDelete: false,
      dialogEdit: false,
      headers: [
        // { text: 'Id', value: 'id' },
        { text: 'UserName', value: 'username' },
        { text: 'Authority', value: 'authority', sortable: false },
        { text: 'HasRole', value: 'roles', sortable: false },
        { text: '', value: 'data-table-expand' },
        { text: 'Actions', value: 'actions', sortable: false },
      ],
      editheaders: [
        { text: 'Project Name', value:'project' },
        { text: 'Role', value: 'role', sortable: false },
        { text: 'Actions', value: 'actions', sortable: false },
      ],
      // projectName: null,
      roleName: null,
      // action: null,
      userName: '',
      hasRoles: '',
      userId: '',
      // projects:[],
      // roles: [],
      // actions: ['Delete', 'Add'],
      userData: [],
      editData: [],
      tempData: '',
      diffHtml: '',
      formHasErrors: false,
      errorShown: false,
      errorInfo: '',
      keywords: '',
      expanded: [],
      operate: ''
    }
  },
  created () {
    this.initialize()
  },
  computed: {
    groups: sync('groups'),
    form () {
      return {
        // projectName: this.projectName,
        roleName: this.roleName,
        // action: this.action,
      }
    },
  },
  methods: {
    // search () {
    //   this.$http.get(this.$urls.user_management_search, {
    //     params: {
    //       keywords: this.keywords,
    //       operate: 'get_specify_user'
    //     }
    //   })
    //   .then(response => {
    //     this.userData = response.data.content
    //   })
    // },
    async initialize () {
      await this.$http.get(this.$urls.user_management_get, {
        params: {
            operate: 'get_user_titles',
        },
        })
        .then(response => {
          this.userData = response.data.content
        })
    },
    async editItem (item) {
      this.dialogEdit = true,
      this.userName = item.username,
      this.hasRoles = item.roles,
      this.userId = item.id
      this.$http.get(this.$urls.user_management_get, {
        params: {
          // operate: 'get_all_projects'
          operate: 'get_projects_roles'
        }
      })
      .then(response => {
        // this.projects = response.data.content
        this.editData = response.data.content
      })
    },
    // async change () {
    //   await this.$http.get(this.$urls.user_management_get, {
    //     params: {
    //       operate: 'get_the_roles',
    //       project: this.projectName
    //     }
    //   })
    //   .then(response => {
    //     this.roles = response.data.content
    //   })
    // },
    deleteItem (item) {
      this.dialogDelete = true,
      this.tempData = item
    },
    async deleteItemConfirm () {
      this.$store.set('progress', true)
      await this.$http.get(this.$urls.user_management_get, {
        params: {
            operate: 'delete_user',
            user_id: this.tempData.id,
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
    // upload (){ //改变
    //   if (!this.validate()) {
    //     this.$store.set('progress', true)
    //     let formData = new FormData()
    //     formData.append("user_id", this.userId)
    //     formData.append("has_role", this.hasRoles)
    //     formData.append("project", this.projectName)
    //     formData.append("role", this.roleName)
    //     formData.append("action", this.action)
    //     formData.append("groups", this.groups)
    //     let config = {
    //       headers: {
    //       'Content-Type': 'multipart/form-data'
    //       }
    //     }
      
    //     this.$http.post(this.$urls.user_management_save, formData, config).then(
    //       (response => {
    //         if (response.data.content === 'Success'){
    //           setTimeout(() =>{
    //             this.initialize()
    //             // this.dialogEdit = false
    //             this.$store.set('progress', false)
    //           },1000)
    //         } else{
    //           this.errorInfo = response.data.content
    //           this.errorShown = true
    //           setTimeout(() =>{
    //             this.errorShown = false
    //             this.initialize()
    //             // this.dialogEdit = false
    //             this.$store.set('progress', false)
    //           },1000)
    //         }
    //       }), (error) => {
    //           this.errorInfo = 'There are something wrong!'
    //           this.errorShown = true
    //           setTimeout(() =>{
    //             this.errorShown = false
    //           },4000)
    //       }
    //     )
    //   }
    // },
    upload(operate){
      this.$store.set('progress', true)
      let formData = new FormData()
      formData.append("user_id", this.userId)
      formData.append("has_role", this.hasRoles)
      formData.append("project", this.projectName)
      formData.append("role", this.roleName)
      formData.append("action", operate)
      let config = {
        headers: {
        'Content-Type': 'multipart/form-data'
        }
      }
      
      this.$http.post(this.$urls.user_management_save, formData, config).then(
        (response => {
          if (response.data.content === 'Success'){
            setTimeout(() =>{
              this.initialize()
              this.hasRoles = response.data.data
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
    addRole(item){
      this.projectName = item.project
      this.upload('Add')
    },
    deleteRole(item){
      this.projectName = item.project
      this.upload('Delete')
    },
  },
}
</script>