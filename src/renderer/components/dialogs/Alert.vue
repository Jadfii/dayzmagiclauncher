<template>
    <transition name="fade">
        <div v-if="show" class="position-fixed d-flex align-items-center justify-content-center" style="z-index: 2; top: 0; left: 0; right: 0; bottom: 0; width: 100vw; height: 100vh;">
            <div class="modal-backdrop show"></div>
            <div class="modal modal-xl position-relative d-flex">
                <div class="modal-dialog modal-dialog-centered" style="width: 50% !important;">
                    <div class="modal-content border-0 bg-4">
                        <div class="modal-header d-flex flex-column">
                            <h5 class="modal-title">{{ title }}</h5>
                        </div>
                        <div class="modal-body d-flex flex-column" v-html="message">
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-primary w-100" @click="close">Okay</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </transition>
</template>

<script>
    import { EventBus } from './../../event-bus.js';

    export default {
        data () {
            return {
                show: false,
                resolve: null,
                reject: null,
                title: null,
                message: null,
            }
        },
        watch: {
            show(val) {
                if (val) EventBus.$emit('closeModal');
            },
        },
        methods: {
            open() {
                this.show = true;
            },
            close() {
                this.resolve();
                this.show = false;
            },
            toggle() {
                this.show = !this.show;
            },
            alert(data) {
                if (!data.title || !data.message) return;
                this.title = data.title;
                this.message = data.message;
                this.open();
                return new Promise((resolve, reject) => {
                    this.resolve = resolve;
                    this.reject = reject;
                });
            },
        },
        created() {
        },
    }
</script>