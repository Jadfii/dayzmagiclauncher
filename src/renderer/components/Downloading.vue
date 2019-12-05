<template>
    <transition name="fly-down">
        <div v-if="show" class="position-fixed" style="z-index: 2; pointer-events: none; top: 0; left: 0; right: 0; bottom: 0; width: 100vw; height: 100vh;">
            <div class="modal position-relative d-flex w-auto h-auto">
                <div class="modal-dialog" style="width: 600px !important; margin: 31px auto 0 auto !important;">
                    <div class="modal-content d-flex flex-row border-0 bg-4" style="height: 40px;">
                        <div style="width: 180px; padding: 0 1rem;" class="modal-header d-flex align-items-center flex-shrink-0 pr-3">
                            <i data-toggle="tooltip" data-placement="bottom" :data-original-title="!this.stopped ? 'Downloading' : 'Downloading paused'" :class="{ 'mdi-download': !this.stopped, 'mdi-download-off': this.stopped }" class="mdi" style="font-size: 16px; line-height: 16px;"></i>
                            <small data-toggle="tooltip" data-placement="bottom" title="Download speed" class="ml-1 text-nowrap" style="font-size: 0.8rem;"><i class="mdi mdi-progress-download mr-1"></i>{{ filesize(download_speed).replace('-', '') }}/s</small>
                            <small data-toggle="tooltip" data-placement="bottom" title="Time remaining" class="ml-1 text-nowrap" style="font-size: 0.8rem;"><i class="mdi mdi-timer mr-1"></i>{{ time_remaining }}s</small>
                        </div>
                        <div v-if="file" class="modal-body d-flex align-items-center justify-content-center flex-fill pl-0">
                            <div class="flex-shrink-0" style="font-size: 0.9rem;">{{ file.title }}</div>
                            <div class="progress w-100 ml-2">
                                <div class="progress-bar bg-primary" role="progressbar" :style="{ width: progress + '%' }"></div>
                            </div>
                            <a @click="toggleDownloads" class="ml-2" href="javascript:void(0);"><i data-toggle="tooltip" data-placement="bottom" :data-original-title="!this.stopped ? 'Pause downloads' : 'Resume downloads'" :class="{ 'mdi-close': !this.stopped, 'mdi-sync': this.stopped }" class="mdi" style="font-size: 16px; line-height: 16px;"></i></a>
                            <a v-if="server" @click="cancelDownloads" class="ml-1" href="javascript:void(0);"><i data-toggle="tooltip" data-placement="bottom" title="Cancel downloads" class="mdi mdi-close-circle" style="font-size: 16px; line-height: 16px;"></i></a>
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
    const log = require('electron-log');

    // Load Vue
    import Vue from 'vue';
    // Load filesize
    const filesize = require('filesize');
    Vue.prototype.filesize = filesize;

    let timeout = null;

    export default {
        data () {
            return {
                show: false,
                file: null,
                progress: 0,
                bytes_downloaded: null,
                bytes_total: null,
                stopped: true,
                server: false,
                bytes_diff: [],
                download_speed: 0,
            }
        },
        watch: {
            progress(val) {
                if (val == 100) {
                    timeout = setTimeout(() => {
                        this.close();
                        setTimeout(() => {
                            this.clearDownload(true);
                        }, 500);
                    }, 2000);
                } else {
                    this.stopped = false;
                }
            },
        },
        computed: {
            time_remaining() {
                let eta = moment().add((Math.floor(this.bytes_total - this.bytes_downloaded) / this.download_speed), 'seconds');
                let remaining = moment.duration(moment().diff(eta)).seconds();
                return this.bytes_total !== null && !isNaN(remaining) ? Math.abs(remaining) :  0;
            },
        },
        methods: {
            open() {
                this.show = true;
                this.stopped = false;
            },
            close() {
                this.show = false;
                this.stopped = true;
            },
            toggleDownloads() {
                this.stopped = !this.stopped;
                if (this.stopped) {
                    log.info('Suspended download for item '+this.file.publishedFileId ? this.file.title : this.file);
                } else {
                    log.info('Resumed download for item '+this.file.publishedFileId ? this.file.title : this.file);
                }
                this.$parent.greenworks.ugcSuspendDownloads(this.stopped);
            },
            cancelDownloads() {
                EventBus.$emit('cancelDownloads');
            },
            clearDownload(full_clear = false) {
                if (full_clear) {
                    this.progress = 0;
                    this.download_speed = 0;
                }
                this.bytes_diff = [];
                this.bytes_downloaded = null;
                this.bytes_total = null;
            },
        },
        created: function() {
            EventBus.$on('downloadProgress', (payload) => {
                if (timeout) clearTimeout(timeout);
                if (this.bytes_downloaded !== null) {
                    this.bytes_diff.push((parseInt(payload.downloaded) - this.bytes_downloaded));
                    this.download_speed = this.bytes_diff.length > 0 ? (this.bytes_diff.reduce((acc, c) => acc + c, 0) / this.bytes_diff.length) * 5 : 0;
                }
                this.file = payload.file;
                this.progress = payload.progress;
                this.server = payload.server;
                this.bytes_downloaded = parseInt(payload.downloaded);
                this.bytes_total = parseInt(payload.total);
                if (!this.show) this.open();
            });
            EventBus.$on('item-downloaded', (payload) => {
                if (payload.file == this.file || (this.file.publishedFileId && payload.file == this.file.publishedFileId)) {
                    this.progress = 100;
                    this.clearDownload(false);
                }
            });
        },
    }
</script>