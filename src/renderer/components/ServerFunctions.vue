<template>
</template>

<script>
import { debounce } from 'lodash';
import JestWorker from 'jest-worker';
const path = require('path');
const { clipboard } = require('electron');
const humanizeDuration = require('humanize-duration');

export default
{
	data()
	{
		return {
			servers_worker: new JestWorker(path.resolve(__dirname, '../../main/workers/servers.js')),
			servers_info: [],
			parameters: [],
			process: null,
		}
	},
	computed:
	{
		servers()
		{
			return this.$store.getters['Servers/servers'];
		},
		favourited_servers()
		{
			return this.$store.getters['Settings/favourited_servers'];
		},
		mods()
		{
			return this.$store.getters['Mods/mods'];
		},
		filters()
		{
			return this.$store.getters['Servers/filters'];
		},
		playing_server()
		{
			return this.$store.getters['Servers/playing_server'];
		}
	},
	methods:
	{
		isServer(x, y)
		{
			if (typeof x == 'object' && typeof y == 'object')
			{
				return x.ip && y.ip && x.ip == y.ip && ((x.game_port && y.game_port && x.game_port == y.game_port) || (x.query_port && y.query_port && x.query_port == y.query_port) || (x.port && x.port == y.query_port) || (y.port && y.port == x.query_port));
			}
			else
			{
				return x == y;
			}
		},
		findServer(ip, port)
		{
			return this.servers.find((server) => 
			{
				if (ip.includes(':'))
				{
					let gameserverip = ip.split(':');
					ip = gameserverip[0];
					port = gameserverip[1];
				}
				return server.ip == ip && (server.query_port == port || server.game_port == port);
			});
		},
		copyToClip(content)
		{
			clipboard.writeText(content);
		},
		loadOfflineMods(server)
		{
		},
		normaliseTime(acceleration)
		{
			let res = {day: 0, night: 0};
			if (!acceleration || !acceleration.includes(',')) return res;

			let acc = acceleration.split(', ').map(e => parseFloat(e));
			let options = { units: ['h', 'm'], round: true };
			res.day = humanizeDuration(Math.floor(12 / acc[0] * 60000 * 60), options);
			res.night = humanizeDuration(Math.floor(12 / acc[0] / acc[1] * 60000 * 60), options);
			return res;
		},
		normaliseMap(map)
		{
			if (!map) return '';
			
			let m = this.getMap(map);
			return m ? m.name : '';
		},
		getMap(map)
		{
			return Object.values(this.$DayZMap).find(m => map.toLowerCase().includes(m.id.toLowerCase()));
		},
		isNight(time)
		{
			let server_time = this.$moment(time, 'hh:mm');
			return server_time.isBetween(this.$moment().startOf('day'), this.$moment('05:00', 'hh:mm')) || server_time.isBetween(this.$moment('21:00', 'hh:mm'), this.$moment().endOf('day'));
		},
		getServerBackground(server)
		{
			if (!server.map) return;

			let map = this.getMap(server.map);
			if (!map) return null;

			return map.bg ? `https://dayz-magic-launcher.s3.eu-west-2.amazonaws.com/images/${map.id}.jpg` : null;
		},
		isFavourite(server)
		{
			return this.favourited_servers.filter(e => this.isServer(e, server)).length > 0;
		},
		favouriteServer(server)
		{
			this.$store.dispatch('Settings/toggleServerFavourited', {ip: server.ip, port: server.query_port});
		},
		loadServer(server)
		{
			this.joinServer(server, false);
		},
		playServer(server)
		{
			this.joinServer(server);
		},
		async getServerInfo(server, force_ping = false, ping_if_not_found = false)
		{
			let s = this.servers_info.find(s => this.isServer(s, server));
			if (force_ping || !s && ping_if_not_found)
			{
				let response = await this.pingServer(this.servers_worker, server);
				if (response)
				{
					s = {...server, ...response};
				}
			}
			return s ? s : {...server, latency: 999, mods_count: 0, mods: []};
		},
		async pingServer(worker, server)
		{
			if (!server) return;

			let response;
			try
			{
				response = await worker.queryMods(server.ip, server.query_port);
				return response;
			}
			catch(err)
			{
				if (err !== 'Timeout') this.$log.error(err);
				return null;
			}
		},
		getRequiredMods(server)
		{
			return server.mods.filter(mod => this.mods.every(mod2 => mod.id.toString() !== mod2.publishedFileId.toString()));
		},
		checkModUpdates(mods)
		{
			if (!mods || mods.length == 0) return;

			let updates = mods.filter(mod =>
			{
				return this.$parent.MOD_FUNC.getItemState(mod.id.toString()) == this.$ModState.UPDATE_REQUIRED;
			});

			if (updates.length > 0)
			{
				updates.forEach(mod => this.$parent.MOD_FUNC.verifyMod(mod.id));
			}
		},
		async selectCharacter(server)
		{
			return;
			let character = null;
			
			/* HARDCODE SERVER FOR NOW */
			if (server.name.toLowerCase().includes('dayzcore') || server.name.toLowerCase().includes('afterdark'))
			{
				let server_character = this.$parent.store.server_characters.find(e => this.isServer(e.server, server));

				/*character = await prompt(server_character);
				*/
			}

			return character;
		},
		joinServer: debounce(async function(server_info, join = true)
		{
			this.parameters = []; // reset parameters
			this.$log.info('Attempting to join server ' + server_info.name);

			let server = await this.getServerInfo(server_info, true, true);

			try
			{
				let grabbed_required_mods = await this.grabRequiredMods(server);
				/*if (!grabbed_required_mods)
				{
					this.$log.info('Failed to grab required mods.');
					return await this.$alert({title: 'Failed to grab required mods.'});
				}*/
			}
			catch(err)
			{
				this.$log.info(err);
				return await this.$alert({title: 'Failed to grab required mods.'});
			}

			try
			{
				this.$parent.MOD_FUNC.addModJunctions(server.mods);
			}
			catch(err)
			{
				this.$log.info(err);
				return await this.$alert({title: 'Failed to add mod junctions.'});
			}

			if (join) this.parameters.push(...['-connect=' + server.ip, '-port=' + server.game_port]);

			this.checkModUpdates(server.mods);

			if (server.password && join)
			{
				let server_password = this.$parent.store.server_passwords.find(e => this.isServer(e.server, server)) || '';

				let password = await this.$prompt({
					title: 'Server password',
					message: 'Enter the password for the server.',
					placeholder: 'Password',
					fill: server_password
				});
				if (password)
				{
					this.parameters.push(`-password=${password}`);
					this.$store.dispatch('editServerPassword', {server: server, password: password});
				}
			}

			let character = await this.selectCharacter(server);
			if (character)
			{
				this.parameters.push(`-character=${character}`);
				this.$store.dispatch('editServerCharacter', {server: server, character: character});
			}

			if (server.mods.length > 0)
			{
				this.parameters.push(this.$parent.GAME_FUNC.getModParam(server.mods));
			}

			let additional_parameters = this.$parent.options.parameters.value.split(' ').filter(p => character && !p.includes('-character'));
			if (additional_parameters.length > 0) this.parameters.push(...additional_parameters);

			if (!!this.$parent.options.nick_name.value.trim())
			{
				this.parameters.push(`-name=${this.$parent.options.nick_name.value}`);
			}

			let local_version = this.$parent.normaliseVersionNo(server.experimental ? this.$parent.app.build_id_experimental : this.$parent.app.build_id);
			let server_version = this.$parent.normaliseVersionNo(server.version);
			if (local_version !== server_version)
			{
				try
				{
					let version_mismatch = await this.$confirm({
						title: 'Version Discrepancy',
						message: `Your local version (${local_version}) does not match the server version (${server_version}). Would you like to continue?`,
					});
				}
				catch(err)
				{
					return;
				}
			}

			this.$parent.GAME_FUNC.bootGame(server, this.parameters);
		}, 1000),
		grabRequiredMods(server)
		{
			return new Promise(async (resolve, reject) =>
			{
				let mods = this.getRequiredMods(server);
				if (mods.length == 0)
				{
					resolve();
					return;
				}

				mods.forEach(mod =>
				{
					this.$parent.greenworks.ugcSubscribe(mod.id.toString(), () =>
					{
						console.log(`Subscribed to mod ${mod.name}`);
					});
				});

				resolve(mods);

				/*this.$parent.$refs.alert.alert({
					title: 'Mods',
					message: 'Required mods are now downloading. You will join the server once all mods are downloaded.',
				}).catch((err) =>
				{
					if (err) this.$log.error(err);
				});

				let mods_downloaded = [];
			
				this.$async.eachSeries(mods, (mod, callback) =>
				{
					if (this.stop_downloads)
					{
						var err = new Error();
						err.break = true;
						this.stop_downloads = false;
						return callback(err);
					}
					let i = mods_downloaded.length + 1;
					this.greenworks.ugcSubscribe(mod.id.toString(), () =>
					{
						this.greenworks.ugcDownloadItem(mod.id.toString());

						this.$parent.$refs.downloading.startDownload({
							'title': mod.name + ' (' + i + '/' + mods.length + ')',
							'publishedFileId': mod.id.toString(),
						}, true).then((response) =>
						{
							mods_downloaded.push(mod);
							this.$log.info('Subscribed and downloaded mod ' + mod.name + ' - ' + i + '/' + mods.length);
							callback();
						}).catch((err) =>
						{
							this.$log.error(err);
							this.$log.error('Failed to download mod ' + mod.title);
						});            
					}, (err) =>
					{
						this.$log.error(err);
					});
				}, (err) =>
				{
					if (err && !err.break)
					{
						this.$log.error(err);
					}
					else if (err)
					{
						reject(err);
					}
					if (mods_downloaded.length == mods.length)
					{
						this.greenworks.ugcGetUserItems({
							'app_id': parseInt(this.$parent.config.appid),
							'page_num': 1,
						}, this.greenworks.UGCMatchingType.Items, this.greenworks.UserUGCListSortOrder.SubscriptionDateDesc, this.greenworks.UserUGCList.Subscribed, (items) =>
						{
							this.$store.dispatch('addMods', items.filter(mod2 => this.mods.every(mod3 => mod2.publishedFileId.toString() !== mod3.publishedFileId)));
							resolve(true);
						}, (err) => {
							this.$log.error(err);
						});            
					}
				});*/
			});
		},
	},
}
</script>