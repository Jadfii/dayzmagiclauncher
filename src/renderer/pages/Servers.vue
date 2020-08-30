<template>
	<div class="flex flex-col flex-1 relative text-white overflow-hidden">
		<div class="inline-flex flex-1 overflow-y-hidden">
			<div class="inline-flex flex-col w-56 h-full pr-6 flex-shrink-0">
				<h2 class="text-lg font-semibold">Filters</h2>
				<div class="inline-flex flex-col mt-4">
					<Input @input="handleSearch" :value="filters.search" :speech="true" icon="search-sharp" placeholder="Search server or IP address" class="w-full mb-8"></Input>
					<ServerFilter v-for="(filter, index) in ['official', 'first_person', 'experimental']" :key="index"  :label="filters.bool[filter].label" :state="filters.bool[filter].value" @toggle="setFilterValue(filter, $event)" class="mb-4"></ServerFilter>
				</div>
				<div class="">
					<Dropdown @select="setFilterValue('map', $event)" :up="true" :none="true" label="Map" :selected="filters.list.map.value" :options="filters.list.map.options" class="w-full"></Dropdown>
				</div>
				<div class="mt-auto mb-4">
					<Dropdown @select="setSort" :up="true" label="Sort by" :selected="sort_column" :options="[$SortColumn.NAME, $SortColumn.PLAYERS, $SortColumn.PING]" class="w-full"></Dropdown>
				</div>
				<Button @click.native="refreshServers" class="flex items-center py-2 px-8 flex-shrink-0 text-white">
					<ion-icon name="refresh-sharp"></ion-icon>
					<span class="ml-2">Refresh servers</span>
				</Button>
			</div>
			<div v-if="servers_filtered.length > 0" @scroll.passive="handleScroll($event.target.scrollTop)" ref="servers" class="inline-flex flex-col pr-2 overflow-y-scroll w-full">
				<ServerListItem v-for="(server, index) in servers_filtered" :key="index" :object="server" class="mb-2"></ServerListItem>
			</div>
			<div v-else>
				<h6 class="text-white text-xl font-semibold">Nothing to see here</h6>
				<span class="text-red-600">No servers found.</span>
			</div>
		</div>
	</div>
</template>

<script>
import { debounce } from 'lodash';
import ServerListItem from './../components/ServerListItem';

export default
{
	name: 'Servers',
	components:
	{
		ServerListItem
	},
	data()
	{
		return {
			sort_column: this.$SortColumn.PLAYERS,
			sort_type: this.$SortType.DESC,
			servers_length: 100,
			servers_filtered: [],
			pinging_servers: false,
			refreshing_servers: false,
			list_filters_cache: null,
		}
	},
	watch:
	{
		servers:
		{
			immediate: true,
			handler(new_value, old_value)
			{
				this.setFilteredServers();
				this.setMapOptions();
			}
		},
		'filters.bool':
		{
			deep: true,
			handler(new_value, old_value)
			{
				this.setFilteredServers();
			}
		},
		'filters.search':
		{
			deep: true,
			handler(new_value, old_value)
			{
				this.setFilteredServers();
			}
		},
		'filters.list':
		{
			deep: true,
			handler(new_value, old_value)
			{
				if (!this.list_filters_cache)
				{
					this.list_filters_cache = JSON.parse(JSON.stringify(new_value));
				}

				if (Object.keys(new_value).some((key) => this.list_filters_cache && new_value[key].value !== this.list_filters_cache[key].value))
				{
					this.setFilteredServers();
				}
				this.list_filters_cache = JSON.parse(JSON.stringify(new_value));
			}
		},
		sort_column(new_value, old_value)
		{
			this.$log.info(`Sorting servers by column '${new_value}'`);
			this.setFilteredServers();
		},
		sort_type(new_value, old_value)
		{
			this.setFilteredServers();
		},
		'$parent.store.servers'(new_value, old_value)
		{
			this.setFilteredServers();
		}
	},
	computed:
	{
		servers()
		{
			return this.$store.getters['Servers/servers'];
		},
		filters()
		{
			return this.$store.getters['Servers/filters'];
		},
		scroll_position()
		{
			return this.$store.getters['Servers/scroll_position'];
		}
	},
	methods:
	{
		async setFilteredServers()
		{
			if (this.servers.length == 0) return;

			let response;
			try
			{
				this.servers_filtered = await this.$parent.SERVER_FUNC.servers_worker.filterServers({
					servers: this.servers,
					filters: this.filters,
					sort_column: this.sort_column,
					$SortColumn: this.$SortColumn,
					sort_type: this.sort_type,
					$SortType: this.$SortType,
					favourited_servers: this.$parent.SERVER_FUNC.favourited_servers,
					servers_length: this.servers_length
				});

				if (!this.$parent.development) // REMEMBER TO CHANGE THIS
				{
					if (this.refreshing_servers)
					{
						this.$parent.SERVER_FUNC.servers_info = [];
						this.refreshing_servers = false;
					}
					this.pingServers();
				}
			}
			catch(err)
			{
				this.$log.error(err);
			}
		},
		handleSearch: debounce(function(value)
		{
			this.$log.info(`Searching servers with term '${value}'`);
			this.$store.dispatch('Servers/setSearch', value);
		}, 400),
		handleScroll: debounce(function(value = 0)
		{
			this.$store.dispatch('Servers/setScrollPosition', value);
		}, 300),
		setScroll(from_server_view = false)
		{
			if (!this.$refs || !this.$refs.servers) return;

			if (!from_server_view) this.handleScroll();

			this.$refs.servers.scrollTop = this.scroll_position && this.scroll_position > 0 && from_server_view ? this.scroll_position : 0;
		},
		isActiveSort(sort)
		{
			return this.sort_column == sort;
		},
		setSort(sort)
		{
			let old_sort = this.sort_column;
			this.sort_column = sort;

			if (sort == this.$SortColumn.PING)
			{
				this.sort_type = this.$SortType.ASC;
				return;
			}

			if (this.sort_type == this.$SortType.NONE && this.sort_column == this.$SortColumn.NONE)
			{
				this.sort_type = this.$SortType.DESC;
			}
			else if (this.sort_type == this.$SortType.DESC && this.sort_column == old_sort)
			{
				this.sort_type = this.$SortType.ASC;
			}
			else
			{
				this.sort_type = this.$SortType.DESC;
			}
			/*else
			{
				this.sort_column = this.$SortColumn.NONE;
				this.sort_type = this.$SortType.NONE;
			}*/
		},
		setFilterValue: debounce(function(key, val)
		{
			this.$store.dispatch('Servers/setFilterValue', {key: key, value: val});
		}, 300),
		pingServers()
		{
			try
			{
				this.pinging_servers = true;
				this.servers_filtered.forEach(async (server) =>
				{
					let find = this.$parent.SERVER_FUNC.servers_info.findIndex(s => this.$parent.SERVER_FUNC.isServer(s, server));
					if (find == -1)
					{
						let response = await this.$parent.SERVER_FUNC.pingServer(this.$parent.SERVER_FUNC.servers_worker, server);
						if (response)
						{
							this.$parent.SERVER_FUNC.servers_info.push({
								...server,
								...response
							});
						}
					}
				});
			}
			catch(err)
			{
				this.$log.error(err);
			}

			this.pinging_servers = false;
		},
		refreshServers: debounce(function()
		{
			this.$store.dispatch('Servers/getServers', true);
			this.refreshing_servers = true;
		}, 1000),
		setMapOptions()
		{
			let maps = [];

			this.servers.forEach((server) =>
			{
				let map = this.$parent.SERVER_FUNC.getMap(server.map || '');
				if (map && !maps.find((m) => map == m))
				{
					maps.push(map);
				}
			});
			this.$store.dispatch('Servers/setFilterOptions', {key: 'map', value: maps});
		}
	},
	beforeRouteEnter(to, from, next)
	{
		next(vm => vm.setScroll(from.name == 'Server details'));
	},
}
</script>