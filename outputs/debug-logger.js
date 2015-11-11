

var DebugLogger = module.exports = function(emitter, config) {
    this.emitter = emitter;
    this.config = config;

    if (config.showOldFeedMessages) {
        emitter.on('checking-old-feeds', function() {
            console.log('checking for out of date feeds...');
        });

        emitter.on('old-feed', function(feed) {
            console.log('old feed: ', feed);
        });
    }

    emitter.on('new-entry', this.onNewEntry);
};

DebugLogger.prototype.onNewEntry = function(entry, feed) {
    console.log('> new entry on feed: ' + feed + '\n  with id: ' + entry.guid);
};


