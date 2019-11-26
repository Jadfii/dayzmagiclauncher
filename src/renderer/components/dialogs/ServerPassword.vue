<template>
    <transition name="fade">
        <div v-if="show" class="position-fixed d-flex align-items-center justify-content-center" style="z-index: 2; top: 0; left: 0; right: 0; bottom: 0; width: 100vw; height: 100vh;">
            <div class="modal-backdrop show"></div>
            <div class="modal modal-xl position-relative d-flex">
                <div class="modal-dialog modal-dialog-centered" style="width: auto !important;">
                    <div class="modal-content border-0 bg-4">
                        <div class="modal-header d-flex flex-column">
                            <h5 class="modal-title">Enter server password</h5>
                            <p v-if="playing_server && playing_server.name" class="mb-0">
                                <small>You are joining the server {{ playing_server.name }}</small>
                            </p>
                        </div>
                        <div class="modal-body d-flex flex-column">
                            <div class="mt-2 position-relative" style="width: 250px;">
                                <input v-model="server_password" :class="{ 'is-invalid': error.length > 0 }" type="text" class="form-control border-0 text-light bg-1" placeholder="Enter password">
                                <i class="mdi mdi-lock-question"></i>
                                <div class="invalid-feedback">
                                    {{ error }}
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" @click="close">Cancel</button>
                            <button type="button" class="btn btn-primary" @click="join">Join server</button>
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
                server_password: null,
                resolve: null,
                reject: null,
                error: '',
            }
        },
        watch: {
            show(val) {
                if (val) EventBus.$emit('closeModal');
            },
        },
        computed: {
            playing_server() {
                return this.$store.getters['Servers/playing_server'];
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
            ask(existing_password = null) {
                if (typeof existing_password !== 'undefined' && existing_password !== null) this.server_password = existing_password.password;
                this.open();
                return new Promise((resolve, reject) => {
                    this.resolve = resolve;
                    this.reject = reject;
                });
            },
            join() {
                if (this.server_password == null || this.server_password.length == 0) {
                    this.error = ('No password entered.');
                    return;
                }
                this.error = '';
                this.resolve(this.server_password);
                this.close();
            },
        },
        created() {
        },
    }
</script>