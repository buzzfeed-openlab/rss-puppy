
var timequeue = require('timequeue'),
    pg = require('pg'),
    fs = require('fs');

var Monitor = module.exports = function Monitor(feeds, rate, dbconfig, emitter) {
    this.feeds = feeds;
    this.emitter = emitter;

    console.log('setupDatabase...');
    this.setupDatabase(dbconfig, emitter);

    this.feedQueryInterval = setInterval(this.queryOldFeeds.bind(this), rate);
}

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
    this.pgConnectionString = this.buildDBConnectionString(dbconfig);

    console.log(this.pgConnectionString);

    pg.connect(this.pgConnectionString, function(err, client, done) {
        console.log('maybe connected...');

        function handleError(err) {
            console.log(err);
            if(client) {
                done(client);
            }
            emitter.emit(err);
        }

        if (err) { return handleError(err); }

        console.log('CONNECTED...');

        this.runDBScript(client, './init-feed-db.sql', function(err, result) {
            if (err) { return handleError(err); }
            console.log('SETUP!');

            var feedChunks = [];
            for (var i = 1; i <= this.feeds.length; ++i) {
                feedChunks.push('($' + i + ', DEFAULT)');
            }

            console.log(feedChunks);

            client.query('INSERT INTO feeds (feed, lastUpdated) VALUES ' + feedChunks.join(', '),
                this.feeds, function(err, result) {

                if (err) { return handleError(err); }
                console.log('INSERTED!');
                done();
            });

        }.bind(this));
    }.bind(this));
}

Monitor.prototype.queryOldFeeds = function() {

}
