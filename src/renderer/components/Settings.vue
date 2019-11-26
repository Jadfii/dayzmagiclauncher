<template>
  <div class="d-flex flex-row flex-fill bg-4-blur rounded pb-5 mb-5 h-100">
    <div class="d-flex position-relative flex-shrink-0" style="width: 25%;">
        <div class="flex-fill px-4 mt-4">
            <div class="nav flex-column nav-pills">
                <a v-for="(tab, key) in tabs" :key="key" @click="setActive(tab)" :class="{ 'active': isActive(tab) }" class="nav-link" href="javascript:void(0)">{{ tab.charAt(0).toUpperCase() + tab.slice(1) }}</a>
            </div>
        </div>
    </div>
    <div class="d-flex flex-column flex-fill px-4">
        <div v-if="active_tab == 'game'" class="flex-fill">
            <div class="card bg-1 mt-4 w-100">
                <div class="card-body d-flex flex-row align-items-center">
                    <div>
                        <h5 class="card-title">Nickname</h5>
                        <p class="card-text">Choose your in-game character name.</p>
                    </div>
                    <input @change="handleChange" :value="options.nick_name" type="text" class="form-control border-0 ml-auto" style="width: 12rem;" id="nick_name">
                </div>
            </div> 
            <div class="card bg-1 mt-4 w-100">
                <div class="card-body d-flex flex-row align-items-center">
                    <div>
                        <h5 class="card-title">DayZ Path</h5>
                        <p class="card-text">Manually set your DayZ game files.</p>
                    </div>
                    <input @change="handleChange" :value="options.dayz_path" readonly type="text" class="form-control border-0 ml-auto" style="width: 24rem;">
                    <button @click="selectPath" class="btn btn-primary border-0 ml-2" type="button">Browse</button>
                </div>
            </div>
        </div>
        <div v-if="active_tab == 'launcher'" class="flex-fill">       
            <div class="card bg-1 mt-4 w-100">
                <div class="card-body d-flex flex-row align-items-center">
                    <div>
                        <h5 class="card-title">Discord Rich Presence</h5>
                        <p class="card-text">Show the launcher as your Discord game activity.</p>
                    </div>
                    <div class="custom-control custom-switch ml-auto">
                        <input @change="handleChange" :checked="options.discord_rpc" type="checkbox" class="custom-control-input" id="discord_rpc">
                        <label class="custom-control-label" for="discord_rpc"></label>
                    </div>
                </div>
            </div>
        </div>
    </div> 
  </div>  
</template>

<script>
  // Load remote so we can access electron processes
  const { dialog } = require('electron').remote
  // Load lodash
  const _ = require('lodash');
  // Load moment.js
  const moment = require('moment');
  Vue.prototype.moment = moment;
  // Load FileSystem
  const fs = require('fs-extra');
  // Load Vue
  import Vue from 'vue';
  import { setTimeout } from 'timers';
  // load config
  const remote = require('electron').remote;
  const path = require('path');
  const config = JSON.parse(fs.readFileSync(path.join(remote.app.getAppPath(), '/config.json')));

  export default {
    data () {
      return {
        tabs: [
            'game',
            'launcher',
        ],
        active_tab: 'game',
      }
    },      
    computed: {
        store() {
            return this.$store.getters.store;
        },
        options() {
            return this.$store.getters.options;
        },
    },
    methods: {
        isActive(tab) {
            return tab == this.active_tab;
        },
        setActive(tab) {
            this.active_tab = tab;
        },
        handleChange(e) {
            var value = e.target.type == 'checkbox' ? e.target.checked : e.target.value;
            this.$store.dispatch('editOptions', {key: 'options.'+e.target.id, value: value});
        },
        selectPath() {
            dialog.showOpenDialog({
                properties: ["openDirectory"]
            }, (fileNames) => {
                if (fileNames && fileNames.length > 0) {
                    this.$store.dispatch('editOptions', {key: 'options.dayz_path', value: fileNames[0]});
                }
            });
        },
    },
    created: function() {
    }
  }
</script>