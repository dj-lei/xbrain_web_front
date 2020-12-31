<template lang="pug">
  v-app(dark)
    //- NavHeader
    //- v-navigation-drawer(
    //-   dark
    //-   app
    //-   clipped
    //-   )
    //-   draggable(class="list-group" :list="list1" group="people")
    //-     template(v-for="(element, index) in list1")
    //-       v-text-field(:value="element.name" readonly solo outlined)
    //- v-main(ref='content')
    //-   draggable(class="list-group" :list="list2" group="people")
    //-     template(v-for="(element, index) in list2")
    //-       v-text-field(:value="element.name") {{ element.name }} {{ index }}
    v-row
      v-col
        v-card-text
          v-treeview(
            dense
            activatable
            color="warning"
            :items="items"
            item-text="key"
            selected-color="indigo"
            open-on-click
            transition
          )
            template(v-slot:label="{ item }")
              draggable(class="list-group" :group="{ name: 'people', pull: 'clone', put: false }")
                template(v-if="item.children")
                  v-text-field(:key="item.id" :value="item.key" readonly solo outlined)
                template(v-else)
                  template(v-if="item.type === 'string'")
                    v-text-field(:value="item.key +`: `+ item.value" readonly solo outlined)
                  template(v-else-if="item.type === 'int'")
                    v-text-field(:value="item.key +`: `+ item.value" readonly solo outlined)
                  template(v-else-if="item.type === 'list'")
                    v-autocomplete(:prefix="item.key+`: `" v-model="item.value" :items="item.range" outlined)
                //- v-icon mdi-bookmark

      v-divider(vertical)
      v-col(cols="12" md="9")
        v-card-text
          draggable(class="list-group" group="people")
</template>

<script>
import draggable from "vuedraggable"

export default {
  components: {
    draggable
  },
  data () {
    return {
      items: [
        {
          id: 1,
          key: 'Applications',
          children: [
            { id: 2, type:'list', key: 'Calendar', value: 'b', range:['a','b','c']},
            { id: 3, type:'string', key: 'Chrome', value: 'b'},
            { id: 4, type:'int', key: 'Webstorm', value: 12},
          ],
        },
        {
          id: 5,
          key: 'Documents',
          children: [
            {
              id: 6,
              key: 'vuetify',
              children: [
                {
                  id: 7,
                  key: 'src',
                  children: [
                    { id: 8, type:'string', key: 'index', value: 'd'},
                    { id: 9, type:'string', key: 'bootstrap', value: 'e'},
                  ],
                },
              ],
            },
            {
              id: 10,
              key: 'material2',
              children: [
                {
                  id: 11,
                  key: 'src',
                  children: [
                    { id: 12, type:'string', key: 'v-btn', value: 'f' },
                    { id: 13, type:'string', key: 'v-card', value: 'g' },
                    { id: 14, type:'string', key: 'v-window', value: 'h' },
                  ],
                },
              ],
            },
          ],
        },
      ],
    }
  },
}

  </script>
