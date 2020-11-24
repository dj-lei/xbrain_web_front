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
        //- v-layout(row)
        //- v-flex
        <router-view></router-view>
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
  data() {
    return {
    }
  },
  mounted() {
    this.$router.push('/')
  }
}
</script>

<style lang="scss">

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
