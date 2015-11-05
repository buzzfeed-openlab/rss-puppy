
var timequeue = require('timequeue'),
    pg = require('pg');

var Monitor = module.exports = function Monitor(feeds, dbconfig, emitter) {
    this.pgConnectionString = 'postgres://puppy:puppydev@rss-monitor-edgar.c188nspwgrry.us-east-1.rds.amazonaws.com:5432/edgarfeeds';

    pg.connect(this.pgConnectionString, function(err, client, done) {
        if (err) {
            console.log('ERRRRRR: ', err);
            return emitter.emit('error', err);
        }

        console.log('CONNECTED...');

        client.query('DROP TABLE IF EXISTS feeds', function(err, result) {
            if (err) {
                return emitter.emit('error', err);
            }

            console.log('DROPPED TABLE!');

            client.query('CREATE TABLE feeds (feed text primary key, lastUpdated timestamp default NULL)', function(err, result) {

                if (err) {
                    return emitter.emit('error', err);
                }

                console.log('CREATED TABLE!');

                for (var i = 0; i < feeds.length; ++i) {
                    var query = client.query('INSERT INTO feeds (feed, lastUpdated) VALUES ($1, DEFAULT)', [feeds[i]]);

                    query.on('error', function(err) {
                        console.log('ERRORORORORR', err);
                        emitter.emit('error', err);
                    });
                }


            })
        });
    });
}
