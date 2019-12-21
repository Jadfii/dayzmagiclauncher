<template>
    <div class="d-flex">
        <PlayOffline></PlayOffline>
        <div v-if="last_played" class="card border-0 flex-fill bg-2 mb-5 mr-5" style="max-width: 50%;">
            <img src="https://dayzmagiclauncher.com/api/images/last_played" class="card-img-top" alt="">
            <div class="card-body d-flex flex-column">
                <div class="d-flex flex-row">
                    <h5 class="card-title">Last played server</h5>
                    <p class="mb-0 ml-auto text-muted"><small>{{ moment(last_played.date).calendar() }}</small></p>
                </div>
                <p class="card-text">{{ last_played.name }}</p>
                <div class="d-flex flex-row mt-auto">
                    <button type="button" class="btn btn-primary w-100 text-uppercase mr-2" @click="play(last_played)">
                        <i class="mdi mdi-play"></i>
                        <span class="ml-1 font-weight-500 text-uppercase">Play server</span>
                    </button>
                    <button type="button" class="btn btn-primary w-100 text-uppercase" @click="view(last_played)">
                        <i class="mdi mdi-card-search-outline"></i>
                        <span class="ml-1 font-weight-500 text-uppercase">View server</span>
                    </button>
                </div>
            </div>
        </div>
        <div v-else class="card border-0 flex-fill bg-2 mb-5 mr-5" style="max-width: 50%;">
            <img src="https://dayzmagiclauncher.com/api/images/find_a_server" class="card-img-top" alt="">
            <div class="card-body d-flex flex-column">
                <div class="d-flex flex-row">
                    <h5 class="card-title">Find a server</h5>
                </div>
                <p class="card-text">Look for your next favourite DayZ server!</p>
                <button type="button" class="btn btn-primary w-100 text-uppercase mt-auto" @click="$router.push('servers')">
                    <i class="mdi mdi-format-list-bulleted"></i>
                    <span class="ml-1 font-weight-500 text-uppercase">Server browser</span>
                </button>
            </div>
        </div>
        <div class="card border-0 flex-fill bg-2 mb-5 mr-5" style="max-width: 50%;">
            <img src="https://dayzmagiclauncher.com/api/images/offline" class="card-img-top" alt="">
            <div class="card-body d-flex flex-column">
                <h5 class="card-title">Offline mode</h5>
                <p class="card-text">
                    Load <a target="_blank" href="https://github.com/Arkensor/DayZCommunityOfflineMode">
                        Arkensor's DayZ Community Offline Mode
                        <i class="mdi mdi-open-in-new"></i>
                    </a> with custom mods and parameters.
                </p>
                <button type="button" class="btn btn-primary w-100 text-uppercase mt-auto" @click="openOffline">
                    <i class="mdi mdi-launch"></i>
                    <span class="ml-1 font-weight-500 text-uppercase">Launch offline mode</span>
                </button>
            </div>
        </div> 
    </div> 
</template>

<script>
  import { EventBus } from './../event-bus.js';

  // Load remote so we can access electron processes
  const {remote,ipcRenderer} = require('electron');
  // Load FileSystem
  const fs = require('fs-extra');
  // Load Vue
  import Vue from 'vue';
  // Load moment.js
  const moment = require('moment');
  Vue.prototype.moment = moment;
  // load config
  const path = require('path');
  const config = JSON.parse(fs.readFileSync(path.join(remote.app.getAppPath(), '/config.json')));
  const settings = remote.require('electron-settings');

  import PlayOffline from './PlayOffline';

  export default {
    components: {
      PlayOffline,
    },
    data () {
      return {
      }
    },
    watch: {
        last_played: {
            immediate: true,
            handler(val) {
                if (typeof val !== 'undefined') ipcRenderer.send('last_played_server', val);
            },
        }
    },
    computed: {
        store() {
            return this.$store.getters.store;
        },
        options() {
            return this.$store.getters.options;
        },
        greenworks() {
            return this.$store.getters.greenworks;
        },
        servers() {
            return this.$store.getters['Servers/servers'];
        },
        mods() {
            return this.$store.getters.mods;
        },
        last_played() {
            let last_played = settings.get('last_played', null);
            if (last_played && Object.keys(last_played).length > 0 && last_played.server.ip) {
                last_played = this.servers.find((server) => {
                    return server.ip == last_played.server.ip && (server.query_port == last_played.server.port || server.game_port == last_played.server.port);
                });
            }
            return last_played;
        },
    },
    methods: {
        play(server) {
            this.$parent.$refs.join_server.joinServer(server);
        },
        view(server) {
            this.$store.dispatch('Servers/setHighlightedServer', server);
            this.$router.push('servers');
        },
        openOffline() {
            EventBus.$emit('openOffline');
        },
    },
    created: function() {
    }
  }
</script>