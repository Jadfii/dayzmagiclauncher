<template>
	<div v-if="server" @click="$router.push(`server/${server.ip}/${server.query_port}`)" class="relative flex flex-row items-center flex-shrink-0 h-14 bg-sidebar-half cursor-pointer rounded text-sm hover:bg-black transition-colors duration-200">
		<div @click.stop class="w-14 flex-shrink-0 h-full flex items-center justify-center text-2xl">
			<a @click="$parent.$parent.SERVER_FUNC.favouriteServer(server)" :class="{'text-yellow-400': $parent.$parent.SERVER_FUNC.isFavourite(server)}" class="w-6 h-6 flex items-center justify-center" href="javascript:void(0);">
				<ion-icon :name="$parent.$parent.SERVER_FUNC.isFavourite(server) ? 'bookmark' : 'bookmark-outline'"></ion-icon>
			</a>
		</div>
		<div class="md:w-5/12 2xl:w-5/12 pr-2 truncate overflow-hidden flex-shrink-0">
			<span>{{ server.name }}</span>
		</div>
		<div class="w-28 px-2 flex-shrink-0">
			<span>{{ server.players }}</span><span>/{{ server.max_players }}</span><span v-show="server.queue" class=""> (+{{ server.queue }})</span>
		</div>
		<div class="w-16 px-2">
			<span>{{ server.time }}</span>
		</div>
		<div class="w-32 px-2">
			<span class="">{{ $parent.$parent.SERVER_FUNC.normaliseMap(server.map) }}</span>
		</div>
		<div class="w-16 px-2 ml-auto">
			<span :class="{'text-green-400': 60 >= server.latency, 'text-orange-400': 60 < server.latency && server.latency <= 140, 'text-red-400': 140 < server.latency}">{{ server.latency == 999 ? 'Offline' : `${server.latency}ms` }}</span>
		</div>
		<div @click.stop class="w-14 flex-shrink-0 h-full flex items-center justify-center text-xl bg-hover-light ml-2 rounded-r">
			<a @click="$parent.$parent.SERVER_FUNC.playServer(server)" class="w-6 h-full flex flex-shrink-0 items-center justify-center" href="javascript:void(0);">
				<ion-icon name="play"></ion-icon>
			</a>
		</div>
	</div>
</template>

<script>
export default
{
	props:
	{
		object: Object,
	},
	data()
	{
		return {
			server: null,
		}
	},
	watch:
	{
		'$parent.servers'(val)
		{
			this.getServer();
		},
		'$parent.servers_filtered'(val)
		{
			this.getServer();
		},
		'$parent.$parent.SERVER_FUNC.servers_info':
		{
			immediate: true,
			handler(val)
			{
				this.getServer();
			}
		},
	},
	methods:
	{
		async getServer()
		{
			this.server = await this.$parent.$parent.SERVER_FUNC.getServerInfo(this.object);

			return this.server;
		}
	}
}
</script>