<template>
  <v-app>
    <v-app-bar
      app
      color="blue darken-4"
      dark
    >
      <div class="d-flex align-center">
        <v-img
          alt="Vuetify Logo"
          class="shrink mr-2"
          contain
          src="https://www.aau.at/wp-content/uploads/2015/09/aau-logo-300x110-300x110without-background3.png"
          transition="scale-transition"
          width="120"
        />

        <v-img
          alt="Vuetify Name"
          class="shrink mr-2"
          contain
          min-width="50"
          src="https://upload.wikimedia.org/wikipedia/en/thumb/4/4c/University_of_Klagenfurt%2C_seal%2C_2014.png/220px-University_of_Klagenfurt%2C_seal%2C_2014.png"
          width="60"
        />
      </div>

      <v-spacer></v-spacer>

      <v-btn
        href="https://www.aau.at/"
        target="_blank"
        text
      >
        <span class="mr-2">Blend Dehari & Patrick Eisenkeil - Universität Klagenfurt</span>
        <v-icon>mdi-open-in-new</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <!-- <DemoComponent/> -->
      <!-- <DynamicInput></DynamicInput> -->
      <!-- <div>
        <DropDownList @on-item-selected="dropdownSelection = $event" @on-item-reset="dropdownSelection = {}"/>
        {{ dropdownSelection.name }} 
      </div> -->
      <div>
        <QueryComponent @on-item-selected="dropdownSelection = $event" @on-item-reset="dropdownSelection = {}"/>
      </div>
    </v-main>
  </v-app>
</template>

<script>
// import DemoComponent from './components/DemoComponent.vue';
// import DropDownList from './components/DropDownList.vue';
import QueryComponent from './components/QueryComponent.vue'
// import DynamicInput from './components/DynamicInput.vue'

export default {
  name: 'App',

  components: {
    // DemoComponent,
    // DropDownList,
    // QueryComponent,
    // DynamicInput,
    QueryComponent
  },

  data: () => ({
    //
    dropdownSelection: {}
  }),
};
</script>
