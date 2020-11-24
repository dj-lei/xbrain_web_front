import Vue from 'vue'
import Vuex from 'vuex'
import pathify from 'vuex-pathify'
import { make } from 'vuex-pathify'

Vue.use(Vuex)

const state = {
  username: '',
  pages: [],
  groups: [],
  isAuthenticated: false,
}

const store = new Vuex.Store({
  plugins: [
    pathify.plugin
  ],
  state,
  mutations: {
    ...make.mutations(state),
  }
})

export default store
window.store = store
