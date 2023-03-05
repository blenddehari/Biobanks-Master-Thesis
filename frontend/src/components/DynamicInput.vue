<template>
<div>
    <div v-for="(input, index) in inputs" :key="index">
        <input type="text" class="form" v-model="input.name">
         <input type="text" class="form" v-model="input.loincCode">
        <input type="text" class="form" v-model="input.value.fromValue">
         <input v-show="rangeQuery" type="text" class="form" v-model="input.value.toValue">
        <span>
            <i class="fas fa-minus-circle" @click="remove(index)" v-show="index || (!index && inputs.length > 1)"><v-icon style="margin-right:0px">mdi-minus</v-icon></i>
            <i class="fas fa-minus-circle" @click="add(index)" v-show="index == inputs.length - 1"><v-icon style="margin-right:0px">mdi-plus</v-icon></i>
        </span>
    </div>
        <button class="button2" @click="toggleQueryType()">{{rangeQuery ? "Point Query" : "Range Query"}}</button>
        <button class="button2" @click="submit()">Submit</button>
</div>
</template>

<script>
export default {  
  data () {
    return {
      inputs: [
          {
              name: '',
              loincCode: '',
              value: {
                  fromValue: '',
                  toValue: ''
              },
            //   rangeQuery: false
          }
      ],
      rangeQuery: false
    }
  },  

  mounted () {
   
},
methods: {
  add() {
      this.inputs.push(
        { 
        name: "", 
        loincCode: '', 
        value: {
            fromValue: '',
            toValue: ''
        },
        // rangeQuery: false
        })
  },
  remove(index) {
      this.inputs.splice(index, 1)
  },
  submit(){
      for (let input of this.inputs) {
          if (!input.value.toValue) {
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
  }
}
}
</script>

<style>
 .form{
  position: relative;
  width: 100%;
  max-width: 200px;
  margin: 5px ;
  margin-top: 3em;
  border: solid 2px
}
.button2 {
     border: solid 2px;
     margin: 5px;
     margin-top: 3em;
}

</style>