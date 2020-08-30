<template>
	<transition name="">
		<div v-if="serverExists() && serverResponded()" class="flex flex-col flex-1 relative text-white overflow-hidden">
			<h2 class="text-2xl font-semibold leading-5 mb-2">{{ server.name }}</h2>
			<div class="inline-flex items-center">
				<span>{{ `${server.ip}:${server.game_port}` }}</span>
				<ion-icon @click="$parent.SERVER_FUNC.copyToClip(`${server.ip}:${server.game_port}`)" class="cursor-pointer ml-1 hover:opacity-75" name="copy-outline"></ion-icon>
			</div>
			<div class="inline-flex mt-4">
				<Button @click.native="play" label="Join" type="primary"></Button>
				<Button @click.native="load" label="Load" type="" class="ml-2"></Button>
				<Button @click.native="$parent.SERVER_FUNC.favouriteServer(server)" :label="favourited ? 'Unfavourite server' : 'Favourite server'" :type="favourited ? '' : 'favourite'" class="ml-2"></Button>
			</div>
			<div class="inline-flex mt-8">
				<div class="flex flex-row items-center justify-center rounded relative py-4 px-12 bg-sidebar-half">
					<div class="inline-flex flex-col items-center">
						<ion-icon class="text-xl" name="people-sharp"></ion-icon>
						<span class="text-4xl font-semibold leading-tight">{{ server.players }}/{{ server.max_players }}</span>
						<span class="text-sm">player{{ server.players == 1 ? '' : 's' }} online</span>
					</div>
					<div v-if="server.queue > 0" class="inline-flex flex-col items-center ml-8">
						<ion-icon class="text-xl" name="people-outline"></ion-icon>
						<span class="text-4xl font-semibold leading-tight">{{ server.queue }}</span>
						<span class="text-sm">player{{ server.queue == 1 ? '' : 's' }} in queue</span>
					</div>
					<div class="absolute bg-primary" :style="{width: `${fullness}%`}" style="height: 4px; top: 0; left: 0;"></div>
				</div>
				<div class="flex flex-row items-center justify-center rounded relative py-4 px-12 bg-sidebar-half ml-5">
					<ion-icon v-if="$parent.SERVER_FUNC.isNight(server.time)" class="text-5xl" name="moon-outline"></ion-icon>
					<ion-icon v-else class="text-5xl" name="sunny-outline"></ion-icon>
					<span class="text-4xl font-semibold leading-8 ml-4" style="margin-top: -6px;">{{ server.time }}</span>
				</div>
			</div>
		</div>
		<div v-else-if="serverLoading()" class="flex flex-col flex-1 relative text-white overflow-hidden">
			<h2 class="text-2xl font-semibold leading-5 mb-2">{{ server && server.name ? server.name : 'Loading...' }}</h2>
			<div class="inline-flex items-center">
				<span>Grabbing server information.</span>
			</div>
		</div>
		<div v-else class="flex flex-col flex-1 relative text-white overflow-hidden">
			<h2 class="text-2xl font-semibold leading-5 mb-2">{{ server && server.name ? server.name : 'Error' }}</h2>
			<div class="inline-flex items-center text-red-600">
				<span>Unable to contact server.</span>
			</div>
		</div>
	</transition>
</template>

<script>
export default
{
	name: 'ServerView',
	data()
	{
		return {
			server: {},
			friendsServers: [],
			server_mods: null
		}
	},
	watch:
	{
		server:
		{
			immediate: true,
			deep: true,
			async handler(val, old_val)
			{
				if (this.$route.params.ip && !val && old_val)
				{
					this.close();
					return;
				}

				this.getServerMods();
			}
		},
		mods(val)
		{
			this.getServerMods();
		},
		servers:
		{
			immediate: true,
			handler(val, old_val)
			{
				this.getServer();
			}
		}
	},
	computed:
	{
		friends()
		{
			return this.$store.getters.friends;
		},
		servers()
		{
			return this.$store.getters['Servers/servers'];
		},
		mods()
		{
			return this.$store.getters['Mods/mods'];
		},
		filters()
		{
			return this.$store.getters['Servers/filters'];
		},
		friendsPlaying()
		{
			let server = this.friendsServers.find((server) =>
			{
				return server.gameserverip == `${this.server.ip}:${this.server.game_port}`;
			});
			return typeof server !== 'undefined' ? server.friends : [];
		},
		favourited()
		{
			return this.$parent.SERVER_FUNC.isFavourite(this.server);
		},
		fullness()
		{
			return Math.round((this.server.players / this.server.max_players) * 100);
		}
	},
	methods:
	{
		async getServer()
		{
			let server = this.$parent.SERVER_FUNC.findServer(this.$route.params.ip, this.$route.params.port);
			if (!server) return null;

			this.updateBackground(this.$parent.SERVER_FUNC.getServerBackground(server));

			server = await this.$parent.SERVER_FUNC.getServerInfo(server, false, true);
			this.server = server;
			return server;
		},
		async getServerMods()
		{
			if (!this.server || !this.server.mods || !this.mods) return;
			if (this.server.mods.length == 0)
			{
				this.server_mods = [];
				return;
			}

			try
			{
				let mods = await this.$parent.MOD_FUNC.getModListDetails(this.server.mods.map(mod => mod.id.toString()));

				mods = this.$_.sortBy(mods.map(mod =>
				{
					return {...mod, subscribed: this.$parent.MOD_FUNC.isSubscribedMod(mod.publishedFileId), updated: this.$parent.MOD_FUNC.isModUpdated(mod.publishedFileId)};
				}), (mod) => mod.subscribed ? 1 : 0);
				this.server_mods = mods;
			}
			catch(err)
			{
				this.$log.error(err);
			}
		},
		serverExists()
		{
			return this.server && typeof this.server == 'object' && Object.keys(this.server).length > 0;
		},
		serverLoading()
		{
			return this.server && typeof this.server == 'object' && Object.keys(this.server).length == 0;
		},
		serverResponded()
		{
			return this.serverExists() && this.server.latency < 999;
		},
		close()
		{
			this.$router.go(-1);
		},
		load()
		{
			this.$parent.SERVER_FUNC.loadServer(this.server);
		},
		play()
		{
			this.$parent.SERVER_FUNC.playServer(this.server);
		},
		updateBackground(bg)
		{
			if (bg && this.$parent.overlay_background !== bg) this.$parent.changeAppBackground(bg);
		}
	},
	mounted()
	{
		document.addEventListener('keyup', (e) =>
		{
			if (e.keyCode == 27) // pressed ESC
			{
				this.close();
			}
		});
	},
	activated()
	{
		this.getServer();
	},
	beforeDestroy()
	{
		this.$parent.changeAppBackground();
	}
}
</script>