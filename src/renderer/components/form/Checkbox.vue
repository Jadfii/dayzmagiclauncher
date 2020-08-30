<template>
	<div class="flex text-white">
		<label class="inline-flex items-center">
			<input @change="changed" type="checkbox" class="form-checkbox h-5 w-5 text-orange-600" :checked="value">
			<span class="ml-2">{{ label }}</span>
		</label>
	</div>
</template>

<script>
export default
{
	props:
	{
		checked:
		{
			type: Boolean,
			default: false
		},
		label:
		{
			type: String,
			default: ''
		}
	},
	data()
	{
		return {
			value: false,
		}
	},
	watch:
	{
		checked:
		{
			immediate: true,
			handler(val)
			{
				this.value = val;
			}
		}
	},
	methods:
	{
		changed(e)
		{
			this.value = !this.value;
			this.$emit('change', this.value);
		}
	}
}
</script>