<template lang="pug">
  .mind
    v-app
      div(id="map" style="width:100%;height:500px")
</template>

<script>
import MindElixir from "mind-elixir"

export default {
  props: {
    nodeData: {
      type: Object,
      default () {
        return {}
      }
    }
  },
  data () {
    return {
      dialog: false,
      mind: '',
    }
  },
  mounted() {
    this.mind = new MindElixir({
      el: '#map',
      direction: 2,
      // create new map data
      data: MindElixir.new('new topic'),
      // or set as data that is return from `.getAllData()`
      draggable: true, // default true
      contextMenu: true, // default true
      toolBar: true, // default true
      nodeMenu: true, // default true
      keypress: true, // default true
      locale: 'en', // [zh_CN,zh_TW,en,ja] 
      allowUndo: false,
    })
    this.mind.init()

    // this.mind.bus.addListener('selectNode', node => {
    //   console.log(node)
    // // console.log(this.mind.getAllDataString())
    //   this.dialog = true
    // })
  },
  watch:{
    nodeData(val) {
      this.mind.nodeData = val
      this.mind.init()
    }
  },
  methods: {
    getAllData () {
      return this.mind.getAllData()
    },
  },
}
</script>

<style>
#mind {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #c0392c;
  margin-top: 60px;
}
</style>

