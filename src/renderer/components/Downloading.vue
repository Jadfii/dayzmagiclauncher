<template>
    <transition name="fly-down">
        <div v-if="show" class="position-fixed" style="z-index: 2; pointer-events: none; top: 0; left: 0; right: 0; bottom: 0; width: 100vw; height: 100vh;">
            <div class="modal position-relative d-flex w-auto h-auto">
                <div class="modal-dialog" style="width: 600px !important; margin: 31px auto 0 auto !important;">
                    <div class="modal-content d-flex flex-row border-0 bg-4" style="height: 40px;">
                        <div class="modal-header d-flex align-items-center" style="padding: 0 1rem;">
                            <i data-toggle="tooltip" data-placement="bottom" title="Downloading" class="mdi mdi-download" style="font-size: 16px; line-height: 16px;"></i>
                        </div>
                        <div v-if="file" class="modal-body d-flex align-items-center justify-content-center flex-fill">
                            <div class="flex-shrink-0" style="font-size: 0.9rem;">{{ file.title }}</div>
                            <div class="progress w-100 ml-2">
                                <div class="progress-bar bg-primary" role="progressbar" :style="{ width: progress + '%' }"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </transition>
</template>

<script>
    import { EventBus } from './../event-bus.js';

    // Load moment.js
    const moment = require('moment');

    let timeout = null;

    export default {
        data () {
            return {
                show: false,
                file: null,
                progress: 0,
            }
        },
        watch: {
            progress(val) {
                if (val == 100) {
                    timeout = setTimeout(() => {
                        this.close();
                        setTimeout(() => {
                            this.progress = 0;
                        }, 500);
                    }, 2000);
                }
            },
        },
        computed: {
        },
        methods: {
            open() {
                this.show = true;
            },
            close() {
                this.show = false;
            },
        },
        created: function() {
            EventBus.$on('downloadProgress', (payload) => {
                if (timeout) clearTimeout(timeout);
                this.file = payload.file;
                this.progress = payload.progress;
                if (!this.show) this.open();
            });
            EventBus.$on('item-downloaded', (payload) => {
                if (payload.file == this.file || payload.file == this.file.publishedFileId) {
                    this.progress = 100;
                }
            });
        },
    }
</script>