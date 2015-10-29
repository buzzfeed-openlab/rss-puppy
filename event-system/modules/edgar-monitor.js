var FeedParser = require('feedparser'),
    request = require('request');

var EdgarMonitor = module.exports = function(emitter, config) {
    this.emitter = emitter;
    this.config = config;

    var feeds = config['feeds'];
    for (var i = 0; i < feeds.length; ++i) {
        setInterval(parseFeed.bind(this, feeds[i]), config['poll-interval']);
    }
}

function parseFeed(feed) {
    var emitter = this.emitter;

    var options = {
        url: feed,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml'
        }
    };

    var req = request(options);
    var feedparser = new FeedParser();

    req.on('error', logError);
    req.on('response', function(res) {
        if (res.statusCode != 200) {
            return this.emit('error', new Error('bad status code: ' + res.statusCode));
        }
        this.pipe(feedparser);
    });

    feedparser.on('error', logError);
    feedparser.on('readable', function() {
        var stream = this,
            meta = this.meta,
            entry;

        while(entry = stream.read()) {
            console.log(entry);
            console.log('=======================');
            emitter.emit('edgar-entry', entry);
        }
    });
};

function logError(err) {
    console.log('> error in edgar monitor: \n', err);
}
