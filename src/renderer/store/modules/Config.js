const fs = require('fs-extra');
const remote = require('electron').remote;
const path = require('path');
const config = JSON.parse(fs.readFileSync(path.join(remote.app.getAppPath(), '/config.json')));

const state = {
	config: config,
};
  
const mutations = {
}

const actions = {
}

const getters = {
	config(state)
	{
		return state.config;
	},
}

export default {
	state,
	mutations,
	actions,
	getters
}