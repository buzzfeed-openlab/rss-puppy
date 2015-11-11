
var events = require('events'),
    Monitor = require('./monitor/monitor'),
    config = require('./config.json');

// create global event system
var emitter = new events.EventEmitter();

// initialize outputs
var outputs = [];
for (var i = 0; i < config['outputs'].length; ++i) {
    var outputConfig = config['outputs'][i];

    var Output = require(outputConfig['file']);
    outputs.push(new Output(emitter, outputConfig['config']));
}

// add debug handlers
emitter.on('old-feed', function(feed) {
    console.log('old-feed: ', feed);
});

emitter.on('new-entry', function(entry) {
    console.log('new-entry: ', entry.guid);
});

emitter.on('error', function(err) {
    console.log('error:\n', err);
});

// start monitor
var monitor = new Monitor(config['feeds'], config['rate'], config['dbconfig'], emitter);
