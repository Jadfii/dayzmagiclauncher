<template>
    <div v-show="!overlay" class="flex flex-col h-full flex-1 pb-6">
        <div class="h-56 flex flex-col justify-center border-b border-gray-800 border-opacity-75">
            <h1 class="text-white font-bold uppercase text-2xl">Welcome back, {{ $parent.profile.name }}.</h1>
            <p class="text-primary text-sm">Late night gaming?</p>
        </div>
        <div class="flex flex-row mt-8 pr-4 transition-all duration-1000 h-full flex-1 text-white">
            <div class="w-3/5 h-full flex flex-col pr-8">
                <div class="flex-1 flex flex-row pb-8 mb-8 border-b border-gray-800 border-opacity-75">
                    <div class="w-full flex-shrink-0">
                        <h2 class="px-4 mb-1">Friends</h2>
                        <div v-if="$parent.online_friends.length > 0" class="flex flex-col">
                            <a v-for="(friend, index) in $parent.online_friends.slice(0, 4)" :key="index" :href="'steam://url/SteamIDPage/' + friend.steamid" class="flex items-center h-16 pl-4 relative rounded bg-hover break-words">
                                <img class="w-8 h-8 rounded-full mr-4" :src="$parent.getFriendAvatar(friend.steamid)">
                                <div class="flex flex-col w-full truncate overflow-hidden">
                                    <span>{{ friend.name }}</span>
                                    <span v-if="$parent.getFriendServer(friend)" class="text-xs"><span class="text-gray-500">Playing</span> {{ $parent.getFriendServer(friend).name }}</span>
                                </div>
                                <a @click="$parent.joinFriendServer(friend)" class="w-16 h-full flex flex-shrink-0 items-center justify-center bg-hover" href="javascript:void(0);">
                                    <ion-icon name="play"></ion-icon>
                                </a>
                            </a>
                        </div>
                        <p v-else class="px-4 text-gray-500">No friends currently playing.</p>
                    </div>
                </div>
                <div class="flex-1 w-full overflow-y-hidden relative flex flex-col">
                    <table class="flex font-light">
                        <tbody class="flex flex-col w-full text-sm">
                            <tr v-for="(server, index) in servers"  :key="index" class="h-12 relative rounded  w-full flex-shrink-0">
                                <a @click="" class="flex flex-row items-center h-full pl-4 bg-hover" href="javascript:void(0);">
                                    <td class="pr-4 w-5/12 truncate overflow-hidden">
                                        <span>{{ server.name }}</span>
                                    </td>
                                    <td class="px-4 w-2/12">
                                        <span>{{ server.map }}</span>
                                    </td>
                                    <td class="px-4 w-1/12">
                                        <span>{{ `${server.players}/${server.max_players}` }}</span>
                                    </td>
                                    <td class="px-4 w-1/12">
                                        <span>{{ server.time }}</span>
                                    </td>
                                    <td class="h-full w-12 ml-auto">
                                        <a @click="$parent.$refs.join_server.joinServer(server)" class="w-full h-full flex flex-shrink-0 items-center justify-center bg-hover" href="javascript:void(0);">
                                            <ion-icon name="play"></ion-icon>
                                        </a>
                                    </td>
                                </a>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="w-2/5 overflow-y-hidden h-full text-white flex flex-col">
                <h2 class="px-4 mb-1">News</h2>
                <div v-if="dayz_news.length > 0" class="flex flex-col overflow-y-scroll pr-4">
                    <a v-for="(news, index) in dayz_news" :key="index" @click="$parent.openURL(news.external_url)" class="flex flex-col py-2 px-4 rounded bg-hover" href="javascript:void(0);">
                        <h4 class="uppercase font-semibold">{{ news.title }}</h4>
                        <span class="text-sm text-gray-500">{{ news.excerpt }}</span>
                    </a>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
const log = require('electron').remote.getGlobal('log');

export default
{
    name: 'Home',
	props:
	{
      	overlay: Boolean,
    },
    data()
    {
        return {
            dayz_news: [],
        }
    },
    computed: 
    {
        greenworks()
        {
            return this.$store.getters.greenworks;
        },
        servers()
        {
            return this.$parent.servers.slice(0, 4);
        },
    },
    methods:
    {
        getNews()
        {
            this.$http.get(this.$parent.config.dayz_news_url).then((res) =>
            {
                this.dayz_news = res.data;
            }).catch(log.error);
        },
    },
    created()
    {
        this.getNews();
    }
}
</script>