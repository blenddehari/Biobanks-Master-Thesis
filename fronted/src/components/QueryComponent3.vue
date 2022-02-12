<template>
<div>
    <v-alert :value="errorTitle!==''" :v-if="errorTitle!==''" type="error" dismissible flat class="notification" prominent><span v-html="errorMessages"></span></v-alert>
   <v-progress-linear v-show="isLoading"
        indeterminate
        color="primary"
        rounded
        height="5"
        striped
    >
    </v-progress-linear>


 <!-- <div v-for="(input, index) in inputs" :key="index"> -->
    <!-- <v-combobox
        clearable
        v-model="input.loincCode"
        :items="itemList"
        :item-text="item => item.loincnum +' - '+ item.loinccomponent"
        :item-value="item => item.loincnum"
        label="Search LOINC codes"
        return-object
    >
    <template v-slot:selection="item">
        {{item.loincnum}}
    </template>
    </v-combobox> -->
 <!-- </div> -->

<div v-for="(input, index) in inputs" :key="index">

    <div class="dropdown">
        <input v-model.trim="inputValue" v-if="Object.keys(selectedItem).length === 0" ref="dropdowninput" class="dropdown-input" type="text" placeholder="Search LOINC code" />
        <div v-else @click="resetItem" class="dropdown-selected">
        {{ `${selectedItem.loincnum} (${selectedItem.loinccomponent})` }}
        </div>
        <div v-show="inputValue && loincsLoaded" class="dropdown-list">
        <div v-show="itemVisible(item)" v-for="item in itemList" @click="selectItem(item)" :key="item.loincnum" class="dropdown-item">
            {{ `${item.loincnum} (${item.loinccomponent})` }}
        </div>
        </div>
    </div>

</div>
 <button class="button2" @click="submit()">Submit</button>

  <div>
    <v-btn
        elevation="2"
        raised
        class="button"
        v-on:click="showData()"
        ><v-icon style="margin-right:0px">mdi-magnify</v-icon>Search</v-btn>
        <!-- MYSERVICES BUTTON STYLE -->
        <!-- <v-btn id="btnCreate" class="gradientButton" elevation="0" style="height:40px;font-size:12pt;margin-right:10px" @click="addNewProvider"><v-icon>mdi-plus</v-icon><span class="d-none d-md-inline">{{$t('text.btnAddServiceProvider')}}</span></v-btn> -->
  </div>

   <div style="margin: 2em; z-index:0">
    <v-row align="center" justify="center">
        <v-col>
          <!-- <v-card class="tableCard"> -->
            <br/>
             <br/>
            <v-label v-if="datasetsReady">Ranked Results:</v-label>
                <v-data-table v-if="datasetsReady"
                    :headers="headers"
                    :items="datasets"
                    :items-per-page="5"
                    class="elevation-1"
                    style="margin-top:10px"
                    fixed-header  disable-sort
                    >
                    <template v-slot:item="{ item }">
                        <tr > 
                        <td >{{ item.indexId }}</td>
                        <td >{{ item.collectionId }}</td>
                        <td >{{ item.collectionName }}</td>
                         <td>
                            <v-chip
                            :color="getColor(item.possibleHits)"
                            dark
                            >
                            {{ item.possibleHits }}
                            </v-chip>
                         </td>
                        <!-- <td >{{ item.possibleHits }}</td>  -->
                        </tr>
                    </template>
                </v-data-table>
            <!-- </v-card> -->
        </v-col>
      </v-row>
    </div>
</div>
</template>

<script>
import axios from 'axios'

export default { 
  name: 'QueryComponent', 

  data () {
    return {
      isLoading: false,
      errorTitle: '',
      errorDetail: '',
      inputs: [
          {
              name: '',
              loincCode: '',
              value: ''
          }
      ],
      fullPage: true,
      itemList: [],
      selectedItems: [
          {

          }
      ],
      selectedItem: {},
      loincsLoaded: false,
      apiUrl: 'https://restcountries.com/v2/all',
      inputValue: '',
      datasetsReady: false,
      datasets: [],
      headers: [
        {
          text: 'Index ID',
          align: 'left',
          sortable: true,
          value: 'indexId',
          width: '200'
        },
        { text: 'Collection ID',  value: "collectionId"},
        { text: 'Collection Name', value: "collectionName" },
        { text: 'Possible hits', value: "possibleHits" },
      ],
    }
  },  

  mounted () {
    // this.getList()
    this.getLoincs()
},
methods: {
//   async getList () {
//     // axios.get(this.apiUrl).then( response => {
//     //   this.itemList = response.data
//     //   this.apiLoaded = true
//     // console.log('HERE ', response)
//     // })
//     const response = await axios.get(this.apiUrl) 
//     this.itemList = response.data
//     this.apiLoaded = true
//     console.log('HERE 1', response.data)
//   },
  itemVisible (item) {
    let currentCode = item.loincnum.toLowerCase()
    // let currentName = item.loinccomponent.toLowerCase()
    let currentInput = this.inputValue.toLowerCase()
    // return currentName.includes(currentInput) || currentCode.includes(currentInput)
    return currentCode.includes(currentInput)
  },
  selectItem (theItem) {
    this.selectedItem = theItem
    this.inputValue = ''
    this.$emit('on-item-selected', theItem)
  },
  resetItem () {
    this.selectedItem = {}
    this.$nextTick( () => this.$refs.dropdowninput.focus() )
    this.$emit('on-item-reset')
  },
  submit() {
    //    for (let input of this.inputs) {
    //       if (!input.value.toValue) {
    //           input.value['toValue'] = input.value['fromValue']
    //       }
    //   }
      console.log(this.selectedItem.loincnum)
  },
    async showData() {
        try {
            this.isLoading = true
            // this.datasets = await DatasetService.getRankedDatasets()
            const res =  await axios.get(`http://localhost:5000/api/data`)
            await new Promise(r => setTimeout(r, 1000));

            // this.datasets = res.data
            this.datasetsReady = true
            this.datasets = res.data
            this.isLoading = false
        } 
        catch(error) {
            this.isLoading = false
            this.errorTitle = 'Something went wrong!'

            if (error.response) {
            this.errorDetail = error.response.data.error;
            } else {
            this.errorDetail = error;
            }
        }
    },
    async getLoincs() {
        try {
            const res =  await axios.get(`http://localhost:5000/api/loincs`)
            this.itemList = res.data
            this.loincsLoaded = true            
        } 
        catch(error) {
            this.isLoading = false
            this.errorTitle = 'Something went wrong!'

            if (error.response) {
            this.errorDetail = error.response.data.error;
            } else {
            this.errorDetail = error;
            }
        }
    },
    getColor (hits) {
      if (hits > 15) return 'green'
      else if (hits > 10) return 'orange'
      else return 'red'
    },
},
computed: {
     errorMessages() {
      return ' <span style="font-size:14pt;font-weight:bold;"> ' + this.errorTitle + ' </span><br> ' + this.errorDetail;
    },
}
}
</script>

<style>
 .dropdown{
  position: relative;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  margin-top: 3em;
}
.dropdown-input, .dropdown-selected{
  width: 100%;
  padding: 10px 16px;
  border: 1px solid transparent;
  background: #edf2f7;
  line-height: 1.5em;
  outline: none;
  border-radius: 8px;
}
.dropdown-input:focus, .dropdown-selected:hover{
  background: #fff;
  border-color: #e2e8f0;
}
.dropdown-input::placeholder{
  opacity: 0.7;
}
.dropdown-selected{
  font-weight: bold;
  cursor: pointer;
}
.dropdown-list{
  position: absolute;
  width: 100%;
  max-height: 500px;
  margin-top: 4px;
  overflow-y: auto;
  background: #ffffff;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  z-index:999
}
.dropdown-item{
  display: flex;
  width: 100%;
  padding: 11px 16px;
  cursor: pointer;
}
.dropdown-item:hover{
  background: #edf2f7;
}
.dropdown-item-flag{
  max-width: 24px;
  max-height: 18px;
  margin: auto 12px auto 0px;
}
.tableCard {
  border-radius:5px;
  background-color:#808080 !important;
  top: 0px;
}
.tableCard span {
  white-space: nowrap;
  text-overflow: ellipsis;
}
.button {
    margin-left: 2em
}
.gradientButton {
  min-height: 48px !important;
  background: linear-gradient(0deg, #efefef 0%, #ffffff 100%) !important;
  border: thin #dddddd solid !important;
  display: flex !important;
  /*justify-content: space-around !important;*/
  align-items: center !important;
  border-radius: 5px !important;
  font-family: "Inter";
  font-size: 12pt !important;
  text-transform: none !important;
  letter-spacing: 0px !important;
}
</style>