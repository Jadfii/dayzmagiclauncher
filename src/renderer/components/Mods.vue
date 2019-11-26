<template>
    <div class="d-flex flex-column flex-fill bg-4-blur rounded pb-5 mb-5">
        <div class="d-flex position-relative flex-shrink-0" style="height: 60px;">
            <div class="flex-fill px-4">
                <div class="d-flex flex-row h-100 w-100">
                    <div class="h-100 d-flex align-items-center mr-4 border-active-bottom">
                        <h6 class="m-0">Filters</h6>
                    </div>
                    <div class="h-100 d-flex align-items-center mr-2">
                        <div class="position-relative" style="width: 250px;">
                            <input @input="handleSearch" :value="filters.search" type="text" class="form-control border-0 text-light bg-1" :placeholder="'Search ' + route_name">
                            <i class="mdi mdi-magnify"></i>
                        </div>
                    </div>
                    <div class="h-100 d-flex align-items-center ml-auto">
                        <button @click="unsubscribeAll" class="btn btn-secondary border-0 bg-1 px-3 font-weight-500 mr-2" type="button">
                            <i class="mdi mdi-playlist-remove"></i> Unsubscribe from all mods
                        </button>
                        <button @click="reinstallAll" class="btn btn-secondary border-0 bg-1 px-3 font-weight-500 mr-2" type="button">
                            <i class="mdi mdi-download-multiple"></i> Reinstall all mods
                        </button>
                        <button @click="$store.dispatch('getMods')" class="btn btn-secondary border-0 bg-1 px-3 font-weight-500" type="button">
                            <i class="mdi mdi-refresh"></i> Refresh {{ route_name }}
                        </button>
                    </div> 
                </div>           
            </div>
        </div>
        <div class="d-flex flex-column flex-fill px-4"  style="z-index: 2;">
            <p class="mt-3">Showing {{ filteredMods ? filteredMods.length : 0 }} {{ route_name }}.</p>
            <p><a href="steam://open/downloads" class="no-underline">Check download status <i class="mdi mdi-open-in-new"></i></a></p>
            <ul class="list-group list-group-small d-flex flex-fill" ref="mods" id="mods">
                <div class="list-group-item-heading">
                    <div class="row" style="font-size: 0.95rem; padding: 0 0.75rem;">
                        <div class="col-sm-5 d-flex flex-row align-items-center"><a @click="sortMods" sort="name" class="no-underline" href="javascript:void(0);">Name</a><i v-show="sorts.active_sort == 'name'" style="font-size: 18px;" class="mdi" :class="{ 'mdi-chevron-down': sorts.sort_type == 'desc',  'mdi-chevron-up': sorts.sort_type !== 'desc' }"></i></div>
                        <div class="col-sm-2 d-flex flex-row align-items-center"><a @click="sortMods" sort="last_updated" class="no-underline" href="javascript:void(0);">Last updated</a><i v-show="sorts.active_sort == 'last_updated'" style="font-size: 18px;" class="mdi" :class="{ 'mdi-chevron-down': sorts.sort_type == 'desc',  'mdi-chevron-up': sorts.sort_type !== 'desc' }"></i></div>
                        <div class="col-sm-2 d-flex flex-row align-items-center">Status</div>
                        <div class="col-sm-2 d-flex flex-row align-items-center">Size</div>
                        <div class="col-sm-1 d-flex flex-row align-items-center"></div>
                    </div>
                </div>
                <li v-for="(mod, key) in filteredMods" :key="key" class="list-group-item list-group-item-action flex-column align-items-start">
                    <div class="row align-items-center justify-content-center">
                        <div class="col-sm-5">
                            <div class="d-flex overflow-hidden">
                                <h6 class="m-0">{{ mod.title }}</h6>
                                <a :href="'steam://url/CommunityFilePage/' + mod.publishedFileId" class="ml-2" style="height: 16px; width: 16px;">
                                    <i data-toggle="tooltip" data-placement="top" title="Open workshop page" class="mdi mdi-open-in-new" style="font-size: 16px; line-height: 16px;"></i>
                                </a>
                            </div>
                        </div>
                        <div class="col-sm-2">{{ moment.unix(mod.timeUpdated).calendar() }}</div>
                        <div class="col-sm-2">{{ getItemState(mod) }}</div>
                        <div class="col-sm-2">{{ filesize(mod.fileSize) }}</div>
                        <div class="col-sm-1 d-flex justify-content-end">
                            <a @click="verifyMod(mod)" style="height: 24px; width: 24px;" href="javascript:void(0);">
                                <i data-toggle="tooltip" data-placement="top" title="Verify mod" class="mdi mdi-update" style="font-size: 24px; line-height: 24px;"></i>
                            </a>
                            <a @click="reinstallMod(mod)" style="height: 24px; width: 24px;" href="javascript:void(0);">
                                <i data-toggle="tooltip" data-placement="top" title="Reinstall mod" class="mdi mdi-download" style="font-size: 24px; line-height: 24px;"></i>
                            </a>
                            <a @click="unsubscribeMod(mod)" style="height: 24px; width: 24px;" href="javascript:void(0);">
                                <i data-toggle="tooltip" data-placement="top" title="Unsubscribe from mod" class="mdi mdi-file-remove-outline" style="font-size: 24px; line-height: 24px;"></i>
                            </a>
                        </div>
                    </div>    
                </li>
            </ul>
        </div> 
    </div>
</template>

<script>
    // load config
    const fs = require('fs-extra');
    const remote = require('electron').remote;
    const path = require('path');
    const config = JSON.parse(fs.readFileSync(path.join(remote.app.getAppPath(), '/config.json')));
    // Load Vue
    import Vue from 'vue';
    // Load moment.js
    const moment = require('moment');
    moment.updateLocale('en', {
        calendar: {
            sameDay: '[Today]',
            nextDay: '[Tomorrow]',
            nextWeek: 'dddd',
            lastDay: '[Yesterday]',
            lastWeek: '[Last] dddd',
            sameElse: 'DD/MM/YYYY'
        }
    });
    Vue.prototype.moment = moment;
    // Load filesize
    const filesize = require('filesize');
    Vue.prototype.filesize = filesize;

    const log = require('electron-log');

    export default {
        data () {
        return {
            filters: {
                search: '',
            },
            sorts: {
                active_sort: 'last_updated',
                sort_type: 'desc',
            },
        }
        },
        watch: {
            mods() {
                this.mods.forEach((mod) => {
                    // console.log(this.isUpdatedMod);
                });
            },
        },
        computed: {
            mods() {
                return this.$store.getters.mods;
            },
            greenworks() {
                return this.$store.getters.greenworks;
            },
            route_name() {
                return this.$route.name.toLowerCase();
            },
            filteredMods() {
                if (this.mods.length > 0) {
                    let sorted = this.mods.filter(mod => {
                        return mod.title.toLowerCase().includes(this.filters.search.toLowerCase());
                    });
                    var sorted_mods;
                    switch (this.sorts.active_sort) {
                        case 'name':
                            var sort= 'title';
                            switch (this.sorts.sort_type) {
                                case 'asc':
                                    sorted_mods = sorted.sort(function(a, b) {
                                        var textA = a[sort].toUpperCase();
                                        var textB = b[sort].toUpperCase();
                                        return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
                                    }).reverse();                     
                                    break;
                                case 'desc':
                                    sorted_mods = sorted.sort(function(a, b) {
                                        var textA = a[sort].toUpperCase();
                                        var textB = b[sort].toUpperCase();
                                        return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
                                    });
                                    break;
                                default:
                                    break;
                            }
                            break;
                        case 'last_updated':
                            switch (this.sorts.sort_type) {
                                case 'desc':
                                    sorted_mods = sorted.sort(function(a, b) {
                                        return (a.timeUpdated > b.timeUpdated) ? -1 : (a.timeUpdated < b.timeUpdated) ? 1 : 0;
                                    });                   
                                    break;
                                case 'asc':
                                    sorted_mods = sorted.sort(function(a, b) {
                                        return (a.timeUpdated > b.timeUpdated) ? -1 : (a.timeUpdated < b.timeUpdated) ? 1 : 0;
                                    }).reverse();
                                    break;                  
                                default:
                                    break;
                            }
                            break;
                        default:
                            sorted_mods = sorted;
                        break;
                    }     
                    
                    return sorted_mods;
                }        
            },
        },
        methods: {
            handleSearch(e) {
                Vue.set(this.filters, 'search', e.target.value);
            },
            isUpdatedMod(mod) {
                let workshop_path = this.$parent.options.dayz_path + '/../../workshop/content/' + config.appid + '/';
                let modified = moment(fs.statSync(workshop_path + mod.publishedFileId).mtime);
                return modified.isSameOrAfter(mod.timeUpdated);
            },
            getItemState(mod) {
                let state = this.greenworks.ugcGetItemState(mod.publishedFileId);
                switch (state) {
                    case 5:
                        return 'Updated';
                        break;
                    case 13:
                        return 'Update required';
                    case 53:
                        return 'Downloading update';
                        break;
                
                    default:
                        return state;
                        break;
                }
            },
            sortMods(e) {
                var sort = e.target.getAttribute('sort');
                if (this.sorts.sort_type == '' || this.sorts.active_sort !== sort) {
                    Vue.set(this.sorts, 'sort_type', 'desc');
                    Vue.set(this.sorts, 'active_sort', sort);
                } else if (this.sorts.sort_type == 'desc') {
                    Vue.set(this.sorts, 'sort_type', 'asc');
                    Vue.set(this.sorts, 'active_sort', sort);
                } else {
                    Vue.set(this.sorts, 'sort_type', '');
                    Vue.set(this.sorts, 'active_sort', '');
                }
            },
            verifyMod(mod) {
                return this.greenworks.ugcDownloadItem(mod.publishedFileId.toString());
            },
            unsubscribeMod(mod) {
                this.greenworks.ugcUnsubscribe(mod.publishedFileId.toString(), () => {
                    log.info('Unsubscribed from mod ' + mod.title);
                    this.$store.dispatch('removeMod', mod);
                }, (err) => {
                    log.error(err);
                });
            },
            reinstallMod(mod) {
                let workshop_path = this.$parent.options.dayz_path + '/../../workshop/content/' + config.appid + '/';
                fs.remove(workshop_path + mod.publishedFileId, (err) => {
                    if (err) return log.error(err);

                    if (this.verifyMod(mod)) {
                        log.info('Reinstalled mod ' + mod.title);
                    }
                });
            },
            unsubscribeAll() {
                let mods = JSON.parse(JSON.stringify(this.mods));
                mods.forEach((mod) => {
                    this.unsubscribeMod(mod);
                });
                log.info('Unsubsribed from all mods');
            },
            reinstallAll() {
                let mods = JSON.parse(JSON.stringify(this.mods));
                mods.forEach((mod) => {
                    this.reinstallMod(mod);
                });
                log.info('Reinstalled from all mods');
            },
        },
        created: function() {
            setTimeout(() => {
                this.isUpdatedMod(this.mods[1]);
            }, 3000);
        }
    }
</script>