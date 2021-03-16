<template lang="pug">
  v-card(class="d-flex justify-center mb-8")
    v-card(class="pa-2" color='grey lighten-3')
      v-sheet(width="85")
        v-list(dense class="grow")
          v-list-item
            v-list-item-title
              v-icon(@click="$emit('dialogClose')") mdi-close
          v-list-item(@click="newItem")
            v-list-item-title NEW
          v-list-item(@click="save")
            v-list-item-title SAVE
          v-list-item(@click="log")
            v-list-item-title LOG
          v-list-item(@click="dialogConfig = true")
            v-list-item-title CONFIG
          template(v-if="is_viewer === false")
            v-list-item(@click="importSvg")
              v-list-item-title IMPORT
              v-file-input(id="fileInput" v-model="svgIns" @change="fileInsertSvg" style="display:none" multiple)
          template(v-if='is_viewer === true')
            template(v-if='run_flag === false')
              v-list-item(@click="runOrStop")
                v-list-item-title RUN
            template(v-else)
              v-list-item(@click="runOrStop")
                v-list-item-title STOP
    v-card(class="pa-2" dark)
      v-sheet(width="115")
        v-list(dense class="grow")
          v-list-item(v-for="(tool, j) in tools_category" :key="j")
            v-list-group
              template(v-slot:activator="")
                v-list-item-title {{ tool.title }}
              v-list-item-group(color="success")
                v-list-item(v-for="(item, i) in tool.symbols" :disabled='item.symbol === "data" && is_viewer === true' dense :key="item.id" @click="selectedItem(item)")
                  v-list-item-title(v-text="item.symbol")
                  template(v-if='tool.title !== "basic" && is_viewer === false')
                    v-list-item-icon
                      v-icon(@click.stop="editItem(item)") mdi-pencil
    v-card(class="pa-2")
      v-sheet(color="grey lighten-4" :height="canvas_height" :width="canvas_width"  @dblclick="done")
        div(id="painting")
          svg(id="viz" :height="canvas_height" :width="canvas_width" class="container-border")
    v-card(class="pa-2" dark)
      v-sheet(width="300")
        template(v-if="select_mode !== ''")
          v-toolbar(dark)
            v-toolbar-title {{ select_mode }}
          v-spacer(class="mt-3")
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
                  v-text-field(v-model="fill_id" label="fill id" @change="initCtrlElm")
                template(v-else-if="key === 'value' && Object.keys(data).indexOf('mode') > -1")
                  v-text-field(v-model="fill_param" label="fill param" @change="initCtrlElm")
                template(v-else)
                  v-text-field(:value="data[key]" :label="key" disabled dense)
            v-row
              v-col(class="pa-2")
                v-btn(dark, @click="expression") EXPRESSION
            v-dialog(v-model="dialogExpression", max-width="1000px")
              v-card
                v-container(fluid)
                  v-row(class="d-flex justify-center")
                    v-col(class="pa-2")
                      v-treeview(:active.sync="variable" open-on-click dense hoverable activatable :items="items")
                    v-divider(vertical)
                    v-col(class="pa-2")
                      v-textarea(v-model="express" @keyup.enter="autocomplete" label="Fill in the expression" auto-grow outlined :error="error_flag" :error-messages="error_messages")
                      v-btn(dark :color="info_color" @click='checkExpression' depressed) CHECK
                        template(v-if="is_success === true")
                          v-icon(dark right) mdi-checkbox-marked-circle
          template(v-else-if="select_mode === 'viewer'")
            v-row(class="d-flex justify-center")
              v-col(class="pa-2")
                v-combobox(v-model="selected_environment" :items='coverToList()' label="Environment select" dense outlined @change="syncEnvironment")
                v-row(class="d-flex justify-center" v-for="key in comVar" :key="key.name")
                  v-col(class="pa-2")
                    v-text-field(v-model="key.value" :label="key.name" outlined dense @change="updateComVar")
                v-btn( dark @click='interactive' depressed) INTERACTIVE
          template(v-else-if="select_mode === 'scene' && is_viewer === true")
            //- v-row(class="d-flex justify-center")
            //-   v-col(class="pa-2")
            //-     v-btn( dark @click='interactive' depressed) INTERACTIVE
            v-card(color="grey darken-4")
              v-container(fluid)
                v-card-title External Link
                v-list(dense class="grow")
                  template(v-for="url in externalUrls")
                    v-list-item(target="_blank" :href="url.addr")
                      v-list-item-title(v-text="url.name")
                    v-divider
          template(v-if="select_mode !== 'data'")
            v-row
              v-color-picker(v-model="hexa" hide-inputs class="ma-2" @update:color="updateColor")
        v-dialog(v-model='dialogDataBind', dark, max-width="800px")
          v-card
            v-container
              v-row
                v-btn(color="primary", dark, @click="createCustomData") CUSTOM
              v-spacer(class="mt-3")
              //- v-row
                v-text-field(v-model="url_get_bind_data" label="Api get bind data" dense outlined)
                v-btn(color="primary", text, dark, @click="saveApiBindData") REFRESH
              v-divider
              v-card
                v-treeview(:active.sync="bind_data" open-on-click rounded activatable :items="items")
        v-dialog(v-model='dialogConfig',  max-width="800px")
          v-card
            v-container
              template(v-if="is_viewer === true")
                v-row
                  v-text-field(class="ma-1" v-model="url_get_ins_env" label="Api get instance environment" dense outlined)
                  //- v-row
                    v-text-field(class="ma-1" v-model="url_post_config_read_data" label="Api post config params and read data" dense outlined)
                  //- v-row
                    v-text-field(class="ma-1" v-model="url_post_interactive_data" label="Api post interactive data" dense outlined)
                v-card
                  v-data-table(:headers="externalUrlHeaders" :items="externalUrls" class="elevation-1" hide-default-footer)
                    template(v-slot:top="")
                      v-toolbar(flat)
                        v-toolbar-title EXTERNAL LINK
                        v-divider(class="mx-4" inset vertical)
                        v-spacer
                        v-dialog(v-model="dialogExternalUrl" max-width="500px")
                          template(v-slot:activator="{ on, attrs }")
                            v-btn(color="primary" dark class="mb-2" v-bind="attrs" v-on="on") New Item
                          v-card
                            v-card-text
                              v-container
                                v-row
                                  v-col(cols="12" sm="6" md="6")
                                    v-text-field(v-model="editedItem.name" label="external link name" outlined dense)
                                  v-col(cols="12" sm="6" md="6")
                                    v-text-field(v-model="editedItem.addr" label="external link addr" outlined dense)
                            v-card-actions
                              v-spacer
                              v-btn(color="blue darken-1" text @click="dialogExternalUrl = false") CANCEL
                              v-btn(color="blue darken-1" text @click="externalUrls.push(editedItem);editedItem = {};dialogExternalUrl = false") OK
                    template(v-slot:item.actions="{ item,index }")
                      v-icon(small @click="externalUrls.splice(externalUrls.indexOf(item), 1)") mdi-delete
              template(v-else)
                v-row
                  v-text-field(v-model="url_get_bind_data" label="Api get bind data" dense outlined)
              v-row
                v-spacer
                template(v-if="is_viewer === true")
                  v-btn(class="mt-3" color="primary", dark, @click="saveApiViewer") APPLY
                template(v-else)
                  v-btn(class="mt-3" color="primary", dark, @click="saveApiBindData") APPLY
                v-spacer
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
      items: [],
      svgIns: [],
      comVar: [],
      url_get_bind_data: '',
      url_get_ins_env: '',
      url_post_config_read_data: '',
      url_post_interactive_data: '',
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
      // url_get_ins_env: process.env.NODE_ENV === 'development' ? 'http://localhost:8000/ru/babel/get?operate=hardware_environment_read_status' : 'http://10.166.152.49/ru/babel/get?operate=hardware_environment_read_status',
      // url_post_config_read_data: process.env.NODE_ENV === 'development' ? 'http://localhost:8000/ru/babel/save' : 'http://10.166.152.49/ru/babel/save',
      // url_post_interactive_data: process.env.NODE_ENV === 'development' ? 'http://localhost:8000/ru/babel/save' : 'http://10.166.152.49/ru/babel/save',
      selected_environment: '',
      run_flag: false,
      interval: '',
      dialogDataBind: false,
      dialogExpression: false,
      dialogConfig: false,
      dialogExternalUrl: false,
      express: '',
      error_flag: false,
      error_messages: '',
      is_success: false,
      info_color: 'info',
      variable: [],
      selected: '',
      fill_param: '',
      fill_id: '',
      hexa: '#FF00FF',
      canvas_width: 950,
      canvas_height: 730,
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
      elm: '',
      major_elms: ['polygon','path','text','foreignObject'],
      label: '',
      bind_data: [],
      data: {},
      original_attributes: ['style','xmlns'],
      select_mode: 'scene',
      path_points: '',
      polygon_points: '',
      text: '',
      instance_num: 0,
      opt: '20',
      transform: 'translate(0,0) scale(1)',
      matrix: 'matrix(1 0 0 1 0 0)',
      drag:'',
      viewer_drag:'',
    }
  },
  watch:{
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
    }
  },
  mounted () {
    let that = this
    this.x = d3.scaleLinear()
      .domain([0, this.canvas_width])
      .range([0, this.canvas_width])

    this.y = d3.scaleLinear()
      .domain([0, this.canvas_height])
      .range([0, this.canvas_height])

    document.onkeydown = function(e) {
      let key = e.keyCode
      // window.event.preventDefault()

      if (e.path[0].getAttribute('type') === 'text') return
      if (e.path[0].toString().indexOf('TextArea') > -1) return

      if (key== 46 || key== 8) { //Del or Backspace
        that.deleteElm()
      }
    }
    this.$common.setBrowserTitle("new")
    this.svg = d3.select("#viz").append("g").attr("id", "new")

    d3.select("#viz").append("g").attr("id", "axis")
    this.gx = d3.select("#axis").append("g").call(this.xAxis, this.x, {'x':0, 'y':0})
    this.gy = d3.select("#axis").append("g").call(this.yAxis, this.x, {'x':0, 'y':0})
    this.zoom = d3.zoom().scaleExtent([0.4, 8]).on("zoom", this.zoomed)
    d3.select("#viz").call(this.zoom).on("dblclick.zoom", null)

    function dragstarted(event) {
      if (that.elm !== ''){
        that.done()
      }
      that.elm = d3.select(this)
      that.createCheckBox(d3.select(this), this.getBBox().x, this.getBBox().y, this.getBBox().width, this.getBBox().height)

      if (that.is_viewer === true && d3.select(this).attr("dom_type") === 'g'){
        that.select_mode = 'viewer'
        that.selected_environment = d3.select(this).attr("environment_name")
        that.comVar = JSON.parse(d3.select(this).attr("params"))
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
          if (d3.select(this).node().getElementsByTagName('span').length > 0){
            data = d3.select(this).node().getElementsByTagName('span')[0]
          }else{
            data = d3.select(this).node().getElementsByTagName('div')[0]
          }
          for(let i=0;i < data.attributes.length;i++){
            if(that.original_attributes.toString().indexOf(data.attributes[i].name) == -1){
              if('id' == data.attributes[i].name){
                that.fill_id = data.getAttribute(data.attributes[i].name)
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
        }
      }
    }
    function dragged(event) {
      // console.log(event)
      // d3.select(this).attr("transform", `matrix(${typeof(that.transform.k) === "undefined" ? 1 : that.transform.k} 0 0 ${typeof(that.transform.k) === "undefined" ? 1 : that.transform.k} ${event.x} ${event.y})`)
      if(Math.abs(event.dx) >= 1 || Math.abs(event.dy) >= 1){
        d3.select(this).attr("transform", `matrix(1 0 0 1 ${event.x} ${event.y})`)
      }
    }
    this.drag = d3.drag().on("start", dragstarted).on("drag", dragged)
    this.viewer_drag = d3.drag().on("start", dragstarted)
  },
  methods: {
    zoomed(event) {
      const {transform} = event
      this.transform = transform

      d3.select("#axis").selectAll('text').call(g => g.attr("transform", transform))
      d3.select("#new").attr("transform", transform)

      this.gx.call(this.xAxis, transform.rescaleX(this.x), transform)
      this.gy.call(this.yAxis, transform.rescaleY(this.y), transform)
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
        this.data_type = ''
        this.data_id = ''
        this.data_name = ''
        this.data_range = ''
        this.data_value = ''
        // this.select_mode = 'data'
        this.dialogDataBind = true
      }else{
        this.addSymbolSvg(item)
      }
    },
    async queryBackendData(){
      await axios.get(this.url_get_bind_data)
        .then(response => {
          this.items = [JSON.parse(pako.inflate(window.atob(response.data.content[0]), { to: 'string' }))]
        })
      // this.items = [response.data.content]
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
      this.svg.append('g').attr("transform", this.matrix).call(this.drag)
        .append('path')
          .attr("class", "children")
          .attr("dom_type", 'path')
          .attr("d", this.path_points) //'M50 150Q300 50 300 150T450 150'
          .style("fill", 'none')
          .style('stroke', this.hexa)
          .style('stroke-width', 5)
    },
    createPolygon() { // 100,100 100,400 300,400 300,100
      this.svg.append('g').attr("transform", this.matrix).call(this.drag)
        .append("polygon")
          .attr("class", "children")
          .attr("dom_type", 'polygon')
          .attr("points", this.polygon_points)
          .style("fill", "none")
          .style('stroke', this.hexa)
          .style('stroke-width', 5)
    },
    createText() {
      this.svg.append('g').attr("transform", this.matrix).call(this.drag)
        .append("text")
          .attr("class", "children")
          .attr("dom_type", 'text')
          .attr("fill", this.hexa)
          // .attr("font-weight", "bold")
          .text(this.text)
    },
    createData(){
      this.data = this.$common.jsonSearchId(this.items, this.bind_data)
      let uuid = this.$common.generateUUID()
      let content = ''
      Object.keys(this.data).forEach((key) => {
        if (key == 'id') {
          content += ' '+key+'='+this.data[key]
        }else{
          content += ' '+key+'='+window.btoa(this.data[key])
        }
      })
      if (this.data['type'] === 'echarts'){
        this.svg.append('g').attr("transform", this.matrix).call(this.drag)
        .append("foreignObject")
          .attr("id", uuid)
          .attr("dom_type", 'data')
          .attr("class", 'children')
          .attr("width", 600)
          .attr("height", 400)
        .html('<div class="data"'+content+' xmlns="http://www.w3.org/1999/xhtml" style="background:yellow;width: 600px;height:400px;">')
        // echarts.init(document.getElementById(uuid+'_'+data['id'])).setOption(data['value'])
      }else{
        this.svg.append('g').attr("transform", this.matrix).call(this.drag)
        .append("foreignObject")
          .attr("id", uuid)
          .attr("dom_type", 'data')
          .attr("class", 'children')
          .attr("width", this.data['id'].length*10)
          .attr("height", 25)
        .html('<div class="data"'+content+' xmlns="http://www.w3.org/1999/xhtml"> <span '+content+' style="color: '+this.hexa+'">'+this.data['id']+'</span> </div>')
      }
    },
    createCustomData(){
      let uuid = this.$common.generateUUID()
      let content = ' id='+uuid+' value='+window.btoa('content')+' mode='+window.btoa('normal')
      this.svg.append('g').attr("transform", this.matrix).call(this.drag)
      .append("foreignObject")
        .attr("id", uuid)
        .attr("dom_type", 'data')
        .attr("class", 'children')
        .attr("width", uuid.length*10)
        .attr("height", 25)
      .html('<div class="data"'+content+' xmlns="http://www.w3.org/1999/xhtml"> <span '+content+' style="color: '+this.hexa+'"> '+uuid+":"+"content"+' </span> </div>')
    },
    updateColor(){
      if (this.elm !== ''){
        if(this.elm.select('.children').attr("dom_type") === 'text'){
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
        this.elm.select('.children').attr("d", this.path_points)
      }else{
        this.createPath()
      }
    },
    updatePolygon(){
      if (this.elm !== ''){
        this.elm.select('.children').attr("points", this.polygon_points)
      }else{
        this.createPolygon()
      }
    },
    updateText(){
      if (this.elm !== ''){
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
        this.elm.attr('params', JSON.stringify(this.comVar))
      }
    },
    deleteElm() {
      if (this.elm !== ''){
        this.elm.remove()
        this.elm = ''
        this.select_mode = ''
      }
    },
    done() {
      if (this.elm !== ''){
        this.elm.select('.check_box').remove()
      }
      this.elm = ''
      this.select_mode = 'scene'
    },
    async save(){
      await this.done()
      let params = []
      if(this.items.length > 0){
        this.items[0].params.forEach((key) => {
          params.push({'name': key.name, 'value': 'content'})
        })
        d3.select("#new").attr("params", JSON.stringify(params))
        d3.select("#new").attr("docid", this.items[0].id)
        d3.select("#new").attr("server", this.items[0].server)
      }
      await d3.select("#new").attr("transform", 'translate(0,0) scale(1)')
      await this.$emit('saveToServer', d3.select("#new"), this.url_get_bind_data)
      if(this.is_viewer === true){
        this.saveApiViewer()
      }
    },
    log(){
      console.log(d3.select("#new").node())
    },
    expression(){
      this.dialogExpression = true
    },
    checkExpression(){
      if (this.elm !== ''){
        let data = {}

        if (this.express.indexOf("$") > -1) {
          data = this.elm.node().getElementsByTagName('span')[0]
          data.setAttribute("expression", window.btoa(this.express))
          let str_length = data.getAttribute('id') + ":" + this.express
          this.elm.select('.children').attr("width", str_length.length*10)
          data.innerHTML = str_length
          this.info_color = 'success'
          this.is_success = true
          return
        }
        try{
          const node = math.parse(this.express)
          if (this.elm.node().getElementsByTagName('span').length > 0){
            data = this.elm.node().getElementsByTagName('span')[0]
          }else{
            data = this.elm.node().getElementsByTagName('div')[0]
          }
          data.setAttribute("expression", window.btoa(this.express))
          let str_length = data.getAttribute('id') + ":" + this.express
          this.elm.select('.children').attr("width", str_length.length*10)
          data.innerHTML = str_length
          this.info_color = 'success'
          this.is_success = true
        }catch(err){
          this.error_flag = true
          this.error_messages = err.toString()
        }
      }
    },
    clear(){
      this.done()
      this.select_mode='scene'
      this.elm=''
      this.transform='translate(0,0) scale(1)'
      d3.select("#new").selectAll("*").remove()
      d3.select("#viz").call(this.zoom.transform, d3.zoomIdentity)
    },
    dragElements(){
      let that = this
      d3.select("#new").each(function(d, i) {
        d3.selectAll(this.childNodes).each(function(d, i) {
          d3.select(this).call(that.drag)
        })
      })
      if(that.is_viewer === true){
        d3.selectAll(".data").each(function(d, i) {
          if (d3.select(this).attr("mode") !== null){
            d3.select(this.parentNode.parentNode).call(that.viewer_drag)
          }
        })
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
          this.elm.attr("environment_id", e['id'])
          this.elm.attr("environment_name", e['name'])
          this.elm.attr("class", "environment")
        }
      })
    },
    async runOrStop(){
      if(this.run_flag === false){
        let that = this
        this.run_flag = true
        this.interval = setInterval(function() {
          d3.selectAll(".environment").each(function(d, i) {
            let tmp = []
            let hardware = this
            let formData = new FormData()
            formData.append("username", that.username)
            // formData.append("operate", "hardware_environment_save_config")
            // formData.append("url", d3.select(this).attr("server"))
            formData.append("sid", d3.select(this).attr("environment_id"))
            formData.append("docid", d3.select(this).attr("docid"))

            d3.select(hardware).selectAll("span").each(function(d, i) {
              let data = d3.select(this).node()
              if (data.getAttribute('expression') !== null) {
                tmp = tmp.concat(that.$common.getRootVar(data.getAttribute("expression")))
              }else{
                if (data.getAttribute('mode') === null) {
                  tmp.push(data.getAttribute("id"))
                }

              }
            })
            JSON.parse(d3.select(hardware).attr('params')).forEach((key) =>{
              formData.append("addr_map", key.value)
            })
            formData.append("key", that.$common.dedupe(tmp).join(','))
            // formData.append("addr_map", 'x:0x1090000000 + (x&0xFFFFFFF)')
            let config = {
              headers: {
              'Content-Type': 'multipart/form-data'
              }
            }
            axios.post(d3.select(hardware).attr('server'), formData, config)
            .then(
              (response)=>{
                console.log(response)
                let he = response.data

                d3.select(hardware).selectAll("span").each(function(d, i) {
                  let data = d3.select(this).node()
                  if (data.getAttribute('expression') === null && data.getAttribute('mode') === null){
                    data.setAttribute("value", window.btoa(he[data.getAttribute("id")]))
                    data.innerHTML = data.getAttribute("id")+":"+he[data.getAttribute("id")]
                  }else if(data.getAttribute('expression') !== null && window.atob(data.getAttribute('expression')).search("$") === -1) {
                    let temp = that.$common.calExpressDepend(data.getAttribute('expression'), he)
                    data.setAttribute("value", window.btoa(temp))
                    data.innerHTML = data.getAttribute("id")+":"+temp
                  }else if(data.getAttribute('expression') !== null && window.atob(data.getAttribute('expression')).search("$") !== -1 ) {
                    let expression = window.atob(data.getAttribute('expression'))
                    let vars = expression.match(/(\$\{(.*?)\})/g)
                    if (vars !== null) {
                      vars.forEach((v) => {
                        expression = expression.replace(v, that.$common.calExpressDepend(window.btoa(v.replace('$','').replace('{','').replace('}','')), he))
                      })
                      data.setAttribute("value", window.btoa(expression))
                      data.innerHTML = data.getAttribute("id")+":"+expression
                    }else{
                      let temp = that.$common.calExpressDepend(data.getAttribute('expression'), he)
                      data.setAttribute("value", window.btoa(temp))
                      data.innerHTML = data.getAttribute("id")+":"+temp
                    }
                  }
                  d3.select(this.parentNode.parentNode).attr('width', data.innerHTML.length * 10)
                })

            }, (error) => {
              console.log(error)
            })
          })
        },3000)
      }else{
        clearInterval(this.interval)
        this.run_flag = false
      }
    },
    initCtrlElm(){
      if (this.elm !== ''){
        this.elm.select('span')
          .attr('id', this.fill_id)
          .attr('value', window.btoa(this.fill_param))
          .attr('mode', window.btoa(this.selected))
        let express = this.elm.select('span').attr('expression') === null ? this.fill_param : window.atob(this.elm.select('span').attr('expression'))
        let str_length = this.fill_id + ":" + express
        this.elm.select('.children').attr("width", str_length.length*10)
        this.elm.node().getElementsByTagName('span')[0].innerHTML = str_length
      }
    },
    async interactive(){
      let res = []

      let formData = new FormData()
      formData.append("username", this.username)
      // formData.append("operate", "post_interactive_data")
      // formData.append("url", this.url_post_interactive_data)
      formData.append("sid", this.elm.attr("environment_id"))
      formData.append("docid", this.elm.attr("docid"))

      this.elm.selectAll("span").each(function(d, i) {
        let tmp = {}
        let data = d3.select(this).node()
        if (window.atob(data.getAttribute("mode")) === 'interactive'){
          tmp['id'] = data.getAttribute("id")
          tmp['value'] = window.atob(data.getAttribute("value"))
          tmp['expression'] = data.getAttribute("expression") !== null ? window.atob(data.getAttribute("expression")) : ""
          res.push(tmp)
        }
      })
      formData.append("key", JSON.stringify(res))

      let config = {
        headers: {
        'Content-Type': 'multipart/form-data'
        }
      }
      await axios.post(this.elm.attr("server"), formData, config).then(
        (response)=>{
        console.log(response.data.content)
      })
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
      // api_url['url_post_config_read_data'] = this.url_post_config_read_data
      // api_url['url_post_interactive_data'] = this.url_post_interactive_data
      api_url['externalUrls'] = this.externalUrls
      if(this.flagUpdateOrAdd === true){
        await this.$emit('saveApiViewer', api_url)
      }
      this.queryInsEnv()
    },
    updateSymbolsUrl(val){
      this.url_get_bind_data = val
    },
    updateViewersUrl(val){
      if(typeof(val) !== 'undefined'){
        this.url_get_ins_env = val['url_get_ins_env']
        // this.url_post_config_read_data = val['url_post_config_read_data']
        // this.url_post_interactive_data = val['url_post_interactive_data']
        this.externalUrls = val['externalUrls']
      }
    },
    insertSvg(svg){
      let that = this
      d3.xml(svg)
      .then(data => {
        let instance_id = this.$common.generateUUID()
        let tmp = data.getElementsByTagName('g')[0]
        tmp.setAttribute("id", instance_id)
        tmp.setAttribute("xmlns", "http://www.w3.org/2000/svg")
        tmp.setAttribute("dom_type", 'g')
        d3.select('#new').node().append(tmp)
        d3.select('#'+instance_id).call(that.drag)
        // that.major_elms.forEach((elm) => {
        //   d3.select('#'+instance_id).selectAll(elm).call(g => g.attr("dom_type", elm))
        // })
        if(that.is_viewer === true){
          d3.select('#'+instance_id).selectAll(".data").each(function(d, i) {
            if (d3.select(this).attr("mode") !== null){
              d3.select(this.parentNode.parentNode).call(that.viewer_drag)
            }
          })
        }
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

    },
    importSvg(){
      document.getElementById('fileInput').click()
    }
  },
}
</script>


