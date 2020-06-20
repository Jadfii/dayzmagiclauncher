<template>
    <transition name="fade-scale-in">
        <div v-if="show" class="fixed flex w-screen h-screen z-20">
            <div class="hidden fixed w-full h-full blur"></div>
            <div class="pt-32 px-24 w-3/4 h-full text-white z-30">
                <div class="flex flex-col">
                    <div class="inline-flex items-center">
                        <img v-show="highlighted_server.country_code !== null" :src="$parent.getCountryFlag(highlighted_server.country_code)" class="h-3 mr-3 rounded-sm">
                        <h1 class="text-lg">{{ highlighted_server.name }}</h1>
                    </div>
                    <div class="inline-flex mt-8 pb-8 mb-8 border-b border-gray-800 border-opacity-75">
                        <div class="inline-flex items-center">
                            <span class="text-3xl">{{ highlighted_server.players }}<span v-show="highlighted_server.queue" class="">+{{ highlighted_server.queue }}</span><span>/{{ highlighted_server.max_players }}</span></span>
                            <span class="ml-5 w-16 text-sm leading-none">Players online</span>
                        </div>
                        <div class="inline-flex items-center ml-10">
                            <span class="text-3xl">{{ highlighted_server.ping ? highlighted_server.ping : '999' }}</span>
                            <span class="ml-5 w-16 text-sm leading-none">Server ping</span>
                        </div>
                    </div>
                    <div class="inline-flex text-sm">
                        <div class="w-3/12">
                            <div class="inline-flex w-full">
                                <span class="uppercase">Perspective:</span>
                                <span class="text-right ml-auto">{{ highlighted_server.first_person ? '1st' : '3rd' }}</span>
                            </div>
                            <div class="inline-flex w-full mt-1">
                                <span class="uppercase">Time:</span>
                                <span class="text-right ml-auto">{{ highlighted_server.time }}</span>
                            </div>
                            <div class="inline-flex w-full mt-1">
                                <span class="uppercase">Password:</span>
                                <span class="text-right ml-auto">{{ highlighted_server.password ? 'Yes' : 'No' }}</span>
                            </div>
                            <div class="inline-flex w-full mt-1">
                                <span class="uppercase">Version:</span>
                                <span class="text-right ml-auto">{{ highlighted_server.version }}</span>
                            </div>
                        </div>
                        <div class="w-3/12 ml-6 pl-6 border-l border-gray-800 border-opacity-75">
                            <div class="inline-flex w-full">
                                <span class="uppercase">IP address:</span>
                                <span class="text-right ml-auto">{{ highlighted_server.ip }}</span>
                            </div>
                            <div class="inline-flex w-full mt-1">
                                <span class="uppercase">Game port:</span>
                                <span class="text-right ml-auto">{{ highlighted_server.game_port }}</span>
                            </div>
                            <div class="inline-flex w-full mt-1">
                                <span class="uppercase">Query port:</span>
                                <span class="text-right ml-auto">{{ highlighted_server.query_port }}</span>
                            </div>
                            <div class="inline-flex w-full mt-1">
                                <span class="uppercase">Region:</span>
                                <span v-if="highlighted_server.country_code" class="text-right ml-auto">{{ $countries.getName(highlighted_server.country_code.toLowerCase(), 'en') }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="pt-32 px-24 w-1/4 h-full text-white z-30">
                <div class="flex flex-col">
                    <h2>Mods</h2>
                    <p v-for="(mod, index) in highlighted_server.mods" :key="index">{{ mod.name }}</p>
                </div>
            </div>
        </div>
    </transition>
</template>

<style lang="scss">
.blur
{
    background-color: rgba(0, 0, 0, 0.35);
    -webkit-backdrop-filter: blur(5px);
    backdrop-filter: blur(5px);
}
</style>

<script>
import { EventBus } from './../event-bus.js';
const {clipboard} = require('electron');

// Load moment.js
const moment = require('moment');
const humanizeDuration = require('humanize-duration');

export default
{
    data ()
    {
        return {
            show: false,
            friendsServers: [],
			server_mods: [],
        }
    },
    watch:
    {
        show(val)
        {
            let msg = 'openOverlay';
            if (val === false) msg = 'closeOverlay';
            EventBus.$emit(msg);
        },
        highlighted_server(val)
        {
            this.server_mods = val.mods;
            if (val && val.mods)
            {
                let new_mods = val.mods.filter(mod => this.mods.every(mod2 => mod.id.toString() !== mod2.publishedFileId.toString()));
                let mods = this.mods.filter((mod) =>
                {
                    return val.mods.filter((mod2) =>
                    {
                        return mod.publishedFileId.toString() == mod2.id.toString();
                    }).length > 0;
                });
                this.$parent.greenworks.ugcGetItemDetails(new_mods.map(mod => mod.id.toString()), (items) =>
                {
                    mods.unshift(...items);
                }, (err) =>
                {
                    if (err) log.error(err);
                });
                this.server_mods = mods;
            }

            if (val.name) this.$log.info(`Viewing server ${val.name}`);
        }
    },
    computed: {
        highlighted_server()
        {
            return this.$store.getters['Servers/highlighted_server'];
        },
        friends()
        {
            return this.$store.getters.friends;
        },
        servers()
        {
            return this.$store.getters['Servers/servers'];
		},
		fav_servers()
		{
			return this.$store.getters.store.favourited_servers;
		},
        mods()
        {
            return this.$store.getters.mods;
        },
        filters()
        {
            return this.$store.getters['Servers/filters'];
        },
        should_show()
        {
            return Object.keys(this.highlighted_server).length > 0;
        },
        friendsPlaying()
        {
            let server = this.friendsServers.find((server) =>
            {
                return server.gameserverip == this.highlighted_server.ip + ':' + this.highlighted_server.game_port;
            });
            if (typeof server !== 'undefined')
            {
                return server.friends;
            }
            else
            {
                return [];
            }
        },
    },
    methods: {
        open()
        {
            this.show = true;
        },
        close()
        {
            this.show = false;
            this.$store.dispatch('Servers/setHighlightedServer', {});
        },
        toggle()
        {
            this.show = !this.show;
		},
        load()
        {
			this.loadServer(this.highlighted_server);
        },
        play()
        {
			this.playServer(this.highlighted_server);
        },
        isSubscribedMod(id)
        {
            return this.mods.some(mod => mod.publishedFileId.toString() == id.toString());
        },
        copyToClip(content)
        {
            clipboard.writeText(content);
        },
        loadOfflineMods(server)
        {
            this.close();
            setTimeout(() =>
            {
                EventBus.$emit('loadOfflineMods', server.mods);
                EventBus.$emit('openOffline');
            }, 100);
            this.$router.push('play');
        },
        normaliseTime(acceleration)
        {
            let acc = acceleration.split(', ').map(e => parseFloat(e));
            return {
                day: humanizeDuration(Math.floor(12 / acc[0] * 60000 * 60)),
                night: humanizeDuration(Math.floor(12 / acc[0] / acc[1] * 60000 * 60)),
            };
        },
        normaliseMap(map)
        {
            if (!map) return '';
            
            let find = Object.values(this.$DayZMap).find(m => map.toLowerCase().includes(m.id.toLowerCase()));
            return find ? find.name : map;
        },
        detectNight(server)
        {
            let server_time = moment(server.time, 'hh:mm');
            return server_time.isBetween(moment('20:00', 'hh:mm'), moment().endOf('day')) || server_time.isBetween(moment().startOf('day'), moment('05:00', 'hh:mm'));
        },
        getNetworkIcon(ping)
        {
            let num = 1;
            let colour = 'danger';
            if (ping < 50)
            {
                num = 4;
                colour = 'success';
            }
            else if (50 <= ping && ping < 90)
            {
                num = 3;
                colour = 'success';
            }
            else if (90 <= ping && ping < 140)
            {
                num = 2;
                colour = 'warning';
            }
            return `mdi-network-strength-${num} text-${colour}`;
		},
		isFavourite(server)
		{
			return this.fav_servers.filter(e =>
			{
				return e.ip == server.ip && e.port == server.query_port;
			}).length > 0;
		},
		favouriteServer(server)
		{
			this.$store.dispatch('editFavouritedServer', server);
		},
		loadServer(server)
		{
			this.$parent.$refs.join_server.joinServer(server, false);
		},
		playServer(server)
		{
			this.$parent.$refs.join_server.joinServer(server);
		},
    },
    created()
    {
        this.$store.subscribe((mutation, state) =>
        {
            if (mutation.type == 'Servers/setHighlightedServer' && Object.keys(mutation.payload).length > 0)
            {
                this.open();
            }
        });
        EventBus.$on('friendsServers', (payload) =>
        {
            this.friendsServers = payload;
        });
        EventBus.$on('closeOverlay', (payload) =>
        {
            this.close();
        });

        document.addEventListener('keyup', (e) =>
        {
            if (e.keyCode == 27)
            {
                this.close();
            }
        });
    },
}
</script>