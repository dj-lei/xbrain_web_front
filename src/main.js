import Vue from 'vue'
import App from './App.vue'
import store from './store'
import Vuetify from 'vuetify'
import VueRouter from 'vue-router'
import CKEditor from '@ckeditor/ckeditor5-vue2'
import 'vuetify/dist/vuetify.min.css'
import 'material-design-icons-iconfont/dist/material-design-icons.css'

import service from '@/plugins/http'
import urls from '@/plugins/urls'
import common from '@/plugins/common'

import TroubleShootingTemplateEdit from './components/TroubleShootingTemplateEdit'
import TroubleShootingTask from './components/TroubleShootingTask'
import Pinmux from './components/Pinmux'
import Feedback from './components/Feedback'

Vue.config.productionTip = false
Vue.use(Vuetify)
Vue.use(CKEditor)

const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}
Vue.use(VueRouter)

Vue.prototype.$http = service
Vue.prototype.$urls = urls
Vue.prototype.$common = common

const routes = [
  { path: '/', component: Pinmux },
  { path: '/pinmux', component: Pinmux },
  { path: '/trouble_shooting_template_edit', component: TroubleShootingTemplateEdit },
  { path: '/trouble_shooting_task', component: TroubleShootingTask },
  { path: '/feedback', component: Feedback }
]

const router = new VueRouter({
  routes
})

new Vue({
  vuetify: new Vuetify(),
  store,
  router,
  render: h => h(App)
}).$mount('#app')


