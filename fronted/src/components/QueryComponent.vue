<template>
<div>
    <ErrorAlert v-model="errorTitle">{{ errorDetail }}</ErrorAlert>
    <ErrorAlert v-model="successTitle" type="success">{{ successDetail }}</ErrorAlert>
    <v-overlay :value="isLoading">
         <!-- <v-progress-linear indeterminate color="primary" rounded height="5" striped>
        </v-progress-linear> -->
          <v-progress-circular
          indeterminate
          size="64"
          color="primary"
        ></v-progress-circular>
    </v-overlay>


    <div v-for="(input, index) in inputs" :key="index">
        <v-form class="form" ref="form" lazy-validation v-model="valid"> 
            <v-container class="container">
                <v-row style="margin-left:-2em; align-self: auto" >

                    <v-col class="mt-2" >
                        <v-text-field required v-model="input.name" label="Attribute name" solo :rules="rules" :error-messages="errorTexts"></v-text-field>
                    </v-col>

                    <!-- OLD SOLUTION: GETTING ALL LOINCS ON CREATED() --> 
                    <!-- <v-col  class="mt-2">
                        <v-combobox clearable v-model="input.loincCode" :items="loincCodes"
                            :item-text="item => item.loincnum +' ('+ item.loinccomponent + ')'"
                            :item-value="item => item.loincnum" label="Search LOINC codes" solo return-object required :rules="rules" :error-messages="errorTexts">
                            <template v-slot:selection="{ attrs, item, selected }">
                                <v-chip v-if="item === Object(item)" v-bind="attrs" color="lighten-3"
                                    :input-value="selected" label small>
                                    <span>
                                        {{ item.loincnum }} ({{item.loinccomponent}})
                                    </span>
                                </v-chip>
                            </template>

                        </v-combobox>
                    </v-col> -->

                    <!-- GETTING LOINCS ON SERVER-SIDE SEARCH --> 
                    <v-col class="mt-2">
                        <v-combobox @blur="checkLoincInput(index)" @change="searchLoinc($event)" clearable v-model="input.loincCode" :items="currentLoincList"
                        :item-text="item => item.loincnum +' ('+ item.loinccomponent + ')'"
                            :item-value="item => item.loincnum" label="Search LOINC codes" solo prepend-inner-icon="mdi-magnify" return-object required :rules="rules" :error-messages="loincErrorTexts">
                            <template v-slot:selection="{ attrs, item, selected }">
                                <v-chip v-if="item === Object(item)" v-bind="attrs" color="lighten-3"
                                    :input-value="selected" label small>
                                    <span>
                                        {{ item.loincnum }} ({{item.loinccomponent}})
                                    </span>
                                </v-chip>
                            </template>
                        </v-combobox>
                    </v-col>

                    <v-col class="mt-2">
                        <v-text-field v-model="input.value.fromValue" :label="rangeQuery ? 'FROM value' :  'Value'"
                            solo :rules="rules" :error-messages="errorTexts" required></v-text-field>
                    </v-col>

                    <v-col class="mt-2">
                        <v-text-field v-show="rangeQuery" v-model="input.value.toValue" label="TO value" solo :rules="rules" :error-messages="errorTexts" required>
                        </v-text-field>

                        <!-- This is for the icons to be in the middle of the fields -->
                        <hr style="height:10px; visibility:hidden;" />

                        <span v-show="!rangeQuery" class="helperIcons">
                            <i class="round" @click="remove(index)" v-show="index || (!index && inputs.length > 1)">
                                <v-icon style="margin-right:0px">mdi-minus</v-icon>
                            </i>
                            <i class="round" @click="add(index)" v-show="index == inputs.length - 1">
                                <v-icon style="margin-right:0px">mdi-plus</v-icon>
                            </i>
                        </span>
                    </v-col>
                    
                    <!-- We have this extra column that we show when switching to range query to avoid the +- icons going below the query boxes -->
                    <v-col class="mt-2" v-show="rangeQuery" col="6" md="2">
                        <hr style="height:10px; visibility:hidden;" />
                       <span class="helperIcons">
                            <i class="round" @click="remove(index)" v-show="index || (!index && inputs.length > 1)">
                                <v-icon style="margin-right:0px">mdi-minus</v-icon>
                            </i>
                            <i class="round" @click="add(index)" v-show="index == inputs.length - 1">
                                <v-icon style="margin-right:0px">mdi-plus</v-icon>
                            </i>
                        </span>
                    </v-col>

                     <!-- <v-col align-self="baseline" cols="15"  md="3">
                         <div class="helperIcons">
                            <i class="round" @click="remove(index)" v-show="index || (!index && inputs.length > 1)">
                                <v-icon style="margin-right:0px">mdi-minus</v-icon>
                            </i>
                            <i class="round" @click="add(index)" v-show="index == inputs.length - 1">
                                <v-icon style="margin-right:0px">mdi-plus</v-icon>
                            </i>
                        </div>
                     </v-col> -->

                </v-row>

            </v-container>
        </v-form>

        <br />

    </div>

    <!-- <v-btn elevation="2" raised class="button" v-on:click="toggleQueryType()">
        {{rangeQuery ? "Point Query" : "Range Query"}}</v-btn> -->

    <br /> 


    <div style="display:flex row; float: left; margin-right:2em; margin-top: 8px; margin-left: 5.5em;">
        <v-btn elevation="2" raised class="fancyButton" v-on:click="submit()">
            <v-icon style="margin-right:0px">mdi-magnify</v-icon>Search
        </v-btn>

        <!-- CLEAR QUERIES -->
        <v-btn elevation="2" raised class="fancyButton" v-on:click="clearQueryData()">
            <v-icon style="margin-right:0px">mdi-table-row-remove</v-icon>Clear Query Data
        </v-btn>

        <!-- TEMOPORARY - SIMULATE PATRICK SENDING DATA TO THE BACKEND -->

        <v-btn elevation="2" raised class="fancyButton" @click="simulatePatrickSendingData()">
           Simulate Patrick sending data
        </v-btn>
        
        <v-btn elevation="2" raised class="fancyButton" @click="toggleThreshold">
           <v-icon style="margin-right:0px">mdi-tune</v-icon> Choose Thresholds
        </v-btn>

       
            
        <!-- <v-btn elevation="2" raised class="fancyButton" v-on:click="toggleQueryType()">
            <v-icon v-if="!rangeQuery" style="margin-right:0px; padding-right:5px; width: 160%;">mdi-toggle-switch-off</v-icon>
            <v-icon v-else style="margin-right:0px; padding-right:5px; width: 160%;">mdi-toggle-switch</v-icon>
        {{rangeQuery ? "Point Query" : "Range Query"}}</v-btn> -->

         <!-- <v-btn elevation="2" raised class="fancyButton" v-on:click="consoleLog()">Console Log</v-btn> -->
    </div>

    <div style="display:flex row;">
        <!-- <v-switch v-model="rangeQuery" inset  :label="rangeQuery ? 'Point Query' : 'Range Query'"></v-switch> -->
        <v-switch v-model="rangeQuery" inset  label="Range Query"></v-switch>
    </div>

<v-dialog v-model="showThreshold" max-width="600" transition="dialog-bottom-transition" >
     <v-card v-show="showThreshold" style="width: 600px; margin:auto; "
            elevation="2"
        >
            <v-toolbar
                color="primary"
                dark
                flat
                height="50px"
              >Choose your desired thresholds below</v-toolbar>
            <div style="padding: 60px 50px 30px 50px">
                <v-label>Overall expected hit ratio</v-label> <br/>
                <v-btn style="margin: 10px 0px 40px 0px;" rounded outlined @click="overallExpectedHitThreshold = !overallExpectedHitThreshold">  
                    <v-icon left>
                    mdi-pencil
                    </v-icon>
                    {{overallExpectedHitThreshold ? 'Hide thresholds' : 'Show thresholds'}} 
                </v-btn>
                <v-slider v-show="overallExpectedHitThreshold"
                    v-model="thresholdGoodValues"
                    label="😄 Good values"
                    thumb-label="always"
                    max="100"
                    min="0"
                    persistent-hint
                    hint="Values over this threshold would be considered good results."
                    color="green"
                    track-color="green"
                    thumb-color="green"
                >
                    <template v-slot:thumb-label="{ value }">
                        {{ value }}%
                    </template>
                </v-slider>
                <br/>
                <br/>
                <v-slider v-show="overallExpectedHitThreshold"
                    v-model="thresholdOkayValues"
                    label="🙂 Okay values"
                    thumb-label="always"
                    max="100"
                    min="0"
                    persistent-hint
                    hint="Values in between this threshold and the threshold above would be considered okay-ish results. Values below this threshold would be considered bad results 🙁 (and will be shown with color red)."
                    color="orange"
                    track-color="orange"
                    thumb-color="orange"
                >
                <template v-slot:thumb-label="{ value }">
                    {{ value }}%
                </template>
                </v-slider>
                <br/><br/>

                 <v-label>Hit ratio per LOINC</v-label> <br/>
                <v-btn style="margin: 10px 0px 40px 0px;" rounded outlined @click="overallExpectedHitsPerLoincThreshold = !overallExpectedHitsPerLoincThreshold">  
                    <v-icon left>
                    mdi-pencil
                    </v-icon>
                    {{overallExpectedHitsPerLoincThreshold ? 'Hide thresholds' : 'Show thresholds'}} 
                </v-btn>
                <v-slider v-show="overallExpectedHitsPerLoincThreshold"
                    v-model="thresholdGoodValuesPerLoinc"
                    label="😄 Good values"
                    thumb-label="always"
                    max="100"
                    min="0"
                    persistent-hint
                    hint="Values over this threshold would be considered good results."
                    color="green"
                    track-color="green"
                    thumb-color="green"
                >
                    <template v-slot:thumb-label="{ value }">
                        {{ value }}%
                    </template>
                </v-slider>
                <br/>
                <br/>
                <v-slider v-show="overallExpectedHitsPerLoincThreshold"
                    v-model="thresholdOkayValuesPerLoinc"
                    label="🙂 Okay values"
                    thumb-label="always"
                    max="100"
                    min="0"
                    persistent-hint
                    hint="Values in between this threshold and the threshold above would be considered okay-ish results. Values below this threshold would be considered bad results 🙁 (and will be shown with color red)."
                    color="orange"
                    track-color="orange"
                    thumb-color="orange"
                >
                <template v-slot:thumb-label="{ value }">
                    {{ value }}%
                </template>
                </v-slider>
                <br/><br/>


                <v-text-field required color="green" v-model="thresholdExpectedHits" label="Overall expected hits" hint="Values over this threshold will be considered good results and will appear with the color green." persistent-hint type="number"></v-text-field>
                <br/><br/>
                
                 <v-btn
                    text
                    color="primary"
                    @click="toggleThreshold"
                    >
                    Close
                </v-btn>
            </div>
        </v-card>
</v-dialog>

    <div style="margin: 2em; z-index:0">

        <!-- OLD TABLE -->
        <!-- <v-row align="center" justify="center">
            <v-col>
                <br />
                <br />
                <v-data-table id="rankingTable" v-if="datasetsLoaded" :headers="headers" :items="datasets" :items-per-page="5" 
                    class="elevation-1" style="margin-top:10px" fixed-header disable-sort >
                     <template v-slot:top>
                        <v-toolbar flat color="white">
                        <v-toolbar-title>Ranked Results</v-toolbar-title>
                        <v-spacer></v-spacer>
                        </v-toolbar>
                     </template>
                    <template v-slot:item="{ item }">
                        <tr  style="text-align: center;">
                            <td>{{ item.collectionId }}</td>
                            <td>{{ item.biobankId }}</td>
                             <td>   
                                {{ item.numberOfRows }}
                            </td>
                           
                            <td>
                               <v-chip style="margin:10px;" :color="getColor(item.overallPercentage * 100)" dark> {{ parseFloat(item.overallPercentage * 100).toFixed(2) }}% </v-chip>
                            </td>
                            <td>
                                <v-chip style="margin:10px;" :color="getColorForExpectedHits(item.overallExpectedRows)" dark> {{ Math.round(item.overallExpectedRows) }} </v-chip>
                            </td>

                             <td >
                                <v-chip style="margin:10px;" v-for="(row,index) in item.goodHits" :key="index" dark>
                                    <v-chip class="ma-2" small
                                        color="white"
                                        outlined>{{ row.code }}: 
                                    </v-chip>    
                                    {{Math.round(row.revisedNumberOfRows)}}</v-chip>
                            </td>
                            <td  >
                                 <v-chip style="margin:10px;" v-for="(row,index) in item.goodHits" :key="index" :color="getColor(row.goodValuesInPercentage * 100)" dark>
                                     <v-chip class="ma-2" small
                                        color="white"
                                        outlined>{{ row.code }}: 
                                    </v-chip>   
                                    {{ parseFloat(row.goodValuesInPercentage * 100).toFixed(2) }}%
                                </v-chip>
                            </td>
                        </tr>
                    </template>
                </v-data-table>
            </v-col>
        </v-row> -->

        <!-- NEW TABLE (EXPANDABLE)  -->
        <v-data-table 
            v-if="datasetsLoaded"
            id="rankingTable"
            :headers="headers2"
            :items="datasets" 
            :single-expand="false"
            :expanded.sync="expanded"
            item-key="biobankId"
            show-expand
            class="elevation-1"
            style="margin-top:10px;" 
            disable-sort
        >
        
        <template #item.overallPercentage="{value}">
            <td class="d-flex justify-center">
                <v-chip style="margin:10px;" :color="getColor(value * 100)" dark>  {{ parseFloat(value * 100).toFixed(2) }}% </v-chip>
            </td>
        </template>
            <template #item.overallExpectedRows="{item}">
            <td class="d-flex justify-center" >
                <v-chip style="margin:10px;" :color="getColorForExpectedHits(item.overallExpectedRows)" dark> {{ Math.round(item.overallExpectedRows) }} </v-chip>
            </td>
        </template>
    
      <template v-slot:top>
        <v-toolbar flat color="white">
          <v-toolbar-title>Ranked Results</v-toolbar-title>
          <v-spacer></v-spacer>
        </v-toolbar>
      </template>
      <template #expanded-item="{ headers, item }">
        <td  :colspan="headers.length ">
            <v-row >
                <v-col cols="12" md="6">
                   <h4 class="text" style="display:inline; ">Expected hits per LOINC: </h4>
                   <v-chip  style="margin:10px;"  v-for="(row,index) in item.goodHits" :key="index" dark>
                       <v-chip class="ma-2" small
                            color="white"
                            outlined>{{ row.code }}: 
                        </v-chip>  
                        {{Math.round(row.revisedNumberOfRows)}}</v-chip> 
                </v-col>
            </v-row>
            <v-divider></v-divider>
            <v-row >
                <v-col cols="12" md="6">
                    <h4 class="text" style="display:inline; margin-right:50px;">Hit ratio per LOINC: </h4>
                    <v-chip style="margin:10px;" v-for="(row,index) in item.goodHits" :key="index" :color="getColorPerLoinc(row.goodValuesInPercentage * 100)" dark>
                       <v-chip class="ma-2" small 
                            color="white"
                            outlined>{{ row.code }}: 
                        </v-chip> 
                        {{ parseFloat(row.goodValuesInPercentage * 100).toFixed(2) }}%
                    </v-chip>                
                </v-col>
            </v-row>
            <v-divider style="margin-bottom: 10px;"></v-divider>
            <v-row>
                 <v-col cols="12" md="6" style="margin-bottom:10px;">
                    <!-- <p style="display:inline; font-size: 0.9em;">Full collection? </p> -->
                    <h4 class="text" style="display:inline; ">Full collection? </h4>
                        <v-icon color="green" v-show="item.definitionId">mdi-checkbox-marked-circle</v-icon> 
                        <v-icon color="red" v-show="!item.definitionId">mdi-close-circle</v-icon>          
                </v-col>
            </v-row>
          <!-- <v-simple-table >
                  <thead  >
                    <tr>
                      <th>Expected hits per LOINC</th>
                      <th>Hit ratio per LOINC</th>
                     
                    </tr>
                  </thead>
                  <tbody>
                             <td >
                                <v-chip style="margin:10px;" v-for="(row,index) in item.goodHits" :key="index" dark>{{ row.code }}:  {{Math.round(row.revisedNumberOfRows)}}</v-chip>
                            </td>
                            <td  >
                                 <v-chip style="margin:10px;" v-for="(row,index) in item.goodHits" :key="index" :color="getColor(row.goodValuesInPercentage * 100)" dark>
                                     {{ row.code }}: {{ parseFloat(row.goodValuesInPercentage * 100).toFixed(2) }}%
                                </v-chip>
                            </td>

                  </tbody>
            </v-simple-table> -->
        </td>
      </template>
    </v-data-table>


    </div>

    <v-footer ref="footer" :absolute="true" :padless="true" class="footer">
        <h6 style="margin-left: 10px;font-family: 'Arial';">Master Thesis at University of Klagenfurt</h6>
        <v-spacer></v-spacer>
        <h6>Author: Blend Dehari (blendde@edu.aau.at)</h6>
        <v-spacer></v-spacer>
        <h6 style="margin-right: 10px;font-family: 'Arial';">All rights reserved.</h6>
    </v-footer>
</div>
</template>

<script>
import axios from 'axios'
import ErrorAlert from './ErrorAlert.vue'
// import { required } from 'vuelidate/lib/validators'


export default { 
    name: 'QueryComponent',
    components: { ErrorAlert },

      data() {
          return {
              url: 'http://localhost:5001',
              valid: true,
              isLoading: false,
              errorTitle: '',
              errorDetail: '',
              successTitle: null,
              successDetail: null,
              rules: [
                v => !!v || 'Required',
              ],
              errorTexts:'',
              loincErrorTexts: '',
              inputs: [{
                  name: '',
                  loincCode: '',
                  value: {
                      fromValue: '',
                      toValue: ''
                  },
              }],
              rangeQuery: false,
              fullPage: true,
              loincCodes: [],
              loincsLoaded: false,
              currentLoincList: [],
              datasetsLoaded: false,
              datasets: [],

              showThreshold: false,
              thresholdGoodValues: 50,
              thresholdOkayValues: 25,
              thresholdGoodValuesPerLoinc: 50,
              thresholdOkayValuesPerLoinc: 25,
              detailedView: false,
              thresholdExpectedHits: 0,
              expanded: [],
              overallExpectedHitThreshold: false,
              overallExpectedHitsPerLoincThreshold: false,
              temporaryFakeDatasets: [
    {
        "biobankId": "biobank_6",
        "collectionId": "collection_6",
        "numberOfRows": 46,
        "goodHits": [
            {
                "code": "10156-8",
                "goodValuesInPercentage": 0.0625,
                "revisedNumberOfRows": 2.875
            }
        ],
        "overallPercentage": 0.0625,
        "overallExpectedRows": 2.875
    },
    {
        "biobankId": "biobank_1",
        "collectionId": "collection_1",
        "numberOfRows": 15,
        "goodHits": [
            {
                "code": "10156-8",
                "goodValuesInPercentage": 0.1111111111111111,
                "revisedNumberOfRows": 1.6666666666666665
            }
        ],
        "overallPercentage": 0.1111111111111111,
        "overallExpectedRows": 1.6666666666666665
    }
],

            //   datasets2: [],
              headers: [
                //   {
                //       text: 'Definition ID',
                //       align: 'left',
                //       sortable: true,
                //       value: 'definitionId',
                //       width: '200',
                      
                //   },
                  {
                      text: 'Collection ID',
                      value: "collectionId",
                      align: 'center',
                       width: '200',
                  },
                  {
                      text: 'Biobank name',
                      value: "biobankId",
                      align: 'center',
                       width: '200',
                  },
                  {
                      text: 'Number of rows matched',
                      value: "numberOfRows",
                      align: 'center',
                      width: '300',
                  },
                //   {
                //       // this means the "Rows matched within the Number of rows returned"
                //       text: 'Revised number of rows',
                //       value: 'revisedRows',
                //       align: 'center',
                //        width: '200',
                //   },
                //   {
                //       text: 'Ratio of values matched',
                //       value: "probability",
                //       width: '200',
                //       align: 'center',
                     
                //   },
                {
                    text: 'Overall hit ratio',
                    value: 'overallPercentage',
                    align: 'center',
                    width: '300',
                },
                {
                    text: 'Overall expected hits',
                    value: 'overallExpectedRows',
                    align: 'center',
                    width: '300',
                },
                  // Support for multiple LOINC codes
                {
                      // this means the "Rows matched within the Number of rows returned"
                    text: 'Expected hits per LOINC',
                    value: 'revisedRows',
                    align: 'center',
                    width: '400',
                },
                {
                    text: 'Hit ratio per LOINC',
                    value: "probability",
                    width: '400',
                    align: 'center',
                     
                },
                
              ],
              headers2: [
                   {
                      text: 'Collection ID',
                      value: "collectionId",
                      align: 'center',
                    //    width: '200',
                  },
                  {
                      text: 'Biobank name',
                      value: "biobankId",
                      align: 'center',
                    //    width: '200',
                  },
                  {
                      text: 'Number of rows matched',
                      value: "numberOfRows",
                      align: 'center',
                    //   width: '300',
                  },
                {
                    text: 'Overall hit ratio',
                    value: 'overallPercentage',
                    align: 'center',
                    // width: '300',
                },
                {
                    text: 'Overall expected hits',
                    value: 'overallExpectedRows',
                    align: 'center',
                    // width: '300',
                },
              ],

          }
      },
    //    validations: {
    //         inputs: [{
    //             name: {required},
    //             loincCode: {required},
    //             value: {
    //                 fromValue: {required},
    //                 tovalue: {required}
    //             }

    //         }]
    //     },

    //   created() {
    //       this.getLoincs()
    //   },
      methods: {
          add() {
              this.inputs.push({
                  name: "",
                  loincCode: '',
                  value: {
                      fromValue: '',
                      toValue: ''
                  },
              })
          },
          remove(index) {
              this.inputs.splice(index, 1)
          },

          async simulatePatrickSendingData() {
              await axios.post(`${this.url}/api/saveData`)
          },
          consoleLog() {
            //   this.validateForm()
              for (let input of this.inputs) {
                  if (!input.value.toValue) {
                      input.value['toValue'] = input.value['fromValue']
                  }
                  else if (!this.rangeQuery) {
                     input.value['toValue'] = input.value['fromValue']
                  }
              }
              console.log(this.inputs)

          },
          toggleQueryType() {
              //   let copyInputs = [... inputs]
              //   copyInputs[index] = { rangeQuery: !rangeQuery }
              // console.log(input)
              // this.$set(this.inputs, index, input.rangeQuery = !input.rangeQuery)
              this.rangeQuery = !this.rangeQuery
          },
          validateForm() {
            //    if (this.$refs.form.validate()) {
            //         this.snackbar = true
            //     }
               for (let input of this.inputs) {
                      if (input.name === "" || input.loincCode === "" || input.value.fromValue === "" || input.value.toValue === "") {
                           this.valid = false
                           this.errorTexts = "Required"
                           this.loincErrorTexts = "Required"
                           setTimeout(() => this.errorTexts = "", 2000)
                           setTimeout(() => this.loincErrorTexts = "", 2000)
                           throw 'Please fill in all the fields!'
                      } 
               }
          },

          async submit() {
              try {
                this.isLoading = true
                for (let input of this.inputs) {
                    if (!input.value.toValue) {
                        input.value['toValue'] = input.value['fromValue']
                    }
                    else if (!this.rangeQuery) {
                        input.value['toValue'] = input.value['fromValue']
                    }
                }
                //   console.log(this.inputs)
                this.validateForm()
                const data = [... this.inputs]
                console.log("DATA TO BACKEND", data)
                const res = await axios.post(`${this.url}/api/data`, data)
                //   await new Promise(r => setTimeout(r, 1000));
                // this.datasets = res.data
                this.datasetsLoaded = true
                this.datasets = res.data
                console.log('RESULTS FROM BACKEND', this.datasets)
                this.successTitle = 'Query matched successfully!'
                this.successDetail = 'See ranked results in the table below'
                setTimeout(() => this.successTitle = "", 4000)
                setTimeout(() => this.successDetail = "", 4000)
                this.isLoading = false
              } catch (error) {
                  this.isLoading = false
                  this.datasetsLoaded = false
                  this.errorTitle = 'Something went wrong!'

                  console.log("ERROR HERE", error)

                  if (error.response) {
                      this.errorDetail = error.response.data.error;
                  } else {
                      this.errorDetail = error;
                  }
              }
          },
        //   async getLoincs() {
        //       try {
        //           const res = await axios.get(`http://localhost:5000/api/loincs`)
        //           this.loincCodes = res.data
        //           this.loincsLoaded = true
        //       } catch (error) {
        //           this.isLoading = false
        //           this.errorTitle = 'Something went wrong!'

        //           if (error.response) {
        //               this.errorDetail = error.response.data.error;
        //           } else {
        //               this.errorDetail = error;
        //           }
        //       }
        //   },
          async searchLoinc(event) {
              try {
                  console.log('search LOINC:', event)
                //   console.log('THIS', this.inputs)
                  let loincCode = event
                  if (typeof loincCode == 'string') {
                      const res = await axios.get(`${this.url}/api/loinc?code=${loincCode}`)
                      if (res?.status === 200) {
                          this.currentLoincList = res.data
                      }
                  }
              }
              catch(error) {
                  console.log('comes here?')
                  console.log(error)
                  this.currentLoincList = []
                  this.loincErrorTexts = "LOINC code does not exist! Please try another one."
                  setTimeout(() => this.loincErrorTexts = "", 4000)
                //   this.errorTitle = 'Something went wrong!'

                //   if (error.response) {
                //       this.errorDetail = error.response.data.error;
                //   } else {
                //       this.errorDetail = error;
                //   }
              }
          },
          checkLoincInput(index) {
              if (typeof this.inputs[index].loincCode != "object") {
                  //this will force a selection on the combobox
                  this.inputs[index].loincCode = ''
                //   this.validateForm()
              }
          },
          clearQueryData() {
            this.inputs = [{
                  name: '',
                  loincCode: '',
                  value: {
                      fromValue: '',
                      toValue: ''
                  },
              }],
              this.datasetsLoaded = false
          },
          getColor(hits) {
              if (hits >= this.thresholdGoodValues) return 'green'
              else if (hits >= this.thresholdOkayValues) return 'orange'
              else return 'red'
          },
          getColorForExpectedHits(hits) {
              if (hits >= this.thresholdExpectedHits) return 'green'
              else return 'red'
          },
          getColorPerLoinc(hits) {
              if (hits >= this.thresholdGoodValuesPerLoinc) return 'green'
              else if (hits >= this.thresholdOkayValuesPerLoinc) return 'orange'
              else return 'red'
          },
          toggleThreshold() {
              this.showThreshold = !this.showThreshold
              this.overallExpectedHitThreshold = false
              this.overallExpectedHitsPerLoincThreshold = false
          },
        //   expandRow(event, item) {
        //       console.log('item', item)
        //       console.log('event', event)
        //       console.log('event expanded', event.isExpanded)
        //     if (event.isExpanded) {
        //         const index = this.expanded.findIndex(i => i === item);
        //         this.expanded.splice(index, 1)
        //     } else {
        //         this.expanded.push(item);
        //     }
        //   },
        //   showDetails() {
        //       this.detailedView = true
        //   },
      },
      computed: {
          errorMessages() {
              return ' <span style="font-size:14pt;font-weight:bold;"> ' + this.errorTitle + ' </span><br> ' + this.errorDetail;
          },
      }
  }
</script>

<style>
.container {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: center;
    align-items: flex-start;
    align-content: flex-start;
    gap: 10px 20px;
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
.combobox {
    width: 50%;
    margin-left: 2em;
    position: relative;
}
.text-field-name {
    width: 50%;
    margin-left: 2em;
    position: relative;
}

.helperIcons {
    cursor: pointer;
}
.round {
  -webkit-border-top-left-radius: 1px;
  -webkit-border-top-right-radius: 2px;
  -webkit-border-bottom-right-radius: 3px;
  -webkit-border-bottom-left-radius: 4px;

  -moz-border-radius-topleft: 1px;
  -moz-border-radius-topright: 2px;
  -moz-border-radius-bottomright: 3px;
  -moz-border-radius-bottomleft: 4px;

  border-top-left-radius: 1px;
  border-top-right-radius: 2px;
  border-bottom-right-radius: 3px;
  border-bottom-left-radius: 4px;
  background-color:  #D3D3D3;
  border-radius: 100%;
  /* width: 100%; */
  padding: 0.2em;
  padding-bottom: 0.3em;
  margin: 0.2em;
  position: relative;
}
.round:hover {
    background-color: #A9A9A9;
}
.form {
    margin-top: 2em
}
.text {
    font-size: 1.1em;
    font-family: "Arial";
    font-weight: normal ;
    letter-spacing: 0 ;
    text-transform: none ;
}
#rankingTable table thead tr th {
    background-color: rgba(182, 183, 187);
    color: white;
    font-size: 1.3em;
    font-family: "Arial";
    font-weight: normal ;
    letter-spacing: 0 ;
    text-transform: none ;
}
#rankingTable table tr td {
    font-size: 1.1em;
    font-family: "Arial";
    font-weight: normal ;
    letter-spacing: 0 ;
    text-transform: none ;
}
.fancyButton {
  height: 48px !important;
  background: linear-gradient(0deg, #efefef 0%, #ffffff 100%) !important;
  border: thin #dddddd solid !important;
  display: flex row !important;
  justify-content: space-around !important;
  align-items: center !important;
  border-radius: 5px !important;
  font-family: "Arial";
  font-size: 12pt !important;
  font-weight: normal !important;
  letter-spacing: 0 !important;
  text-transform: none !important;
  margin-left: 2em
}
.testClass {
    border-color: red;
    color: red;
    background-color: red;
    background: red;
}
</style>