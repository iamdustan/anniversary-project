import { $, $$, on, off, delegateTo } from './es6query';
import { getXML } from './ajax';

var FACES = {};

getXML('images/dustan.svg').then(
  (resp) => {
    FACES['dustan'] = resp;
    var s = $$('#storybox');
    s.insertBefore(resp, s.firstChild);
  },
  (err) => {}
);

var typewriter = require('typewriter');
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

