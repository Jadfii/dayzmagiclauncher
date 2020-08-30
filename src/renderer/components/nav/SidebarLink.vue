<template>
	<div>
		<router-link :to="to" :class="{'mb-8': margin}" class="router-link inline-flex items-center opacity-50 hover:opacity-100 transition-opacity duration-100">
			<ion-icon :name="icon" class="mr-3 text-xl"></ion-icon><span>{{ link }}</span>
		</router-link>
	</div>
</template>

<script>
export default
{
	props: 
	{
		link: String,
		icon: String,
		margin:
		{
			type: Boolean,
			default: false,
		},
		settings:
		{
			type: Boolean,
			default: false,
		},
	},
	computed:
	{
		to()
		{
			return `/${this.settings ? 'settings/' : ''}${this.link.toLowerCase()}`;
		}
	}
}
</script>