<template>
</template>

<script>
import { debounce } from 'lodash';
const child = require('child_process');

export default
{
	data()
	{
		return {
			process: null,
		}
	},
	computed:
	{
	},
	methods:
	{
		getModParam(mods)
		{
			if (!mods || mods.length == 0) return '';
			return `-mod=${mods.map((mod, i, arr) => 
			{
				let mod_name = mod.name ? mod.name : mod.title;
				return `${this.$parent.config.workshop_dir}/@${this.$parent.MOD_FUNC.normaliseName(mod_name)}${i !== arr.length - 1 ? ';' : ''}`;
			}).join('')}`;
		},
		async bootGame(server, parameters)
		{
			if (this.process)
			{
				return await this.$alert({
					title: 'Game running.',
					message: 'There is already a running instance of DayZ.'
				});
			}

			let prev_rpc_state = this.$parent.rpc.options.state;
			let experimental = false;
			if (server)
			{
				this.$store.dispatch('Servers/setPlayingServer', {ip: server.ip, port: server.query_port});
				this.$store.dispatch('Settings/updateServerLastPlayed', {ip: server.ip, port: server.query_port});

				this.$store.dispatch('Settings/editRPCState', 'Playing server');
				if (!this.$parent.options.privacy_mode) this.$store.dispatch('editRPCDetails', {type: 'add', details: server.name, time: new Date()});

				experimental = server.experimental;
			}
			else
			{
				//this.$store.dispatch('editRPCState', 'Playing offline');
			}

			let game_path = `${experimental ? this.$parent.options.dayz_path_experimental.value : this.$parent.options.dayz_path.value}\\${this.$parent.config.dayz_exe_be}`;

			parameters = parameters.filter(p => typeof p !== 'string' || p.trim() !== '');

			this.$log.info(`Booting game from ${game_path} with parameters ${parameters.join(',')}`);

			this.process = child.execFile(game_path, parameters, async (err, data) =>
			{
				this.$store.dispatch('Settings/editRPCState', prev_rpc_state);
				this.$store.dispatch('Settings/editRPCDetails', {type: 'remove'});
				this.$store.dispatch('Servers/setPlayingServer', null);
				this.process = null;
			});

			this.$confirm({
				title: 'Close game?',
				message: `Started playing at ${(new Date()).toTimeString()}`
			}).then(() =>
			{
				this.quitGame();
			}).catch(err => {});
		},
		quitGame: debounce(async function()
		{
			let processes = await this.$system.processes();

			processes.list.forEach((process) =>
			{
				if (process.name == this.$parent.config.dayz_exe_be || process.name == this.$parent.config.dayz_exe)
				{
					console.log(process);
					child.spawn('taskkill', ['/pid', process.pid, '/f', '/t']);
					this.$log.info(`Killed process ${process.name} with PID ${process.pid}`);
				}
			});
		}, 1000),
	},
}
</script>