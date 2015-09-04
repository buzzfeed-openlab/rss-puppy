
var Twit = require('twit'),
    config = require('./twitter-config.json');

var TwitterModule = module.exports = function(eventEmitter) {
    var that = this;

    that.twit = new Twit(config);

    eventEmitter.on('newTweet', function(text) {
        that.tweet(text, function(err) {
            err && console.log(err);
        });
    });
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
