var Promise = require('es6-promise').Promise;
var typewriter = require('typewriter');

import { CONFIG } from './../config';

var generateTypewriter = (name) => {
  return typewriter(Scene.TYPEWRITER)
    .withAccuracy(99.5)
    .withMinimumSpeed(CONFIG[name].MIN_SPEED)
    .withMaximumSpeed(CONFIG[name].MAX_SPEED)
    .build();
}

class Scene {
  constructor(name, sceneFn) {
    this.name = name;
    this._sceneFn = sceneFn

    this._playPromise;
    this.typewriter = generateTypewriter(this.name);
  }

  start(context) {
    if (this._playPromise)
      return this._playPromise;

    this._playPromise = new Promise((resolve, reject) => {
      this._sceneFn(context, resolve);
    });

    return this._playPromise;
  }
}

Scene.TYPEWRITER = document.getElementById('typewriter');
Scene.CONFIG = CONFIG;

module.exports = { Scene };

