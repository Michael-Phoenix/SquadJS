import DiscordBasePlugin from './discord-base-plugin.js';

export default class BB_DiscordServerRestart extends DiscordBasePlugin {
  static get description() {
    return 'The <code>BB_DiscordServerRestart</code> plugin will make sure there is a Server Restart each day around a specific time.';
  }

  static get defaultEnabled() {
    return false;
  }

  static get optionsSpecification() {
    return {
      ...DiscordBasePlugin.optionsSpecification,
      channelID: {
        required: true,
        description: 'The ID of the channel to log admin broadcasts to.',
        default: '',
        example: '667741905228136459'
      },
      color: {
        required: false,
        description: 'The color of the embed.',
        default: 16761867
      },
      restart_start: {
        required: false,
        description: 'Begin (hour) of the restart check period.',
        default: 5
      },
      restart_end: {
        required: false,
        description: 'End (hour) of the restart check period.',
        default: 7
      },
      time_between_restarts: {
        required: false,
        description: 'Time that has to be passed since last server (re)start until we attempt another restart.',
        default: 8
      },
      restart_map: {
        required: false,
        description: 'Layer that determines the restart Map.',
        default: "Narva_Destruction_v1"
      }
    };
  }

  constructor(server, options, connectors) {
    super(server, options, connectors);
    this.onNewGame = this.onNewGame.bind(this);
    this.doSleep = this.doSleep.bind(this);
    this.checkEmptyRestart = this.checkEmptyRestart.bind(this);
    this.initiateRestart = this.initiateRestart.bind(this);
    this.queueRestart = this.queueRestart.bind(this);
    this.killServer = this.killServer.bind(this);
    this.preBroadcast = this.preBroadcast.bind(this);
    this.broadcast = this.broadcast.bind(this);
    this.onPlayerConnected = this.onPlayerConnected.bind(this);
    this.kickAllPlayers = this.kickAllPlayers.bind(this);

  }

  async mount() {
    this.restartCheckInterval = setInterval(this.checkEmptyRestart, 60 * 1000);
    this.server.on('NEW_GAME', this.onNewGame);
    this.server.on('PLAYER_CONNECTED', this.onPlayerConnected);
  }

  async unmount() {
    clearInterval(this.restartCheckInterval);
    this.server.removeEventListener('NEW_GAME', this.onNewGame);
    this.server.removeEventListener('PLAYER_CONNECTED', this.onPlayerConnected);
  }

  async onNewGame(info) {
    if(info.layerClassname === this.options.restart_map){
      await this.initiateRestart(`Initiating restart on Restart Map.`);
    } else {
      const currentTime = new Date();
      if(this.server.nextLayer?.layerid != this.options.restart_map &&
        (currentTime.getTime() - this.server.lastRestartTime) / (1000 * 3600) >= this.options.time_between_restarts &&
        (currentTime.getUTCHours() >= this.options.restart_start &&
        currentTime.getUTCHours() < this.options.restart_end)) {
          await this.queueRestart();
      }
    }
  }

  async checkEmptyRestart() {
    const currentTime = new Date();
    if(!this.preBroadcastInterval &&
      this.server.nextLayer?.layerid === this.options.restart_map &&
      this.server.currentLayer.layerid != this.options.restart_map &&
      (currentTime.getTime() - this.server.lastRestartTime) / (1000 * 3600) >= this.options.time_between_restarts) {
        this.preBroadcast();
        this.preBroadcastInterval = setInterval(this.preBroadcast, 3 * 60 * 1000);
    }
    this.verbose(
      1,
      `NextLayer: ${this.server.nextLayer?.classname} (layerid ${this.server.nextLayer?.layerid}), preBroadCast: ${this.preBroadcastInterval}, checking for restart at : ${currentTime.toISOString()} ${currentTime.getTime()} Server Restart Time: ${this.server.lastRestartTime} Time since last restart: ${(currentTime.getTime() - this.server.lastRestartTime) / (1000 * 3600)}`
    );
    if(currentTime.getUTCHours() < this.options.restart_start ||
      currentTime.getUTCHours() >= this.options.restart_end ||
      (currentTime.getTime() - this.server.lastRestartTime) / (1000 * 3600) < this.options.time_between_restarts ||
      this.server.currentLayer.layerid === this.options.restart_map ||
      this.server.nextLayer?.layerid === this.options.restart_map)
      return;

    if(this.server.players?.length <= 40) {
      await this.queueRestart();
      //await this.server.rcon.endMatch();
    }

    if(this.server.players?.length == 0) {
      await this.killServer();
    }
  }

  async initiateRestart (message) {
    this.verbose(1, message);
    clearInterval(this.preBroadcastInterval);
    delete this.preBroadcastInterval;
    this.preBroadcastInterval?.unref();
    this.broadcast();
    this.interval = setInterval(this.broadcast, 1000);
    try{
      await this.kickAllPlayers();
    } catch(e) {
      this.verbose(1, `error in kickAllPlayers:`, e);
    }
    await this.killServer();
  }
  async queueRestart() {
    this.verbose(
      1,
      `Queueing up Restart Map.`
    );
    if(!this.preBroadcastInterval) {
      this.preBroadcast();
      this.preBroadcastInterval = setInterval(this.preBroadcast, 3 * 60 * 1000);
    }
    await this.server.rcon.setNextLayer(this.options.restart_map);

  }

  async killServer() {
    clearInterval(this.interval);
    clearInterval(this.preBroadcastInterval);
    this.interval?.unref();
    delete this.preBroadcastInterval;
    this.preBroadcastInterval?.unref();
    this.timeout?.unref();
    try{
      await this.sendDiscordMessage({
        embed: {
          title: 'Server is now ready for :seedling:',
          color: this.options.color,
          timestamp: new Date().toISOString()
        }
      });
    } catch(e) {
      this.verbose(1, `Error while sending discord Message:`, e);
    }
    await this.server.rcon.killServer();
  }

  async broadcast() {
    await this.server.rcon.broadcast("Restarting Server now. Please find BB | in server browser to connect. Reconnect Button is broken.");
  }

  async preBroadcast() {
    if(this.server.nextLayer?.layerid === this.options.restart_map){
      this.verbose(
        1,
        `Broadcasting pre-restart meassage.`
      );
      await this.server.rcon.broadcast("We have to restart the server after this round. Make sure to 'show empty' servers in filter <3 BB | BloodBound");
    }
  }

  async onPlayerConnected(info) {
    if(this.server.currentLayer.layerid === this.options.restart_map){
      this.verbose(
        1,
        `Kicking ${info.steamID} with restart meassage. (onConnect)`
      );
      this.server.rcon.kick(info.steamID,"Restarting Server. Please find BB | in server browser to connect. Reconnect Button is broken.");
    }
  }

  async doSleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async kickAllPlayers() {
    await this.doSleep(10000);

    this.verbose(
      1,
      `Start Kicking ${this.server.players.length} players with restart meassage. `
    );
    for(const player of this.server.players) {
      this.verbose(
        1,
        `Kicking player ${player.name} with restart meassage.`
      );
      this.server.rcon.kick(player.steamID,"Restarting Server. Please find BB | in server browser to connect. Reconnect Button is broken.");
    }
    this.verbose(
      1,
      `Finished Kicking players with restart meassage.`
    );
    return await this.doSleep(1000);
  }
}
