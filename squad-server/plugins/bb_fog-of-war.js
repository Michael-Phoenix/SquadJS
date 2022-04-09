import DiscordBasePlugin from './discord-base-plugin.js';

export default class BB_FogOfWar extends DiscordBasePlugin {
  static get description() {
    return 'The <code>BB_FogOfWar</code> plugin can be used to automate setting fog of war mode. - With adaptation to BB needs.';
  }

  static get defaultEnabled() {
    return false;
  }

  static get optionsSpecification() {
    return {
      ...DiscordBasePlugin.optionsSpecification,
      channelID: {
        required: true,
        description: 'The ID of the channel to log Fog of War events to.',
        default: '',
        example: '667741905228136459'
      },
      mode: {
        required: false,
        description: 'Fog of war mode to set.',
        default: 1
      },
      delay: {
        required: false,
        description: 'Delay before setting fog of war mode.',
        default: 10 * 1000
      },
      color: {
        required: false,
        description: 'The color of the embed.',
        default: 16761867
      },
    };
  }

  constructor(server, options, connectors) {
    super(server, options, connectors);

    this.onNewGame = this.onNewGame.bind(this);
  }

  async mount() {
    this.server.on('NEW_GAME', this.onNewGame);
  }

  async unmount() {
    this.server.removeEventListener('NEW_GAME', this.onNewGame);
  }

  async onNewGame() {
    setTimeout(() => {
      if (this.server.currentLayer?.name.toLowerCase().includes("raas")){
        this.server.rcon.setFogOfWar(this.options.mode);
        await this.sendDiscordMessage({
            embed: {
                title: `RAAS FOW revealed.`,
                color: this.options.color,
                description: `[${this.server.currentLayer?.name}]`,
                timestamp: info.time.toISOString()
            }
        });
      } else {
        await this.sendDiscordMessage({
            embed: {
                title: `No RAAS no reveal.`,
                color: this.options.color,
                description: `[${this.server.currentLayer?.name}]`,
                timestamp: info.time.toISOString()
            }
        });
      }, this.options.delay);
    }
  }
}
