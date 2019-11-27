<template>
  <div class="d-flex flex-column flex-fill bg-4-blur rounded pb-5 mb-5">
    <div class="d-flex position-relative flex-shrink-0">
        <div class="flex-fill px-4">
          <div class="d-flex flex-row w-100">
              <div class="mr-4 border-active-bottom mt-3" style="height: 32px;">
                <h6 class="m-0">Filters</h6>
              </div>
              <div class="mr-2 mt-3">
                <div class="position-relative" style="width: 250px;">
                    <input @input="handleSearch" :value="filters.search" type="text" class="form-control border-0 text-light bg-1" :placeholder="'Search ' + route_name.toLowerCase()">
                    <i class="mdi mdi-magnify"></i>
                </div>
              </div>
              <div class="d-flex flex-column justify-content-center mt-3">
                <div class="d-flex flex-shrink-0 align-items-center">
                  <v-select @input="setFilter(key, ...arguments)" v-for="(filter, key, index) in filters.bool" :key="key" :value="filter.selected" :options="filter.options" transition="none" :searchable="false" :clearable="false" class="border-none text-light bg-1 mr-2">
                    <template slot="selected-option" v-bind="filter">
                      <span class="font-weight-500"></span>{{ filter.label }}: {{ filter.selected.label }}
                    </template>
                  </v-select>
                </div>
                <div class="d-flex flex-shrink-0 align-items-center mt-2">
                  <v-select @input="setFilter(key, ...arguments)" v-for="(filter, key, index) in filters.list" :key="key" :value="filter.selected" :options="filter.options" transition="none" :searchable="false" :clearable="false" class="border-none text-light bg-1 mr-2">
                    <template slot="selected-option" v-bind="filter">
                      {{ filter.label }}: {{ filter.selected }}
                    </template>
                  </v-select> 
                </div>
              </div>
              <div class="ml-auto mt-3">
                <button @click="$store.dispatch('Servers/getServers')" class="btn btn-secondary border-0 bg-1 px-3 font-weight-500" type="button">
                  <i class="mdi mdi-refresh"></i> Refresh {{ route_name }}
                </button>
              </div>               
          </div>           
        </div>
    </div>
    <div class="d-flex flex-column flex-fill px-4">
      <p class="mt-2">Showing {{ filteredServers ? filteredServers.length : 0 }} {{ route_name.toLowerCase() }}.</p>
      <div class="list-group d-flex flex-fill" ref="servers" id="servers">
        <div class="list-group-item-heading">
          <div class="row" style="font-size: 0.95rem; padding: 0 1.25rem;">
            <div class="col-sm-5 py-2 d-flex flex-row align-items-center" style="font-size: 0.9rem;">
              <a @click="sortServers" sort="name" class="no-underline" href="javascript:void(0);">Name</a>
              <i v-show="sorts.active_sort == 'name'" style="font-size: 18px;" class="mdi" :class="{ 'mdi-chevron-down': sorts.sort_type == 0,  'mdi-chevron-up': sorts.sort_type !== 0 }"></i>
            </div>
            <div class="col-sm-2 py-2 d-flex flex-row align-items-center" style="font-size: 0.9rem;">
              <a @click="sortServers" sort="players" class="no-underline" href="javascript:void(0);">Players</a>
              <i v-show="sorts.active_sort == 'players'" style="font-size: 18px;" class="mdi" :class="{ 'mdi-chevron-down': sorts.sort_type == 0,  'mdi-chevron-up': sorts.sort_type !== 0 }"></i>
            </div>
            <div class="col-sm-2 py-2 d-flex flex-row align-items-center" style="font-size: 0.9rem;">Time</div>
            <div class="col-sm-2 py-2 d-flex flex-row align-items-center" style="font-size: 0.9rem;">
              <a @click="sortServers" sort="ping" class="no-underline" href="javascript:void(0);">Ping</a>
              <i v-show="sorts.active_sort == 'ping'" style="font-size: 18px;" class="mdi" :class="{ 'mdi-chevron-down': sorts.sort_type == 0,  'mdi-chevron-up': sorts.sort_type !== 0 }"></i>
            </div>
            <div class="col-sm-1 py-2 d-flex flex-row align-items-center" style="font-size: 0.9rem;">Actions</div>
          </div>
        </div>
        <a v-for="(server, key) in filteredServers" :key="server.ip.replace('.', '_') + '-' + key" @click="$store.dispatch('Servers/setHighlightedServer', server)" href="javascript:void(0);" class="list-group-item list-group-item-action flex-column align-items-start">
          <div class="row align-items-center justify-content-center">
            <div class="col-sm-5">
              <div class="d-flex overflow-hidden">
                <h6 class="m-0">{{ server.name.length > 65 ? server.name.substring(0, 65) + '...' : server.name }}</h6>
              </div>
              <div class="collapse" :id="'serverDescription-' + key">
                <p class="mb-1">{{ typeof server.mods == 'array' && server.mods.length > 0 ? server.mods.join(', ') : 'No mods required.' }}</p>    
              </div>
            </div>
            <div class="col-sm-2">{{ server.players }}/{{ server.max_players }}<span v-if="server.queue > 0" data-toggle="tooltip" data-placement="top" title="Queue"> (+{{ server.queue }})</span></div>
            <div class="col-sm-2 d-flex align-items-center">
              <span v-if="detectNight(server)"  data-toggle="tooltip" data-placement="top" title="Currently night-time">
                {{ server.time }}
                <i class="mdi mdi-weather-night ml-1"></i>
              </span>
              <span v-else>{{ server.time }}</span>
            </div>
            <div class="col-sm-2">
              <span :class="{ 'text-danger': server.ping === 9999 }">{{ typeof server.ping !== 'undefined' ? server.ping === 9999 ? 'No response' : server.ping + 'ms' : 'Pinging...' }}</span>
            </div>
            <div class="col-sm-1 d-flex flex-row">
              <div class="" @click.stop>
                <a @click="favouriteServer(server)" :class="{ 'color-favourite': isFavouriteServer(server) }" href="javascript:void(0);">
                  <i data-toggle="tooltip" data-placement="right" :data-original-title="isFavouriteServer(server) ? 'Remove from favourites' : 'Add to favourites'" class="mdi mdi-star" style="font-size: 24px; line-height: 24px;"></i>
                </a>
              </div>
              <div class="" @click.stop>
                <a @click="joinServer(server)" href="javascript:void(0);">
                  <i data-toggle="tooltip" data-placement="right" title="Play server" class="mdi mdi-play" style="font-size: 24px; line-height: 24px;"></i>
                </a>
              </div>
            </div>
          </div>    
        </a>
      </div>
    </div> 
  </div>  
</template>

<script>
  import { EventBus } from './../event-bus.js';

  // Load async
  const async = require('async');
  // Load lodash
  const _ = require('lodash');
  // Load FileSystem
  const fs = require('fs-extra');
  // load config
  const remote = require('electron').remote;
  const path = require('path');
  const config = JSON.parse(fs.readFileSync(path.join(remote.app.getAppPath(), '/config.json')));
  // Load request
  const request = require('request');
  // Load Vue
  import Vue from 'vue';
  // Load moment.js
  const moment = require('moment');
  Vue.prototype.moment = moment;

  const log = require('electron-log');
  const ping = require('ping');
  const child = require('child_process');
  const find = require('find-process');

  var proc;

  export default { 
    data () {
      return {
        sorts: {
            active_sort: 'players',
            sort_type: 0,
        },
        pinging: false,
        servers_loaded: false,
        game_running: false,
        search_mods: {
          list: [],
          page_num: 1,
          server: null,
          finished: true,
        },
        game_process: {
          pid: null,

        },
      }
    },
    watch: {
      filteredServers: {
        immediate: true,
        handler(new_val, old_val) {
          if (new_val && new_val.length == 200) this.servers_loaded = true;
          if (!this.development) this.pingServers(new_val, old_val);
          this.getMaps();
        }
      },
      friendsServers: {
        immediate: true,
        handler(new_val, old_val) {
          EventBus.$emit('friendsServers', new_val);
        },
      }
    },
    computed: {
      development() {
        return process.env.NODE_ENV === 'development';
      },
      store() {
        return this.$store.getters.store;
      },
      loaded() {
        return this.$store.getters.loaded;
      },
      servers() {
        return this.$store.getters['Servers/servers'];
      },
      mods() {
        return this.$store.getters.mods;
      },
      filters() {
        return this.$store.getters['Servers/filters'];
      },
      greenworks() {
        return this.$store.getters.greenworks;
      },
      friends() {
        return this.$store.getters.friends;
      },
      last_update() {
        return this.$store.getters['Servers/last_update'];
      },
      playing_server() {
        return this.$store.getters['Servers/playing_server'];
      },
      highlighted_server() {
        return this.$store.getters['Servers/highlighted_server'];
      },
      favourited_servers() {
        return this.$store.getters.store.favourited_servers;
      },
      route_name() {
        return this.$route.name.toLowerCase();
      },
      friendsServers() {
        if (typeof this.servers !== 'undefined' && this.friends.length > 0) {
          let servers = [];
          this.friends.forEach((friend) => {
            if (friend.hasOwnProperty('game') && friend.game.hasOwnProperty('appid') && friend.game.appid.toString() == config.appid.toString()) {
              let server = this.servers.find((server) => {
                return friend.game.gameserverip == server.ip+':'+server.game_port;
              });
              if (typeof server !== 'undefined') {
                let index = servers.findIndex((server) => {
                  return friend.game.gameserverip == server.ip+':'+server.game_port;
                });
                if (index !== -1) {
                  servers[index].friends.push(friend);
                } else {
                  servers.push({
                    'gameserverip': friend.game.gameserverip,
                    'friends': [friend],
                  });
                }
              }
            }
          });
          return servers;
        } else {
          return [];
        }
      },
      filteredServers_length() {
        return typeof this.filteredServers == 'undefined' ? 0 : this.filteredServers.length;
      },
      filteredServers() {
        if (this.servers.length > 0) {
          let sorted = this.servers.filter(server => {
            return server.name.toLowerCase().includes(this.filters.search.toLowerCase());
          });
          var sorted_servers;
          switch (this.sorts.active_sort) {
            case 'name':
              sorted_servers = sorted.sort((a, b) => {
                var textA = a[this.sorts.active_sort].toUpperCase();
                var textB = b[this.sorts.active_sort].toUpperCase();
                return (textA > textB) ? -1 : (textA < textB) ? 1 : 0;
              }); 
              switch (this.sorts.sort_type) {
                case 1:
                  sorted_servers = sorted_servers;                   
                  break;
                case 0:
                  sorted_servers = sorted_servers.reverse();
                  break;
                default:
                  break;
              }
              break;
            case 'players':
              sorted_servers = sorted.sort((a, b) => {
                return (a.players > b.players) ? -1 : (a.players < b.players) ? 1 : 0;
              });
              switch (this.sorts.sort_type) {
                case 0:
                  sorted_servers = sorted_servers;
                  break;
                case 1:
                  sorted_servers = sorted_servers.reverse();
                  break;                  
                default:
                  break;
              }
              break;
            case 'ping':
              switch (this.sorts.sort_type) {
                case 0:
                  sorted_servers = sorted.sort((a, b) => {
                    if (!a.ping && b.ping) return 1;
                    if (a.ping && !b.ping) return -1;
                    let a_ping = a.ping ? a.ping : 9999;
                    let b_ping = b.ping ? b.ping : 9999;
                    return a_ping > b_ping ? -1 : (a_ping < b_ping) ? 1 : 0;
                  });
                  break;
                case 1:
                  sorted_servers = sorted.sort((a, b) => {
                    if (!a.ping && b.ping) return 1;
                    if (a.ping && !b.ping) return -1;
                    let a_ping = a.ping ? a.ping : 9999;
                    let b_ping = b.ping ? b.ping : 9999;
                    return a_ping < b_ping ? -1 : (a_ping > b_ping) ? 1 : 0;
                  });
                  break;                  
                default:
                  break;
              }
              break;
            default:
              sorted_servers = sorted;
              break;
          }
          if (this.filters.bool.first_person.selected.value !== null) {
            sorted_servers = sorted_servers.filter(server => {
              return server.first_person == this.filters.bool.first_person.selected.value;
            });     
          }

          if (this.filters.bool.vanilla.selected.value !== null) {
            sorted_servers = sorted_servers.filter(server => {
              return this.filters.bool.vanilla.selected.value ? server.mods.length == 0 : server.mods.length > 0;
            });     
          }

          if (this.filters.bool.friends_playing.selected.value !== null) {
            sorted_servers = sorted_servers.filter(server => {
              let friends_playing = this.friendsServers.filter((friends_server) => {
                return friends_server.gameserverip == server.ip+':'+server.game_port;
              }).length > 0;
              return this.filters.bool.friends_playing.selected.value ? friends_playing : !friends_playing;
            });     
          }

          if (this.filters.list.map.selected !== '') {
            sorted_servers = sorted_servers.filter(server => {
              return this.filters.list.map.selected.toLowerCase() == 'any' || server.map.toLowerCase() == this.filters.list.map.selected.toLowerCase();
            });     
          }

          sorted_servers = sorted_servers.sort((a, b) => {
            return this.isFavouriteServer(a) ? -1 : this.isFavouriteServer(b) ? 1 : 0;
          });

          sorted_servers = sorted_servers.slice(0, 200);
          return sorted_servers;
        }
      },
    },
    methods: {
      findServerIndex(name) {
        return this.servers.findIndex(server => server.name == name);
      },
      sortServers(e) {
        let old_sort = this.sorts.active_sort;
        Vue.set(this.sorts, 'active_sort', e.target.getAttribute('sort'));
        if (this.sorts.sort_type == '' && this.sorts.active_sort == '') {
          Vue.set(this.sorts, 'sort_type', 0);
        } else if (this.sorts.sort_type == 0 && this.sorts.active_sort == old_sort) {
          Vue.set(this.sorts, 'sort_type', 1);
        } else if (this.sorts.active_sort !== old_sort) {
          Vue.set(this.sorts, 'sort_type', 0);
        } else {
          Vue.set(this.sorts, 'sort_type', '');
          Vue.set(this.sorts, 'active_sort', '');
        } 
      },
      handleSearch(e) {
        this.$store.dispatch('Servers/setSearch', e.target.value);
      },
      setFilter(key, val) {
        this.$store.dispatch('Servers/setFilterSelected', {key: key, value: val});
      },
      detectNight(server) {
        let server_time = moment(server.time + ':00', 'hh:mm:ss');
        return server_time.isBetween(moment('20:00:00', 'hh:mm:ss'), moment().endOf('day')) || server_time.isBetween(moment().startOf('day'), moment('05:00:00', 'hh:mm:ss'));
      },
      getMaps() {
        let maps = ['Any'];
        this.servers.forEach(server => {
          let map = server.map.toLowerCase();
          if (maps.indexOf(map) == -1) maps.push(map);
        });
        this.$store.dispatch('Servers/setFilterOptions', {key: 'map', options: maps});
        return maps;
      },
      pingServers(new_val, old_val = null) {
        let servers = old_val ? new_val.filter(server => old_val.every(server2 => server.name !== server2.name)) : new_val ? new_val : [];

        if (servers.length > 0 && typeof this.filteredServers !== 'undefined' && this.filteredServers.length > 0 && !this.pinging) {
          this.pinging = true;
          async.someSeries(this.filteredServers, (server, callback) => {
            if (typeof server !== 'undefined' || (typeof server.ping == 'undefined' || !server.ping)) {
              ping.promise.probe(server.ip, {
                timeout: 1,
              })
              .then((res) => {
                this.$store.dispatch('Servers/pingServer', {
                  server: server,
                  ping: res.time == 'unknown' ? 9999 : res.time,
                });
                callback();
              });
            }
          }, (err, result) => {
            this.pinging = false;
            if (err) log.error(err);
          });
        }
      },
      isFavouriteServer(server) {
        return this.favourited_servers.filter(e => {
          return e.ip == server.ip && e.query_port == server.port;
        }).length > 0;
      },
      favouriteServer(server) {
        this.$store.dispatch('editFavouritedServer', server);
      },
      joinServer(server_info, join = true) {
        let server = JSON.parse(JSON.stringify(server_info));
        log.info('Attempting to join server ' + server.name);
        if (this.checkRequiredMods(server).length == 0) {
          server_info.mods.forEach((mod) => {
            this.greenworks.ugcDownloadItem(mod.id.toString());
          });
          this.openGame(server, join);
          this.$store.dispatch('editRPCState', 'Playing server');
          this.$store.dispatch('editRPCDetails', {type: 'add', details: server.name, time: new Date()});
        } else {
          this.grabRequiredMods(server);
          this.$parent.$refs.alert.alert({
            title: 'Mods',
            message: 'Required mods are now downloading. Check your mods page for progress.',
          }).catch((err) => {
            if (err) log.error(err);
            return;
          });
        }
      },
      async openGame(server, join) {
        let parameters = [];
        if (join) {
          parameters = [
            '-connect=' + server.ip,
            '-port=' + server.game_port
          ];          
        }

        if (server.mods.length > 0) {
          let mods_params = '-mod=';
          server.mods.forEach((mod, key, arr) => {
            let title = mod.name.replace(/\W/g, '');
            mods_params += config.workshop_dir + '/@' + title;
            if (key !== arr.length - 1) {
              mods_params += ';';
            }
          });

          parameters.push(mods_params);
        }

        if (this.$parent.options.nick_name !== '') {
          parameters.push('-name=' + this.$parent.options.nick_name);
        }

        let server_password = this.store.server_passwords.find(e => {
          return server.ip == e.server.ip && (server.query_port == e.server.port || server.game_port == e.server.port)
        });
        if (server.password && join) {
          this.$parent.$refs.prompt.prompt({
            title: 'Enter server password',
            fill: server_password && server_password.password ? server_password.password : null,
          }).then((data) => {
            parameters.push('-password=' + data);
            this.$store.dispatch('editServerPassword', {server: server, password: data});
            if (this.game_running) {
              this.$parent.$refs.alert.alert({
                title: 'Error',
                message: 'An instance of DayZ is already running.',
              }).catch((err) => {
                if (err) log.error(err);
                return;
              });
            } else {
              this.$store.dispatch('Servers/setPlayingServer', server);
              this.$store.dispatch('editLastPlayed', server);
              this.bootGame(parameters);
            }
          })
          .catch((err) => {
            if (err) log.error(err);
            return;
          });
        } else if (this.game_running) {
          this.$parent.$refs.alert.alert({
            title: 'Error',
            message: 'An instance of DayZ is already running.',
          }).catch((err) => {
            if (err) log.error(err);
            return;
          });
        } else {
          this.$store.dispatch('Servers/setPlayingServer', server);
          this.$store.dispatch('editLastPlayed', server);
          this.bootGame(parameters);
        }
      },
      bootGame(parameters) {
        this.game_running = true;
        proc = child.execFile(this.$parent.options.dayz_path + "\\" + config.dayz_exe, parameters, (err, data) => {
            this.$store.dispatch('editRPCState', 'Browsing servers');
            this.$store.dispatch('editRPCDetails', {type: 'remove'});
            this.$store.dispatch('Servers/setPlayingServer', {});
            this.game_running = false;
            this.quitGame();
            if (err) {
              log.error(err);
              this.$parent.$refs.alert.alert({
                title: 'Error',
                message: 'DayZ closed unexpectedly.',
              }).catch((err) => {
                if (err) log.error(err);
                return;
              });
              return;
            }
        });
        this.game_process.pid = proc.pid;
      },
      quitGame: _.throttle(() => { 
        find('name', 'DayZ_')
          .then((list) => {
            list.forEach((process) => {
              this.game_running = false;
              child.spawn("taskkill", ["/pid", process.pid, '/f', '/t']);
            });
          });
      }, 1000),
      checkRequiredMods(server) {
        let workshop_path = this.$parent.options.dayz_path + '/../../workshop/content/' + config.appid + '/';
        let launcher_workshop_path = this.$parent.options.dayz_path + '/' + config.workshop_dir + '/@';

        // Create directory to store mods
        if (!fs.existsSync(this.$parent.options.dayz_path + '/' + config.workshop_dir)) fs.mkdir(this.$parent.options.dayz_path + '/' + config.workshop_dir);
        server.mods.forEach(function(mod, key, arr) {
          let title = mod.name.replace(/\W/g, '');
          if (!fs.existsSync(launcher_workshop_path + title) && fs.existsSync(workshop_path + mod.id)) {
            fs.symlink(workshop_path + mod.id, launcher_workshop_path + title, 'junction', function(err) {
              if (typeof err !== 'undefined' && err !== null) {
                log.error(err);
              }
            });
          }
        });

        return server.mods.filter(mod => this.mods.every(mod2 => mod.id.toString() !== mod2.publishedFileId));
      },
      grabRequiredMods(server) {
        let mods = server.mods.filter(mod => this.mods.every(mod2 => mod.id.toString() !== mod2.publishedFileId));
        let x = 0;
        mods.forEach((mod, key, arr) => {
          x++;
          if (typeof this.greenworks !== 'undefined' && this.greenworks && this.greenworks.initAPI()) {
            this.greenworks.ugcSubscribe(mod.id.toString(), () => {
              log.info('Subscribed to mod ' + mod.name);
              if (x == arr.length) {
                this.greenworks.ugcGetUserItems({
                  'app_id': parseInt(config.appid),
                  'page_num': 1,
                }, this.greenworks.UGCMatchingType.Items, this.greenworks.UserUGCListSortOrder.SubscriptionDateDesc, this.greenworks.UserUGCList.Subscribed, (items) => {
                  this.$store.dispatch('addMods', items.filter(mod2 => this.mods.every(mod3 => mod2.publishedFileId.toString() !== mod3.publishedFileId)));
                }, (err) => {
                  log.error(err);
                });            
              }              
            }, (err) => {
              log.error(err);
            });
          }
        });         
      },
    },
    created: function() {
      EventBus.$on('joinServer', (payload) => {
        if (payload.length == 2) {
          this.joinServer(payload[0], payload[1]);
        } else {
          this.joinServer(payload);
        }
      });
      EventBus.$on('quitGame', (payload) => {
        this.quitGame();
      });
    },
    updated() {
      $(".tooltip").tooltip("hide");
    },
  }
</script>