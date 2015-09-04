
var events = require('events'),
    fs = require('fs');

// global event system used for communication between
// all loaded modules
var puppyEmitter = new events.EventEmitter();

module_files = fs.readdirSync('./modules');
module_files = module_files.filter(function (filename) {
    return filename.indexOf("-module") > -1;
});

module_fns = module_files.map(function (filename) {
    return require('./modules/' + filename);
});

modules = module_fns.map(function (fn) {
    return new fn(puppyEmitter);
});

puppyEmitter.emit('newTweet', 'beep bloop bop, I am a computer!');
