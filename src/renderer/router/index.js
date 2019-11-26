import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  mode: 'hash',
  routes: [
    {
      path: '/',
      redirect: '/play'
    },
    {
      path: '/play',
      name: 'Play',
      component: require('@/components/Play').default,
      props: {
        rpc_state: 'On the home page',
      }
    }, 
    {
      path: '/servers',
      name: 'Servers',
      component: require('@/components/Servers').default,
      props: {
        rpc_state: 'Browsing servers',
      }
    },
    {
      path: '/mods',
      name: 'Mods',
      component: require('@/components/Mods').default,
      props: {
        rpc_state: 'Browsing mods',
      }      
    },
    {
      path: '/settings',
      name: 'Settings',
      component: require('@/components/Settings').default,
      props: {
        rpc_state: 'Editing settings',
      }      
    },
    /*{
      path: '/',
      name: 'magic-launcher',
      component: require('@/components/MagicLauncher').default
    },    
    {
      path: '*',
      redirect: '/'
    }*/
  ]
})
