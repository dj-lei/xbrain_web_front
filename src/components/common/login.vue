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
      // var public_key = '-----BEGIN PUBLIC KEY-----\n';
      //   public_key += 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCkpig5EfnRXR2QmITJNHQraAC3\n';
      //   public_key += 'x8g0+1CGsAqvc7DhVQ96wDHwJa0tL3xWSbQtU7ZG8quvuDU/Qki5wcYymykUIJP6\n';
      //   public_key += 'wzXXfiBWo2unjEeXj3fhnz0yEho193nOgXV9cvwBkcSfVEyUtHklBDsuKeMgPoWy\n';
      //   public_key += 'a5MaRKKGMaIXk7Rp1wIDAQAB\n';
      //   public_key += '-----END PUBLIC KEY-----';

      // let encryptor = new JSEncrypt()
      // encryptor.setPublicKey(public_key)
      // console.log(encryptor.encrypt('administrator'))

      // // Encrypt
      // var ciphertext = CryptoJS.AES.encrypt('administrator', 'abcd').toString();
      // console.log(ciphertext)
      // // Decrypt
      // var bytes  = CryptoJS.AES.decrypt(ciphertext, 'abcd');
      // var originalText = bytes.toString(CryptoJS.enc.Utf8);
      // console.log(originalText); // 'my message'

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
