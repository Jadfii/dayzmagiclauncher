const _ = require('lodash');
const Fuse = require('fuse.js');
const Query = require('./../query.js');

async function queryMods(ip, port)
{
	let response;
	try
	{
		response = await Query.GetMods(ip, port);
	}
	catch(err)
	{
		throw err;
	}

	return response;
}

function filterServers(vm)
{
	let servers = vm.servers;

	if (vm.filters.search.length > 0)
	{
		const fuse = new Fuse(servers,
		{
			keys: ['name', 'ip'],
			threshold: 0.2
		});
		servers = fuse.search(vm.filters.search).map(s => s.item);
	}

	if (vm.sort_column !== vm.$SortColumn.NONE && vm.sort_type !== vm.$SortType.NONE)
	{
		let column = [ vm.sort_column ];
		let type = [ vm.sort_type ];
		if (vm.sort_column == vm.$SortColumn.PLAYERS)
		{
			column = [(e) => { return e[vm.$SortColumn.PLAYERS] + e[vm.$SortColumn.QUEUE]; }];
		}

		servers = _.orderBy(servers, column, type);
	}

	if (vm.favourited_servers.length > 0)
	{
		servers = _.sortBy(servers, (server) =>
		{
			return vm.favourited_servers.filter(e =>
			{
				return e.ip == server.ip && e.port == server.query_port;
			}).length > 0 ? 0 : 1;
		});
	}

	if (vm.filters.bool.first_person.value)
	{
		servers = servers.filter(server => server.first_person);
	}

	if (vm.filters.bool.official.value)
	{
		servers = servers.filter(server => server.official);
	}

	if (vm.filters.bool.experimental.value)
	{
		servers = servers.filter(server => server.experimental);
	}

	if (vm.filters.bool.friends_playing.value)
	{
		servers = servers.filter(server => $parent.online_friends.filter(f => f.game.gameserverip == `${server.ip}:${server.game_port}`));
	}

	if (vm.filters.list.map.value && typeof vm.filters.list.map.value == 'object')
	{
		servers = servers.filter(server => server.map && server.map.toLowerCase() == vm.filters.list.map.value.id);
	}

	servers = servers.slice(0, vm.servers_length);

	return Object.freeze(servers);
}

module.exports = { filterServers, queryMods };