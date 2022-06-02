export default {
  //[2022.06.01-00.56.31:581][635]LogSquad: Warning: Suicide Papi
  regex: /^\[([0-9.:-]+)\]\[([ 0-9]*)\]LogSquad: Warning: Suicide (.*)$/,
  onMatch: (args, logParser) => {
    Logger.verbose('LogParser', 3, `SUICIDE was found.`);
    if(logParser.eventStore.matchData["nullptr"]) {
      if(logParser.eventStore.matchData["nullptr"].time.getTime() >= args[1].getTime() - 1000){
        const data = {
          ...logParser.eventStore.matchData["nullptr"],
          raw: args[0],
          time: args[1],
          chainID: args[2],
          victimName: args[3]
        };
      } else {
        delete logParser.eventStore.matchData["nullptr"];
      }
    } else {
      const data = {
        ...logParser.eventStore.matchData[args[3]],
        raw: args[0],
        time: args[1],
        chainID: args[2],
        victimName: args[3]
      };
    }


    delete logParser.eventStore.matchData[args[3]];
    if(data.delayDamagedCall) logParser.emit('PLAYER_DAMAGED', data);
    if(data.delayWoundedCall) logParser.emit('PLAYER_WOUNDED', data);
    if(data.delayDiedCall) logParser.emit('PLAYER_DIED', data);
    logParser.emit('SUICIDE', data);
  }
};
