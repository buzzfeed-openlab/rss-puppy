
var timequeue = require('timequeue'),
    pg = require('pg'),
    fs = require('fs');

var Monitor = module.exports = function Monitor(feeds, rate, dbconfig, emitter) {
    this.feeds = feeds;
    this.emitter = emitter;

    dbconfig.connectionString = this.buildDBConnectionString(dbconfig);

    this.setupDatabase(dbconfig, emitter);

    this.feedQueryInterval = setInterval(this.queryOldFeeds.bind(this, dbconfig, emitter), rate);
};

Monitor.prototype.buildDBConnectionString = function(dbconfig) {
    if (dbconfig['connectionString']) {
        return dbconfig['connectionString'];
    }

    var user = dbconfig['user'],
        pw = dbconfig['password'],
        url = dbconfig['url'],
        port = dbconfig['port'],
        dbname = dbconfig['dbname'];

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
            emitter.emit(err);
        }

        if (err) { return handleError(err); }

        this.runDBScript(client, './init-feed-db.sql', function(err, result) {
            if (err) { return handleError(err); }

            var feedChunks = [];
            for (var i = 1; i <= this.feeds.length; ++i) {
                feedChunks.push('($' + i + ', DEFAULT)');
            }

            client.query('INSERT INTO feeds (feed, lastUpdated) VALUES ' + feedChunks.join(', '),
                this.feeds, function(err, result) {

                if (err) { return handleError(err); }

                console.log('SETUP!');
                done();
            });

        }.bind(this));
    }.bind(this));
};

Monitor.prototype.queryOldFeeds = function(dbconfig, emitter) {
    pg.connect(dbconfig.connectionString, function(err, client, done) {
        function handleError(err) {
            if(client) {
                done(client);
            }
            emitter.emit(err);
        }

        if (err) { return handleError(err); }

        console.log('***');

        var query = client.query('SELECT * FROM feeds WHERE lastUpdated < NOW() - INTERVAL \'15 seconds\' OR lastUpdated IS NULL');

        query.on('error', handleError);

        query.on('row', function(row) {
            console.log(row.feed);
            this.queryFeed(row.feed, dbconfig, emitter);
        }.bind(this));

        query.on('end', function(result) {
            console.log('done...')
            done();
        });

    }.bind(this));
};

Monitor.prototype.queryFeed = function(feed, dbconfig, emitter) {
    // will do...

    this.updateTimestamp(feed, dbconfig, emitter);
};

Monitor.prototype.updateTimestamp = function(feed, dbconfig, emitter) {
    pg.connect(dbconfig.connectionString, function(err, client, done) {
        function handleError(err) {
            if(client) {
                done(client);
            }
            emitter.emit(err);
        }

        if (err) { return handleError(err); }

        client.query('UPDATE feeds SET lastUpdated = NOW() WHERE feed = $1', [feed], function(err, result) {
            if (err) { return handleError(err); }
            done();
        });
    });
};