<template>
	<div class="flex h-full w-full relative text-white">
		<div class="inline-flex flex-col flex-1">
			<div class="inline-flex">
				<router-link v-for="(link, index) in $parent.getRouteChildren()" :key="index" :to="link.path" :class="{}" class="opacity-50 hover:opacity-100 transition-opacity duration-100 text-xl font-semibold mb-4 mr-6">{{ link.name }}</router-link>
			</div>
			<keep-alive>
				<router-view></router-view>
			</keep-alive>
		</div>
	</div>
</template>

<script>
import Setting from './../components/Setting';


export default
{
	name: 'Settings',
	components:
	{
		Setting
	},
	data()
	{
		return {
			
		}
	},
	computed: 
	{
		app()
		{
			return this.$store.getters.app;
		},
	},
	methods:
	{

	},
	created()
	{
	}
}
</script>