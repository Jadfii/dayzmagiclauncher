<template>
	<div class="flex flex-col">
		<span v-if="cpu">CPU: {{ cpu }}</span>
		<span v-if="mem">RAM: {{ mem }}</span>
		<span v-if="gpu">GPU: {{ gpu }}</span>
	</div>
</template>

<script>
export default
{
	name: 'Debug',
	data()
	{
		return {
			cpu: null,
			mem: null,
			gpu: null
		}
	},
	async created()
	{
		let cpu = await this.$system.cpu();
		this.cpu = cpu.manufacturer ? `${cpu.manufacturer} ${cpu.brand}` : null;

		let mem = await this.$system.mem();
		this.mem = mem.total ? this.$filesize(mem.total) : null;

		let gpu = await this.$system.graphics();
		this.gpu = gpu.controllers.length > 0 ? gpu.controllers[0].model : null;
	}
}
</script>