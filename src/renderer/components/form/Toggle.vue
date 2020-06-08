<template>
    <div>
        <div class="relative inline-block w-8 mr-2 align-middle select-none">
            <input :value="state" @change="emitToggle" :class="{'right-50': !state,'right-0': state,'bg-primary': state}" type="checkbox" :name="id" :id="id" class="transition-pos duration-75 ease-in absolute block w-5 h-5 rounded-full bg-gray-700 border-4 border-gray-800 appearance-none cursor-pointer"/>
            <label :for="id" class="block overflow-hidden h-5 rounded-full bg-gray-800 cursor-pointer"></label>
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
        }
    },
    props:
    {
        state: Boolean
    },
    methods:
    {
        emitToggle(e)
        {
            this.$emit('toggle', e.target.checked);
        }
    },
}
</script>