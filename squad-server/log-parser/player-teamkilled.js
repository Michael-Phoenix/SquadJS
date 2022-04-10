export default {
  //[2022.04.09-21.07.47:205][355]LogSquadScorePoints: Verbose: ScorePointsDelayed: Points: -2.000000 ScoreEvent: TeamKilled Mrlegoface
  regex: /^\[([0-9.:-]+)]\[([ 0-9]*)]LogSquadScorePoints: Verbose: ScorePointsDelayed: Points: .* ScoreEvent: TeamKilled ([A-z_0-9]+)
  onMatch: (args, logParser) => {
    if(logParser.eventStore["nullptr"].chainID == args[2]){
      wasNullptr = true
      const data = {
        ...logParser.eventStore["nullptr"],
        raw: args[0],
        time: args[1],
        chainID: args[2],
        victimName: args[3]
      };
      delete logParser.eventStore["nullptr"];
      logParser.eventStore[args[3]] = data;
      logParser.emit('PLAYER_WOUNDED', data);
    }
  }
};
