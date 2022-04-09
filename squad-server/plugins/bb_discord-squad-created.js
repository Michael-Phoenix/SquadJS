import DiscordBasePlugin from './discord-base-plugin.js';

export default class BB_DiscordSquadCreated extends DiscordBasePlugin {
  static get description() {
    return 'The <code>BB_SquadCreated</code> plugin will log Squad Creation events to a Discord channel. - With adaptation to BB needs.';
  }

  static get defaultEnabled() {
    return false;
  }

  static get optionsSpecification() {
    return {
      ...DiscordBasePlugin.optionsSpecification,
      channelID: {
        required: true,
        description: 'The ID of the channel to log Squad Creation events to.',
        default: '',
        example: '667741905228136459'
      },
      color: {
        required: false,
        description: 'The color of the embed.',
        default: 16761867
      },
      useEmbed:{
        required: false,
        description: `Send message as Embed`,
        default: true
      }
    };
  }

  constructor(server, options, connectors) {
    super(server, options, connectors);

    this.onSquadCreated = this.onSquadCreated.bind(this);
  }

  async mount() {
    this.server.on('SQUAD_CREATED', this.onSquadCreated);
  }

  async unmount() {
    this.server.removeEventListener('SQUAD_CREATED', this.onSquadCreated);
  }

  async onSquadCreated(info) {

    if(this.options.useEmbed){

        await this.sendDiscordMessage({
            embed: {
                title: `${info.player.name} created ${info.teamName} Squad#${info.player.squadID} : ${info.squadName}`,
                description: `[BM Link](https://www.battlemetrics.com/rcon/players?filter%5Bsearch%5D=${info.player.steamID}) - [Steam Link](https://steamcommunity.com/profiles/${info.victim.steamID})`,
                color: this.options.color,
                                /*fields: [
                {
                    name: 'Player',
                    value: `[${info.player.name}](https://www.battlemetrics.com/rcon/players?filter%5Bsearch%5D=${info.player.steamID})`,
                    inline: true
                },
                {
                    name: 'Team',
                    value: info.teamName,
                    inline: true
                },
                {
                    name: 'Squad Number & Squad Name',
                    value: `#${info.player.squadID} : ${info.squadName}`,
                    inline: true
                }
                ],//*/
                timestamp: info.time.toISOString()
            }
        });

    } else {

        await this.sendDiscordMessage(` \`\`\`Player: ${info.player.name}\n created Squad ${info.player.squadID} : ${info.squadName}\n on ${info.teamName}\`\`\` `)
    }
  }
}
