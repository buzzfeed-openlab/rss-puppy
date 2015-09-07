
var Twit = require('twit');

var TwitterModule = module.exports = function (eventEmitter, config) {
    this.twit = new Twit(config);
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
