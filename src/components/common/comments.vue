<template lang="pug">
  v-container
    v-textarea(
      outlined
      flat
      placeholder="Write a new comment..."
      auto-grow
      dense
      rows='3'
      hide-details
      v-model='newcomment'
      color='blue-grey darken-2'
      background-color='white'
    )
    v-row.mt-2(dense)
    .d-flex.align-center.pt-3
      v-spacer
      .caption.mr-3
        span Posting As_
          strong(place='name') {{ username }}
      v-btn(
        dark
        color='blue-grey darken-2'
        @click='postComment'
        depressed
        aria-label='Post Comment'
        )
        v-icon(left) mdi-comment
        span.text-none Post Comment
    v-divider.mt-3
    v-timeline(dense)
      v-timeline-item.comments-post(
        color='blue-grey'
        large
        icon="mdi-star"
        v-for='cm of comments'
        :key='`comment-` + cm.created_time'
        :id='`comment-post-id-` + cm.created_time'
        )
        v-card.elevation-1
          v-card-text
            .comments-post-name.caption: strong {{cm.username}}
            .comments-post-date.overline.grey--text {{ cm.created_time }}
            div(v-for="(text, index) in cm.comment.split('\\n')", :key="index")
              .comments-post-content.mt-3 {{ text }}
</template>

<script>
import { sync } from 'vuex-pathify'

export default {
  props: {
    comments: {
      type: Array,
      default: () => ([])
    }
  },
  data () {
    return {
      newcomment: '',
      isLoading: true,
      hasLoadedOnce: false,
      guestName: '',
      guestEmail: '',
      commentToDelete: {},
      commentEditId: 0,
      commentEditContent: null,
      deleteCommentDialogShown: false,
      isBusy: false,
      scrollOpts: {
        duration: 1500,
        offset: 0,
        easing: 'easeInOutCubic'
      }
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
