export default {
  regex: /^\[([0-9.:-]+)]\[([ 0-9]*)]LogSquad: PostLogin: NewPlayer: BP_PlayerController_C .*:PersistentLevel.(.+)/,
  onMatch: (args, logParser) => {
    const data = {
      ...logParser.eventStore['player-login'],
      raw: args[0],
      time: args[1],
      chainID: args[2],
      playerController: args[3]
    };
    logParser.eventStore['player-login'] = data;
  }
};
