<template lang="pug">
  v-container
    v-card(class="d-flex justify-center mb-6")
      //- v-sheet(
      //-   elevation="2"
      //-   color="grey lighten-4"
      //-   height="400"
      //-   width="100"
      //- )
      v-card(class="pa-2")
        v-row
          v-btn(width='100%' @click="createLine") LINE
        v-row
          v-btn(width='100%' @click="rectMenu") RECT
        v-row
          v-btn(width='100%' @click="createPolygon") POLYGON
        v-row
          v-btn(width='100%' @click="log") LOG
        v-row
          v-color-picker(v-model="color" hide-inputs class="ma-2" @update:color="updateColor")
        //- v-sheet(dark class="pa-4")
        //-   pre {{ showColor }}
      v-card(class="pa-2")
        v-sheet(color="grey lighten-4" :height="canvas_height" :width="canvas_width" @click="done")
          svg(id="viz" :height="canvas_height" :width="canvas_width" class="container-border")
      v-card(class="pa-2")
        v-toolbar(color="grey lighten-4")
          v-toolbar-title {{ select_mode }}
        v-spacer(class="mt-3")
        template(v-if="select_mode === 'rect'")
          v-row(class="d-flex justify-center")
            v-col(class="pa-2")
              v-text-field(:disabled="selected ? true : false" v-model="unique_name" label="unique name" dense outlined)
          v-row(class="d-flex justify-center")
            v-col(class="pa-2")
              v-text-field(v-model="rect_width" label="width" dense outlined @keyup.enter="updateRectWidth")
            v-col(class="pa-2")
              v-text-field(v-model="rect_height" label="height" dense outlined @keyup.enter="updateRectHeight")
          v-row(class="d-flex justify-center")
            v-col
              template(v-if="selected === false")
                v-btn(@click="createRect") create
            v-spacer
            v-col
              v-btn(@click="deleteElm") delete
</template>

<script>
import * as d3 from 'd3'
import CryptoJS from 'crypto-js'

export default {
  data () {
    return {
      types: ['hex', 'hexa', 'rgba', 'hsla', 'hsva'],
      type: 'hex',
      hex: '#FF00FF',
      hexa: '#FF00FFFF',
      rgba: { r: 255, g: 0, b: 255, a: 1 },
      hsla: { h: 300, s: 1, l: 0.5, a: 1 },
      hsva: { h: 300, s: 1, v: 1, a: 1 },
      canvas_width: 600,
      canvas_height: 600,
      that: '',
      svg: '',
      elm: '',
      elms: [],
      selected : false,
      select_mode: 'rect',
      unique_name: '',
      rect_width: 50,
      rect_height: 50,
    }
  },
  computed: {
    color: {
      get () {
        return this[this.type]
      },
      set (v) {
        this[this.type] = v
      },
    },
    showColor () {
      if (typeof this.color === 'string') return this.color

      return JSON.stringify(Object.keys(this.color).reduce((color, key) => {
        color[key] = Number(this.color[key].toFixed(2))
        return color
      }, {}), null, 2)
    },
  },
  mounted () {
    // this.initialize()
    this.that = this
    this.svg = d3.select("#viz")

    // let n = "carNo=甘-J2L199&distance=3000&isNewReport=1&latitude=30.67841&longitude=103.97679&nonce=35053231609574891332&openId=&privacyOption=1&signType=MD5&timestamp=1609574891332&userId=&W9cE5d4q0df9GjeBaR16a5B56Z1V51i7"
    // let sign = CryptoJS.MD5(n).toString().toUpperCase()

    // let e = JSON.parse("{\"isNewReport\":1,\"userId\":\"\",\"carNo\":\"甘-J2L199\",\"privacyOption\":1,\"longitude\":103.97679,\"latitude\":30.67841,\"distance\":3000,\"openId\":\"\",\"signType\":\"MD5\",\"timestamp\":1609574891332,\"nonce\":\"35053231609574891332\",\"sign\":\"DA8FEA8741ACBA2F7B7B8A2BDE994F8D\"}")
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
    async initialize () {
      await this.$http.get(this.$urls.trouble_shooting_get, {
        params: {
            operate: 'get_template_titles',
        },
        })
        .then(response => {
          this.data = response.data.content
        })
    },
    rectMenu(){
      this.select_mode = 'rect'
      this.rect_width = 50
      this.rect_height = 50
    },
    updateColor(){
      if (this.elm !== ''){
        this.elm.style("stroke", this.showColor)
      }
    },
    updateRectWidth(){
      if (this.elm !== ''){
        this.elm.attr("width", this.rect_width)
      }
    },
    updateRectHeight(){
      if (this.elm !== ''){
        this.elm.attr("height", this.rect_height)
      }
    },
    drag(elm) {
      let that = this
      function dragstarted(event) {
        that.elm = d3.select(this)
        d3.select(this).raise().style("stroke", "black")
      }
      function dragged(event) {
        d3.select(this).attr("x", elm.x = event.x).attr("y", elm.y = event.y)
      }
      function dragended(event) {
        // d3.select(this).style("stroke", that.showColor);
      }
      return d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
    },
    done() {
      if (this.elm !== ''){
        this.elm.style("stroke", this.showColor)
      }
      this.elm = ''
    },
    createLine() {
      this.svg.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", this.rect_width)
        .attr("height", this.rect_height)
        .style("fill", "none")
        .style('stroke', this.showColor)
        .style('stroke-width', 5)
    },
    createRect() {
      this.svg.append("rect")
        .attr("id", this.unique_name)
        .attr("x", this.canvas_width / 2)
        .attr("y", this.canvas_height / 2)
        .attr("width", this.rect_width)
        .attr("height", this.rect_height)
        .style("fill", "none")
        .style('stroke', this.showColor)
        .style('stroke-width', 5)
        .call(this.drag(this.svg))
    },

    createPolygon() {
      let test = d3.select("#test")
      console.log(test.attr("id"))
    },
    deleteElm() {
      if (this.elm !== ''){
        this.elm.remove()
      }
    },
    log() {
      let serializer = new XMLSerializer();
		  let xml = serializer.serializeToString(this.svg.node())
      console.log(xml)
    },
  },
}
</script>
