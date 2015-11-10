DROP TABLE IF EXISTS feeds;

CREATE TABLE feeds (feed text primary key, lastUpdated timestamp default NULL);

DROP TABLE IF EXISTS entries;

CREATE TABLE IF NOT EXISTS entries (id text primary key, feed text);
