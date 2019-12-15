import Vue from 'vue';
const path = require('path');
const fs = require('fs-extra');
const remote = require('electron').remote;
const config = JSON.parse(fs.readFileSync(path.join(remote.app.getAppPath(), '/config.json')));
const log = require('electron-log');
const request = require('request');
const jimp = require('jimp');
const _ = require('lodash');

import { EventBus } from './../../event-bus.js';

const state = {
    greenworks: null,
    num_players: 0,
    steam_down: false,
    steam_profile: {
        id: null,
        name: null,
        avatar: null,
    },
    friends: [],
    app: {
        build_id: null,
    },
};

function convertServer(ip) {
    ip = ip.split(':');
    return ((ip[0]>>>24)+'.'+(ip[0]>>16 & 255)+'.'+(ip[0]>>8 & 255)+'.'+(ip[0]&255))+':'+ip[1];
}
  
const mutations = {
    setGreenworks(state, payload) {
        state.greenworks = payload;
    },
    setPlayers(state, payload) { 
        state.num_players = payload;
    },
    setSteamDownStatus(state, payload) {
        state.steam_down = payload;
    },
    setSteamProfile(state, payload) {
        state.steam_profile = payload;
    },
    setFriends(state, payload) {
        state.friends = payload;
    },
    editFriend(state, payload) {
        let index = state.friends.findIndex((friend) => {
            return friend.steamid == payload.steamid;
        });
        Vue.set(state.friends, index, payload);
    },
    setAppBuild(state, payload) {
        Vue.set(state.app, 'build_id', payload);
    },
}

const actions = {
    getGreenworks({commit, dispatch}) {
        fs.writeFile(path.join(remote.app.getAppPath(), (process.env.NODE_ENV === 'development' ? '' : '/../..') + '/steam_appid.txt'), config.appid, 'utf8', function(err) {
            if (err) {
              log.error(err);
              return;
            }
            var greenworks = require('greenworks').default;
    
            if (!greenworks.initAPI()) {
                commit('setSteamDownStatus', true);
                //if (process.env.NODE_ENV === 'development' ) greenworks.init();
                log.warn('Error on initializing steam API.');
            } else {
                greenworks.on('steam-servers-connected', _.debounce(() => {
                    log.info('Connected to Steam servers.');
                    commit('setSteamDownStatus', false);
                    EventBus.$emit('steam-servers-connected');
                }, 1000));
                greenworks.on('steam-servers-disconnected', _.debounce(() => {
                    log.info('Disconnected from Steam servers.');
                    commit('setSteamDownStatus', true);
                    EventBus.$emit('steam-servers-disconnected');
                }, 1000));
                greenworks.on('steam-server-connect-failure', _.debounce(() => {
                    log.info('Connection failure with Steam servers.');
                    commit('setSteamDownStatus', true);
                    EventBus.$emit('steam-server-connect-failure');
                }, 1000));
                greenworks.on('steam-shutdown', _.debounce(() => {
                    log.info('Steam shutdown.');
                    commit('setSteamDownStatus', true);
                    EventBus.$emit('steam-shutdown');
                }, 1000));

                greenworks.on('persona-state-change', _.debounce((steam_id, persona_change_flag) => {
                    if (persona_change_flag == greenworks.PersonaChange.Name || persona_change_flag == greenworks.PersonaChange.GameServer) {
                        dispatch('getFriend', steam_id);
                    }
                }, 1000));

                greenworks.on('item-downloaded', _.debounce((app_id, file_id, success) => {
                    if (app_id.toString() == config.appid) {
                        EventBus.$emit('item-downloaded', { file: file_id, downloaded: success });
                        dispatch('updateMod', file_id);
                    }
                }, 1000));

                let steam_id = greenworks.getSteamId();
                let handle = greenworks.getMediumFriendAvatar(steam_id.steamId);
                let buffer = greenworks.getImageRGBA(handle);
                let size = greenworks.getImageSize(handle);
                var image = new jimp({data: buffer, height: size.height, width: size.width}, (err, image) => {
                    image.getBase64(jimp.MIME_PNG, (err, src) => {
                        dispatch('setSteamProfile', {
                          'id': steam_id.steamId,
                          'name': steam_id.screenName,
                          'avatar': src,
                        });
                      });
                });
                
                commit('setGreenworks', greenworks);
                commit('setSteamDownStatus', false);
                dispatch('getPlayers');
                setInterval(function() {
                    //dispatch('getPlayers');
                }, 5 * 60 * 1000);
            }                       
        });
    },
    getPlayers({commit, state}) {
        if (!state.greenworks) {
            log.warn('Greenworks not running.');
        } else {
            state.greenworks.getNumberOfPlayers(function(players) {
                commit('setPlayers', players);
            });
        }
    },
    setSteamDownStatus(context, data) {
        context.commit('setSteamDownStatus', data);
    },
    setSteamProfile(context, data) {
        context.commit('setSteamProfile', data);
    },
    getFriends({commit, dispatch, state}) {
        let friends_data = state.greenworks.getFriends(state.greenworks.FriendFlags.Immediate);
        let friends = [];
        friends_data.forEach((friend) => {
            let game = friend.getGamePlayed();
            let ip = game.gameserverip;
            if (ip !== 0) {
                ip = convertServer(ip);
            }
            friends.push({
                'steamid': friend.getRawSteamID(),
                'name': friend.getPersonaName(),
                'game': {
                    'appid': game.appid,
                    'gameserverip': ip,
                },
            });
        })
        commit('setFriends', friends);
    },
    getFriend(context, data) {
        let friend = data;
        let game = friend.getGamePlayed();
        let ip = game.gameserverip;
        if (ip !== 0) {
            ip = convertServer(ip);
        }
        context.dispatch('editFriend', {
            'steamid': friend.getRawSteamID(),
            'name': friend.getPersonaName(),
            'game': {
                'appid': game.appid,
                'gameserverip': ip,
            },
        });
    },
    editFriend(context, data) {
        context.commit('editFriend', data);
    },
    setAppBuild(context, data) {
        context.commit('setAppBuild', data);
    },
}

const getters = {
    greenworks(state) {
        return state.greenworks;
    },
    num_players(state) {
        return state.num_players;
    },
    steam_down(state) {
        return state.steam_down;
    },
    steam_profile(state) {
        return state.steam_profile;
    },
    friends(state) {
        return state.friends
    },
    app(state) {
        return state.app;
    },
}

export default {
state,
mutations,
actions,
getters
}