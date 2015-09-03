
var events = require('events');
var TwitterModule = require('./twitter.js');

// global event system used for communication between
// all loaded modules
var puppyEmitter = new events.EventEmitter();

var twitterPuppy = new TwitterModule(puppyEmitter);

puppyEmitter.emit('newTweet', 'beep boop bop, I am a computer!');
