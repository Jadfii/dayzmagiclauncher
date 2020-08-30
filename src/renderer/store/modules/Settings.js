import Vue from 'vue';
const remote = require('electron').remote;
const settings = remote.require('electron-settings');

const state =
{
	store:
	{
		options:
		{
			nick_name:
			{
				label: 'Nick name',
				desc: 'Set your in-game name. Defaults to your Steam nickname.',
				type: 'string',
				value: settings.getSync('options.nick_name') || ''
			},
			dayz_path:
			{
				label: 'DayZ path',
				desc: 'Set the path to your game files. This should be automatically set.',
				type: 'folder',
				value: settings.getSync('options.dayz_path') || ''
			},
			dayz_path_experimental: 
			{
				label: 'DayZ Experimental path',
				desc: 'Set the path to your game files for the experimental branch. This should be automatically set if the app is installed.',
				type: 'folder',
				value: settings.getSync('options.dayz_path_experimental') || null
			},
			parameters: 
			{
				label: 'Additional launch parameters',
				desc: 'Configure launch parameters to use alongside those set by the launcher. Ensure you know what you\'re doing.',
				type: 'string',
				value: settings.getSync('options.parameters') || ''
			},
			discord_rpc: 
			{
				label: 'Discord Rich Presence',
				desc: 'Show the launcher as your currently played game in Discord.',
				type: 'boolean',
				value: settings.getSync('options.discord_rpc')
			},
			privacy_mode: 
			{
				label: 'Privacy mode',
				desc: 'Hide your currently played server.',
				type: 'boolean',
				value: settings.getSync('options.privacy_mode')
			},
		},
		servers: settings.getSync('servers') || [],
	},
	rpc:
	{
		ready: false,
		options:
		{
			largeImageKey: 'logo_white',
			state: 'Loading',
		}
	},
	loaded:
	{
		app: false,
		mods: false,
		servers: false
	},
	error_message: null,
};
  
const mutations =
{
	editStore(state, payload)
	{
		Vue.set(state.store, payload.key, payload.value);
	},
	editOptions(state, payload)
	{
		Vue.set(state.store.options[payload.key], 'value', payload.value);
	},
	editRPCState(state, payload)
	{
		Vue.set(state.rpc.options, 'state', payload);
	},
	addRPCDetails(state, payload)
	{
		Vue.set(state.rpc.options, 'details', payload.details);
		Vue.set(state.rpc.options, 'startTimestamp', payload.time);
	},
	removeRPCDetails(state, payload)
	{
		Vue.delete(state.rpc.options, 'details');
		Vue.delete(state.rpc.options, 'startTimestamp');
	},
	setRPCReady(state, payload)
	{
		Vue.set(state.rpc, 'ready', payload);
	},
	editLoaded(state, payload)
	{
		Vue.set(state.loaded, payload.type, payload.value);
	},
	setErrorMessage(state, payload)
	{
		state.error_message = payload;
	}
}

const actions =
{
	editStore(context, data)
	{
		this._vm.$log.info(`Changed store key ${data.key} from ${JSON.stringify(context.state.store[data.key])} to ${JSON.stringify(data.value)}`);
		settings.setSync(data.key, data.value);
		context.commit('editStore', data);
	},
	editOptions(context, data)
	{
		let key = data.key.replace('options.', '');
		this._vm.$log.info(`Changed option ${key} from ${JSON.stringify(context.state.store.options[key].value)} to ${JSON.stringify(data.value)}`);
		settings.setSync(data.key, data.value);
		data.key = key;
		context.commit('editOptions', data);
	},
	editRPCState(context, data)
	{
		this._vm.$log.info(`Changed Discord RPC state to ${data}`);
		context.commit('editRPCState', data);
	},
	editRPCDetails(context, data)
	{
		if (data.type == 'add') {
			context.commit('addRPCDetails', data);
		} else if (data.type == 'remove') {
			context.commit('removeRPCDetails', data);
		}
	},
	setRPCReady(context, data)
	{
		context.commit('setRPCReady', data);
	},
	editLoaded(context, data)
	{
		if (data.type == 'app')
		{
			setTimeout(() =>
			{
				context.commit('editLoaded', data);
			}, 500);
		}
		else
		{
			context.commit('editLoaded', data);
		}
	},
	editServer(context, data)
	{
		if ((!data.ip || !data.port) && (!data.server || !data.server.ip || !data.server.port)) return this._vm.$log.error(`Incorrect server data supplied.`);

		let payload = JSON.parse(JSON.stringify(data));
		if (payload.server)
		{
			payload.ip = payload.server.ip;
			payload.port = payload.server.port;
			delete payload.server;
		}

		let servers = JSON.parse(JSON.stringify(state.store.servers));
		let index = servers.findIndex((server) => server.ip == payload.ip && server.port == payload.port);
		let server;
		let new_server;
		if (index == -1)
		{
			new_server = true;
			server = payload;
		}
		else
		{
			new_server = false;
			server = JSON.parse(JSON.stringify(servers[index]));
		}

		if (payload.last_played != null) server.last_played = payload.last_played;
		if (payload.password != null) server.password = payload.password;
		if (payload.favourited != null) server.favourited = payload.favourited;
		if (payload.character != null) server.character = payload.character;

		let delete_server = Object.keys(server).length == 2 || (Object.keys(server).length == 3 && (server.favourited != null && server.favourited === false) || (server.password && server.password.trim().length == 0));

		if (new_server)
		{
			servers.push(server);
		}
		else if (!delete_server)
		{
			servers[index] = server;
		}
		else
		{
			servers.splice(index, 1);
		}

		context.dispatch('editStore', {key: 'servers', value: servers});
	},
	toggleServerFavourited(context, data)
	{
		if (!data.ip || !data.port) return this._vm.$log.error(`Incorrect server data supplied.`);

		let server = context.state.store.servers.find(server => server.ip == data.ip && server.port == data.port);
		if (!server)
		{
			server = {ip: data.ip, port: data.port, favourited: true};
		}
		else
		{
			server = JSON.parse(JSON.stringify(server));
			server.favourited = !server.favourited;
		}
		context.dispatch('editServer', server);
	},
	updateServerLastPlayed(context, data)
	{
		if (!data.ip || !data.port) return this._vm.$log.error(`Incorrect server data supplied.`);

		let server = context.state.store.servers.find(server => server.ip == data.ip && server.port == data.port);
		if (!server)
		{
			server = {ip: data.ip, port: data._port, last_played: new Date()};
		}
		else
		{
			server = JSON.parse(JSON.stringify(server));
			server.last_played = new Date();
		}

		context.dispatch('editServer', server);
	},
	setErrorMessage(context, data)
	{
		context.commit('setErrorMessage', data);
	}
}

const getters =
{
	store(state)
	{
		return state.store;
	},
	options(state)
	{
		return state.store.options;
	},
	status(state)
	{
		return (state.rpc.details ? state.rpc.state + ' ' + state.rpc.details : state.rpc.state);
	},
	rpc(state)
	{
		return state.rpc;
	},
	loaded(state)
	{
		return state.loaded;
	},
	servers(state)
	{
		return state.store.servers;
	},
	favourited_servers(state)
	{
		return state.store.servers.filter((server) => typeof server.favourited =='boolean' && server.favourited === true) || [];
	},
	error_message(state)
	{
		return state.error_message;
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