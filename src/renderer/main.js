import Vue from 'vue'
import axios from 'axios'

import App from './App'
import router from './router'
import store from './store'

/* Import global components */
import Select from './components/form/Select'
Vue.component('Select', Select);
import Toggle from './components/form/Toggle'
Vue.component('Toggle', Toggle);

import '@/assets/css/tailwind.css'
import "@/assets/scss/index.scss";
import "@/assets/scss/loaders.scss";

import * as Sentry from '@sentry/electron';
Sentry.init({
  dsn: 'https://2db185d22fdc4b5d844102a36714c0d1@sentry.io/1761306',
  environment: process.env.NODE_ENV,
  beforeSend(event) {
    return event;
  }
});

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

const _ = require('lodash')
Vue._ = Vue.prototype.$_ = _

const moment = require('moment')
Vue.prototype.$moment = moment

const log = require('electron').remote.getGlobal('log')
Vue.prototype.$log = log

const filesize = require('filesize')
Vue.prototype.$filesize = filesize

const countries = require('i18n-iso-countries')
countries.registerLocale(require("i18n-iso-countries/langs/en.json"));
Vue.prototype.$countries = countries

import VueFuse from 'vue-fuse'
Vue.use(VueFuse)

Vue.config.ignoredElements = [/^ion-/]

/* eslint-disable no-new */
new Vue({
  components:
  { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')