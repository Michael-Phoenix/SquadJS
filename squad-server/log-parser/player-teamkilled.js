export default {
  //[2022.04.09-21.07.47:205][355]LogSquadScorePoints: Verbose: ScorePointsDelayed: Points: -2.000000 ScoreEvent: TeamKilled Mrlegoface
  regex: /^\[([0-9.:-]+)\]\[([ 0-9]*)\]LogSquadScorePoints: Verbose: ScorePointsDelayed: Points: .* ScoreEvent: TeamKilled (.*)$/,
  onMatch: (args, logParser) => {
  Logger.verbose('LogParser', 3, `TEAMKILL was found.`);

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
  logParser.emit('TEAMKILL', data);
  }
};
