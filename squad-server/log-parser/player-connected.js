export default {
  regex: /^\[([0-9.:-]+)]\[([ 0-9]*)]LogNet: Join succeeded: (.+)/,
  onMatch: (args, logParser) => {
    const data = {
      ...logParser.eventStore['player-login'],
      raw: args[0],
      time: args[1],
      chainID: args[2],
      playerSuffix: args[3]
    };
    delete logParser.eventStore['player-login'];
    logParser.emit('PLAYER_CONNECTED', data);
  }
};
