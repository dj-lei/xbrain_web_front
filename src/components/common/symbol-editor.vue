<template lang="pug">
  v-container
    //- v-card(class="d-flex justify-start mb-6")
    //-   v-toolbar(dark)
    //-     v-btn(icon, dark, @click="$emit('dialogClose')")
    //-       v-icon mdi-close
    //-     v-toolbar-title Symbol Edit
    //-     v-spacer
    //-     v-btn(dark, text, @click="log") LOG
    //-     v-btn(dark, text, @click="save") SAVE
    v-card(class="d-flex justify-center mb-6")
      v-card(class="pa-2" dark)
        v-sheet(width="200")
          v-list(dense class="grow")
            v-list-item(v-for="(tool, j) in tools_category" :key="j")
              v-list-group
                template(v-slot:activator="")
                  v-list-item-title {{ tool.title }}
                v-list-item-group(color="success")
                  v-list-item(v-for="(item, i) in tool.symbols" :key="item.id" @click="selected_item(item)")
                    v-list-item-title(v-text="item.symbol")
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
            template(v-if="select_mode !== 'data'")
              v-row
                v-color-picker(v-model="hexa" hide-inputs class="ma-2" @update:color="updateColor")
            template(v-else-if="select_mode === 'data'")
              v-row(class="d-flex justify-center")
                v-col(class="pa-2")
                  v-text-field(v-model="data_type" label="Type" disabled dense)
                  v-text-field(v-model="data_id" label="Id" disabled dense)
                  v-text-field(v-model="data_name" label="Name" disabled dense)
                  v-text-field(v-model="data_range" label="Range" disabled dense)
                  template(v-if="data_type === 'list'")
                    v-combobox(v-model="data_value" :items='data_range.split(",")' dense outlined @change="updateData")
                  template(v-else)
                    v-text-field(v-model="data_value" label="Value" dense @keyup.enter="updateData")
            v-dialog(v-model='dialogBind', dark, max-width="800px")
              v-card
                v-treeview(:active.sync="bind_data" open-on-click rounded activatable :items="items")
</template>

<script>
import * as d3 from 'd3'
import CryptoJS from 'crypto-js'

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
  },
  data () {
    return {
      items: [
        {
          id: 1,
          name: 'Applications :',
          children: [
            { id: 2, name: 'Calendar', value:'kk1', type:'string', range:'""'},
            { id: 3, name: 'Chrome', value:15, type:'int', range:[1,20] },
            { id: 4, name: 'Webstorm', value:'a', type:'list', range:['a','b','c'] },
          ],
        },
        {
          id: 5,
          name: 'Documents :',
          children: [
            {
              id: 6,
              name: 'vuetify :',
              children: [
                {
                  id: 7,
                  name: 'src :',
                  children: [
                    { id: 8, name: 'index' , value:'kk1', type:'string', range:''},
                    { id: 9, name: 'bootstrap' , value:'kk1', type:'string', range:''},
                  ],
                },
              ],
            },
          ],
        },
      ],
      dialogBind: false,
      hexa: '#FF00FF',
      canvas_width: 950,
      canvas_height: 690,
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
      label: '',
      bind_data: [],
      data_type: '',
      data_id: '',
      data_name: '',
      data_range: '',
      data_value: '',
      selected : false,
      select_mode: '',
      unique_name: '',
      path_points: '',
      polygon_points: '',
      text: '',
      opacity: '30',
      instance_num: 0,
      instances: [],
    }
  },
  watch:{
    dialogBind(val) {
      if(val === false && this.bind_data !== []){
        this.data_type = "List"
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

    if (this.flagUpdateOrAdd === true){
      d3.xml(this.svg_content)
      .then(data => {
        // console.log(data.documentElement)
        let tmp = data.getElementsByTagName('g')[0]
        d3.select('#viz').node().append(tmp)
        this.svg = d3.select("#new")

        d3.selectAll('path').call(g => g.call(this.drag(g)))
        d3.selectAll('polygon').call(g => g.call(this.drag(g)))
        d3.selectAll('text').call(g => g.call(this.drag(g)))
        d3.selectAll('foreignObject').call(g => g.call(this.drag(g)))
        d3.select("#viz").append("g").call(this.xAxis)
        d3.select("#viz").append("g").call(this.yAxis)
      })
    }else{
      this.gx = d3.select("#viz").append("g")
      this.gy = d3.select("#viz").append("g")

      this.svg = d3.select("#viz").append("g").attr("id", "new")
      this.zoom = d3.zoom().scaleExtent([1, 8]).on("zoom", this.zoomed)
      d3.select("#viz").call(this.zoom)
    }
  },
  methods: {
    zoomed(event) {
      const {transform} = event
      d3.selectAll('path').call(g => g.attr("transform", transform))
      d3.selectAll('polygon').call(g => g.attr("transform", transform))
      d3.selectAll('text').call(g => g.attr("transform", transform))
      d3.selectAll('foreignObject').call(g => g.attr("transform", transform))
      d3.selectAll('rect').call(g => g.attr("transform", transform))
      this.gx.call(this.xAxis, transform.rescaleX(this.x), transform)
      this.gy.call(this.yAxis, transform.rescaleY(this.y), transform)
    },
    selected_item(item){
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
        this.dialogBind = true
      }else{
        this.addSymbolSvg(item)
      }
    },
    xAxis(g, x, transform){
      g.attr("transform", `translate(${-transform.x},${-transform.y+this.margin.top})`)
      .attr("class", "tick")
      .call(d3.axisTop(x).ticks(null, "f"))
      .call(g => g.selectAll("line").remove())
      // .call(d3.axisTop(x.copy().interpolate(d3.interpolateRound)).ticks(null, "f"))
      // .call(g => g.select(".domain").remove())
      // .call(g => g.selectAll(".tick line").clone()
      //     .attr("stroke-opacity", 0.1)
      //     .attr("y1", this.canvas_height))
    },
    yAxis(g, y, transform){
      g.attr("transform", `translate(${-transform.x + this.margin.left - 10},${-transform.y})`)
      .attr("class", "tick")
      .call(d3.axisLeft(y).ticks(null, "f"))
      .call(g => g.selectAll("line").remove())
      // .call(d3.axisLeft(y.copy().interpolate(d3.interpolateRound)))
      // .call(g => g.select(".domain").remove())
      // .call(g => g.selectAll(".tick line").clone()
      //     .attr("stroke-opacity", 0.1)
      //     .attr("x1", this.canvas_width))
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
          this.elm = response.data.content.content
          d3.xml(this.elm)
          .then(data => {
            let tmp = data.getElementsByTagName('g')[0]
            let instance_id = item.symbol+"NewInstance"+this.instance_num
            this.instance_num = this.instance_num + 1

            for (var i=0;i<tmp.childNodes.length;i++) {
              if(tmp.childNodes[i].nodeType==1){
                if(tmp.childNodes[i].hasChildNodes()){
                  var self_id = tmp.childNodes[i].getElementsByTagName('span')
                  if(self_id.length > 0){
                    tmp.childNodes[i].getElementsByTagName('span')[0].setAttribute("id", instance_id+'_'+self_id[0].getAttribute("id"))
                  }
                }
                tmp.childNodes[i].setAttribute("id", instance_id)
                tmp.childNodes[i].setAttribute("class", instance_id)
              }
            }
            tmp.setAttribute("id", instance_id)
            tmp.setAttribute("dom_type", 'g')
            d3.select('#viz').node().append(tmp)
            this.svg = d3.select("#new")
            d3.selectAll("."+instance_id).each(function(d, i) {
              d3.select(this).call(g => g.call(that.drag(g)))
            })
            this.elm = ''
          })
        })
    },
    updateColor(){
      if (this.elm !== ''){
        if(this.elm.attr("dom_type") === 'text'){
          this.elm.style("fill", this.hexa)
        }else{
          if (this.elm.style("stroke").length > 7){
            this.elm.style("stroke", this.hexa + this.opacity)
          }else{
            this.elm.style("stroke", this.hexa)
          }
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
      let data = document.getElementById(this.data_id)
      data.setAttribute("bind_value", this.data_value)
      data.innerHTML = this.data_name+":"+this.data_value
    },
    drag(elm) {
      let that = this
      function dragstarted(event) {
        if (that.elm !== ''){
          that.done()
        }

        if (d3.select(this.parentNode).attr("id") !== "new"){
          let tmp = document.getElementById(d3.select(this).attr("id")).getBBox()
          that.elm = d3.select(this.parentNode)
          that.elm.append("rect")
            .attr("class", d3.select(this).attr("id"))
            .attr("x", tmp.x)
            .attr("y", tmp.y)
            .attr("width", tmp.width)
            .attr("height", tmp.height)
            .attr("fill", "none")
            .attr("stroke", "#6CFFF6")
            .attr("stroke-width", 2)
          return
        }

        that.elm = d3.select(this)
        if (d3.select(this).attr("dom_type") === 'polygon') {
          that.hexa = that.colorRGBtoHex(d3.select(this).style("stroke"))
          that.select_mode = 'polygon'
          that.polygon_points = d3.select(this).attr("points")
          setTimeout(() =>{
            d3.select(this).style("stroke", that.colorRGBtoHex(d3.select(this).style("stroke")) + that.opacity)
          },100)
        }else if(d3.select(this).attr("dom_type") === 'text'){
          that.hexa = d3.select(this).attr("fill")
          that.select_mode = 'text'
          that.text = d3.select(this).text()
          d3.select(this)
            .style("stroke", "#000000FF")
            .style("stroke-width", 1)
        }else if(d3.select(this).attr("dom_type") === 'path'){
          that.hexa = that.colorRGBtoHex(d3.select(this).style("stroke"))
          that.select_mode = 'path'
          that.path_points = d3.select(this).attr("d")
          setTimeout(() =>{
            d3.select(this).style("stroke", that.colorRGBtoHex(d3.select(this).style("stroke")) + that.opacity)
          },100)
        }else{
          let data = d3.select(this).node().getElementsByTagName('span')[0]
          that.data_type = data.getAttribute("bind_type")
          that.data_id = data.getAttribute("id")
          that.data_name = data.getAttribute("bind_name")
          that.data_range = data.getAttribute("bind_range")
          that.data_value = data.getAttribute("bind_value")
          that.select_mode = 'data'
        }
      }
      function dragged(event) {
        if (d3.select(this.parentNode).attr("id") !== "new"){
          let tmp_id = d3.select(this).attr("id")
          d3.selectAll("."+tmp_id).each(function(d, i) {
            that.render(d3.select(this), event)
          })
        }else{
          that.render(d3.select(this), event)
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
        // d3.select(this).style("stroke", that.showColor);
      }
      return d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
    },
    done() {
      if (this.elm !== ''){
        if(this.elm.attr("dom_type") === 'text'){
          this.elm.style("stroke", "none")
            .style("stroke-width", 0)
        }else if(this.elm.attr("dom_type") === 'g'){
          this.elm.selectAll('rect').remove()
        }else if(this.elm.attr("dom_type") !== 'data'){
          this.elm.style("stroke", this.colorRGBtoHex(this.elm.style("stroke")).substring(0,7))
        }
      }
      this.elm = ''
      this.select_mode = ''
      this.selected = false
    },
    createPath() {
      this.svg.append('path')
        .attr("id", this.unique_name)
        .attr("d", this.path_points) //'M50 150Q300 50 300 150T450 150'
        .attr("dom_type", 'path')
        .style("fill", 'none')
        .style('stroke', this.hexa)
        .style('stroke-width', 5)
        .call(this.drag(this.svg))
    },
    createPolygon() { // 200,200 200,400 350,300
      this.svg.append("polygon")
        .attr("id", this.unique_name)
        .attr("dom_type", 'polygon')
        .attr("points", this.polygon_points)
        .style("fill", "none")
        .style('stroke', this.hexa)
        .style('stroke-width', 5)
        .call(this.drag(this.svg))
    },
    createText() {
      this.svg.append("text")
        .attr("id", this.unique_name)
        .attr("dom_type", 'text')
        .attr("x", this.canvas_width / 2)
        .attr("y", this.canvas_height / 2)
        .attr("fill", this.hexa)
        // .attr("font-weight", "bold")
        .text(this.text)
        .call(this.drag(this.svg))
    },
    createData(){
      let data = this.$common.jsonSearchId(this.items, this.bind_data)
      this.svg.append("foreignObject")
        .attr("id", "''")
        .attr("dom_type", 'data')
        .attr("x", this.canvas_width / 2)
        .attr("y", this.canvas_height / 2)
        .attr("width", 150)
        .attr("height", 50)
      .html('<div xmlns="http://www.w3.org/1999/xhtml"> <span id='+data['id']+' bind_name='+data['name']+' bind_value='+data['value']+' bind_type='+data['type']+' bind_range='+data['range']+' style="color: red">'+data['name']+":"+data['value']+'</span> </div>')
      .call(this.drag(this.svg))
    },
    deleteElm() {
      if (this.elm !== ''){
        this.elm.remove()
        this.elm = ''
      }
    },
    async save(){
      await d3.selectAll(".tick").remove()
      this.$emit('saveToServer', d3.select("#viz"))
    },
    colorRGBtoHex(color) {
      var rgb = color.split(',')
      var r = parseInt(rgb[0].split('(')[1])
      var g = parseInt(rgb[1])
      var b = parseInt(rgb[2].split(')')[0])
      var hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
      return hex
    },
    log(){
      let serializer = new XMLSerializer()
      let source = serializer.serializeToString(d3.select("#viz").node())
      console.log(source)
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
        let points = element.attr("d").match(/(\d+ \d+|[A-Za-z])/g)
        let result = []
        points.forEach((point) => {
          if (point.length > 1){
            result.push((parseInt(point.split(" ")[0]) + parseInt(event.dx)).toString()+' '+(parseInt(point.split(" ")[1]) + parseInt(event.dy)).toString() + " ")
          }else{
            result.push(point)
          }
        })
        element.attr("d", result.join(''))
      }else{
        element.attr("x", parseInt(element.attr("x"))+parseInt(event.dx)).attr("y", parseInt(element.attr("y"))+parseInt(event.dy))
      }
    }
  },
}
</script>
