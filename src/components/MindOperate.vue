<template>
  <div class="mind">
    <v-app id="mind">
      <div id="map" style="width:100%;height:500px"></div>
      <v-row justify="center">
        <v-dialog
          v-model="dialog"
          fullscreen
          eager
          hide-overlay
          transition="dialog-bottom-transition"
        >
          <v-card>
            <v-toolbar
              dark
              color="primary"
            >
              <v-btn
                icon
                dark
                @click="dialog = false"
              >
                <v-icon>mdi-close</v-icon>
              </v-btn>
              <v-toolbar-title>Settings</v-toolbar-title>
              <v-spacer></v-spacer>
              <v-toolbar-items>
                <v-btn
                  dark
                  text
                  @click="print_data"
                >
                  Save
                </v-btn>
              </v-toolbar-items>
            </v-toolbar>
            <v-data-table
              v-model="selected"
              :headers="headers"
              :items="desserts"
              item-key="name"
              show-select
              class="elevation-1"
            >
            </v-data-table>
          </v-card>
        </v-dialog>
      </v-row>
    </v-app>
  </div>
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
      notifications: false,
      sound: true,
      widgets: false,
      mind: '',
      // nodeData: '',
      selected: [],
      headers: [
          {
          text: 'Dessert (100g serving)',
          align: 'start',
          sortable: false,
          value: 'name',
          },
          { text: 'Calories', value: 'calories' },
          { text: 'Fat (g)', value: 'fat' },
          { text: 'Carbs (g)', value: 'carbs' },
          { text: 'Protein (g)', value: 'protein' },
          { text: 'Iron (%)', value: 'iron' },
      ],
      desserts: [
          {
          name: 'Frozen Yogurt',
          calories: 159,
          fat: 6.0,
          carbs: 24,
          protein: 4.0,
          iron: '1%',
          },
          {
          name: 'Ice cream sandwich',
          calories: 237,
          fat: 9.0,
          carbs: 37,
          protein: 4.3,
          iron: '1%',
          },
          {
          name: 'Eclair',
          calories: 262,
          fat: 16.0,
          carbs: 23,
          protein: 6.0,
          iron: '7%',
          },
          {
          name: 'Cupcake',
          calories: 305,
          fat: 3.7,
          carbs: 67,
          protein: 4.3,
          iron: '8%',
          },
          {
          name: 'Gingerbread',
          calories: 356,
          fat: 16.0,
          carbs: 49,
          protein: 3.9,
          iron: '16%',
          },
          {
          name: 'Jelly bean',
          calories: 375,
          fat: 0.0,
          carbs: 94,
          protein: 0.0,
          iron: '0%',
          },
          {
          name: 'Lollipop',
          calories: 392,
          fat: 0.2,
          carbs: 98,
          protein: 0,
          iron: '2%',
          },
          {
          name: 'Honeycomb',
          calories: 408,
          fat: 3.2,
          carbs: 87,
          protein: 6.5,
          iron: '45%',
          },
          {
          name: 'Donut',
          calories: 452,
          fat: 25.0,
          carbs: 51,
          protein: 4.9,
          iron: '22%',
          },
          {
          name: 'KitKat',
          calories: 518,
          fat: 26.0,
          carbs: 65,
          protein: 7,
          iron: '6%',
          },
      ],
    }
  },
  mounted() {
    this.mind = new MindElixir({
      el: '#map',
      direction: 2,
      // create new map data
      data: MindElixir.new('new topic'),
      // or set as data that is return from `.getAllData()`
      draggable: false, // default true
      contextMenu: false, // default true
      toolBar: false, // default true
      nodeMenu: false, // default true
      keypress: true, // default true
      locale: 'en', // [zh_CN,zh_TW,en,ja] 
      allowUndo: false,
    })
      // this.mind.nodeData = this.nodeData
    this.mind.init()

    this.mind.bus.addListener('selectNode', node => {
    console.log(node)
    // console.log(this.mind.getAllDataString())
    this.dialog = true
    })
  // get a node
  // E('node-id')
  },
  watch:{
    nodeData(val) {
      this.mind.nodeData = val
      this.mind.init()
    }
  },
  methods: {
    print_data () {
      this.mind.nodeData = this.nodeData
      this.mind.init()
      this.dialog = false
      console.log(this.selected)
    }
  },
}
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
