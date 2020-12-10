<template lang="pug">
  v-app(dark)
    NavHeader
    v-navigation-drawer(
      dark
      app
      clipped
      )
      NavSidebar
    v-main(ref='content')
      v-container
        <router-view></router-view>
        v-dialog(v-model='progress', persistent, width='200px')
          div(class="text-center")
            v-progress-circular(
            indeterminate
            size='100'
            width='15'
            color='green lighten-3'
            ) Waiting

</template>

<script>
import { get, sync } from 'vuex-pathify'
import NavHeader from './nav-header'
import NavSidebar from './nav-sidebar'

export default {
  components: {
    NavHeader,
    NavSidebar
  },
  computed: {
    progress: sync('progress')
  },
  data() {
    return {
    }
  },
  mounted() {
    let pathname = window.location.pathname
    if (pathname.indexOf("trouble_shooting_task/") >= 0){
      this.$router.push({ path: '/trouble_shooting_task', query: { taskId: pathname.split('/')[2] }})
    }else {
      this.$router.push('/')
    }
  }
}
</script>

<style lang="scss">

.v-progress-circular {
margin: 2rem;
}

.breadcrumbs-nav {
  .v-btn {
    min-width: 0;
    &__content {
      text-transform: none;
    }
  }
  .v-breadcrumbs__divider:nth-child(2n) {
    padding: 0 6px;
  }
  .v-breadcrumbs__divider:nth-child(2) {
    padding: 0 6px 0 12px;
  }
}

.page-col-sd {
  margin-top: -90px;
  align-self: flex-start;
  position: sticky;
  top: 64px;
  max-height: calc(100vh - 64px);
  overflow-y: auto;
  -ms-overflow-style: none;
}

.page-col-sd::-webkit-scrollbar {
  display: none;
}

</style>
