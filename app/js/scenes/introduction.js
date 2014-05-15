import { Scene } from './_scene';
import { $$ } from './../es6query';

export var introduction = new Scene('Introduction', function(content, done) {
  console.log('Starting %s', this.name);
  var tw = this.typewriter;

  tw.clear();
  content.content.forEach((l) => {
    tw
      .waitRange(500, 2000)
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

