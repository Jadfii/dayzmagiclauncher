<template>
    <div>
        <transition name="fade">
            <div v-if="show" class="position-fixed d-flex align-items-center justify-content-center" style="z-index: 2; top: 0; left: 0; right: 0; bottom: 0; width: 100vw; height: 100vh;">
                <div class="modal-backdrop show"></div>
                <div class="modal modal-xl position-relative d-flex">
                    <div class="modal-dialog modal-dialog-centered">
                        <div @click.stop class="modal-content border-0 bg-4">
                            <div class="modal-header d-flex flex-row">
                                <div class="d-flex flex-column">
                                    <h5 class="modal-title">Launch DayZ offline</h5>
                                    <p class="mb-0">
                                        <small>Parameter selection</small>
                                    </p>
                                </div>
                                <button @click="close" style="width: 32px;" class="btn btn-secondary border-0 bg-1 p-0 flex-shrink-0" type="button">
                                    <i class="mdi mdi-close"></i>
                                </button>
                            </div>
                            <div class="modal-body">
                                <div class="w-50">
                                    <v-select data-toggle="tooltip" data-placement="right" title="Select mission" v-model="parameters.mission" :options="missions" transition="none" :clearable="false" class="border-none text-light bg-1"></v-select>
                                </div>
                                <div class="mt-2 position-relative" style="width: 250px;">
                                    <input v-model="mods_search" type="text" class="form-control border-0 text-light bg-1" :placeholder="'Search mods'">
                                    <i class="mdi mdi-magnify"></i>
                                </div>
                                <div class="d-flex flex-column flex-fill inline-scroll mt-3" style="max-height: 300px; overflow-y: auto;">
                                    <div v-if="parameters.mods.length > 0" class="list-group list-group-small mr-1 mb-2">
                                        <h6>Selected mods</h6>
                                        <a v-for="mod in parameters.mods" :key="mod.publishedFileId" @click="selectMod(mod)" href="javascript:void(0);" class="bg-3 list-group-item d-flex justify-content-between align-items-center">
                                            {{ mod.title }}
                                            <a data-toggle="tooltip" data-placement="right" title="View Workshop page" @click.stop class="ml-2" :href="'steam://url/CommunityFilePage/' + mod.publishedFileId" style="height: 16px; width: 16px;"><i style="font-size: 1.2rem;" class="mdi mdi-open-in-new"></i></a>
                                            <div @click.stop class="checkbox ml-auto">
                                                <input :id="mod.publishedFileId" :value="mod" v-model="parameters.mods" type="checkbox" class="">
                                                <label :for="mod.publishedFileId" class=""></label>
                                            </div>
                                        </a>
                                    </div>
                                    <div v-if="mods_filtered.length > 0" class="list-group list-group-small mr-1">
                                        <h6>Available mods</h6>
                                        <a v-for="mod in mods_filtered" :key="mod.publishedFileId" @click="selectMod(mod)" href="javascript:void(0);" class="bg-3 list-group-item d-flex justify-content-between align-items-center">
                                            {{ mod.title }}
                                            <a data-toggle="tooltip" data-placement="right" title="View Workshop page" @click.stop class="ml-2" :href="'steam://url/CommunityFilePage/' + mod.publishedFileId" style="height: 16px; width: 16px;"><i style="font-size: 1.2rem;" class="mdi mdi-open-in-new"></i></a>
                                            <div @click.stop class="checkbox ml-auto">
                                                <input :id="mod.publishedFileId" :value="mod" v-model="parameters.mods" type="checkbox" class="">
                                                <label :for="mod.publishedFileId" class=""></label>
                                            </div>
                                        </a>
                                    </div>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" @click="close">Cancel</button>
                                <button type="button" class="btn btn-primary" @click="launchOffline">Launch</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<script>
    import { EventBus } from './../event-bus.js';

    // Load remote so we can access electron processes
    const remote = require('electron').remote;
    // Load FileSystem
    const fs = require('fs-extra');
    const path = require('path');
    const config = JSON.parse(fs.readFileSync(path.join(remote.app.getAppPath(), '/config.json')));
    // Load request
    const request = require('request');
    const unzipper = require('unzipper');

    const log = require('electron-log');

    export default {
        data () {
            return {
                show: false,
                installing: false,
                playing_offline: false,
                parameters: {
                    mods: [],
                    mission: 'DayZCommunityOfflineMode.ChernarusPlus',
                },
                missions: ['DayZCommunityOfflineMode.ChernarusPlus'],
                mods_search: '',
            }
        },
        watch : {
            mods_filtered() {
                $(".tooltip").tooltip("hide");
            },
        },
        computed: {
            mods_filtered() {
                let sorted = this.mods.filter(mod => {
                    return mod.title.toLowerCase().replace(/\W/g, '').includes(this.mods_search.toLowerCase().replace(/\W/g, '')) && !this.isSelectedMod(mod);
                }).sort((a, b) => {
                    var textA = a.title.toUpperCase();
                    var textB = b.title.toUpperCase();
                    return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
                });
                return sorted;
            },
            mods() {
                return this.$store.getters.mods;
            },
        },
        methods: {
            open() {
                this.show = true;
            },
            close() {
                this.show = false;
                this.parameters.mods = [];
                this.mods_search = '';
            },
            toggle() {
                this.show = !this.show;
            },
            selectMod(mod) {
                if (this.parameters.mods.filter(m => m.publishedFileId == mod.publishedFileId).length == 0) {
                    this.parameters.mods.push(mod);
                } else {
                    let index = this.parameters.mods.findIndex((m) => {
                        return m.publishedFileId == mod.publishedFileId;
                    });
                    if (index !== -1) this.parameters.mods.splice(index, 1);
                }
            },
            isSelectedMod(mod) {
                return this.parameters.mods.filter(m => m.publishedFileId == mod.publishedFileId).length > 0;
            },
            getMissions() {
                let dir = this.$parent.options.dayz_path + '\\Missions';
                fs.readdir(dir, (err, files) => {
                    if (err) {
                        log.error(err);
                        return;
                    } else if (files) {
                        files.forEach(file => {
                            if (file.includes('DayZCommunityOfflineMode') && file !== this.missions[0]) {
                                this.missions.push(file);
                            }
                        });
                    }
                });
            },
            renameBattleye(e) {
                let battleeye_dir = this.$parent.options.dayz_path + '\\BattlEye';
                let dayz_path = this.$parent.options.dayz_path + "\\" + config.dayz_exe;

                let dir_from = null;
                let dir_to = null;
                if (fs.existsSync(battleeye_dir + '.disabled') && e !== 'open') {
                    dir_from = battleeye_dir + '.disabled';
                    dir_to = battleeye_dir;
                } else {
                    dir_from = battleeye_dir;
                    dir_to = battleeye_dir + '.disabled';
                }
                if ((fs.existsSync(battleeye_dir + '.disabled') && e == 'close') || (!fs.existsSync(battleeye_dir + '.disabled') && e == 'open')) {
                    fs.rename(dir_from, dir_to, (err) => {
                        if (err) throw err;
                        log.info('Renamed ' + dir_from);
                    });
                }

                let exe_from = null;
                let exe_to = null;
                if (fs.existsSync(dayz_path + '.disabled') && e !== 'open') {
                    exe_from = dayz_path + '.disabled';
                    exe_to = dayz_path;
                } else {
                    exe_from = dayz_path;
                    exe_to = dayz_path + '.disabled';
                }
                if ((fs.existsSync(dayz_path + '.disabled') && e == 'close') || (!fs.existsSync(dayz_path + '.disabled') && e == 'open')) {
                    fs.rename(exe_from, exe_to, (err) => {
                        if (err) throw err;
                        log.info('Renamed ' + exe_from);
                    });
                }
            },
            downloadOffline: async function() {
                return new Promise((resolve, reject) => {
                    let dir = this.$parent.options.dayz_path + '\\Missions';
                    let file_path = dir + '\\OfflineMode.zip';
                    let file = fs.createWriteStream(file_path);
                    let path = dir + '\\temp';
                    let mission_name = 'DayZCommunityOfflineMode.ChernarusPlus';

                    if (!fs.existsSync(dir + '\\' + mission_name)) {
                        this.installing = true;
                        let download = function() {
                            return new Promise((resolve, reject) => {
                                let stream = request({
                                    uri: 'https://github.com/Arkensor/DayZCommunityOfflineMode/archive/master.zip',
                                })
                                .pipe(file)
                                .on('finish', () => {
                                    log.info('Finished downloading Arkensor/DayZCommunityOfflineMode');
                                    resolve();
                                })
                                .on('error', (error) => {
                                    reject(error);
                                })
                            })
                            .catch(error => {
                                log.error('Something happened: ' + error);
                            });               
                        }

                        download().then(() => {
                            let stream = fs.createReadStream(file_path).pipe(unzipper.Extract({ path: path }));
                            stream.on('close', () => {
                                fs.rename(path + '\\DayZCommunityOfflineMode-master\\Missions\\' + mission_name, dir + '\\' + mission_name, (err) => {
                                    if (err) throw err;
                                    fs.remove(path, err => {
                                        if (err) throw err;
                                        fs.unlink(file_path, err => {
                                            resolve();
                                            log.info("Installed " + mission_name);
                                        });
                                    });
                                });
                            });
                        });
                    } else {
                        log.info("Offline mode already installed");
                        resolve();
                    }
                });
            },
            launchOffline() {
                this.downloadOffline().then(() => {
                    let parameters = [
                        '-mission=.\\Missions\\' + this.parameters.mission,
                        '-nosplash',
                        '-noPause',
                        '-noBenchmark',
                        '-filePatching',
                        '-doLogs',
                        '-scriptDebug=true',
                    ];

                    if (this.parameters.mods.length > 0) {
                        parameters.push('-mod=' + this.parameters.mods.map((mod) => {
                            return config.workshop_dir + '/@' + mod.title.replace(/\W/g, '');
                        }).join(';'));
                    }

                    this.bootOffline(parameters);
                });
            },
            bootOffline(parameters) {
                let dir = this.$parent.options.dayz_path + '\\Missions';
                let mission_name = parameters.mission;
                let mission_dir = dir + mission_name;

                this.installing = false;
                this.playing_offline = true;
                log.info('Booting offline mode with parameters: ' + parameters.join(', '));
                this.renameBattleye('open');
                fs.remove(mission_dir + '\\storage_-1', (err) => {
                    if (err) throw err;
                    log.info("Removed offline mission storage");
                });
                this.$store.dispatch('editRPCState', 'Playing offline');
                var child = require('child_process').execFile;
                child(this.$parent.options.dayz_path + '\\DayZ_x64.exe', parameters, (err, data) => {
                    this.$store.dispatch('editRPCState', 'Browsing servers');
                    this.$store.dispatch('editRPCDetails', {type: 'remove'});
                    this.$store.dispatch('Servers/setPlayingServer', {});
                    this.renameBattleye('close');
                    this.playing_offline = true;
                    log.info('Game closed');
                    if (err) {
                        log.error(err);
                        return;
                    }
                });
            }
        },
        created: function() {
            EventBus.$on('openOffline', (payload) => {
                this.open();
            });
            EventBus.$on('loadOfflineMods', (payload) => {
                payload.forEach((mod) => {
                    let find = this.mods.find(e => {
                        return e.publishedFileId == mod.id;
                    });
                    if (find) this.parameters.mods.push(find);
                });
            });
            this.getMissions();
        },
    }
</script>