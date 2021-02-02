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
              v-col(class="pa-2")
                v-text-field(v-model="data_type" label="Type" disabled dense)
                v-text-field(v-model="data_id" label="Id" disabled dense)
                v-text-field(v-model="data_name" label="Name" dense @keyup.enter="updateData")
                v-text-field(v-model="data_range" label="Range" disabled dense)
                template(v-if="data_type === 'list'")
                  v-combobox(v-model="data_value" :items='data_range.split(",")' dense outlined @change="updateData")
                template(v-else)
                  v-text-field(v-model="data_value" label="Value" dense @keyup.enter="updateData")
          template(v-else-if="select_mode === 'viewer'")
            v-row(class="d-flex justify-center")
              v-col(class="pa-2")
                v-combobox(v-model="selected_hardware_environment" :items='coverToList()' label="Hardware environment select" dense outlined @change="syncHardwareEnvironment")
          v-row
            v-color-picker(v-model="hexa" hide-inputs class="ma-2" @update:color="updateColor")
        v-dialog(v-model='dialogDataBind', dark, max-width="800px")
          v-card
            v-container
              v-row
                v-text-field(v-model="url_hardware_environment_editable_data" label="bind data url" dense outlined)
                v-btn(dark, text, @click="queryBackendData") REFRESH
              v-divider
              v-card
                v-treeview(:active.sync="bind_data" open-on-click rounded activatable :items="items")
        v-dialog(v-model='dialogViewerConfig', dark, max-width="800px")
          v-card
            v-container
              v-row
                v-text-field(v-model="url_hardware_environment_read_status" label="Api get hardware environment status" dense outlined)
              v-row
                v-text-field(v-model="url_hardware_environment_save_config" label="Api post config info" dense outlined)
              v-row
                v-text-field(v-model="url_hardware_environment_read_data" label="Api read data" dense outlined)
</template>

<script>
import * as d3 from 'd3'
import axios from 'axios'
import * as echarts from 'echarts'

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
      items: [],
      url_hardware_environment_editable_data: process.env.NODE_ENV === 'development' ? 'http://localhost:8000/ru/babel/get?operate=get_test_data' : 'http://10.166.152.49/ru/babel/get?operate=get_test_data',
      url_hardware_environment_read_status: process.env.NODE_ENV === 'development' ? 'http://localhost:8000/ru/babel/get?operate=hardware_environment_read_status' : 'http://10.166.152.49/ru/babel/get?operate=hardware_environment_read_status',
      url_hardware_environment_save_config: process.env.NODE_ENV === 'development' ? 'http://localhost:8000/ru/babel/save' : 'http://10.166.152.49/ru/babel/save',
      url_hardware_environment_read_data: process.env.NODE_ENV === 'development' ? 'http://localhost:8000/ru/babel/get' : 'http://10.166.152.49/ru/babel/get',
      selected_hardware_environment: '',
      run_flag: false,
      interval: '',
      dialogDataBind: false,
      dialogViewerConfig: false,
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
      data_type: '',
      data_id: '',
      data_name: '',
      data_range: '',
      data_value: '',
      select_mode: '',
      path_points: '',
      polygon_points: '',
      text: '',
      instance_num: 0,
      opt: '20',
      transform: 'translate(0,0) scale(1)',
    }
  },
  watch:{
    dialogDataBind(val) {
      if(val === false && this.bind_data.length > 0){
        // this.data_type = "List"
        this.createData()
      }
    },
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

      if (key== 46 || key== 8) { //Del or Backspace
        _this.deleteElm()
      }
    }
    this.$common.setBrowserTitle("new")
    this.queryBackendData()
    this.svg = d3.select("#viz").append("g").attr("id", "new")
    this.gx = d3.select("#viz").append("g").call(this.xAxis, this.x, {'x':0, 'y':0})
    this.gy = d3.select("#viz").append("g").call(this.yAxis, this.x, {'x':0, 'y':0})
    this.zoom = d3.zoom().scaleExtent([0.4, 8]).on("zoom", this.zoomed)
    d3.select("#viz").call(this.zoom).on("dblclick.zoom", null)
  },
  methods: {
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
        this.select_mode = 'data'
        this.dialogDataBind = true
      }else{
        this.addSymbolSvg(item)
      }
    },
    async queryBackendData(){
      await axios.get(this.url_hardware_environment_editable_data)
        .then(response => {
          this.items=response.data.content
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
              if (d3.select(this).attr("id").split("_").length > 1){
                d3.select(this).attr("id", d3.select(this).attr("id").split("_")[1])
              }
            })
          })
        })
    },
    createPath() {
      this.svg.append('path')
        .attr("id", this.$common.generateUUID())
        .attr("d", this.path_points) //'M50 150Q300 50 300 150T450 150'
        .attr("dom_type", 'path')
        .attr("transform", this.transform)
        .style("fill", 'none')
        .style('stroke', this.hexa)
        .style('stroke-width', 5)
        .call(this.drag(this.svg))
    },
    createPolygon() { // 100,100 100,400 300,400 300,100
      this.svg.append("polygon")
        .attr("id", this.$common.generateUUID())
        .attr("dom_type", 'polygon')
        .attr("points", this.polygon_points)
        .attr("transform", this.transform)
        .style("fill", "none")
        .style('stroke', this.hexa)
        .style('stroke-width', 5)
        .call(this.drag(this.svg))
    },
    createText() {
      this.svg.append("text")
        .attr("id", this.$common.generateUUID())
        .attr("dom_type", 'text')
        .attr("x", this.canvas_width / 2)
        .attr("y", this.canvas_height / 2)
        .attr("fill", this.hexa)
        .attr("transform", this.transform)
        // .attr("font-weight", "bold")
        .text(this.text)
        .call(this.drag(this.svg))
    },
    createData(){
      let data = this.$common.jsonSearchId(this.items, this.bind_data)
      let uuid = this.$common.generateUUID()
      if (data['type'] === 'echarts'){
        this.svg.append("foreignObject")
          .attr("id", uuid)
          .attr("dom_type", 'data')
          .attr("x", this.canvas_width / 2)
          .attr("y", this.canvas_height / 2)
          .attr("width", 600)
          .attr("height", 400)
          .attr("transform", this.transform)
        .html('<div class="data" id='+uuid+'_'+data['id']+' bind_name='+data['name']+' bind_value="Object" bind_type='+data['type']+' bind_range="[]" xmlns="http://www.w3.org/1999/xhtml" style="background:yellow;width: 600px;height:400px;">')
        .call(this.drag(this.svg))
        echarts.init(document.getElementById(uuid+'_'+data['id'])).setOption(data['value'])
      }else{
        this.svg.append("foreignObject")
          .attr("id", uuid)
          .attr("dom_type", 'data')
          .attr("x", this.canvas_width / 2)
          .attr("y", this.canvas_height / 2)
          .attr("width", 150)
          .attr("height", 50)
          .attr("transform", this.transform)
        .html('<div class="data" id='+uuid+'_'+data['id']+' bind_type='+data['type']+' xmlns="http://www.w3.org/1999/xhtml"> <span id='+uuid+'_'+data['id']+' bind_name='+data['name']+' bind_value='+data['value']+' bind_type='+data['type']+' bind_range='+data['range']+' style="color: '+this.hexa+'">'+data['name']+":"+data['value']+'</span> </div>')
        .call(this.drag(this.svg))
      }
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
      }
    },
    updatePath(){
      if (this.elm !== ''){
        this.elm.attr("d", this.path_points)
      }else{
        this.createPath()
      }
    },
    updatePolygon(){
      if (this.elm !== ''){
        this.elm.attr("points", this.polygon_points)
      }else{
        this.createPolygon()
      }
    },
    updateText(){
      if (this.elm !== ''){
        this.elm.text(this.text)
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
    deleteElm() {
      if (this.elm !== ''){
        this.elm.remove()
        this.elm = ''
        this.select_mode = ''
      }
    },
    done() {
      if (this.elm !== ''){
        this.boxSelection(this.elm, false)
      }
      this.elm = ''
      this.select_mode = ''
    },
    async save(){
      await this.done()
      await d3.select("#new").selectAll("*").attr("transform", null)
      this.$emit('saveToServer', d3.select("#new"))
    },
    log(){
      console.log(d3.select("#new").node())
      console.log(this.data_id)
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
        if (d3.select(this.parentNode).attr("dom_type") === "g"){
          if (that.is_viewer === true){
            that.select_mode = 'viewer'
            that.selected_hardware_environment = d3.select("#"+d3.select(this).attr("id")).attr("hardware_environment_name")
          }
          that.elm = d3.select("#"+d3.select(this).attr("id"))
          that.boxSelection(d3.select("#"+d3.select(this).attr("id")), true)
        }else{
          if (d3.select(this).attr("dom_type") === 'polygon') {
            that.select_mode = 'polygon'
            that.hexa = that.$common.colorRGBtoHex(d3.select(this).style("stroke"))
            that.polygon_points = d3.select(this).attr("points")
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
            if (d3.select(this).node().getElementsByTagName('span').length > 0){
              data = d3.select(this).node().getElementsByTagName('span')[0]
            }else{
              data = d3.select(this).node().getElementsByTagName('div')[0]
            }
            that.data_type = data.getAttribute("bind_type")
            that.data_id = data.getAttribute("id")
            that.data_name = data.getAttribute("bind_name")
            that.data_range = data.getAttribute("bind_range")
            that.data_value = data.getAttribute("bind_value")
            that.select_mode = 'data'
          }
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
      function dragended(event) {
        if (d3.select(this).attr("dom_type") === 'polygon') {
          that.polygon_points = d3.select(this).attr("points")
        }else if(d3.select(this).attr("dom_type") === 'text'){
          that.text = d3.select(this).text()
        }else if(d3.select(this).attr("dom_type") === 'path'){
          that.path_points = d3.select(this).attr("d")
        }
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
    boxSelection(elm, flag){
      let that = this
      if (elm.attr("dom_type") === 'polygon') {
        elm.style("stroke", flag == true ? this.$common.colorRGBtoHex(elm.style("stroke"))+this.opt : this.$common.colorRGBtoHex(elm.style("stroke")).slice(0,7))
      }else if(elm.attr("dom_type") === 'path'){
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
      if (element.attr("dom_type") === 'polygon') {
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
        let result = []
        d3.selectAll(".hardware_environment").each(function(d, i) {
          let tmp = {'hardware_environment_id': d3.select(this).attr("hardware_environment_id"),
                    'hardware_environment_name': d3.select(this).attr("hardware_environment_name"),'data': []}
          d3.select(this).selectAll('.data').each(function(d, i) {
            tmp.data.push(d3.select(this).attr("id"))
          })
          result.push(tmp)
        })
        let formData = new FormData()
        formData.append("username", this.username)
        formData.append("operate", "hardware_environment_save_config")
        formData.append("content", JSON.stringify(result))
        let config = {
          headers: {
          'Content-Type': 'multipart/form-data'
          }
        }

        await axios.post(this.url_hardware_environment_save_config, formData, config).then(
          (response)=>{
            this.run_flag = true
            let that = this
            this.interval = setInterval(function() {
              axios.get(that.url_hardware_environment_read_data, {
              params: {
                username: that.username,
                operate: 'hardware_environment_read_data',
              },
              })
              .then(response => {
                let he = response.data.content
                he.forEach((data) => {
                  let tmp = ''
                  d3.selectAll(".hardware_environment").each(function(d, i) {
                    if (d3.select(this).attr("hardware_environment_name") === data['hardware_environment_name']) {
                      tmp = d3.select(this)
                    }
                  })
                  data['data'].forEach((elm) => {
                    tmp.selectAll("#"+elm['id']).each(function(d, i) {
                      if(d3.select(this).attr("bind_type") === "echarts"){
                          echarts.init(d3.select(this).node()).setOption(elm['value'])
                      }else{
                        let data = d3.select(this).node().getElementsByTagName('span')[0]
                        data.setAttribute("bind_value", elm['value'])
                        data.innerHTML = data.getAttribute("bind_name")+":"+elm['value']
                      }
                    })
                  })
                })
              })
            },3000)
        }, (error) => {
          console.log(error)
        })
      }else{
        clearInterval(this.interval)
        this.run_flag = false
      }
    }
  },
}
</script>
