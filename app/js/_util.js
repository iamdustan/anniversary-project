import { prependTo } from './es6query';
import { getXML } from './ajax';

var CACHE = {};

export var loadInto = (element, name) => {
  var success = (resp) => {
    if (element)
      prependTo(element, resp);
    return resp;
  };

  var error = (err) => console.error(`Failed to load "images/${name}.svg"`, err.message, err.stack)
  if (CACHE[name])
    return CACHE[name].then(success, error);

  CACHE[name] = getXML(`images/${name}.svg`).then(success, error);

  return CACHE[name];
};

export var fadeInto = (element, name) => {
  return loadInto(element, name).then((el) => {
    el.setAttribute('class', 'livets-ord actor actor-is-loading');
    setTimeout(() => el.setAttribute('class', 'livets-ord actor'), 100);
  });
}

