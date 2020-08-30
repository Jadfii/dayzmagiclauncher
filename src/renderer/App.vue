<template>
	<div class="flex w-screen h-screen">
		<!-- DECLARE GLOBAL COMPONENTS -->
		<GameFunctions ref="game_functions"></GameFunctions>
		<ServerFunctions ref="server_functions"></ServerFunctions>
		<ModFunctions ref="mod_functions"></ModFunctions>

		<!-- DIALOGS -->
		<Alert ref="alert"></Alert>
		<Confirm ref="confirm"></Confirm>
		<Prompt ref="prompt"></Prompt>

		<div class="flex h-full w-full absolute">
			<div class="absolute inset-0 h-screen overflow-hidden">
				<img v-show="overlay_background" class="w-full background" :src="overlay_background">
				<img v-show="!overlay_background" class="w-full background" :src="config.background">
			</div>
			<div class="background"></div>   
		</div>

		<div class="flex flex-col h-full w-full">
			<div class="z-50 relative text-white">
				<div :class="{'bg-sidebar': loading}" class="frame flex h-full leading-none">
					<div class="sidebar h-full"></div>
					<div class="flex flex-row ml-auto text-base text-white">
						<a @click="reloadWindow" class="hover-bg-sidebar-2 mr-2 w-8 h-full flex items-center justify-center" href="javascript:void(0);"><ion-icon name="refresh-outline"></ion-icon></a>
						<a @click="minimizeWindow" class="hover-bg-sidebar-2 w-8 h-full flex items-center justify-center" href="javascript:void(0);"><ion-icon name="remove-outline"></ion-icon></a>
						<a @click="maximizeWindow" class="hover-bg-sidebar-2 w-8 h-full flex items-center justify-center" href="javascript:void(0);"><ion-icon name="square-outline"></ion-icon></a>
						<a @click="closeWindow" class="w-8 h-full flex items-center justify-center hover:bg-red-600" href="javascript:void(0);"><ion-icon name="close-outline"></ion-icon></a>
					</div>
				</div>
			</div>

			<transition name="fade-out">
				<div v-if="loading" class="fixed inset-0 w-full h-full inline-flex flex-col items-center justify-center bg-sidebar text-white z-20">
					<Logo class="h-8"></Logo>
					<div v-if="error_message" class="mt-3 text-gray-500">
						<span>{{ error_message }}</span>
					</div>
				</div>
			</transition>
			<div v-if="!loading" class="inline-flex flex-row flex-1 relative overflow-hidden">
				<div class="sidebar flex flex-col flex-shrink-0 h-full text-white px-6 pt-12 pb-12">
					<div class="inline-flex h-24 my-2 frame-margin pl-2">
						<Logo class="h-5"></Logo>
					</div>
					<div class="inline-flex flex-col font-medium flex-1">
						<SidebarLink :margin="true" link="Home" icon="home-sharp"></SidebarLink>
						<SidebarLink :margin="true" link="Servers" icon="list-sharp"></SidebarLink>
						<SidebarLink :margin="true" link="Mods" icon="file-tray-sharp"></SidebarLink>
						<SidebarLink :margin="true" link="Playground" icon="game-controller-sharp"></SidebarLink>
						<SidebarLink class="mb-2 mt-auto" link="Settings" icon="settings-outline"></SidebarLink>
						<a v-if="profile && profile.avatar" class="router-link flex items-center opacity-50 hover:opacity-100 transition-opacity duration-100 rounded" :href="`steam://url/SteamIDPage/${profile.id}`">
							<img class="w-5 h-5 rounded-full mr-3" :src="profile.avatar">
							<span class="">{{ profile.name }}</span>
						</a>
					</div>
				</div>

				<div class="z-10 overflow-hidden w-full">
					<div class="flex flex-col h-full w-full pb-6 relative">
						<div class="inline-flex flex-col px-12 pt-12 pb-8 h-full">
							<div class="flex items-start h-24 my-2 frame-margin text-white font-bold">
								<div :class="{'max-w-5xl': !hasBackButton()}" class="inline-flex flex-col max-w-3xl">
									<h1 class="text-4xl leading-6">{{ $router.currentRoute.matched[0].name }}</h1>
									<span class="font-normal mr-16 mt-4 text-gray-500" v-if="$router.currentRoute.matched[0].meta && $router.currentRoute.matched[0].meta.description">{{ $router.currentRoute.matched[0].meta.description }}</span>
								</div>
								<Button v-if="hasBackButton()" @click.native="$router.go(-1)" class="ml-auto flex items-center">
									<ion-icon name="arrow-back-sharp"></ion-icon>
									<span class="ml-2">Go back (ESC)</span>
								</Button>
							</div>
							<keep-alive :exclude="['ServerView']">
								<router-view></router-view>
							</keep-alive>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import Vue from 'vue';
const { remote,ipcRenderer } = require('electron');
const path = require('path');
const { getFileProperties } = require('get-file-properties');
const jimp = require('jimp');
const schedule = require('node-schedule');
const DiscordRPC = require('discord-rpc');
let rpc;

const trackPageview = remote.getGlobal('trackPageview');
const trackScreenview = remote.getGlobal('trackScreenview');
const trackEvent = remote.getGlobal('trackEvent');

/* Import components */
import GameFunctions from './components/GameFunctions';
import ServerFunctions from './components/ServerFunctions';
import ModFunctions from './components/ModFunctions';

// dialogs
import Alert from './components/dialog/Alert';
import Confirm from './components/dialog/Confirm';
import Prompt from './components/dialog/Prompt';

export default
{
	name: 'MagicLauncher',
	components:
	{
		GameFunctions,
		ServerFunctions,
		ModFunctions,

		Alert,
		Confirm,
		Prompt
	},
	data()
	{
		return {
			last_update_time: null,
			loading: true,
			update_ready: false,
			friends_avatars: [],
			overlay_background: null,
		}
	},
	watch:
	{
		$route(to, from)
		{
			if (this.rpc.options.state !== 'Playing server' && to.matched.length > 0 && to.matched[0].meta && to.matched[0].meta.rpc_state && this.rpc.options.state !== to.matched[0].meta.rpc_state)
			{
				this.changeRPCState(to.matched[0].meta.rpc_state);
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
					this.last_update_time = this.$moment(new Date(new_val)).fromNow();
				}
			},
		},
		steam_status(val)
		{
			if (val == this.$SteamStatus.OFFLINE)
			{
				this.$store.dispatch('Settings/setErrorMessage', `Unable to connect to Steam.`);
			}
			else
			{
				this.$store.dispatch('Settings/setErrorMessage', null);
			}
		},
		error_message(val)
		{
			this.loading = val && val.length > 0;
		},
		loaded:
		{
			deep: true,
			handler(val)
			{
				if (!this.development) this.loading = !val.app;
				if (val.app === true) this.$log.info('App loaded.');
			},
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
		GAME_FUNC()
		{
			return this.$refs.game_functions;
		},
		SERVER_FUNC()
		{
			return this.$refs.server_functions;
		},
		MOD_FUNC()
		{
			return this.$refs.mod_functions;
		},
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
			return this.$store.getters['Settings/store'];
		},
		options()
		{
			return this.$store.getters['Settings/options'];
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
			return this.$store.getters['Settings/loaded'];
		},
		rpc()
		{
			return this.$store.getters['Settings/rpc'];
		},
		error_message()
		{
			return this.$store.getters['Settings/error_message'];
		},
		steam_status()
		{
			return this.$store.getters.steam_status;
		},
		mods()
		{
			return this.$store.getters['Mods/mods'];
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
			return this.friends.filter((friend) => 
			{
				return friend.game.appid !== 0 && friend.game.appid.toString() == this.config.appid.toString() && friend.game.gameserverip !== '0.0.0.0:0';
			}).map(friend => { return {...friend, server: this.getFriendServer(friend)} });
		}
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
			this.$store.dispatch('Settings/editRPCState', state);
		},
		changeAppBackground(bg)
		{
			if (!bg) this.overlay_background = this.config.background;
			else this.overlay_background = bg;
		},
		hasBackButton()
		{
			return this.$router.currentRoute.meta && this.$router.currentRoute.meta.go_back;
		},
		getRouteChildren()
		{
			let route = this.$router.options.routes.find(route => route.path == this.$route.matched[0].path);
			return route ? route.children : null;
		},
		normaliseVersionNo(version)
		{
			return version.replace(/\./g, '').replace(/0/g, '');
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
		getFriendLink(steam_id)
		{
			return `steam://url/SteamIDPage/${steam_id}`;
		},
		getFriendAvatar(steam_id)
		{
			let find = this.friends_avatars.find(f => f.profile.steamid == steam_id);
			return find ? find.avatar : null;
		},
		getFriendServer(friend)
		{
			return this.$refs.server_functions.findServer(friend.game.gameserverip) || null;
		},
		joinFriendServer(friend)
		{
			let server = this.getFriendServer(friend);
			if (server)
			{
				this.$refs.join_server.joinServer(server);
			}
		},
		appLoad()
		{
			//return;
			if (this.development) this.loading = false;
			this.$store.dispatch('getGreenworks');
			/* refresh servers every 10 minutes */
			schedule.scheduleJob('*/10 * * * *', (date) =>
			{
				this.$store.dispatch('Servers/getServers');
			});
			schedule.scheduleJob('* * * * *', (date) =>
			{
				this.last_update_time = this.$moment(this.last_update).fromNow();
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
				this.$store.dispatch('Settings/setRPCReady', true);
				this.setActivity(this.rpc.options);
				this.$log.info('Discord RPC ready.');
			});

			rpc.on('connected', () =>
			{
				this.$log.info('Connected to Discord RPC.');
			});   

			rpc.on('disconnected', () =>
			{
				if (rpc !== null)
				{
					this.$log.info('Disconnected from Discord RPC.');
					rpc.connect();
				}
			});
			
			rpc.login({ clientId }).catch(this.$log.error);
		},
		getChevron(sort_type)
		{
			switch (sort_type)
			{
				case this.$SortType.DESC:
					return 'chevron-down';
					break;
				case this.$SortType.ASC:
					return 'chevron-up';
					break;
				default:
					return 'help';
					break;
			}
		},
	},
	created()
	{
		this.$store.subscribe((mutation, state) =>
		{
			if (mutation.type == 'setSteamDownStatus' && mutation.payload === true && !this.loaded.app)
			{
				this.appLoad();
			}

			if (mutation.type == 'Settings/editOptions' && mutation.payload.key == 'options.discord_rpc')
			{
				if (mutation.payload.value === true) this.openRPC();
				else if (rpc) rpc.destroy();
			}

			if (mutation.type.toLowerCase().includes('rpc'))
			{
				this.setActivity(this.rpc.options);
			}

			if (mutation.type == 'setGreenworks')
			{
				if (this.$route.matched.length > 0 && this.$route.matched[0].meta && this.$route.matched[0].meta.rpc_state) this.changeRPCState(this.$route.matched[0].meta.rpc_state);
				this.$store.dispatch('Mods/getMods');
				this.$store.dispatch('getFriends');
				if (!this.greenworks.isAppInstalled(parseInt(this.config.appid)))
				{
					this.$alert({
						title: 'Error',
						message: 'Please ensure you have DayZ installed.',
					});
				}
				else if (!this.options.dayz_path.value || (this.options.dayz_path.value && this.options.dayz_path.value == ''))
				{
					this.$store.dispatch('Settings/editOptions', {key: 'options.dayz_path', value: this.greenworks.getAppInstallDir(parseInt(this.config.appid))});
				}

				getFileProperties(path.join(this.options.dayz_path.value, 'DayZ_x64.exe')).then((metadata) =>
				{
					this.$store.dispatch('setAppBuild', {id: metadata.Version, experimental: false});
				}).catch((err) =>
				{
					if (err) this.$log.error(err);
				});

				if (this.greenworks.isAppInstalled(parseInt(this.config.appid_experimental)) && (!this.options.dayz_path_experimental.value || (this.options.dayz_path_experimental.value && this.options.dayz_path_experimental.value == '')))
				{
					this.$store.dispatch('Settings/editOptions', {key: 'options.dayz_path_experimental', value: this.greenworks.getAppInstallDir(parseInt(this.config.appid_experimental))});
				}

				if (this.options.dayz_path_experimental.value && this.options.dayz_path_experimental.value.length > 0)
				{
					getFileProperties(path.join(this.options.dayz_path_experimental.value, 'DayZ_x64.exe')).then((metadata) =>
					{
						this.$store.dispatch('setAppBuild', {id: metadata.Version, experimental: true});
					}).catch((err) =>
					{
						if (err) this.$log.error(err);
					});
				}

				if (this.options.discord_rpc.value && !this.development)
				{
					this.openRPC();
				}

				this.$store.dispatch('Servers/getServers');
			}
			else if (mutation.type == 'Settings/editLoaded' && this.loaded.mods && this.loaded.servers && !this.loaded.app)
			{
				this.$store.dispatch('Settings/editLoaded', {type: 'app', value: true});
				this.MOD_FUNC.addModJunctions();
				if (trackEvent) trackEvent('App', 'Loaded');
			}
			else if (mutation.type == 'setSteamProfile' && !this.options.nick_name.value.trim())
			{
				this.$store.dispatch('Settings/editOptions', {key: 'options.nick_name', value: this.profile.name});
			}
		});

		ipcRenderer.on('router_push', (event, route) =>
		{
			if (this.$route.path !== `/${route}`) this.$router.push(route);
		});

		ipcRenderer.on('update_message', (event, text) =>
		{
			this.$log.info(text);
			if (text == 'update_downloaded')
			{
				this.update_ready = true;
			}
		});

		ipcRenderer.on('view_server', (event, data) =>
		{
			let server = this.SERVER_FUNC.findServer(data);
			if (!server) return;
			this.$router.push(`server/${server.ip}/${server.query_port}`);
		});

		ipcRenderer.on('play_server', (event, data) =>
		{
			let server = this.SERVER_FUNC.findServer(data);
			if (!server) return;
			this.SERVER_FUNC.playServer(server);
		});

		this.appLoad();
		this.changeAppBackground();
	},
	mounted()
	{
		Vue.prototype.$alert = this.$refs.alert.initiate;
		Vue.prototype.$confirm = this.$refs.confirm.initiate;
		Vue.prototype.$prompt = this.$refs.prompt.initiate;
	}
}
</script>