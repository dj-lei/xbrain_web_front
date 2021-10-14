import Vue from 'vue'
import App from './App.vue'
import store from './store'
import Vuetify from 'vuetify'
import VueRouter from 'vue-router'
import 'vuetify/dist/vuetify.min.css'
import 'material-design-icons-iconfont/dist/material-design-icons.css'

import service from '@/plugins/http'
import urls from '@/plugins/urls'
import common from '@/plugins/common'

import TroubleShootingTemplateEdit from './components/TroubleShootingTemplateEdit'
import TroubleShootingTask from './components/TroubleShootingTask'
import Pinmux from './components/Pinmux'
import Hunter from './components/Hunter'
import Feedback from './components/Feedback'
import BabelData from './components/BabelData'
import BabelSymbols from './components/BabelSymbols'
import BabelViewer from './components/BabelViewer'
import UserManagement from './components/UserManagement'
import PageManagement from './components/PageManagement'

Vue.config.productionTip = false
Vue.use(Vuetify)

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
  { path: '/hunter', component: Hunter },
  { path: '/trouble_shooting_template_edit', component: TroubleShootingTemplateEdit },
  { path: '/trouble_shooting_task', component: TroubleShootingTask },
  { path: '/feedback', component: Feedback },
  { path: '/data', component: BabelData },
  { path: '/symbols', component: BabelSymbols },
  { path: '/viewer', component: BabelViewer },
  { path: '/user_management', component: UserManagement},
  { path: '/page_management', component: PageManagement}
]

const router = new VueRouter({
  routes
})

if (process.env.NODE_ENV === "production"){
  // console.log = function () {}
  console.error = function () {}
}

new Vue({
  vuetify: new Vuetify(),
  store,
  router,
  render: h => h(App)
}).$mount('#app')


