
var Twit = require('twit'),
    config = require('./twitter-config.json');

var TwitterModule = module.exports = function (eventEmitter) {
    this.twit = new Twit(config);

    eventEmitter.on('newTweet', function(text) {
        this.tweet(text, function(err) {
            err && console.log(err);
        });
    }.bind(this));
};

TwitterModule.prototype.tweet = function (status, cb) {
    if (!cb) {
        throw new Error('you must pass a callback to the tweet function');
    } else if (typeof status !== 'string') {
        return cb(new Error('tweet must be of type String'));
    } else if (status.length > 140) {
        return cb(new Error('tweet is too long: ' + status.length));
    }
    this.twit.post('statuses/update', { status: status }, cb);
};
