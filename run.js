
var configPath = (process.argv[2] || './config.json');

var events = require('events'),
    Monitor = require('./monitor/monitor'),
    config = require(configPath);

// create global event system
var emitter = new events.EventEmitter();

// always log errors, just in case
emitter.on('error', function(err) {
    console.log('error:\n', err);
});

// initialize outputs
var outputs = [];
for (var i = 0; i < config['outputs'].length; ++i) {
    var outputConfig = config['outputs'][i];

    var Output = require(outputConfig['file']);
    outputs.push(new Output(emitter, outputConfig['config']));
}

// start monitor
var monitor = new Monitor(config['feeds'], config['rate'], config['dbconfig'], emitter);
