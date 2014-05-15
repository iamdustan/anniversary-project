var Promise = require('es6-promise').Promise;
var typewriter = require('typewriter');

import { $$ } from './../es6query';
import { fadeInto } from './../_util';
import { CONFIG } from './../config';

var generateTypewriter = (name) => {
  var minSpeed = 8, maxSpeed = 12;
  if (CONFIG[name]) {
    var minSpeed = CONFIG[name].MIN_SPEED
    var maxSpeed = CONFIG[name].MAX_SPEED
  }
  return typewriter(Scene.TYPEWRITER)
    .withAccuracy(99.9)
    .withMinimumSpeed(minSpeed)
    .withMaximumSpeed(maxSpeed)
    .build();
}

class Scene {
  constructor(name, options, sceneFn) {
    if (typeof options === 'function' || typeof options === 'undefined') {
      sceneFn = options;
      options = {};
    }

    this.name = name;
    this.options = options || {};
    this.sceneFn = sceneFn || this._defaultSceneFn;

    this._playPromise;
    this.typewriter = generateTypewriter(this.name);
  }

  start(context) {
    if (this._playPromise)
      return this._playPromise;

    this._playPromise = new Promise((resolve, reject) => {
      this.sceneFn(context, resolve);
    });

    return this._playPromise;
  }

  _defaultSceneFn(content, done) {
    console.log('Starting %s', this.name);
    var tw = this.typewriter;

    tw.clear();
    content.content.forEach((l, i) => {
      tw
        .waitRange(500, 2000, (o) => {
          if (!this.options.element || i !== 0) return;

          fadeInto($$('#scene'), this.options.element);
        })
        .type(l)
        .put('<br />');
    });

    tw
      .waitRange(500, 2000)
      .type('', () => {
        console.log('Ending %s', this.name);
        done();
      });
  }
}

Scene.TYPEWRITER = document.getElementById('typewriter');
Scene.CONFIG = CONFIG;

module.exports = { Scene };

