<template>
	<div class="flex flex-col flex-1 relative text-white overflow-hidden">
		<div class="inline-flex overflow-y-hidden">
			<div class="inline-flex flex-col w-3/12 pr-6 flex-shrink-0">
				<h2 class="text-lg font-semibold">Filters</h2>
				<div class="inline-flex flex-col mt-4">
					<Input @input="handleSearch" :value="filters.search" icon="search-sharp" placeholder="Search mod name or ID" class="w-full"></Input>
				</div>
				<Button @click.native="openModsFolder" class="flex items-center py-2 px-8 flex-shrink-0 text-white mt-auto">
					<ion-icon name="folder-outline"></ion-icon>
					<span class="ml-2">Open mods folder</span>
				</Button>
				<Button @click.native="$parent.openURL('steam://open/downloads')" class="flex items-center py-2 px-8 flex-shrink-0 text-white mt-2">
					<ion-icon name="cloud-download-outline"></ion-icon>
					<span class="ml-2">Open downloads</span>
				</Button>
			</div>
			<div v-if="mods_filtered.length > 0" class="inline-flex flex-col pr-2 overflow-y-scroll w-full">
				<ModListItem v-for="(mod, index) in mods_filtered" :key="index" :mod="mod"></ModListItem>
			</div>
			<div v-else>
				<h6 class="text-white text-xl font-semibold">Nothing to see here</h6>
				<span class="text-red-600">No mods found.</span>
			</div>
		</div>
	</div>
</template>

<script>
import { debounce } from 'lodash';
import ModListItem from './../components/ModListItem';

export default
{
	name: 'Mods',
	components:
	{
		ModListItem
	},
	data()
	{
		return {
			sort_column: this.$SortColumn.LAST_UPDATED,
			sort_type: this.$SortType.DESC,
			mods_length: 100,
		}
	},
	computed:
	{
		filters()
		{
			return this.$store.getters['Mods/filters'];
		},
		mods()
		{
			return this.$store.getters['Mods/mods'];
		},
		mods_filtered()
		{
			let mods = this.mods;

			if (this.shouldSearch())
			{
				mods = this.searchMods(mods);
			}

			if (this.sort_column !== this.$SortColumn.NONE && this.sort_type !== this.$SortType.NONE)
			{
				mods = this.$_.orderBy(mods, [ this.sort_column ], [ this.sort_type ]);
			}

			mods = mods.slice(0, this.mods_length);

			return Object.freeze(mods);
		}
	},
	methods:
	{
		isActiveSort(sort)
		{
			return this.sort_column == sort;
		},
		sortMods(sort)
		{
			let old_sort = this.sort_column;
			this.sort_column = sort;

			if (this.sort_type == this.$SortType.NONE && this.sort_column == this.$SortColumn.NONE)
			{
				this.sort_type = this.$SortType.DESC;
			}
			else if (this.sort_type == this.$SortType.DESC && this.sort_column == old_sort)
			{
				this.sort_type = this.$SortType.ASC;
			}
			else if (this.sort_column !== old_sort)
			{
				this.sort_type = this.$SortType.DESC;
			}
			else
			{
				this.sort_column = this.$SortColumn.NONE;
				this.sort_type = this.$SortType.NONE;
			}
		},
		shouldSearch()
		{
			return this.filters.search.length > 0;
		},
		handleSearch: debounce(function(value)
		{
			this.$log.info(`Searching mods with term '${value}'`);
			this.$store.dispatch('Mods/setSearch', value);
		}, 500),
		searchMods(list)
		{
			const fuse = new this.$fuse(list, {keys: ['title', 'publishedFileId'], threshold: 0.15});
			return fuse.search(this.filters.search).map(s => s.item);
		},
		repairAll()
		{
			this.$parent.$refs.confirm.confirm({
				title: 'Repair all?',
				message: 'Are you sure you want to repair all your Workshop mods (THIS MAY TRIGGER MOD UPDATES/DOWNLOADS)?',
			}).then(() =>
			{
				fs.removeSync(`${this.$parent.options.dayz_path.value}/${config.workshop_dir}`);
				let mods = JSON.parse(JSON.stringify(this.mods));
				mods.forEach((mod) =>
				{
					this.$parent.MOD_FUNC.verifyMod(mod);
				});
				log.info('Verified all mods');
			})
			.catch((err) =>
			{
				if (err) log.error(err);
			});
		},
		reinstallAll()
		{
			this.$parent.$refs.confirm.confirm({
				title: 'Reinstall all?',
				message: 'Are you sure you want to reinstall all your Workshop mods (THIS WILL DELETE EVERY MOD YOU ARE SUBSCRIBED TO)?',
			}).then(() =>
			{
				let mods = JSON.parse(JSON.stringify(this.mods));
				mods.forEach((mod) =>
				{
					this.reinstallMod(mod);
				});
				log.info('Reinstalled all mods');
			})
			.catch((err) =>
			{
				if (err) log.error(err);
			});
		},
		unsubscribeAll()
		{
			this.$parent.$refs.confirm.confirm({
				title: 'Unsubscribe from all?',
				message: 'Are you sure you want to unsubscribe from all Workshop mods?',
			}).then(() =>
			{
				let mods = JSON.parse(JSON.stringify(this.mods));
				mods.forEach((mod) =>
				{
					this.unsubscribeMod(mod);
				});
				log.info('Unsubsribed from all mods');
			})
			.catch((err) =>
			{
				if (err) log.error(err);
			});
		},
		openModsFolder()
		{
			this.$electron.shell.openPath(`${this.$parent.options.dayz_path.value}/${this.$parent.config.workshop_dir}`);
		}
	},
	created()
	{
	}
}
</script>