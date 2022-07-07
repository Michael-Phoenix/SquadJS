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
    let winnerTeam = "Team unknown";
    try {
      if(winnerText == this.server.layerHistory[1].layer.teams[0].name)
      winnerTeam = `Team1`;

    } catch (e) {
      this.verbose(1, `Error while fetching team1: ${e}`);
    }
    try {
      if(winnerText == this.server.layerHistory[1].layer.teams[1].name)
      winnerTeam = `Team2`;
    } catch (e) {
      this.verbose(1, `Error while fetching team2: ${e}`);
    }

    try {
      const previousTeams = `\n(${this.server.layerHistory[1].layer.teams[0].name} vs. ${this.server.layerHistory[1].layer.teams[1].name})`;
    } catch (e) {

    }
    try {
      const nextTeams = `\n(${this.server.layerHistory[0].layer.teams[0].name} vs. ${this.server.layerHistory[0].layer.teams[1].name})`;
    } catch (e) {

    }
    await this.sendDiscordMessage({
      embed: {
        title: 'Round Ended',
        color: this.options.color,
        fields: [
          {
            name: 'Winner',
            value: `${winnerText} (${winnerTeam})`
          },
          {
            name: 'Last Layer',
            value: `${this.server.layerHistory[1].layer.name}${previousTeams}`
          },
          {
            name: 'Next Layer',
            value: `${this.server.currentLayer.name}${nextTeams}`
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
