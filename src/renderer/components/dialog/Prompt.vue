<template>
	<transition name="fade">
		<div v-if="show" class="flex items-center justify-center fixed inset-0 w-full h-full z-50 bg-black bg-opacity-75 text-white">
			<div class="inline-flex flex-col w-80 h-48 px-8 py-4 bg-sidebar">
				<div class="">
					<h1 class="font-semibold text-lg">{{ title }}</h1>
					<span>{{ message }}</span>
					<Input v-model="value" icon="search-sharp" :placeholder="placeholder" class="w-full"></Input>
				</div>
				<div class="inline-flex w-full mt-auto">
					<Button @click.native="cancel" label="Cancel" class=""></Button>
					<Button @click.native="confirm" label="Continue" class="ml-auto"></Button>
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
			placeholder: 'Enter value',
			value: '',
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
			if (this.value == '') return;

			this.resolve(this.value);
			this.close();
		},
		cancel()
		{
			this.reject();
			this.close();
		},
		initiate(obj)
		{
			if (typeof obj !== 'object') return;
			if (obj.title) this.title = obj.title;
			if (obj.message) this.message = obj.message;
			if (obj.placeholder) this.placeholder = obj.placeholder;
			if (obj.fill) this.fill = obj.fill;

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