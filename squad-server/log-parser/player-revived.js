export default {
  // the names are currently the wrong way around in these logs
  regex: /^\[([0-9.:-]+)]\[([ 0-9]*)]LogSquad: (.+) has revived (.+)\./,
  onMatch: (args, logParser) => {
    const data = {
      ...logParser.eventStore[args[4]],
      raw: args[0],
      time: args[1],
      chainID: args[2],
      reviverName: args[3],
      victimName: args[4]
    };
    // We need to clear Damage/Wound/Died on revive
    delete logParser.eventStore.matchData[args[4]];
    logParser.emit('PLAYER_REVIVED', data);
  }
};
