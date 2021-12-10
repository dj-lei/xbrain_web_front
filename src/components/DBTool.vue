<template lang="pug">
  v-card(class="pa-2")
    v-sheet(color="grey lighten-4" :height="canvas_height" :width="canvas_width")
      div(id="painting")
        svg(id="viz" :height="canvas_height" :width="canvas_width" class="container-border")
    v-dialog(v-model="dialogDbConfig" :max-width="canvas_width")
      v-card(color="yellow darken-3" dark)
        v-card-title
          span(class="headline") DB Config
        v-card-text
          v-container
            v-row
              v-combobox(v-model='platform' :items="platforms" label="select platform")
              v-combobox(v-model='product' :items="products" label="select product")
              v-combobox(v-model='device' :items="devices" label="select device")
              v-btn(class="mt-3" @click="dbConfigApply") APPLY
              v-divider(vertical)
              v-btn(class="mt-3" @click="uploadIwd") UPLOAD IWD
              v-file-input(id="fileInput" v-model="file" @change="sendIwd" style="display:none" multiple)
        v-sheet(color="grey lighten-4" :height="canvas_height - 300" :width="canvas_width")
          div(id="painting")
            svg(id="dbviz" :height="canvas_height - 350" :width="canvas_width" class="container-border")
    v-dialog(v-model="dialogDbUpdate" :max-width="canvas_width / 2")
      v-card
        v-card-title
          span(class="headline") Fill DB
        v-card-text
          v-container
            v-row
              v-text-field(v-model="db_value" label="Fill db" placeholder="Fill db" outlined dense @keydown.enter="submit")
    v-dialog(v-model="dialogFunctionsRun" :max-width="canvas_width")
      v-card(color="yellow darken-3" dark)
        v-card-title
          span(class="headline") Function Run
        v-sheet(color="grey lighten-4" :height="canvas_height - 300" :width="canvas_width")
          div(id="painting")
            svg(id="funcviz" :height="canvas_height - 350" :width="canvas_width" class="container-border")
    v-dialog(v-model="dialogFuncRun" :max-width="canvas_width")
      v-card
        v-card-title
          span(class="headline") Fill PARAMS
        v-card-text
          v-container
            v-row
              v-text-field(class="mt-3" v-model="func_params" label="Fill PARAMS" placeholder="Fill params" outlined dense)
              v-btn(class="mt-3" @click="functionRun") RUN

</template>

<script>
import * as d3 from 'd3'
import axios from 'axios'
import * as echarts from 'echarts'

export default {
  data () {
    return {
      dialogDbConfig: false,
      dialogDbUpdate: false,
      dialogFunctionsRun: false,
      dialogFuncRun:false,
      platforms:['Visby', 'Oslo'],
      platform:'',
      products:['6626', '2229'],
      product:'',
      devices:["pegasusMiscIFpga", "gpioFpga","accelFpga","xpaiSpiMaster","accelFpgaSpiMaster","ruLtu","ltuPllSv",
               "parallellJobRunner", "radonGroup:0", "txRxRfLo:0","draTemperature","radonHotSpotTemp",
              "parallellDriverStart", "i2cMaster2", "dfeFpgaSvTemp", "rxSvTemp", "supDrivers","kbPcSpi",
              "txTemperatureSensor:0", "txTemperature:0 ","pressureSensor:0", "temperatureBoard:0",
              "accelerometer", "accelerationX", "accelerationY", "accelerationZ","touchTempSensor", "touchT",
              "dcDcDrivers:0", "dcDcDrivers:1","mmiLedDevice","mmiPushButtonDevice","fu", "nereusFpga",
              "aiDrivers", "tmemFpga","dvswrInterruptManager","rxFeDrivers:0","rxFeDrivers:1","rxFeDrivers:2","halDataConfig",
      ],
      device:'',
      dbs:[],
      funcs:[],
      func_tmp:'',
      db_value:'',
      func_params:'',
      operate_element:'',
      file:[],

      data: [],
      nodes: [],
      node: '',
      links: [],
      link: '',
      types: [],
      defs: '',
      color: '',

      svg:'',
      svg_db:'',
      svg_func:'',
      zoom: '',
      zoom_db: '',
      zoom_func: '',

      svg_id:'',
      simulation: '',
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
  watch:{
    dialogDbConfig(val){
      if (val == false) {
        this.cleanDbViz()
      }
    },
    dialogFunctionsRun(val){
      if (val == false) {
        this.cleanFuncViz()
      }
    },
  },
  mounted () {
    this.canvas_width = document.body.offsetWidth -580,
    this.canvas_height = document.body.offsetHeight - 40,
    this.getTestData()
  },
  methods: {
    async getTestData () {
      await this.$http.get(this.$urls.db_tool_get, {
        params: {
            operate: 'get_test_data',
        },
        })
        .then(response => {
          this.data = response.data.content
          this.svg_id = "#viz" 
          this.createMainChart()
          this.createInteractiveEvent()
          // this.getElfFunctions()
          // this.createDynamicUpdate()
          this.logs()
        })
    },
    async getDbsByDriverName () {
      this.cleanDbViz()
      await this.$http.get(this.$urls.db_tool_get, {
        params: {
            operate: 'get_db_tool_test_data_by_name',
            driver_name: this.device,
        },
        })
        .then(response => {
          this.dbs = response.data.content
          this.svg_id = "#dbviz" 
          this.createDbsChart(this.dbs)
          this.resetCoordinates()
        })
    },
    async getElfFunctions () {
      this.cleanFuncViz()
      await this.$http.get(this.$urls.db_tool_get, {
        params: {
            operate: 'get_runtime_elf_funcs',
        },
        })
        .then(response => {
          this.funcs = response.data.content
          this.svg_id = "#funcviz" 
          this.createDbsChart(this.funcs)
          this.resetCoordinates()
        })
    },
    createMainChart () {
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
          .attr("id",  d => `${d.id}`)
          .attr("class",  "node")
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
    createDbsChart (dbs) {
      let that = this
      function Tree(data, { // data is either tabular (array of objects) or hierarchy (nested objects)
        path, // as an alternative to id and parentId, returns an array identifier, imputing internal nodes
        id = Array.isArray(data) ? d => d.id : null, // if tabular data, given a d in data, returns a unique identifier (string)
        parentId = Array.isArray(data) ? d => d.parentId : null, // if tabular data, given a node d, returns its parent’s identifier
        children, // if hierarchical data, given a d in data, returns its children
        tree = d3.tree, // layout algorithm (typically d3.tree or d3.cluster)
        sort, // how to sort nodes prior to layout (e.g., (a, b) => d3.descending(a.height, b.height))
        label, // given a node d, returns the display name
        title, // given a node d, returns its hover text
        width = 640, // outer width, in pixels
        height, // outer height, in pixels
        r = 3, // radius of nodes
        padding = 1, // horizontal padding for first and last column
        fill = "#999", // fill for nodes
        fillOpacity, // fill opacity for nodes
        stroke = "#555", // stroke for links
        strokeWidth = 1.5, // stroke width for links
        strokeOpacity = 0.4, // stroke opacity for links
        strokeLinejoin, // stroke line join for links
        strokeLinecap, // stroke line cap for links
        halo = "#fff", // color of label halo 
        haloWidth = 1, // padding around the labels
      } = {}) {

        // If a path accessor is specified, we can impute the internal nodes from the slash-
        // separated path; otherwise, the tabular data must include the internal nodes, not
        // just leaves. TODO https://github.com/d3/d3-hierarchy/issues/33
        if (path != null) {
          const D = d3.map(data, d => d);
          const I = d3.map(data, path).map(d => (d = `${d}`).startsWith("/") ? d : `/${d}`);
          const paths = new Set(I);
          for (const path of paths) {
            const parts = path.split("/");
            while (parts.pop(), parts.length) {
              const path = parts.join("/") || "/";
              if (paths.has(path)) continue;
              paths.add(path), I.push(path), D.push(null);
            }
          }
          id = (_, i) => I[i];
          parentId = (_, i) => I[i] === "/" ? "" : I[i].slice(0, I[i].lastIndexOf("/")) || "/";
          data = D;
        }

        // If id and parentId options are specified (perhaps implicitly via the path option),
        // use d3.stratify to convert tabular data to a hierarchy; otherwise we assume that
        // the data is specified as an object {children} with nested objects (a.k.a. the
        // “flare.json” format), and use d3.hierarchy.
        const root = id == null && parentId == null
            ? d3.hierarchy(data, children)
            : d3.stratify().id(id).parentId(parentId)(data);

        // Compute labels and titles.
        const descendants = root.descendants();
        const L = label == null ? null : descendants.map(d => label(d.data, d));

        // Sort the nodes.
        if (sort != null) root.sort(sort);

        // Compute the layout.
        const dx = 10;
        const dy = width / (root.height + padding);
        tree().nodeSize([dx, dy])(root);

        // Center the tree.
        let x0 = Infinity;
        let x1 = -x0;
        root.each(d => {
          if (d.x > x1) x1 = d.x;
          if (d.x < x0) x0 = d.x;
        });

        // Compute the default height.
        if (height === undefined) height = x1 - x0 + dx * 2;

        that.svg_db = d3.select(that.svg_id).style("font", "12px sans-serif").append("g").attr("id", "new")
        
        that.svg_db.append("g")
            .attr("fill", "none")
            .attr("stroke", stroke)
            .attr("stroke-opacity", strokeOpacity)
            .attr("stroke-linecap", strokeLinecap)
            .attr("stroke-linejoin", strokeLinejoin)
            .attr("stroke-width", strokeWidth)
          .selectAll("path")
            .data(root.links())
            .join("path")
              .attr("d", d3.linkHorizontal()
                  .x(d => d.y)
                  .y(d => d.x));

        const node = that.svg_db.append("g")
          .selectAll("a")
          .data(root.descendants())
          .join("a")
            .on("click", that.svg_id === '#dbviz' ? that.dbClickEvent : that.funcClickEvent)
            .attr("addr", d => that.svg_id === '#dbviz' ? `${d.data.name}` : `${d.data.addr}`)
            .attr("transform", d => `translate(${d.y},${d.x})`);

        node.append("circle")
            .attr("fill", d => d.children ? stroke : fill)
            .attr("r", r);

        if (title != null) node.append("title")
            .text(d => title(d.data, d));

        if (L) node.append("text")
            .attr("dy", "0.32em")
            .attr("x", d => d.children ? -6 : 6)
            .attr("fill", d => `${d.data.color}`)
            .attr("text-anchor", d => d.children ? "end" : "start")
            .text((d, i) => L[i])
            .call(text => text.clone(true))
            .attr("fill", "none")
            .attr("stroke", d => `${d.data.color}`)
            .attr("stroke-width", haloWidth)
            

        return that.svg_db.node();
      }

      Tree(dbs, { 
        label: d => d.name,
        title: (d, n) => `${n.ancestors().reverse().map(d => d.data.name).join(".")}`, // hover text
        // link: (d, n) => n.children
        //   ? `https://github.com/prefuse/Flare/tree/master/flare/src/${n.ancestors().reverse().map(d => d.data.name).join("/")}`
        //   : `https://github.com/prefuse/Flare/blob/master/flare/src/${n.ancestors().reverse().map(d => d.data.name).join("/")}.as`,
        width: 600
      })
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
      d3.selectAll(".node").each(function(d, i) {
        d3.select(this).on("click", that.nodeClickEvent)
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
      if (this.svg_id == "#viz"){
        this.zoom = d3.zoom().scaleExtent([this.scale_min, this.scale_max]).on("zoom", this.zoomed)
        d3.select(this.svg_id).call(this.zoom).on("dblclick.zoom", null)
      }else if (this.svg_id == "#dbviz") {
        this.zoom_db = d3.zoom().scaleExtent([this.scale_min, this.scale_max]).on("zoom", this.zoomed)
        d3.select(this.svg_id).call(this.zoom_db).on("dblclick.zoom", null)
      }else if (this.svg_id == "#funcviz") {
        this.zoom_func = d3.zoom().scaleExtent([this.scale_min, this.scale_max]).on("zoom", this.zoomed)
        d3.select(this.svg_id).call(this.zoom_func).on("dblclick.zoom", null)
      }
    },
    zoomed(event) {
      const {transform} = event
      this.transform = transform
      d3.select(this.svg_id).select("#new").attr("transform", transform)  
    },
    dbConfigApply () {
      this.getDbsByDriverName()
    },
    nodeClickEvent (d) {
      if (d.path[1].id == "Radon") {
        this.dialogFunctionsRun = true
        this.getElfFunctions()
      }else{
        this.dialogDbConfig = true
      }
    },
    async funcClickEvent (d) {
      this.func_tmp = d
      this.dialogFuncRun = true
    },
    async functionRun (d) {
      await this.$http.get(this.$urls.db_tool_get, {
        params: {
            operate: 'exec_func',
            mem_addr: this.func_tmp.path[1].getAttribute("addr"),
            params: this.func_params
        },
        })
        .then(response => {

        })
    },
    dbClickEvent (d) {
      this.db_value = d.path[1].getAttribute("addr")
      this.operate_element = d.path[1]
      this.dialogDbUpdate = true
      console.log(d.path[1])
    },
    submit () {
      this.operate_element.getElementsByTagName("text")[0].innerHTML = this.db_value
      this.operate_element.getElementsByTagName("text")[1].innerHTML = this.db_value
      this.operate_element.getElementsByTagName("text")[0].setAttribute("stroke", "#DC143C")
      this.operate_element.getElementsByTagName("text")[1].setAttribute("fill", "#DC143C")
      this.dialogDbUpdate = false
    },
    cleanDbViz(){
      this.zoom_db = ""
      d3.select("#dbviz").selectAll("*").remove()
      this.svg_id = "#viz"
      this.svg_db = ''
    },
    cleanFuncViz(){
      this.zoom_func = ""
      d3.select("#funcviz").selectAll("*").remove()
      this.svg_id = "#viz"
      this.svg_db = ''
    },
    uploadIwd () {
      document.getElementById('fileInput').click()
    },
    async sendIwd(){
      let formData = new FormData()
      formData.append("files", this.file);
      formData.append("operate", "update_iwd")
      let config = {
        headers: {
        'Content-Type': 'multipart/form-data'
        }
      }

      await this.$http.post(this.$urls.db_tool_save, formData, config).then(
        (response)=>{
          this.dbs = response.data.content
          d3.select("#dbviz").selectAll("*").remove()
          this.createDbsChart(this.dbs)
          this.resetCoordinates()
          // console.log(response.data.content)
      }, (error) => {
      })
    },
    logs () {
      console.log(d3.select("#new").node())
    }

  }
}


</script>