<template>
	<transition name="fade">
		<div v-if="show" class="flex items-center justify-center fixed inset-0 w-full h-full z-50 bg-black bg-opacity-75 text-white">
			<div class="inline-flex flex-col w-80 h-48 px-8 py-4 bg-sidebar relative">
				<div class="inline-flex flex-col items-center justify-center text-center flex-1">
					<h1 class="font-semibold text-lg">{{ title }}</h1>
					<span>{{ message }}</span>
				</div>
				<div class="inline-flex w-full mt-auto">
					<Button @click.native="confirm" label="Okay" class="w-full"></Button>
				</div>
			</div>
		</div>
	</transition>
</template>

<script>
export default
{
	data()
	{
		return {
			show: false,
			title: null,
			message: null,
			resolve: null,
			reject: null
		}
	},
	computed:
	{
	},
	methods:
	{
		open()
		{
			this.show = true;
		},
		close()
		{
			this.show = false;
		},
		toggle()
		{
			this.show = !this.show;
		},
		confirm()
		{
			this.resolve();
			this.close();
		},
		initiate(obj)
		{
			if (typeof obj !== 'object') return;
			if (obj.title) this.title = obj.title;
			if (obj.message) this.message = obj.message;

			this.open();

			return new Promise((resolve, reject) =>
			{
				this.resolve = resolve;
				this.reject = reject;
			});
		}
	},
}
</script>