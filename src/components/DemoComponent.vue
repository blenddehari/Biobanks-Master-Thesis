<template>
  <div class="container">
    <h1>Datasets</h1>
     <p class="text">dataset1:</p>
     <p class="text" v-for="(el) in dataset1" :key="el.id">{{el}}</p>
     <p class="text">dataset2:</p>
     <p class="text" v-for="(el) in dataset2" :key="el.id">{{el}}</p>
    <h1>Ranked Datasets</h1>
    <p class="error" v-if="error">{{error}}</p>
    
    <!-- <select class="select"  v-model="selectedMethod"  >
      <option disabled value="">Which Data Quality metric is more important for you?</option>
       <option v-for="method in methods" v-bind:value="method.value" v-bind:key="method">
         {{ method.name }}
       </option>
    </select>
    <button class="button" v-on:click="showData()">Rank Datasets</button> -->
    
     <v-select
            outlined
            item-text="name"
            item-value="value"
            :items="methods"
            v-model="selectedMethod"
            return-object
            single-line
            label="Which Data Quality metric is more important for you?"
          ></v-select>
      <v-btn
        elevation="2"
        raised
        v-on:click="showData()"
      >Rank Datasets</v-btn>

       <v-card v-if="datasetsReady"                                                                                                                                                                                                                                                                                                                                                                                                                                                   style="margin-top:30px"
          max-width="600"
          tile
        >
      <v-list-item >
       <v-list-item three-line>
        <v-list-item-content>
          <v-list-item-title>1: {{datasets.ranking['1']}}</v-list-item-title>
          <v-list-item-title>2: {{datasets.ranking['2']}}</v-list-item-title>
          <br>
          <v-list-item-subtitle>
            Reason for this ranking: {{datasets.reason}}
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
      </v-list-item>
    </v-card>

   <!-- <div class="datasets-container" v-if="datasetsReady">
      <div class="dataset" >
      <p class="text">1: {{datasets.ranking['1']}}</p>
      <p class="text">2: {{datasets.ranking['2']}}</p>
      <p class="text" style="padding-top:10px">Reason for this ranking: {{datasets.reason}}</p>
    </div>
  </div> -->
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'DemoComponent',
  data() {
    return {
      datasets: [],
      datasetsReady: false,
      error: '',
      methods: [{
        name: 'Data Accuracy',
        value: 'dataAccuracy'
      },
      {
        name: 'Data Completeness',
        value: 'dataCompleteness'
      }
      ],
      selectedMethod: '',
      dataset1: [],
      dataset2: []
    }
  },
  async mounted() {
    try {
      const res =  await axios.get('http://localhost:5000/api/datasets/')
      this.dataset1 = res.data[0].dataset1
      this.dataset2 = res.data[1].dataset2
    } catch(err) {
       this.error = err.message
    }
  },
  methods: { 
    async showData() {
      try {
        // this.datasets = await DatasetService.getRankedDatasets()
        const res =  await axios.get(`http://localhost:5000/api/datasets/ranked/${this.selectedMethod.value}`)
        this.datasets = res.data
        this.datasetsReady = true
      } catch(err) {
          this.error = err.message
        }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
div.container {
  max-width: 800px;
  margin-top: 10px;
}
p.error {
  border: 1px solid #ff5b5f
}
div.dataset {
  position: relative;
  border: 1px solid #5bd658;
  background-color: #bcffb8;
  padding: 10px 10px 30px 10px;
  margin-bottom: 15px;
  margin-top: 10px;
}
p.text {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 0;
}
.custom-select {
  position: relative;
  font-family: Arial;
}

.custom-select select {
  display: none; /*hide original SELECT element: */
}

.select-selected {
  background-color: DodgerBlue;
}
.button {
  background-color: #4CAF50; /* Green */
  border: none;
  color: white;
  padding: 15px 32px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin-top: 10px;
}
.select {
  position: relative;
  display: flex;
  width: auto;
  height: 3em;
  border-radius: .25em;
  overflow: hidden;
  border: inset;
  padding: 5px;
}


</style>
