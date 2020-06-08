import Vue from 'vue';
const fs = require('fs-extra');
const remote = require('electron').remote;
const path = require('path');
const log = remote.getGlobal('log');

const state =
{
    mods: [],
    page_num: 1,
};
  
const mutations =
{
    setMods(state, data)
    {
        state.mods = data;
    },
    addToModList(state, data)
    {
        state.mods.push(...data);
    },
    incrementPage(state, data)
    {
        state.page_num++;
    },
    setPage(state, data)
    {
        state.page_num = data;
    },
    updateMod(state, data)
    {
        let index = state.mods.findIndex((mod) =>
        {
            return mod.publishedFileId == data.publishedFileId || mod.publishedFileId == data;
        });
        let temp = data;
        if (!data.publishedFileId)
        {
            temp = state.mods.find((mod) =>
            {
                return mod.publishedFileId == data;
            });
        }
        Vue.set(state.mods, index, temp);
    },
    removeMod(state, data)
    {
        let index = state.mods.findIndex((mod) =>
        {
            return mod.publishedFileId == data.publishedFileId;
        });
        state.mods.splice(index, 1);
    },
}

const actions =
{
    getMods(context, data)
    {
        if (context.rootState.Greenworks.greenworks && context.rootState.Greenworks.greenworks.initAPI())
        {
            if (context.rootState.Settings.loaded.mods)
            {
                context.dispatch('editLoaded', {type: 'mods', value: false});
                context.commit('setMods', []);
                context.commit('setPage', 1);
            }
            context.rootState.Greenworks.greenworks.ugcGetUserItems(
            {
                'app_id': parseInt(context.rootState.Config.config.appid),
                'page_num': state.page_num,
            }, context.rootState.Greenworks.greenworks.UGCMatchingType.Items, context.rootState.Greenworks.greenworks.UserUGCListSortOrder.SubscriptionDateDesc, context.rootState.Greenworks.greenworks.UserUGCList.Subscribed, (items) =>
            {
                context.commit('addToModList', items);
                if (state.mods.length == state.page_num * 50)
                {
                    context.commit('incrementPage');
                    context.dispatch('getMods');
                }
                else
                {
                    context.dispatch('editLoaded', {type: 'mods', value: true});
                }
            }, (err) =>
            {
                log.error(err);
            }); 
        }     
    },
    addMods(context, data)
    {
        context.commit('addToModList', data);
    },
    updateMod(context, data)
    {
        context.commit('updateMod', data);
    },
    removeMod(context, data)
    {
        context.commit('removeMod', data);
    },
}

const getters =
{
    mods(state)
    {
        return state.mods;
    },
}

export default
{
state,
mutations,
actions,
getters
}