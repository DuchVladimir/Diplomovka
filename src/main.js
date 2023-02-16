import { createApp } from "vue";
import { createPinia } from "pinia";

import "primevue/resources/themes/saga-blue/theme.css";
import "primevue/resources/primevue.min.css";
import "primeicons/primeicons.css";

//import { library } from "@fortawesome/fontawesome-svg-core";
//import { faPlus } from "@fortawesome/free-solid-svg-icons";

import App from "./App.vue";
import router from "./router";
import PrimeVue from "primevue/config";
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import SpeedDial from "primevue/speeddial";
import OverlayPanel from "primevue/overlaypanel";
import Tooltip from "primevue/tooltip";

import ToastService from "primevue/toastservice";
import Toast from "primevue/toast";

//import { library } from "@fortawesome/fontawesome-svg-core";
//import { faHatWizard } from '@fortawesome/free-solid-svg-icons'
//import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
//import { faDice } from "@fortawesome/free-solid-svg-icons";

import { library } from "@fortawesome/fontawesome-svg-core";
import { faDice } from "@fortawesome/free-solid-svg-icons";
import { faHatWizard } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

import "./assets/main.css";

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(PrimeVue);
app.use(ToastService);

//library.add(faPlus);
library.add(faDice);

library.add(faHatWizard);
app.component("font-awesome-icon", FontAwesomeIcon);

//app.component('font-awesome-icon', FontAwesomeIcon);
app.component("Dialog", Dialog);
app.component("PrimeButton", Button);
app.component("InputText", InputText);
app.component("SpeedDial", SpeedDial);
app.component("OverlayPanel", OverlayPanel);
app.component("Toast", Toast);

app.directive("tooltip", Tooltip);

app.mount("#app");
