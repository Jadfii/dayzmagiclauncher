<template>
	<div @click="toggleChecked()" class="cursor-pointer inline-flex flex-row items-center py-2 px-4 bg-sidebar-half rounded">
		<div class="inline-flex flex-col mr-auto">
			<h4 class="">{{ label }}</h4>
			<span class="text-gray-500">{{ checked ? toggled_text ? toggled_text : `${label} only` : untoggled_text ? untoggled_text : 'Any' }}</span>
		</div>
		<div class="flex text-lg items-center relative w-6 h-6 mr-2 align-middle select-none">
			<ion-icon v-show="checked" class="text-green-400" name="checkmark-sharp"></ion-icon>
			<ion-icon v-show="!checked" name="remove-sharp"></ion-icon>
		</div>
	</div>
</template>

<script>
export default
{
	data()
	{
		return {
			id: `toggle-${Math.random().toString(36).substr(2, 5)}`,
			checked: false,
		}
	},
	props:
	{
		label: String,
		state: Boolean,
		toggled_text: String,
		untoggled_text: String
	},
	watch:
	{
		checked(val, old_val)
		{
			this.$emit('toggle', val);
		}
	},
	methods:
	{
		toggleChecked()
		{
			this.checked = !this.checked;
		},
		setChecked(val)
		{
			this.checked = val;
		}
	},
	created()
	{
		this.checked = this.state;
	}
}
</script>