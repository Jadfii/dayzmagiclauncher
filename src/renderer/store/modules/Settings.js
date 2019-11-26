const fs = require('fs-extra');
const remote = require('electron').remote;
const path = require('path');
const config = JSON.parse(fs.readFileSync(path.join(remote.app.getAppPath(), '/config.json')));
const settings = remote.require('electron-settings');

import Vue from 'vue';
const log = require('electron-log');

const state = {
    store: {
        options: {
            nick_name: settings.get('options.nick_name', ''),
            dayz_path: settings.get('options.dayz_path', ''),
            discord_rpc: settings.get('options.discord_rpc', true),
        },
        visited: settings.get('visited', false),
        last_played: settings.get('last_played', null),
        server_passwords: settings.get('server_passwords', []),
        favourited_servers: settings.get('favourited_servers', []),
    },
    rpc: {
        largeImageKey: 'logo_white',
        state: 'Loading',
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
        Vue.set(state.rpc, 'state', payload);
    },
    addRPCDetails(state, payload) {
        Vue.set(state.rpc, 'details', payload.details);
        Vue.set(state.rpc, 'startTimestamp', payload.time);
    },
    removeRPCDetails(state, payload) {
        Vue.delete(state.rpc, 'details');
        Vue.delete(state.rpc, 'startTimestamp');
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
        context.commit('editRPCState', data);
    },
    editRPCDetails(context, data) {
        if (data.type == 'add') {
            context.commit('addRPCDetails', data);
        } else if (data.type == 'remove') {
            context.commit('removeRPCDetails', data);
        }
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

const DiscordRPC = require('discord-rpc');
var rpc = null;
function openRPC() {
    rpc = new DiscordRPC.Client({ transport: 'ipc' });
    const clientId = config.discord_rpc_client_id;

    // RPC STUFF
    async function setActivity(options) {
        if (!rpc) {
            return;
        }

        rpc.setActivity(Object.assign({
            instance: false,
        }, options));
    }

    rpc.on('ready', () => {
        setActivity(state.rpc);

        // activity can only be set every 15 seconds
        setInterval(() => {
            setActivity(state.rpc);
        }, 15e3);
    });

    rpc.on('connected', () => {
        log.info('Connected to Discord RPC');
    });   

    rpc.on('disconnected', () => {
        if (rpc !== null) {
            log.info('Disconnected from Discord RPC.');
            rpc.connect();
        }
    });
    
    rpc.login({ clientId }).catch(console.error);
}

if (settings.get('options.discord_rpc', false)) {
    openRPC();
}

settings.watch('options.discord_rpc', (new_val, old_val) => {
    if (rpc == null && new_val === true) {
        openRPC();
    } else {
        rpc.destroy();
    }
});

export default {
state,
mutations,
actions,
getters
}