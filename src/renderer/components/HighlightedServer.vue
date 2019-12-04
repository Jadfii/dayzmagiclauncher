<template>
    <transition name="fade">
        <div v-if="show" @click="close" class="position-fixed d-flex align-items-center justify-content-center" style="z-index: 2; top: 0; left: 0; right: 0; bottom: 0; width: 100vw; height: 100vh;">
            <div class="modal-backdrop show"></div>
            <div class="modal modal-xl position-relative d-flex">
                <div class="modal-dialog modal-dialog-centered">
                    <div @click.stop v-if="highlighted_server && highlighted_server.name" class="container modal-content border-0 bg-4">
                        <div class="modal-header d-flex flex-row">
                            <div class="d-flex flex-column w-100">
                                <h5 class="modal-title text-break">{{ highlighted_server.name }}</h5>
                                <p class="mb-0">
                                    <small>{{ highlighted_server.ip }}:{{ highlighted_server.game_port }}
                                        <a @click="copyToClip(highlighted_server.ip+':'+ highlighted_server.game_port)" href="javascript:void(0);">
                                            <i data-toggle="tooltip" data-placement="right" title="Copy to clipboard" class="mdi mdi-content-copy"></i>
                                        </a>
                                    </small>
                                </p>
                                <div class="d-flex flex-row align-items-center mt-4">
                                    <div class="d-flex flex-row align-items-center">
                                        <div data-toggle="tooltip" data-placement="top" title="Player count" style="height: 36px; width: 36px;" class="d-flex align-items-center justify-content-center rounded border-0 bg-1 p-0 flex-shrink-0">
                                            <i style="font-size: 18px;" class="mdi mdi-account-multiple"></i>
                                        </div>
                                        <p class="mb-0 ml-2">{{ highlighted_server.players }}/{{ highlighted_server.max_players }}<span v-if="highlighted_server.queue > 0" data-toggle="tooltip" data-placement="top" title="Queue"> (+{{ highlighted_server.queue }})</span></p>
                                    </div>
                                    <div class="d-flex flex-row align-items-center ml-5">
                                        <div data-toggle="tooltip" data-placement="top" title="Server time" style="height: 36px; width: 36px;" class="d-flex align-items-center justify-content-center rounded border-0 bg-1 p-0 flex-shrink-0">
                                            <i style="font-size: 18px;" class="mdi mdi-clock-outline"></i>
                                        </div>
                                        <p class="mb-0 ml-2">{{ highlighted_server.time }}</p>
                                    </div>
                                </div>
                                <div class="row d-flex flex-row mt-4">
                                    <div class="col">
                                        <h6 class="text-uppercase mb-0">Map</h6>
                                        <small>{{ highlighted_server.map }}</small>
                                    </div>
                                    <div class="col">
                                        <h6 class="text-uppercase mb-0">Version</h6>
                                        <small>{{ highlighted_server.version }}</small>
                                    </div>
                                    <div class="col">
                                        <h6 class="text-uppercase mb-0">Game mode</h6>
                                        <small>{{ highlighted_server.first_person ? 'First person' : 'Third person' }}</small>
                                    </div>
                                    <div class="col">
                                        <h6 class="text-uppercase mb-0">Password</h6>
                                        <small>{{ highlighted_server.password ? 'On' : 'Off' }}</small>
                                    </div>
                                    <div class="col">
                                        <h6 class="text-uppercase mb-0">Hive</h6>
                                        <small>{{ highlighted_server.public_hive ? 'Public' : 'Private' }}</small>
                                    </div>
                                    <div class="col">
                                        <h6 class="text-uppercase mb-0">VAC</h6>
                                        <small>{{ highlighted_server.vac ? 'Secured' : 'Insecure' }}</small>
                                    </div>
                                </div>
                            </div>
                            <button @click="close" style="width: 32px;" class="btn btn-secondary border-0 bg-1 p-0 flex-shrink-0" type="button">
                                <i class="mdi mdi-close"></i>
                            </button>
                        </div>
                        <div class="modal-body d-flex flex-column">
                            <div v-if="server_mods && server_mods.length > 0" class="d-flex flex-column flex-fill inline-scroll" style="max-height: 300px; overflow-y: auto;">
                                <h6>Mods</h6>
                                <ul class="list-group list-group-small mr-1">
                                    <li v-for="(mod, key) in server_mods" :key="key" href="javascript:void(0);" class="bg-3 no-underline list-group-item d-flex align-items-center">
                                        <span>{{ mod.title }}</span>
                                        <a @click.stop class="ml-2" :href="'steam://url/CommunityFilePage/' + mod.publishedFileId" style="height: 16px; width: 16px;">
                                            <i data-toggle="tooltip" data-placement="right" title="View Workshop page" style="font-size: 1.2rem;" class="mdi mdi-open-in-new"></i>
                                        </a>
                                        <span class="ml-auto mr-2">{{ filesize(mod.fileSize) }}</span>
                                        <span :class="{ 'badge-primary': isSubscribedMod(mod.publishedFileId), 'badge-danger': !isSubscribedMod(mod.publishedFileId) }" class="badge badge-pill">{{ isSubscribedMod(mod.publishedFileId) ? 'Subscribed' : 'Not subscribed' }}</span>
                                    </li>
                                </ul>
                            </div>
                            <div v-if="friendsPlaying.length > 0" class="d-flex flex-column flex-fill inline-scroll mt-3" style="max-height: 300px; overflow-y: auto;">
                                <h6>Friends</h6>
                                <div class="list-group list-group-small mr-1">
                                    <a v-for="friend in friendsPlaying" :key="friend.steamid" :href="'steam://url/SteamIDPage/' + friend.steamid" class="bg-3 no-underline list-group-item d-flex justify-content-between align-items-center">
                                        {{ friend.name }}
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <div class="">
                                <button @click="$parent.$refs.router_view.favouriteServer(highlighted_server)" :class="{ 'bg-favourite': !$parent.$refs.router_view.isFavouriteServer(highlighted_server) }" type="button" class="btn btn-secondary border-0 ml-auto">{{ $parent.$refs.router_view.isFavouriteServer(highlighted_server) ? 'Unfavourite server' : 'Favourite server' }}</button>
                                <button @click="loadOfflineMods(highlighted_server)" type="button" class="btn btn-secondary border-0">Load offline mode with server mods</button>
                                <button @click="load" type="button" class="btn btn-secondary">Load game{{ server_mods.length > 0 ? ' with server mods' : '' }}</button>
                                <button @click="play" class="btn btn-primary" type="button">Play server</button>
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
    // Load FileSystem
    const fs = require('fs-extra');
    // load config
    const { remote, clipboard } = require('electron');
    const path = require('path');
    const config = JSON.parse(fs.readFileSync(path.join(remote.app.getAppPath(), '/config.json')));

    // Load Vue
    import Vue from 'vue';
    // Load filesize
    const filesize = require('filesize');
    Vue.prototype.filesize = filesize;

    const request = require('request');

    export default {
        data () {
            return {
                show: false,
                friendsServers: [],
                server_mods: [],
            }
        },
        watch: {
            highlighted_server(val) {
                this.server_mods = val.mods;
                if (val && val.mods) {
                    let new_mods = val.mods.filter(mod => this.mods.every(mod2 => mod.id.toString() !== mod2.publishedFileId.toString()));
                    let mods = this.mods.filter((mod) => {
                        return val.mods.filter((mod2) => {
                            return mod.publishedFileId.toString() == mod2.id.toString();
                        }).length > 0;
                    });
                    this.$parent.greenworks.ugcGetItemDetails(new_mods.map(mod => mod.id.toString()), (items) => {
                        mods.push(...items);
                    }, (err) => {
                        if (err) log.error(err);
                    });
                    this.server_mods = mods;
                }
            }
        },
        computed: {
            highlighted_server() {
                return this.$store.getters['Servers/highlighted_server'];
            },
            friends() {
                return this.$store.getters.friends;
            },
            servers() {
                return this.$store.getters['Servers/servers'];
            },
            mods() {
                return this.$store.getters.mods;
            },
            friendsPlaying() {
                let server = this.friendsServers.find((server) => {
                    return server.gameserverip == this.highlighted_server.ip + ':' + this.highlighted_server.game_port;
                });
                if (typeof server !== 'undefined') {
                    return server.friends;
                } else {
                    return [];
                }
            },
        },
        methods: {
            open() {
                this.show = true;
            },
            close() {
                this.show = false;
                this.$store.dispatch('Servers/setHighlightedServer', {});
            },
            toggle() {
                this.show = !this.show;
            },
            load() {
                EventBus.$emit('joinServer', [this.highlighted_server, false]);
            },
            play() {
                EventBus.$emit('joinServer', this.highlighted_server);
            },
            isSubscribedMod(id) {
                return this.mods.some(mod => mod.publishedFileId.toString() == id.toString());
            },
            copyToClip(content) {
                clipboard.writeText(content);
            },
            loadOfflineMods(server) {
                this.close();
                setTimeout(() => {
                    EventBus.$emit('loadOfflineMods', server.mods);
                    EventBus.$emit('openOffline');
                }, 100);
                this.$router.push('play');
            },
            getModInfo(mod_id) {
                let e = this.mods.find(e => {
                    return mod_id.toString() == e.publishedFileId.toString();
                });
                if (typeof e == 'undefined' || !e) {
                    request({
                        url: 'https://api-v1.workshopcrawler.com/items/' + mod_id.toString(),
                        json: true,
                    }, (error, response, body) => {
                        if (error) {
                            log.error(error);
                        } else {
                            let file_size = body.versions.find((version) => {
                                return version.isLatest;
                            }).totalBytes;
                            e = {
                                'publishedFileId': body.id.toString(),
                                'title': body.title,
                                'description': body.description,
                                'fileSize': file_size,
                            };
                        }
                    });
                } else {
                    mods_info.push()
                }
                console.log(e);
                return e;
            },
        },
        created: function() {
            this.$store.subscribe((mutation, state) => {
                if (mutation.type == 'Servers/setHighlightedServer' && Object.keys(mutation.payload).length > 0) {
                        this.open();
                }
            });
            EventBus.$on('friendsServers', (payload) => {
                this.friendsServers = payload;
            });
            EventBus.$on('closeModal', (payload) => {
                this.close();
            });
        },
    }
</script>