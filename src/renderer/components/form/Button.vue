<template>
	<button :class="button_type" class="flex items-center justify-center py-2 px-8 transition-colors duration-200 rounded">
		<slot>
			<span>{{ label }}</span>
		</slot>
	</button>
</template>

<script>
export default
{
	props: 
	{
		label: String,
		type: String,
	},
	computed:
	{
		button_type()
		{
			switch (this.type)
			{
				/*case 'primary':
					return 'bg-primary text-white';
					break;*/
				case 'favourite':
					return 'bg-sidebar-half text-yellow-400 hover:bg-black hover:text-yellow-500';
					break;
				default:
					return 'bg-sidebar-half text-white hover:bg-black';
					break;
			}
		}
	}
}
</script>