<template lang="pug">
  v-app
    v-dialog(v-model="dialog", max-width="500px", transition="dialog-bottom-transition")
      v-card
        v-card-title
          span {{ title }}
        v-card-text
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
              ref="username"
              v-model="username"
              flat
              outlined
              :rules="[() => !!username || 'This field is required']"
              label="username"
              placeholder="username"
              prepend-inner-icon='mdi-clipboard-account'
              background-color='white'
              color='blue darken-2'
              required
              light
            )
            v-text-field(
              ref="password"
              v-model='password'
              flat
              outlined
              :rules="[() => !!password || 'This field is required']"
              prepend-inner-icon='mdi-clipboard-account'
              background-color='white'
              color='blue darken-2'
              type="password"
              label="password"
              placeholder='password'
              required
              light
              )
            v-spacer(class="mt-8")
            v-btn(
                width='100%'
                large
                color='blue darken-2'
                dark
                @click='login'
                :loading='isLoading'
                ) Login
            v-toolbar(flat)
              //- v-btn(
                text
                rounded
                color='indigo darken-2'
                @click='forgotPassword'
                ): .caption ForgotPassword
              v-divider(class="mx-4", inset, vertical)
              v-spacer
              v-btn(
                text
                rounded
                color='indigo darken-2'
                @click='goRegister'
                ): .caption Register
          template(v-if='screen === `register`')
            v-alert(
              transition='slide-y-reverse-transition'
              color='yellow darken-2'
              tile
              dark
              dense
              icon='mdi-alert'
            ) Please enter Skype's user name for us to contact!
            v-text-field(
              ref="username"
              v-model="username"
              flat
              outlined
              :rules="[() => !!username || 'This field is required']"
              label="username"
              placeholder="username"
              prepend-inner-icon='mdi-clipboard-account'
              background-color='white'
              color='blue darken-2'
              required
              light
            )
            v-text-field(
              ref="password"
              v-model='password'
              flat
              outlined
              :rules="[() => !!password || 'This field is required']"
              prepend-inner-icon='mdi-clipboard-account'
              background-color='white'
              color='blue darken-2'
              type="password"
              label="password"
              placeholder='password'
              required
              light
              )
            v-text-field(
              ref="confirmPassword"
              v-model='confirmPassword'
              flat
              outlined
              :rules="[() => !!confirmPassword || 'This field is required']"
              prepend-inner-icon='mdi-clipboard-account'
              background-color='white'
              color='blue darken-2'
              type="password"
              label="Confirm Password"
              placeholder='confirm password'
              required
              light
              )
            v-spacer(class="mt-8")
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
import {JSEncrypt} from 'jsencrypt'
import CryptoJS from 'crypto-js'

export default {
  data () {
    return {
      publicKey: '',
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
      pulicKey:'MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBANL378k3RiZHWx5AfJqdH9xRNBmD9wGD\n' +
  '2iRe41HdTNF8RUhNnHit5NpMNtGL0NPTSSpPjjI1kJfVorRvaQerUgkCAwEAAQ=='
    }
  },
  computed: {
    form () {
      return {
        username: this.username,
        password: this.password,
        confirmPassword: this.confirmPassword,
      }
    },
  },
  watch: {
    dialog (val) {
      if (val === false) {
        this.title = 'Login'
        this.screen = 'login'
        this.password = ''
        this.confirmPassword = ''
        this.isLoading = false
        this.$refs['username'].reset()
        this.$refs['password'].reset()
      }
    }
  },
  // created() {
  //   // let encryptor = new JSEncrypt()
  //   this.encryptor.setPublicKey(this.publicKey)
  // },
  methods: {
    async login() {
    // let n = "carNo=甘-J2L199&distance=3000&isNewReport=1&latitude=0&longitude=0&nonce=75341421609739888281&openId=&privacyOption=1&signType=MD5&timestamp=1609739888281&userId=c36b86825b004d648bfbbbc1b58a675e&W9cE5d4q0df9GjeBaR16a5B56Z1V51i7"
    // let sign = CryptoJS.MD5(n).toString().toUpperCase()

    // let e = JSON.parse("{\"isNewReport\":1,\"userId\":\"c36b86825b004d648bfbbbc1b58a675e\",\"carNo\":\"甘-J2L199\",\"privacyOption\":1,\"longitude\":0,\"latitude\":0,\"distance\":3000,\"openId\":\"\",\"signType\":\"MD5\",\"timestamp\":1609739888281,\"nonce\":\"75341421609739888281\",\"sign\":\"48DF5B8598ADEC7BE0D1B90D268C227E\"}")
    // e.sign = sign
    // e = JSON.stringify(e)
    // let r = "L2kJs2aH9zT3X9SF"
    // let t
    // n = null

    // var o = CryptoJS.enc.Utf8.parse(e),
    // i = CryptoJS.enc.Utf8.parse(t || r),
    // c = CryptoJS.AES.encrypt(o, i, n || {
    //   mode: CryptoJS.mode.ECB,
    //   padding: CryptoJS.pad.Pkcs7
    // })
    // console.log(CryptoJS.enc.Hex.stringify(c.ciphertext).toUpperCase())

      if (this.username !== '' && this.password !== ''){
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
            this.$store.set('pages', response.data.content)
            this.$store.set('groups', response.data.groups)
            setTimeout(() =>{
              this.dialog = false
              this.snackbar = true
              this.$router.push('/')
              this.$store.set('username', this.username)
              this.$store.set('isAuthenticated', true)
            },1000)
        }, (error) => {
          this.errorMsg = 'Your account or password is not correct!'
          this.errorShown = true
          this.isLoading = false
          setTimeout(() =>{
            this.errorShown = false
          },4000)
        })
      }else{
        this.$refs['username'].validate(true)
        this.$refs['password'].validate(true)
      }
    },
    goRegister() {
      this.title = 'Register'
      this.screen = 'register'
    },
    async confirmRegister() {
      if (this.username !== '' && this.password !== '' && this.confirmPassword !== '' && this.password === this.confirmPassword){
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
            setTimeout(() =>{
              this.dialog = false
              this.snackbar = true
              this.$store.set('username', this.username)
              this.$store.set('isAuthenticated', true)
            },1000)
        }, (error) => {
          this.errorMsg = 'Your account has logined,please change another account.'
          this.errorShown = true
          this.isLoading = false
          setTimeout(() =>{
            this.errorShown = false
          },4000)
        })
      }else if (this.password !== this.confirmPassword) {
        this.errorMsg = 'You must fill in your account and password,Or password is not equal to confirmPassword!'
        this.errorShown = true
        setTimeout(() =>{
          this.errorShown = false
        },4000)
      }
      this.$refs['username'].validate(true)
      this.$refs['password'].validate(true)
      this.$refs['confirmPassword'].validate(true)
    },
    forgotPassword() {
      // this.$refs['login'].dialog = true
    },
  }
}
</script>
