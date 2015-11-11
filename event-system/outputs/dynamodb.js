
var AWS = require('aws-sdk');

var DynamodbOutput = module.exports = function(emitter, config) {
    this.dynamodb = new AWS.DynamoDB.DocumentClient({ 'region': 'us-east-1' });
    this.emitter = emitter;
    this.config = config;

    emitter.on('new-entry', this.persistEntry.bind(this));
};

DynamodbOutput.prototype.persistEntry = function(entry, feed) {
    var dynamoEntry = {
        TableName: "edgar-entries",
        Item: {
            'id': entry.guid,
            'feed': feed,
            'filing-type': entry.title,
            'title': entry.title,
            'date': entry.date.toString(),
            'link': entry.link
        }
    };

    this.dynamodb.put(dynamoEntry, function(err, data) {
        if (err) { this.emitter.emit('error', err); }
    }.bind(this));
};
