<template>
	<div class="flex w-screen h-screen">
		<JoinServer ref="join_server"></JoinServer>
		<HighlightedServer ref="highlighted_server"></HighlightedServer>

		<div class="flex h-full w-full z-0">
			<div class="absolute inset-0 h-screen overflow-hidden">
				<img class="w-full background" :src="config.background">
			</div>
			<div class="background"></div>   
		</div> 
		<div class="flex flex-col h-full w-full z-10">
			<div class="frame px-8 flex relative text-white text-xs uppercase font-thin w-screen border-b border-gray-800 border-opacity-75 transition-opacity duration-500">
				<svg class="self-center absolute" style="height: 14px; top: 50%; transform: translate(-50%, -50%); left: 50%; right: 0;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 737.4 60.75"><g><g><path class="fill-current" d="M14.9.83l12.4,28.8L39.78.83h14.9V59.75h-15l.08-17,.92-11.9-.5-.09L32.46,51H22.22l-7.9-20.23-.42.09,1,11.9v17H0V.83ZM126.11,47.47c-.33-6.26-9.56-8.24-9.56-8.24L102.05,5.61c-2.29-5.67-9.84-5.56-12.52,0L75.35,39.23c-10.68,2-9.89,8.57-9.89,8.57,1,12.2,30.33,12.86,30.33,12.86C127.76,59.67,126.11,47.47,126.11,47.47ZM85.41,28.85s8.24-.66,16.81-8.9l3.29,7.25S94.63,37.75,81.45,38.08Zm10,26.53s-17.8.33-24.72-7.58c0,0,3.62-3.62,6.26-3.62a50.32,50.32,0,0,0,18.46,4s11.54,0,19.45-4c0,0,4.94,2,5.93,4C120.84,48.13,116.88,54.73,95.46,55.38Zm56-35.41V40.2c0,9.23,17.23,9.15,17.23,0V38h-9.41V25.55H183V40.2c0,13.56-11.32,20.39-23.14,20.39-11.65,0-23.3-6.83-23.3-20.39V20c0-13.31,11.65-20,23.3-20,7.66,0,16.4,3.16,20.48,12.57l-12.49,5.74C164.64,10.4,151.49,12.23,151.49,20Zm44.68,39.78V.83h14.9V59.75Zm52.26.84c-11.56,0-23.22-6.75-23.22-20.14V20.14C225.21,6.82,236.87,0,248.68,0c7.24,0,16,3.08,20.73,13.57l-12.16,4.91c-4-7.33-17.14-5.66-17.14,1.66V40.45c0,7.07,13.32,9.07,16.56.91l13,6A23.73,23.73,0,0,1,248.43,60.59ZM296.28.83V45h24V59.75H281.3V.83Zm70.15,58.92L362.6,47.94H346.88l-3.67,11.81h-16L347.79.83h13.56l21.06,58.92ZM355,17.48h-.42L350.2,34.7H359ZM422.52,40V.83h15.06V40c-.08,27.63-47.1,27.63-47,0V.83h15.06V40C405.62,49.52,422.43,49.52,422.52,40ZM466.79.83,481,26l5,11.81.42-.08c-.09,0-1.58-10.15-1.67-10.15V.83h14.82V59.75H484.51L471.2,36.53,466,24.72l-.42.08,1.92,11.4V59.75h-14.9V.83Zm70.15,59.76c-11.57,0-23.22-6.75-23.22-20.14V20.14C513.72,6.82,525.37,0,537.19,0c7.24,0,16,3.08,20.72,13.57l-12.15,4.91c-4-7.33-17.15-5.66-17.15,1.66V40.45c0,7.07,13.32,9.07,16.57.91l13,6A23.71,23.71,0,0,1,536.94,60.59Zm32.87-.84V.83h15V23.14h17V.83h15V59.75h-15V37.53h-17V59.75ZM671.25,24v12.9H647.36v8.82h26V59.75h-41V.83h41v14h-26V24ZM702.54,41V59.75H687.47V.83H711c12.15,0,21.56,5.58,21.89,19.39,0,10.9-4.41,17.06-11.57,19.31L737.4,59.75H718.85L705.2,41Zm8.73-26.3h-8.73V28.21h8.73C720.68,28.21,720.68,14.73,711.27,14.73Z"/></g></g></svg>
				<div class="pl-8 flex items-center">
					<router-link v-for="(link, index) in ['home', 'servers', 'mods']" :key="index" :to="'/' + link" class="h-full flex items-center relative mr-10 opacity-75 hover:opacity-100">
						<span>{{ link }}</span>
					</router-link>
				</div>
				<div class="flex items-center ml-auto leading-none">
					<a v-if="profile" class="flex items-center mx-6 px-6 border-r border-gray-800 border-opacity-75 hover:opacity-100" :href="'steam://url/SteamIDPage/' + profile.id">
						<span class="opacity-75">{{ profile.name }}</span>
						<img class="w-8 h-8 rounded-full ml-3" :src="profile.avatar">
					</a>
					<div class="flex text-xl text-white">
					<a @click="reloadWindow" class="mr-2 h-full flex items-center opacity-50 hover:opacity-100" href="javascript:void(0);"><ion-icon name="refresh-outline"></ion-icon></a>
					<a @click="minimizeWindow" class="mx-2 h-full flex items-center opacity-50 hover:opacity-100" href="javascript:void(0);"><ion-icon name="remove-outline"></ion-icon></a>
					<a @click="maximizeWindow" class="mx-2 h-full flex items-center opacity-50 hover:opacity-100" href="javascript:void(0);"><ion-icon name="square-outline"></ion-icon></a>
					<a @click="closeWindow" class="ml-2 h-full flex items-center opacity-50 hover:opacity-100" href="javascript:void(0);"><ion-icon name="close-outline"></ion-icon></a>
					</div>
				</div>
			</div>

			<div class="px-20 h-full flex-1 flex-no-wrap">
				<keep-alive>
					<router-view :overlay="overlay_active"></router-view>
				</keep-alive>
			</div>
		</div>
	</div>
</template>

<script>
import { EventBus } from './event-bus.js';
const {remote,ipcRenderer} = require('electron');
const fs = require('fs-extra');
const moment = require('moment');
const path = require('path');
const request = require('request');
const log = remote.getGlobal('log');
const { getFileProperties, WmicDataObject } =  require('get-file-properties');
const jimp = require('jimp');
let schedule = require('node-schedule');
const DiscordRPC = require('discord-rpc');
let rpc;

const trackPageview = remote.getGlobal('trackPageview');
const trackScreenview = remote.getGlobal('trackScreenview');
const trackEvent = remote.getGlobal('trackEvent');

/* Import components */
import JoinServer from './components/JoinServer';
import HighlightedServer from './components/HighlightedServer';

export default
{
	name: 'dayzmagiclauncher',
	components:
	{
		JoinServer,
		HighlightedServer,
	},
	data()
	{
		return {
			show_backdrop: false,
			last_update_time: null,
			loading: false,
			update_ready: false,
			friends_avatars: [],
			overlay_active: false,
		}
	},
	watch:
	{
		$route(to, from)
		{
			if (this.rpc.state !== 'Playing server')
			{
				this.changeRPCState(to.matched[0].props.default.rpc_state);
			}
			if (trackPageview) trackPageview(to.name, to.path);
		},
		last_update:
		{
			immediate: true,
			handler(new_val, old_val)
			{
				if (!old_val)
				{
					this.last_update_time = moment(new Date(new_val)).fromNow();
				}
			},
		},
		steam_status(val)
		{
			this.loading = val == 0;
		},
		loaded(val)
		{
			this.loading = !val;
			if (val) log.info('App loaded.');
		},
		friends(val)
		{
			val.forEach(f =>
			{
				this.getSteamAvatar(f.steamid).then(src =>
				{
					if (src && !this.friends_avatars.find(friend => friend.profile.steamid == f.steamid))
					{
						this.friends_avatars.push({
						'profile': f,
						'avatar': src
						});
					}
				});
			});
		},
	},
	computed:
	{
		config()
		{
			return this.$store.getters.config;
		},
		development()
		{
			return process.env.NODE_ENV === 'development';
		},
		profile()
		{
			return this.$store.getters.steam_profile;
		},
		store()
		{
			return this.$store.getters.store;
		},
		options()
		{
			return this.$store.getters.options;
		},
		greenworks()
		{
			return this.$store.getters.greenworks;
		},
		status()
		{
			return this.$store.getters.status;
		},
		app()
		{
			return this.$store.getters.app;
		},
		loaded()
		{
			return this.$store.getters.loaded.app;
		},
		rpc()
		{
			return this.$store.getters.rpc;
		},
		steam_status()
		{
			return this.$store.getters.steam_status;
		},
		mods()
		{
			return this.$store.getters.mods;
		},
		last_update()
		{
			return this.$store.getters['Servers/last_update'];
		},
		servers()
		{
			return this.$store.getters['Servers/servers'];
		},
		friends()
		{
			return this.$store.getters.friends;
		},
		online_friends()
		{
			let friends = this.$_.shuffle(this.friends);
			return friends.filter((friend) => 
			{
				return friend.hasOwnProperty('game') && friend.game.hasOwnProperty('appid') && friend.game.appid !== 0 && friend.game.appid.toString() == this.config.appid.toString() && this.getFriendServer(friend);
			});
		},
	},
	methods:
	{
		openURL(url)
		{ // use with caution
			remote.shell.openExternal(url).catch((err) =>
			{
				// no.
			});
		},
		minimizeWindow()
		{
			remote.getCurrentWindow().minimize();
		},
		maximizeWindow()
		{
			let window = remote.getCurrentWindow();
			if (!window.isMaximized())
			{
				window.maximize();
			}
			else
			{
				window.unmaximize();
			}
		},
		closeWindow()
		{
			remote.getCurrentWindow().close();
		},
		reloadWindow()
		{
			this.$router.push('/');
			remote.getCurrentWindow().reload();
		},
		checkUpdate()
		{
			ipcRenderer.send('check_for_update');
		},
		updateApp()
		{
			ipcRenderer.send('install_update');
		},
		changeRPCState(state)
		{
			this.$store.dispatch('editRPCState', state);
		},
		getSteamProfile()
		{
			if (this.greenworks && !this.steam_status == 1)
			{
				let steam_id = this.greenworks.getSteamId();
				if (this.options.nick_name == '') this.$store.dispatch('editOptions', {key: 'options.nick_name', value: steam_id.screenName});
			}
		},
		getSteamAvatar(steam_id)
		{
			return new Promise((resolve, reject) =>
			{
				let handle = this.greenworks.getMediumFriendAvatar(steam_id);
				let buffer = this.greenworks.getImageRGBA(handle);
				let size = this.greenworks.getImageSize(handle);
				let image = new jimp({data: buffer, height: size.height, width: size.width}, (err, image) =>
				{
					if (err) reject(err);
					image.getBase64(jimp.MIME_PNG, (err, src) =>
					{
						if (err) reject(err);
						resolve(src);
					});
				});
		});
		},
		getFriendAvatar(steam_id)
		{
			let find = this.friends_avatars.find(f => f.profile.steamid == steam_id);
			return find ? find.avatar : null;
		},
		getFriendServer(friend)
		{
			let server = this.findServer(friend.game.gameserverip);
			return server || null;
		},
		joinFriendServer(friend)
		{
			let server = this.getFriendServer(friend);
			if (server)
			{
				this.$refs.join_server.joinServer(server);
			}
		},
		findServer(server)
		{
			if (!server.includes(':')) return null;
			if (!this.servers || this.servers.length == 0) return null;
			let ip = server.split(':')[0];
			let port = server.split(':')[1];
			return this.servers.find(server => server.ip == ip && (server.query_port == port || server.game_port == port));
		},
		getCountryFlag(country_code)
		{
			if (!country_code) return;
			return `https://cdn.ipwhois.io/flags/${country_code.toLowerCase()}.svg`;
		},
		appLoad()
		{
			if (!this.development) this.loading = true;
			this.$store.dispatch('getGreenworks');
			/* refresh servers every 5 minutes */
			schedule.scheduleJob('*/5 * * * *', (date) =>
			{
				this.$store.dispatch('Servers/getServers');
			});
			schedule.scheduleJob('* * * * *', (date) =>
			{
				this.last_update_time = moment(this.last_update).fromNow();
			});
		},
		async setActivity(options)
		{
			if (rpc && this.rpc.ready)
			{
				rpc.setActivity(Object.assign({
					instance: false,
				}, options));
			}
		},
		openRPC()
		{
			rpc = new DiscordRPC.Client({ transport: 'ipc' });
			const clientId = this.config.discord_rpc_client_id;

			rpc.on('ready', () =>
			{
				this.$store.dispatch('setRPCReady', true);
				this.setActivity(this.rpc.options);
				log.info('Discord RPC ready.');
			});

			rpc.on('connected', () =>
			{
				log.info('Connected to Discord RPC.');
			});   

			rpc.on('disconnected', () =>
			{
				if (rpc !== null) {
				log.info('Disconnected from Discord RPC.');
				rpc.connect();
				}
			});
			
			rpc.login({ clientId }).catch(log.error);
		},
	},
	created()
	{
		this.$store.subscribe((mutation, state) =>
		{
			if (mutation.type == 'setSteamDownStatus' && mutation.payload === true && !this.loaded)
			{
				this.appLoad();
			}

			if (mutation.type == 'editOptions')
			{
				if (mutation.payload.key == 'options.discord_rpc')
				{
					if (mutation.payload.value) this.openRPC();
					else if (rpc) rpc.destroy();
				}
			}

			if (mutation.type.toLowerCase().includes('rpc'))
			{
				this.setActivity(this.rpc.options);
			}

			if (mutation.type == 'setGreenworks')
			{
				this.changeRPCState(this.$route.matched[0].props.default.rpc_state);
				this.$store.dispatch('getMods');
				this.getSteamProfile();
				this.$store.dispatch('getFriends');
				if (!this.greenworks.isAppInstalled(parseInt(this.config.appid)))
				{
					this.$refs.alert.alert({
						title: 'Error',
						message: 'Please ensure you have DayZ installed.',
					}).catch((err) =>
					{
						if (err) log.error(err);
						return;
					});
				}
				else if (!this.options.dayz_path || (this.options.dayz_path && this.options.dayz_path == ''))
				{
					this.$store.dispatch('editOptions', {key: 'options.dayz_path', value: this.greenworks.getAppInstallDir(parseInt(this.config.appid))});
				}

				getFileProperties(path.join(this.options.dayz_path, 'DayZ_x64.exe')).then((metadata) =>
				{
					this.$store.dispatch('setAppBuild', {id: metadata.Version, experimental: false});
				}).catch((err) =>
				{
					if (err) log.error(err);
				});

				if (this.greenworks.isAppInstalled(parseInt(this.config.appid_experimental)) && (!this.options.dayz_path_experimental || (this.options.dayz_path_experimental && this.options.dayz_path_experimental == '')))
				{
					this.$store.dispatch('editOptions', {key: 'options.dayz_path_experimental', value: this.greenworks.getAppInstallDir(parseInt(this.config.appid_experimental))});
				}

				if (this.options.dayz_path_experimental && this.options.dayz_path_experimental.length > 0)
				{
					getFileProperties(path.join(this.options.dayz_path_experimental, 'DayZ_x64.exe')).then((metadata) =>
					{
						this.$store.dispatch('setAppBuild', {id: metadata.Version, experimental: true});
					}).catch((err) =>
					{
						if (err) log.error(err);
					});
				}

				if (this.options.discord_rpc)
				{
					this.openRPC();
				}

				this.$store.dispatch('Servers/getServers');
			}
			else if (mutation.type == 'editLoaded' && this.$store.getters.loaded.mods && this.$store.getters.loaded.servers && !this.$store.getters.loaded.app)
			{
				this.$store.dispatch('editLoaded', {type: 'app', value: true});
				this.$refs.join_server.addModJunctions(this.mods.map(e =>
				{
					return {id: e.publishedFileId, name: e.title};
				}));
				if (trackEvent) trackEvent('App', 'Loaded');
			}
		});

		ipcRenderer.on('router_push', (event, route) =>
		{
			if (this.$route.path !== '/'+route) this.$router.push(route);
		});

		ipcRenderer.on('update_message', (event, text) =>
		{
			log.info(text);
			if (text == 'update_downloaded')
			{
				this.update_ready = true;
			}
		});

		ipcRenderer.on('join_server', (event, server) =>
		{
			this.$refs.join_server.joinServer(server);
		});

		ipcRenderer.on('error', (event, error) =>
		{
			/*this.$refs.error_diag.make_error({
				error: error,
			});*/
		});

		this.appLoad();

		EventBus.$on('openOverlay', (payload) =>
		{
			this.overlay_active = true;
		});
		
		EventBus.$on('closeOverlay', (payload) =>
		{
			this.overlay_active = false;
		});
	}
}
</script>