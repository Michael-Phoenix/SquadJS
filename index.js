import SquadServerFactory from 'squad-server/factory';
import printLogo from 'squad-server/logo';
import Logger from 'core/logger';

async function main() {
  try{
    await printLogo();
  } catch (err) {
    Logger.verbose(
      'Main',
      1,
      `Error in printLogo():`, err
    );
  }

  const config = process.env.config;
  const configPath = process.argv[2];
  if (config && configPath) throw new Error('Cannot accept both a config and config path.');

  // create a SquadServer instance

    const server = config
      ? await SquadServerFactory.buildFromConfigString(config).catch(e => console.log(e))
      : await SquadServerFactory.buildFromConfigFile(configPath || './config.json').catch(e => console.log(e));



  // watch the server
  try{
    await server.watch();
  } catch (err) {
    Logger.verbose(
      'Main',
      1,
      `Error in server.watch():`, err
    );
  }

  // now mount the plugins
  try{
    await Promise.all(server.plugins.map(async (plugin) => await plugin.mount()));
  } catch (err) {
    Logger.verbose(
      'Main',
      1,
      `Error in Plugins:`, err
    );
  }
}

main();
