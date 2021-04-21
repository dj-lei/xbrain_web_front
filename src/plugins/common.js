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
import axios from 'axios'
import * as d3 from 'd3'
import * as math from 'mathjs'

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
    getTime (time_stamp) {
      let yy = new Date().getFullYear();
      let mm = new Date().getMonth()+1;
      let dd = new Date().getDate();
      let hh = new Date().getHours()
      let mf = new Date().getMinutes()<10 ? '0'+new Date().getMinutes() : new Date().getMinutes();
      let ss = new Date().getSeconds()<10 ? '0'+new Date().getSeconds() : new Date().getSeconds();
      return yy+'-'+mm+'-'+dd+' '+hh+':'+mf+':'+ss
    },
    getTimeHour (time_stamp) {
      // let yy = new Date().getFullYear();
      // let mm = new Date().getMonth()+1;
      // let dd = new Date().getDate();
      let hh = new Date(time_stamp).getHours()
      let mf = new Date(time_stamp).getMinutes()<10 ? '0'+new Date(time_stamp).getMinutes() : new Date(time_stamp).getMinutes();
      let ss = new Date(time_stamp).getSeconds()<10 ? '0'+new Date(time_stamp).getSeconds() : new Date(time_stamp).getSeconds();
      return hh+':'+mf+':'+ss
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

    queryEnvId(e){
      if(d3.select('path#'+e.replace('.','\\.')).node() !== null){
        return d3.select('path#'+e.replace('.','\\.')).node()
      }else if(d3.select('div#'+e.replace('.','\\.')).node() !== null){
        return d3.select('div#'+e.replace('.','\\.')).node()
      }
      return null  
    },

    async getRootVar(expression, data_pool){
      expression = window.atob(expression)
      // let vars = expression.match(/([a-zA-Z][\w.]+)/g)
      let vars = expression.match(/([a-zA-Z$][\w.${}]+)/g)
      vars.forEach((v) => {
        if(v.indexOf("$") > -1){
          v.match(/(\$\{(.*?)\})/g).forEach((elm) => {
            let trace_var = elm.replace('$','').replace('{','').replace('}','')
            let trace_data = this.queryEnvId(trace_var)
            if (trace_data !== null){
              if (trace_data.getAttribute('expression') !== null) {
                this.getRootVar(trace_data.getAttribute('expression'), data_pool)
              }else{ 
                if (trace_data.getAttribute('mode') === null) {
                  data_pool.push(trace_var)
                }
              }
            }else{
              data_pool.push(trace_var)
            }
          })
        }else{
          let data = this.queryEnvId(v)
          if (data !== null){
            if (data.getAttribute('expression') !== null) {
              this.getRootVar(data.getAttribute('expression'), data_pool)
            }else{ 
              if (data.getAttribute('mode') === null) {
                data_pool.push(v)
              }
            }
          }else{
            data_pool.push(v)
          }
        }
      })
    },

    calExpressDepend(expression, extVar, node){
      expression = window.atob(expression)
      let vars = expression.match(/([a-zA-Z$][\w.${}]+)/g)
      vars.forEach((v) => {
        if(v.indexOf("$") > -1){
          v.match(/(\$\{(.*?)\})/g).forEach((elm) => {
            let trace_var = elm.replace('$','').replace('{','').replace('}','')
            let trace_data = this.queryEnvId(trace_var)
            if (trace_data !== null){
              if (trace_data.getAttribute('expression') !== null) {
                expression = expression.replace(v, this.calExpressDepend(trace_data.getAttribute('expression'), extVar, node))
              }else{
                expression = expression.replace(v, window.atob(trace_data.getAttribute('value')))
              }
            }else{
              expression = expression.replace(v,extVar[v])
            }
          })
        }else{
          let data = this.queryEnvId(v)
          if (data !== null){
            if (data.getAttribute('expression') !== null) {
              expression = expression.replace(v, this.calExpressDepend(data.getAttribute('expression'), extVar, node))
            }else{
              expression = expression.replace(v, window.atob(data.getAttribute('value')))
            }
          }else{
            expression = expression.replace(v,extVar[v])
          }
        }
      })
      return math.evaluate(expression)
    },

    calExpressDependVersion2(expression, env, pool){
      expression = window.atob(expression)
      let vars = expression.match(/([a-zA-Z$][\w.${}]+)/g)
      vars.forEach((v) => {
        Object.keys(pool[d3.select(env).attr('id')]).forEach((key) => {
          if(v.indexOf(key) > -1){
            expression = expression.replace(v, pool[d3.select(env).attr('id')][key].slice(-1)[0][v.split(key).slice(1).join('.').slice(1)])
          }
        })
      })
      return math.evaluate(expression)
    },

    getPathElement(path, node){
      let tmp = node
      for(let i=0; i<path.split('.').length; i++){
        tmp = tmp.select('#'+path.split('.')[i])
      }
      return tmp
    },

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
    },

    getChartConfig(names, data, xaxis){
      return {
        title: {
            text: 'chart'
        },
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            data: names
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        toolbox: {
            feature: {
                saveAsImage: {}
            }
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: xaxis
        },
        yAxis: {
            type: 'value',
        },
        series: data
      }
    },

    sliceYAxisQueueHandle(data, slice_num){
      if(data.length < slice_num){
        return new Array(slice_num-data.length).fill(0).concat(data)
      }else{
        return data.slice(data.length - slice_num, data.length)
      }
    },

    sliceXAxisQueueHandle(refresh_interval, slice_num){
      let tmp = []
      let cur_time = Date.parse(new Date())
      for(let i=0;i<slice_num;i++){
        tmp.push(this.getTimeHour(cur_time - (slice_num-i)*refresh_interval))
      }
      return tmp
    },

    historyOperatePush(pool, operate_type, ins){
      if(operate_type === 'create'){
        pool.push({'type': operate_type, 'ins': ins})
      }else if(operate_type === 'update'){
        if(!ins.select('path').empty()){
          pool.push({'type': operate_type, 'ins': ins, 'origin_value': ins.select('.children').attr("d")})
        }else if(!ins.select('polygon').empty()){
          pool.push({'type': operate_type, 'ins': ins, 'origin_value': ins.select('.children').attr("points")})
        }else if(!ins.select('text').empty()){
          pool.push({'type': operate_type, 'ins': ins, 'origin_value': ins.select('.children').text()})
        }
      }else if(operate_type === 'move'){
        pool.push({'type': operate_type, 'ins': ins['ins'], 'origin_value': ins['origin_value']})
      }
    },

    historyOperatePop(pool){
      if(pool.length > 0){
        let tmp = pool.pop()
        if(tmp['type'] === 'create'){
          tmp['ins'].remove()
        }else if(tmp['type'] === 'update'){
          if(!tmp['ins'].select('path').empty()){
            tmp['ins'].select('.children').attr("d", tmp['origin_value'])
          }else if(!tmp['ins'].select('polygon').empty()){
            tmp['ins'].select('.children').attr("points", tmp['origin_value'])
          }else if(!tmp['ins'].select('text').empty()){
            tmp['ins'].select('.children').text(tmp['origin_value'])
          }
        }else if(tmp['type'] === 'move'){
          tmp['ins'].attr("transform", `matrix(1 0 0 1 ${tmp['origin_value'].x} ${tmp['origin_value'].y})`)
        }
      }
    },
    //****************************create custom data element************************//
    createStringVar(node){
      let custom_elm = node.append('input')
      custom_elm.attr("type", "text")
        .attr("value", "0")
        .style("border-style", "solid")
        .style("width", "40px")
      node.attr("value", window.btoa("0"))
      custom_elm.on("change", function(d) {
        node.attr("value", window.btoa(d3.select(this).property("value")))
        node.select('input').attr('value', d3.select(this).property("value"))
      })
    },

    createSelectVar(node, range){
      let custom_elm = node.append('select')
      custom_elm.style("border-style", "solid")
        .style("width", "40px")
        .selectAll('myOptions') 
          .data(range)
        .enter()
          .append('option')
        .text(function (d) { return d }) // text showed in the menu
        .attr("value", function (d) { return d })
      custom_elm.on("change", function(d) {
        d3.select(this.parentNode).attr("value", window.btoa(d3.select(this).property("value")))
      })
      node.attr("range", window.btoa(range.join(',')))
      .attr("value", window.btoa(range[0])) 
    },

    bindEvent(node){
      if(!node.select('select').empty()){
        node.select('select').on("change", function(d) {
          d3.select(this.parentNode).attr("value", window.btoa(d3.select(this).property("value")))
        })
      }else if(!node.select('input').empty()){
        node.select('input').on("change", function(d) {
          node.attr("value", window.btoa(d3.select(this).property("value")))
          node.select('input').attr('value', d3.select(this).property("value"))
        })
      }else{
        
      }
    },

    clearGNode(){
      d3.select("#new").selectAll("g").each(function(d, i) {
        if(d3.selectAll(this.childNodes).empty()){
          d3.select(this).remove()
        }
      })
    },

    //****************************svg node operate************************//
    getNodeParent(node){
      return node.select(function() { return this.parentNode })
    },
    getNodeChildren(node){
      return node.selectAll(function() { return this.childNodes })
    },
    getModularPath(modular){
      let res = []
      res.push(modular.attr('id'))
      let parent = modular
      for(let i=0; i < 20; i++){
        let tmp = this.getNodeParent(parent)
        if(tmp.attr('id').indexOf('operate_element') === -1 && tmp.attr('id') !== 'new'){
          res.push(tmp.attr('id'))
          parent = tmp
        }else{
          break
        }
      }
      return res.reverse().join('.')
    },
    pushModularDataToHistoryPool(env, modular, pool, data_slice){
      let path = this.getModularPath(modular)
      if(Object.keys(pool[env.attr('id')]).indexOf(path) > -1){
        pool[env.attr('id')][path].push(data_slice)
      }else{
        pool[env.attr('id')][path] = []
        pool[env.attr('id')][path].push(data_slice)
      }
    },
    getNodeChildNotCustomModular(node){
      return node.selectAll("g").filter(function() {
        return d3.select(this).attr("id") !== null && d3.select(this).selectAll('g').filter(function() {return d3.select(this).attr("id") !== null && d3.select(this).selectAll('.children').filter(function() {return window.atob(d3.select(this).attr("mode")) === 'api_param'}).size() > 0}).size() === 0 
                                                  && d3.select(this).selectAll('.children').filter(function() {return window.atob(d3.select(this).attr("mode")) === 'api_param'}).size() > 0
      })
    },
    getNodeChildCustomModular(node){
      return node.selectAll("g").filter(function() {
        return d3.select(this).attr("id") !== null && d3.select(this).attr("id").indexOf('operate_element') === -1 && d3.select(this).selectAll('.children').filter(function() {return window.atob(d3.select(this).attr("mode")) !== null}).size() > 0 
                                                  && d3.select(this).selectAll('.children').filter(function() {return window.atob(d3.select(this).attr("mode")) === 'api_param'}).size() === 0 
      })
    },
    getModularCommonVarAndKeys(modular, env){
      let ids = []
      let coms = []

      modular.selectAll('path').each(function(d, i) {
        if(d3.select(this).attr('dom_type') === 'data'){
          ids.push(d3.select(this).attr('id'))
        }
      })

      modular.selectAll('.children').each(function(d, i) {
        if(d3.select(this).attr('mode') !== null){
          if(window.atob(d3.select(this).attr('mode')) === 'api_param'){
            coms.push({'id':d3.select(this).attr('id'),'value':window.atob(d3.select(this).attr('value'))})
          }
        }
      })

      env.selectAll('.children').each(function(d, i) {
        if(d3.select(this).attr('expression') !== null){
          let expression = window.atob(d3.select(this).attr('expression'))
          let vars = expression.match(/([a-zA-Z$][\w.${}]+)/g)
          vars.forEach((v) => {
            if(v.indexOf(modular.attr('id')) > -1){
              ids.push(v.split(modular.attr('id')).slice(1).join('.').slice(1))
            }          
          })
        }
      })

      let parent = modular
      for(let i=0; i < 20; i++){
        let tmp = this.getNodeParent(parent)
        if(tmp.attr('id') !== 'new'){
          this.getNodeChildren(tmp).each(function(d, i) {
            if(d3.select(this).attr('id') === null){  
              if(window.atob(d3.select(this).select('.children').attr('mode')) === 'api_param'){
                coms.push({'id':d3.select(this).select('.children').attr('id'),'value':window.atob(d3.select(this).select('.children').attr('value'))})
              }
            }
          })
          parent = tmp
        }else{
          break
        }
      }
      return {'coms':coms, 'ids':ids}
    }
  }
