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
                  <v-select v-if="key !== 'mods'" @input="setFilter(key, ...arguments)" v-for="(filter, key, index) in filters.list" :key="key" :value="filter.selected" :options="filter.options" transition="none" :searchable="false" :clearable="false" class="border-none text-light bg-1 mr-2 flex-shrink-0">
                    <template slot="selected-option" v-bind="filter">
                      {{ filter.label }}: {{ filter.selected.label }}
                    </template>
                  </v-select> 
                  <v-select @input="setFilter('mods', ...arguments)" :label="'name'" :placeholder="'Filter by mods'" :close-on-select="false" :multiple="true" :key="'mods'" :value="filters.list.mods.selected" :options="filters.list.mods.options" :clearable="false" transition="none" class="border-none text-light bg-1 mr-2 w-100">
                  </v-select>
                </div>
              </div>
              <div class="ml-auto mt-3 d-flex flex-column">
                <button @click="$store.dispatch('Servers/getServers')" class="btn btn-secondary border-0 bg-1 px-3 font-weight-500" type="button">
                  <i class="mdi mdi-refresh"></i> Refresh {{ route_name }}
                </button>
                <button v-if="false" @click="pingServers" class="btn btn-secondary border-0 bg-1 px-3 font-weight-500 mt-2" type="button">
                  <i class="mdi mdi-target"></i> Ping servers
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
            <div v-if="false" class="col-sm-2 py-2 d-flex flex-row align-items-center" style="font-size: 0.9rem;">
              <a @click="sortServers" sort="ping" class="no-underline" href="javascript:void(0);">Ping</a>
              <i v-show="sorts.active_sort == 'ping'" style="font-size: 18px;" class="mdi" :class="{ 'mdi-chevron-down': sorts.sort_type == 0,  'mdi-chevron-up': sorts.sort_type !== 0 }"></i>
            </div>
            <div class="col-sm-1 py-2 d-flex flex-row align-items-center" style="font-size: 0.9rem;">Map</div>
            <div class="col-sm-1 py-2 d-flex flex-row align-items-center" style="font-size: 0.9rem;">Friends</div>
            <div class="col-sm-1 py-2 d-flex flex-row align-items-center" style="font-size: 0.9rem;">Actions</div>
          </div>
        </div>
        <a v-for="(server, key) in filteredServers" :key="server.ip.replace('.', '_') + '-' + key" @click="$store.dispatch('Servers/setHighlightedServer', server)" href="javascript:void(0);" class="list-group-item list-group-item-action flex-column align-items-start">
          <div class="row align-items-center justify-content-center">
            <div class="col-sm-5">
              <div class="d-flex overflow-hidden">
                <h6 class="m-0">{{ server.name.length > 65 ? server.name.substring(0, 65) + '...' : server.name }}<i v-if="server.password" data-toggle="tooltip" data-placement="right" title="Passworded" style="font-size: 16px;" class="mdi mdi-lock ml-1"></i></h6>
              </div>
              <div class="collapse" :id="'serverDescription-' + key">
                <p class="mb-1">{{ typeof server.mods == 'array' && server.mods.length > 0 ? server.mods.join(', ') : 'No mods required.' }}</p>    
              </div>
            </div>
            <div class="col-sm-2">{{ server.players }}/{{ server.max_players }} <span v-if="server.queue > 0" data-toggle="tooltip" data-placement="top" title="Queue">(+{{ server.queue }})</span></div>
            <div class="col-sm-2 d-flex align-items-center">
              <span v-if="detectNight(server)"  data-toggle="tooltip" data-placement="top" title="Currently night-time">
                {{ server.time }}
                <i class="mdi mdi-weather-night ml-1"></i>
              </span>
              <span v-else>{{ server.time }}</span>
            </div>
            <div v-if="false" class="col-sm-2">
              <span :class="{ 'text-danger': server.ping === 9999 }">{{ typeof server.ping !== 'undefined' ? server.ping === 9999 ? 'No response' : server.ping + 'ms' : 'Awaiting ping.' }}</span>
            </div>
            <div class="col-sm-1">
              <span>{{ normaliseMap(server.map) }}</span>
            </div>
            <div class="col-sm-1">
              <div v-for="friend in getFriendsOnServer(server)" :key="friend.steamid" style="height: 25px; width: 25px;">
                <img style="height: 25px; width: 25px;" data-toggle="tooltip" data-placement="top" :title="friend.name" class="rounded-circle" :src="getFriendAvatar(friend.steamid)">
              </div>
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
  // Load Vue
  import Vue from 'vue';
  // Load moment.js
  const moment = require('moment');
  Vue.prototype.moment = moment;

  const log = require('electron-log');
  const child = require('child_process');
  const find = require('find-process');

  let proc;

  export default { 
    data () {
      return {
        sorts: {
            active_sort: 'players',
            sort_type: 0,
        },
        pinging: false,
        new_servers: false,
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
        stop_downloads: false,
        friends_avatars: [],
      }
    },
    watch: {
      filteredServers: {
        immediate: true,
        handler(new_val, old_val) {
          let servers = old_val ? new_val.filter(server => old_val.every(server2 => server.name !== server2.name)) : new_val ? new_val : [];
          if (new_val && new_val.length == 200 && !this.servers_loaded) {
            this.servers_loaded = true;
            this.getMaps();
            this.setModsFilter();
          }
          if (this.servers_loaded && servers.length > 0 && this.pinging) this.new_servers = true;
          $(".tooltip").tooltip("hide");
        }
      },
      friendsServers: {
        immediate: true,
        handler(new_val, old_val) {
          new_val.forEach(a => {
            a.friends.forEach(f => {
              this.$parent.getSteamAvatar(f.steamid).then(src => {
                if (src && !this.friends_avatars.find(friend => friend.profile.steamid == f.steamid)) {
                  this.friends_avatars.push({
                    'profile': f,
                    'avatar': src
                  });
                }
              });
            });
          });
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
                  return friend.game.gameserverip == server.gameserverip;
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
              let map = (this.filters.list.map.selected.value || '').toLowerCase();
              return map == '' || server.map.toLowerCase() == map;
            });     
          }

          if (this.filters.list.mods.selected.length > 0) {
            sorted_servers = sorted_servers.filter(server => {
              return this.filters.list.mods.selected.every((mod) => {
                return server.mods.some((mod2) => mod2.id == mod.id);
              });
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
      getFriendsOnServer(server) {
        let arr = this.friendsServers.find(friends_server => friends_server.gameserverip == server.ip+':'+server.game_port);
        return arr ? arr.friends : [];
      },
      getFriendAvatar(steam_id) {
        let find = this.friends_avatars.find(f => f.profile.steamid == steam_id);
        return find ? find.avatar : null;
      },
      getMaps() {
        let maps = [{label: 'Any', value: null}];
        this.servers.forEach(server => {
          let map = server.map.toLowerCase();
          let label;
          switch (map) {
            case 'chernarusplus':
              label = 'Chernarus';
              break;
            case 'enoch':
              label = 'Livonia';
              break;
            case 'deerisle':
              label = 'Deer Isle';
              break;
            case 'exclusionzone':
              label = 'Area of Decay';
              break;
            default:
              label = map;
              break;
          }
          if (!maps.find(e => e.value == map)) maps.push({label: label, value: map});
        });
        this.$store.dispatch('Servers/setFilterOptions', {key: 'map', options: maps});
        return maps;
      },
      normaliseMap(map) {
          let find = this.filters.list.map.options.find(e => e.value == map.toLowerCase());
          return find ? find.label : map;
      },
      setModsFilter() {
        let mods = [];
        this.servers.forEach(server => {
          mods.push(...server.mods);
        });
        mods = _(mods).countBy('id').toPairs().sortBy(1).reverse().map(0).value().map(e => {
          return mods.find(mod => mod.id == e);
        });
        this.$store.dispatch('Servers/setFilterOptions', {key: 'mods', options: mods});
      },
      pingServers() {
        if (!this.pinging) {
          this.$parent.$refs.confirm.confirm({
              title: 'Ping servers',
              message: 'Pinging servers may cause application lag, are you sure you want to continue?',
          }).then(() => {
              this.pinging = true;
              async.eachSeries(this.filteredServers, (server, callback) => {
                if (typeof server !== 'undefined' || (typeof server.ping == 'undefined' || !server.ping)) {
                  if (this.new_servers) {
                    var err = new Error();
                    err.break = true;
                    this.new_servers = false;
                    this.pinging = false;
                    return callback(err);
                  }
                  let cmd = child.spawn('ping', ['-n', 1, '-w', 2000, server.ip]);
                  let ms = 9999;
                  cmd.stdout.on('data', (output) => {
                    let out = output.toString();
                    let find = 'Average = ';
                    if (out.includes(find)) {
                      ms = out.lastIndexOf(find) !== -1 ? parseInt(out.substring(out.lastIndexOf(find) + find.length, out.length).replace('ms', '')) : 9999;
                    }
                  });
                  cmd.on('close', (code) => {
                    this.$store.dispatch('Servers/pingServer', {
                      server: server,
                      ping: ms,
                    });
                    setTimeout(() => {
                      callback();
                    }, 500);
                  });
                }
              }, (err, result) => {
                this.pinging = false;
                if (err && !err.break) log.error(err);
              });
          })
          .catch((err) => {
              if (err) log.error(err);
              return;
          });
        }
      },
      isFavouriteServer(server) {
        return this.favourited_servers.filter(e => {
          return e.ip == server.ip && e.port == server.query_port;
        }).length > 0;
      },
      favouriteServer(server) {
        this.$store.dispatch('editFavouritedServer', server);
      },
      joinServer(server_info, join = true) {
        this.$parent.$refs.join_server.joinServer(server_info, join);
      },
      quitGame() { 
        this.$parent.$refs.join_server.quitGame();
      },
    },
    created: function() {
    },
  }
</script>