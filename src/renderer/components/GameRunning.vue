<template>
    <transition name="fade">
        <div v-if="show" class="position-fixed d-flex align-items-center justify-content-center" style="z-index: 2; top: 0; left: 0; right: 0; bottom: 0; width: 100vw; height: 100vh;">
            <div class="modal-backdrop show"></div>
            <div class="modal modal-xl position-relative d-flex">
                <div class="modal-dialog modal-dialog-centered">
                    <div v-if="playing_server && playing_server.name" class="modal-content border-0 bg-4">
                        <div class="modal-header d-flex flex-column">
                            <h5 class="modal-title">Game running</h5>
                            <p class="mb-0">
                                <small><a @click="quit" href="javascript:void(0);">Close</a> your game to continue using the launcher.</small>
                            </p>
                        </div>
                        <div class="modal-body d-flex flex-column">
                            <div>You are currently playing on the server {{ playing_server.name }}.</div>
                            <div>Players: {{ playing_server.players }}/{{ playing_server.max_players }}</div>
                            <div>Server time: {{ playing_server.time }}</div>
                        </div>
                        <div class="modal-footer">
                            <div class="mr-auto" style="font-size: 0.8rem;">Server information last updated {{ last_update_time }}</div>
                            <button type="button" class="btn btn-secondary" @click="quit">Close game</button>
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
                last_update: null,
                last_update_time: null,
            }
        },
        watch: {
            playing_server() {
                this.update();
                if (Object.keys(this.playing_server).length > 0) {
                    this.open();
                } else {
                    this.close();
                }
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
        },
        methods: {
            update() {
                this.last_update = new Date();
                return this.last_update;
            },
            open() {
                this.show = true;
                refresh = setInterval(() => {
                    this.$store.dispatch('Servers/getServer', this.playing_server);
                    this.update();
                }, 300000);
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
                                this.$store.dispatch('Servers/setPlayingServer', this.servers.find((server) => {
                                    return server.ip == this.last_played.ip && server.game_port == this.last_played.game_port;
                                }));
                            } else {
                                this.close();
                                this.$store.dispatch('Servers/setPlayingServer', {});
                            }
                        });
                }, 1000);
            },
        },
        created: function() {
            setInterval(() => {
                if (this.last_update) this.last_update_time = moment(this.last_update).fromNow();
            }, 5000);
            this.findGame();
            this.$store.subscribe((mutation, state) => {
                if (mutation.type == 'Servers/setServer' && Object.keys(this.playing_server).length > 0 &&  mutation.payload.server.ip == this.playing_server.ip) {
                    this.$store.dispatch('Servers/setPlayingServer', this.servers.find((server) => {
                        return server.ip == this.playing_server.ip && server.game_port == this.playing_server.game_port;
                    }));
                }
            });
        },
    }
</script>