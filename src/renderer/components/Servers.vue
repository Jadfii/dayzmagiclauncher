<template>
    <div class="flex flex-col h-full py-6 text-white overflow-hidden">
      <transition name="fade-scale-out">
        <div v-show="!overlay" class="flex flex-col h-full py-6 text-white overflow-hidden">
          <div class="overflow-y-hidden relative flex flex-col">
              <table class="font-light text-sm h-full min-w-full pr-4">
                  <thead style="padding-right: calc(1.5rem + 2px);" class="">
                      <tr class="pl-4 pr-3 pb-2 mb-2 text-left relative w-full border-b border-gray-800 border-opacity-75">
                          <th class="flex-shrink-0" style="width: 3%;">
                          </th>
                          <th class="w-5/12 pr-4 flex-shrink-0 text-sm">
                              <input @input="handleSearch" :value="filters.search" class="opacity-75 appearance-none bg-transparent border-none w-full mr-3 py-1 pr-2 focus:outline-none" type="text" placeholder="Search server or IP address">
                          </th>
                          <th class="w-1/12 px-4 flex-shrink-0 flex flex-row items-center">
                              <a @click="sortServers('players')" href="javascript:void(0);">Players</a>
                              <ion-icon v-show="sorts.active_sort == 'players'" :name="sorts.sort_type == 0 ? 'chevron-down' : 'chevron-up'" class="ml-1 text-xs flex-shrink-0"></ion-icon>
                          </th>
                          <th class="w-2/12 px-4 flex-shrink-0">
                              <span>Map</span>
                          </th>
                          <th class="w-1/12 px-4 flex-shrink-0">
                              <span>Time</span>
                          </th>
                          <th class="w-1/12 px-4 flex-shrink-0">
                              <a @click="sortServers('ping')" href="javascript:void(0);">Ping</a>
                              <ion-icon v-show="sorts.active_sort == 'ping'" :name="sorts.sort_type == 0 ? 'chevron-down' : 'chevron-up'" class="ml-1 text-xs flex-shrink-0"></ion-icon>
                          </th>
                          <th class="flex-1 pl-4 flex-shrink-0">
                              <button @click="$store.dispatch('Servers/getServers')" class="flex-shrink-0 border-transparent ml-auto flex items-center text-gray-100 hover:text-white text-sm rounded" type="button">
                                  <ion-icon class="text-base pr-1" style="margin-top: -4px;" name="refresh"></ion-icon><span>Update list</span>
                              </button>
                          </th>
                      </tr>
                  </thead>
                  <tbody class="h-full pr-6">
                      <tr v-for="(server, index) in filteredServers" @click="$store.dispatch('Servers/setHighlightedServer', server)" v-show="shouldShowServer(server)" class="h-10 pr-3 rounded-md pl-4 bg-hover cursor-pointer" :key="index">
                          <td class="flex-shrink-0" style="width: 3%;">
                              <img v-show="server.country_code !== null" :src="$parent.getCountryFlag(server.country_code)" class="h-3 rounded-sm">
                          </td>
                          <td class="w-5/12 pr-4 truncate overflow-hidden flex-shrink-0">
                              <span>{{ server.name }}</span>
                          </td>
                          <td class="w-1/12 px-4 flex-shrink-0">
                              <span>{{ server.players }}</span><span v-show="server.queue" class="">+{{ server.queue }}</span><span>/{{ server.max_players }}</span>
                          </td>
                          <td class="w-2/12 px-4 flex-shrink-0">
                              <span>{{ normaliseMap(server.map) }}</span>
                          </td>
                          <td class="w-1/12 px-4 flex-shrink-0">
                              <span>{{ server.time }}</span>
                          </td>
                          <td class="w-1/12 px-4 flex-shrink-0">
                              <ion-icon class="visible" :class="{'text-green-400': 60 >= server.ping, 'text-orange-400': 60 < server.ping && server.ping <= 140, 'text-red-400': 140 < server.ping}" name="wifi"></ion-icon>
                              <span>{{ server.ping ? server.ping : '999' }}ms</span>
                          </td>
                          <td @click.stop class="w-20 flex-shrink-0 h-full flex items-center text-xl ml-auto">
                              <a @click="favouriteServer(server)" :class="{'text-yellow-400': isFavouriteServer(server)}" class="w-6 h-6 ml-auto flex flex-shrink-0 items-center justify-center" href="javascript:void(0);">
                                  <ion-icon name="star"></ion-icon>
                              </a>
                              <a @click="" class="w-6 h-6 ml-4 flex flex-shrink-0 items-center justify-center" href="javascript:void(0);">
                                  <ion-icon name="ellipsis-horizontal"></ion-icon>
                              </a>
                              <a v-if="false" @click="$parent.$refs.join_server.joinServer(server)" class="w-12 h-full flex flex-shrink-0 items-center justify-center bg-hover" href="javascript:void(0);">
                                  <ion-icon name="play"></ion-icon>
                              </a>
                          </td>
                      </tr>
                  </tbody>
              </table>
          </div>
          <div class="flex items-center flex-shrink-0 pt-8" style="height: 15%;">
            <div class="flex flex-row items-center text-sm">
              <div class="flex flex-col w-32 mr-6">
                <h6 class="uppercase">{{ filters.bool.first_person.label }}</h6>
                <span class="text-gray-500 text-xs">{{ filters.bool.first_person.value ? 'First person only' : 'All' }}</span>
              </div>
              <Toggle :state="filters.bool.first_person.value" @toggle="setFilterValue('first_person', $event)"></Toggle>
            </div>
            <div class="flex flex-row items-center text-sm ml-16">
              <div class="flex flex-col w-32 mr-6">
                <h6 class="uppercase">{{ filters.bool.vanilla.label }}</h6>
                <span class="text-gray-500 text-xs">{{ filters.bool.vanilla.value ? 'Vanilla only' : 'All' }}</span>
              </div>
              <Toggle :state="filters.bool.vanilla.value" @toggle="setFilterValue('vanilla', $event)"></Toggle>
            </div>
          </div>
        </div>
      </transition>
    </div>
</template>

<style lang="scss">
table
{
    display: flex;
    flex-flow: column;
    height: 100%;
    width: 100%;
    border-collapse: collapse;
}
table thead
{
    flex: 0 0 auto;
    width: 100%;
}
table tbody
{
    flex: 1 1 auto;
    overflow: hidden scroll;
}
table tbody tr
{
    width: 100%;
}
th
{
    font-weight: inherit;
}
table thead, tr
{
    display: flex;
    table-layout: fixed;
    align-items: center;
}
</style>

<script>
  import { EventBus } from './../event-bus.js';

  const async = require('async');
  const child = require('child_process');
  const gamedig = require('gamedig');
  let proc;

  const _ = require('lodash');

  export default { 
    name: 'Servers',
    props: {
      overlay: Boolean,
    },
    data () {
      return {
        max_length: 150,
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
        filter_searched_servers: [],
      }
    },
    watch: {
      'filters.search': {
        immediate: true,
        handler(val) {
          this.searchServers();
        }
      },
      servers: {
        immediate: true,
        handler(val) {
          this.searchServers();
        }
      },
      filteredServers: {
        immediate: true,
        handler(new_val, old_val) {
          let servers = old_val ? new_val.filter(server => old_val.every(server2 => server.name !== server2.name)) : new_val ? new_val : [];
          if (new_val && new_val.length == this.max_length && !this.servers_loaded) {
            this.servers_loaded = true;
            this.getMaps();
            this.setModsFilter();
            if (this.store.options.ping_servers) this.pingServers();
          }
          if (this.servers_loaded && servers.length > 0 && (old_val && new_val && old_val.length > 1 && new_val.length > 1 && (old_val[0].ip !== new_val[0].ip || old_val[1].ip !== new_val[1].ip))) {
            this.new_servers = true;
            if (this.store.options.ping_servers) this.pingServers();
          }
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
            if (friend.hasOwnProperty('game') && friend.game.hasOwnProperty('appid') && friend.game.appid.toString() == this.$parent.config.appid.toString()) {
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
          let sorted = this.filter_searched_servers;
          let sorted_servers;
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
          /*if (this.filters.bool.first_person.value) {
            sorted_servers = sorted_servers.filter(server => {
              return server.first_person == this.filters.bool.first_person.value;
            });     
          }

          if (this.filters.bool.vanilla.value) {
            sorted_servers = sorted_servers.filter(server => {
              return server.mods.length == 0;
            });     
          }

          if (this.filters.bool.friends_playing.value) {
            sorted_servers = sorted_servers.filter(server => {
              return this.friendsServers.filter((friends_server) => {
                return friends_server.gameserverip == server.ip+':'+server.game_port;
              }).length > 0;
            });     
          }*/

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

          sorted_servers = sorted_servers.slice(0, this.max_length);
          return sorted_servers;
        }
      },
    },
    methods: {
      findServerIndex(name) {
        return this.servers.findIndex(server => server.name == name);
      },
      shouldShowServer(server)
      {
        return (!this.filters.bool.first_person.value || (this.filters.bool.first_person.value && server.first_person)) && (!this.filters.bool.vanilla.value || (this.filters.bool.vanilla.value && server.mods.length == 0)) && (!this.filters.bool.friends_playing.value || (this.filters.bool.friends_playing.value && this.friendsServers.filter(friends_server => friends_server.gameserverip == server.ip+':'+server.game_port).length > 0));
      },
      sortServers(sort) {
        let old_sort = this.sorts.active_sort;
        Vue.set(this.sorts, 'active_sort', sort);
        if (this.sorts.sort_type == '' && this.sorts.active_sort == '') {
          Vue.set(this.sorts, 'sort_type', 0);
        } else if (this.sorts.sort_type == 0 && this.sorts.active_sort == old_sort) {
          Vue.set(this.sorts, 'sort_type', 1);
        } else if (this.sorts.active_sort !== old_sort) {
          Vue.set(this.sorts, 'sort_type', 0);
        } else {
          Vue.set(this.sorts, 'sort_type', 0);
        } 
      },
      handleSearch: _.debounce(function(e) {
        this.$store.dispatch('Servers/setSearch', e.target.value);
      }, 500),
      searchServers: _.debounce(function() {
        this.$search(this.filters.search.toLowerCase(), this.servers, {
          threshold: 0.2,
          keys: ['name', 'ip']
        }).then(results => {
          this.filter_searched_servers = results.length > 0 ? results : JSON.parse(JSON.stringify(this.servers));
        });
      }, 500),
      setFilterValue(key, val) {
        this.$store.dispatch('Servers/setFilterValue', {key: key, value: val});
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
          let label = map;
          if (map.includes('chernarusplus')) {
            label = 'Chernarus'
          } else if (map.includes('enoch')) {
            label = 'Livonia';
          } else if (map.includes('enoch')) {
            label = 'Livonia';
          } else if (map.includes('deerisle')) {
            label = 'Deer Isle';
          } else if (map.includes('exclusionzone')) {
            label = 'Area of Decay';
          } else if (map.includes('valning')) {
            label = 'Valning';
          } else if (map.includes('chiemsee')) {
            label = 'Chiemsee';
          }
          if (!maps.find(e => e.value == map)) maps.push({label: label, value: map});
        });
        this.$store.dispatch('Servers/setFilterOptions', {key: 'map', options: maps});
        return maps;
      },
      normaliseMap(map) {
          let find = this.filters.list.map.options.find(e => {
            return e.value == map.toLowerCase();
          });
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
          log.info('Now pinging servers');
          this.pinging = true;
          this.new_servers = false;
          async.eachSeries(this.filteredServers, (server, callback) => {
            if (typeof server !== 'undefined' || (typeof server.ping == 'undefined' || !server.ping)) {
              if (this.new_servers || !this.store.options.ping_servers) {
                let err = new Error();
                err.break = true;
                this.new_servers = false;
                this.pinging = false;
                return callback(err);
              }
              let ping = 9999;
              gamedig.query({
                type:'dayz',
                host: server.ip,
                port: server.query_port,
                socketTimeout: 500
              }).then(state => {
                ping = state.ping;
              }).catch(err => {
                //log.error(err);
              }).finally(() => {
                this.$store.dispatch('Servers/pingServer', {
                  server: server,
                  ping: ping,
                });
                setTimeout(() => {
                  callback();
                }, 500);
              });
            } else {
              callback();
            }
          }, (err, result) => {
            this.pinging = false;
            log.info('Stopped pinging servers');
            if (err && !err.break) log.error(err);
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
    created() {
    },
  }
</script>