DROP TABLE IF EXISTS feeds;

CREATE TABLE feeds (feed text primary key, lastUpdated timestamp default NULL);

CREATE TABLE IF NOT EXISTS entry (id text primary key, feed text);
