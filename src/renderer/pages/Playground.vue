<template>
	<div class="flex flex-col flex-1 relative text-white overflow-hidden">
		<div class="inline-flex flex-row flex-1 mb-4 overflow-hidden">
			<div class="inline-flex flex-col w-3/12 pr-6 flex-shrink-0">
				<h2 class="text-lg font-semibold">Filters</h2>
				<div class="inline-flex flex-col mt-4">
					<Input v-model="mods_search" icon="search-sharp" placeholder="Search mod name or ID" class="w-full"></Input>
				</div>
			</div>
			<div class="inline-flex flex-col flex-1 overflow-hidden">
				<h5 class="font-semibold text-lg mb-3">Selected mods</h5>
				<span v-if="mods_selected.length == 0" class="text-gray-500">No mods selected.</span>
				<div v-else class="inline-flex flex-col w-full overflow-y-scroll pr-2 flex-shrink-0" style="max-height: 35%;">
					<div v-for="(mod, index) in mods_selected" :key="index" @click="selectMod(mod.publishedFileId)" class="relative flex flex-row items-center flex-shrink-0 px-4 h-8 mb-2 cursor-pointer rounded text-sm transition-colors duration-200 bg-green-700 hover:bg-green-800">
						<span>{{ mod.title }}</span>
						<div @click.stop class="inline-flex flex-row items-center justify-center h-full ml-auto flex-shrink-0">
							<div v-show="index > 0" @click="moveMod(index, true)" class="inline-flex items-center justify-center w-8 h-8 hover:bg-green-900">
								<ion-icon name="arrow-up-sharp"></ion-icon>
							</div>
							<div v-show="index < mods_selected.length - 1" @click="moveMod(index, false)" class="ml-1 inline-flex items-center justify-center w-8 h-8 hover:bg-green-900">
								<ion-icon name="arrow-down-sharp"></ion-icon>
							</div>
						</div>
					</div>
				</div>
				<h5 class="font-semibold text-lg my-3">Mods</h5>
				<div class="inline-flex flex-col w-full overflow-y-scroll pr-2">
					<div v-for="(mod, index) in mods_filtered" :key="index" @click="selectMod(mod.publishedFileId)" class="relative flex flex-row items-center flex-shrink-0 px-4 h-8 mb-2 cursor-pointer rounded text-sm transition-colors duration-200 bg-sidebar-half hover:bg-black">
						<span>{{ mod.title }}</span>
					</div>
				</div>
			</div>
		</div>
		<div class="inline-flex flex-col h-40 flex-shrink-0">
			<h5 class="font-semibold text-lg mb-3">Options</h5>
			<Dropdown v-if="selected_map" @select="setMap" label="Map" :selected="getMap(selected_map).label" :options="maps.map(map => map.label)" class="self-start"></Dropdown>
			<div class="inline-flex flex-row mt-4">
				<Checkbox v-if="false" label="Keep persistence?" :checked="keep_persistence" class="ml-3"></Checkbox>
				<ServerFilter label="Keep persistence?" toggled_text="Yes" untoggled_text="No" :state="keep_persistence" @toggle="keep_persistence = $event" class="w-56"></ServerFilter>
			</div>
		</div>
		<div class="inline-flex mt-auto ml-auto flex-shrink-0">
			<Button @click.native="play" label="Play" type="primary"></Button>
		</div>
	</div>
</template>

<script>
import { debounce } from 'lodash';
const { https } = require('follow-redirects');
const unzip = require('adm-zip');
const replace = require('replace-in-file');
const recursive = require('recursive-readdir');

export default
{
	name: 'Playground',
	data()
	{
		return {
			download_url: 'https://github.com/Arkensor/DayZCommunityOfflineMode/releases/latest/download/DayZ.Community.OfflineMode.zip',
			mission_prefix: 'DayZCommunityOfflineMode',
			missions: [],
			maps:
			[
				{
					label: 'Chernarus',
					value: 'ChernarusPlus'
				},
				{
					label: 'Livonia',
					value: 'enoch'
				}
			],
			default_map: null,
			selected_map: null,
			installing: false,
			download_progress: 0,
			parameters: ['-nosplash', '-noPause', '-noBenchmark', '-filePatching', '-doLogs', '-scriptDebug=true'],
			keep_persistence: false,
			mods_search: '',
			selected_mods: []
		}
	},
	watch:
	{
		download_progress(val)
		{
			//console.log(val);
		},
	},
	computed:
	{
		default_mission()
		{
			return `${this.mission_prefix}.${this.default_map}`;
		},
		mission()
		{
			return `${this.mission_prefix}.${this.selected_map}`;
		},
		missions_folder()
		{
			return `${this.$parent.options.dayz_path.value}/Missions`;
		},
		mods_filtered()
		{
			let mods = this.$parent.mods;

			if (this.selected_mods.length > 0)
			{
				mods = mods.filter(mod => !this.selected_mods.find(m => mod.publishedFileId == m));
			}

			if (this.mods_search.length > 0)
			{
				const fuse = new this.$fuse(mods, {keys: ['title', 'publishedFileId'], threshold: 0.15});
				mods = fuse.search(this.mods_search).map(s => s.item);
			}

			mods = mods.slice(0, 100);

			return Object.freeze(mods);
		},
		mods_selected()
		{
			return this.selected_mods.map(m => this.$parent.mods.find(mod => mod.publishedFileId == m));
		}
	},
	methods:
	{
		isSelectedMod(mod_id)
		{
			return !!this.selected_mods.find(mod => mod == mod_id);
		},
		selectMod(mod_id)
		{
			if (!this.isSelectedMod(mod_id)) this.selected_mods.push(mod_id);
			else this.selected_mods.splice(this.selected_mods.findIndex(mod => mod == mod_id), 1);
		},
		moveMod(index, up = true)
		{
			let mods = JSON.parse(JSON.stringify(this.selected_mods));
			mods.splice(index, 1);
			mods.splice(index + (up ? -1 : 1), 0, this.selected_mods[index]);
			this.selected_mods = mods;
		},
		getMap(map)
		{
			return this.maps.find(m => m.value == map || m.label == map);
		},
		setMap(map)
		{
			this.selected_map = this.getMap(map).value;
		},
		isInstalled(mission)
		{
			try
			{
				this.$fs.accessSync(`${this.missions_folder}\\${mission}`, this.$fs.constants.F_OK);
				return true;
			}
			catch(err)
			{
				return false;
			}
		},
		getMissions()
		{
			return new Promise((resolve, reject) =>
			{
				this.$fs.readdir(this.missions_folder, (err, files) =>
				{
					if (err) reject(err);
					resolve([...files, this.default_mission]);
				});
			});
		},
		downloadOfflineMode()
		{
			return new Promise(async (resolve, reject) =>
			{
				let writer = this.$fs.createWriteStream(`${this.missions_folder}\\${this.download_url.split('/').pop()}`);

				writer.on('finish', () =>
				{
					resolve(writer);
				});

				writer.on('error', (err) =>
				{
					writer.close();
					reject(err);
				});

				let req = https.get(this.download_url, (res) =>
				{
					res.pipe(writer);

					let total = 0;
					let progress = 0;
					let size = parseInt(res.headers['content-length'], 10);

					res.on('data', (chunk) =>
					{
						total += chunk.length;
						progress = parseInt(100 * total / size);
						if (this.download_progress !== progress) this.download_progress = progress;
					}).on('end', () =>
					{
						writer.close();
						this.download_progress = 100;
					}).on('err', (err) =>
					{
						writer.close();
						reject(err.message);
					});
				});
			})
		},
		async installOfflineMode()
		{
			if (this.isInstalled(this.default_mission)) return;

			try
			{
				let file = await this.downloadOfflineMode();
				this.$log.info(`Downloaded ${file.path}`);

				let temp_folder = `${this.missions_folder}\\temp\\`;
				let zip = new unzip(file.path);
				zip.extractAllTo(temp_folder, true);

				this.$fs.moveSync(`${temp_folder}\\Missions\\${this.default_mission}`, `${this.missions_folder}\\${this.default_mission}`, {overwrite: true});
				this.$fs.removeSync(temp_folder);
				this.$fs.removeSync(file.path);
				this.$log.info(`Installed ${this.missions_folder}\\${this.default_mission} and cleaned up`);
			}
			catch(err)
			{
				if (err)
				{
					throw err;
				}
			}
		},
		async getOfflineMode()
		{
			try
			{
				await this.installOfflineMode();

				if (this.selected_map !== this.default_map && !this.isInstalled(this.mission))
				{
					this.$fs.copySync(`${this.missions_folder}\\${this.default_mission}`, `${this.missions_folder}\\${this.mission}`);
					this.$log.info(`Copied ${this.default_mission} to ${this.mission}`);

					let results = await replace({
						files: await recursive(`${this.missions_folder}\\${this.mission}`),
						from: new RegExp(`${this.default_mission}`, 'g'),
						to: this.mission
					});

					this.$log.info(`Replaced ${results.filter(result => result.hasChanged).map(result => result.file).length} occurences of ${this.default_mission} to ${this.mission} in ${results.length} files`);
				}
			}
			catch(err)
			{
				if (err)
				{
					throw err;
				}
			}
		},
		play: debounce(async function()
		{
			let parameters = [];
			try
			{
				this.installing = true;
				await this.getOfflineMode();
				this.installing = false;

				parameters.push(...[...this.parameters, this.$parent.GAME_FUNC.getModParam(this.mods_selected), `-mission=.\\Missions\\${this.mission}`]);
			}
			catch(err)
			{
				if (err)
				{
					this.$log.error(err);
					return await this.$alert({title: 'Failed to install.', message: `An error occured while attempting to install offline mode.`});
				}
			}

			this.$parent.GAME_FUNC.bootGame(null, parameters);
		}, 1000),
	},
	async created()
	{
		try
		{
			if (this.missions.length == 0) this.missions = await this.getMissions();
			this.default_map = this.maps[0].value;
			if (!this.selected_map) this.selected_map = this.default_map;
		}
		catch(err)
		{
			console.log(err);
			this.$alert({title: 'An error occured.', message: `${err}`});
		}
	}
}
</script>