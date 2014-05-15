import { Scene } from './_scene';
import { $$ } from './../es6query';
import { fadeInto } from './../_util';

export var livetsOrd = new Scene('Livets Ord', function(content, done) {
  console.log('Starting Livets Ord');
  var tw = this.typewriter;

  tw.clear();
  content.content.forEach((l, i) => {
    tw
      .waitRange(500, 2000, (o) => {
        if (i !== 0) return;
        fadeInto($$('#scene'), 'livets-ord');
      })
      .type(l)
      .put('<br />');
  });

  tw
    .waitRange(500, 2000)
    .type('', () => {
      console.log('Ending Livets Ord');
      done();
    });
});

