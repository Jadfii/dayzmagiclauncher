const fs = require('fs-extra');
const remote = require('electron').remote;
const path = require('path');
const config = JSON.parse(fs.readFileSync(path.join(remote.app.getAppPath(), '/config.json')));
const settings = remote.require('electron-settings');

import Vue from 'vue';
import VueRouter from 'vue-router';
const log = require('electron-log');

const state = {
    store: {
        options: {
            nick_name: settings.get('options.nick_name', ''),
            dayz_path: settings.get('options.dayz_path', ''),
            parameters: settings.get('options.parameters', ''),
            discord_rpc: settings.get('options.discord_rpc', true),
        },
        last_played: settings.get('last_played', null),
        server_passwords: settings.get('server_passwords', []),
        favourited_servers: settings.get('favourited_servers', []),
        server_characters: settings.get('server_characters', []),
    },
    rpc: {
        ready: false,
        options: {
            largeImageKey: 'logo_white',
            state: 'Loading',
        }
    },
    loaded: {
        app: false,
        mods: false,
        servers: false,
    },
};
  
const mutations = {
    editStore(state, payload) {
        Vue.set(state.store, payload.key, payload.value);
    },
    editOptions(state, payload) {
        Vue.set(state.store.options, payload.key.replace('options.', ''), payload.value);
    },
    editRPCState(state, payload) {
        Vue.set(state.rpc.options, 'state', payload);
    },
    addRPCDetails(state, payload) {
        Vue.set(state.rpc.options, 'details', payload.details);
        Vue.set(state.rpc.options, 'startTimestamp', payload.time);
    },
    removeRPCDetails(state, payload) {
        Vue.delete(state.rpc.options, 'details');
        Vue.delete(state.rpc.options, 'startTimestamp');
    },
    setRPCReady(state, payload) {
        Vue.set(state.rpc, 'ready', payload);
    },
    editLoaded(state, payload) {
        Vue.set(state.loaded, payload.type, payload.value);
    },
}

const actions = {
    editStore(context, data) {
        log.info('Changed store key '+data.key+' from '+context.state.store[data.key]+' to '+data.value);
        settings.set(data.key, data.value);
        context.commit('editStore', data);
    },
    editOptions(context, data) {
        let key = data.key.replace('options.', '');
        log.info('Changed option '+key+' from '+context.state.store.options[key]+' to '+data.value);
        settings.set(data.key, data.value);
        context.commit('editOptions', data);
    },
    editRPCState(context, data) {
        log.info('Changed Discord RPC state to '+data);
        context.commit('editRPCState', data);
    },
    editRPCDetails(context, data) {
        if (data.type == 'add') {
            context.commit('addRPCDetails', data);
        } else if (data.type == 'remove') {
            context.commit('removeRPCDetails', data);
        }
    },
    setRPCReady(context, data) {
        context.commit('setRPCReady', data);
    },
    editLoaded(context, data) {
        if (data.type == 'app') {
            setTimeout(function() {
                context.commit('editLoaded', data);
            }, 3000);
        } else {
            context.commit('editLoaded', data);
        }
    },
    editLastPlayed({state, commit, rootState, dispatch}, data) {
        let server = {
            ip: data.ip, 
            port: data.query_port,
        };
        dispatch('editStore', {
            key: 'last_played',
            value: {
                server: server,
                date: Date.now()
            },
        });
    },
    editServerPassword(context, data) {
        let server_passwords = JSON.parse(JSON.stringify(context.state.store.server_passwords));
        let index = server_passwords.findIndex((server_password) => {
            return server_password.server.ip == data.server.ip && server_password.server.port == data.server.query_port;
        });
        let server = {
            server: {
                ip: data.server.ip,
                port: data.server.query_port,
            },
            password: data.password,
        }
        if (index !== -1 && server.password !== server_passwords[index].password) {
            server_passwords[index] = server;
        } else if (index == -1) {
            server_passwords.push(server);
        }

        if (JSON.stringify(server_passwords) !== JSON.stringify(context.state.store.server_passwords)) {
            context.dispatch('editStore', {
                key: 'server_passwords',
                value: server_passwords,
            });
        }
    },
    editFavouritedServer(context, data) {
        let favourited_servers = JSON.parse(JSON.stringify(context.state.store.favourited_servers));
        let index = favourited_servers.findIndex((server) => {
            return server.ip == data.ip && server.port == data.query_port;
        });
        let server = {
            ip: data.ip,
            port: data.query_port,
        }
        if (index == -1) {
            favourited_servers.push(server);
        } else {
            Vue.delete(favourited_servers, index);
        }
        if (JSON.stringify(favourited_servers) !== JSON.stringify(context.state.store.favourited_servers)) {
            context.dispatch('editStore', {
                key: 'favourited_servers',
                value: favourited_servers,
            });
        }
    },
    editServerCharacter(context, data) {
        let server_characters = JSON.parse(JSON.stringify(context.state.store.server_characters));
        let index = server_characters.findIndex(character => {
            return character.server.ip == data.server.ip && character.server.port == data.server.query_port;
        });
        let server = {
            server: {
                ip: data.server.ip,
                port: data.server.query_port,
            },
            character: data.character,
        }
        if (index !== -1 && server.character !== server_characters[index].character) {
            server_characters[index] = server;
        } else if (index == -1) {
            server_characters.push(server);
        }

        if (JSON.stringify(server_characters) !== JSON.stringify(context.state.store.server_characters)) {
            context.dispatch('editStore', {
                key: 'server_characters',
                value: server_characters,
            });
        }
    },
}

const getters = {
    store(state) {
        return state.store;
    },
    options(state) {
        return state.store.options;
    },
    status(state) {
        return (state.rpc.details ? state.rpc.state + ' ' + state.rpc.details : state.rpc.state);
    },
    rpc(state) {
        return state.rpc;
    },
    loaded(state) {
        return state.loaded;
    },
}

export default {
state,
mutations,
actions,
getters
}