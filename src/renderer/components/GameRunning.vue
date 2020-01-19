<template>
    <transition name="fly-down">
        <div v-if="show" class="position-fixed" style="z-index: 2; pointer-events: none; top: 0; left: 0; right: 0; bottom: 0; width: 100vw; height: 100vh;">
            <div class="modal position-relative d-flex w-auto h-auto">
                <div class="modal-dialog" style="width: 600px !important; margin: 31px auto 0 auto !important;">
                    <div class="modal-content d-flex flex-row border-0 bg-4" style="height: 40px;">
                        <div class="modal-header d-flex align-items-center" style="padding: 0 1rem;">
                            <i data-toggle="tooltip" data-placement="bottom" title="Currently playing" class="mdi mdi-television-play" style="font-size: 16px; line-height: 16px;"></i>
                        </div>
                        <div v-if="server && server.name" class="modal-body d-flex align-items-center flex-fill">
                            <a href="javascript:void(0);" @click="$store.dispatch('Servers/setHighlightedServer', server)" style="font-size: 0.9rem;">{{ server.name.length > 40 ? server.name.substring(0, 40) + '...' : server.name }}.</a>
                            <div class="d-flex flex-row ml-auto">
                                <div style="font-size: 0.9rem;">
                                    <i data-toggle="tooltip" data-placement="bottom" title="Player count" class="mdi mdi-account-multiple"></i>
                                    {{ server.players }}/{{ server.max_players }}
                                </div>
                                <div style="font-size: 0.9rem;" class="ml-3">
                                    <i data-toggle="tooltip" data-placement="bottom" title="Server time" class="mdi mdi-clock-outline"></i>
                                    {{ server.time }}
                                </div>
                                <a @click="quit" class="ml-3" href="javascript:void(0);"><i data-toggle="tooltip" data-placement="bottom" title="Close game" class="mdi mdi-close" style="font-size: 16px; line-height: 16px;"></i></a>
                            </div>
                        </div>
                        <div v-else-if="playing_offline" class="modal-body d-flex align-items-center flex-fill">
                            <p class="mb-0" style="font-size: 0.9rem;">Playing offline mode.</p>
                            <div class="d-flex flex-row ml-auto">
                                <a @click="quit" class="ml-3" href="javascript:void(0);"><i data-toggle="tooltip" data-placement="bottom" title="Close game" class="mdi mdi-close" style="font-size: 16px; line-height: 16px;"></i></a>
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
    var refresh;
    var search;

    const remote = require('electron').remote;
    const settings = remote.require('electron-settings');

    export default {
        data () {
            return {
                show: false,
                server: {},
            }
        },
        watch: {
            playing_server(val) {
                let server = val ? val.split(':') : null;
                if (server && val) {
                    this.server = this.servers.find(s => s.ip == server[0] && s.query_port == server[1]);
                    this.open();
                } else {
                    this.server = {};
                    this.close();
                }
            },
            playing_offline(val) {
                if (val) this.open();
                else this.close();
            },
            show(val) {
                if (val) EventBus.$emit('closeModal');
            },
        },
        computed: {
            servers() {
                return this.$store.getters['Servers/servers'];
            },
            playing_server() {
                return this.$store.getters['Servers/playing_server'];
            },
            last_played() {
                let last_played = settings.get('last_played', null);
                if (typeof last_played !== 'undefined' && last_played !== null && last_played.server.ip) {
                    last_played = this.servers.find((server) => {
                        return server.ip == last_played.server.ip && (server.query_port == last_played.server.port || server.game_port == last_played.server.port);
                    });
                }
                return last_played;
            },
            playing_offline() {
                return this.$store.getters['Servers/playing_offline'];
            }
        },
        methods: {
            open() {
                this.show = true;
            },
            close() {
                this.show = false;
                clearInterval(refresh);
                refresh = null;
                clearInterval(search);
                search = null;
            },
            toggle() {
                this.show = !this.show;
            },
            quit() {
                EventBus.$emit('quitGame');
            },
            findGame() {   
                const find = require('find-process');
                search = setInterval(() => {
                    find('name', 'DayZ_x64')
                        .then((list) => {
                            if (list.length > 0 && !this.show && this.last_played !== null) {
                                this.open();
                                this.$store.dispatch('Servers/setPlayingServer', `${this.last_played.ip}:${this.last_played.query_port}`);
                            } else {
                                this.close();
                                this.$store.dispatch('Servers/setPlayingServer', null);
                            }
                        });
                }, 1000);
            },
        },
        created: function() {
            //this.findGame();
            this.$store.subscribe((mutation, state) => {
                if (mutation.type == 'Servers/setServer' && Object.keys(this.playing_server).length > 0 &&  mutation.payload.server.ip == this.playing_server.ip) {
                    this.$store.dispatch('Servers/setPlayingServer', `${this.playing_server.ip}:${this.playing_server.query_port}`);
                }
            });
        },
    }
</script>