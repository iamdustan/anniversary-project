import { $, $$, on, off, delegateTo, prependTo } from './es6query';
import { getXML } from './ajax';

var typewriter = require('typewriter');

var FACES = {};
var loadInto = (element, name) => {
  return getXML(`images/${name}.svg`).then(
    (resp) => {
      FACES[name] = resp;
      prependTo(element, resp);
    },
    (err) => console.error(`Failed to load "images/${name}.svg"`, err.message, err.stack)
  );
};

loadInto($$('#storybox'), 'dustan');
[
  'water',
  'clouds',
  'livets-ord',
  'uppsala',
  'tiramisu',
  'hutchinson',
  'lincolnton',
  'courthouse',
].forEach(loadInto.bind(null, $$('#scene')));

var fadeIn = () => document.body.classList.remove('is-loading');

on(document.body, 'click', delegateTo('button', (e) => {
  console.log('clicked that thing');
}));

var tw = typewriter($$('#typewriter'))
  .withAccuracy(99)
  .withMinimumSpeed(5)
  .withMaximumSpeed(10)
  .build();

tw.clear()
  .waitRange(1000, 2000)
  .type('Hello Mel,')
  .put('<br />')
  .waitRange(1000, 2000)
  .type('This is awesome. You are amazing.')
  .put('<br/>')
  .wait(2000)
  .type('Thank you. Thank you. ')
  .waitRange(500, 1000)
  .type('Thank you.')
  .put('<br/>')
  .waitRange(1000, 2000)
  .type('Sincerely,')
  .put('<br/>')
  .type('Dustan', () => console.log('finished'));

