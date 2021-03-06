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
import urls from './urls'
import * as d3 from 'd3'
// import * as math from 'mathjs'

export default {
    getUrlParams (urlStr) {
      if (typeof urlStr == "undefined") {
        var url = decodeURI(location.search)
       } else {
        var url = "?" + urlStr.split("?")[1]
       }
       var theRequest = new Object()
       if (url.indexOf("?") != -1) {
        var str = url.substr(1)
        var strs = str.split("&")
        for (var i = 0; i < strs.length; i++) {
          theRequest[strs[i].split("=")[0]] = decodeURI(strs[i].split("=")[1])
        }
       }
       return theRequest
    },
    getTime () {
      let yy = new Date().getFullYear();
      let mm = new Date().getMonth()+1;
      let dd = new Date().getDate();
      let hh = new Date().getHours();
      let mf = new Date().getMinutes()<10 ? '0'+new Date().getMinutes() : new Date().getMinutes();
      let ss = new Date().getSeconds()<10 ? '0'+new Date().getSeconds() : new Date().getSeconds();
      return yy+'-'+mm+'-'+dd+' '+hh+':'+mf+':'+ss
    },
    colorRGBtoHex(color) {
      var rgb = color.split(',')
      var r = parseInt(rgb[0].split('(')[1])
      var g = parseInt(rgb[1])
      var b = parseInt(rgb[2].split(')')[0])
      var hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
      return hex
    },
    setBrowserTitle(val){
      document.title = "Edit "+val
    },
    generateUUID() {
      var d = new Date().getTime()
      var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0
        d = Math.floor(d/16)
        return (c=='x' ? r : (r&0x3|0x8)).toString(16)
      })
      return 'a'+uuid
    },
    readImages (images) {
      let temp = []
      images.forEach((image, index) => {
        const reader = new FileReader()
        reader.readAsDataURL(image)
        reader.onload = function () {
          temp.push({'uuid': index.toString(), 'content':reader.result})
        }
      })
      return temp
    },

    jsonSearchId(node_data, id){
      if(node_data instanceof Array){
        for(var i=0; i<node_data.length; i++){

          if(node_data[i]['id'] == id){
            return node_data[i]
          }else{
            if(node_data[i].hasOwnProperty('children')){
              var temp = this.jsonSearchId(node_data[i]['children'], id)
              if(temp instanceof Array){
                continue
              }else{
                return temp
              }
            }else{
              continue
            }
          }
        }
      }
      return []
    },

    clearChildren(data){
      var temp = JSON.parse(JSON.stringify(data))
      temp.forEach((elm, index) => {
        temp[index]['children'] = []
      })
      return temp
    },

    dictRetrievalNotWithChildren(node_data, node_id){
      if(node_data instanceof Array){
        for(var i=0; i<node_data.length; i++){
          if (node_data[i]['id'] === node_id){
            console.log(node_data[i])
            let temp = this.clearChildren(node_data)
            console.log(temp)
            if (node_data[i].hasOwnProperty('children')){
              let temp2 = this.clearChildren(node_data[i]['children'])
              temp[i]['children'] = temp2
            }
            return temp
          }else{
            if (node_data[i].hasOwnProperty('children')){
              let temp = this.dictRetrievalNotWithChildren(node_data[i]['children'], node_id)
              if(temp instanceof Array){
                continue
              }else{
                let temp2 = this.clearChildren(node_data)
                temp2[i]['children'] = temp
                return temp2
              }
            }else{
              continue
            }
          }
        }
      }else{
        if(node_data['id'] === node_id){
          let temp = node_data
          if (node_data.hasOwnProperty('children')){
            temp['children'] = this.clearChildren(node_data['children'])
            return temp
          }
          return node_data
        }else if (node_data.hasOwnProperty('children')){
          return this.dictRetrievalNotWithChildren(node_data['children'], node_id)
        }else{
          return []
        }
      }
      return []
    },

    dedupe(array){
      return Array.from(new Set(array))
    },

    getRootVar(expression){
      expression = window.atob(expression)
      let vars = expression.match(/([a-zA-Z][\w.]+)/g)
      let temp = []
      vars.forEach((v) => {
        let data = d3.select('span#'+v.replace('.','\\.')).node()
        if (data !== null){
          if (data.getAttribute('expression') !== null) {
            temp = temp.concat(this.getRootVar(data.getAttribute('expression')))
          }else{
            temp.push(v)
          }
        }else{
          temp.push(v)
        }
      })
      return temp
    },

    // calExpressDepend(expression, extVar){
    //   expression = window.atob(expression)
    //   let vars = expression.match(/([a-zA-Z][\w.]+)/g)
    //   vars.forEach((v) => {
    //     let data = d3.select('span#'+v.replace('.','\\.')).node()
    //     if (data !== null){
    //       if (data.getAttribute('expression') !== null) {
    //         expression = expression.replace(v, this.calExpressDepend(data.getAttribute('expression'), extVar))
    //       }else{
    //         expression = expression.replace(v, window.atob(data.getAttribute('value')))
    //       }
    //     }else{
    //       expression = expression.replace(v,extVar[v])
    //     }
    //   })
    //   return math.evaluate(expression)
    // },

    getEditorJSConfig(holder, data, readOnly=false) {
      return {
        holder: holder,
        readOnly: readOnly,
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
                  byFile: process.env.BASE_URL + urls.images_upload, // Your backend file uploader endpoint
                  // byUrl: process.env.BASE_URL + this.$urls.images_get, // Your endpoint that provides uploading by Url
                },
                field: 'image',
                types: 'image/*',
              }
          },
        },
        data: data,
        onReady: function(){

        },
        onChange: function() {

        }
      }
    }
  }
