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
        default: 3
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

    this.killServer = this.killServer.bind(this);
    this.preBroadcast = this.preBroadcast.bind(this);
    this.broadcast = this.broadcast.bind(this);
    this.onNewGame = this.onNewGame.bind(this);
    this.onPlayerConnected = this.onPlayerConnected.bind(this);
    this.checkEmptyRestart = this.checkEmptyRestart.bind(this);
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

      this.verbose(
        1,
        `Initiating regular restart on Restart Map.`
      );
      clearInterval(this.preBroadcastInterval);
      this.interval = setInterval(this.broadcast, 1000);
      await kickAllPlayers();
      this.timeout = setTimeout(this.killServer, 1000);
    } else {
      const currentTime = new Date();
      if(this.server.nextLayer?.rawName != this.options.restart_map &&
        (currentTime.getTime() - this.server.lastRestartTime) / (1000 * 3600) >= this.options.time_between_restarts &&
        (currentTime.getUTCHours() >= this.options.restart_start &&
        currentTime.getUTCHours() < this.options.restart_end)) {
          this.verbose(
            1,
            `Queueing up Restart Map.`
          );
          this.preBroadcastInterval = setInterval(this.preBroadcast, 3 * 60 * 1000);
          this.server.rcon.setNextLayer(this.options.restart_map);
      }
    }
  }

  async killServer() {
    clearInterval(this.interval);
    this.interval?.unref();
    this.timeout?.unref();
    await this.server.rcon.killServer();
  }

  async broadcast() {
    await this.server.rcon.broadcast("Restarting Server now. Please reconnect through Server Browser: BB | BloodBound");
  }

  async preBroadcast() {
    this.verbose(
      1,
      `Broadcasting pre-restart meassage.`
    );
    await this.server.rcon.broadcast("We have to restart the server after this round. Make sure to 'show empty' servers in filter <3 BB | BloodBound");
  }

  async onPlayerConnected(info) {
    if(this.server.currentLayer.rawName === this.options.restart_map){
      this.server.rcon.kick(info.steamID,"Restarting Server. Please find BB | in server browser to connect. Reconnect Button is broken.");
    }
  }

  async checkEmptyRestart() {
    const currentTime = new Date();
    //this.verbose(
    //  1,
    //  `checking for restart at : ${currentTime.toISOString()} ${currentTime.getTime()} Server Restart Time: ${this.server.lastRestartTime} Time since last restart: ${(currentTime.getTime() - this.server.lastRestartTime) / (1000 * 3600)}`
    //);
    if(currentTime.getUTCHours() < this.options.restart_start ||
      currentTime.getUTCHours() >= this.options.restart_end ||
      (currentTime.getTime() - this.server.lastRestartTime) / (1000 * 3600) < this.options.time_between_restarts ||
      this.server.currentLayer.rawName === this.options.restart_map ||
      this.server.nextLayer?.rawName === this.options.restart_map)
      return;

    if(this.server.players?.length <= 20) {
      this.verbose(
        1,
        `Initiating restart immediately due to low Player count.`
      );
      this.interval = setInterval(this.broadcast, 1000);

      await kickAllPlayers();
      this.timeout = setTimeout(this.killServer, 1000);
    }
  }
  async kickAllPlayers() {
    for(let player of this.server.players) {
      this.verbose(
        1,
        `Kicking player ${player.name} with restart meassage.`
      );
      await this.server.rcon.kick(player.steamID,"Restarting Server. Please find BB | in server browser to connect. Reconnect Button is broken.");
    }
  }
}
