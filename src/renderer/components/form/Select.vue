<template>
    <div @focusout="handleFocus" tabindex="0" class="select relative inline-block text-left">
        <div>
            <span class="rounded-md shadow-sm text-sm">
                <button @click="toggle" type="button" class="inline-flex flex-col justify-center bg-transparent leading-5 font-medium text-white hover:text-gray-300 transition ease-in-out duration-150">
                    <span v-if="label" class="uppercase">{{ label }}</span>
                    <div class="inline-flex justify-center w-full">
                        <span>{{ selected.label }}</span>
                        <svg :class="{'rotate-180': !is_open}" class="-mr-1 ml-2 h-5 w-5 ml-auto transform transition duration-150 ease-in-out" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
                        </svg>
                    </div>
                </button>
            </span>
        </div>

        <transition name="dropdown">
            <div v-show="is_open" style="bottom: 42px;" class="origin-bottom-left absolute left-0 mt-2 w-56 rounded-md shadow-lg">
                <div class="rounded-md bg-white shadow-xs">
                    <div class="py-1">
                        <a v-for="(option, index) in options" :key="index" @click="selectOption(option)" href="javascript:void(0);" class="block px-4 py-2 text-sm leading-5 text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:bg-gray-100 focus:text-gray-900">{{ option.label }}</a>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<style lang="scss">
.dropdown-enter-active, .dropdown-leave-active
{
    transition: all .1s;
}
.dropdown-enter-active
{
    transition-timing-function: cubic-bezier(0, 0, 0.2, 1);
}
.dropdown-leave-active
{
    transition-timing-function: cubic-bezier(0.4, 0, 1, 1);
}
.dropdown-enter, .dropdown-leave-to
{
    transform: scale(.9);
    opacity: 0;
}
</style>

<script>
export default
{
    data()
    {
        return {
            is_open: false,
        }
    },
    props: 
    {
        label: String,
        options: Array,
        selected: Object,
    },
    methods:
    {
        toggle()
        {
            this.is_open = !this.is_open;
        },
        open()
        {
            if (!this.is_open) this.is_open = true;
        },
        close()
        {
            if (this.is_open) this.is_open = false;
        },
        selectOption(option)
        {
            this.$emit('select', option);
            this.close();
        },
        handleFocus(e)
        {
            if (e.relatedTarget == null) this.close();
        },
    },
    mounted()
    {
    },
}
</script>