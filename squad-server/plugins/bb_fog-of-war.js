import BasePlugin from './base-plugin.js';

export default class BB_FogOfWar extends BasePlugin {
  static get description() {
    return 'The <code>BB_FogOfWar</code> plugin can be used to automate setting fog of war mode. - With adaptation to BB needs.';
  }

  static get defaultEnabled() {
    return false;
  }

  static get optionsSpecification() {
    return {
      mode: {
        required: false,
        description: 'Fog of war mode to set.',
        default: 1
      },
      delay: {
        required: false,
        description: 'Delay before setting fog of war mode.',
        default: 10 * 1000
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

  async onNewGame() {

    setTimeout(() => {
      if (this.server.currentLayer?.name.toLowerCase().includes("raas")){
        this.server.rcon.setFogOfWar(this.options.mode);
      }
    }, this.options.delay);

  }
}
