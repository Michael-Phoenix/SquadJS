import DiscordBasePlugin from './discord-base-plugin.js';

export default class BB_DiscordRoundEnd extends DiscordBasePlugin {
  static get description() {
    return 'The <code>BB_DiscordRoundEnd</code> plugin will send the round change details to a Discord channel.';
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

    this.onNewGame = this.onNewGame.bind(this);
  }

  async mount() {
    this.server.on('NEW_GAME', this.onNewGame);
  }

  async unmount() {
    this.server.removeEventListener('NEW_GAME', this.onNewGame);
  }

  async onNewGame(info) {
    const winnerText = info.winner?info.winner:'Could not be determined.';
    let team1 = "unknown";
    let team2 = "unknown";
    try {
      team1 = `${this.server.layerHistory[1].layer.team[0].name}`;

    } catch (e) {
      this.verbose(1, `Error while fetching team1: ${e}`);
    }
    try {
      team2 = `${this.server.layerHistory[1].layer.team[1].name}`;
    } catch (e) {
      this.verbose(1, `Error while fetching team2: ${e}`);
    }
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
            name: 'Team1',
            value: `${team1}`,
          },
          {
            name: 'Team2',
            value: `${team2}`,
            inline: true
          },

          {
            name: 'Last Layer',
            value: `${this.server.layerHistory[1].layer.name}`,
          },
          {
            name: 'Next Layer',
            value: `${this.server.currentLayer.name}`,
            inline: true
          }

        ],
        timestamp: info.time.toISOString(),
        footer: {
          text: `${info.time.toISOString()}`
        }
      }
    });
  }
}
