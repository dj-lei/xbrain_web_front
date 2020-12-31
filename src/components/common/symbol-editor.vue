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
          v-btn(width='100%' @click="createRect") RECT
        v-row
          v-btn(width='100%' @click="createPolygon") POLYGON
        v-row
          v-btn(width='100%' @click="log") LOG
        v-row
          v-color-picker(v-model="color" hide-inputs class="ma-2" @update:color="updateColor")
        //- v-sheet(dark class="pa-4")
        //-   pre {{ showColor }}
      v-card(class="pa-2")
        v-sheet(color="grey lighten-4" height="600" width="600")
          svg(id="viz" class="container-border")
      v-card(class="pa-2")
        template(v-if="select_mode === 'rect'")
          v-row(class="d-flex justify-center")
            v-col(class="pa-2")
              v-text-field(width='50%' v-model="rect_width" label="width" dense outlined)
            v-col(class="pa-2")
              v-text-field(width='50%' v-model="rect_height" label="height" dense outlined)
          v-row(class="d-flex justify-center")
            v-col
              v-btn(@click="createRect") create
            v-spacer
            v-col
              v-btn(@click="deleteElm") delete
</template>

<script>
import * as d3 from 'd3'

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
      conp: '',
      that: '',
      svg: '',
      elm: '',
      select_mode: 'rect',
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

    // const rects = d3.range(10).map(i => ({
    //   x: 20,
    //   y: 20,
    // }));

    // svg.selectAll("rect")
    //   .data(rects)
    //   .join("rect")
    //     .attr("cx", d => d.x)
    //     .attr("cy", d => d.y)
    //     .attr("fill", (d, i) => d3.schemeCategory10[i % 10])
    //     .call(this.drag());

    // const circles = d3.range(20).map(i => ({
    //   x: Math.random() * (width - radius * 2) + radius,
    //   y: Math.random() * (height - radius * 2) + radius,
    // }));

    // svg.selectAll("circle")
    //   .data(circles)
    //   .join("circle")
    //     .attr("cx", d => d.x)
    //     .attr("cy", d => d.y)
    //     .attr("r", radius)
    //     .attr("fill", (d, i) => d3.schemeCategory10[i % 10])
    //     .call(this.drag());
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
    updateColor(){
      this.elm.style("stroke", this.showColor)
    },
    drag(elm) {
      let that = this
      function dragstarted(event) {
        that.elm = d3.select(this)
        d3.select(this).raise().style("stroke", "black");
      }
      function dragged(event) {
        d3.select(this).attr("x", elm.x = event.x).attr("y", elm.y = event.y);
      }
      function dragended(event) {
        d3.select(this).style("stroke", that.showColor);
      }
      return d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
    },
    // done() {
    //   if (this.conp !== ''){
    //     this.conp.selectize(false, { deepSelect: true }).resize("stop")
    //     this.conp.draggy()
    //   }
    //   this.conp = ''
    // },
    // del() {
    //   console.log('----------')
    //   if (this.conp !== ''){
    //     this.conp.remove()
    //   }
    //   this.conp = ''
    // },
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
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", this.rect_width)
        .attr("height", this.rect_height)
        .style("fill", "none")
        .style('stroke', this.showColor)
        .style('stroke-width', 5)
        .call(this.drag(this.svg))
    },

    createPolygon() {

    },
    deleteElm() {
      d3.selectAll("rect").remove()
    },
    log() {
      console.log(this.svg)
    },
  },
}
</script>
