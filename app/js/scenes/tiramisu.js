import { Scene } from './_scene';
import { $$ } from './../es6query';
import { fadeInto } from './../_util';

export var tiramisu = new Scene('Tiramisu', function(content, done) {
  console.log('Starting %s', this.name);
  var tw = this.typewriter;

  tw.clear();
  content.content.forEach((l, i) => {
    tw
      .waitRange(500, 2000, (o) => {
        if (i !== 0) return;
        fadeInto($$('#scene'), 'tiramisu');
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
});



