<template lang="pug">
  v-container
    v-toolbar(dark)
      v-btn(icon, dark, @click="$emit('dialogClose')")
        v-icon mdi-close
      v-toolbar-title Symbol Edit
      v-spacer
      v-btn(dark, text, @click="save") SAVE
    v-card(class="d-flex justify-center mb-6")
      v-card(class="pa-2")
        v-sheet(width="200")
          v-row
            v-btn(width='100%' @click="pathMenu") PATH
          v-row
            v-btn(width='100%' @click="polygonMenu") POLYGON
          v-row
            v-btn(width='100%' @click="textMenu") TEXT
          v-row
            v-btn(width='100%' @click="dataMenu") DATA
          v-row
            v-btn(width='100%' @click="log") LOG
      v-card(class="pa-2")
        v-sheet(color="grey lighten-4" :height="canvas_height" :width="canvas_width" @click="done")
          div(id="painting")
            template(v-if="flagUpdateOrAdd === false")
              svg(id="viz" :height="canvas_height" :width="canvas_width" class="container-border")
                //- foreignObject(width="100" height="50")
                  v-combobox(dense outlined)
                //-   v-text-field(dense outlined)
                  //- v-btn log
      v-card(class="pa-2")
        v-sheet(width="300")
          template(v-if="select_mode !== ''")
            v-toolbar(color="grey lighten-4")
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
                  //- v-sheet(dark class="pa-4")
                  //-   pre {{ showColor }}
            template(v-else-if="select_mode === 'data'")
              v-row(class="d-flex justify-center")
                v-col(class="pa-2")
                  v-radio-group(v-model="data_type")
                    v-radio(label="String" value="String")
                    v-radio(label="Int" value="Int")
                    v-radio(label="List" value="List")
                  v-btn(width='100%' @click="createData") CREATE

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
  },
  data () {
    return {
      hexa: '#FF00FF',
      canvas_width: 600,
      canvas_height: 600,
      margin: {
        top: 20,
        right: 40,
        bottom: 30,
        left: 40
      },
      that: '',
      svg: '',
      elm: '',
      elms: [],
      selected : false,
      select_mode: '',
      unique_name: '',
      x_axis: 0,
      y_axis: 0,
      path_points: '',
      polygon_points: '',
      text: '',
      data_type: '',
    }
  },

  mounted () {
    var _this = this

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
        d3.select('#painting').node().append(data.documentElement)
        d3.selectAll('path').call(g => g.call(this.drag(g)))
        d3.selectAll('polygon').call(g => g.call(this.drag(g)))
        d3.selectAll('text').call(g => g.call(this.drag(g)))
        d3.selectAll('foreignObject').call(g => g.call(this.drag(g)))
        this.svg = d3.select("#viz")
        this.svg.append("g").call(this.xAxis)
        this.svg.append("g").call(this.yAxis)
      })
    }else{
      this.svg = d3.select("#viz")
      this.svg.append("g").call(this.xAxis)
      this.svg.append("g").call(this.yAxis)
    }

    // let n = "carNo=甘-J2L199&distance=3000&isNewReport=1&latitude=0&longitude=0&nonce=75341421609739888281&openId=&privacyOption=1&signType=MD5&timestamp=1609739888281&userId=c36b86825b004d648bfbbbc1b58a675e&W9cE5d4q0df9GjeBaR16a5B56Z1V51i7"
    // let sign = CryptoJS.MD5(n).toString().toUpperCase()

    // let e = JSON.parse("{\"isNewReport\":1,\"userId\":\"c36b86825b004d648bfbbbc1b58a675e\",\"carNo\":\"甘-J2L199\",\"privacyOption\":1,\"longitude\":0,\"latitude\":0,\"distance\":3000,\"openId\":\"\",\"signType\":\"MD5\",\"timestamp\":1609739888281,\"nonce\":\"75341421609739888281\",\"sign\":\"48DF5B8598ADEC7BE0D1B90D268C227E\"}")
    // e.sign = sign
    // e = JSON.stringify(e)
    // let r = "L2kJs2aH9zT3X9SF"
    // let t
    // n = null

    // var o = CryptoJS.enc.Utf8.parse(e),
    // i = CryptoJS.enc.Utf8.parse(t || r),
    // c = CryptoJS.AES.encrypt(o, i, n || {
    //   mode: CryptoJS.mode.ECB,
    //   padding: CryptoJS.pad.Pkcs7
    // })
    // console.log(CryptoJS.enc.Hex.stringify(c.ciphertext).toUpperCase())

  },

  methods: {
    initialize () {

    },
    xAxis(g){
      let x = d3.scaleLinear()
          .domain([0, 600])
          .range([0, 600])

      g.attr("transform", `translate(0,${this.margin.top})`)
      .attr("class", "tick")
      .call(d3.axisTop(x.copy().interpolate(d3.interpolateRound)).ticks(null, "f"))
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick line").clone()
          .attr("stroke-opacity", 0.1)
          .attr("y1", this.canvas_height))
      .call(g => g.select(".tick text").clone()
          .attr("x", this.canvas_width - this.margin.right)
          .attr("y", 5)
          .attr("fill", "currentColor")
          .attr("font-weight", "bold")
          .text("Width px"))
    },
    yAxis(g){
      let y = d3.scaleLinear()
          .domain([0, 600])
          .range([0, 600])

      g.attr("transform", `translate(${this.margin.left - 10},0)`)
      .attr("class", "tick")
      .call(d3.axisLeft(y.copy().interpolate(d3.interpolateRound)))
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick line").clone()
          .attr("stroke-opacity", 0.1)
          .attr("x1", this.canvas_width))
      .call(g => g.select(".tick text").clone()
          .attr("x", 3)
          .attr("y", 590)
          .attr("text-anchor", "start")
          .attr("font-weight", "bold")
          .text("Height px"))
    },
    polygonMenu(){
      this.polygon_points = ''
      this.select_mode = 'polygon'
    },
    pathMenu(){
      this.path_points = ''
      this.select_mode = 'path'
    },
    textMenu(){
      this.text = ''
      this.select_mode = 'text'
    },
    dataMenu(){
      this.select_mode = 'data'
    },
    updateColor(){
      if (this.elm !== ''){
        this.elm.style("stroke", this.hexa)
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
    drag(elm) {
      let that = this
      function dragstarted(event) {
        if (that.elm !== ''){
          that.elm.raise().style("stroke", "black")
        }else{
          that.hexa = that.colorRGBtoHex(d3.select(this).style("stroke"))
        }

        that.elm = d3.select(this)
        if (d3.select(this).attr("dom_type") === 'polygon') {
          that.select_mode = 'polygon'
          that.polygon_points = d3.select(this).attr("points")
        }else if(d3.select(this).attr("dom_type") === 'text'){
          that.select_mode = 'text'
          that.text = d3.select(this).text()
        }else if(d3.select(this).attr("dom_type") === 'path'){
          that.select_mode = 'path'
          that.path_points = d3.select(this).attr("d")
        }else{
          that.select_mode = 'data'
        }

        d3.select(this).raise().style("stroke", "black")
      }
      function dragged(event) {
        if (d3.select(this).attr("dom_type") === 'polygon') {
          let points = d3.select(this).attr("points").split(" ")
          let result = []
          points.forEach((point) => {
            result.push((parseInt(point.split(",")[0]) + event.dx).toString()+','+(parseInt(point.split(",")[1]) + event.dy).toString())
          })

          d3.select(this).attr("points", result.join(' '))
        }else if(d3.select(this).attr("dom_type") === 'path'){
          let points = d3.select(this).attr("d").match(/(\d+ \d+|[A-Za-z])/g)
          let result = []
          points.forEach((point) => {
            if (point.length > 1){
              result.push((parseInt(point.split(" ")[0]) + event.dx).toString()+' '+(parseInt(point.split(" ")[1]) + event.dy).toString() + " ")
            }else{
              result.push(point)
            }
          })
          d3.select(this).attr("d", result.join(''))
        }else{
          d3.select(this).attr("x", elm.x = event.x).attr("y", elm.y = event.y)
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
      console.log('click')
      if (this.elm !== ''){
        this.elm.style("stroke", this.hexa)
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
        .style("fill", "none")
        .style('stroke', this.hexa)
        .style('stroke-width', 5)
        .call(this.drag(this.svg))
    },
    createPolygon() { // 200,200 200,400 350,300
      console.log(this.hexa)
      this.svg.append("polygon")
        .attr("id", this.unique_name)
        .attr("dom_type", 'polygon')
        .attr("points", this.polygon_points)
        .style("fill", "none")
        .style('stroke', this.hexa)
        .style('stroke-width', 5)
        .call(this.drag(this.svg))

      // this.svg.append("g")
      //   .call(
      //     g => g.append("polygon")
      //     .attr("id", this.unique_name)
      //     .attr("points", this.polygon_points)
      //     .style("fill", "none")
      //     .style('stroke', this.showColor)
      //     .style('stroke-width', 5)
      //     .call(this.drag(this.svg))
      //   )
      //   .call(
      //     g => g.append("text")
      //     .attr("dy", "1em")
      //     .attr("fill", this.showColor)
      //     .attr("font-weight", "bold")
      //     .text(this.unique_name)
      //   )
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
      if (this.data_type === 'List'){
        this.svg.append("foreignObject")
          .attr("x", this.canvas_width / 2)
          .attr("y", this.canvas_height / 2)
          .attr("width", 100)
          .attr("height", 50)
        .html('<div xmlns="http://www.w3.org/1999/xhtml" class="v-input v-input--dense theme--light v-text-field v-text-field--is-booted v-text-field--enclosed v-text-field--outlined v-select v-autocomplete"><div class="v-input__control"><div role="combobox" aria-haspopup="listbox" aria-expanded="false" aria-owns="list-206" class="v-input__slot"><fieldset aria-hidden="true"><legend style="width: 0px;"><span>​</span></legend></fieldset><div class="v-select__slot"><input type="text" autocomplete="off" /><div class="v-input__append-inner"><div class="v-input__icon v-input__icon--append"><i aria-hidden="true" class="v-icon notranslate mdi mdi-menu-down theme--light"></i></div></div><input type="hidden" /></div><div class="v-menu"><!----></div></div><div class="v-text-field__details"><div class="v-messages theme--light"><div class="v-messages__wrapper"></div></div></div></div></div>')
        .call(this.drag(this.svg))
      }else{
        this.svg.append("foreignObject")
          .attr("x", this.canvas_width / 2)
          .attr("y", this.canvas_height / 2)
          .attr("width", 100)
          .attr("height", 50)
        .html('<div xmlns="http://www.w3.org/1999/xhtml" class="v-input v-input--dense theme--light v-text-field v-text-field--is-booted v-text-field--enclosed v-text-field--outlined"><div class="v-input__control"><div class="v-input__slot"><fieldset aria-hidden="true"><legend style="width: 0px;"><span>​</span></legend></fieldset><div class="v-text-field__slot"><input type="text" /></div></div><div class="v-text-field__details"><div class="v-messages theme--light"><div class="v-messages__wrapper"></div></div></div></div></div>')
        .call(this.drag(this.svg))
      }
    },
    deleteElm() {
      if (this.elm !== ''){
        this.elm.remove()
      }
    },
    log() {
      this.hex = "8CFFFE"

      // d3.selectAll(".tick").remove()
      // let serializer = new XMLSerializer()
      // let source = serializer.serializeToString(this.svg.node())
      console.log(this.showColor)
    },
    save(){
      d3.selectAll(".tick").remove()
      this.$emit('saveToServer', this.svg)
    },
    colorRGBtoHex(color) {
      var rgb = color.split(',')
      var r = parseInt(rgb[0].split('(')[1])
      var g = parseInt(rgb[1])
      var b = parseInt(rgb[2].split(')')[0])
      var hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
      return hex
    }
  },
}
</script>
