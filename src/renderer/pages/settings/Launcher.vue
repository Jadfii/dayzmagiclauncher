<template>
	<div class="inline-flex flex-col flex-1">
		<Setting setting="discord_rpc"></Setting>
		<Setting setting="privacy_mode" class="mt-2"></Setting>
	</div>
</template>

<script>
import Setting from './../../components/Setting';

export default
{
	name: 'Launcher',
	components:
	{
		Setting
	},
	created()
	{
	}
}
</script>