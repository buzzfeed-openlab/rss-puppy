
var events = require('events'),
    fs = require('fs');

// global event system used for communication between
// all loaded modules
var puppyEmitter = new events.EventEmitter();

module_files = fs.readdirSync('./modules').filter(function (filename) {
    return filename.indexOf("-module") > -1;
});

modules = module_files.map(function (filename) {
    var Module = require('./modules/' + filename);
    return new Module(puppyEmitter);
});

puppyEmitter.emit('newTweet', 'beep bloop bop, I am a computer!');
