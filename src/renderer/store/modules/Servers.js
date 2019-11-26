const request = require('request');
const moment = require('moment');
import Vue from 'vue';
const log = require('electron-log');

const state = {
    servers: [],
    playing_server: {},
    highlighted_server: {},
    last_update: null,
    filters: {
        search: '',
        bool: {
            first_person: {
                label: 'First person',
                options: [{label: 'Any', value: null}, {label: 'Yes', value: true}, {label: 'No', value: false}],
                selected: {label: 'Any', value: null},
            },
            vanilla: {
                label: 'Vanilla',
                options: [{label: 'Any', value: null}, {label: 'Yes', value: true}, {label: 'No', value: false}],
                selected: {label: 'Any', value: null},
            },
            friends_playing: {
                label: 'Friends playing',
                options: [{label: 'Any', value: null}, {label: 'Yes', value: true}, {label: 'No', value: false}],
                selected: {label: 'Any', value: null},
            },
        },
        list: {
            map: {
                label: 'Map',
                options: [],
                selected: 'Any',
            },
        },
    },
    scroll: {
        height: 0,
        top: 0,
    },
};
  
const mutations = {
    setServers(state, payload) {
        state.servers = payload;
    },
    setServer(state, payload) {
        if (typeof payload.find !== 'undefined' && payload.find) {
            Vue.set(state.servers, find, payload.server);
        } else {
            state.servers.push(payload.server);
        }
    },
    setServerMods(state, payload) {
        Vue.set(state.servers[payload.find], 'mods', payload.mods);
    },
    editServerPing(state, payload) {
        if (state.servers.length > 0) {
            Vue.set(state.servers[state.servers.findIndex(function(server) {
                return server.name == payload.server.name;
            })], 'ping', payload.ping);
        }
    },
    setSearch(state, payload) {
        state.filters.search = payload;
    },
    setFilterSelected(state, payload) {
        Vue.set(state.filters[payload.type][payload.key], 'selected', payload.value);
    },
    setFilterOptions(state, payload) {
        Vue.set(state.filters[payload.type][payload.key], 'options', payload.options);
    },
    setScrollHeight(state, payload) {
        Vue.set(state.scroll, 'height', payload);
    },
    setScrollTop(state, payload) {
        Vue.set(state.scroll, 'top', payload);
    },
    setLastUpdate(state, payload) {
        state.last_update = payload;
    },
    setPlayingServer(state, payload) {
        state.playing_server = payload;
    },
    setHighlightedServer(state, payload) {
        state.highlighted_server = payload;
    },
}

const actions = {
    getServers({commit, dispatch}) {
        request({
            url: 'https://dayzmagiclauncher.com/api/servers',
            json: true,
          }, (error, response, body) => {
            if (error) {
                log.error(error);
            } else {
                commit('setServers', body.body);
                dispatch('setLastUpdate', moment.unix(body.last_updated));
                dispatch('editLoaded', {type: 'servers', value: true}, { root: true });
            }
          });
    },
    getServer({commit, dispatch}, payload) {
        request({
            url: 'https://dayzmagiclauncher.com/api/servers/' + payload.ip + ':' + payload.query_port,
            json: true,
          }, (error, response, body) => {
            if (error) {
                log.error(error);
            } else {
                let find = state.servers.findIndex(function(server) {
                    return server.hasOwnProperty('ip') && server.ip == payload.ip && server.game_port == payload.game_port;                
                });
                commit('setServer', {find: find,server: body.body});
            }
          });
    },
    setServerMods(context, payload) {
        let find = state.servers.findIndex(function(server) {
            return server.ip == payload.ip && server.game_port == payload.game_port;                
        });
        if (typeof find !== 'undefined' && find) {
            payload.find = find;
            context.commit('setServerMods', payload);
        }
    },
    pingServer(context, payload) {
        context.commit('editServerPing', payload);
    },
    setSearch(context, payload) {
        context.commit('setSearch', payload);
    },
    setFilterSelected(context, payload) {
        let options = context.state.filters;
        let type;
        Object.keys(options).some((filter) => {
            type = Object.keys(options[filter]).find((key) => {
                return key == payload.key;
            }) ? filter : null;
            return type !== null;
        });
        payload.type = type;
        context.commit('setFilterSelected', payload);
    },
    setFilterOptions(context, payload) {
        let options = context.state.filters;
        let type;
        Object.keys(options).forEach((filter) => {
            type = Object.keys(options[filter]).find((key) => {
                return key == payload.key;
            }) ? filter : null;
        });
        payload.type = type;
        context.commit('setFilterOptions', payload);
    },
    setScrollHeight(context, payload) {
        context.commit('setScrollHeight', payload);
    },
    setScrollTop(context, payload) {
        context.commit('setScrollTop', payload);
    },
    setLastUpdate(context, payload) {
        context.commit('setLastUpdate', payload);
    },
    setHighlightedServer(context, payload) {
        context.commit('setHighlightedServer', payload);
    },
    setPlayingServer(context, payload) {
        context.commit('setPlayingServer', payload);
    },
}

const getters = {
    servers(state) {
        return state.servers;
    },
    filters(state) {
        return state.filters;
    },
    scroll(state) {
        return state.scroll;
    },
    last_update(state) {
        return state.last_update;
    },
    playing_server(state) {
        return state.playing_server;
    },
    highlighted_server(state) {
        return state.highlighted_server;
    },
}

export default {
namespaced: true,
state,
mutations,
actions,
getters
}