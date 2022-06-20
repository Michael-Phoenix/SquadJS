import DiscordBasePlugin from './discord-base-plugin.js';

export default class BB_TeamRandomizer extends BasePlugin {
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
  }

  async unmount() {
    this.server.removeEventListener(`CHAT_COMMAND:${this.options.command}`, this.onChatCommand);
  }

  async onChatCommand(info) {
    if (info.chat !== 'ChatAdmin') return;
    this.verbose(
      1,
      `Player requesting shuffle: ${info.player} Last : ${this.server.layerHistory[0].time.toISOString()} ${currentTime.getTime()} Server Restart Time: ${this.server.lastRestartTime} Time since last restart: ${(currentTime.getTime() - this.server.lastRestartTime) / (1000 * 3600)}`
    );
    if(this.server.pluginData?.shuffleOnNextMap) {
          await this.server.rcon.warn(info.player.steamID, "Shuffling cancelled");
          if(!this.server.pluginData) this.server.pluginData = {};
          this.server.pluginData.shuffleOnNextMap = false;
          return;
    }
    if (Date.now() <= this.server.layerHistory[0].time.getTime() + 1000*60*1) { //1000*60 = Minutes
      await this.server.rcon.warn(info.player.steamID, "Shuffling immediately");
    } else {
      await this.server.rcon.warn(info.player.steamID, "Shuffling on next map change");
      if(!this.server.pluginData) this.server.pluginData = {};
      this.server.pluginData.shuffleOnNextMap = true;
    }
    
  }

  async onNewGame(info) {
    if(!this.server.pluginData?.shuffleOnNextMap) return;
    this.server.pluginData.shuffleOnNextMap = false;
    await this.doSleep(5000);
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
