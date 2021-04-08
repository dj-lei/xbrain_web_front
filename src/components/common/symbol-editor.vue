<template lang="pug">
  v-card(class="d-flex justify-center mb-8")
    v-card(class="pa-2" color="yellow darken-3" dark)
      v-sheet(width="85")
        v-list(dense class="grow" color="yellow darken-3")
          v-list-item
            v-tooltip(bottom)
              template(v-slot:activator="{ on,attrs }")
                v-icon(class="ml-4", v-bind="attrs", v-on="on", @click="dialogBack = true") mdi-keyboard-backspace
              span BACK
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
            v-list-item
              v-tooltip(bottom)
                template(v-slot:activator="{ on,attrs }")
                  v-icon(color="light-blue lighten-1", class="ml-4", v-bind="attrs", v-on="on", @click="log") mdi-file-document-box
                span LOG
            v-list-item
              v-tooltip(bottom)
                template(v-slot:activator="{ on,attrs }")
                  v-icon(color="brown darken-1", class="ml-4", v-bind="attrs", v-on="on", @click="dialogConfig = true") mdi-memory
                span CONFIG
            v-list-item
              v-tooltip(bottom)
                template(v-slot:activator="{ on,attrs }")
                  v-icon(color="red darken-1", class="ml-4", v-bind="attrs", v-on="on", @click="dialogHotKey = true") mdi-chili-mild
                span HOTKEY
            template(v-if="is_viewer === false")
              v-list-item
                v-tooltip(bottom)
                  template(v-slot:activator="{ on,attrs }")
                    v-icon(color="cyan lighten-1", class="ml-4", v-bind="attrs", v-on="on", @click="importSvg") mdi-file-import
                  span IMPORT
                v-file-input(id="fileInput" v-model="svgIns" @change="fileInsertSvg" style="display:none" multiple)
          template(v-if='is_viewer === true')
            template(v-if='run_flag === false')
              v-list-item
                v-tooltip(bottom)
                  template(v-slot:activator="{ on,attrs }")
                    v-icon(color="success", class="ml-4", v-bind="attrs", v-on="on", @click="runOrStop") mdi-play
                  span PLAY
            template(v-else)
              v-list-item
                v-tooltip(bottom)
                  template(v-slot:activator="{ on,attrs }")
                    v-icon(color="error", class="ml-4", v-bind="attrs", v-on="on", @click="runOrStop") mdi-play-pause
                  span PAUSE
    v-card(class="pa-2" v-show="edit_mode" color="yellow darken-3" dark)
      v-sheet(width="115")
        v-list(dense class="grow" color="yellow darken-3")
          v-list-item(v-for="(tool, j) in tools_category" :key="j")
            v-list-group
              template(v-slot:activator="")
                v-list-item-title {{ tool.title }}
              v-list-item-group(color="success")
                v-list-item(v-for="(item, i) in tool.symbols" :disabled='item.symbol === "data" && is_viewer === true' dense :key="item.id" @click="selectedItem(item)")
                  v-list-item-title(v-text="item.symbol")
                  template(v-if='tool.title !== "BASIC" && is_viewer === false')
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
            template(v-if="lock === false")
              v-btn(@click="unlock") LOCK
            template(v-else)
              v-btn(@click="unlock") UNLOCK
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
            v-row(class="d-flex justify-center" v-for="key in Object.keys(data)" :key="key.id")
              v-col(class="pa-2")
                template(v-if="key === 'mode'")
                  v-combobox(v-model="selected" :items="['normal', 'interactive']" label="select mode" @change='initCtrlElm')
                template(v-else-if="key === 'id' && Object.keys(data).indexOf('mode') > -1")
                  v-text-field(id="id_text" v-model="fill_id" prepend-icon="mdi-content-copy" label="fill id" @click:prepend="copyToClipboard" @change="initCtrlElm")
                template(v-else-if="key === 'range' && Object.keys(data).indexOf('mode') > -1")
                  v-text-field(v-model="fill_range" label="fill range" @change="initCtrlElm")
                template(v-else-if="key === 'value' && Object.keys(data).indexOf('mode') > -1")
                  v-text-field(v-model="fill_param" label="fill param" :disabled="data['element'] === 'path'? false : true"  @change="initCtrlElm")
                template(v-else)
                  template(v-if="key === 'id'")
                    v-text-field(id="id_text" prepend-icon="mdi-content-copy" :value="data[key]" :label="key" @click:prepend="copyToClipboard" dense)
                  template(v-else)
                    v-text-field(:value="data[key]" :label="key" disabled dense)
            template(v-if="data['element'] === 'path' && Object.keys(data).indexOf('mode') > -1 ? true : false")
              v-row
                v-col(class="pa-2")
                  v-btn(dark, @click="expression") EXPRESSION
            v-dialog(v-model="dialogExpression", max-width="1000px")
              v-card(color="yellow darken-3" dark)
                v-container(fluid)
                  v-row(class="d-flex justify-center")
                    v-col(class="pa-2")
                      v-treeview(:active.sync="variable" open-on-click dense hoverable activatable :items="items")
                    v-divider(vertical)
                    v-col(class="pa-2")
                      v-textarea(v-model="express" @key.enter="autocomplete" label="Fill in the expression" auto-grow outlined :error="error_flag" :error-messages="error_messages")
                      v-btn(@click='checkExpression' depressed) CHECK
                        template(v-if="is_success === true")
                          v-icon(color="light-green accent-3" dark right) mdi-checkbox-marked-circle
          template(v-else-if="select_mode === 'viewer'")
            v-btn( dark @click='interactive' depressed) INTERACTIVE
            v-row(class="d-flex justify-center")
              v-col(class="pa-2")
                v-combobox(v-model="selected_environment" :items='coverToList()' label="Environment select" dense outlined @change="syncEnvironment")
                v-row(class="d-flex justify-center" v-for="key in comVar" :key="key.name")
                  v-col(class="pa-2")
                    v-text-field(v-model="key.value" :label="key.name" outlined dense @change="updateComVar")
          template(v-else-if="select_mode === 'chart'")
            v-row(class="d-flex justify-center")
              v-col(class="pa-2")
                v-text-field(v-model="chart_text" label="Bind ID" outlined dense @change="updateBindId")
          template(v-else-if="select_mode === 'scene' && is_viewer === true")
            v-card(color="yellow darken-3" dark)
              v-container(fluid)
                v-card-title External Link
                v-list(dense class="grow" color="yellow darken-3")
                  template(v-for="url in externalUrls")
                    v-list-item(target="_blank" :href="url.addr")
                      v-list-item-title(v-text="url.name")
                    v-divider
          template(v-if="select_mode !== 'data' && select_mode !== 'scene' && select_mode !== 'chart'")
            v-row
              v-color-picker(dark v-model="hexa" hide-inputs class="ma-2" @update:color="updateColor")
        v-dialog(v-model='dialogDataBind', dark, max-width="800px")
          v-card(color="yellow darken-3" dark)
            v-container
              v-row
                v-btn(@click="createCustomData") CUSTOM
                v-divider(class="mx-4" inset vertical)
                v-combobox(v-model="custom_mode" :items="['string', 'list', 'expression', 'chart']" outlined dense)
                v-spacer
              v-spacer(class="mt-3")
              v-divider
              v-card(color="yellow darken-3" dark)
                v-treeview(:active.sync="bind_data" open-on-click rounded activatable :items="items")
        v-dialog(v-model='dialogConfig',  max-width="800px")
          v-card(color="yellow darken-3" dark)
            v-container
              template(v-if="is_viewer === true")
                v-row
                  v-text-field(class="ma-1" v-model="url_get_ins_env" label="Api get instance environment" dense outlined)
                v-card
                  v-data-table(:headers="externalUrlHeaders" :items="externalUrls" class="elevation-1" hide-default-footer)
                    template(v-slot:top="")
                      v-toolbar(flat color="yellow darken-3" dark)
                        v-toolbar-title EXTERNAL LINK
                        v-divider(class="mx-4" inset vertical)
                        v-spacer
                        v-dialog(v-model="dialogExternalUrl" max-width="500px")
                          template(v-slot:activator="{ on, attrs }")
                            v-btn(class="mb-2" v-bind="attrs" v-on="on") New Item
                          v-card(color="yellow darken-3" dark)
                            v-card-text
                              v-container
                                v-row
                                  v-col(cols="12" sm="6" md="6")
                                    v-text-field(v-model="editedItem.name" label="external link name" outlined dense)
                                  v-col(cols="12" sm="6" md="6")
                                    v-text-field(v-model="editedItem.addr" label="external link addr" outlined dense)
                            v-card-actions
                              v-spacer
                              v-btn(text @click="dialogExternalUrl = false") CANCEL
                              v-btn(text @click="externalUrls.push(editedItem);editedItem = {};dialogExternalUrl = false") OK
                    template(v-slot:item.actions="{ item,index }")
                      v-icon(small @click="externalUrls.splice(externalUrls.indexOf(item), 1)") mdi-delete
              template(v-else)
                v-row
                  v-text-field(v-model="url_get_bind_data" label="Api get bind data" dense outlined)
              v-row
                v-spacer
                template(v-if="is_viewer === true")
                  v-btn(class="mt-3" @click="saveApiViewer") APPLY
                template(v-else)
                  v-btn(class="mt-3" @click="saveApiBindData") APPLY
                v-spacer
        v-dialog(v-model="dialogBack" max-width="410px")
          v-card(color="yellow darken-3" dark)
            v-card-title(class="headline") Do you want to save this symbol?
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
              p CTRL+S | save instance
              p CTRL+Z | undo operation
              p ----------Q | path function
              p ---------W | polygon function
              p ----------E | text function
              p ----------R | data function
              p ----------X | lock/unlock
        v-snackbar(v-model="snackbar", :timeout="1500" color="yellow darken-3") {{ info_snackbar }}
          template(v-slot:action="{ attrs }")
            v-btn(text, v-bind="attrs", @click="snackbar = false") Close
</template>

<script>
import * as d3 from 'd3'
import axios from 'axios'
import * as echarts from 'echarts'
import pako from 'pako'
import * as math from 'mathjs'

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
      comVar: [],
      url_get_bind_data: '',
      url_get_ins_env: '',
      url_post_config_read_data: '',
      url_post_interactive_data: '',
      selected_environment: '',
      environment_list: [],
      externalUrls: [],
      editedItem: {
        name: '',
        addr: '',
      },
      externalUrlHeaders: [
        { text: 'Link Name', value: 'name' },
        { text: 'Link Addr', value: 'addr' },
        { text: 'Actions', value: 'actions', sortable: false },
      ],
      // url_get_bind_data: process.env.NODE_ENV === 'development' ? 'http://localhost:8000/ru/babel/get?operate=get_test_data' : 'http://10.166.152.49/ru/babel/get?operate=get_test_data',
      snackbar: false,
      lock: false,
      run_flag: false,
      interval: '',
      dialogHotKey: false,
      dialogDataBind: false,
      dialogExpression: false,
      dialogConfig: false,
      dialogExternalUrl: false,
      dialogBack: false,
      express: '',
      move_flag: false,
      error_flag: false,
      error_messages: '',
      is_success: false,
      info_color: 'info',
      info_snackbar: 'Element has been copied',
      variable: [],
      selected: '',
      fill_range: '',
      fill_param: '',
      fill_id: '',
      hexa: '#000000',
      canvas_width: document.body.offsetWidth -580,
      canvas_height: document.body.offsetHeight - 40,
      margin: {
        top: 20,
        right: 40,
        bottom: 30,
        left: 40
      },
      that: '',
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
      bind_data: [],
      data: {},
      original_attributes: ['style','xmlns'],
      select_mode: 'scene',
      custom_mode: 'string',
      path_points: '',
      polygon_points: '',
      text: '',
      transform: 'translate(0,0) scale(1)',
      matrix: 'matrix(1 0 0 1 0 0)',
      drag:'',
      viewer_drag:'',
      chart_text:'',
      refresh_interval: 1000,
      query_data_pool:[],
      history_data_pool:{},
      history_operate_pool:[],
      env_pool:[],
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
    bind_data() {
      this.createData()
      this.dialogDataBind = false
    },
    variable(val) {
      this.express = this.express + val[0]
    },
    express(val) {
      this.info_color = 'info'
      this.is_success = false
    },
    run_flag(val){
      if(val === true){
        let that = this
        d3.selectAll('path').each(function(d, i) {
          if(d3.select(this).attr('dom_type') === 'data'){
            d3.select(this.parentNode).append('text').attr("class", "tip").attr('x',0).attr('y',-10).style('fill', that.hexa).text('pending')
          }
        })
      }else{
        // d3.selectAll('.tip').remove()
      }
    }
  },
  mounted () {
    let that = this
    document.onkeydown = function(e) {
      let key = e.keyCode
      // window.event.preventDefault()
      that.error_flag = false
      that.error_messages = ''
      if (e.path[0].getAttribute('type') === 'text') return
      if (e.path[0].toString().indexOf('TextArea') > -1) return
      if (e.ctrlKey){
        if(key == 67){
          that.copy()
        }else if(key == 86){
          that.paste()
        }else if(key == 83){
          that.save()
        }else if(key == 90){
          that.$common.historyOperatePop(that.history_operate_pool)
        }
      }
      if (key== 46 || key== 8) { //Del or Backspace
        that.delete()
      }else if(key == 81){
        that.path_points = ''
        that.select_mode = 'path'
      }else if(key == 87){
        that.polygon_points = ''
        that.select_mode = 'polygon'
      }else if(key == 69){
        that.text = ''
        that.select_mode = 'text'
      }else if(key == 82){
        that.dialogDataBind = true
      }else if(key == 88){
        that.unlock()
      }else if(key == 123){
        let vConsole = new VConsole()
      }
      return false
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
      that.createCheckBox(d3.select(this), this.getBBox().x, this.getBBox().y, this.getBBox().width, this.getBBox().height)

      if (that.is_viewer === true && d3.select(this).attr("dom_type") === 'g'){
        that.select_mode = 'viewer'
        that.selected_environment = d3.select(this.parentNode).attr("environment_name")
        that.comVar = JSON.parse(d3.select(this.parentNode).attr("params"))
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
          let data = {}
          that.data = {}
          if (d3.select(this).node().getElementsByTagName('path').length > 0){
            data = d3.select(this).node().getElementsByTagName('path')[0]
            that.data['element'] = 'path'
          }else{
            data = d3.select(this).node().getElementsByTagName('div')[0]
            that.data['element'] = 'div'
          }
          for(let i=0;i < data.attributes.length;i++){
            if(['class', 'dom_type', 'd', 'fill', 'stroke', 'stroke-width'].indexOf(data.attributes[i].name)>-1){
              continue
            }
            if(that.original_attributes.toString().indexOf(data.attributes[i].name) == -1){
              if('id' == data.attributes[i].name){
                that.fill_id = data.getAttribute(data.attributes[i].name)
              }else if('range' == data.attributes[i].name){
                that.fill_range = window.atob(data.getAttribute(data.attributes[i].name))
              }else if('value' == data.attributes[i].name){
                that.fill_param = window.atob(data.getAttribute(data.attributes[i].name))
              }else if('mode' == data.attributes[i].name){
                that.selected = window.atob(data.getAttribute(data.attributes[i].name))
              }else if('expression' == data.attributes[i].name){
                that.express = window.atob(data.getAttribute(data.attributes[i].name))
              }
              that.data[data.attributes[i].name] = 'id' !== data.attributes[i].name ? window.atob(data.getAttribute(data.attributes[i].name)) : data.getAttribute(data.attributes[i].name)
            }
          }
          that.select_mode = 'data'
        }else if(d3.select(this).select('.children').attr("dom_type") === 'chart'){
          that.select_mode = 'chart'
          that.chart_text = window.atob(d3.select(this).select('.children').attr('bind_id'))
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
      this.zoom = d3.zoom().scaleExtent([0.4, 8]).on("zoom", this.zoomed)
      d3.select("#viz").call(this.zoom).on("dblclick.zoom", null)
    },
    zoomed(event) {
      const {transform} = event
      this.transform = transform

      d3.select("#axis").selectAll('text').call(g => g.attr("transform", transform))
      d3.select("#new").attr("transform", transform)

      this.gx.call(this.xAxis, transform.rescaleX(this.x), transform)
      this.gy.call(this.yAxis, transform.rescaleY(this.y), transform)
    },
    dragElements(){
      let that = this
      d3.select("#new").each(function(d, i) {
        d3.selectAll(this.childNodes).each(function(d, i) {
          if(d3.select(this).attr('class') === 'environment'){
            d3.selectAll(this.childNodes).each(function(d, i) {
              if (d3.select(this).attr('drag_event') === 'true'){
                d3.select(this).call(that.drag)
              }else{
                d3.select(this).call(that.viewer_drag)
              }
            })
          }else{
            if (d3.select(this).attr('drag_event') === 'true'){
              d3.select(this).call(that.drag)
            }else{
              d3.select(this).call(that.viewer_drag)
            }
          }
        })
      })
      d3.selectAll(".children").each(function(d, i) {
        if(d3.select(this).attr('dom_type') === 'data'){
          that.$common.bindEvent(d3.select(this))
          if(that.is_viewer === true){
            d3.select(this.parentNode).call(that.viewer_drag)
          }
        }
        if(d3.select(this).attr('dom_type') === 'chart'){
          if(that.is_viewer === true){
            d3.select(this.parentNode.parentNode).call(that.viewer_drag)
          }
        }
      })
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
          this.svg = d3.select("#new")
          this.dragElements()
        })
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
    async queryBackendData(){
      await axios.get(this.url_get_bind_data)
        .then(response => {
          this.items = [JSON.parse(pako.inflate(window.atob(response.data.content[0]), { to: 'string' }))]
          // this.items = response.data.content
        })
    },
    async queryInsEnv(){
      await axios.get(this.url_get_ins_env)
        .then(response => {
          this.environment_list = response.data.content
        })
    },
    async addSymbolSvg (item) {
      await this.$http.get(this.$urls.babel_get, {
        params: {
            operate: 'get_symbol',
            symbol_id: item.id,
        },
        })
        .then(response => {
          this.insertSvg(response.data.content.content)
        })
    },
    createCheckBox(elm,x,y,w,h) {
      elm.append('rect')
        .attr("class", "check_box")
        .attr('x',x)
        .attr('y',y)
        .attr('width',w)
        .attr('height',h)
        .attr('fill','none')
        .style('stroke', "#0000FF50")
        .style('stroke-width', 2)
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
          // .attr("font-weight", "bold")
          .text(this.text)
      this.$common.historyOperatePush(this.history_operate_pool, 'create', tmp)
    },
    createData(){
      this.data = this.$common.jsonSearchId(this.items, this.bind_data)
      // let uuid = this.$common.generateUUID()
      let content = ''
      Object.keys(this.data).forEach((key) => {
        if (key == 'id') {
          content += ' '+key+'='+this.data[key]
        }else{
          content += ' '+key+'='+window.btoa(this.data[key])
        }
      })
      let g = this.svg.append('g').attr("drag_event", 'true').attr("transform", this.matrix).call(this.drag)
      g.html('<path class="children" dom_type="data" d="M 0,0 m-10,0 a10,10 0 1,0 20,0 a10,10 0 1,0 -20,0" fill="#7FFF0050" stroke="#00000050" stroke-width="1" '+content+'></path>')
      this.$common.historyOperatePush(this.history_operate_pool, 'create', g)
      // g.attr("pointer-events", "all")
        // .on("mouseenter", (event, d) => {
        //   g.append('text').attr("class", "tip").attr('x',0).attr('y',-20).style('fill', "#000000").text(g.select('path').attr('name'))
        // })
        // .on("mouseleave", (event, d) => {
        //   g.selectAll('.tip').remove()
        // })
    },
    createCustomData(){
      let uuid = this.$common.generateUUID()
      let content = ' id='+uuid+' value='+window.btoa('0')+' mode='+window.btoa('normal')
      let g = this.svg.append('g').attr("drag_event", 'true').attr("transform", this.matrix).call(this.drag)

      if (this.custom_mode === 'expression'){
        g.html('<path class="children" dom_type="data" d="M 0,0 m-10,0 a10,10 0 1,0 20,0 a10,10 0 1,0 -20,0" fill="#7FFF0050" stroke="#00000050" stroke-width="1" '+content+'></path>')
        this.$common.historyOperatePush(this.history_operate_pool, 'create', g)
        return
      }

      g.append("foreignObject")
          .attr("width", 40)
          .attr("height", 20)
        .html('<div id='+uuid+' class="children" dom_type="data"'+content+'>')
      this.$common.historyOperatePush(this.history_operate_pool, 'create', g)

      if(this.custom_mode === 'string'){
        this.$common.createStringVar(d3.select("#"+uuid))
      }else if (this.custom_mode === 'list'){
        this.$common.createSelectVar(d3.select("#"+uuid), ["init1","init2","init3"])
      }else if (this.custom_mode === 'chart'){
        d3.select("#"+uuid).select(function() { return this.parentNode }).attr("width", 300).attr("height", 200)
        d3.select("#"+uuid).attr("dom_type","chart").attr("bind_id",window.btoa("id")).attr("style", "background:white;width: 300px;height:200px;")
      }
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
    updateComVar(){
      if (this.elm !== ''){
        this.elm.select(function() { return this.parentNode }).attr('params', JSON.stringify(this.comVar))
      }
    },
    updateBindId(){
      if (this.elm !== ''){
        this.elm.select('div').attr('bind_id', window.btoa(this.chart_text) )
      }
    },
    updateSymbolsUrl(val){
      this.url_get_bind_data = val
    },
    updateViewersUrl(val){
      if(typeof(val) !== 'undefined'){
        this.url_get_ins_env = val['url_get_ins_env']
        this.externalUrls = val['externalUrls']
      }
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
        await tmp.attr("transform", `matrix(1 0 0 1 ${position.x + Math.round(Math.random()*100)} ${position.y + Math.round(Math.random()*100)})`)
        this.$common.historyOperatePush(this.history_operate_pool, 'create', tmp)
        this.dragElements()
      }
    },
    done() {
      if (this.elm !== ''){
        this.elm.select('.check_box').remove()
      }
      this.elm = ''
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
      await this.save()
      this.dialogBack = false
      setTimeout(() =>{
        this.$emit('dialogClose')
      },1100)
    },
    async save(){
      this.done()
      let params = []
      if(this.items.length > 0){
        this.items[0].params.forEach((key) => {
          params.push({'name': key.name, 'value': 'content'})
        })
        d3.select("#new").attr("params", JSON.stringify(params))
        d3.select("#new").attr("docid", this.items[0].id)
        d3.select("#new").attr("server", this.items[0].server)
      }
      await this.$emit('saveToServer', d3.select("#new"), this.url_get_bind_data)
      if(this.is_viewer === true){
        this.saveApiViewer()
      }
    },
    async saveApiBindData(){
      if(this.flagUpdateOrAdd === true){
        await this.$emit('saveApiBindData', this.url_get_bind_data)
      }
      this.queryBackendData()
    },
    async saveApiViewer(){
      let api_url = {}
      api_url['url_get_ins_env'] = this.url_get_ins_env
      api_url['externalUrls'] = this.externalUrls
      if(this.flagUpdateOrAdd === true){
        await this.$emit('saveApiViewer', api_url)
      }
      this.queryInsEnv()
    },
    async log(){
      // console.log(d3.select("#ssh\\.root\\@10\\.166\\.147\\.40"))
      console.log(d3.select("#new").node())
      // console.log(this.history_operate_pool)
    },
    expression(){
      this.dialogExpression = true
    },
    checkExpression(){
      if (this.elm !== ''){
        let data = {}
        let new_express = this.express
        let tmp = this.express.match(/\$\{.*?\}/g)
        if (tmp !== null){
          tmp.forEach((elm) => {
            new_express = new_express.replace(elm,'$')
          })
        }
        try{
          const node = math.parse(new_express)
          if (this.elm.node().getElementsByTagName('path').length > 0){
            data = this.elm.node().getElementsByTagName('path')[0]
          }else{
            data = this.elm.node().getElementsByTagName('div')[0]
          }
          this.info_color = 'success'
          this.is_success = true
          if (this.express === ''){
            data.removeAttribute('expression')
          }else{
            data.setAttribute("expression", window.btoa(this.express))
          }
        }catch(err){
          this.error_flag = true
          this.error_messages = err.toString()
        }
      }
    },
    coverToList(){
      let tmp = []
      if(this.environment_list.length > 0){
        JSON.stringify(this.environment_list).match(/\"name\":\"(.*?)\"/g).forEach((elm) => {
          tmp.push(elm.split(":")[1].replace(/\"/g,''))
        })
      }
      return tmp
    },
    syncEnvironment(){
      this.environment_list.forEach((e) => {
        if (e['name'] === this.selected_environment) {
          if(!d3.select("#"+e['id'].replaceAll('.','\\.').replaceAll('@','\\@')).empty()){
            d3.select("#"+e['id'].replaceAll('.','\\.').replaceAll('@','\\@')).node().append(this.elm.node())
          }else{
            d3.select("#new").append('g')
            .attr("id", e['id'])
            .attr("environment_name", e['name'])
            .attr("params", this.elm.attr('params'))
            .attr("docid", this.elm.attr('docid'))
            .attr("server", this.elm.attr('server'))
            .attr("class", "environment")
            .node().append(this.elm.node())
          }
          this.$common.clearGNode()
          this.env_pool.push(e['id'])
          this.env_pool = this.$common.dedupe(this.env_pool)
        }
      })
    },
    initCtrlElm(){
      if (this.elm !== ''){
        if(this.elm.select('path').empty()){
          this.elm.select('div')
            .attr('id', this.fill_id)
            .attr('mode', window.btoa(this.selected))
          if(this.elm.select('div').node().hasAttribute('range')){
            this.elm.select('select').remove()
            this.$common.createSelectVar(this.elm.select('div'),this.fill_range.split(','))
          }
        }else{
          this.elm.select('path')
            .attr('id', this.fill_id)
            .attr('value', window.btoa(this.fill_param))
            .attr('mode', window.btoa(this.selected))
        }
      }
    },
    async runOrStop(){
      if(this.run_flag === false){
        let that = this
        this.run_flag = true
        this.query_data_pool = []
        d3.selectAll(".environment").each(function(d, i) {
          that.history_data_pool[d3.select(this).attr('id')] = []
        })
        this.interval = setInterval(function() {
          d3.selectAll(".environment").each(function(d, i) {
            let hardware = this
            let query_struc = {
              'username': that.username,
              'operate': "hardware_environment_save_config",
              'url': d3.select(hardware).attr('server'),
              'sid': d3.select(hardware).attr("id"),
              'docid': d3.select(hardware).attr("docid"),
              'params':d3.select(hardware).attr('params'),
            }

            d3.select(hardware).selectAll("path").each(function(d, i) {
              if(d3.select(this).attr('dom_type') === 'data'){
                let data = d3.select(this).node()
                if (data.getAttribute('expression') !== null) {
                  that.$common.getRootVar(data.getAttribute("expression"), that.query_data_pool)
                }else{
                  if (data.getAttribute('mode') === null) {
                    that.query_data_pool.push(data.getAttribute("id"))
                  }
                }
              }
            })
            JSON.parse(query_struc['params']).forEach((key) =>{
              query_struc["addr_map"] = key.value
            })
            query_struc["key"] = that.$common.dedupe(that.query_data_pool).join(',')
            // formData.append("addr_map", 'x:0x1090000000 + (x&0xFFFFFFF)')
            let config = {
              headers: {
              'Content-Type': 'multipart/form-data'
              }
            }
            let formData = new FormData()
            for ( let key in query_struc) {
                formData.append(key, query_struc[key])
            }
            axios.post(query_struc['url'], formData, config)
            .then(
              (response)=>{
                let he = response.data
                // console.log(he)
                let data_slice = {}
                d3.select(hardware).selectAll("path").each(function(d, i) {
                  if(d3.select(this).attr('dom_type') === 'data'){
                    let data = d3.select(this).node()
                    if (data.getAttribute('expression') === null && data.getAttribute('mode') === null){
                      data.setAttribute("value", window.btoa(he[data.getAttribute("id")]))
                    }else if(data.getAttribute('expression') !== null && window.atob(data.getAttribute('expression')).indexOf("$") === -1) {
                      let temp = that.$common.calExpressDepend(data.getAttribute('expression'), he, hardware)
                      data.setAttribute("value", window.btoa(temp))
                    }else if(data.getAttribute('expression') !== null && window.atob(data.getAttribute('expression')).indexOf("$") !== -1 ) {
                      let expression = window.atob(data.getAttribute('expression'))
                      let vars = expression.match(/(\$\{(.*?)\})/g)
                      if (vars !== null) {
                        vars.forEach((v) => {
                          expression = expression.replace(v, that.$common.calExpressDepend(window.btoa(v.replace('$','').replace('{','').replace('}','')), he, hardware))
                        })
                        try{
                          let result = that.$common.calExpressDepend(window.btoa(expression), he, hardware)
                          if(typeof(result) === 'undefined'){
                            data.setAttribute("value", window.btoa(expression))
                          }else{
                            data.setAttribute("value", window.btoa(result))
                          }
                        }catch(err){
                          data.setAttribute("value", window.btoa(expression))
                        }
                      }else{
                        let temp = that.$common.calExpressDepend(data.getAttribute('expression'), he, hardware)
                        data.setAttribute("value", window.btoa(temp))
                      }
                    }
                    data_slice[data.getAttribute('id')] = window.atob(data.getAttribute("value"))
                  }
                })
                that.history_data_pool[d3.select(hardware).attr('id')].push(data_slice)
                d3.select(hardware).selectAll('.tip').each(function(d, i) {
                  let path = d3.select(this.parentNode).select('path')
                  d3.select(this).text(window.atob(path.attr('value')))
                })
                d3.select(hardware).selectAll('.children').each(function(d, i) {
                  if(d3.select(this).attr('dom_type') === 'chart'){
                    let series = []
                    let names = []
                    if(d3.select(this).attr('bind_id') !== null){
                      window.atob(d3.select(this).attr('bind_id')).split(',').forEach((id) => {
                        let tmp = []
                        names.push(id)
                        that.history_data_pool[d3.select(hardware).attr('id')].forEach((slice) => {
                          tmp.push(slice[id])
                        })
                        tmp = that.$common.sliceYAxisQueueHandle(tmp, 30)
                        series.push({'name':id, 'type':'line', 'showSymbol':false, data:tmp})
                      })
                      let ins = echarts.getInstanceByDom(document.getElementById(d3.select(this).attr('id')))
                      if (ins == null){
                        echarts.init(document.getElementById(d3.select(this).attr('id'))).setOption(that.$common.getChartConfig(names, series, that.$common.sliceXAxisQueueHandle(that.refresh_interval, 30)))
                      }else{
                        ins.setOption(that.$common.getChartConfig(names, series, that.$common.sliceXAxisQueueHandle(that.refresh_interval, 30)), true)
                      }
                    }
                  }
                })
            }, (error) => {
              console.log(error)
            })
          })
        },this.refresh_interval)
      }else{
        clearInterval(this.interval)
        this.run_flag = false
      }
    },
    async interactive(){
      let res = []

      let formData = new FormData()
      let parent = this.elm.select(function() { return this.parentNode })
      formData.append("username", this.username)
      formData.append("sid", parent.attr("id"))
      formData.append("docid", parent.attr("docid"))

      parent.selectAll(".children").each(function(d, i) {
        if(d3.select(this).attr('dom_type') === 'data'){
          let tmp = {}
          let data = d3.select(this).node()
          if (window.atob(data.getAttribute("mode")) === 'interactive'){
            tmp['id'] = data.getAttribute("id")
            tmp['value'] = window.atob(data.getAttribute("value"))
            tmp['expression'] = data.getAttribute("expression") !== null ? window.atob(data.getAttribute("expression")) : ""
            res.push(tmp)
          }
        }
      })
      formData.append("key", JSON.stringify(res))

      let config = {
        headers: {
        'Content-Type': 'multipart/form-data'
        }
      }
      await axios.post(parent.attr("server"), formData, config).then(
        (response)=>{
        console.log(response.data.content)
      })
    },
    importSvg(){
      document.getElementById('fileInput').click()
    },
    insertSvg(svg){
      let that = this
      d3.xml(svg)
      .then(data => {
        let instance_id = this.$common.generateUUID()
        let tmp = data.getElementsByTagName('g')[0]
        tmp.setAttribute("id", instance_id)
        tmp.setAttribute("xmlns", "http://www.w3.org/2000/svg")
        tmp.setAttribute("transform", that.matrix)
        tmp.setAttribute("dom_type", 'g')
        tmp.setAttribute("drag_event", 'true')
        d3.select('#new').node().append(tmp)
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
    autocomplete(){
      this.error_flag = false
      this.error_messages = ''
    },
  },
}
</script>


