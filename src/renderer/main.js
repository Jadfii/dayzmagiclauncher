import Vue from 'vue'
import axios from 'axios'

import App from './App'
import router from './router'
import store from './store'

/* Import global components */
import Logo from './components/nav/Logo'
Vue.component('Logo', Logo)
import Select from './components/form/Select'
Vue.component('Select', Select)
import Button from './components/form/Button'
Vue.component('Button', Button)
import Input from './components/form/Input'
Vue.component('Input', Input)
import Dropdown from './components/form/Dropdown'
Vue.component('Dropdown', Dropdown)
import Checkbox from './components/form/Checkbox'
Vue.component('Checkbox', Checkbox)

import ServerFilter from './components/form/ServerFilter'
Vue.component('ServerFilter', ServerFilter)
import SidebarLink from './components/nav/SidebarLink'
Vue.component('SidebarLink', SidebarLink)

import '@/assets/css/tailwind.css'
import "@/assets/scss/index.scss";
import "@/assets/scss/loaders.scss";

import VTooltip from 'v-tooltip'
Vue.use(VTooltip)

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
const log = require('electron-log');
axios.interceptors.response.use(res =>
{
	log.info(`[${res.config.method.toUpperCase()}] ${res.config.url} ${res.status} ${res.statusText}`);
	return res;
});
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

/* VUE PROTOTYPES */
const _ = require('lodash')
Vue._ = Vue.prototype.$_ = _

const fs = require('fs-extra')
Vue.fs = Vue.prototype.$fs = fs

const moment = require('moment')
Vue.prototype.$moment = moment

Vue.prototype.$log = log

const filesize = require('filesize')
Vue.prototype.$filesize = filesize

const fuse = require('fuse.js')
Vue.prototype.$fuse = fuse

const system = require('systeminformation')
Vue.prototype.$system = system

/* DECLARE ENUMS FOR USE IN VUE PROTOTYPES */
const SteamStatus = Object.freeze({
	OFFLINE: 0,
	ONLINE: 1
})

const DayZMap = Object.freeze({
	CHERNARUS: {id: 'chernarusplus', name: 'Chernarus', bg: true},
	LIVONIA: {id: 'enoch', name: 'Livonia', bg: true},
	DEERISLE: {id: 'deerisle', name: 'Deer Isle'},
	EXCLUSIONZONE: {id: 'exclusionzone', name: 'Area of Decay', bg: true},
	VALNING: {id: 'valning', name: 'Valning'},
	CHIEMSEE: {id: 'chiemsee', name: 'Chiemsee', bg: true}
})

const ModState = Object.freeze({
	UPDATED: {label: 'Updated', value: 5},
	UPDATE_REQUIRED: {label: 'Update required', value: 13},
	DOWNLOADING: {label: 'Downloading update', value: 25},
	PENDING: {label: 'Update pending', value: 37}
})

const SortColumn = Object.freeze({
	NONE: '',
	/* servers */
	NAME: 'name',
	PLAYERS: 'players',
	QUEUE: 'queue',
	PING: 'latency',
	/* mods */
	TITLE: 'title',
	SIZE: 'fileSize',
	LAST_UPDATED: 'timeUpdated'
})
const SortType = Object.freeze({
  	NONE: '',
	DESC: 'desc',
	ASC: 'asc'
})

const WelcomeMessages = Object.freeze({
	LATE_NIGHT_GAMING: 'Late night gaming?',
	HELLI_BEAUTIFUL: 'Hello, beautiful.',
	HELLO_CHUM: 'Hello, chum!'
})

Vue.prototype.$SteamStatus = SteamStatus
Vue.prototype.$DayZMap = DayZMap
Vue.prototype.$ModState = ModState
Vue.prototype.$SortColumn = SortColumn
Vue.prototype.$SortType = SortType
Vue.prototype.$WelcomeMessages = WelcomeMessages

Vue.config.ignoredElements = [/^ion-/]

/* eslint-disable no-new */
new Vue({
	components:
	{ App },
	router,
	store,
	template: '<App/>'
}).$mount('#app')