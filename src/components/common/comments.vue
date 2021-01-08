<template lang="pug">
  v-container
    v-card
      //- template(v-if='comments !== {}')
      RichText(
        v-bind:data='comments'
        v-bind:readOnly='true'
        )
</template>

<script>
import { sync } from 'vuex-pathify'
import RichText from './rich-text.vue'

export default {
  components: {
    RichText
  },
  props: {
    role: {
      type: String,
      default () {
        return 'visitor'
      }
    },
    comments: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
    }
  },
  computed: {
    username: sync('username')
  },
  methods: {
    async fetch (silent = false) {
    },
    /**
     * Post New Comment
     */
    async postComment () {
      this.$emit('uploadChecklistComments', this.newcomment)
      this.newcomment = ''
    },
    /**
     * Show Comment Editing Form
     */
    async editComment (cm) {
    },
    /**
     * Cancel Comment Edit
     */
    editCommentCancel () {
      this.commentEditId = 0
      this.commentEditContent = null
    },
    /**
     * Update Comment with new content
     */
    async updateComment () {
    },
    /**
     * Show Delete Comment Confirmation Dialog
     */
    deleteCommentConfirm (cm) {
      this.commentToDelete = cm
      this.deleteCommentDialogShown = true
    },
    /**
     * Delete Comment
     */
    async deleteComment () {
    }
  }
}
</script>

<style lang="scss">
.comments-post {
  position: relative;

  &:hover {
    .comments-post-actions {
      opacity: 1;
    }
  }

  &-actions {
    position: absolute;
    top: 16px;
    right: 16px;
    opacity: 0;
    transition: opacity .4s ease;
  }

  &-content {
    > p:first-child {
      padding-top: 0;
    }

    p {
      padding-top: 1rem;
      margin-bottom: 0;
    }

    img {
      max-width: 100%;
      border-radius: 5px;
    }

    code {
      background-color: red;
      box-shadow: none;
    }

    pre > code {
      margin-top: 1rem;
      padding: 12px;
      background-color: #111;
      box-shadow: none;
      border-radius: 5px;
      width: 100%;
      color: #FFF;
      font-weight: 400;
      font-size: .85rem;
      font-family: Roboto Mono, monospace;
    }
  }
}
</style>
