# RSS Puppy

##### A watchdog tool for monitoring RSS feeds

This tool is designed to monitor RSS feeds in bulk, and to generate machine friendly notifications when new entries appear. While there exists no shortage of RSS readers and web-based notification services, nothing we found combines easy managment of hundreds of RSS feeds with the flexibility to direct output to a variety of data stores or over disparate protocols.

This monitor can be run on any cloud service provider, and requires only Nodejs and a PostgreSQL database. Also, it is trivial to add output handlers which can pipe feed entry data to any service you use.

## How to run

### Get the code

- `git clone https://github.com/buzzfeed-openlab/rss-puppy.git`
- `cd rss-puppy; npm install`
- `cp ./sample-config.json ./config.json`

### Set up a database
The monitor uses a PostgreSQL database to keep track of feeds and entries. 

An easy way to get a reliable, automatically backed up database is to use AWS. Log into the management console, navigate to the `RDS` dashboard, click `Launch a DB instance`, select `PostgreSQL`, and follow the rest of the configuration steps.

Once you have your DB, you can tell the monitor about it using the `config.json` file:

```js
{
    "dbconfig": {
        "user": "DB USER",
        "password": "DB USER PW",
        "url": "POSTGRES DB PATH",
        "port": 5432,
        "dbname": "DB NAME",
        "initScript": "./monitor/init-feed-db.sql"
    },
    ...
}
```

### Configure your feeds
In the config file there will be a section called `"feeds"` and a section called `"throttling"`.

```js
{
    "feeds": [
        "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001440512&type=&dateb=&owner=exclude&start=0&count=40&output=atom",
        ...
    ],

    "throttling": {
        "monitorFrequency": 8000,
        "maxConcurrent": 10,
        "concurrentInterval": 1000
    },
    ...
}
```

- `"feeds"` is an array of RSS feed urls that will be monitored.
- `"throttling"` is broken into several parts
	- `"monitorFrequency"`: How often the monitor will check to see if it needs to query any "old" RSS feeds (ie: ones that haven't been queried in awhile).
	- `"maxConcurrent"`: The maximum number of concurrent queries the monitor will make (excess queries will be queued).
	- `"concurrentInterval"`: The interval to wait between making `"maxConcurrent"` queries (ie: X queries per 10 seconds, or X queries per 60 seconds).


### Configure your outputs
Outputs are modules of code that listen for events that the monitor emits and do something useful with the resulting data.

There are several different kinds of events:

- `"new-entry"`: Emitted when the monitor encounters an entry that it has not seen before. Handlers will be invoked with the `entry` as a json object, and the `feed` url as a string.
- `"checking-old-feeds"`: Emitted whenever the monitor wakes up to look for feeds to query (approx every `"monitorFrequency"` seconds).
- `"old-feed"`: Emitted whenever the monitor finds a feed that hasn't been queried in awhile and needs to be checked. Handlers will be invoked with the `feed` url as a string.
- `"entry"`: Emitted whenever an entry is parsed from a feed. Note that feeds will be queried and parsed over and over again, so this will be emitted for the same entry many times. Handlers will be called with the `entry` as a json object and the `feed` url as a string.

```js
{
	"outputs": [
        {
            "file": "./outputs/debug-logger.js",
            "config": {
                "showOldFeedMessages": true
            }
        },
        ...
    ],
    ...
}

```


### Run the monitor!

```bash
node ./run.js [/path/to/config.json]
```
