<template> 
</template>

<script>
  import { EventBus } from './../event-bus.js';

  // Load async
  const async = require('async');
  // Load lodash
  const _ = require('lodash');
  // Load FileSystem
  const fs = require('fs-extra');
  // load config
  const remote = require('electron').remote;
  const path = require('path');
  const config = JSON.parse(fs.readFileSync(path.join(remote.app.getAppPath(), '/config.json')));

  const log = require('electron-log');
  const child = require('child_process');
  const find = require('find-process');

  var proc;

  const trackEvent = remote.getGlobal('trackEvent');

  export default { 
    data () {
      return {
        parameters: [],
        game_running: false,
        game_process: {
          pid: null,
        },
        stop_downloads: false,
      }
    },
    watch: {
      playing_server(new_val, old_val) {
        let server = new_val ? new_val : old_val;
        server = this.servers.find(s => s.ip == server.split(':')[0] && s.query_port == server.split(':')[1]);

        if (trackEvent) {
          server = server.ip+':'+server.query_port;
          if (server && Object.keys(server).length > 0) {
            trackEvent('Server Interaction', 'Join Server', server);
          } else {
            trackEvent('Server Interaction', 'Leave Server', server);
          }
        }
      }
    },
    computed: {
      store() {
        return this.$store.getters.store;
      },
      loaded() {
        return this.$store.getters.loaded;
      },
      mods() {
        return this.$store.getters.mods;
      },
      greenworks() {
        return this.$store.getters.greenworks;
      },
      servers() {
        return this.$store.getters['Servers/servers'];
      },
      playing_server() {
        return this.$store.getters['Servers/playing_server'];
      },
      route_name() {
        return this.$route.name.toLowerCase();
      },
      app() {
        return this.$store.getters.app;
      },
    },
    methods: {
      joinServer: _.debounce(function(server_info, join = true) {
        this.parameters = []; // reset parameters
        let server = JSON.parse(JSON.stringify(server_info));
        log.info('Attempting to join server ' + server.name);

        this.grabRequiredMods(server).then(() => {
          this.addModJunctions(server.mods).then(() => {
            if (join) {
              this.parameters = [
                '-connect=' + server.ip,
                '-port=' + server.game_port
              ];          
            }

            if (server.password && join) {
              let server_password = this.store.server_passwords.find(e => {
                return server.ip == e.server.ip && (server.query_port == e.server.port || server.game_port == e.server.port)
              });
              this.$parent.$refs.prompt.prompt({
                title: 'Enter server password',
                fill: server_password && server_password.password ? server_password.password : null,
                password: true,
              }).then((data) => {
                this.parameters.push('-password=' + data);
                this.$store.dispatch('editServerPassword', {server: server, password: data});
                this.selectCharacter(server, join);
              })
              .catch((err) => {
                if (err) log.error(err);
                log.info('Password dialog cancelled');
                return;
              });
            } else {
              this.selectCharacter(server, join);
            }
          });
        }).catch((err) => {
          if (err && err.break) {
            log.info('Stopping downloads for server '+server.name);
          }
        });
      }, 1000),
      selectCharacter(server, join) {
        /* HARDCODE SERVER FOR NOW */
        if (server.name.toLowerCase().includes('dayzcore')) {
          let server_character = this.store.server_characters.find(e => {
            return server.ip == e.server.ip && (server.query_port == e.server.port || server.game_port == e.server.port);
          });
          this.$parent.$refs.select_character.prompt(server_character && server_character.character && server_character.character.length > 0 ? server_character.character : '').then(data => {
            this.parameters.push('-character=' + data);
            this.$store.dispatch('editServerCharacter', {server: server, character: data});
            this.openGame(server, join);
          }).catch(err => {
            if (err) log.error(err);
            log.info('Character selection dialog cancelled');
            return;
          });
        } else {
          this.openGame(server, join);
        }
      },
      async openGame(server, join) {
        if (server.mods.length > 0) {
          let mods_params = '-mod=';
          server.mods.forEach((mod, key, arr) => {
            let title = mod.name.replace(/\W/g, '');
            mods_params += config.workshop_dir + '/@' + title;
            if (key !== arr.length - 1) {
              mods_params += ';';
            }
          });

          this.parameters.push(mods_params);
        }

        let additional_parameters = this.store.options.parameters.split(' ').filter(p => !p.includes('-character'));
        if (additional_parameters.length > 0) this.parameters.push(additional_parameters);

        if (this.$parent.options.nick_name !== '') {
          this.parameters.push('-name=' + this.$parent.options.nick_name);
        }

        if (this.game_running) {
          this.$parent.$refs.alert.alert({
            title: 'Error',
            message: 'An instance of DayZ is already running.',
          }).catch((err) => {
            if (err) log.error(err);
          });
          return;
        }

        if (server.version !== this.app.build_id) {
          this.$parent.$refs.confirm.confirm({
            title: 'Version Discrepancy',
            message: 'Your local version ('+this.app.build_id+') does not match the server version ('+server.version+'). Would you still like to join the server?',
          }).then(() => {
            this.bootGame(server, this.parameters);
          }).catch((err) => {
            if (err) log.error(err);
            log.info('Version discrepancy rejected');
          });
          return;
        } else {
          this.bootGame(server, this.parameters);
        }
      },
      bootGame(server, parameters) {
        this.game_running = true;
        this.$store.dispatch('Servers/setPlayingServer', `${server.ip}:${server.query_port}`);
        this.$store.dispatch('editLastPlayed', server);
        this.$store.dispatch('editRPCState', 'Playing server');
        this.$store.dispatch('editRPCDetails', {type: 'add', details: server.name, time: new Date()});

        let game_path = this.$parent.options.dayz_path + "\\" + config.dayz_exe;
        parameters = parameters.filter(p => p.trim() !== '');
        log.info('Booting game from '+game_path+' with parameters '+parameters.join(','));
        proc = child.execFile(game_path, parameters, (err, data) => {
            this.$store.dispatch('editRPCState', 'Browsing servers');
            this.$store.dispatch('editRPCDetails', {type: 'remove'});
            this.$store.dispatch('Servers/setPlayingServer', null);
            this.game_running = false;
            this.quitGame();
            if (err) {
              log.error(err);
              this.$parent.$refs.alert.alert({
                title: 'Error',
                message: 'DayZ closed unexpectedly.',
              }).catch((err) => {
                if (err) log.error(err);
                return;
              });
              return;
            }
        });
        this.game_process.pid = proc.pid;
      },
      quitGame: _.debounce(function() { 
        find('name', 'DayZ_')
          .then((list) => {
            list.forEach((process) => {
              this.game_running = false;
              child.spawn("taskkill", ["/pid", process.pid, '/f', '/t']);
            });
          });
      }, 1000),
      checkRequiredMods(server) {
        return server.mods.filter(mod => this.mods.every(mod2 => mod.id.toString() !== mod2.publishedFileId));
      },
      addModJunctions(mods) {
        return new Promise((resolve, reject) => {
          let workshop_path = this.$parent.options.dayz_path + '/../../workshop/content/' + config.appid + '/';
          let launcher_workshop_path = this.$parent.options.dayz_path + '/' + config.workshop_dir + '/@';

          // Create directory to store mods
          if (!fs.existsSync(this.$parent.options.dayz_path + '/' + config.workshop_dir)) fs.mkdir(this.$parent.options.dayz_path + '/' + config.workshop_dir);
          async.eachSeries(mods, (mod, callback) => {
            let title = mod.name.replace(/\W/g, '');
            if (!fs.existsSync(launcher_workshop_path + title) && fs.existsSync(workshop_path + mod.id)) {
              fs.symlink(workshop_path + mod.id, launcher_workshop_path + title, 'junction', (err) => {
                if (typeof err !== 'undefined' && err !== null) {
                  log.error(err);
                }
                callback();
              });
            } else {
              callback();
            }
          }, (err) => {
            if (err) log.error(err);
            resolve();
          });
        });
      },
      grabRequiredMods(server) {
        return new Promise((resolve, reject) => {
          let mods = this.checkRequiredMods(server);
          if (mods.length == 0) {
            resolve();
            return;
          }

          this.$parent.$refs.alert.alert({
            title: 'Mods',
            message: 'Required mods are now downloading. You will join the server once all mods are downloaded.',
          }).catch((err) => {
            if (err) log.error(err);
          });

          let mods_downloaded = [];
        
          async.eachSeries(mods, (mod, callback) => {
            if (this.stop_downloads) {
              var err = new Error();
              err.break = true;
              this.stop_downloads = false;
              return callback(err);
            }
            let i = mods_downloaded.length + 1;
            this.greenworks.ugcSubscribe(mod.id.toString(), () => {
              this.greenworks.ugcDownloadItem(mod.id.toString());

              this.$parent.$refs.downloading.startDownload({
                'title': mod.name + ' (' + i + '/' + mods.length + ')',
                'publishedFileId': mod.id.toString(),
              }, true).then((response) => {
                mods_downloaded.push(mod);
                log.info('Subscribed and downloaded mod ' + mod.name + ' - ' + i + '/' + mods.length);
                callback();
              }).catch((err) => {
                log.error(err);
                log.error('Failed to download mod ' + mod.title);
              });            
            }, (err) => {
              log.error(err);
            });
          }, (err) => {
            if (err && !err.break) {
              log.error(err);
            } else if (err) {
              reject(err);
            }
            if (mods_downloaded.length == mods.length) {
              this.greenworks.ugcGetUserItems({
                'app_id': parseInt(config.appid),
                'page_num': 1,
              }, this.greenworks.UGCMatchingType.Items, this.greenworks.UserUGCListSortOrder.SubscriptionDateDesc, this.greenworks.UserUGCList.Subscribed, (items) => {
                this.$store.dispatch('addMods', items.filter(mod2 => this.mods.every(mod3 => mod2.publishedFileId.toString() !== mod3.publishedFileId)));
                resolve();
              }, (err) => {
                log.error(err);
              });            
            }
          });
        });
      },
    },
    created: function() {
      EventBus.$on('joinServer', (payload) => {
        if (payload.length == 2) {
          this.joinServer(payload[0], payload[1]);
        } else {
          this.joinServer(payload);
        }
      });
      EventBus.$on('quitGame', (payload) => {
        this.quitGame();
      });
      EventBus.$on('cancelDownloads', (payload) => {
        this.stop_downloads = true;
      });      
    },
  }
</script>