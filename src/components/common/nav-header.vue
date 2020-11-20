<template lang='pug'>
  v-app-bar.nav-header(color='black', dark, app, clipped-left, clipped-right, fixed)
    v-layout(row)
      v-flex(xs1)
        v-img.org-logo(src='./assets/logo.png')
      v-flex(xs10)
      v-flex(xs1)
        v-menu(v-if='isAuthenticated', offset-y, bottom, min-width='200', transition='slide-y-transition', left)
          template(v-slot:activator='{ on: menu, attrs }')
            v-tooltip(bottom)
              template(v-slot:activator='{ on: tooltip }')
                v-btn(
                  icon
                  v-bind='attrs'
                  v-on='{ ...menu, ...tooltip }'
                  tile
                  height='64'
                  )
                  v-icon(color='grey') mdi-account-circle
              span HHH
          v-list(nav)
            v-list-item(@click='logout')
              v-list-item-action: v-icon(color='red') mdi-logout
              v-list-item-title Logout

        v-tooltip(v-else, left)
          template(v-slot:activator='{ on }')
            v-btn(icon, color='grey darken-3', @click='goLogin')
              v-icon(color='grey') mdi-account-circle
          span Login
    Login(ref="login" @login-success-event='loginSuccess')
</template>

<script>
import Login from './login.vue'

export default {
  components: {
    Login
  },
  data() {
    return {
      username: '',
      isAuthenticated: false,
    }
  },
  methods: {
    loginSuccess() {
      this.isAuthenticated = true
    },
    goLogin() {
      this.$refs['login'].dialog = true
    }
  }
}
</script>

<style lang='scss'>

.nav-header {
  //z-index: 1000;

  .v-toolbar__extension {
    padding: 0;

    .v-toolbar__content {
      padding: 0;
    }
    .v-text-field .v-input__prepend-inner {
      padding: 0 14px 0 5px;
      padding-right: 14px;
    }
  }

  .org-logo {
    cursor: pointer;
  }

  &-inner {
    .v-toolbar__content {
      padding: 0;
    }
  }

  &-search-adv {
    position: absolute;
    top: 7px;
    right: 12px;
    border-radius: 4px !important;

    @at-root .v-application--is-rtl & {
      right: initial;
      left: 12px;
    }

    &::before {
      border-radius: 4px !important;
    }

    &:hover, &:focus {
      position: absolute !important;

      &::before {
        border-radius: 4px;
      }
    }
  }

  &-dev {
    background-color: mc('red', '600');
    position: absolute;
    top: 11px;
    left: 255px;
    padding: 5px 15px;
    border-radius: 5px;
    display: flex;

    .v-icon {
      margin-right: 15px;
    }

    .overline:nth-child(2) {
      text-transform: none;
    }
  }
}

.navHeaderSearch {
  &-enter-active, &-leave-active {
    transition: opacity .25s ease, transform .25s ease;
    opacity: 1;
  }
  &-enter-active {
    transition-delay: .25s;
  }
  &-enter, &-leave-to {
    opacity: 0;
    transform: scale(.7, .7);
  }
}
.navHeaderLoading { // To avoid search bar jumping
  width: 22px;
}

</style>
