<template>
  <div class="dropdown">
    <input v-model.trim="inputValue" v-if="Object.keys(selectedItem).length === 0" ref="dropdowninput" class="dropdown-input" type="text" placeholder="Find country" />
    <div v-else @click="resetItem" class="dropdown-selected">
      <img :src="selectedItem.flag" class="dropdown-item-flag" />
      {{ selectedItem.name }}
    </div>
    <div v-show="inputValue && apiLoaded" class="dropdown-list">
      <div v-show="itemVisible(item)" v-for="item in itemList" @click="selectItem(item)" :key="item.name" class="dropdown-item">
        <img :src="item.flag" class="dropdown-item-flag" />
        {{ item.name }}
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
export default {  
  data () {
    return {
      itemList: [],
      selectedItem: {},
      apiLoaded: false,
      apiUrl: 'https://restcountries.com/v2/all',
      inputValue: '',
    }
  },  

  mounted () {
    this.getList()
},
methods: {
  async getList () {
    // axios.get(this.apiUrl).then( response => {
    //   this.itemList = response.data
    //   this.apiLoaded = true
    // console.log('HERE ', response)
    // })
    const response = await axios.get(this.apiUrl) 
    this.itemList = response.data
    this.apiLoaded = true
  },
  itemVisible (item) {
    let currentName = item.name.toLowerCase()
    let currentInput = this.inputValue.toLowerCase()
    return currentName.includes(currentInput)
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
</style>