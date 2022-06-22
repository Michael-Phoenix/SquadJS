export default {
  regex:
    /\[([0-9.:-]+)]\[([ 0-9]*)]LogSquadTrace: \[DedicatedServer]TraceAndMessageClient\(\): (.+): ([0-9.]+) damage taken by causer (([A-z0-9_]+)_C_[0-9]+) instigator (.+) health remaining ([0-9.]+)/,
  onMatch: (args, logParser) => {
    const data = {
      raw: args[0],
      time: args[1],
      chainID: args[2],
      victimSuffix: args[3],
      damage: parseFloat(args[4]),
      weapon: args[6],
      weaponPawn: args[5],
      attackerSuffix: args[7],
      healthRemaining: args[8],
      previous: [args[0]]
    };
    logParser.eventStore.matchData[data.victimSuffix] = data;
  }
};
