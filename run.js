
var configPath = (process.argv[2] || './config.json');

var events = require('events'),
    Monitor = require('./monitor/monitor'),
    config = require(configPath);

// create global event system
var emitter = new events.EventEmitter();

// always log errors, just in case
emitter.on('error', function(err) {
    var timeStamp = (new Date()).toString();
    console.log(timeStamp, ' Error:');
    console.log(err);
    console.log('-----');

    if (config.exitOnError) {
       process.exit(1);
    }
});

// initialize outputs
var outputs = [];
for (var i = 0; i < config['outputs'].length; ++i) {
    var outputConfig = config['outputs'][i];

    var Output = require(outputConfig['file']);
    outputs.push(new Output(emitter, outputConfig['config']));
}

// start monitor
var monitor = new Monitor(config['feeds'], config['throttling'], config['dbconfig'], emitter);
