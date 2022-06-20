import DiscordBasePlugin from './discord-base-plugin.js';

export default class BB_TeamRandomizer extends DiscordBasePlugin {
  static get description() {
    return (
      "The <code>BB_TeamRandomizer</code> can be used to randomize teams. It's great for destroying clan stacks or for " +
      'social events. It can be run by typing, by default, <code>!randomize</code> into in-game admin chat'
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
        description: 'The ID of the channel to log admin broadcasts to.',
        default: '',
        example: '972418614894420008'
      },
      color: {
        required: false,
        description: 'The color of the embed.',
        default: 16761867
      },
      gracePeriod: {
        required: false,
        description: 'Grace Period after new Game started where we can randomize immediately.',
        default: '1'
      },
      command: {
        required: false,
        description: 'The command used to randomize the teams.',
        default: 'randomize'
      }
    };
  }

  constructor(server, options, connectors) {
    super(server, options, connectors);

    this.onNewGame = this.onNewGame.bind(this);
    this.doSleep = this.doSleep.bind(this);
    this.onChatCommand = this.onChatCommand.bind(this);
    this.doShuffle = this.doShuffle.bind(this);
  }

  async mount() {
    this.server.on(`CHAT_COMMAND:${this.options.command}`, this.onChatCommand);
    this.server.on('NEW_GAME', this.onNewGame);
  }

  async unmount() {
    this.server.removeEventListener(`CHAT_COMMAND:${this.options.command}`, this.onChatCommand);
    this.server.removeEventListener('NEW_GAME', this.onNewGame);
  }

  async onChatCommand(info) {
    if (info.chat !== 'ChatAdmin') return;
    this.verbose(
      1,
      `Player requesting shuffle: ${info.player.name} Last : ${this.server.layerHistory[0].time.toISOString()}`
    );

    if(this.server.pluginData?.shuffleOnNextMap) {
          await this.server.rcon.warn(info.player.steamID, "Shuffling cancelled");
          if(!this.server.pluginData) this.server.pluginData = {};
          this.server.pluginData.shuffleOnNextMap = false;
          await this.sendDiscordMessage({
            embed: {
              title: 'Team Randomizer cancelled',
              color: this.options.color,
              fields: [
                {
                  name: 'Requested by',
                  value: `[${info.player.name}](https://www.battlemetrics.com/rcon/players?filter%5Bsearch%5D=${info.player.steamID})`,
                  inline: true
                }
              ],
              timestamp: info.time.toISOString()
            }
          });
          return;
    }

    if (Date.now() <= this.server.layerHistory[0].time.getTime() + 1000*60*this.options.gracePeriod) { //1000*60 = Minutes
      await this.server.rcon.warn(info.player.steamID, "Shuffling immediately");
      await this.sendDiscordMessage({
        embed: {
          title: 'Team Randomizer Issued Immediately',
          color: this.options.color,
          fields: [
            {
              name: 'Requested by',
              value: `[${info.player.name}](https://www.battlemetrics.com/rcon/players?filter%5Bsearch%5D=${info.player.steamID})`,
              inline: true
            }

          ],
          timestamp: info.time.toISOString()
        }
      });
      await this.doShuffle();
    } else {
      await this.server.rcon.warn(info.player.steamID, "Shuffling on next layer change");
      await this.sendDiscordMessage({
        embed: {
          title: 'Team Randomizer scheduled for next layer change',
          color: this.options.color,
          fields: [
            {
              name: 'Requested by',
              value: `[${info.player.name}](https://www.battlemetrics.com/rcon/players?filter%5Bsearch%5D=${info.player.steamID})`,
              inline: true
            }

          ],
          timestamp: info.time.toISOString()
        }
      });
      if(!this.server.pluginData) this.server.pluginData = {};
      this.server.pluginData.shuffleOnNextMap = true;
    }

  }

  async onNewGame(info) {
    if(!this.server.pluginData?.shuffleOnNextMap) return;
    this.server.pluginData.shuffleOnNextMap = false;
    await this.doSleep(5000);
    await this.sendDiscordMessage({
      embed: {
        title: 'Team Randomize order executed on layer change.',
        color: this.options.color,
        fields: [
          {
            name: 'Requested by',
            value: `[${info.player.name}](https://www.battlemetrics.com/rcon/players?filter%5Bsearch%5D=${info.player.steamID})`,
            inline: true
          }

        ],
        timestamp: info.time.toISOString()
      }
    });
    await this.doShuffle();
  }

  async doShuffle() {
    const players = this.server.players.slice(0);

    let currentIndex = players.length;
    let temporaryValue;
    let randomIndex;

    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      temporaryValue = players[currentIndex];
      players[currentIndex] = players[randomIndex];
      players[randomIndex] = temporaryValue;
    }

    let team = '1';

    for (const player of players) {
      if (player.teamID !== team) await this.server.rcon.switchTeam(player.steamID);

      team = team === '1' ? '2' : '1';
    }
  }

  async doSleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
