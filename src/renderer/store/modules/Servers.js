import Vue from 'vue';
let remote = require('electron').remote;
const API_BASE = remote.getGlobal('API_BASE');

const state =
{
	servers: [],
	playing_server: null,
	playing_offline: false,
	last_update: null,
	scroll_position: null,
	filters:
	{
		search: '',
		bool:
		{
			first_person:
			{
				label: 'First person',
				value: false,
			},
			official:
			{
				label: 'Official',
				value: false,
			},
			experimental:
			{
				label: 'Experimental',
				value: false,
			},
			friends_playing:
			{
				label: 'Friends playing',
				value: false,
			},
		},
		list:
		{
			map:
			{
				label: 'Map',
				options: [],
				value: null,
			},
			mods:
			{
				label: 'Mods',
				options: [],
				value: null,
			},
		},
	},
};
  
const mutations =
{
	setServers(state, data)
	{
		let servers = JSON.parse(JSON.stringify(data));
		servers.forEach(Object.freeze);
		state.servers = servers;
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
		let find = state.servers.findIndex((server) =>
		{
			return server.ip == data.server.ip && server.query_port == data.server.query_port;
		});
		if (find !== -1) Vue.set(state.servers[find], 'mods', data.mods);
	},
	setServerPing(state, data)
	{
		let find = state.servers.findIndex((server) =>
		{
			return server.ip == data.server.ip && server.query_port == data.server.query_port;
		});
		if (find !== -1) Vue.set(state.servers[find], 'ping', data.ping);
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
		Vue.set(state.filters[data.type][data.key], 'options', data.value);
	},
	setLastUpdate(state, data)
	{
		state.last_update = data;
	},
	setPlayingServer(state, data)
	{
		state.playing_server = data;
	},
	setPlayingOffline(state, data)
	{
		state.playing_offline = data;
	},
	setScrollPosition(state, data)
	{
		state.scroll_position = data;
	}
}

const actions =
{
	async getServers(context, data)
	{
		// if servers were last updated less than 2 minutes ago
		if (!(data && data === true) && context.state.last_update !== null && Math.floor((new Date() - context.state.last_update)) / 60000 <= 2)
		{
			return;
		}

		let response_stable = null;
		let response_exp = null;

		let servers = [];

		try
		{
			response_stable = await this._vm.$http.get(`${API_BASE}/servers`);
			servers.push(...response_stable.data.body);
			/*if (context.rootState.Greenworks.app.build_id_experimental !== null)
			{
				response_exp = await this._vm.$http.get(`${API_BASE}/servers/experimental`);
				servers.push(...response_exp.data.body);
			}*/
			if (context.rootState.Greenworks.app.build_id_experimental == null)
			{
				servers = servers.filter(server => server.experimental === false);
			}
		}
		catch(err)
		{
			if (err.message) this._vm.$log.error(err.message);
		}

		context.commit('setServers', servers);
		context.dispatch('setLastUpdate', new Date());
		context.dispatch('Settings/editLoaded', {type: 'servers', value: true}, { root: true });
	},
	addServer(context, data)
	{
		context.commit('addServer', data);
	},
	setServerMods(context, data)
	{
		context.commit('setServerMods', data);
	},
	setServerPing(context, data)
	{
		context.commit('setServerPing', data);
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
		this._vm.$log.info(`Applying filter ${data.key} with value ${JSON.stringify(data.value)}`);
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
		//this._vm.$log.info(`Setting filter ${data.key} options to value ${JSON.stringify(data.value)}`);
		context.commit('setFilterOptions', data);
	},
	setLastUpdate(context, data)
	{
		context.commit('setLastUpdate', data);
	},
	setPlayingServer(context, data)
	{
		context.commit('setPlayingServer', data);
	},
	setPlayingOffline(context, data)
	{
		context.commit('setPlayingOffline', data);
	},
	setScrollPosition(context, data)
	{
		context.commit('setScrollPosition', data);
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
	playing_offline(state)
	{
		return state.playing_offline;
	},
	scroll_position(state)
	{
		return state.scroll_position;
	},
	last_played_servers(state, getters, rootState, rootGetters)
	{
		return Vue.prototype.$_.sortBy(rootGetters['Settings/servers'], (server) =>
		{
			return new Date(server.last_played);
		}).reverse().map(server => state.servers.find(s => s.ip == server.ip && s.query_port == server.port)).filter(server => !!server);
	},
	last_played(state, getters, rootState, rootGetters)
	{
		let server = rootGetters['Settings/servers'].reduce((a, b) =>
		{
			if (a.last_played && !b.last_played) return a;
			if (!a.last_played && b.last_played) return b;

			return (new Date(a.last_played) > new Date(b.last_played)) ? a : b;
		})
		if (!server) return null;
		return state.servers.find(s => s.ip == server.ip && s.query_port == server.port);
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