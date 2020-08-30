<template>
	<transition name="fly-down">
	</transition>
</template>

<script>
import { debounce } from 'lodash';
import { EventBus } from './../event-bus.js';

export default
{
	data()
	{
		return {
			show: false,
			file: null,
			downloaded: false,
			progress: 0,
			bytes_downloaded: null,
			bytes_total: null,
			stopped: true,
			server: false,
			bytes_diff: [],
			download_speed: 0,
		}
	},
	watch:
	{
		progress: debounce(function(val)
		{
			if (val == 100)
			{
				this.close();
				setTimeout(() =>
				{
					this.clearDownload(true);
				}, 500);
			}
			else
			{
				this.stopped = false;
			}
		}, 2000),
	},
	computed:
	{
		time_remaining()
		{
			let eta = this.$moment().add((Math.floor(this.bytes_total - this.bytes_downloaded) / this.download_speed), 'seconds');
			let remaining = moment.duration(this.$moment().diff(eta)).seconds();
			return this.bytes_total !== null && !isNaN(remaining) ? Math.abs(remaining) :  0;
		},
	},
	methods:
	{
		open()
		{
			this.show = true;
			this.stopped = false;
		},
		close()
		{
			this.show = false;
			this.stopped = true;
		},
		startDownload(mod, server = false)
		{
			return new Promise((resolve, reject) =>
			{
				if (interval) return reject('Download already running.');

				EventBus.$on('item-downloaded', (payload) =>
				{
					if (payload.file == mod.publishedFileId)
					{
						this.progress = 100;
						this.clearDownload(false);
						resolve(mod);
					}
				});

				interval = setInterval(() =>
				{
					this.greenworks.ugcGetItemDownloadInfo(mod.publishedFileId, (bytes_downloaded, bytes_total) =>
					{
						if (parseInt(bytes_total) !== 0 && !(this.bytes_downloaded == 0 && bytes_downloaded == bytes_total))
						{
							if (this.bytes_downloaded !== null && (parseInt(bytes_downloaded) - this.bytes_downloaded) > 0)
							{
								if (!this.show) this.open();
								this.bytes_diff.push(parseInt(bytes_downloaded) - this.bytes_downloaded);
								this.download_speed = this.bytes_diff.length > 0 ? (this.bytes_diff.reduce((acc, c) => acc + c, 0) / this.bytes_diff.length) * 5 : 0;
							}
							this.file = mod;
							this.server = server;
							this.bytes_downloaded = parseInt(bytes_downloaded);
							this.bytes_total = parseInt(bytes_total);
							if (parseInt(this.bytes_downloaded) > 0 && parseInt(bytes_downloaded) == 0)
							{
								this.bytes_downloaded = bytes_total;
								this.bytes_total = bytes_total;
							}
							this.progress = Math.floor((parseInt(this.bytes_downloaded) / parseInt(this.bytes_total)) * 100);
						}
					},
					(err) =>
					{
						if (err) reject(err);
					});   
				}, 200);
			});
		},
		toggleDownloads()
		{
			this.stopped = !this.stopped;
			if (this.stopped)
			{
				this.$log.info('Suspended download for item '+this.file.publishedFileId ? this.file.title : this.file);
			}
			else
			{
				this.$log.info('Resumed download for item '+this.file.publishedFileId ? this.file.title : this.file);
			}
			this.$parent.greenworks.ugcSuspendDownloads(this.stopped);
		},
		cancelDownloads()
		{
			EventBus.$emit('cancelDownloads');
		},
		clearDownload(full_clear = false)
		{
			if (full_clear)
			{
				this.progress = 0;
				this.download_speed = 0;
			}
			this.bytes_diff = [];
			this.bytes_downloaded = null;
			this.bytes_total = null;
			if (interval) clearInterval(interval);
			interval = null;
		},
	},
	created()
	{
	},
}
</script>