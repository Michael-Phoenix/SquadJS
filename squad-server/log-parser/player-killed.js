export default {
  //[2022.05.31-22.44.02:917][735]LogSquadScorePoints: Verbose: ScorePointsDelayed: Points: 10.000000 ScoreEvent: Killed
  regex: /\[([0-9.:-]+)\]\[([ 0-9]*)\]LogSquadScorePoints: Verbose: ScorePointsDelayed: Points: ([0-9]+\.).* ScoreEvent: Killed (.*)$/,
  onMatch: (args, logParser) => {
    let data = {};
    if(logParser.eventStore.matchData["nullptr"]) {
      if(logParser.eventStore.matchData["nullptr"].time.getTime() >= args[1].getTime() - 100){
        data = {
          ...logParser.eventStore.matchData["nullptr"],
          raw: args[0],
          time: args[1],
          chainID: args[2],
          instagib: (args[3] == 10?true:false),
          victimName: args[4]
        };
        data = {
          raw: args[0],
          time: args[1],
          chainID: args[2]
        }
        delete logParser.eventStore.matchData["nullptr"];
      } else {
        delete logParser.eventStore.matchData["nullptr"];
      }
    } else {
      data = {
        ...logParser.eventStore.matchData[args[4]],
        raw: args[0],
        time: args[1],
        chainID: args[2],
        instagib: (args[3] == 10?true:false),
        victimName: args[4]
      };
    }


    delete logParser.eventStore.matchData[args[4]];
    if(data.delayDamagedCall) logParser.emit('PLAYER_DAMAGED', data);
    if(data.delayWoundedCall) logParser.emit('PLAYER_WOUNDED', data);
    if(data.delayDiedCall) logParser.emit('PLAYER_DIED', data);
    logParser.emit('KILL', data);
  }
};
