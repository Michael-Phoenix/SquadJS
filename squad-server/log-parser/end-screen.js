export default {
  //[2022.07.18-18.36.35:038][993]LogGameMode: GameMode returned ReadyToEndMatch

  regex:
    /\[([0-9.:-]+)]\[([ 0-9]*)]LogGameMode: GameMode returned ReadyToEndMatch/,
  onMatch: (args, logParser) => {
    const data = {
      raw: args[0],
      time: args[1],
      chainID: args[2]
    };
    logParser.emit('END_SCREEN', data);
  }
};
