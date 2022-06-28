import GraphQLRequest from 'graphql-request';

import DiscordBasePlugin from './discord-base-plugin.js';

const { request, gql } = GraphQLRequest;

export default class BB_CBLInfo extends DiscordBasePlugin {
  static get description() {
    return (
      'The <code>BB_CBLInfo</code> plugin alerts admins when a harmful player is detected joining their server based ' +
      'on data from the <a href="https://communitybanlist.com/">Community Ban List</a>.'
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
        description: 'The ID of the channel to alert admins through.',
        default: '',
        example: '667741905228136459'
      },
      threshold: {
        required: false,
        description:
          'Admins will be alerted when a player has this or more reputation points. For more information on ' +
          'reputation points, see the ' +
          '<a href="https://communitybanlist.com/faq">Community Ban List\'s FAQ</a>',
        default: 6
      },
      kick: {
        required: false,
        description: "Whether to actually kick players automatically at all (see also kickThreshold)",
        default: false
      },
      kickThreshold: {
        required: false,
        description: "from this threshold, players get automatically kicked.",
        default: 10
      }
    };
  }

  constructor(server, options, connectors) {
    super(server, options, connectors);

    this.onPlayerConnected = this.onPlayerConnected.bind(this);
  }

  async mount() {
    this.server.on('PLAYER_CONNECTED', this.onPlayerConnected);
  }

  async unmount() {
    this.server.removeEventListener('PLAYER_CONNECTED', this.onPlayerConnected);
  }

  async onPlayerConnected(info) {
    try {
      const data = await request(
        'https://communitybanlist.com/graphql',
        gql`
          query Search($id: String!) {
            steamUser(id: $id) {
              id
              name
              avatarFull
              reputationPoints
              riskRating
              reputationRank
              lastRefreshedInfo
              lastRefreshedReputationPoints
              lastRefreshedReputationRank
              activeBans: bans(orderBy: "created", orderDirection: DESC, expired: false) {
                edges {
                  cursor
                  node {
                    id
                  }
                }
              }
              expiredBans: bans(orderBy: "created", orderDirection: DESC, expired: true) {
                edges {
                  cursor
                  node {
                    id
                  }
                }
              }
            }
          }
        `,
        { id: info.player.steamID }
      );

      if (!data.steamUser) {
        this.verbose(
          2,
          `Player ${info.player.name} (Steam ID: ${info.player.steamID}) is not listed in the Squad Community Ban List.`
        );
        return;
      }

      if (data.steamUser.reputationPoints < this.options.threshold) {
        this.verbose(
          2,
          `Player ${info.player.name} (Steam ID: ${info.player.steamID}) has a reputation below the threshold.`
        );
        return;
      }
      //Last Reputation change
      const daysSinceLastRepChange = Math.floor((Date.now() - Date.parse(data.steamUser.lastRefreshedReputationPoints)) / (1000 * 3600 * 24));

      let autoKicked = "";
      if(this.options.kick && data.steamUser.riskRating >= this.options.kickThreshold) {
        await this.server.rcon.kick(info.player.steamID,"https://communitybanlist.com/banned");
        autoKicked = " and was automatically kicked";
      }
      await this.sendDiscordMessage({
        embed: {
          title: `${info.player.name} is a potentially harmful player${autoKicked}!`,
          author: {
            name: 'Community Ban List',
            url: 'https://communitybanlist.com/'//,
            //icon_url:
              //'https://cdn.jsdelivr.net/gh/Team-Silver-Sphere/Squad-Community-Ban-List@master/client/src/assets/img/brand/scbl-logo-square.png'
          },
          thumbnail: {
            url: data.steamUser.avatarFull
          },
          description: `[${info.player.name}](https://www.battlemetrics.com/rcon/players?filter%5Bsearch%5D=${info.player.steamID}) ([CBL-Link](https://communitybanlist.com/search/${info.player.steamID})) has ${data.steamUser.reputationPoints} reputation points on the Community Ban List and is therefore a potentially harmful player.`,
          fields: [
            {
              name: 'Reputation Points',
              value: `${data.steamUser.reputationPoints} (${daysSinceLastRepChange} Days since last entry)`,
              inline: true
            },
            {
              name: 'Risk Rating',
              value: `${data.steamUser.riskRating} / 10`,
              inline: true
            },
            {
              name: 'Reputation Rank',
              value: `#${data.steamUser.reputationRank}`,
              inline: true
            },
            {
              name: 'Active Bans',
              value: `${data.steamUser.activeBans.edges.length}`,
              inline: true
            },
            {
              name: 'Expired Bans',
              value: `${data.steamUser.expiredBans.edges.length}`,
              inline: true
            }
          ],
          color: '#ffc40b',
          timestamp: info.time.toISOString(),
        }
      });
    } catch (err) {
      this.verbose(
        1,
        `Failed to fetch Community Ban List data for player ${info.name} (Steam ID: ${info.steamID}): `,
        err
      );
    }
  }
}
