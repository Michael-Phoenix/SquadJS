import LogParser from 'core/log-parser';

import AdminBroadcast from './admin-broadcast.js';
import DeployableDamaged from './deployable-damaged.js';
import NewGame from './new-game.js';
import PlayerConnected from './player-connected.js';
import PlayerControllerConnected from './playercontroller-connected.js';
import PlayerDisconnected from './player-disconnected.js';
import PlayerDamaged from './player-damaged.js';
import PlayerDied from './player-died.js';
import PlayerTeamkilled from './player-teamkilled.js';
import PlayerPossess from './player-possess.js';
import PlayerRevived from './player-revived.js';
import PlayerUnPossess from './player-un-possess.js';
import PlayerWounded from './player-wounded.js';
import RoundWinner from './round-winner.js';
import ServerTickRate from './server-tick-rate.js';
import SquadCreated from './squad-created.js';
import traceDamage from './trace-damage.js';
import playerRespawned from './player-respawn.js';
import clientConnected from './client-connected.js';
import clientLogin from './client-login.js';
import pendingConnectionDestroyed from './pending-connection-destroyed.js';
import ServerStart from './server-start.js';
import PlayerKilled from './player-killed.js';
import PlayerSuicided from './player-suicided.js';
export default class SquadLogParser extends LogParser {
  constructor(options) {
    super('SquadGame.log', options);
  }

  getRules() {
    return [
      AdminBroadcast,
      DeployableDamaged,
      NewGame,
      PlayerConnected,
      PlayerControllerConnected,
      PlayerDisconnected,
      PlayerDamaged,
      PlayerDied,
      PlayerTeamkilled,
      PlayerPossess,
      PlayerRevived,
      PlayerUnPossess,
      PlayerWounded,
      RoundWinner,
      ServerTickRate,
      SquadCreated,
      traceDamage,
      playerRespawned,
      clientConnected,
      clientLogin,
      pendingConnectionDestroyed,
      ServerStart,
      PlayerKilled,
      PlayerSuicided
    ];
  }
}
