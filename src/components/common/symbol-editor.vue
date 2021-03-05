<template lang="pug">
  v-card(class="d-flex justify-center mb-8")
    v-card(class="pa-2" color='grey lighten-3')
      v-sheet(width="65")
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
          template(v-if='is_viewer === true')
            template(v-if='run_flag === false')
              v-list-item(@click="runOrStop")
                v-list-item-title RUN
            template(v-else)
              v-list-item(@click="runOrStop")
                v-list-item-title STOP
            v-list-item(@click="dialogViewerConfig = true")
              v-list-item-title CONFIG
    v-card(class="pa-2" dark)
      v-sheet(width="130")
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
                v-text-field(v-model="stroke_width" label="stroke width" dense outlined @keyup.enter="updateStrokeWidth")
          template(v-else-if="select_mode === 'polygon'")
            v-row(class="d-flex justify-center")
              v-col(class="pa-2")
                v-text-field(v-model="polygon_points" label="polygon points" dense outlined @keyup.enter="updatePolygon")
                v-text-field(v-model="stroke_width" label="stroke width" dense outlined @keyup.enter="updateStrokeWidth")
          template(v-else-if="select_mode === 'circle'")
            v-row(class="d-flex justify-center")
              v-col(class="pa-2")
                v-text-field(v-model="circle_r_x" label="circle radius of x" dense outlined @keyup.enter="updateCircle")
                v-text-field(v-model="circle_r_y" label="circle radius of y" dense outlined @keyup.enter="updateCircle")
                v-text-field(v-model="stroke_width" label="stroke width" dense outlined @keyup.enter="updateStrokeWidth")
          template(v-else-if="select_mode === 'rectangle'")
            v-row(class="d-flex justify-center")
              v-col(class="pa-2")
                v-text-field(v-model="rec_width" label="width" dense outlined @keyup.enter="updateRec")
                v-text-field(v-model="rec_height" label="height" dense outlined @keyup.enter="updateRec")
                v-text-field(v-model="stroke_width" label="stroke width" dense outlined @keyup.enter="updateStrokeWidth")
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
<<<<<<< HEAD
                  v-text-field(v-model="data_value" label="Value" dense @keyup.enter="updateData")
          v-toolbar(dark)
            v-toolbar-title Shape and Color
          v-col
              v-slider(v-model="s_scale" class="ma-2" :readonly="s_flag" :max="s_max" :min="s_min" thumb-label thumb-color="blue" ticks label="Scale" @input="updateScale")
              v-slider(v-if="select_mode !== 'text' && select_mode !== 'data' " v-model="s_width" class="ma-2" :readonly="s_flag" :max="w_max" :min="w_min" thumb-label thumb-color="blue" ticks label="Width" @input="updateScaleOfW")
              v-slider(v-if="select_mode !== 'text' && select_mode !== 'data' " v-model="s_height" class="ma-2" :readonly="s_flag" :max="h_max" :min="h_min" thumb-label thumb-color="blue" ticks label="Height" @input="updateScaleOfH")
              span(class="ma-2") Rotate
              v-btn(v-model="rotate" @click="startRotate")
                v-icon mdi-crop-rotate
          v-row
            v-color-picker(v-model="hexa" hide-inputs class="ma-2" @update:color="updateColor")
=======
                  v-text-field(:value="data[key]" :label="key" disabled dense)
            v-row
              v-col(class="pa-2")
                v-btn(dark, @click="expression") EXPRESSION
            v-dialog(v-model="dialogExpression", max-width="900px")
              v-card
                v-container(fluid)
                  v-row(class="d-flex justify-center")
                    v-col(class="pa-2")
                      v-treeview(:active.sync="variable" open-on-click dense hoverable activatable :items="items")
                    v-divider(vertical)
                    v-col(class="pa-2")
                      v-textarea(v-model="express" label="Fill in the expression" auto-grow outlined :error="error_flag" :error-messages="error_messages")
                      v-btn(dark :color="info_color" @click='checkExpression' depressed) CHECK
                        template(v-if="is_success === true")
                          v-icon(dark right) mdi-checkbox-marked-circle
          template(v-else-if="select_mode === 'viewer'")
            v-row(class="d-flex justify-center")
              v-col(class="pa-2")
                //- template(v-if="ctrl_param_type === 'list'")
                //-   v-combobox(v-model="selected" :items="selected_items" label="selected param" @change='initCtrlElm')
                //- template(v-else-if="ctrl_param_type === 'text'")
                //-   v-text-field(v-model="selected" label="fill param" @change='initCtrlElm')
                //- template(v-else)
                v-combobox(v-model="selected_hardware_environment" :items='coverToList()' label="Hardware environment select" dense outlined @change="syncHardwareEnvironment")
                v-btn(dark @click='interactive' depressed) INTERACTIVE
          template(v-if="select_mode !== 'data' && is_viewer !== true")
            v-row
              v-color-picker(v-model="hexa" hide-inputs class="ma-2" @update:color="updateColor")
>>>>>>> 4e4717d9ee038bed12147d2c59539f40a0a0cdb2
        v-dialog(v-model='dialogDataBind', dark, max-width="800px")
          v-card
            v-container
              v-row
                v-btn(color="primary", dark, @click="createCustomData") CUSTOM
              v-spacer(class="mt-3")
              v-divider
              v-card
                v-treeview(:active.sync="bind_data" open-on-click rounded activatable :items="items")
        v-dialog(v-model='dialogViewerConfig', dark, max-width="800px")
          v-card
            v-container
              v-row
                v-text-field(v-model="url_get_bind_data" label="Api get bind data" dense outlined)
              v-row
                v-text-field(v-model="url_get_ins_env" label="Api get instance environment" dense outlined)
              v-row
                v-text-field(v-model="url_post_config_read_data" label="Api post config params and read data" dense outlined)
              v-row
                v-text-field(v-model="url_post_interactive_data" label="Api post interactive data" dense outlined)
</template>

<script>
import * as d3 from 'd3'
import axios from 'axios'
import * as echarts from 'echarts'
<<<<<<< HEAD
//import func from '../../../vue-temp/vue-editor-bridge'
=======
import pako from 'pako'
import * as math from 'mathjs'
>>>>>>> 4e4717d9ee038bed12147d2c59539f40a0a0cdb2

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
    hardware_environment_list:{
      type: Array,
      default () {
        return []
      }
    }
  },
  data () {
    return {
      num: 0,
      items: [],
      url_get_bind_data: process.env.NODE_ENV === 'development' ? 'http://localhost:8000/ru/babel/get?operate=get_test_data' : 'http://10.166.152.49/ru/babel/get?operate=get_test_data',
      url_get_ins_env: process.env.NODE_ENV === 'development' ? 'http://localhost:8000/ru/babel/get?operate=hardware_environment_read_status' : 'http://10.166.152.49/ru/babel/get?operate=hardware_environment_read_status',
      url_post_config_read_data: process.env.NODE_ENV === 'development' ? 'http://localhost:8000/ru/babel/save' : 'http://10.166.152.49/ru/babel/save',
      url_post_interactive_data: process.env.NODE_ENV === 'development' ? 'http://localhost:8000/ru/babel/save' : 'http://10.166.152.49/ru/babel/save',
      selected_hardware_environment: '',
      run_flag: false,
      interval: '',
      dialogDataBind: false,
      dialogExpression: false,
      dialogViewerConfig: false,
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
      major_elms: ['polygon','path','text','foreignObject','circle','rectangle','ellipse'],
      label: '',
      bind_data: [],
      data: {},
      original_attributes: ['style','xmlns'],
      select_mode: '',
      path_points: '',
      polygon_points: '',
      circle_r_x: '',
      circle_r_y: '',
      rec_width: '',
      rec_height: '',
      rec_points: '',
      stroke_width: 5,
      text: '',
      instance_num: 0,
      opt: '20',
      transform: 'translate(0,0) scale(1)',
      clipboard: {
        data: null,
        count: 0
      },
      state:{
        svgLog: [],
        current: -1,
        limit: 10
      },
      s_flag: true,
      s_scale: 0,
      s_min: -50,
      s_max: 200,
      s_width: 0,
      s_height: 0,
      w_min: -50,
      w_max: 200,
      h_min: -50,
      h_max: 200,
      font_size: 15,
      rotate: 90,
      brush:'',
      combined: []
    }
  },
  watch:{
    dialogDataBind(val) {
      if(val === false && this.bind_data.length > 0){
        this.createData()
      }
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
    var _this = this
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

      if (key == 80){ // P path
        _this.select_mode = 'path'
      }
      if (key == 79){ // O polygon
        _this.select_mode = 'polygon'
      }
      if (key == 67){ // C circle
        _this.select_mode = 'circle'
      }
      if (key == 82){ // R rectangle
        _this.select_mode = 'rectangle'
      }
      if (key == 84){ // T text
        _this.select_mode = 'text'
      }
      if (key == 68){ // D data
        _this.dialogDataBind = true
        _this.select_mode = 'data'
      }

      if (key== 46 || key== 8) { //Del or Backspace
        _this.deleteElm()
      }

      if (e.ctrlKey && key == 67){ // Ctrl+C
        _this.clipboard = _this.$experience.copyElm(_this.elm)
      }

      if (e.ctrlKey && key == 86){ // Ctrl+V
        if (_this.clipboard.data.attr("dom_type") === 'g'){
          _this.clipboard.count++
          _this.clipboard.data.selectAll('*').select(function() {
            if(d3.select(this).attr("dom_type") !== "g"){
              return this
            }
          }).each(function(d, i) {
            let id = _this.$common.generateUUID()
            _this.$experience.pasteElm(_this.clipboard, _this.svg, id, _this.hexa, d3.select(this))
            _this.svg.select("#" + id).call(_this.drag(_this.svg))
          })
        }else{
          let id = _this.$common.generateUUID()
          _this.$experience.pasteElm(_this.clipboard, _this.svg, id, _this.hexa, '')
          _this.svg.select("#" + id).call(_this.drag(_this.svg))
        }
        _this.$experience.saveLog(_this.state, _this.svg)
      }

      if (e.ctrlKey && key == 90){ // Ctrl+Z
        //_this.$experience.undo(_this.state, _this.svg, _this.drag)
        let val = _this.state.svgLog[_this.state.current-1]
        d3.xml(val)
          .then(data => {
            let tmp = data.getElementsByTagName('g')[0]
            //console.log(tmp)
            d3.select("#new").remove()
            d3.select('#viz').node().append(tmp)
            _this.svg = d3.select("#new")
            //console.log("svg",_this.svg)
            _this.svg.selectAll('*').each(function(d, i){
              d3.select(this).call(_this.drag(d3.select(this)))
            })
          })
        _this.state.current--
      }

      if (e.ctrlKey && key == 89){ // Ctrl+Y
        _this.$experience.redo(_this.state, _this.svg)
        if(_this.state.current < _this.state.svgLog.length-1){
          let val = _this.state.svgLog[_this.state.current+1]
          d3.xml(val)
            .then(data => {
              let tmp = data.getElementsByTagName('g')[0]
              //console.log(tmp)
              d3.select("#new").remove()
              d3.select('#viz').node().append(tmp)
              _this.svg = d3.select("#new")
              //console.log("svg",_this.svg)
              _this.svg.selectAll('*').each(function(d, i){
                d3.select(this).call(_this.drag(d3.select(this)))
              })
            })
          _this.state.current++
        }
        
      }

      if (e.ctrlKey && key == 66){ // Ctrl+B 禁用zoom 开启brush
        // 先禁用zoom
        d3.select("#viz").on("mousedown.zoom", null).on("wheel.zoom", null)
        //console.log(_this.x) // 想办法输出当前坐标轴的左上角坐标
        // 启用brush
        _this.brush = d3.select("#viz").append("g").attr("class", "brush")
        //console.log(_this.brush.select(".selection"))
        _this.brush.call(d3.brush()
                  .extent([[0, 0], [_this.canvas_width, _this.canvas_height]])
                  // .on("start brush end", _this.brushed)
                  .on("start", _this.brushstarted)
                  .on("brush", _this.brushed) //brush
                  .on("end", _this.brushended) //关闭brush 开启zoom
                  )
        _this.done()
      }
    }
    this.$common.setBrowserTitle("new")
    this.queryBackendData()
    this.svg = d3.select("#viz").append("g").attr("id", "new")
    this.gx = d3.select("#viz").append("g").call(this.xAxis, this.x, {'x':0, 'y':0})
    this.gy = d3.select("#viz").append("g").call(this.yAxis, this.x, {'x':0, 'y':0})
    this.zoom = d3.zoom().scaleExtent([0.4, 8]).on("zoom", this.zoomed)
    d3.select("#viz").call(this.zoom).on("dblclick.zoom", null)
    this.$experience.saveLog(this.state, this.svg)
  },
  methods: {
    brushstarted(event){
      this.done()
    },
    brushed(event){
      this.combined = this.$experience.brushed(event, this.svg)
    },
    brushended(event){
      // console.log("combined",this.combined)
      let _this = this
      this.svg.append("g").attr("dom_type", 'g').attr("id", "control")
      //试一下放在一起id control class 原id
      this.combined.forEach(d => {
        let c = document.getElementById(d)
        document.getElementById("control").appendChild(c)
      })
      d3.select('#control').selectAll("*").each(function(d){
        if(_this.major_elms.includes(d3.select(this).attr("dom_type")) || d3.select(this).attr("dom_type")=== 'data'){
          // console.log("this", d3.select(this))
          let id = d3.select(this).attr("id")
          d3.select(this).attr("class", id).attr("id", "control").call(_this.drag(d3.select(this)))
        }
        
      })
      //结束brush 恢复zoom
      d3.select('.brush').remove()
      d3.select("#viz").call(this.zoom).on("dblclick.zoom", null)
    },
    zoomed(event) {
      const {transform} = event
      this.transform = transform
      this.major_elms.forEach((elm) => {
        d3.selectAll(elm).call(g => g.attr("transform", transform))
      })
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
          // console.log(data.documentElement)
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
        this.stroke_width = 5,
        this.select_mode = 'path'
      }else if(item.symbol == 'polygon'){
        this.polygon_points = ''
        this.select_mode = 'polygon'
      }else if(item.symbol == 'circle'){
        this.circle_r_x = ''
        this.circle_r_y = ''
        this.select_mode = 'circle'
      }else if(item.symbol == 'rectangle'){
        this.rec_height = ''
        this.rec_width = ''
        this.rec_points = ''
        this.select_mode = 'rectangle'
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
          // this.items = [JSON.parse(pako.inflate(window.atob(response.data.content[0]), { to: 'string' }))]
          this.items = response.data.content
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
          let that = this
          d3.xml(response.data.content.content)
          .then(data => {
            let instance_id = item.symbol+"NewInstance"+this.instance_num
            this.instance_num = this.instance_num + 1
            let tmp = data.getElementsByTagName('g')[0]
            tmp.setAttribute("id", instance_id)
            tmp.setAttribute("dom_type", 'g')
            tmp.setAttribute("class", that.is_viewer === true ? "hardware_environment" : null)
            d3.select('#new').node().append(tmp)

            that.major_elms.forEach((elm) => {
              d3.select('#'+instance_id).selectAll(elm).call(g => g.attr("id", instance_id).call(this.drag(g)))
              d3.select('#'+instance_id).selectAll(elm).call(g => g.attr("transform", that.transform))
            })
            d3.select('#'+instance_id).selectAll(".data").each(function(d, i) {
              if (d3.select(this).attr("id").split("@").length > 1){
                d3.select(this).attr("id", d3.select(this).attr("id").split("@")[1])
              }
            })
          })
        })
    },
    createPath() {
      let id = this.$common.generateUUID()
      this.svg.append('path')
        .attr("id", id)
        .attr("d", this.path_points) //'M50 150Q300 50 300 150T450 150'
        .attr("dom_type", 'path')
        .attr("transform", this.transform)
        .style("fill", 'none')
        .style('stroke', this.hexa)
        .style('stroke-width', this.stroke_width)
        .call(this.drag(this.svg))
      this.$experience.saveLog(this.state, this.svg)
    },
    createPolygon() { // 100,100 100,400 300,400 300,100
      this.svg.append("polygon")
        .attr("id", this.$common.generateUUID())
        .attr("dom_type", 'polygon')
        .attr("points", this.polygon_points)
        .attr("transform", this.transform)
        .style("fill", "none")
        .style('stroke', this.hexa)
        .style('stroke-width', this.stroke_width)
        .call(this.drag(this.svg))
      this.$experience.saveLog(this.state, this.svg)
    },
    createCircle() {
      if(this.circle_r_x || this.circle_r_y){
        if(!this.circle_r_y){
          this.circle_r_y = this.circle_r_x
        } else if(!this.circle_r_x){
          this.circle_r_x = this.circle_r_y
        }
        this.svg.append("ellipse")
        .attr("id", this.$common.generateUUID())
        .attr("dom_type", 'circle')
        .attr("cx", this.canvas_width / 2)
        .attr("cy", this.canvas_height / 2)
        .attr('rx',this.circle_r_x)
        .attr('ry',this.circle_r_y)
        .attr("transform", this.transform)
        .style("fill", 'none')
        .style("stroke", this.hexa)
        .style("stroke-width", this.stroke_width)
        .call(this.drag(this.svg))
      this.$experience.saveLog(this.state, this.svg)
      }
      
    },
    createRec() {
      if (this.rec_height && this.rec_width){
        let x = (this.canvas_width / 2) - (this.rec_width / 2)
        let y = (this.canvas_height / 2) - (this.rec_height / 2)
        this.rec_points = x+','+y+' '+
                          (parseInt(x)+parseInt(this.rec_width))+','+y+' ' +
                          (parseInt(x)+parseInt(this.rec_width))+','+(parseInt(y)+parseInt(this.rec_height))+' '+
                          x+','+(parseInt(y)+parseInt(this.rec_height))
        this.svg.append("polygon")
          .attr("id", this.$common.generateUUID())
          .attr("dom_type", 'rectangle')
          .attr("points", this.rec_points)
          .attr("transform", this.transform)
          .style("fill", 'none')
          .style("stroke", this.hexa)
          .style("stroke-width", this.stroke_width)
          .call(this.drag(this.svg))
        this.$experience.saveLog(this.state, this.svg)
      }
      
      // if (this.rec_height && this.rec_width){
      //   let x = (this.canvas_width / 2)
      //   let y = (this.canvas_height / 2)
      //   this.svg.append("rect")
      //     .attr("id", this.$common.generateUUID())
      //     .attr("dom_type", 'rectangle')
      //     .attr("x", x)
      //     .attr("y", y)
      //     .attr("width", this.rec_width)
      //     .attr("height", this.rec_height)
      //     .attr("transform", this.transform)
      //     .style("fill", 'none')
      //     .style("stroke", this.hexa)
      //     .style("stroke-width", this.stroke_width)
      //     .call(this.drag(this.svg))
      //   this.$experience.saveLog(this.state, this.svg)
      // }
    },
    createText() {
      this.svg.append("text")
        .attr("id", this.$common.generateUUID())
        .attr("dom_type", 'text')
        .attr("x", this.canvas_width / 2)
        .attr("y", this.canvas_height / 2)
        .attr("fill", this.hexa)
        .attr("transform", this.transform)
        .attr("font-size", this.font_size)
        // .attr("font-weight", "bold")
        .text(this.text)
        .call(this.drag(this.svg))
      this.$experience.saveLog(this.state, this.svg)
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
        this.svg.append("foreignObject")
          .attr("id", uuid)
          .attr("dom_type", 'data')
          .attr("x", this.canvas_width / 2)
          .attr("y", this.canvas_height / 2)
          .attr("width", 600)
          .attr("height", 400)
          .attr("transform", this.transform)
        .html('<div class="data"'+content+' xmlns="http://www.w3.org/1999/xhtml" style="background:yellow;width: 600px;height:400px;">')
        .call(this.drag(this.svg))
        // echarts.init(document.getElementById(uuid+'_'+data['id'])).setOption(data['value'])
      }else{
        this.svg.append("foreignObject")
          .attr("id", uuid)
          .attr("dom_type", 'data')
          .attr("x", this.canvas_width / 2)
          .attr("y", this.canvas_height / 2)
          .attr("width", 150)
          .attr("height", 50)
          .attr("transform", this.transform)
        .html('<div class="data"'+content+' xmlns="http://www.w3.org/1999/xhtml"> <span '+content+' style="color: '+this.hexa+'">'+this.data['id']+'</span> </div>')
        .call(this.drag(this.svg))
      }
      this.$experience.saveLog(this.state, this.svg)
    },
    createCustomData(){
      let uuid = this.$common.generateUUID()
      let content = ' id='+uuid+' value='+window.btoa('content')+' mode='+window.btoa('normal')
      this.svg.append("foreignObject")
        .attr("id", uuid)
        .attr("dom_type", 'data')
        .attr("x", this.canvas_width / 2)
        .attr("y", this.canvas_height / 2)
        .attr("width", 150)
        .attr("height", 50)
        .attr("transform", this.transform)
      .html('<div class="data"'+content+' xmlns="http://www.w3.org/1999/xhtml"> <span '+content+' style="color: '+this.hexa+'"> '+uuid+":"+"content"+' </span> </div>')
      .call(this.drag(this.svg))
    },
    updateColor(){
      if (this.elm !== ''){
        if(this.elm.attr("dom_type") === 'text'){
          this.elm.attr("fill", this.hexa+this.opt)
        }else if(this.elm.attr("dom_type") === 'data'){
          this.elm.select('span').attr("style", "color: "+this.hexa+this.opt)
        }else{
          this.elm.style("stroke", this.hexa+this.opt)
        }
        this.$experience.saveLog(this.state, this.svg)
      }
    },
    updateScale(){
      if (this.elm !== ''){
        this.$experience.updateScale(this.elm, 1, 1, this.s_scale, this.s_width, this.s_height, this.font_size, this.path_points, this.polygon_points, this.rec_points, this.rec_width, this.rec_height, this.circle_r_x, this.circle_r_y)
        //this.done()
        this.$experience.saveLog(this.state, this.svg)
      }
    },
    updateScaleOfW(){
      if (this.elm !== ''){
        this.$experience.updateScale(this.elm, 1, 0, this.s_scale, this.s_width, this.s_height, this.font_size, this.path_points, this.polygon_points, this.rec_points, this.rec_width, this.rec_height, this.circle_r_x, this.circle_r_y)
        this.$experience.saveLog(this.state, this.svg)
      }
    },
    updateScaleOfH(){
      if (this.elm !== ''){
        this.$experience.updateScale(this.elm, 0, 1, this.s_scale, this.s_width, this.s_height, this.font_size, this.path_points, this.polygon_points, this.rec_points, this.rec_width, this.rec_height, this.circle_r_x, this.circle_r_y)
        this.$experience.saveLog(this.state, this.svg)
      }
    },
    updateStrokeWidth(){
      if (this.elm !== ''){
        this.elm.style("stroke-width", this.stroke_width)
        this.$experience.saveLog(this.state, this.svg)
      }
    },
    startRotate(){
      if (this.elm !== ''){
        this.$experience.Rotate(this.elm, this.rotate, this.canvas_width, this.canvas_height)
        this.$experience.saveLog(this.state, this.svg)
      }
    },
    updatePath(){
      if (this.elm !== ''){
        this.elm.attr("d", this.path_points)
        this.$experience.saveLog(this.state, this.svg)
      }else{
        this.createPath()
      }
    },
    updatePolygon(){
      if (this.elm !== ''){
        this.elm.attr("points", this.polygon_points)
        this.$experience.saveLog(this.state, this.svg)
      }else{
        this.createPolygon()
      }
    },
    updateCircle(){
      if (this.elm !== ''){
        this.elm.attr("rx", this.circle_r_x)
                .attr("ry", this.circle_r_y)
        this.$experience.saveLog(this.state, this.svg)
      }else{
        this.createCircle()
      }
    },
    updateRec(){
      if (this.elm !== ''){
        let x = (this.canvas_width / 2) - (this.rec_width / 2)
        let y = (this.canvas_height / 2) - (this.rec_height / 2)
        this.rec_points = x+','+y+' '+
                          (parseInt(x)+parseInt(this.rec_width))+','+y+' ' +
                          (parseInt(x)+parseInt(this.rec_width))+','+(parseInt(y)+parseInt(this.rec_height))+' '+
                          x+','+(parseInt(y)+parseInt(this.rec_height))
        this.elm.attr("points", this.rec_points)
        // this.elm.attr("width", this.rec_width)
        //         .attr("height", this.rec_height)
        this.$experience.saveLog(this.state, this.svg)
      }else{
        this.createRec()
      }
    },
    updateText(){
      if (this.elm !== ''){
        this.elm.text(this.text)
        this.$experience.saveLog(this.state, this.svg)
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
        this.$experience.saveLog(this.state, this.svg)
      }
    },
    deleteElm() {
      if (this.elm !== ''){
        this.elm.remove()
        this.elm = ''
        this.select_mode = ''
        this.$experience.saveLog(this.state, this.svg)
      }
    },
    done() {
      if (this.elm !== ''){
        this.boxSelection(this.elm, false)
      }
      this.elm = ''
      this.select_mode = ''
      if (this.combined.length){
        this.combined.forEach(d => {
          let c = document.getElementsByClassName(d)[0]
          c.setAttribute("id", c.getAttribute("class"))
          document.getElementById("new").appendChild(c)
        })
      }
      d3.select("#control").remove()
      this.combined = []
    },
    async save(){
      await this.done()
      await d3.select("#new").selectAll("*").attr("transform", null)
      this.$emit('saveToServer', d3.select("#new"))
    },
    log(){
      // console.log(d3.select("#interactive\.layer"))
      console.log(d3.select("#new").node())
    },
    expression(){
      this.dialogExpression = true
    },
    checkExpression(){
      if (this.elm !== ''){
        let data = {}
        if (this.express.search("$") !== -1) {
          data = this.elm.node().getElementsByTagName('span')[0]
          data.setAttribute("expression", window.btoa(this.express))
          data.innerHTML = data.getAttribute('id') + ":" + this.express
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
      this.select_mode=''
      this.elm=''
      this.transform='translate(0,0) scale(1)'
      d3.select("#new").selectAll("*").remove()
      d3.select("#viz").call(this.zoom.transform, d3.zoomIdentity)
    },
    drag(elm) {
      let that = this
      function dragstarted(event) {
        if (that.elm !== ''){
          that.done()
        }
        if (d3.select(this.parentNode).attr("dom_type") === "g" && d3.select(this).attr("dom_type") !== "data"){
          if (that.is_viewer === true){
            that.select_mode = 'viewer'
            that.selected_hardware_environment = d3.select("#"+d3.select(this).attr("id")).attr("hardware_environment_name")
          }
        }else{
          if (d3.select(this).attr("dom_type") === 'polygon') {
            that.select_mode = 'polygon'
            that.hexa = that.$common.colorRGBtoHex(d3.select(this).style("stroke"))
            that.polygon_points = d3.select(this).attr("points")
          }else if(d3.select(this).attr("dom_type") === 'circle'){
            that.hexa = that.$common.colorRGBtoHex(d3.select(this).style("stroke"))
            that.select_mode = 'circle'
            that.circle_r_x = d3.select(this).attr("rx")
            that.circle_r_y = d3.select(this).attr("ry")
          }else if (d3.select(this).attr("dom_type") === 'rectangle'){
            that.select_mode = 'rectangle'
            that.hexa = that.$common.colorRGBtoHex(d3.select(this).style("stroke"))
            that.rec_points = d3.select(this).attr("points")
            // that.rec_width = d3.select(this).attr("width")
            // that.rec_height = d3.select(this).attr("height")
          }else if(d3.select(this).attr("dom_type") === 'text'){
            that.hexa = d3.select(this).attr("fill")
            that.select_mode = 'text'
            that.text = d3.select(this).text()
          }else if(d3.select(this).attr("dom_type") === 'path'){
            that.hexa = that.$common.colorRGBtoHex(d3.select(this).style("stroke"))
            that.select_mode = 'path'
            that.path_points = d3.select(this).attr("d")
          }else if(d3.select(this).attr("dom_type") === 'data'){
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
        if (that.is_viewer === true){
          that.elm = d3.select("#"+d3.select(this).attr("id"))
          that.boxSelection(d3.select("#"+d3.select(this).attr("id")), true)
        }else{
          that.elm = d3.select(this)
          setTimeout(() =>{
            that.boxSelection(d3.select(this), true)
          },100)
        }
      }
      function dragged(event) {
        let scale_event = {}
        let k = that.transform === 'translate(0,0) scale(1)' ? 1 : that.transform.k
        scale_event['dx'] = parseInt(event.dx / k)
        scale_event['dy'] = parseInt(event.dy / k)
        if (d3.select(this.parentNode).attr("dom_type") === "g"){
          d3.select("#"+d3.select(this).attr("id")).selectAll("*").select(function() {
            if(d3.select(this).attr("dom_type") !== "g"){
              return this
            }
          }).each(function(d, i) {
              that.render(d3.select(this), scale_event)
          })
        }else{
          that.render(d3.select(this), scale_event)
        }
      }
      function dragended(event) { // 
        if (d3.select(this).attr("dom_type") === 'polygon') {
          that.polygon_points = d3.select(this).attr("points")
        }else if(d3.select(this).attr("dom_type") === 'rectangle'){
          that.rec_points = d3.select(this).attr("points")
          // that.rec_width = d3.select(this).attr("width")
          // that.rec_height = d3.select(this).attr("height")
        }else if(d3.select(this).attr("dom_type") === 'circle'){
          that.circle_r_x = d3.select(this).attr("rx")
          that.circle_r_y = d3.select(this).attr("ry")
        }else if(d3.select(this).attr("dom_type") === 'text'){
          that.text = d3.select(this).text()
        }else if(d3.select(this).attr("dom_type") === 'path'){
          that.path_points = d3.select(this).attr("d")
        }
        that.$experience.saveLog(that.state, that.svg)
      }
      return d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
    },
    dragElements(){
      this.major_elms.forEach((elm) => {
        d3.selectAll(elm).call(g => g.call(this.drag(g)))
      })
    },
    boxSelection(elm, flag){// original
      this.s_flag = false
      let that = this
      if (elm.attr("dom_type") === 'polygon') {
        elm.style("stroke", flag == true ? this.$common.colorRGBtoHex(elm.style("stroke"))+this.opt : this.$common.colorRGBtoHex(elm.style("stroke")).slice(0,7))
      }else if(elm.attr("dom_type") === 'path'){
        elm.style("stroke", flag == true ? this.$common.colorRGBtoHex(elm.style("stroke"))+this.opt : this.$common.colorRGBtoHex(elm.style("stroke")).slice(0,7))
      }else if(elm.attr("dom_type") === 'circle'){
        elm.style("stroke", flag == true ? this.$common.colorRGBtoHex(elm.style("stroke"))+this.opt : this.$common.colorRGBtoHex(elm.style("stroke")).slice(0,7))
      }else if (elm.attr("dom_type") === 'rectangle') {
        elm.style("stroke", flag == true ? this.$common.colorRGBtoHex(elm.style("stroke"))+this.opt : this.$common.colorRGBtoHex(elm.style("stroke")).slice(0,7))
      }else if(elm.attr("dom_type") === 'text'){
        elm.attr("fill", flag == true ? elm.attr("fill")+this.opt : elm.attr("fill").slice(0,7))
      }else if(elm.attr("dom_type") === 'data'){
        if(elm.node().getElementsByTagName('span').length > 0){
          elm.select('span').attr("style", flag == true ? "color: "+elm.select('span').attr("style").split(" ")[1]+this.opt : "color: "+elm.select('span').attr("style").split(" ")[1].slice(0,7))
        }
      }else if(elm.attr("dom_type") === 'g'){
        elm.selectAll('*').select(function() {
          if(d3.select(this).attr("dom_type") !== "g"){
            return this
          }
        }).each(function(d, i) {
          that.boxSelection(d3.select(this), flag)
        })
      }
    },
    render(element, event) {
      if (element.attr("dom_type") === 'polygon' || element.attr("dom_type") === 'rectangle') {
        let points = element.attr("points").split(" ")
        let result = []
        points.forEach((point) => {
          result.push((parseInt(point.split(",")[0]) + event.dx).toString()+','+(parseInt(point.split(",")[1]) + event.dy).toString())
        })
        element.attr("points", result.join(' '))
      }else if(element.attr("dom_type") === 'path'){
        let points = element.attr("d").match(/([0-9+-]+ [0-9+-]+|[A-Za-z])/g)
        let result = []
        points.forEach((point) => {
          if (point.length > 1){
            result.push((parseInt(point.split(" ")[0]) + event.dx).toString()+' '+(parseInt(point.split(" ")[1]) + event.dy).toString() + " ")
          }else{
            result.push(point)
          }
        })
        element.attr("d", result.join(''))
      }
      // else if(element.attr("dom_type") === 'rectangle'){
      //   element.attr("x", parseInt(element.attr("x"))+event.dx)
      //           .attr("y", parseInt(element.attr("y"))+event.dy)
      // }
      else if(element.attr("dom_type") === 'circle'){
        element.attr("cx", parseInt(element.attr("cx"))+event.dx)
                .attr("cy", parseInt(element.attr("cy"))+event.dy)
      }else if(element.attr("dom_type") === 'text'){
        element.attr("x", parseInt(element.attr("x"))+event.dx)
                .attr("y", parseInt(element.attr("y"))+event.dy)
      }else if(element.attr("dom_type") === 'data'){
        element.attr("x", parseInt(element.attr("x"))+event.dx)
                .attr("y", parseInt(element.attr("y"))+event.dy)
      }
    },
    coverToList(){
      let tmp = []
      JSON.stringify(this.hardware_environment_list).match(/\"name\":\"(.*?)\"/g).forEach((elm) => {
        tmp.push(elm.split(":")[1].replace(/\"/g,''))
      })
      return tmp
    },
    syncHardwareEnvironment(){
      this.hardware_environment_list.forEach((e) => {
        if (e['name'] === this.selected_hardware_environment) {
          this.elm.attr("hardware_environment_id", e['id'])
          this.elm.attr("hardware_environment_name", e['name'])
        }
      })
    },
    async runOrStop(){
      if(this.run_flag === false){
        let that = this
        this.run_flag = true
        this.interval = setInterval(function() {
          d3.selectAll(".hardware_environment").each(function(d, i) {
            let tmp = []
            let hardware = this
            let formData = new FormData()
            formData.append("username", that.username)
            formData.append("operate", "hardware_environment_save_config")
            formData.append("sid", d3.select(this).attr("hardware_environment_id"))
            formData.append("docid", 'a0fd644a734be4a00d86e9e917e3d51a')

            d3.select(hardware).selectAll("span").each(function(d, i) {
              let data = d3.select(this).node()
              if (data.getAttribute('expression') !== null) {
                tmp = tmp.concat(that.$common.getRootVar(data.getAttribute("expression")))
              }else{
                tmp.push(data.getAttribute("id"))
              }
            })
            formData.append("key", that.$common.dedupe(tmp).join(','))
            formData.append("addr_map", 'x:0x1090000000 + (x&0xFFFFFFF)')
            let config = {
              headers: {
              'Content-Type': 'multipart/form-data'
              }
            }
            axios.post(that.url_post_config_read_data, formData, config).then(
              (response)=>{
                let he = response.data.content

                d3.select(hardware).selectAll("span").each(function(d, i) {
                  let data = d3.select(this).node()
                  if (data.getAttribute('expression') === null && data.getAttribute('mode') === null){
                    data.setAttribute("value", window.btoa(he[data.getAttribute("id")]))
                    data.innerHTML = data.getAttribute("id")+":"+he[data.getAttribute("id")]
                  }else if(data.getAttribute('expression').search("$") === -1) {
                    let temp = that.$common.calExpressDepend(data.getAttribute('expression'), he)
                    data.setAttribute("value", window.btoa(temp))
                    data.innerHTML = data.getAttribute("id")+":"+temp
                  }else if(data.getAttribute('expression').search("$") !== -1 ) {
                    let expression = window.atob(data.getAttribute('expression'))
                    let vars = expression.match(/(\$\{(.*?)\})/g)
                    if (vars !== null) {
                      vars.forEach((v) => {
                        expression = expression.replace(v, that.$common.calExpressDepend(window.btoa(v.replace('$','').replace('{','').replace('}','')), he))
                      })
                      data.setAttribute("value", window.btoa(expression))
                      data.innerHTML = expression
                    }else{
                      let temp = that.$common.calExpressDepend(data.getAttribute('expression'), he)
                      data.setAttribute("value", window.btoa(temp))
                      data.innerHTML = data.getAttribute("id")+":"+temp
                    }
                  }
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
        this.elm.node().getElementsByTagName('span')[0].innerHTML = this.fill_id + ":" + this.fill_param
      }
    },
    async interactive(){
      let tmp = []

      let formData = new FormData()
      formData.append("username", this.username)
      formData.append("operate", "hardware_environment_save_config")
      formData.append("sid", "")
      formData.append("docid", 'a0fd644a734be4a00d86e9e917e3d51a')

      d3.selectAll("span").each(function(d, i) {
        let data = d3.select(this).node()
        if (window.atob(data.getAttribute("mode")) === 'interactive'){
          tmp.push([data.getAttribute("id"), window.atob(data.getAttribute("value"))])
        }
      })
      formData.append("key", JSON.stringify(tmp))

      let config = {
        headers: {
        'Content-Type': 'multipart/form-data'
        }
      }
      await axios.post(this.url_hardware_environment_read_data, formData, config).then(
        (response)=>{
        // this.items = response.data.content
      })
    },
  },
}
</script>


