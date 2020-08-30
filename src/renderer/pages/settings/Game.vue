<template>
	<div class="inline-flex flex-col flex-1">
		<Setting setting="nick_name"></Setting>
		<Setting setting="parameters" class="mt-2"></Setting>
		<Setting setting="dayz_path" class="mt-2"></Setting>
		<Setting setting="dayz_path_experimental" class="mt-2"></Setting>
	</div>
</template>

<script>
import Setting from './../../components/Setting';

export default
{
	name: 'Game',
	components:
	{
		Setting
	},
	created()
	{
	}
}
</script>