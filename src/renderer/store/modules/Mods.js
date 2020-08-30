import Vue from 'vue';

const state =
{
	mods: [],
	page_num: 1,
	filters:
	{
		search: '',
	}
};
  
const mutations =
{
	setMods(state, data)
	{
		let mods = JSON.parse(JSON.stringify(data));
		mods.forEach(Object.freeze);
		state.mods = data;
	},
	addToModList(state, data)
	{
		let mods = JSON.parse(JSON.stringify(data));
		mods.forEach(Object.freeze);
		state.mods.push(...mods);
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
			return mod.publishedFileId == data || mod.publishedFileId == data.publishedFileId;
		});
		Vue.set(state.mods, index, data);
	},
	removeMod(state, data)
	{
		let index = state.mods.findIndex((mod) =>
		{
			return mod.publishedFileId == data;
		});
		state.mods.splice(index, 1);
	},
	setSearch(state, data)
	{
		state.filters.search = data;
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
				context.dispatch('Settings/editLoaded', {type: 'mods', value: false});
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
					context.dispatch('Settings/editLoaded', {type: 'mods', value: true}, { root: true });
				}
			}, (err) =>
			{
				this._vm.$log.error(err);
			}); 
		}     
	},
	addMods(context, data)
	{
		context.commit('addToModList', data);
	},
	updateMod(context, data)
	{
		let mod = data;
		if (!data.publishedFileId)
		{
			mod = context.state.mods.find((mod) =>
			{
				return mod.publishedFileId == data;
			});
		}

		if (mod && mod.publishedFileId) context.commit('updateMod', mod);
	},
	removeMod(context, data)
	{
		context.commit('removeMod', data);
	},
	setSearch(context, data)
	{
		context.commit('setSearch', data);
	}
}

const getters =
{
	mods(state)
	{
		return state.mods;
	},
	filters(state)
	{
		return state.filters;
	},
}

export default
{
namespaced: true,
state,
mutations,
actions,
getters
}