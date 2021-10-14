<template lang="pug">
  v-card(class="d-flex justify-center mb-8")
    v-card(class="pa-2" color="yellow darken-3" dark)
      v-sheet(width="85")
        v-list(dense class="grow" color="yellow darken-3")
          v-list-item
            v-tooltip(bottom)
              template(v-slot:activator="{ on,attrs }")
                v-icon(class="ml-4", v-bind="attrs", v-on="on", @click="backHandle") mdi-keyboard-backspace
              span BACK
          template(v-if='is_viewer === false')
            v-list-item
              p V/D
              v-switch(v-model="edit_mode" dense)
          template(v-if="edit_mode === true")
            v-list-item
              v-tooltip(bottom)
                template(v-slot:activator="{ on,attrs }")
                  v-icon(color="grey darken-1", class="ml-4", v-bind="attrs", v-on="on", @click="newItem") mdi-file
                span NEW
            v-list-item
              v-tooltip(bottom)
                template(v-slot:activator="{ on,attrs }")
                  v-icon(color="light-green darken-1", class="ml-4", v-bind="attrs", v-on="on", @click="save") mdi-content-save
                span SAVE
            //- v-list-item
            //-   v-tooltip(bottom)
            //-     template(v-slot:activator="{ on,attrs }")
            //-       v-icon(color="light-blue lighten-1", class="ml-4", v-bind="attrs", v-on="on", @click="log") mdi-file-document-box
            //-     span LOG
            v-list-item
              v-tooltip(bottom)
                template(v-slot:activator="{ on,attrs }")
                  v-icon(color="yellow darken-1", class="ml-4", v-bind="attrs", v-on="on", @click="createMark") mdi-plus-box
                span INSERT_MARK
            //- v-list-item
            //-   v-tooltip(bottom)
            //-     template(v-slot:activator="{ on,attrs }")
            //-       v-icon(color="green darken-1", class="ml-4", v-bind="attrs", v-on="on", @click="createEchart") mdi-trending-up
            //-     span INSERT_ECHART
            //- v-list-item
            //-   v-tooltip(bottom)
            //-     template(v-slot:activator="{ on,attrs }")
            //-       v-icon(color="green darken-1", class="ml-4", v-bind="attrs", v-on="on", @click="createTestEchart") mdi-trending-up
            //-     span INSERT_TEST_ECHART
            //- v-list-item
            //-   v-tooltip(bottom)
            //-     template(v-slot:activator="{ on,attrs }")
            //-       v-icon(color="green darken-1", class="ml-4", v-bind="attrs", v-on="on", @click="createTestButton") mdi-wechat
            //-     span INSERT_BUTTON
            template(v-if="is_viewer === false")
              v-list-item
                v-tooltip(bottom)
                  template(v-slot:activator="{ on,attrs }")
                    v-icon(color="cyan lighten-1", class="ml-4", v-bind="attrs", v-on="on", @click="importSvg") mdi-file-import
                  span IMPORT
                v-file-input(id="fileInput" v-model="svgIns" @change="fileInsertSvg" style="display:none" multiple)
            v-list-item
              v-tooltip(bottom)
                template(v-slot:activator="{ on,attrs }")
                  v-icon(color="red darken-1", class="ml-4", v-bind="attrs", v-on="on", @click="dialogHotKey = true") mdi-chili-mild
                span HOTKEY
    v-card(class="pa-2" v-show="edit_mode" color="yellow darken-3" dark)
      v-sheet(width="115")
        v-list(dense class="grow" color="yellow darken-3")
          v-list-item(v-for="(tool, j) in tools_category" :key="j")
            v-list-group
              template(v-slot:activator="")
                v-list-item-title {{ tool.title }}
              v-list-item-group(color="success")
                v-list-item(v-for="(item, i) in tool.symbols" dense :key="item.id" @click="selectedItem(item)")
                  v-list-item-title(v-text="item.symbol")
                  //- template(v-if='tool.title !== "BASIC" && is_viewer === false')
                  v-list-item-icon
                    v-icon(@click.stop="editItem(item)") mdi-pencil
    v-card(class="pa-2")
      v-sheet(color="grey lighten-4" :height="canvas_height" :width="canvas_width"  @dblclick="done")
        div(id="painting")
          svg(id="viz" :height="canvas_height" :width="canvas_width" class="container-border")
    v-card(class="pa-2" v-show="edit_mode" color="yellow darken-3" dark)
      v-sheet(width="300" color="yellow darken-3")
        template(v-if="select_mode !== ''")
          v-toolbar(color="yellow darken-3")
            v-toolbar-title {{ select_mode }}
          v-spacer(class="mt-3")
          template(v-if="elm !== ''")
            v-row
              template(v-if="lock === false")
                v-btn(@click="unlock") LOCK
              template(v-else)
                v-btn(@click="unlock") UNLOCK
            v-spacer(class="mt-3")
            template(v-if="elm.attr('class') === 'data'")
              v-row
                v-btn(@click="bind") BIND
              //- template(v-if="elm.attr('dom_type') === 'g' && is_viewer !== true")
              //-   v-text-field(id="id_text" v-model="fill_id" prepend-icon="mdi-content-copy" label="fill id" @click:prepend="copyToClipboard" @change="initCtrlElm")
          template(v-if="select_mode === 'path'")
            v-row(class="d-flex justify-center")
              v-col(class="pa-2")
                v-text-field(v-model="path_points" label="path points" dense outlined @keyup.enter="updatePath")
          template(v-else-if="select_mode === 'polygon'")
            v-row(class="d-flex justify-center")
              v-col(class="pa-2")
                v-text-field(v-model="polygon_points" label="polygon points" dense outlined @keyup.enter="updatePolygon")
          template(v-else-if="select_mode === 'text'")
            v-row(class="d-flex justify-center")
              v-col(class="pa-2")
                v-text-field(v-model="text" label="text" dense outlined @keyup.enter="updateText")
          template(v-else-if="select_mode === 'data'")
            v-row(class="d-flex justify-center")
          template(v-else-if="select_mode === 'viewer'")
            v-row(class="d-flex justify-center")
              v-col(class="pa-2")
          template(v-else-if="select_mode === 'chart'")
            v-row(class="d-flex justify-center")
              v-col(class="pa-2")
                v-text-field(v-model="echart_api_url" label="Api Url" outlined dense)
                v-btn(@click="updateEchartApiUrl") TEST
          template(v-if="select_mode !== 'data' && select_mode !== 'scene' && select_mode !== 'chart'")
            v-row
              v-color-picker(dark v-model="hexa" hide-inputs class="ma-2" @update:color="updateColor")
        v-dialog(v-model='dialogDataBind' max-width="1200px" dark)
          v-card
            v-tabs(background-color="yellow darken-3" left)
              template(v-if="is_viewer === false")
                v-tab Summary
                v-tab Data Source Bind
                v-spacer
                v-btn(class="mt-1" @click="applyData" dark) APPLY
                v-tab-item
                  v-container
                    v-card
                      div(id='editor')
                v-tab-item
                  v-container(fluid)
                    v-row
                      v-col(cols="12" md="4")
                        //- v-row
                        //-   v-text-field(v-model='matched_keywords' solo rounded flat clearable dense outlined label="Enter keywords")
                        //-   v-btn(@click="aiAutomaticMatch") MATCH
                        v-row
                          v-combobox(v-model="external_data_selected_source['name']" :items="external_data_selected_source_list" outlined dense @change="changeExternalData")
                    v-row
                      v-col
                        v-treeview(v-model="external_data_selected" open-on-click dense rounded selectable selection-type="independent" selected-color="green" return-object :items="external_data_selected_items")
                      v-divider(vertical)
                      v-col(class="pa-6" cols="6")
                        v-list(three-line)
                          template(v-for="item in external_data_selected")
                            template(v-if="item['value'].slice(0, 4) === 'http' ")
                              v-list-item(:key="item.id" target="_blank" :href="item.value")
                                v-list-item-avatar
                                  v-icon(class="blue" dark) mdi-clipboard-text
                                v-list-item-content
                                  v-list-item-title {{ item.name }}
                                  v-list-item-subtitle PENDING...
                                  v-list-item-subtitle PENDING...
                              v-divider
                            template(v-else-if="item['value'] !== ''")
                              v-list-item(:key="item.id" @click="showExternalDataInfo(item)")
                                v-list-item-avatar
                                  v-icon(class="red" dark) mdi-code-brackets
                                v-list-item-content
                                  v-list-item-title {{ item.name }}
                                  v-list-item-subtitle PENDING...
                                  v-list-item-subtitle PENDING...
                              v-divider
              template(v-else)
                v-tab Show
                v-tab-item
                  v-container(fluid)
                    template(v-for="(data_source, index) in external_data_show")
                      template(v-if="index !== 'summary'")
                        v-subheader {{ index }}
                        v-divider
                        v-list(three-line)
                          template(v-for="item in data_source")
                            template(v-if="item['value'].slice(0, 4) === 'http' ")
                              v-list-item(:key="item.id" target="_blank" :href="item.value")
                                v-list-item-avatar
                                  v-icon(class="blue" dark) mdi-clipboard-text
                                v-list-item-content
                                  v-list-item-title {{ item.name }}
                                  v-list-item-subtitle PENDING...
                                  v-list-item-subtitle PENDING...
                              v-divider
                            template(v-else-if="item['value'] !== ''")
                              v-list-item(:key="item.id" @click="showExternalDataInfo(item)")
                                v-list-item-avatar
                                  v-icon(class="red" dark) mdi-code-brackets
                                v-list-item-content
                                  v-list-item-title {{ item.name }}
                                  v-list-item-subtitle PENDING...
                                  v-list-item-subtitle PENDING...
                              v-divider
                        //- template(v-if="data_source[0]['value'].slice(0, 4) == 'http' ")
                        //-   v-list(three-line)
                        //-     template(v-for="(item, index) in data_source")
                        //-       v-list-item(:key="item.id" target="_blank" :href="item.value")
                        //-         v-list-item-avatar
                        //-           v-icon(class="blue" dark) mdi-clipboard-text
                        //-         v-list-item-content
                        //-           v-list-item-title {{ item.name }}
                        //-           v-list-item-subtitle PENDING...
                        //-           v-list-item-subtitle PENDING...
                        //-       v-divider
                        //- template(v-else)
                        //-   v-list(three-line)
                        //-     template(v-for="(item, index) in data_source")
                        //-       v-list-item(:key="item.id" @click="showExternalDataInfo(item)")
                        //-         v-list-item-avatar
                        //-           v-icon(class="red" dark) mdi-code-brackets
                        //-         v-list-item-content
                        //-           v-list-item-title {{ item.name }}
                        //-           v-list-item-subtitle PENDING...
                        //-           v-list-item-subtitle PENDING...
                        //-       v-divider
        v-dialog(v-model="dialogEditorjs" max-width="800px")
          v-card(color='grey lighten-3')
            v-container
              v-card
                div(id='show')
        v-dialog(v-model="dialogBack" max-width="650px")
          v-card(color="yellow darken-3" dark)
            v-card-title(class="headline") Symbol has changed, do you want to save this symbol?
            v-card-actions
              v-spacer
              v-btn(text @click="$emit('dialogClose')") CANCEL
              v-btn(text @click="back") YES
              v-spacer
        v-dialog(v-model='dialogHotKey',  max-width="250px")
          v-card(color="yellow darken-3" dark)
            v-card-title
              span(class="headline") Hot Key
            v-divider
            v-container
              p CTRL+C | copy element
              p CTRL+V | paste element
              P CTRL+D | delete element
              p CTRL+S | save instance
              p CTRL+Z | undo operation
              p CTRL+X | lock/unlock
              p CTRL+Q | insert mark
        v-snackbar(v-model="snackbar", :timeout="1500" color="yellow darken-3") {{ info_snackbar }}
          template(v-slot:action="{ attrs }")
            v-btn(text, v-bind="attrs", @click="snackbar = false") Close
</template>

<script>
import * as d3 from 'd3'
import axios from 'axios'
import * as echarts from 'echarts'
// import pako from 'pako'
// import * as math from 'mathjs'
import EditorJS from '@editorjs/editorjs'

export default {
  props: {
    svg_content: {
      type: String,
      default () {
        return ''
      }
    },
    flagUpdateOrAdd: {
      type: Boolean,
      default: false
    },
    tools_category: {
      type: Array,
      default: []
    },
    is_viewer:{
      type: Boolean,
      default: false
    },
    username:{
      type: String,
      default: 'visitor'
    },
  },
  data () {
    return {
      edit_mode:false,
      items: [],
      svgIns: [],
      snackbar: false,
      lock: false,
      run_flag: false,
      interval: '',
      dialogHotKey: false,
      dialogDataBind: false,
      dialogBack: false,
      dialogEditorjs: false,
      move_flag: false,
      error_flag: false,
      error_messages: '',
      is_success: false,
      info_color: 'info',
      info_snackbar: 'Element has been copied',
      selected: '',
      fill_range: '',
      fill_param: '',
      fill_id: '',
      hexa: '#000000',
      canvas_width: document.body.offsetWidth -580,
      canvas_height: document.body.offsetHeight - 40,
      scale_min: 0.1,
      scale_max: 2,
      margin: {
        top: 20,
        right: 40,
        bottom: 30,
        left: 40
      },
      svg: '',
      zoom: '',
      gx:[],
      gy:[],
      x:[],
      y:[],
      mouse_position:{'x':0, 'y':0},
      elm_position:{'x':0, 'y':0},
      elm: '',
      copy_elm: '',
      label: '',
      data: {},
      select_mode: 'scene',
      path_points: '',
      polygon_points: '',
      text: '',
      font_size: 20,
      transform: 'translate(0,0) scale(1)',
      matrix: 'matrix(1 0 0 1 0 0)',
      drag:'',
      viewer_drag:'',
      refresh_interval: 1000,
      history_data_pool:[],
      history_operate_pool:[],
      external_data_list:[],
      external_data_name: '',
      external_data_selected_source: '',
      external_data_selected_source_list: [],
      external_data_selected_items: [],
      external_data_selected:[],
      external_data_selected_tmp:[],
      external_data_show:[],
      node_data: {},
      editor_data: '',
      show_data: '',
      matched_keywords: '',
      layers_num: 1,
      layers_threshold: 0,
      pre_threshold: 0,
      echart_api_url:'',
    }
  },
  watch:{
    edit_mode(val){
      if(val === true){
        this.canvas_width = document.body.offsetWidth -580
      }else{
        this.canvas_width = document.body.offsetWidth -120
      }
      this.resetCoordinates()
    },
    transform(val){
      let that = this
      d3.selectAll(".layer_mask_text").each(function(d, i) {
        d3.select(this).style("font-size",  that.font_size / val.k + "px")
      })   
    },
  },
  mounted () {
    let that = this
    document.onkeydown = function(e) {
      let key = e.keyCode
      // window.event.preventDefault()
      that.error_flag = false
      that.error_messages = ''
      if (e.ctrlKey){
        if(key == 67){
          that.copy()
        }else if(key == 86){
          that.paste()
        }else if(key == 83){
          that.save()
        }else if(key == 90){
          that.$common.historyOperatePop(that.history_operate_pool)
        }else if (key== 68) { 
          that.delete()
        }else if(key == 81){
          that.createMark()
        }else if(key == 88){
          that.unlock()
        }
        if ([86].indexOf(key) > -1){

        }else{
          return false
        }
      }
    }
    if(this.is_viewer !== true){
      this.edit_mode = true
    }else{
      this.canvas_width = document.body.offsetWidth -120
    }
    this.$common.setBrowserTitle("new")
    this.svg = d3.select("#viz").style("font", "12px sans-serif").append("g").attr("id", "new")
    this.resetCoordinates()

    function dragstarted(event) {
      if (that.elm !== ''){
        that.done()
      }
      that.elm = d3.select(this)
      that.mouse_position = {'x': event.x, 'y': event.y}
      that.elm_position = {'x': d3.select(this).attr("transform").split(' ')[4], 'y': d3.select(this).attr("transform").split(' ')[5].replace(')', '')}
      that.lock = d3.select(this).attr('drag_event') === 'true' ? false : true
      if(that.run_flag === false){
        that.createCheckBox(d3.select(this), this.getBBox().x, this.getBBox().y, this.getBBox().width, this.getBBox().height)
      }
      
      if (that.is_viewer === true){
        that.bind()
      }else if(d3.select(this).attr("dom_type") === 'g'){
        that.select_mode = 'scene'
        that.fill_id = d3.select(this).attr('id')
      }else if(d3.select(this).attr("dom_type") !== 'g'){
        if (d3.select(this).select('.children').attr("dom_type") === 'polygon') {
          that.select_mode = 'polygon'
          that.hexa = that.$common.colorRGBtoHex(d3.select(this).select('.children').style("stroke"))
          that.polygon_points = d3.select(this).select('.children').attr("points")
        }else if(d3.select(this).select('.children').attr("dom_type") === 'text'){
          that.hexa = d3.select(this).select('.children').attr("fill")
          that.select_mode = 'text'
          that.text = d3.select(this).select('.children').text()
        }else if(d3.select(this).select('.children').attr("dom_type") === 'path'){
          that.hexa = that.$common.colorRGBtoHex(d3.select(this).select('.children').style("stroke"))
          that.select_mode = 'path'
          that.path_points = d3.select(this).select('.children').attr("d")
        }else if(d3.select(this).select('.children').attr("dom_type") === 'data'){
          that.select_mode = 'data'
        }else if(d3.select(this).select('.children').attr("dom_type") === 'chart'){
          that.select_mode = 'chart'
        }
      }
    }
    function dragged(event) {
      if(that.move_flag){
        d3.select(this).attr("transform", `matrix(1 0 0 1 ${that.elm_position.x - (that.mouse_position.x - event.x)} ${that.elm_position.y - (that.mouse_position.y - event.y)})`)
      }else if(Math.abs(that.mouse_position.x - event.x) >= 30 || Math.abs(that.mouse_position.y - event.y) >= 30){
        that.move_flag = true
      }
    }
    function dragended(event) {
      if(that.move_flag){
        that.move_flag = false
        that.$common.historyOperatePush(that.history_operate_pool, 'move', {'ins':d3.select(this), 'origin_value':that.elm_position})
      }
    }
    this.drag = d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended)
    this.viewer_drag = d3.drag().on("start", dragstarted)
  },
  methods: {
    resetCoordinates(){
      this.x = d3.scaleLinear()
        .domain([0, this.canvas_width])
        .range([0, this.canvas_width])

      this.y = d3.scaleLinear()
        .domain([0, this.canvas_height])
        .range([0, this.canvas_height])
      if(d3.select("#axis").empty()){
        d3.select("#viz").append("g").attr("id", "axis")
      }else{
        d3.select("#axis").selectAll('g').remove()
      }

      this.gx = d3.select("#axis").append("g").call(this.xAxis, this.x, {'x':0, 'y':0})
      this.gy = d3.select("#axis").append("g").call(this.yAxis, this.x, {'x':0, 'y':0})
      this.zoom = d3.zoom().scaleExtent([this.scale_min, this.scale_max]).on("zoom", this.zoomed)
      d3.select("#viz").call(this.zoom).on("dblclick.zoom", null)
    },
    zoomed(event) {
      const {transform} = event
      this.transform = transform
      d3.select("#axis").selectAll('text').call(g => g.attr("transform", transform))
      d3.select("#new").attr("transform", transform)
      this.zoomInOutEvent(this.transform.k)
      this.gx.call(this.xAxis, transform.rescaleX(this.x), transform)
      this.gy.call(this.yAxis, transform.rescaleY(this.y), transform)
    },
    zoomInOutEvent(cur_transform_k){
      let ids = []
      let that = this
      let cur_layer = parseInt(cur_transform_k / this.layers_threshold) + 1 
      let tmp = cur_layer > this.layers_num ? this.layers_num : cur_layer
      if (tmp > this.pre_threshold) {
        d3.selectAll(".symbol").each(function(d, i) {
          if(that.$common.getElmPath(d3.select(this)) < tmp){
            d3.selectAll(this.childNodes).each(function(d, i) {
              if ((d3.select(this).attr('class') == 'layer_mask_rect') || (d3.select(this).attr('class') == 'layer_mask_text')){
                ids.push(d3.select(this).attr("id"))
              }
            })
          }
        })
        ids.forEach((key) => {    
          d3.select("#"+key).remove()
        })
      }else if (tmp < this.pre_threshold) {
        d3.selectAll(".symbol").each(function(d, i) {
          if(that.$common.getElmPath(d3.select(this)) == tmp){
            that.createCheckBox(d3.select(this), this.getBBox().x, this.getBBox().y, this.getBBox().width, this.getBBox().height, true, d3.select(this).attr('name'))
          }
        })
      }
      this.pre_threshold = tmp
    },
    initLayerMask(cur_transform_k){
      let that = this
      let cur_layer = parseInt(cur_transform_k / this.layers_threshold) + 1 
      let tmp = cur_layer > this.layers_num ? this.layers_num : cur_layer
      d3.selectAll(".symbol").each(function(d, i) {
        let layer = that.$common.getElmPath(d3.select(this))
        if((layer >= tmp) && (layer < that.layers_num)){
          that.createCheckBox(d3.select(this), this.getBBox().x, this.getBBox().y, this.getBBox().width, this.getBBox().height, true, d3.select(this).attr('name'))
        }
      })
    },
    initSymbols(){
      let that = this
      let atoms = []
      for (let index = this.layers_num - 1;  1 <= index; index--) {
        d3.selectAll('.symbol').each(function(d, i) { 
          if (index === that.$common.getElmPath(d3.select(this))){
            atoms.push(d3.select(this).attr('id'))
          }
        })
      }
      if(atoms.length > 0){
        this.addSymbolSvg({'id': atoms.pop()}, "replace", atoms)
      }else{
        this.initEndProcess()
      }
    },
    initEndProcess(){
      setTimeout(() =>{
        this.initLayerMask(this.transform.k)
        this.dragElements()
        d3.select('.init_mask').remove()
        this.$store.set('progress', false)
      }, 400)
    },
    center(){
      let x = d3.select("#new").node().getBBox().x
      let y = d3.select("#new").node().getBBox().y
      let width = d3.select("#new").node().getBBox().width
      let height = d3.select("#new").node().getBBox().height
      let scale = 1 / (width / this.canvas_width  + 1)
      let transform_x = 0 - parseInt(((x * scale + width * scale ) - this.canvas_width + x * scale) / 2)
      let transform_y = 0 - parseInt(((y * scale + height * scale ) - this.canvas_height + y * scale) / 2)
      // return `translate(${transform_x},${transform_y}) scale(${scale})`
      return {'x': transform_x, 'y': transform_y, 'k': scale}
    },

    dragElements(){
      let that = this
      d3.selectAll(".children").each(function(d, i) {
        if(d3.select(this).attr('dom_type') === 'data'){
          // that.$common.bindEvent(d3.select(this))
          if(d3.select(this).attr('d') !== null){
            d3.select(this.parentNode).call(that.viewer_drag)
            // that.$common.bindPointEvent(d3.select(this.parentNode), d3.select(this.parentNode).attr('keywords'))
          }else{
            d3.select(this.parentNode.parentNode).call(that.viewer_drag)
          }
        }
        if(d3.select(this).attr('dom_type') === 'chart'){
          d3.select(this.parentNode.parentNode).call(that.viewer_drag)
        }
      })
      if (this.is_viewer === false ){
        d3.select("#new").each(function(d, i) {
          d3.selectAll(this.childNodes).each(function(d, i) {
            if (d3.select(this).attr('drag_event') === 'true'){
              d3.select(this).call(that.drag)
            }else{
              d3.select(this).call(that.viewer_drag)
            }
          })
        })
      }
    },
    xAxis(g, x, transform){
      g.attr("transform", `translate(${-transform.x},${-transform.y+this.margin.top})`)
      .call(d3.axisTop(x).ticks(null, "f"))
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick line")
        .attr("stroke-opacity", 0.1)
        .attr("transform", `translate(${transform.x},${transform.y})`)
        .attr("y1", this.canvas_height))
    },
    yAxis(g, y, transform){
      g.attr("transform", `translate(${-transform.x + this.margin.left - 10},${-transform.y})`)
      .call(d3.axisLeft(y).ticks(null, "f"))
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick line")
        .attr("stroke-opacity", 0.1)
        .attr("transform", `translate(${transform.x},${transform.y})`)
        .attr("x1", this.canvas_width))
    },
    newItem(){
      this.$common.setBrowserTitle("new")
      this.clear()
      this.$emit('newItem')
    },
    editItem(item){
      this.$common.setBrowserTitle(item.symbol)
      this.$emit('editItem',item)
    },
    updateItem(val){
      this.clear()
      d3.xml(val)
        .then(data => {
          let tmp = data.getElementsByTagName('g')[0]
          d3.select("#new").remove()
          d3.select('#viz').node().append(tmp)
          this.createInitMarkBox()
          this.transform = this.center()
          this.layers_num = this.$common.getLayersNum() + 1
          this.layers_threshold = (this.scale_max - this.scale_min) / this.layers_num
          this.pre_threshold = parseInt(this.transform.k / this.layers_threshold) + 1 
          d3.select("#viz").call(this.zoom.transform, d3.zoomIdentity.translate(this.transform.x, this.transform.y).scale(this.transform.k))
          this.svg = d3.select("#new")
        })
    },
    async updateSymbols(){
      await this.initSymbols()
    },
    selectedItem(item){
      this.done()
      if (item.symbol == 'path'){
        this.path_points = ''
        this.select_mode = 'path'
      }else if(item.symbol == 'polygon'){
        this.polygon_points = ''
        this.select_mode = 'polygon'
      }else if(item.symbol == 'text'){
        this.text = ''
        this.select_mode = 'text'
      }else if(item.symbol == 'data'){
        this.dialogDataBind = true
      }else{
        this.addSymbolSvg(item)
      }
    },
    async addSymbolSvg (item, operate_type="insert", recursion_list=[]) {
      await this.$http.get(this.$urls.babel_get, {
        params: {
            operate: 'get_symbol',
            symbol_id: item.id,
        },
        })
        .then(response => {
          if (operate_type === "insert") {
            this.insertSvg(response.data.content.content, 'symbol', item.id)
          }else{
            let tmp = d3.select('#' + item.id)
            let attr_id = tmp.attr('id')
            let attr_class = tmp.attr('class')
            let attr_transform = tmp.attr('transform')
            let node_parent = this.$common.getNodeParent(tmp)
            tmp.remove()

            let symbol_data = JSON.parse(response.data.content.node_data)
            Object.keys(symbol_data).forEach((key) => {
              this.node_data[key] = symbol_data[key]
            })

            d3.xml(response.data.content.content)
              .then(data => {
                let tmp = data.documentElement
                tmp.setAttribute("id", attr_id)
                tmp.setAttribute("class", attr_class)
                tmp.setAttribute("transform", attr_transform)
                tmp.setAttribute("name", response.data.content.category +'_'+ response.data.content.symbol_name)
                // console.log(response.data.content.category +'_'+ response.data.content.symbol_name)
                node_parent.node().append(tmp)
              })

            if (recursion_list.length != 0) {
              this.addSymbolSvg({'id': recursion_list.pop()}, "replace", recursion_list)
            }else{
              this.initEndProcess()
            }
          }
        })
    },
    createInitMarkBox(){
      d3.select('#viz').append('rect')
        .attr('x',0)
        .attr('y',0)
        .attr('width',this.canvas_width)
        .attr('height',this.canvas_height)
        .attr("class", "init_mask")
        .attr('fill', "#FFFFFF")
    },
    createCheckBox(elm,x,y,w,h,fill=false,text='') {
      let tmp = elm.append('rect')
                  .attr("id", "id"+this.$common.generateUUID())
                  .attr('x',x-5)
                  .attr('y',y-5)
                  .attr('width',w+10)
                  .attr('height',h+10)
      if (fill == false) {
        tmp.attr("class", "check_box")
          .attr('fill', 'none')
          .style('stroke', "#0000FF50")
          .style('stroke-width', 2)
      }else{
        tmp.attr("class", "layer_mask_rect")
          .attr('fill', "#E6E6FA")
          .style('stroke', "#0000FF50")
          .style('stroke-width', 4)
        elm.append('text')
          .attr("id", this.$common.generateUUID())
          .attr('x',x)
          .attr('y',y + h - this.font_size)
          .attr("fill", "#000000")
          .attr("font-weight", "bold")
          .attr("class", "layer_mask_text")
          .style("font-size", this.font_size / this.transform.k + "px")
          .text(text)
      }
    },
    createPath() {
      let tmp = this.svg.append('g').attr("drag_event", 'true').attr("transform", this.matrix).call(this.drag)
        .append('path')
          .attr("class", "children")
          .attr("dom_type", 'path')
          .attr("d", this.path_points) //'M50 150Q300 50 300 150T450 150'
          .style("fill", 'none')
          .style('stroke', this.hexa)
          .style('stroke-width', 5)
      this.$common.historyOperatePush(this.history_operate_pool, 'create', tmp)
    },
    createPolygon() { // 100,100 100,400 300,400 300,100
      let tmp = this.svg.append('g').attr("drag_event", 'true').attr("transform", this.matrix).call(this.drag)
        .append("polygon")
          .attr("class", "children")
          .attr("dom_type", 'polygon')
          .attr("points", this.polygon_points)
          .style("fill", "none")
          .style('stroke', this.hexa)
          .style('stroke-width', 5)
      this.$common.historyOperatePush(this.history_operate_pool, 'create', tmp)
    },
    createText() {
      let tmp = this.svg.append('g').attr("drag_event", 'true').attr("transform", this.matrix).call(this.drag)
        .append("text")
          .attr("class", "children")
          .attr("dom_type", 'text')
          .attr("fill", this.hexa)
          .attr("font-weight", "bold")
          .style("font-size", this.font_size + "px")
          .text(this.text)
      this.$common.historyOperatePush(this.history_operate_pool, 'create', tmp)
    },
    createMark(){
      this.done()
      let g = this.svg.append('g').attr("class", "data").attr("id", this.$common.generateUUID()).attr("drag_event", 'true').attr("transform", this.matrix).call(this.drag)
      g.html('<path class="children" dom_type="data" d="' + this.$common.getLandmarkSvgPath() +'" fill="#FF0000" stroke="#000000" stroke-width="1" ></path>')

      this.$common.historyOperatePush(this.history_operate_pool, 'create', g)
    },
    createEchart(){
      this.done()
      let uuid = this.$common.generateUUID()
      let g = this.svg.append('g').attr("drag_event", 'true').attr("transform", this.matrix).call(this.drag)

      g.append("foreignObject")
          .attr("width", 300)
          .attr("height", 200)
        .html('<div id='+uuid+' class="children" dom_type="chart" style="background:white;width: 300px;height:200px;" >')
      this.$common.historyOperatePush(this.history_operate_pool, 'create', g)
    },
    
    updateColor(){
      if (this.run_flag === true){
        d3.selectAll('.tip').call(g => g.style("fill", this.hexa))
      }
      if (this.elm !== ''){
        if(this.elm.attr("dom_type") === 'g'){
          return
        }else if(this.elm.select('.children').attr("dom_type") === 'text'){
          this.elm.select('.children').attr("fill", this.hexa)
        }else if(this.elm.select('.children').attr("dom_type") === 'data'){
          this.elm.select('span').attr("style", "color: "+this.hexa)
        }else{
          this.elm.select('.children').style("stroke", this.hexa)
        }
      }
    },
    updatePath(){
      if (this.elm !== ''){
        this.$common.historyOperatePush(this.history_operate_pool, 'update', this.elm)
        this.elm.select('.children').attr("d", this.path_points)
      }else{
        this.createPath()
      }
    },
    updatePolygon(){
      if (this.elm !== ''){
        this.$common.historyOperatePush(this.history_operate_pool, 'update', this.elm)
        this.elm.select('.children').attr("points", this.polygon_points)
      }else{
        this.createPolygon()
      }
    },
    updateText(){
      if (this.elm !== ''){
        this.$common.historyOperatePush(this.history_operate_pool, 'update', this.elm)
        this.elm.select('.children').text(this.text)
      }else{
        this.createText()
      }
    },
    updateData(){
      if(d3.select('#'+this.data_id).attr('bind_type') !== 'echarts'){
        let data = d3.select('#'+this.data_id).node().getElementsByTagName('span')[0]
        data.setAttribute("bind_value", this.data_value)
        data.setAttribute("bind_name", this.data_name)
        data.innerHTML = this.data_name+":"+this.data_value
      }
    },
    updateEchartApiUrl(){
      let that = this
      if (this.interval == ''){
        if (this.elm !== ''){
          if (this.echart_api_url !== '') {

            this.interval = setInterval(function() {
              axios.get(that.echart_api_url, {
                params: {
                    operate: 'get_test_data',
                },
                })
                .then(response => {
                  let series = []
                  let names = []
                  let tmp = []
                  Object.keys(response.data.content).forEach((key) => {
                    if (Object.keys(that.history_data_pool).indexOf(key) == -1) {
                      that.history_data_pool[key] = []
                    }
                    that.history_data_pool[key].push(response.data.content[key])
                    tmp = that.$common.sliceYAxisQueueHandle(that.history_data_pool[key], 30)
                    series.push({'name':key, 'type':'line', 'showSymbol':false, 'data':tmp})
                  })
                  Object.keys(that.history_data_pool).forEach((key) => {
                    names.push(key)
                  })
                  let ins = echarts.getInstanceByDom(that.elm.select('div').node())
                  if (ins == null){
                    echarts.init(that.elm.select('div').node()).setOption(that.$common.getChartConfig(names, series, that.$common.sliceXAxisQueueHandle(that.refresh_interval, 30)))
                  }else{
                    ins.setOption(that.$common.getChartConfig(names, series, that.$common.sliceXAxisQueueHandle(that.refresh_interval, 30)), true)
                  }
                })
              },this.refresh_interval)
          }
        }
      }else{
        clearInterval(this.interval)
        this.interval = ''
      }
    },
    updateNodeData(val){
      this.node_data = val
    },
    unlock(){
      if (this.elm !== ''){
        if (this.elm.attr('drag_event') === 'true'){
          this.lock = true
          this.elm.attr('drag_event', 'false')
          this.elm.call(this.viewer_drag)
        }else{
          this.lock = false
          this.elm.attr('drag_event', 'true')
          this.elm.call(this.drag)
        }
      }
    },
    delete() {
      if (this.elm !== ''){
        this.elm.remove()
        this.elm = ''
        this.select_mode = ''
      }
    },
    copy() {
      if (this.elm !== ''){
        this.copy_elm = this.elm
        this.copy_elm.select('.check_box').remove()
        this.info_snackbar = 'Element has been copied'
        this.snackbar = true
      }
    },
    copyToClipboard() {
      if (this.elm !== ''){
        document.getElementById('id_text').select()
        document.execCommand("Copy")
        this.info_snackbar = 'ID has been copied'
        this.snackbar = true
      }
    },
    async paste() {
      if (this.copy_elm !== ''){
        let tmp = this.copy_elm.clone([true])
        let position = {'x': tmp.attr("transform").split(' ')[4], 'y': tmp.attr("transform").split(' ')[5].replace(')', '')}
        await tmp.attr("transform", `matrix(1 0 0 1 ${parseInt(position.x) + Math.round(Math.random()*100)} ${parseInt(position.y) + Math.round(Math.random()*100)})`)
        this.$common.historyOperatePush(this.history_operate_pool, 'create', tmp)
        this.dragElements()
      }
    },
    done() {
      if (this.elm !== ''){
        this.elm.select('.check_box').remove()
      }
      this.elm = ''
      this.copy_elm = ''
      this.external_data_selected = []
      this.select_mode = 'scene'
    },
    clear(){
      this.done()
      this.select_mode='scene'
      this.elm=''
      this.transform='translate(0,0) scale(1)'
      d3.select("#new").selectAll("*").remove()
      d3.select("#viz").call(this.zoom.transform, d3.zoomIdentity)
    },
    async back(){
      this.save()
      this.dialogBack = false
    },
    async save(){
      this.done()
      this.$emit('saveToServer', d3.select("#new"), this.node_data)
      this.history_operate_pool = []
    },
    async log(){
      // console.log(this.external_data_selected)
      // console.log("https11"[])
      console.log(this.external_data_selected)
      console.log(d3.select("#new").node())
      // console.log(this.history_operate_pool)
    },
    importSvg(){
      document.getElementById('fileInput').click()
    },
    insertSvg(svg, type="svg" , instance_id=this.$common.generateUUID()+'operate_element'){
      let that = this
      d3.xml(svg)
      .then(data => {
        let tmp = type === 'svg' ? that.svg.append('g').node() : data.documentElement
        tmp.setAttribute("id", instance_id)
        tmp.setAttribute("class", type === "svg" ? "svg" : "symbol")
        tmp.setAttribute("xmlns", "http://www.w3.org/2000/svg")
        tmp.setAttribute("transform", that.matrix)
        tmp.setAttribute("dom_type", 'g')
        tmp.setAttribute("drag_event", 'true')
        if (type === 'svg'){
          tmp.append(data.documentElement)
        }else{
          d3.select('#new').node().append(tmp)
        }
        that.$common.historyOperatePush(that.history_operate_pool, 'create', d3.select('#'+instance_id))
        that.dragElements()
      })
    },
    fileInsertSvg(){
      if(this.svgIns.length > 0){
        const reader = new FileReader()
        reader.readAsDataURL(this.svgIns[0])
        reader.onload = ()=>{
          this.insertSvg(reader.result)
        }
        this.svgIns = []
      }
    },
    backHandle(){
      if (this.history_operate_pool.length > 0) {
        this.dialogBack = true
      }else{
        this.$emit('dialogClose')
      }
    },
    async bind(){
      this.external_data_selected = []
      this.external_data_show = []
      await this.requestExternalDataAll()
      this.refreshExternalDataSelected()
      this.dialogDataBind = true
      this.showSummaryInfo()
    },
    async aiAutomaticMatch(){
      await this.$http.get(this.$urls.algorithm_get, {
        params: {
          operate: 'match_keywords_to_info_source',
          keywords: this.matched_keywords
        },
        })
        .then(response => {
          response.data.content.forEach((key) => {         
            if(!this.node_data.hasOwnProperty(this.elm.attr("id"))){
              this.node_data[this.elm.attr("id")] = {}
            }
            this.node_data[this.elm.attr("id")][key['id']] = key['top_results']
          })
          this.elm.attr('keywords', this.matched_keywords)
          this.refreshExternalDataSelected()
        })
    },
    changeExternalData(){
      this.applyData()
      this.refreshExternalDataSelected()
    },
    refreshExternalDataSelected(){
      this.external_data_list.forEach((key) => {
        if(key['name'] === this.external_data_selected_source['name']){
          this.external_data_selected_source = {'id': key['id'], 'name':key['name']}
          this.external_data_selected_items = [key]
          setTimeout(() =>{
            if(this.node_data.hasOwnProperty(this.elm.attr("id"))){
              if(this.node_data[this.elm.attr("id")].hasOwnProperty(key['id'])){
                this.external_data_selected = this.node_data[this.elm.attr("id")][key['id']]             
              }
            }
            this.refreshExternalDataShow()
          }, 200)
        }
      })
    },
    refreshExternalDataShow(){
      if(this.node_data.hasOwnProperty(this.elm.attr("id"))){
        this.external_data_show = this.node_data[this.elm.attr("id")]
      }
    },
    applyData(){
      if(!this.node_data.hasOwnProperty(this.elm.attr("id"))){
        this.node_data[this.elm.attr("id")] = {}
      }
      this.editor_data.save().then((data) => {
        this.node_data[this.elm.attr("id")]['summary'] = data
      })
      if (this.external_data_selected !== []){
        this.node_data[this.elm.attr("id")][this.external_data_selected_source['id']] = this.external_data_selected
      }
    },
    showSummaryInfo(){
      setTimeout(() =>{
        if (this.editor_data === ''){
          if(this.node_data.hasOwnProperty(this.elm.attr("id"))){
            this.editor_data = new EditorJS(this.$common.getEditorJSConfig('editor',  this.node_data[this.elm.attr("id")].hasOwnProperty('summary') ? this.node_data[this.elm.attr("id")]['summary'] : {}, false))
          }else{
            this.editor_data = new EditorJS(this.$common.getEditorJSConfig('editor', {}, false))
          }
        }else{
          if(this.node_data.hasOwnProperty(this.elm.attr("id"))){
            this.editor_data.blocks.render(this.node_data[this.elm.attr("id")].hasOwnProperty('summary') ? this.node_data[this.elm.attr("id")]['summary'] : {})
          }else{
            this.editor_data.blocks.clear()
          }
        }
      }, 200)
    },
    showExternalDataInfo(item){
      this.dialogEditorjs = true
      this.$nextTick(function(){
        if (this.show_data === ''){
          this.show_data = new EditorJS(this.$common.getEditorJSConfig('show', {'time':(new Date()).valueOf(), 'blocks': item.value instanceof Object ? item.value : JSON.parse(item.value), 'version': '2.22.2'}, true))
        }else{
          this.show_data.blocks.render({'time':(new Date()).valueOf(), 'blocks': item.value instanceof Object ? item.value : JSON.parse(item.value), 'version': '2.22.2'})
        }
      })
    },
    async requestExternalDataAll(){
      await this.$http.get(this.$urls.babel_get, {
        params: {
          operate: 'get_datas_all',
        },
        })
        .then(response => {
          this.external_data_list = response.data.content
          this.external_data_list.forEach((key, index) => {
            this.external_data_selected_source_list.push(key['name'])
            if(index == 0){
              this.external_data_selected_source = {'id': key['id'], 'name':key['name']}
              this.external_data_selected_items = [key]
            }
          })
        })
    },
    createTestButton(){
      this.done()
      let g = this.svg.append('g').attr("drag_event", 'true').attr("transform", this.matrix).call(this.drag)

      g.append("foreignObject")
          .attr("width", 40)
          .attr("height", 20)
        .html('<div id="test_button" class="children" >')
      this.$common.historyOperatePush(this.history_operate_pool, 'create', g)
      this.createButtonVar(d3.select("#test_button"))
    },
    createButtonVar(node){
      let that = this
      let custom_elm = node.append('button')
      custom_elm.text("click")
                .style("border-style", "solid")
                .style("width", "40px")
      custom_elm.on("click", function(d) {
        let ins = echarts.getInstanceByDom(d3.select('#test_echart').node())
        ins.setOption(that.createTestThermodynamicDiagram())
      })
    },

    createTestEchart(){
      this.done()
      let g = this.svg.append('g').attr("drag_event", 'true').attr("transform", this.matrix).call(this.drag)

      g.append("foreignObject")
          .attr("width", 800)
          .attr("height", 1200)
        .html('<div id="test_echart" class="children" dom_type="chart" style="background:white;width: 800px;height:1200px;" >')
      echarts.init(d3.select('#test_echart').node()).setOption(this.createTestThermodynamicDiagram())
      this.$common.historyOperatePush(this.history_operate_pool, 'create', g)
    },
    createTestThermodynamicDiagram(){
      function getVirtulData(year) {
        year = year || '2017';
        var date = +echarts.number.parseDate(year + '-01-01');
        var end = +echarts.number.parseDate(+year + 1 + '-01-01');
        var dayTime = 3600 * 24 * 1000;
        var data = [];
        for (var time = date; time < end; time += dayTime) {
          data.push([
            echarts.format.formatTime('yyyy-MM-dd', time),
            Math.floor(Math.random() * 1000)
          ]);
        }
        return data;
      }

      var option = {
        tooltip: {
          position: 'top',
          formatter: function (p) {
            var format = echarts.format.formatTime('yyyy-MM-dd', p.data[0]);
            return format + ': ' + p.data[1];
          }
        },
        visualMap: {
          min: 0,
          max: 1000,
          calculable: true,
          orient: 'vertical',
          left: '670',
          top: 'center'
        },
        calendar: [
          {
            orient: 'vertical',
            range: '2015'
          },
          {
            left: 300,
            orient: 'vertical',
            range: '2016'
          },
          {
            left: 520,
            cellSize: [20, 'auto'],
            bottom: 10,
            orient: 'vertical',
            range: '2017',
            dayLabel: {
              margin: 5
            }
          }
        ],
        series: [
          {
            type: 'heatmap',
            coordinateSystem: 'calendar',
            calendarIndex: 0,
            data: getVirtulData('2015')
          },
          {
            type: 'heatmap',
            coordinateSystem: 'calendar',
            calendarIndex: 1,
            data: getVirtulData('2016')
          },
          {
            type: 'heatmap',
            coordinateSystem: 'calendar',
            calendarIndex: 2,
            data: getVirtulData('2017')
          }
        ]
      }

      return option
    }
  },
}
</script>


