import axios from 'axios';

import Logger from 'core/logger';

import Layer from './layer.js';

class Layers {
  constructor() {
    this.layers = [];

    this.pulled = false;
  }

  async pull(force = false) {
    if (this.pulled && !force) {
      Logger.verbose('Layers', 2, 'Already pulled layers.');
      return;
    }
    if (force) Logger.verbose('Layers', 1, 'Forcing update to layer information...');

    this.layers = [];

    Logger.verbose('Layers', 1, 'Pulling layers...');
    const response = await axios.get(
      'https://raw.githubusercontent.com/Squad-Wiki-Editorial/squad-wiki-pipeline-map-data/master/completed_output/_Current%20Version/finished.json'
    );

    for (const layer of response.data.Maps) {
      this.layers.push(new Layer(layer));
    }

    Logger.verbose('Layers', 1, `Pulled ${this.layers.length} layers.`);

    this.pulled = true;

    return this.layers;
  }

  async getLayerByCondition(condition) {
    await this.pull();

    const matches = this.layers.filter(condition);
    //Return first match, even though more than one exists in the list (List Error)
    if (matches.length >= 1) return matches[0];

    return null;
  }

  async getLayerByName(name) {
    //return at least the info we already have
    let layer = await this.getLayerByCondition((layer) => layer.name === name);
    Logger.verbose('Layers', 1, `Pulled "${JSON.stringify(layer)}" as a layer.`);
    if(!layer) {
      layer.name = name;
      layer.classname = name.replace(/ /g, "_");
      layer.layerid = name.replace(/ /g, "_");
    }
    Logger.verbose('Layers', 1, `Layer now is "${JSON.stringify(layer)}"`);
    return layer;

  }

  async getLayerByClassname(classname) {
    //return at least the info we already have
    let layer = await this.getLayerByCondition((layer) => layer.classname === classname);
    Logger.verbose('Layers', 1, `Pulled "${JSON.stringify(layer)}" as a layer.`);
    if(!layer) {
      layer.classname = classname;
      layer.name = classname.replace(/_/g, " ");
      layer.layerid = classname;
    }
    Logger.verbose('Layers', 1, `Layer now is "${JSON.stringify(layer)}"`);
    return layer;
  }
}

export default new Layers();
