export default {
  regex:
    /^\[([0-9.:-]+)]\[([ 0-9]*)]LogSquadTrace: \[DedicatedServer\]RestartPlayer\(\): On Server PC=(.+) Spawn=(.+) DeployRole=/,
  onMatch: (args, logParser) => {
    const data = {
      raw: args[0],
      time: args[1],
      chainID: args[2],
      playerSuffix: args[3],
      spawnPoint: args[4]
    };

    logParser.emit('PLAYER_RESPAWNED', data);
  }
};
