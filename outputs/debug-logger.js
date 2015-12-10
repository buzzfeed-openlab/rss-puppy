

var DebugLogger = module.exports = function(emitter, config) {
    this.emitter = emitter;
    this.config = config;

    if (config.showOldFeedMessages) {
        emitter.on('checking-old-feeds', function() {
            var timeStamp = (new Date()).toString();
            console.log(timeStamp, ' checking for out of date feeds...');
        });

        emitter.on('old-feed', function(feed) {
            var timeStamp = (new Date()).toString();
            console.log(timeStamp, ' old feed: ', feed);
        });
    }

    emitter.on('new-entry', this.onNewEntry);
};

DebugLogger.prototype.onNewEntry = function(entry, feed) {
    var timeStamp = (new Date()).toString();
    console.log(timeStamp, ' > new entry on feed: ' + feed + '\n   with id: ' + entry.guid);
};


