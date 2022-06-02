export default {
  regex:
    /^\[([0-9.:-]+)]\[([ 0-9]*)]LogSquad: Player:(.+) ActualDamage=([0-9.]+) from (.+) caused by (([A-z_0-9]+)_C_[0-9]+)/,

  onMatch: (args, logParser) => {
    let data = {
      raw: args[0],
      time: args[1],
      chainID: args[2],
      victimName: args[3],
      damage: parseFloat(args[4]),
      attackerName: args[5],
      weapon: args[7],
      weaponPawn: args[6],
      previous: [args[0]]
    };
    if(data.victimName === "nullptr") {
      data.delayWoundedCall = true;
    }
    logParser.eventStore.matchData[args[3]] = data;

    if(data.victimName != "nullptr") logParser.emit('PLAYER_DAMAGED', data);
  }
};
