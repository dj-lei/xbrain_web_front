<template>
  <div id="app">
    <v-app id="inspire">
      <Pinmux>
      </Pinmux>
    </v-app>
  </div>
</template>

<script>
// import TroubleShooting from './components/TroubleShooting'
import Pinmux from './components/Pinmux'

export default {
  components: {
    Pinmux
  },
  data () {
    return {
    }
  }
}
</script>
