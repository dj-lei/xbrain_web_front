<template lang="pug">
  v-app
    v-dialog(v-model="dialog", max-width="500px", transition="dialog-bottom-transition")
      v-card
        v-card-title
          span {{ title }}
        v-card-text
          v-container
            v-alert(
              v-model='errorShown'
              transition='slide-y-reverse-transition'
              color='red darken-2'
              tile
              dark
              dense
              icon='mdi-alert'
            ) {{ errorMsg }}
            template(v-if='screen === `login`')
              v-text-field(
                solo
                flat
                outlined
                prepend-inner-icon='mdi-clipboard-account'
                background-color='white'
                color='blue darken-2'
                hide-details
                v-model="username"
                placeholder='username'
                light
                )
              v-text-field(
                solo
                flat
                outlined
                prepend-inner-icon='mdi-clipboard-account'
                background-color='white'
                color='blue darken-2'
                hide-details
                v-model='password'
                type="password"
                placeholder='password'
                light
                )
              v-btn(
                  width='100%'
                  large
                  color='blue darken-2'
                  dark
                  @click='login'
                  :loading='isLoading'
                  ) Login
              v-toolbar(flat)
                v-btn(
                  text
                  rounded
                  color='indigo darken-2'
                  @click='forgotPassword'
                  ): .caption ForgotPassword
                v-divider(class="mx-4", inset, vertical)
                v-btn(
                  text
                  rounded
                  color='indigo darken-2'
                  @click='goRegister'
                  ): .caption Register
            template(v-if='screen === `register`')
              v-text-field(
                solo
                flat
                outlined
                prepend-inner-icon='mdi-clipboard-account'
                background-color='white'
                color='blue darken-2'
                hide-details
                v-model="username"
                placeholder='username'
                light
                )
              v-text-field(
                solo
                flat
                outlined
                prepend-inner-icon='mdi-clipboard-account'
                background-color='white'
                color='blue darken-2'
                hide-details
                v-model='password'
                type="password"
                placeholder='password'
                light
                )
              v-text-field(
                solo
                flat
                outlined
                prepend-inner-icon='mdi-clipboard-account'
                background-color='white'
                color='blue darken-2'
                hide-details
                v-model='confirmPassword'
                type="password"
                placeholder='confirm password'
                light
                )
              v-btn(
                  width='100%'
                  large
                  color='blue darken-2'
                  dark
                  @click='confirmRegister'
                  :loading='isLoading'
                  ) Register
    v-snackbar(v-model="snackbar", :timeout="timeout") {{ info }}
      template(v-slot:action="{ attrs }")
        v-btn(color="blue", text, v-bind="attrs", @click="snackbar = false") Close
</template>

<script>
export default {
  data () {
    return {
      dialog: false,
      screen: 'login',
      title: 'Login',
      username: '',
      password: '',
      confirmPassword: '',
      isLoading: false,
      errorShown: false,
      snackbar: false,
      errorMsg: '',
      info: '',
      timeout: 4000,
    }
  },
  watch: {
    dialog (val) {
      this.title = 'Login'
      this.screen = 'login'
      this.password = ''
      this.confirmPassword = ''
    }
  },
  methods: {
    async login() {
      this.isLoading = true

      let formData = new FormData()
      formData.append("username", this.username)
      formData.append("password", this.password)
      let config = {
        headers: {
        'Content-Type': 'multipart/form-data'
        }
      }

      await this.$http.post(this.$urls.admin_login, formData, config).then(
        (response)=>{
          this.info = 'Hi ' + this.username + ',welcome!'
      }, (error) => {
        console.log(error)
      })
      setTimeout(() =>{
        this.dialog = false
        this.snackbar = true
        this.$emit('login-success-event')
      },1000)
    },
    goRegister() {
      this.title = 'Register'
      this.screen = 'register'
    },
    async confirmRegister() {
      this.isLoading = true

      let formData = new FormData()
      formData.append("username", this.username)
      formData.append("password", this.password)
      let config = {
        headers: {
        'Content-Type': 'multipart/form-data'
        }
      }

      await this.$http.post(this.$urls.admin_register, formData, config).then(
        (response)=>{
          this.info = 'Hi ' + this.username + ',welcome!'
      }, (error) => {
        console.log(error)
      })
      setTimeout(() =>{
        this.dialog = false
        this.snackbar = true
        this.$emit('login-success-event')
      },1000)
    },
    forgotPassword() {
      // this.$refs['login'].dialog = true
    },
  }
}
</script>
