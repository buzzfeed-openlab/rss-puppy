
var Twit = require('twit');

var TwitterModule = module.exports = function (eventEmitter, config) {
    this.twit = new Twit(config);
};

TwitterModule.prototype.tweet = function (status) {
    if (typeof status !== 'string') {
        throw new Error('tweet must be of type String');
    } else if (status.length > 140) {
        throw new Error('tweet is too long: ' + status.length);
    }
    this.twit.post('statuses/update', { status: status }, function (err) {
        if (err) {
            throw err;
        }
    });
}