import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import vuetify from "./plugins/vuetify";
import VueSession from "vue-session";
import VueTimeago from "vue-timeago";

import "./plugins/vuelidate";
import "material-design-icons-iconfont/dist/material-design-icons.css";

Vue.config.productionTip = false;

Vue.use(VueSession);
Vue.use(VueTimeago, {
  name: "Timeago",
  locale: "es",
  locales: {
    es: require("date-fns/locale/es"),
    en: require("date-fns/locale/en")
  }
});

new Vue({
  router,
  vuetify,
  render: h => h(App)
}).$mount("#app");
