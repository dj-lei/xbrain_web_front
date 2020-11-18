import Vue from 'vue'
import App from './App.vue'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
import 'material-design-icons-iconfont/dist/material-design-icons.css'

import service from '@/plugins/http'
import urls from '@/plugins/urls'
import common from '@/plugins/common'

Vue.config.productionTip = false
Vue.use(Vuetify)

Vue.prototype.$http = service
Vue.prototype.$urls = urls
Vue.prototype.$common = common

new Vue({
  vuetify: new Vuetify(),
  render: h => h(App)
}).$mount('#app')


