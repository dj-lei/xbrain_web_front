<template>
  <div id="app">
    <v-app id="inspire">
      <Page>
      </Page>
    </v-app>
  </div>
</template>

<script>
import Page from './components/common/page'
import SymbolEditor from './components/common/symbol-editor'

export default {
  components: {
    Page,
    SymbolEditor
  },
  data () {
    return {
    }
  }
}
</script>
