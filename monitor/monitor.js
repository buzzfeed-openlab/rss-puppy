
var TimeQueue = require('timequeue'),
    pg = require('pg'),
    fs = require('fs'),
    request = require('request'),
    FeedParser = require('feedparser');

var Monitor = module.exports = function Monitor(feeds, throttling, dbconfig, emitter) {
    this.feeds = feeds;
    this.dbconfig = dbconfig;
    this.emitter = emitter;

    this.queryQueue = new TimeQueue(
        this.queryFeed.bind(this, dbconfig, emitter),
        { concurrency: throttling.maxConcurrent, every: throttling.concurrentInterval }
    );

    if (dbconfig.maxConnections) {
        pg.defaults.poolSize = dbconfig.maxConnections;
    }

    dbconfig.connectionString = this.buildDBConnectionString(dbconfig);

    this.setupDatabase(dbconfig, emitter);

    // hook up feed monitoring
    this.feedQueryInterval = setInterval(
        this.checkForOldFeeds.bind(this, throttling.oldFeedThreshold, dbconfig, emitter),
        throttling.monitorFrequency
    );
    emitter.on('old-feed', function(feed) { this.queryQueue.push(feed); }.bind(this));
    emitter.on('feed-parsed', this.updateTimestamp.bind(this, dbconfig, emitter));
    emitter.on('entry', this.persistEntry.bind(this, dbconfig, emitter));
};

Monitor.prototype.buildDBConnectionString = function(dbconfig) {
    if (dbconfig['connectionString']) {
        return dbconfig['connectionString'];
    }

    var user = encodeURIComponent(dbconfig['user']),
        pw = encodeURIComponent(dbconfig['password']),
        url = encodeURIComponent(dbconfig['url']),
        port = encodeURIComponent(dbconfig['port']),
        dbname = encodeURIComponent(dbconfig['dbname']);

    return 'postgres://' + user + ':' + pw + '@' + url + ':' + port + '/' + dbname;
};

Monitor.prototype.runDBScript = function(client, filename, cb) {
    var script = fs.readFileSync(filename).toString();
    client.query(script, cb);
};

Monitor.prototype.setupDatabase = function(dbconfig, emitter) {
    pg.connect(dbconfig.connectionString, function(err, client, done) {
        function handleError(err) {
            if(client) {
                done(client);
            }
            emitter.emit('error', err);
        }

        if (err) { return handleError(err); }

        this.runDBScript(client, dbconfig.initScript, function(err, result) {
            if (err) { return handleError(err); }

            var feedChunks = [];
            for (var i = 1; i <= this.feeds.length; ++i) {
                feedChunks.push('($' + i + ', DEFAULT)');
            }

            client.query('INSERT INTO feeds (feed, lastUpdated) VALUES ' + feedChunks.join(', '),
                this.feeds, function(err, result) {

                if (err) { return handleError(err); }

                done();
            });

        }.bind(this));
    }.bind(this));
};

Monitor.prototype.checkForOldFeeds = function(ageThreshold, dbconfig, emitter) {
    emitter.emit('checking-old-feeds');

    pg.connect(dbconfig.connectionString, function(err, client, done) {
        function handleError(err) {
            if(client) {
                done(client);
            }
            emitter.emit('error', err);
        }

        if (err) { return handleError(err); }

        var query = client.query('SELECT * FROM feeds WHERE lastUpdated < NOW() - INTERVAL \'' + ageThreshold + ' seconds\' OR lastUpdated IS NULL');

        query.on('error', handleError);

        query.on('row', function(row) {
            emitter.emit('old-feed', row.feed);
        }.bind(this));

        query.on('end', function(result) {
            done();
        });

    }.bind(this));
};

Monitor.prototype.queryFeed = function(dbconfig, emitter, feed, cb) {
    function handleError(err) {
        emitter.emit('error', err);
    }

    var options = {
        url: feed,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml'
        }
    };

    var req = request(options);
    var feedparser = new FeedParser();

    req.on('error', handleError);
    req.on('response', function(res) {
        if (res.statusCode != 200) {
            return this.emit('error', new Error('bad status code: ' + res.statusCode));
        }
        this.pipe(feedparser);
    });

    feedparser.on('error', handleError);
    feedparser.on('readable', function() {
        var stream = this,
            entry;

        while(entry = stream.read()) {
            emitter.emit('entry', entry, feed);
        }

        emitter.emit('feed-parsed', feed);
    });
    feedparser.on('end', function() {
        cb && cb(null, feed);
    });
};

Monitor.prototype.updateTimestamp = function(dbconfig, emitter, feed) {
    pg.connect(dbconfig.connectionString, function(err, client, done) {
        function handleError(err) {
            if(client) {
                done(client);
            }
            emitter.emit('error', err);
        }

        if (err) { return handleError(err); }

        client.query('UPDATE feeds SET lastUpdated = NOW() WHERE feed = $1',
            [feed], function(err, result) {

            if (err) { return handleError(err); }
            done();
        });
    });
};

Monitor.prototype.persistEntry = function(dbconfig, emitter, entry, feed) {
    pg.connect(dbconfig.connectionString, function(err, client, done) {
        function handleError(err) {
            if(client) {
                done(client);
            }
            emitter.emit('error', err);
        }

        if (err) { return handleError(err); }

        client.query('SELECT * FROM entries WHERE id = $1', [entry.guid], function(err, result) {
            if (err) { return handleError(err); }

            if (result.rows.length) { return done(); }

            client.query('INSERT INTO entries (id, feed, title, date, link) VALUES ($1, $2, $3, $4, $5)',
                [entry.guid, feed, entry.title, entry.date, entry.link], function(err, result) {

                if (err) { return handleError(err); }

                emitter.emit('new-entry', entry, feed);
                done();
            });
        });
    });
};
