
var events = require('events'),
    Monitor = require('./monitor'),
    config = require('./config.json');

var emitter = new events.EventEmitter();

// register outputs to handle new rss entries
// ...
emitter.on('new-entry', function(entry) {
    console.log('NEW ENTRY:\n', entry);
});

emitter.on('error', function(err) {
    console.log('error:\n', err);
});

// start monitor with feeds, dbconfig, and the emitter
var monitor = new Monitor(["feed1", "feed2"], config['dbconfig'], emitter);
