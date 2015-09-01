
var events = require('events');
var TwitterModule = require('./twitter.js');
var twitterConfig = require('./twitter-config.json');

var twitterPuppy = new TwitterModule(twitterConfig);


// global event system used for communication between
// all loaded modules
var puppyEmitter = new events.EventEmitter();

puppyEmitter.on('shortTextBlob', function(text) {
    twitterPuppy.tweet(text, function(err) {
        err && console.log(err);
    });
});

puppyEmitter.emit('shortTextBlob', 'beep boop bop, I am a computer!');
