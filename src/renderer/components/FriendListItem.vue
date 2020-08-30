<template>
	<div v-if="friend" @click="$parent.$parent.openURL($parent.$parent.getFriendLink(friend.steamid))" :class="[`h-${size}`, {'flex-col-child-m3': home}]" class="relative flex flex-row items-center text-white bg-sidebar-half rounded hover:bg-black transition-colors duration-200 cursor-pointer">
		<div class="inline-flex flex-row items-center px-5 overflow-hidden">
			<img :src="$parent.$parent.getFriendAvatar(friend.steamid)" class="w-10 h-10 rounded-full mr-3">
			<div class="inline-flex flex-col font-semibold overflow-hidden">
				<span class="leading-tight">{{ friend.name }}</span>
				<span v-if="friend.server && friend.server.name" class="font-normal truncate text-gray-500">Playing <span class="text-white">{{ friend.server.name }}</span></span>
			</div>
		</div>
		<div @click.stop :class="`w-${size}`" class="flex-shrink-0 h-full flex items-center justify-center text-xl bg-hover-light ml-auto rounded-r">
			<a @click="$router.push(`server/${friend.server.ip}/${friend.server.query_port}`)" class="w-full h-full flex flex-shrink-0 items-center justify-center" href="javascript:void(0);">
				<ion-icon name="open-sharp"></ion-icon>
			</a>
		</div>
	</div>
</template>

<script>
export default
{
	props:
	{
		friend: Object,
		home:
		{
			type: Boolean,
			default: false
		}
	},
	data()
	{
		return {
			size: '16'
		}
	},
	methods:
	{
	}
}
</script>