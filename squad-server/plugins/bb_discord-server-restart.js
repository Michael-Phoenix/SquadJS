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
      restart_map: {
        required: false,
        description: 'Layer that determines the restart Map.',
        default: "Narva_Destruction_v1"
      }
    };
  }

  constructor(server, options, connectors) {
    super(server, options, connectors);
    this.lastRestartTime = 0;

    this.killServer = this.killServer.bind(this);
    this.broadcast = this.broadcast.bind(this);
    this.onNewGame = this.onNewGame.bind(this);
    this.onServerStart = this.onServerStart.bind(this);
    this.onPlayerConnected = this.onPlayerConnected.bind(this);
    this.checkEmptyRestart = this.checkEmptyRestart.bind(this);
  }

  async mount() {
    this.restartInterval = setInterval(this.checkEmptyRestart, 60 * 1000);
    this.server.on('NEW_GAME', this.onNewGame);
    this.server.on('SERVER_START', this.onServerStart);
    this.server.on('PLAYER_CONNECTED', this.onPlayerConnected);
  }

  async unmount() {
    clearInterval(this.restartInterval);
    this.server.removeEventListener('NEW_GAME', this.onNewGame);
    this.server.removeEventListener('SERVER_START', this.onServerStart);
    this.server.removeEventListener('PLAYER_CONNECTED', this.onPlayerConnected);
  }

  async onNewGame(info) {
    if(info.layerClassname === this.options.restart_map){

      this.verbose(
        "BB_DiscordServerRestart",
        1,
        `layerClassname: ${info.layerClassname}`
      );
      this.interval = setInterval(this.broadcast, 1000);
      this.timeout = setTimeout(this.killServer, 20 * 1000);
      for(const player of this.server.players) {
        this.server.rcon.kick(player.steamID,"Restarting Server. Please find BB | in server browser to connect. Reconnect Button is broken.");
      }
    } else {
      const currentTime = new Date();
      if(this.server.nextLayer?.rawName != this.options.restart_map &&
        (currentTime.getTime() - this.lastRestartTime) * 1000 * 3600 >= 3 &&
        currentTime.getUTCHours() >= this.options.restart_start &&
        currentTime.getUTCHours() <= this.options.restart_end) {
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

  async onServerStart(info) {
    this.lastRestartTime = Date.parse(info.time);

    this.verbose(
      "BB_DiscordServerRestart",
      1,
      `lastRestartTime: ${this.lastRestartTime}`
    );
  }

  async onPlayerConnected(info) {
    if(this.server.currentLayer.rawName === this.options.restart_map){
      this.server.rcon.kick(info.steamID,"Restarting Server. Please find BB | in server browser to connect. Reconnect Button is broken.");
    }
  }

  async checkEmptyRestart() {
    const currentTime = new Date();

    if(currentTime.getUTCHours() < this.options.restart_start ||
      currentTime.getUTCHours() > this.options.restart_end ||
      this.server.currentLayer.rawName === this.options.restart_map ||
      this.server.nextLayer?.rawName === this.options.restart_map)
      return;

    if(this.server.players?.length <= 20) {
      this.verbose(
        "BB_DiscordServerRestart",
        1,
        `layerClassname: ${info.layerClassname}`
      );
      this.interval = setInterval(this.broadcast, 1000);
      this.timeout = setTimeout(this.killServer, 20 * 1000);
      for(const player of this.server.players) {
        this.server.rcon.kick(player.steamID,"Restarting Server. Please find BB | in server browser to connect. Reconnect Button is broken.");
      }
    }
  }
}
