
var fetch = require('node-fetch'),
    config = require('./nyt-config.json'),
    most_popular_key = config['keys']['most-popular'];

var NytPollingModule = module.exports = function (eventEmitter) {
    setInterval(this.getMostPopular.bind(this), config['poll-interval']);
};

NytPollingModule.prototype.getMostPopular = function () {
    fetch('http://api.nytimes.com/svc/mostpopular/v2/mostshared/all-sections/1.json?api-key='
        + most_popular_key).then(function (res) {
            return res.json();
    }).then(function (json) {
        emit('nyt-most-popular', json['results']);
    });
};
