<template>
    <transition name="fade">
        <div v-if="show" class="position-fixed d-flex align-items-center justify-content-center" style="z-index: 2; top: 0; left: 0; right: 0; bottom: 0; width: 100vw; height: 100vh;">
            <div class="modal-backdrop show"></div>
            <div class="modal modal-xl position-relative d-flex">
                <div class="modal-dialog modal-dialog-centered" style="width: auto !important;">
                    <div class="modal-content border-0 bg-4">
                        <div class="modal-header d-flex flex-column">
                            <h5 class="modal-title">{{ title }}</h5>
                        </div>
                        <div class="modal-body d-flex flex-column">
                            <div class="mt-2 position-relative" style="width: 250px;">
                                <input v-model="data" :class="{ 'is-invalid': error.length > 0 }" type="text" class="form-control border-0 text-light bg-1" placeholder="Enter password">
                                <i class="mdi mdi-lock-question"></i>
                                <div class="invalid-feedback">
                                    {{ error }}
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" @click="close">Cancel</button>
                            <button type="button" class="btn btn-primary" @click="complete">Continue</button>
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
                data: null,
                resolve: null,
                reject: null,
                title: null,
                message: null,
                error: '',
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
                this.show = false;
                this.reject();
            },
            toggle() {
                this.show = !this.show;
            },
            prompt(data) {
                if (!data.title) return;
                if (typeof data.fill !== 'undefined' && data.fill !== null) this.data = data.fill;
                this.title = data.title;
                this.open();
                return new Promise((resolve, reject) => {
                    this.resolve = resolve;
                    this.reject = reject;
                });
            },
            complete() {
                if (this.data == null || this.data.length == 0) {
                    this.error = 'No data entered.';
                    return;
                }
                this.error = '';
                this.resolve(this.data);
                this.close();
            },
        },
        created() {
        },
    }
</script>