import DiscordBasePlugin from './discord-base-plugin.js';

export default class BB_DiscordSpecialTeamkill extends DiscordBasePlugin {
  static get description() {
    return (
      'The <code>BB_DiscordSpecialTeamkill</code> plugin logs special teamkills and related information to a Discord channel for ' +
      'admins to review. - With adaptation to BB needs.'
    );
  }

  static get defaultEnabled() {
    return true;
  }

  static get optionsSpecification() {
    return {
      ...DiscordBasePlugin.optionsSpecification,
      channelID: {
        required: true,
        description: 'The ID of the channel to log teamkills to.',
        default: '',
        example: '667741905228136459'
      },
      color: {
        required: false,
        description: 'The color of the embeds.',
        default: 16761867
      },
      disableSCBL: {
        required: false,
        description: 'Disable Squad Community Ban List information.',
        default: false
      }
    };
  }

  constructor(server, options, connectors) {
    super(server, options, connectors);

    this.onTeamkill = this.onTeamkill.bind(this);
  }

  async mount() {
    this.server.on('TEAMKILL', this.onTeamkill);
  }

  async unmount() {
    this.server.removeEventListener('TEAMKILL', this.onTeamkill);
  }

  async onTeamkill(info) {
    if (!info.attacker) return;
    if (!info.weapon.toLowerCase().includes("bayonet") && !info.weapon.toLowerCase().includes("knife") ) return;
    const fields = [
      {
        name: "Teamkiller",
        value: `[${info.attacker.name}](https://www.battlemetrics.com/rcon/players?filter%5Bsearch%5D=${info.attacker.steamID}) - [CBL-Link](https://communitybanlist.com/search/${info.attacker.steamID})`,
        inline: true
      },
      /*{
        name: "Attacker's SteamID",
        value: `[${info.attacker.steamID}](https://steamcommunity.com/profiles/${info.attacker.steamID})`,
        inline: true
      },*/
      {
        name: 'Weapon',
        value: info.weapon,
        inline: true
      },
      {
        name: "Victim",
        value: `[${info.victim.name}](https://www.battlemetrics.com/rcon/players?filter%5Bsearch%5D=${info.victim.steamID})`,
        inline: true
      }
      /*{
        name: "Victim's SteamID",
        value: `[${info.victim.steamID}](https://steamcommunity.com/profiles/${info.victim.steamID})`,
        inline: true
      }*/
    ];

    /*if (!this.options.disableSCBL)
      fields.push({
        name: 'SCBL',
        value: `[SCBL](https://squad-community-ban-list.com/search/${info.attacker.steamID})`,
          inline: true
      });

    fields.push({
      name: 'Timestamp',
      value: `${info.time.toISOString()}`,
      inline: true
    });*/

    await this.sendDiscordMessage({
      embed: {
        //title: `Teamkill: ${info.attacker.name}`,
        color: this.options.color,
        fields: fields,
        timestamp: info.time.toISOString(),
        footer: {
          text: `${info.time.toISOString()}`
        }
      }
    });
  }
}
