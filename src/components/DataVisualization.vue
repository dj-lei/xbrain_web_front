<template lang="pug">
  v-card(class="pa-2")
    v-sheet(color="grey lighten-4" :height="canvas_height" :width="canvas_width")
      div(id="painting")
        svg(id="viz" :height="canvas_height" :width="canvas_width" class="container-border")
</template>

<script>
import * as d3 from 'd3'
import axios from 'axios'
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
      defs: '',
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
      canvas_width: 800,
      canvas_height: 600,
      index_source: 0,
      index_target: 0,
      index_pos:0,
      transform: 'translate(0,0) scale(1)',
      matrix: 'matrix(1 0 0 1 0 0)',
      interval: '',
      interval2: '',
      refresh_interval: 1000,
      history_data_pool: [],
    }
  },

  mounted () {
    this.canvas_width = document.body.offsetWidth -580,
    this.canvas_height = document.body.offsetHeight - 40,
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
          this.createDynamicUpdate()
          this.createInteractiveEvent()
          this.logs()
        })
    },
    createChart () {
      let that = this
      this.links = this.data.links.map(d => Object.create(d));
      this.nodes = this.data.nodes.map(d => Object.create(d));
      this.types = this.data.types
      this.color = d3.scaleOrdinal(this.types, d3.schemeCategory10)

      this.simulation = d3.forceSimulation(this.nodes)
          .force("link", d3.forceLink(this.links).id(d => d.id))
          .force("charge", d3.forceManyBody().strength(-2000))
          .force("x", d3.forceX())
          .force("y", d3.forceY());
      this.svg = d3.select("#viz").style("font", "12px sans-serif").append("g").attr("id", "new")
      this.resetCoordinates()

      // Per-type markers, as they don't inherit styles.
      this.defs = this.svg.append("defs").selectAll("path")
        .data(this.links)
        .join("path")
          .attr("id", d => d.type)
          .attr("d", linkArc)
          .attr("fill", "none")
          .attr("stroke", d => this.color(d.type))
          .attr("stroke-width", 1.5)
          .attr("marker-end", d => `url(${new URL(`#arrow-${d.type}`, location)})`);

      this.svg.select("defs").selectAll("marker")
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

      this.svg.selectAll("use")
        .data(this.links)
        .join("use")
          .attr("xlink:xlink:href", d => `#${d.type}`)

      this.link = this.svg.append("g")
          .attr("fill", "none")
        .selectAll("text")
        .data(this.links)
        .enter().append("text")
          .attr("font-family", "Verdana")
          .attr("font-size", "8")
          .style('fill', "#008000")
        .append("textPath")
          .attr("xlink:xlink:href", d => `#${d.type}`)
          .attr("startOffset", "30%")
          .text(d => d.type)

      this.node = this.svg.append("g")
          .attr("id", "nodes")
          .attr("fill", "currentColor")
          .attr("stroke-linecap", "round")
          .attr("stroke-linejoin", "round")
        .selectAll("g")
        .data(this.nodes)
        .join("g")
          .attr("id",  d => `node${d.index}`)
          .call(this.createDrag(this.simulation));

      this.node.append("rect")
          .attr('fill', '#32CD32')
          .attr('width',100)
          .attr('height',60)
          .style('stroke', "#C0C0C0")
          .style('stroke-width', 2)

      this.node.append("text")
          .attr("x", 5)
          .attr("y", 15)
          .text(d => d.id)
          .style('fill', "#FFFFF0")
        .clone(true).lower()
          .attr("fill", "none")
          .attr("stroke", "white")
          .attr("stroke-width", 3);

      this.simulation.on("tick", () => {
        this.defs.attr("d", linkArc);
        this.node.attr("transform", d => `translate(${d.x},${d.y})`);
      });

      function linkArc(d) {
        if ((d.source.index == that.index_source) && (d.target.index == that.index_target)){
          that.index_pos = that.index_pos + 1 
        }else{
          that.index_source = d.source.index
          that.index_target = d.target.index
          that.index_pos = 0
        }
        return `
          M ${d.source.x},${d.source.y + that.index_pos * 10} 
          L ${d.target.x},${d.target.y + that.index_pos * 10}
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
    createInteractiveEvent(){
      let that = this
      let tmp = 0
      d3.select("#nodes").selectAll("g").each(function(d, i) {
        d3.select(this).attr("pointer-events", "all")
          .on("mouseenter", (event, d) => {
            if (tmp == 0){
              that.syncTestData(d3.select(this))
              tmp = 1
            }else{
              d3.select(this).append("foreignObject")
                .attr("class", "tip")
                .attr('x',0)
                .attr('y',-202)
                .attr("width", 300)
                .attr("height", 200)
                .html('<div id="test_chart" class="children" dom_type="chart" style="background:white;width: 300px;height:200px;" >')
              that.syncEchartTestData(d3.select(this))
              tmp = 0
            }
          })
          .on("mouseleave", (event, d) => {
            if (that.interval == ''){
            }else{
              clearInterval(that.interval)
              that.interval = ''
            }
            d3.select(this).selectAll('.tip').remove()
          })
      })   
    },
    createDynamicUpdate(){
      let that = this
      let flag = true
      if (this.interval2 == ''){
        this.interval2 = setInterval(function() {        
          if(flag == true){
            d3.select("#Ethernet0").attr("stroke", "#DC143C")
            d3.select("#node3").select("rect").attr("fill", "#DC143C")
            flag = false
          }else{
            d3.select("#Ethernet0").attr("stroke", "#32CD32")
            d3.select("#node3").select("rect").attr("fill", "#32CD32")
            flag = true
          }
        },this.refresh_interval)
      }
    },
    syncTestData(elm){
      let that = this
      if (this.interval == ''){
        this.interval = setInterval(function() {
          axios.get("http://localhost:8000/ru/babel/get", {
            params: {
                operate: 'get_echart_test_data',
            },
            })
            .then(response => {
              elm.append('rect').attr("class", "tip").attr('x',0).attr('y',-100).attr('width', 100).attr('height', 98).attr('fill', "#000000DD")
              elm.append('text').attr("class", "tip").attr('x',0).attr('y',-25).style('fill', "#FFFFFF").text("radon rxpwr : " + response.data.content['radon rxpwr'])
              elm.append('text').attr("class", "tip").attr('x',0).attr('y',-50).style('fill', "#FFFFFF").text("radon ipwr : " + response.data.content['radon ipwr'])
              elm.append('text').attr("class", "tip").attr('x',0).attr('y',-75).style('fill', "#FFFFFF").text("radon wpwr : " + response.data.content['radon wpwr'])
            })
        },this.refresh_interval)
      }
    },
    syncEchartTestData(elm){
      let that = this
      if (this.interval == ''){
        this.interval = setInterval(function() {
          axios.get("http://localhost:8000/ru/babel/get", {
            params: {
                operate: 'get_echart_test_data',
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
              let ins = echarts.getInstanceByDom(elm.select('div').node())
              if (ins == null){
                echarts.init(elm.select('div').node()).setOption(that.$common.getChartConfig(names, series, that.$common.sliceXAxisQueueHandle(that.refresh_interval, 30)))
              }else{
                ins.setOption(that.$common.getChartConfig(names, series, that.$common.sliceXAxisQueueHandle(that.refresh_interval, 30)), true)
              }
            })
          },this.refresh_interval)
      }
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