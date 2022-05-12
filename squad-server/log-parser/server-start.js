export default {
  //[2022.05.10-06.24.25:962][  0]LogNetVersion: Set ProjectVersion to V2.15.0.81473.84. Version Checksum will be recalculated on next use.
  regex:
    /^\[([0-9.:-]+)]\[([ 0-9]*)]LogNetVersion: Set ProjectVersion to ([A-z0-9\.]+)\. Version Checksum will be recalculated on next use\./,
  onMatch: (args, logParser) => {
    const data = {
      raw: args[0],
      time: args[1],
      chainID: args[2],
      version: args[3]
    };

    logParser.emit('SERVER_START', data);
  }
};
