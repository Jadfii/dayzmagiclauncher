<template>
  <div id="app" class="overflow-hidden bg-4">
    <GameRunning ref="game_running"></GameRunning>
    <Downloading ref="downloading"></Downloading>
    <HighlightedServer ref="highlighted_server"></HighlightedServer>
    <Prompt ref="prompt"></Prompt>
    <Alert ref="alert"></Alert>
    <Confirm ref="confirm"></Confirm>

    <div v-if="!play_trailer" class="d-flex flex-column h-auto w-100 position-relative d-none">
      <div class="d-flex w-100">
        <div class="position-absolute overflow-hidden" style="height: 100vh; top: 0; bottom: 0; left: 0; right: 0;">
          <img class="w-100 background" alt="Background" :src="background">
        </div>
        <div class="background"></div>
      </div>    
    </div>    
    <div class="d-flex flex-row" style="height: 100vh; width: 100vw; max-width: 100vw;">
      <div class="d-flex flex-column flex-fill">
        <div :class="{ 'bg-2': loaded || development, 'bg-3': !loaded && !development, 'bg-black': play_trailer }" class="d-flex align-items-center flex-shrink-0 w-100 position-relative pl-4 frame" style="z-index: 10;">
          <svg class="align-self-center position-absolute" style="height: 12px;top: 50%; transform: translate(-50%, -50%); left: 50%; right: 0;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 737.4 60.75"><g><g><path  class="fill-muted" d="M14.9.83l12.4,28.8L39.78.83h14.9V59.75h-15l.08-17,.92-11.9-.5-.09L32.46,51H22.22l-7.9-20.23-.42.09,1,11.9v17H0V.83ZM126.11,47.47c-.33-6.26-9.56-8.24-9.56-8.24L102.05,5.61c-2.29-5.67-9.84-5.56-12.52,0L75.35,39.23c-10.68,2-9.89,8.57-9.89,8.57,1,12.2,30.33,12.86,30.33,12.86C127.76,59.67,126.11,47.47,126.11,47.47ZM85.41,28.85s8.24-.66,16.81-8.9l3.29,7.25S94.63,37.75,81.45,38.08Zm10,26.53s-17.8.33-24.72-7.58c0,0,3.62-3.62,6.26-3.62a50.32,50.32,0,0,0,18.46,4s11.54,0,19.45-4c0,0,4.94,2,5.93,4C120.84,48.13,116.88,54.73,95.46,55.38Zm56-35.41V40.2c0,9.23,17.23,9.15,17.23,0V38h-9.41V25.55H183V40.2c0,13.56-11.32,20.39-23.14,20.39-11.65,0-23.3-6.83-23.3-20.39V20c0-13.31,11.65-20,23.3-20,7.66,0,16.4,3.16,20.48,12.57l-12.49,5.74C164.64,10.4,151.49,12.23,151.49,20Zm44.68,39.78V.83h14.9V59.75Zm52.26.84c-11.56,0-23.22-6.75-23.22-20.14V20.14C225.21,6.82,236.87,0,248.68,0c7.24,0,16,3.08,20.73,13.57l-12.16,4.91c-4-7.33-17.14-5.66-17.14,1.66V40.45c0,7.07,13.32,9.07,16.56.91l13,6A23.73,23.73,0,0,1,248.43,60.59ZM296.28.83V45h24V59.75H281.3V.83Zm70.15,58.92L362.6,47.94H346.88l-3.67,11.81h-16L347.79.83h13.56l21.06,58.92ZM355,17.48h-.42L350.2,34.7H359ZM422.52,40V.83h15.06V40c-.08,27.63-47.1,27.63-47,0V.83h15.06V40C405.62,49.52,422.43,49.52,422.52,40ZM466.79.83,481,26l5,11.81.42-.08c-.09,0-1.58-10.15-1.67-10.15V.83h14.82V59.75H484.51L471.2,36.53,466,24.72l-.42.08,1.92,11.4V59.75h-14.9V.83Zm70.15,59.76c-11.57,0-23.22-6.75-23.22-20.14V20.14C513.72,6.82,525.37,0,537.19,0c7.24,0,16,3.08,20.72,13.57l-12.15,4.91c-4-7.33-17.15-5.66-17.15,1.66V40.45c0,7.07,13.32,9.07,16.57.91l13,6A23.71,23.71,0,0,1,536.94,60.59Zm32.87-.84V.83h15V23.14h17V.83h15V59.75h-15V37.53h-17V59.75ZM671.25,24v12.9H647.36v8.82h26V59.75h-41V.83h41v14h-26V24ZM702.54,41V59.75H687.47V.83H711c12.15,0,21.56,5.58,21.89,19.39,0,10.9-4.41,17.06-11.57,19.31L737.4,59.75H718.85L705.2,41Zm8.73-26.3h-8.73V28.21h8.73C720.68,28.21,720.68,14.73,711.27,14.73Z"/></g></g></svg>
          <div class="d-flex flex-row h-100 ml-auto icons" style="z-index: 2; font-size: 0.75rem !important; line-height: 12px !important;">
            <a @click="reloadWindow" href="javascript:void(0);" style="z-index: 2; font-size: 1rem !important; line-height: 1rem !important;" class="d-flex align-items-center justify-content-center mr-3 px-2 py-1">
              <i class="mdi mdi-refresh"></i>
            </a>
            <a @click="minimizeWindow" href="javascript:void(0);" class="d-flex align-items-center justify-content-center px-2 py-1">
              <i class="mdi mdi-window-minimize"></i>
            </a>
            <a @click="maximizeWindow" href="javascript:void(0);" class="d-flex align-items-center justify-content-center px-2 py-1">
              <i class="mdi mdi-window-maximize"></i>  
            </a>   
            <a @click="closeWindow" href="javascript:void(0);" class="d-flex align-items-center justify-content-center px-2 py-1">
              <i class="mdi mdi-window-close"></i>  
            </a>                     
          </div>
        </div>
        <div v-if="loading" class="d-flex flex-fill flex-column align-items-center justify-content-center bg-3 h-100 w-100" style="z-index: 20;">
          <div v-if="!steam_down" class="loading">
            <div :class="{ 'active': !loaded }" class="loading-text">
              <span v-for="(letter, index) in 'DAYZMAGICLAUNCHER'.split('')" :key="index" class="loading-text-words">{{ letter }}</span>
            </div>
          </div>
          <div v-else class="text-uppercase font-weight-500 mt-2" style="font-size: 0.7rem; letter-spacing: 1px;">
            Unable to connect to Steam.
          </div>
        </div>
        <div v-if="!loading" class="d-flex flex-column flex-fill" style="overflow-y: auto;">
          <div v-if="!play_trailer" class="container-fluid overflow-hidden d-flex flex-column flex-fill position-sticky">
            <div class="row bg-1 flex-shrink-0 w-100 position-fixed" style="height: 50px;">
              <div class="container h-100 w-100 h-100 d-flex flex-row align-items-center">
                <router-link v-for="(link, index) in ['play', 'servers', 'mods']" :key="index" :to="'/' + link" class="router-link mr-4 h-100 d-flex align-items-center no-underline text-muted">
                  <p class="m-0 text-uppercase font-weight-600" style="font-size: 0.9rem;">{{ link }}</p>
                </router-link>
                <div class="ml-auto h-100 d-flex align-items-center">
                  <button v-if="update_ready" @click="updateApp" class="btn btn-primary router-link mr-3 h-100 d-flex align-items-center no-border">
                    <i class="mdi mdi-update"></i><p class="m-0 ml-1">Update ready</p>
                  </button>
                  <router-link style="font-size: 0.9rem !important; line-height: 0.9rem !important;" v-for="(link, index) in ['settings']" :key="index" :to="'/' + link" class="router-link mr-2 h-100 d-flex align-items-center no-underline no-border text-muted">
                    <i class="mdi mdi-settings"></i><p class="m-0 ml-1">{{ link.charAt(0).toUpperCase() + link.slice(1) }}</p>
                  </router-link>
                  <span class="mx-3 text-muted">{{ profile.name }}</span>
                  <img class="rounded-circle" style="height: 35px;" :src="profile.avatar">
                </div>            
              </div>
            </div>
            <div class="row d-flex flex-row flex-nowrap flex-fill h-100 px-5 inline-scroll" style="margin-top: 50px; overflow-y: auto;">
              <div class="container d-flex flex-column flex-fill h-100">
                <div class="d-flex flex-row align-items-center flex-shrink-0 mb-2 mt-4 py-3">
                  <h3 class="font-weight-400">{{ $route.name }}</h3>
                  <div v-if="$route.name == 'Servers'" class="d-flex flex-column ml-auto text-right">
                    <span class="text-uppercase" style="font-size: 0.7rem; letter-spacing: 1px; line-height: 0.75;">Last updated</span>
                    <span style="font-size: 0.9rem;">{{ last_update_time }}</span>
                  </div>
                </div>
                <router-view ref="router_view"></router-view>
              </div>
            </div>
          </div>
          <div v-if="play_trailer" class="d-flex flex-column flex-fill">
            <div class="d-flex align-items-center justify-content-center position-absolute" style="z-index: 2; top: 60%; right: 0; background: rgba(0, 0, 0, 0.5);">
              <a @click="appLoad" class="d-flex align-items-center justify-content-center text-align-center w-100 h-100" style="padding: 0.8rem 2rem;" href="javascript:void(0)">
                <span>Skip trailer</span>
              </a>
            </div>
            <div class="d-flex w-100 flex-fill position-relative" style="padding-bottom: 56.2%;">
              <div class="flex-fill w-100 h-100 position-absolute" style="object-fit: cover;" id="player"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { EventBus } from './event-bus.js';

  // Load remote so we can access electron processes
  const {remote,ipcRenderer} = require('electron');
  // Load FileSystem
  const fs = require('fs-extra');
  // Load Vue
  import Vue from 'vue';
  import { setTimeout } from 'timers';
  // Load moment.js
  const moment = require('moment');
  Vue.prototype.moment = moment;  
  // load config
  const path = require('path');
  const config = JSON.parse(fs.readFileSync(path.join(remote.app.getAppPath(), '/config.json')));
  // Load request
  const request = require('request');
  var rpc = null;
  const log = require('electron-log');

  import HighlightedServer from './components/HighlightedServer';
  import GameRunning from './components/GameRunning';
  import Prompt from './components/dialogs/Prompt';
  import Alert from './components/dialogs/Alert';
  import Confirm from './components/dialogs/Confirm';
  import Downloading from './components/Downloading';

  export default {
    name: 'dayzmagiclauncher',
    components: {
      HighlightedServer,
      GameRunning,
      Prompt,
      Alert,
      Confirm,
      Downloading,
    },
    data () {
      return {
        play_trailer: false,
        show_backdrop: false,
        last_update_time: null,
        loading: false,
        update_ready: false,
      }
    },
    watch: {
      $route(to, from) {
        if (this.rpc.state !== 'Playing server') {
          this.changeRPCState(to.matched[0].props.default.rpc_state);
        }
      },
      last_update() {
        this.last_update_time = moment(this.last_update).fromNow();
      },
      steam_down(val) {
        this.loading = val;
      },
      loaded(val) {
        this.loading = !val;
        if (val) log.info('App loaded.');
      },
    },
    computed: {
      development() {
        return process.env.NODE_ENV === 'development';
      },
      profile() {
        return this.$store.getters.steam_profile;
      },
      store() {
        return this.$store.getters.store;
      },
      options() {
        return this.$store.getters.options;
      },
      greenworks() {
        return this.$store.getters.greenworks;
      },
      num_players() {
        return this.$store.getters.num_players;
      },
      status() {
        return this.$store.getters.status;
      },
      loaded() {
        return this.$store.getters.loaded.app;
      },
      rpc() {
        return this.$store.getters.rpc;
      },
      steam_down() {
        return this.$store.getters.steam_down;
      },
      last_update() {
        return this.$store.getters['Servers/last_update'];
      },
      friends() {
        return this.$store.getters.friends;
      },
      background() {
        return 'https://dayzmagiclauncher.com/api/images/backgrounds/random';
      },
    },
    methods: {
      openURL(url) { // use with caution
        remote.shell.openExternal(url).catch((err) => {
          // no.
        });
      },
      minimizeWindow() {
        remote.getCurrentWindow().minimize();
      },
      maximizeWindow() {
        let window = remote.getCurrentWindow();
        if (!window.isMaximized()) {
          window.maximize();          
        } else {
          window.unmaximize();
        }
      },
      closeWindow() {
        remote.getCurrentWindow().close();
      },
      reloadWindow() {
        remote.getCurrentWindow().reload();
      },
      checkUpdate() {
          ipcRenderer.send('check_for_update');
      },
      updateApp() {
        ipcRenderer.send('install_update');
      },
      changeRPCState(state) {
        this.$store.dispatch('editRPCState', state);
      },
      getSteamProfile() {
        if (this.greenworks && !this.steam_down) {
          let steam_id = this.greenworks.getSteamId();
          if (this.options.nick_name == '') this.$store.dispatch('editOptions', {key: 'options.nick_name', value: steam_id.screenName});
        }
      },
      appLoad() {
        if (!this.development) this.loading = true;
        this.play_trailer = false;
        this.$store.dispatch('getGreenworks');
        this.$store.subscribe((mutation, state) => {
          if (mutation.type == 'setGreenworks') {
            this.$store.dispatch('editStore', {key: 'visited', value: true});
            this.$store.dispatch('Servers/getServers');
            this.changeRPCState(this.$route.matched[0].props.default.rpc_state);

            setInterval(() => {
              this.last_update_time = moment(this.last_update).fromNow();
            }, 30000);
            this.$store.dispatch('getMods');
            this.getSteamProfile();
            this.$store.dispatch('getFriends');
            if (!this.greenworks.isAppInstalled(parseInt(config.appid))) {
              this.$refs.alert.alert({
                title: 'Error',
                message: 'Please ensure you have DayZ installed.',
              }).catch((err) => {
                if (err) log.error(err);
                return;
              });
            } else if (!this.options.dayz_path || (this.options.dayz_path && this.options.dayz_path == '')) {
              this.$store.dispatch('editOptions', {key: 'options.dayz_path', value: this.greenworks.getAppInstallDir(parseInt(config.appid))});
            }
          } else if (mutation.type == 'editLoaded' && this.$store.getters.loaded.mods && this.$store.getters.loaded.servers && !this.$store.getters.loaded.app) {
            this.$store.dispatch('editLoaded', {type: 'app', value: true});
          }
        });
      },
    },
    created: function() {
      this.$store.subscribe((mutation, state) => {
        if (mutation.type == 'setSteamDownStatus' && mutation.payload === true && !this.loaded) {
          this.appLoad();
        }
      });

      ipcRenderer.on('update_message', (event, text) => {
        log.info(text);
        if (text == 'update_downloaded') {
          this.update_ready = true;
        }
      });

      // Initialise Bootstrap tooltips
      $(document.body).tooltip({
          selector: '[data-toggle="tooltip"]'
      });

      if (this.store.visited) {
        this.appLoad();
      } else {
        this.play_trailer = true;
        var tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        var player;
        window.onYouTubeIframeAPIReady = () => {
          player = new YT.Player('player', {
            videoId: '4xv8aRPYdyI',
            playerVars: { 'autoplay': 1,'rel': 0,'autohide': 1,'wmode': 'opaque','origin': window.location.origin },
            host: 'https://www.youtube-nocookie.com',
            events: {
              'onReady': onPlayerReady,
              'onStateChange': onPlayerStateChange
            }
          });
        }
        var onPlayerReady = (event) => {
          event.target.playVideo();
        }
        var onPlayerStateChange = (event) => {
          if (event.data === 0) {
            this.appLoad();
          }
        }
      }

      EventBus.$on('closeModal', (payload) => {
        $(".tooltip").tooltip("hide");
      });
    }
  }
</script>