import { $, $$, on, off, delegateTo, prependTo } from './es6query';
import { scenes } from './scenes';
import { loadInto } from './_util';

loadInto($$('#storybox'), 'dustan');
loadInto($$('#scene'), 'water');

var rand = (min, max) => Math.random() * (max - min) + min;

loadInto(null, 'cloud').then((el) => {
  var container = $$('#scene');
  var width = container.clientWidth;
  var clouds = Array.apply(0, Array(3)).map(_=>el.cloneNode(true));

  clouds.forEach(prependTo.bind(null, container));
  clouds.forEach((c, i) => {
    var scale = rand(0.9, 1.4);
    var y = rand(6, 80);
    var w = c.clientWidth * scale;
    var tween = new TWEEN.Tween({x: width + w * Math.random()})
      .to({ x: -w}, 26000)
      .repeat(Infinity)
      .onUpdate(function(time) {
        var _x = this.x - (width / (i + 1));
        var _y = (Math.sin(time) * 2) + y;
        c.style.webkitTransform = `scale(${scale}) translate(${_x}px,${_y}px)`;
      })
      .start();
  });
});

scenes[0].scene.start(scenes[0])
  .then(()=>scenes[1].scene.start(scenes[1]))
  .then(()=>scenes[2].scene.start(scenes[2]))
  .then(()=>{return scenes[3].scene.start(scenes[3])});

[
  'livets-ord',
  'uppsala',
  'tiramisu',
  'hutchinson',
  'lincolnton',
  'courthouse',
].forEach(loadInto.bind(null, null));

var fadeIn = () => document.body.classList.remove('is-loading');

on(document.body, 'click', delegateTo('button', (e) => {
  console.log('clicked that thing');
}));

(function animate() {
  requestAnimationFrame(animate);
  TWEEN.update();
})();

