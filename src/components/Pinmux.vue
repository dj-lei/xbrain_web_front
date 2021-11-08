<template lang="pug">
  v-card(class="pa-2")
    v-sheet(color="grey lighten-4" :height="canvas_height" :width="canvas_width")
      div(id="painting")
        svg(id="viz" :height="canvas_height" :width="canvas_width" class="container-border")
</template>

<script>
import * as d3 from 'd3'
import * as echarts from 'echarts'

export default {
  data () {
    return {
      data: [],
      nodes: [],
      node: '',
      links: [],
      link: '',
      types: [],
      color: '',
      svg:'',
      simulation: '',
      zoom: '',
      gx:[],
      gy:[],
      x:[],
      y:[],
      margin: {
        top: 20,
        right: 40,
        bottom: 30,
        left: 40
      },
      scale_min: 0.1,
      scale_max: 2,
      canvas_width: document.body.offsetWidth -580,
      canvas_height: document.body.offsetHeight - 40,
      transform: 'translate(0,0) scale(1)',
      matrix: 'matrix(1 0 0 1 0 0)',
    }
  },

  mounted () {
    this.getTestData()
  },
  methods: {
    async getTestData () {
      await this.$http.get(this.$urls.babel_get, {
        params: {
            operate: 'get_test_data',
        },
        })
        .then(response => {
          this.data = response.data.content
          this.createChart()
          this.logs()
        })
    },
    createChart () {
      this.links = this.data.links.map(d => Object.create(d));
      this.nodes = this.data.nodes.map(d => Object.create(d));
      this.types = this.data.types
      this.color = d3.scaleOrdinal(this.types, d3.schemeCategory10)

      this.simulation = d3.forceSimulation(this.nodes)
          .force("link", d3.forceLink(this.links).id(d => d.id))
          .force("charge", d3.forceManyBody().strength(-400))
          .force("x", d3.forceX())
          .force("y", d3.forceY());

      this.svg = d3.select("#viz").style("font", "12px sans-serif").append("g").attr("id", "new")
      this.resetCoordinates()

      // Per-type markers, as they don't inherit styles.
      this.svg.append("defs").selectAll("marker")
        .data(this.types)
        .join("marker")
          .attr("id", d => `arrow-${d}`)
          .attr("viewBox", "0 -5 10 10")
          .attr("refX", 15)
          .attr("refY", -0.5)
          .attr("markerWidth", 6)
          .attr("markerHeight", 6)
          .attr("orient", "auto")
        .append("path")
          .attr("fill", this.color)
          .attr("d", "M0,-5L10,0L0,5");

      this.link = this.svg.append("g")
          .attr("fill", "none")
          .attr("stroke-width", 1.5)
        .selectAll("path")
        .data(this.links)
        .join("path")
          .attr("stroke", d => this.color(d.type))
          .attr("marker-end", d => `url(${new URL(`#arrow-${d.type}`, location)})`);

      this.node = this.svg.append("g")
          .attr("fill", "currentColor")
          .attr("stroke-linecap", "round")
          .attr("stroke-linejoin", "round")
        .selectAll("g")
        .data(this.nodes)
        .join("g")
          .call(this.createDrag(this.simulation));

      // this.node.append("circle")
      //     .attr("stroke", "white")
      //     .attr("stroke-width", 1.5)
      //     .attr("r", 4);

      this.node.append("rect")
          .attr('fill', 'none')
          .attr('width',20)
          .attr('height',20)
          .style('stroke', "#0000FF")
          .style('stroke-width', 2)

      this.node.append("text")
          .attr("x", 8)
          .attr("y", "0.31em")
          .text(d => d.id)
        .clone(true).lower()
          .attr("fill", "none")
          .attr("stroke", "white")
          .attr("stroke-width", 3);

      this.simulation.on("tick", () => {
        this.link.attr("d", linkArc);
        this.node.attr("transform", d => `translate(${d.x},${d.y})`);
      });

      function linkArc(d) {
        const r = Math.hypot(d.target.x - d.source.x, d.target.y - d.source.y);
        return `
          M${d.source.x},${d.source.y}
          A${r},${r} 0 0,1 ${d.target.x},${d.target.y}
        `;
      }
      
      // invalidation.then(() => this.simulation.stop());
    },
    createDrag(simulation){
      function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.1).restart();
        d.fx = d.x;
        d.fy = d.y;
      }
      
      function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
      }
      
      function dragended(event, d) {
        // if (!event.active) simulation.alphaTarget(0);
        // d.fx = null;
        // d.fy = null;
      }
      
      return d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended);
    },
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
      // this.zoomInOutEvent(this.transform.k)
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
    logs () {
      console.log(d3.select("#new").node())
    }

  }
}


</script>