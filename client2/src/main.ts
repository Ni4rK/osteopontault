import 'reflect-metadata';
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import './assets/index.scss'
import {createApp} from 'vue'
import { createPinia } from 'pinia'
import Main from "@/main.vue";
import router from '@/plugins/router'
import vuetify from "@/plugins/vuetify";

createApp(Main)
  .use(createPinia())
  .use(vuetify)
  .use(router)
  .mount('#main')
