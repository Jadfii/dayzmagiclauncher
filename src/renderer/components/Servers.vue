<template>
	<div class="flex flex-col h-full py-6 text-white overflow-hidden">
		<transition name="fade-scale-out">
			<div v-show="!overlay" class="flex flex-col h-full py-6 text-white overflow-hidden">
				<div class="overflow-y-hidden relative flex flex-col">
					<table class="font-light text-sm h-full min-w-full pr-4">
						<thead style="padding-right: calc(1.5rem + 2px);" class="">
							<tr class="pl-4 pr-3 pb-2 mb-2 text-left relative w-full border-b border-gray-800 border-opacity-75">
								<th class="flex-shrink-0" style="width: 3%;">
								</th>
								<th class="w-5/12 pr-4 flex-shrink-0 text-sm">
									<input @input="handleSearch" :value="filters.search" class="opacity-75 appearance-none bg-transparent border-none w-full mr-3 py-1 pr-2 focus:outline-none" type="text" placeholder="Search server or IP address">
								</th>
								<th class="w-1/12 px-4 flex-shrink-0 flex flex-row items-center">
									<a @click="sortServers($SortColumn.PLAYERS)" href="javascript:void(0);">Players</a>
									<ion-icon v-show="isActiveSort($SortColumn.PLAYERS)" :name="getChevron" class="ml-1 text-xs flex-shrink-0"></ion-icon>
								</th>
								<th class="w-2/12 px-4 flex-shrink-0">
									<span>Map</span>
								</th>
								<th class="w-1/12 px-4 flex-shrink-0">
									<span>Time</span>
								</th>
								<th class="w-1/12 px-4 flex-shrink-0">
									<a @click="sortServers($SortColumn.PING)" href="javascript:void(0);">Ping</a>
									<ion-icon v-show="isActiveSort($SortColumn.PING)" :name="getChevron" class="ml-1 text-xs flex-shrink-0"></ion-icon>
								</th>
								<th class="flex-1 pl-4 flex-shrink-0">
									<button @click="$store.dispatch('Servers/getServers')" class="flex-shrink-0 border-transparent ml-auto flex items-center text-gray-100 hover:text-white text-sm rounded" type="button">
										<ion-icon class="text-base pr-1" style="margin-top: -4px;" name="refresh"></ion-icon><span>Update list</span>
									</button>
								</th>
							</tr>
						</thead>
						<tbody class="h-full pr-6">
							<tr v-for="(server, index) in servers_filtered" @click="$store.dispatch('Servers/setHighlightedServer', server)" class="h-10 pr-3 rounded-md pl-4 bg-hover cursor-pointer" :key="index">
								<td class="flex-shrink-0" style="width: 3%;">
									<img v-show="server.country_code !== null" :src="$parent.getCountryFlag(server.country_code)" class="h-3 rounded-sm">
								</td>
								<td class="w-5/12 pr-4 truncate overflow-hidden flex-shrink-0">
									<span>{{ server.name }}</span>
								</td>
								<td class="w-1/12 px-4 flex-shrink-0">
									<span>{{ server.players }}</span><span v-show="server.queue" class="">+{{ server.queue }}</span><span>/{{ server.max_players }}</span>
								</td>
								<td class="w-2/12 px-4 flex-shrink-0">
									<span>{{ SERVER_FUNC.normaliseMap(server.map) }}</span>
								</td>
								<td class="w-1/12 px-4 flex-shrink-0">
									<span>{{ server.time }}</span>
								</td>
								<td class="w-1/12 px-4 flex-shrink-0">
									<ion-icon class="visible" :class="{'text-green-400': 60 >= server.ping, 'text-orange-400': 60 < server.ping && server.ping <= 140, 'text-red-400': 140 < server.ping}" name="wifi"></ion-icon>
									<span>{{ server.ping ? server.ping : '999' }}ms</span>
								</td>
								<td @click.stop class="w-20 flex-shrink-0 h-full flex items-center text-xl ml-auto">
									<a @click="SERVER_FUNC.favouriteServer(server)" :class="{'text-yellow-400': SERVER_FUNC.isFavourite(server)}" class="w-6 h-6 ml-auto flex flex-shrink-0 items-center justify-center" href="javascript:void(0);">
										<ion-icon name="star"></ion-icon>
									</a>
									<a class="w-6 h-6 ml-4 flex flex-shrink-0 items-center justify-center" href="javascript:void(0);">
										<ion-icon name="ellipsis-horizontal"></ion-icon>
									</a>
									<a v-if="false" @click="SERVER_FUNC.playServer(server)" class="w-12 h-full flex flex-shrink-0 items-center justify-center bg-hover" href="javascript:void(0);">
										<ion-icon name="play"></ion-icon>
									</a>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
				<div class="flex items-center flex-shrink-0 pt-8" style="height: 15%;">
					<div class="flex flex-row items-center text-sm">
						<div class="flex flex-col w-32 mr-6">
							<h6 class="uppercase">{{ filters.bool.first_person.label }}</h6>
							<span class="text-gray-500 text-xs">{{ filters.bool.first_person.value ? 'First person only' : 'All' }}</span>
						</div>
						<Toggle :state="filters.bool.first_person.value" @toggle="setFilterValue('first_person', $event)"></Toggle>
					</div>
					<div class="flex flex-row items-center text-sm ml-16">
						<div class="flex flex-col w-32 mr-6">
							<h6 class="uppercase">{{ filters.bool.vanilla.label }}</h6>
							<span class="text-gray-500 text-xs">{{ filters.bool.vanilla.value ? 'Vanilla only' : 'All' }}</span>
						</div>
						<Toggle :state="filters.bool.vanilla.value" @toggle="setFilterValue('vanilla', $event)"></Toggle>
					</div>
					<div class="flex flex-row items-center text-sm ml-16">
						<div class="flex flex-col w-32 mr-6">
							<h6 class="uppercase">{{ filters.bool.experimental.label }}</h6>
							<span class="text-gray-500 text-xs">{{ filters.bool.experimental.value ? 'Experimental only' : 'All' }}</span>
						</div>
						<Toggle :state="filters.bool.experimental.value" @toggle="setFilterValue('experimental', $event)"></Toggle>
					</div>
				</div>
			</div>
		</transition>
	</div>
</template>

<style lang="scss">
table
{
	display: flex;
	flex-flow: column;
	height: 100%;
	width: 100%;
	border-collapse: collapse;
}
table thead
{
	flex: 0 0 auto;
	width: 100%;
}
table tbody
{
	flex: 1 1 auto;
	overflow: hidden scroll;
}
table tbody tr
{
	width: 100%;
}
th
{
	font-weight: inherit;
}
table thead, tr
{
	display: flex;
	table-layout: fixed;
	align-items: center;
}
</style>

<script>
import Fuse from 'fuse.js';
const _ = require('lodash');

export default
{
	name: 'Servers',
	props:
	{
		overlay: Boolean,
	},
	data()
	{
		return {
			sort_column: this.$SortColumn.PLAYERS,
			sort_type: this.$SortType.DESC,
			servers_length: 100,
			servers_frozen: [],
		}
	},
	watch:
	{
		'filters.search'(new_value, old_value)
		{
		}
	},
	computed:
	{
		SERVER_FUNC()
		{
			return this.$parent.$refs.highlighted_server;
		},
		servers()
		{
			return this.$store.getters['Servers/servers'];
		},
		filters()
		{
			return this.$store.getters['Servers/filters'];
		},
		servers_filtered()
		{
			let servers = this.servers;

			if (this.shouldSearch())
			{
				servers = this.searchServers(servers);
			}

			if (this.sort_column !== this.$SortColumn.NONE && this.sort_type !== this.$SortType.NONE)
			{
				let column = [ this.sort_column ];
				let type = [ this.sort_type ];
				if (this.sort_column == this.$SortColumn.PLAYERS)
				{
					column = [(e) => { return e[this.$SortColumn.PLAYERS] + e[this.$SortColumn.QUEUE]; }];
				}

				servers = _.orderBy(servers, column, type);
			}

			if (this.filters.bool.first_person.value)
			{
				servers = servers.filter(server => server.first_person);
			}

			if (this.filters.bool.vanilla.value)
			{
				servers = servers.filter(server => server.mods && server.mods.length == 0);
			}

			if (this.filters.bool.experimental.value)
			{
				servers = servers.filter(server => server.experimental);
			}

			if (this.filters.bool.friends_playing.value)
			{
				servers = servers.filter(server => $parent.online_friends.filter(f => f.game.gameserverip == `${server.ip}:${server.game_port}`));
			}

			servers = servers.slice(0, this.servers_length);

			return servers;
		},
		getChevron()
		{
			switch (this.sort_type)
			{
				case this.$SortType.DESC:
					return 'chevron-down';
					break;
				case this.$SortType.DESC:
					return 'chevron-up';
					break;
				default:
					return 'help';
					break;
			}
		},
	},
	methods:
	{
		freezeList(list)
		{
			return Object.freeze(list);
			return list.map(e => Object.freeze(e));
		},
		handleSearch: _.debounce(function(e)
		{
			this.$store.dispatch('Servers/setSearch', e.target.value);
		}, 500),
		isFavourited(server)
		{
			return this.favourited_servers.filter(e =>
			{
				return e.ip == server.ip && e.port == server.query_port;
			}).length > 0;
		},
		isActiveSort(sort)
		{
			return this.sort_column == sort;
		},
		sortServers(sort)
		{
			let old_sort = this.sort_column;
			this.sort_column = sort;

			if (this.sort_type == this.$SortType.NONE && this.sort_column == this.$SortColumn.NONE)
			{
				this.sort_type = this.$SortType.DESC;
			}
			else if (this.sort_type == this.$SortType.NONE && this.sort_column == old_sort)
			{
				this.sort_type = this.$SortType.ASC;
			}
			else if (this.sort_column !== old_sort)
			{
				this.sort_type = this.$SortType.DESC;
			}
			else
			{
				this.sort_type = this.$SortType.NONE;
			} 
		},
		shouldSearch()
		{
			return this.filters.search.length > 0;
		},
		searchServers(list)
		{
			const fuse = new Fuse(this.servers, {keys: ['name', 'ip'], threshold: 0.25});
			return fuse.search(this.filters.search).map(s => s.item);
		},
		setFilterValue(key, val)
		{
			this.$store.dispatch('Servers/setFilterValue', {key: key, value: val});
		}
	},
	created()
	{
	},
}
</script>