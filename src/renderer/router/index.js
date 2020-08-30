import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router(
{
	mode: 'hash',
	routes:
	[
		{
			path: '/',
			redirect: '/home'
		},
		{
			path: '/home',
			name: 'Home',
			component: require('@/pages/Home').default,
			meta:
			{
				rpc_state: 'On the home page',
				description: 'Keep up to date with the latest DayZ news, browse your recent servers or join one of your friends.'
			}
		}, 
		{
			path: '/servers',
			name: 'Servers',
			component: require('@/pages/Servers').default,
			meta:
			{
				rpc_state: 'Browsing servers',
				description: 'Browse the DayZ server list. Click on a server to view more details.'
			}
		},
		{
			path: '/mods',
			name: 'Mods',
			component: require('@/pages/Mods').default,
			meta:
			{
				rpc_state: 'Browsing mods',
				description: 'View your subscribed mods on the Steam Workshop. Verify, repair or unsubscribe from mods here. Click on a mod to view options.'
			}
		},
		{
			path: '/settings',
			name: 'Settings',
			redirect: '/settings/game',
			component: require('@/pages/Settings').default,
			children: [
				{
					path: 'game',
					name: 'Game',
					component: require('@/pages/settings/Game').default
				},
				{
					path: 'launcher',
					name: 'Launcher',
					component: require('@/pages/settings/Launcher').default
				},
				{
					path: 'debug',
					name: 'Debug',
					component: require('@/pages/settings/Debug').default
				}
			],
			meta:
			{
				rpc_state: 'Editing settings',
				description: 'Edit your launcher settings.'
			}      
		},
		{
			path: '/playground',
			name: 'Playground',
			component: require('@/pages/Playground').default,
			meta:
			{
				rpc_state: 'Setting up playground',
				description: 'Explore the world of DayZ in offline mode, with or without mods.'
			}
		},
		{
			path: '/server/:ip/:port',
			name: 'Server details',
			component: require('@/pages/ServerView').default,
			meta:
			{
				rpc_state: 'Viewing a server',
				description: 'View details for a server. Directly join, load the server mods or favourite the server here.',
				go_back: true
			}
		}
	]
})
