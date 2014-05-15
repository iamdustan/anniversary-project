import { Scene } from './_scene';

export var interlude = new Scene('Interlude', function(content, done) {
  console.log('Starting %s', this.name);
  setTimeout(() => {
    console.log('Ending %s', this.name);
    done();
  }, 1000);
});


