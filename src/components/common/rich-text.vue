<template lang="pug">
  editor(ref="editor" :config="config")
</template>

<script>
import Header from '@editorjs/header'
import List from '@editorjs/list'
import Paragraph from '@editorjs/paragraph'
import Table from '@editorjs/table'
import Checklist from '@editorjs/checklist'
import Marker from '@editorjs/marker'
import Warning from '@editorjs/warning'
import Quote from '@editorjs/quote'
import InlineCode from '@editorjs/inline-code'
import Delimiter from '@editorjs/delimiter'
import ImageTool from '@editorjs/image'

export default {
  props: {
    data: {
      type: Object,
      default () {
        return {}
      }
    },
    readOnly: {
      type: Boolean,
      default () {
        return false
      }
    },
  },
  data() {
    return {
      returnData: {},
      config: {
        readOnly: this.readOnly,
        logLevel: 'ERROR',
        tools:{
          header: {
            class: Header,
            config: {
              placeholder: 'Enter a header',
              levels: [2, 3, 4, 5],
              defaultLevel: 3,
            }
          },
          list: {
            class: List,
            inlineToolbar: true,
          },
          paragraph: {
            class: Paragraph,
          },
          table: {
            class: Table,
            inlineToolbar: true,
            config: {
              rows: 2,
              cols: 3,
            },
          },
          checklist: {
            class: Checklist,
          },
          Marker: {
            class: Marker,
            shortcut: 'CMD+SHIFT+M',
          },
          warning: {
            class: Warning,
            inlineToolbar: true,
            shortcut: 'CMD+SHIFT+W',
            config: {
              titlePlaceholder: 'Title',
              messagePlaceholder: 'Message',
            },
          },
          quote: {
            class: Quote,
            inlineToolbar: true,
            shortcut: 'CMD+SHIFT+O',
            config: {
              quotePlaceholder: 'Enter a quote',
              captionPlaceholder: 'Quote\'s author',
            },
          },
          inlineCode: {
            class: InlineCode,
            shortcut: 'CMD+SHIFT+M',
          },
          delimiter: Delimiter,
          image: {
            class: ImageTool,
              config: {
                endpoints: {
                  byFile: process.env.BASE_URL + this.$urls.images_upload, // Your backend file uploader endpoint
                  // byUrl: process.env.BASE_URL + this.$urls.images_get, // Your endpoint that provides uploading by Url
                },
                field: 'image',
                types: 'image/*',
              }
          },
        },
        onReady: () => {
          // console.log(process.env.BASE_URL + this.$urls.images_upload)
        },
        onChange: (args) => {
          this.returnData = args
          this.returnData.saver.save().then((outputData) => {
          this.$emit('uploadDataFunction', outputData)
          }).catch((error) => {
            console.log('Saving failed: ', error)
          });
        },
        data: this.data,
      },
    }
  },
  methods: {
    getData() {
      this.returnData.saver.save().then((outputData) => {
        this.$emit('uploadDataFunction', outputData)
      }).catch((error) => {
        console.log('Saving failed: ', error)
      });
      // return this.returnData.saver.save()
    },
    // onInitialized (editor) {
    //   console.log(editor)
    // }
  }
};
</script>
