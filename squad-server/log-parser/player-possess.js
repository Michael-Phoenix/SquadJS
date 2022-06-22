export default {
  regex:
    /\[([0-9.:-]+)]\[([ 0-9]*)]LogSquadTrace: \[DedicatedServer](?:ASQPlayerController::)?OnPossess\(\): PC=(.+) Pawn=(([A-z0-9_]+)_C_[0-9]+).*/,
  onMatch: (args, logParser) => {
    const data = {
      raw: args[0],
      time: args[1],
      chainID: args[2],
      playerSuffix: args[3],
      pawn: args[4],
      possessClassname: args[5],
      player: logParser.getPlayerByNameToSuffix(args[3])
    };

    logParser.emit('PLAYER_POSSESS', data);
  }
};
