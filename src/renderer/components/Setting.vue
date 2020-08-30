<template>
	<div @click="handleClick" v-if="option" :class="{'cursor-pointer': isBoolean()}" class="inline-flex items-center py-4 px-6 bg-sidebar-half rounded relative">
		<div class="inline-flex flex-col max-w-lg pr-16">
			<h5 class="font-semibold">{{ option.label }}</h5>
			<span class="text-gray-500">{{ option.desc }}</span>
		</div>
		<Input v-if="isText()" @change="handleChange" :value="option.value" :placeholder="option.label" class="ml-auto w-2/6"></Input>
		<div v-else-if="isFolder()" class="inline-flex flex-row items-center w-full">
			<Input @change="handleChange" :value="option.value" :placeholder="option.label" class="ml-auto w-7/12"></Input>
			<Button @click.native="selectGamePath" label="Browse" class="ml-4"></Button>
		</div>
		<div v-else-if="isBoolean()" class="flex text-xl items-center relative w-6 h-6 mr-2 align-middle select-none ml-auto">
			<div v-show="option.value === true" class="text-green-400 inline-flex flex-row items-center justify-center">
				<span class="text-sm mr-1">On</span>
				<ion-icon class="" name="checkmark-sharp"></ion-icon>
			</div>
			<div v-show="!option.value" class="text-red-400 inline-flex flex-row items-center justify-center">
				<span class="text-sm mr-1">Off</span>
				<ion-icon class="" name="close-sharp"></ion-icon>
			</div>
		</div>
	</div>
</template>

<script>
export default
{
	data()
	{
		return {
		}
	},
	props:
	{
		setting: String,
	},
	computed:
	{
		options()
		{
			return this.$store.getters['Settings/options'];
		},
		option()
		{
			return this.options[this.setting];
		}
	},
	methods:
	{
		isText()
		{
			return this.option.type == 'string';
		},
		isBoolean()
		{
			return this.option.type == 'boolean';
		},
		isFolder()
		{
			return this.option.type == 'folder';
		},
		handleChange(val)
		{
			this.$emit('change', val);
		},
		handleClick(e)
		{
			if (this.isBoolean())
			{
				this.$emit('change', !this.option.value);
			}
		},
		async selectGamePath(e)
		{
			let dayz_exe = this.$store.getters.config.dayz_exe;
			try
			{
				let folder = this.selectFolder()[0];
				let files = this.$fs.readdirSync(folder).filter(file => file == dayz_exe);

				if (files.length > 0) return this.$emit('change', folder);
				else return await this.$alert({title: 'Invalid folder.', message: `${dayz_exe} was not found in the selected folder.`});
			}
			catch(err)
			{
				return await this.$alert({title: 'An error occurred while selecting a folder.'});
			}
		},
		selectFolder()
		{
			return this.$electron.remote.getBuiltin('dialog').showOpenDialogSync(this.$electron.remote.getCurrentWindow(),
			{
				title: 'Open folder',
				properties: ['openDirectory'],
			});
		}
	},
	created()
	{
		this.$on('change', (val) =>
		{
			this.$store.dispatch('Settings/editOptions', {key: `options.${this.setting}`, value: val});
		});
	}
}
</script>