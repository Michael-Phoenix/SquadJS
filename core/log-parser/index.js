import EventEmitter from 'events';

import async from 'async';
import moment from 'moment';

import Logger from '../logger.js';

import TailLogReader from './log-readers/tail.js';
import FTPLogReader from './log-readers/ftp.js';

export default class LogParser extends EventEmitter {
  constructor(filename = 'filename.log', options = {}) {
    super();

    options.filename = filename;

    this.eventStore = {
      disconnected: {},
      players: {},
      matchData: {},
      clients: {}
    };

    this.options = options;
    this.linesPerMinute = 0;
    this.matchingLinesPerMinute = 0;
    this.matchingLatency = 0;
    this.parsingStatsInterval = null;

    this.processLine = this.processLine.bind(this);
    this.logStats = this.logStats.bind(this);

    this.queue = async.queue(this.processLine);
  }

  async processLine(line) {
    Logger.verbose('LogParser', 4, `Matching on line: ${line}`);

    for (const rule of this.getRules()) {
      const match = line.match(rule.regex);

      if (!match) continue;

      Logger.verbose('LogParser', 3, `Matched on line: ${match[0]}`);

      match[1] = moment.utc(match[1], 'YYYY.MM.DD-hh.mm.ss:SSS').toDate();
      match[2] = parseInt(match[2]);

      await rule.onMatch(match, this);

      this.matchingLinesPerMinute++;
      this.matchingLatency += Date.now() - match[1];

      break;
    }

    this.linesPerMinute++;
  }

  getPlayerByNameToSuffix(name) {
    const matches = Object.values(this.eventStore.players).filter((player) =>
      name.endsWith(player.suffix)
    );
    if (matches.length !== 1) {
      // Name Collisions, return null.
      return;
    }
    return matches[0];
  }

  getPlayerfromController(controller) {
    const matches = Object.values(this.eventStore.players).filter(
      (player) => player.controller === controller
    );
    if (matches.length !== 1) {
      // This Shouldn't ever happen.
      return;
    }
    return matches[0];
  }

  reapEventStore() {
    Logger.verbose('LogParser', 1, 'Cleaning Eventstore');
    for (const player of Object.values(this.eventStore.players)) {
      if (this.eventStore.disconnected[player.steamID] === true) {
        Logger.verbose('LogParser', 2, `Removing ${player.steamID} from eventStore`);
        delete this.eventStore.players[player.steamID];
        delete this.eventStore.disconnected[player.steamID];
      }
    }
    this.eventStore.matchData = {};
  }

  getRules() {
    return [];
  }

  async watch() {
    Logger.verbose('LogParser', 1, 'Attempting to watch log file...');
    // If We call these in the constructor, they immediately start to tail, and calling
    // watch() here actually does nothing, as we are already watching
    switch (this.options.mode || 'tail') {
      case 'tail':
        this.logReader = new TailLogReader(this.queue.push, this.options);
        break;
      case 'ftp':
        this.logReader = new FTPLogReader(this.queue.push, this.options);
        break;
      default:
        throw new Error('Invalid mode.');
    }
    await this.logReader.watch();
    Logger.verbose('LogParser', 1, 'Watching log file...');

    this.parsingStatsInterval = setInterval(this.logStats, 60 * 1000);
  }

  logStats() {
    Logger.verbose(
      'LogParser',
      1,
      `Lines parsed per minute: ${
        this.linesPerMinute
      } lines per minute | Matching lines per minute: ${
        this.matchingLinesPerMinute
      } matching lines per minute | Average matching latency: ${
        this.matchingLatency / this.matchingLinesPerMinute
      }ms`
    );
    this.linesPerMinute = 0;
    this.matchingLinesPerMinute = 0;
    this.matchingLatency = 0;
  }

  async unwatch() {
    await this.logReader.unwatch();

    clearInterval(this.parsingStatsInterval);
  }
}
