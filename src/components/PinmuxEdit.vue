<template>
  <div class="pinmux">
    <v-app id="pinmux">
        <v-dialog
            v-model="dialog"
            max-width="700px"
        >
            <v-card>
                <v-card-title>
                    <span class="headline">New Pinmux Template</span>
                </v-card-title>

                <v-card-text>
                    <v-container>
                        <v-row>
                            <v-col
                            cols="12"
                            sm="6"
                            md="4"
                            >
                            <v-select
                                v-model="asicSelect"
                                :items="asic"
                                label="asic"
                                dense
                                outlined
                            ></v-select>
                            </v-col>
                            <v-text-field
                                v-model="templateName"
                                label="new name"
                            ></v-text-field>
                        </v-row>
                        <v-file-input
                            v-model="files"
                            color="deep-purple accent-4"
                            counter
                            label="File input"
                            multiple
                            placeholder="Select your pinmux xlsx"
                            prepend-icon="mdi-paperclip"
                            outlined
                            :show-size="1000"
                        >
                            <template v-slot:selection="{ index, text }">
                            <v-chip
                                v-if="index < 2"
                                color="deep-purple accent-4"
                                dark
                                label
                                small
                            >
                                {{ text }}
                            </v-chip>
                            <span
                                v-else-if="index === 2"
                                class="overline grey--text text--darken-3 mx-2"
                            >
                                +{{ files.length - 2 }} File(s)
                            </span>
                            </template>
                        </v-file-input>
                    </v-container>
                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                    color="blue darken-1"
                    text
                    @click="close"
                    >
                    Cancel
                    </v-btn>
                    <v-btn
                    color="blue darken-1"
                    text
                    @click="upload"
                    >
                    Upload
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-app>
  </div>
</template>

<script>

export default {
  data () {
    return {
      dialog: false,
      asic: ['xenon', 'radon'],
      asicSelect: '',
      templateName: '',
      files: [],
    }
  },
  methods: {
    close () {
      this.dialog = false
    },
    async upload () {
      let formData = new FormData()
      formData.append("files", this.files[0]);
      formData.append("asic", this.asicSelect)
      formData.append("file_name", this.templateName)
      formData.append("date", this.$common.getTime())
      let config = {
        headers: {
        'Content-Type': 'multipart/form-data'
        }
      }

      await this.$http.post(this.$urls.pinmux_save, formData, config).then(
        (response)=>{
          console.log(response.data)
      }, (error) => {
        console.log(error)
      })
      setTimeout(() =>{
        this.$emit('initialize')
        this.dialog = false
      },1000)
    },
  },
}
</script>


