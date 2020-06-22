import Vue from 'vue';

const API_BASE = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://api.dayzmagiclauncher.com';

const state =
{
	servers: [],
	playing_server: null,
	playing_offline: false,
	highlighted_server: {},
	last_update: null,
	filters:
	{
		search: '',
		bool:
		{
			first_person:
			{
				label: 'First person',
				options: [{label: 'Any', value: null}, {label: 'Yes', value: true}, {label: 'No', value: false}],
				selected: {label: 'Any', value: null},
				value: false,
			},
			vanilla:
			{
				label: 'Vanilla',
				options: [{label: 'Any', value: null}, {label: 'Yes', value: true}, {label: 'No', value: false}],
				selected: {label: 'Any', value: null},
				value: false,
			},
			experimental:
			{
				label: 'Experimental',
				options: [{label: 'Any', value: null}, {label: 'Yes', value: true}, {label: 'No', value: false}],
				selected: {label: 'Any', value: null},
				value: false,
			},
			friends_playing:
			{
				label: 'Friends playing',
				options: [{label: 'Any', value: null}, {label: 'Yes', value: true}, {label: 'No', value: false}],
				selected: {label: 'Any', value: null},
				value: false,
			},
		},
		list:
		{
			map:
			{
				label: 'Map',
				options: [],
				selected: {label: 'Any', value: null},
			},
			mods:
			{
				label: 'Mods',
				options: [],
				selected: [],
			},
		},
	},
};
  
const mutations =
{
	setServers(state, data)
	{
		state.servers = data;
	},
	addServers(state, data)
	{
		state.servers.push(...data);
	},
	setServer(state, data)
	{
		if (typeof data.find !== 'undefined' && data.find !== -1)
		{
			Vue.set(state.servers, find, data.server);
		}
		else
		{
			state.servers.push(data.server);
		}
	},
	setServerMods(state, data)
	{
		Vue.set(state.servers[data.find], 'mods', data.mods);
	},
	editServerPing(state, data)
	{
		let find = state.servers.findIndex((server) =>
		{
			return server.name == data.server.name;
		});
		if (find)
		{
			Vue.set(state.servers[find], 'ping', data.ping);
		}
	},
	setSearch(state, data)
	{
		state.filters.search = data;
	},
	setFilters(state, data)
	{
		state.filters = data;
	},
	setFilterValue(state, data)
	{
		Vue.set(state.filters[data.type][data.key], 'value', data.value);
	},
	setFilterSelected(state, data)
	{
		Vue.set(state.filters[data.type][data.key], 'selected', data.value);
	},
	setFilterOptions(state, data)
	{
		Vue.set(state.filters[data.type][data.key], 'options', data.options);
	},
	setLastUpdate(state, data)
	{
		state.last_update = data;
	},
	setPlayingServer(state, data)
	{
		state.playing_server = data;
	},
	setHighlightedServer(state, data)
	{
		state.highlighted_server = data;
	},
	setPlayingOffline(state, data)
	{
		state.playing_offline = data;
	}
}

const actions = {
	async getServers(context, data)
	{
		let response_stable = null;
		let response_exp = null;

		try
		{
			response_stable = await this._vm.$http.get(`${API_BASE}/servers`);
			if (context.rootState.Greenworks.app.build_id_experimental !== null)
			{
				response_exp = await this._vm.$http.get(`${API_BASE}/servers/experimental`);
			}

			let servers = [...response_stable.data.body, ...(response_exp !== null ? response_exp.data.body : [])];

			context.commit('setServers', servers);
			context.dispatch('setLastUpdate', new Date());
			context.dispatch('editLoaded', {type: 'servers', value: true}, { root: true });
		}
		catch(err)
		{
			if (err) this._vm.$log.error(err);
		}
	},
	addServer(context, data)
	{
		context.commit('addServer', data);
	},
	setServerMods(context, data)
	{
		let find = state.servers.findIndex((server) =>
		{
			return server.ip == data.ip && server.game_port == data.game_port;                
		});
		if (typeof find !== 'undefined' && find)
		{
			data.find = find;
			context.commit('setServerMods', data);
		}
	},
	pingServer(context, data)
	{
		context.commit('editServerPing', data);
	},
	setSearch(context, data)
	{
		context.commit('setSearch', data);
	},
	setFilters(context, data)
	{
		context.commit('setFilters', data);
	},
	setFilterSelected(context, data)
	{
		let options = context.state.filters;
		let type;
		Object.keys(options).some((filter) =>
		{
			type = Object.keys(options[filter]).find((key) =>
			{
				return key == data.key;
			}) ? filter : null;
			return type !== null;
		});
		data.type = type;
		context.commit('setFilterSelected', data);
	},
	setFilterValue(context, data)
	{
		let options = context.state.filters;
		let type;
		Object.keys(options).some((filter) =>
		{
			type = Object.keys(options[filter]).find((key) =>
			{
				return key == data.key;
			}) ? filter : null;
			return type !== null;
		});
		data.type = type;
		context.commit('setFilterValue', data);
	},
	setFilterOptions(context, data)
	{
		let options = context.state.filters;
		let type;
		Object.keys(options).forEach((filter) =>
		{
			type = Object.keys(options[filter]).find((key) =>
			{
				return key == data.key;
			}) ? filter : null;
		});
		data.type = type;
		context.commit('setFilterOptions', data);
	},
	setLastUpdate(context, data)
	{
		context.commit('setLastUpdate', data);
	},
	setHighlightedServer(context, data)
	{
		context.commit('setHighlightedServer', data);
	},
	setPlayingServer(context, data)
	{
		context.commit('setPlayingServer', data);
	},
	setPlayingOffline(context, data)
	{
		context.commit('setPlayingOffline', data);
	}
}

const getters =
{
	servers(state)
	{
		return state.servers;
	},
	filters(state)
	{
		return state.filters;
	},
	last_update(state)
	{
		return state.last_update;
	},
	playing_server(state)
	{
		return state.playing_server;
	},
	highlighted_server(state)
	{
		return state.highlighted_server;
	},
	playing_offline(state)
	{
		return state.playing_offline;
	}
}

export default
{
namespaced: true,
state,
mutations,
actions,
getters
}