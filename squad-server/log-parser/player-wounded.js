export default {
  //[2022.06.22-20.53.09:412][ 90]LogSquadTrace: [DedicatedServer]Wound(): Player:*RH* Pantern KillingDamage=180.000000 from BP_PlayerController_C_2147231371 caused by BP_AK74M_1P78_C_2147209352
  regex:
    /\[([0-9.:-]+)]\[([ 0-9]*)]LogSquadTrace: \[DedicatedServer](?:ASQSoldier::)?Wound\(\): Player:(.+) KillingDamage=(?:-)*([0-9.]+) from ([A-z_0-9]+) caused by (([A-z_0-9]+)_C_[0-9]+)/,
  onMatch: (args, logParser) => {
    let data = {
      ...logParser.eventStore.matchData[args[3]],
      raw: args[0],
      time: args[1],
      chainID: args[2],
      victimName: args[3],
      damage: parseFloat(args[4]),
      attackerPlayerController: args[5],
      weapon: args[7]
    };
    if(data.victimName === "nullptr") {
      data.delayWoundedCall = true;
    }
    logParser.eventStore.matchData[args[3]] = data;

    if(!data.delayWoundedCall) logParser.emit('PLAYER_WOUNDED', data);
  }
};
