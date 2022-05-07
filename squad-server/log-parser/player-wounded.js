export default {
  regex:
    /^\[([0-9.:-]+)]\[([ 0-9]*)]LogSquadTrace: \[DedicatedServer](?:ASQSoldier::)?Wound\(\): Player:(.+) KillingDamage=(?:-)*([0-9.]+) from ([A-z_0-9]+) caused by (([A-z_0-9]+)_C_[0-9]+)/,
  onMatch: (args, logParser) => {
    const data = {
      ...logParser.eventStore.matchData[args[3]],
      raw: args[0],
      time: args[1],
      chainID: args[2],
      victimName: args[3],
      damage: parseFloat(args[4]),
      attackerPlayerController: args[5],
      weapon: args[7]
    };

    if (data.victimName !== 'nullptr') {
      logParser.eventStore.matchData[args[3]] = data;
    }

    logParser.emit('PLAYER_WOUNDED', data);
  }
};
