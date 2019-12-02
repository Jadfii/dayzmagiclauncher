const fs = require('fs-extra');
const remote = require('electron').remote;
const path = require('path');
const config = JSON.parse(fs.readFileSync(path.join(remote.app.getAppPath(), '/config.json')));
const log = require('electron-log');

import Vue from 'vue';

const state = {
    mods: [],
    page_num: 1,
};
  
const mutations = {
    setMods(state, payload) {
        state.mods = payload;
    },
    addToModList(state, payload) {
        state.mods.push(...payload);
    },
    incrementPage(state, payload) {
        state.page_num++;
    },
    setPage(state, payload) {
        state.page_num = payload;
    },
    updateMod(state, payload) {
        let index = state.mods.findIndex((mod) => {
            return mod.publishedFileId == payload.publishedFileId || mod.publishedFileId == payload;
        });
        let data = payload;
        if (!payload.publishedFileId) {
            data = state.mods.find((mod) => {
                return mod.publishedFileId == payload;
            });
        }
        Vue.set(state.mods, index, data);
    },
    removeMod(state, payload) {
        let index = state.mods.findIndex((mod) => {
            return mod.publishedFileId == payload.publishedFileId;
        });
        state.mods.splice(index, 1);
    },
}

const actions = {
    getMods({state, commit, rootState, dispatch}) {
        if (rootState.Greenworks.greenworks && rootState.Greenworks.greenworks.initAPI()) {
            if (rootState.Settings.loaded.mods) {
                dispatch('editLoaded', {type: 'mods', value: false});
                commit('setMods', []);
                commit('setPage', 1);
            }
            /* Refer for structs
            https://partner.steamgames.com/doc/api/ISteamUGC#CreateQueryUserUGCRequest */
            rootState.Greenworks.greenworks.ugcGetUserItems({
                'app_id': parseInt(config.appid),
                'page_num': state.page_num,
            }, rootState.Greenworks.greenworks.UGCMatchingType.Items, rootState.Greenworks.greenworks.UserUGCListSortOrder.SubscriptionDateDesc, rootState.Greenworks.greenworks.UserUGCList.Subscribed, function(items) {
                commit('addToModList', items);
                if (state.mods.length == state.page_num * 50) {
                    commit('incrementPage');
                    dispatch('getMods');
                } else {
                    dispatch('editLoaded', {type: 'mods', value: true});
                }
            }, function(err) {
                log.error(err);
            }); 
        }     
    },
    addMods(context, payload) {
        context.commit('addToModList', payload);
    },
    updateMod(context, payload) {
        context.commit('updateMod', payload);
    },
    removeMod(context, payload) {
        context.commit('removeMod', payload);
    },
}

const getters = {
    mods(state) {
        return state.mods;
    },
}

export default {
state,
mutations,
actions,
getters
}