import DiscordBasePlugin from './discord-base-plugin.js';

export default class BB_DiscordServerRestart extends DiscordBasePlugin {
  static get description() {
    return 'The <code>BB_DiscordServerRestart</code> plugin will send the round change details to a Discord channel.';
  }

  static get defaultEnabled() {
    return true;
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
  }

  async mount() {
    this.server.on('NEW_GAME', this.onNewGame);
    this.server.on('SERVER_START', this.onServerStart);
  }

  async unmount() {
    this.server.removeEventListener('NEW_GAME', this.onNewGame);
    this.server.removeEventListener('SERVER_START', this.onServerStart);
  }

  async onNewGame(info) {
    if(info.layerClassname === "Narva_Destruction_v1"){
      this.interval = setInterval(this.broadcast, 1000);
      setTimeout(this.killServer, 20 * 1000);
      for(const player of this.server.players) {
        this.server.rcon.kick(player.steamID,"Restarting Server. Please find BB | in server browser to connect. Reconnect Button is broken.")
      }
    }


    const winnerText = info.winner?info.winner:'Could not be determined.';
    await this.sendDiscordMessage({
      embed: {
        title: 'Round Ended',
        color: this.options.color,
        fields: [
          {
            name: 'Winner',
            value: `${winnerText}`
          },
          {
            name: 'Last Layer',
            value: `${this.server.layerHistory[1].layer.name}`,
            inline: true
          },
          {
            name: 'Next Layer',
            value: `${this.server.layerHistory[0].layer.name}`,
            inline: true
          }

        ],
        timestamp: info.time.toISOString()
      }
    });
  }

  async killServer() {
    await this.server.rcon.killServer();
  }

  async broadcast() {
    await this.server.rcon.broadcast("Restarting Server now. Please reconnect through Server Browser: BB | BloodBound");
  }

  async onServerStart(info) {
    this.lastRestartTime = Date.parse(info.time);
    clearInterval(this.interval);
  }
}
