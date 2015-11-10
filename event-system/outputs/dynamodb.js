
var DynamodbOutput = module.exports = function(emitter, config) {
    emitter.on('new-entry', this.persistEntry.bind(this));
};

DynamodbOutput.prototype.persistEntry = function(entry) {
    console.log('DynamodbOutput: ', entry.guid);
};
