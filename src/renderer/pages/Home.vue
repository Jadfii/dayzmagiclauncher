<template>
	<div class="flex flex-col h-full w-full relative">
		<div class="">
			<div class="text-white">
				<h1 class="font-bold leading-4 text-3xl">Welcome back, {{ $parent.profile.name }}.</h1>
				<p class="mt-3 mb-3 text-lg">{{ getMessage() }}</p>
				<Button @click.native="$router.push('servers')" label="Go to servers" type="primary"></Button>
				<!--<a href="magiclauncher://test">Test</a>-->
			</div>
			<div class="flex flex-wrap flex-1 mt-12 justify-between overflow-y-hidden">
				<FriendListItem v-for="(friend, index) in friends" :key="index" :friend="friend" :home="true" :class="{'mt-3': index > 1, 'ml-3': index % 2 == 1}" class=""></FriendListitem>
			</div>
		</div>
	</div>
</template>

<script>
import FriendListItem from './../components/FriendListItem';

export default
{
	name: 'Home',
	components:
	{
		FriendListItem
	},
	data()
	{
		return {
			dayz_news: [],
		}
	},
	watch:
	{
		'$parent.online_friends':
		{
			immediate: true,
			handler(val, old_val)
			{
			}
		}
	},
	computed: 
	{
		servers()
		{
			return this.$parent.servers ? this.$parent.servers.slice(0, 4) : [];
		},
		friends()
		{
			return this.$parent.online_friends.slice(0, 6);
		}
	},
	methods:
	{
		async getNews()
		{
			try
			{
				let res = await this.$http.get(this.$parent.config.dayz_news_url);
				this.dayz_news = res.data;
			}
			catch(err)
			{
				this.$log.error(err);
			}
		},
		getMessage()
		{
			return `There are currently ${this.$parent.app.num_players} players on DayZ.`;

			let messages = Object.values(this.$WelcomeMessages);
			return messages[Math.floor(Math.random() * messages.length)];
		}
	},
	created()
	{
		this.getNews();
	}
}
</script>