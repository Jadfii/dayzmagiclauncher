<template>
	<v-popover placement="top" popoverClass="mb-1" class="w-full">
		<div v-if="mod" class="pl-4 relative flex flex-row items-center flex-shrink-0 h-12 mb-2 bg-sidebar-half cursor-pointer rounded text-sm hover:bg-black transition-colors duration-200">
			<div class="w-4/12 pr-8 truncate overflow-hidden flex-shrink-0">
				<span>{{ mod.title }}</span>
			</div>
			<div class="w-4/12 pl-4 flex-shrink-0">
				<span>{{ $moment.unix(mod.timeUpdated).calendar() }}</span>
			</div>
			<div class="w-2/12 pr-4 flex-shrink-0">
				<span v-if="mod && mod.publishedFileId" :class="`text-${$parent.$parent.MOD_FUNC.getStateColour(mod.publishedFileId)}`">{{ $parent.$parent.MOD_FUNC.getItemState(mod.publishedFileId).label }}</span>
			</div>
			<div class="w-2/12 px-4 flex-shrink-0 text-right">
				<span>{{ $parent.$parent.MOD_FUNC.normaliseSize(mod.fileSize) }}</span>
			</div>
		</div>

		<template slot="popover">
			<div class="flex h-10 bg-sidebar rounded-md">
				<div @click="$parent.$parent.MOD_FUNC.verifyMod(mod.publishedFileId)" v-close-popover v-tooltip="`Verify mod`" class="flex-1 w-10 inline-flex items-center justify-center cursor-pointer hover:bg-black">
					<ion-icon name="build-sharp"></ion-icon>
				</div>
				<div @click="$parent.$parent.MOD_FUNC.reinstallMod(mod.publishedFileId)" v-close-popover v-tooltip="`Repair mod`" class="flex-1 w-10 inline-flex items-center justify-center cursor-pointer hover:bg-black">
					<ion-icon name="construct-sharp"></ion-icon>
				</div>
				<div @click="$parent.$parent.MOD_FUNC.unsubscribeMod(mod.publishedFileId)" v-close-popover v-tooltip="`Unsubscribe from mod`" class="flex-1 w-10 inline-flex items-center justify-center cursor-pointer hover:bg-black">
					<ion-icon name="trash-sharp"></ion-icon>
				</div>
				<div @click="$parent.$parent.openURL($parent.$parent.MOD_FUNC.getModURL(mod.publishedFileId))" v-close-popover v-tooltip="`Open mod page`" class="flex-1 w-10 inline-flex items-center justify-center cursor-pointer hover:bg-black">
					<ion-icon name="open-sharp"></ion-icon>
				</div>
			</div>
		</template>
	</v-popover>
</template>

<script>
export default
{
	props:
	{
		mod: Object,
	}
}
</script>