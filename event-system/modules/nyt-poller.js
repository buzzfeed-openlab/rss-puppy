
var fetch = require('node-fetch');

var NytPollingModule = module.exports = function (eventEmitter, config) {
    this.emitter = eventEmitter;
    this.most_popular_key = config['keys']['most-popular'];

    setInterval(this.getMostPopular.bind(this), config['poll-interval']);
};

NytPollingModule.prototype.getMostPopular = function () {
    fetch('http://api.nytimes.com/svc/mostpopular/v2/mostshared/all-sections/1.json?api-key='
        + this.most_popular_key).then(function (res) {
            return res.json();
    }.bind(this)).then(function (json) {
        this.emitter.emit('nyt-most-popular', json['results']);
    }.bind(this));
};
