<template>
</template>

<script>
export default
{
	computed:
	{
		mods()
		{
			return this.$store.getters['Mods/mods'];
		},
	},
	methods:
	{
		findMod(mod_id)
		{
			return this.mods.find(m => m.publishedFileId.toString() == mod_id.toString());
		},
		normaliseName(name)
		{
			if (!name) return '';
			return name.replace(/\W/g, '');
		},
		normaliseSize(size)
		{
			let filesize = this.$filesize(Math.abs(size));
			if (!filesize.includes('GB') && filesize.includes('.'))
			{
				filesize = filesize.split(' ');
				filesize[0] = filesize[0].substring(0, filesize[0].indexOf('.'));
				filesize = filesize.join('');
			}

			return filesize.replace(new RegExp(' ', 'g'), '');
		},
		isSubscribedMod(mod_id)
		{
			if (!mod_id) return false;
			return !!this.mods.find(mod => mod.publishedFileId.toString() == mod_id.toString());
		},
		getItemState(mod_id)
		{
			let state = this.$parent.greenworks.ugcGetItemState(mod_id.toString());

			let label = Object.values(this.$ModState).find(e => e.value == state);
			return { ...(label ? label : {label: state, value: state}) };
		},
		isModUpdated(mod_id)
		{
			return this.getItemState(mod_id).value == this.$ModState.UPDATED.value;
		},
		getStateColour(mod_id)
		{
			let state = this.getItemState(mod_id);
			switch (state)
			{
				case this.$ModState.UPDATED:
					return 'green-500';
				case this.$ModState.UPDATE_REQUIRED:
					return 'yellow-500';
				default:
					return 'white';
			}
		},
		getModURL(mod_id)
		{
			return `steam://url/CommunityFilePage/${mod_id}`;
		},
		verifyMod(mod_id)
		{
			let result = this.$parent.greenworks.ugcDownloadItem(mod_id.toString());
			this.$log.info(`Verified mod ${mod_id}`);
			return result;
		},
		reinstallMod(mod_id)
		{
			this.$fs.remove(`${this.$parent.options.dayz_path.value}/../../workshop/content/${this.$parent.config.appid}/${mod_id}`, (err) =>
			{
				if (err) return this.$log.error(err);
				
				else this.verifyMod(mod_id);
			});
		},
		unsubscribeMod(mod_id)
		{
			this.$parent.greenworks.ugcUnsubscribe(mod_id.toString(), () =>
			{
				this.$log.info(`Unsubscribed from mod ${mod_id}`);
				this.$store.dispatch('Mods/removeMod', mod_id.toString());
			}, (err) =>
			{
				this.$log.error(err);
			});
		},
		getModListDetails(mods)
		{
			return new Promise((resolve, reject) =>
			{
				this.$parent.greenworks.ugcGetItemDetails(mods, (items) =>
				{
					resolve(items);
				}, (err) =>
				{
					reject(err);
				});
			});
		},
		addModJunctions(mods = null)
		{
			if (!mods)
			{
				mods = this.mods.map(e =>
				{
					return {id: e.publishedFileId, name: e.title};
				});
			}
			else if (mods.length == 0) return;

			let workshop_path = `${this.$parent.options.dayz_path.value}/../../workshop/content/${this.$parent.config.appid}/`;
			let launcher_workshop_path = `${this.$parent.options.dayz_path.value}/${this.$parent.config.workshop_dir}/@`;

			// Create directory to store mods
			if (!this.$fs.existsSync(`${this.$parent.options.dayz_path.value}/${this.$parent.config.workshop_dir}`)) this.$fs.mkdir(`${this.$parent.options.dayz_path.value}/${this.$parent.config.workshop_dir}`);
			mods.forEach((mod, i) =>
			{
				let title = this.$parent.MOD_FUNC.normaliseName(mod.name);
				if (!this.$fs.existsSync(launcher_workshop_path + title) && this.$fs.existsSync(workshop_path + mod.id))
				{
					this.$fs.symlinkSync(workshop_path + mod.id, launcher_workshop_path + title, 'junction');
				}
			});
		},
	},
}
</script>