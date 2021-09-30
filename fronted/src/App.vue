<template>
  <v-app>
    <v-app-bar
      app
      color="primary"
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
          class="shrink mt-1 hidden-sm-and-down"
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
        <span class="mr-2">Blend Dehari - Universität Klagenfurt</span>
        <v-icon>mdi-open-in-new</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <DemoComponent/>
    </v-main>
  </v-app>
</template>

<script>
import DemoComponent from './components/DemoComponent.vue';

export default {
  name: 'App',

  components: {
    DemoComponent,
  },

  data: () => ({
    //
  }),
};
</script>
