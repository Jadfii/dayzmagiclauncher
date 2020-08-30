<template>
	<div :class="{'icon-focus': active}" class="input relative">
		<ion-icon v-if="icon" :name="icon" class="absolute top-50 transition-all duration-200" style="transform: translateY(-50%);"></ion-icon>
		<input @change="handleChange" @input="handleInput" @focus="active = true" @blur="active = false" :value="value" class="border-b py-2 pr-2 bg-transparent transition-all duration-200 w-full" :class="{'pl-6': icon, 'pl-2': !icon}" type="text" :placeholder="placeholder" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">
	</div>
</template>

<script>
export default
{
	props: 
	{
		value: String,
		placeholder: String,
		icon: String
	},
	data()
	{
		return {
			active: false,
		}
	},
	computed:
	{
	},
	methods:
	{
		handleInput(e)
		{
			let value = e.target.value;
			this.$emit('input', value);
		},
		handleChange(e)
		{
			let value = e.target.value;
			this.$emit('change', value);
		}
	},
	created()
	{
	}
}
</script>