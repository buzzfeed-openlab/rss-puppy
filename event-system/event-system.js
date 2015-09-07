
var events = require('events'),
    fs = require('fs'),
    config = require('./config.json');

// global event system used for communication between
// all loaded modules
var puppyEmitter = new events.EventEmitter();

// load and initialize all of the modules
var modules = {};
for (var i = 0; i < config['modules'].length; ++i) {
    var moduleConfig = config['modules'][i];

    var Module = require(moduleConfig['file']);
    modules[moduleConfig['moduleName']] = new Module(puppyEmitter, moduleConfig['config']);
}

// set up the connections between modules
for (var i = 0; i < config['connections'].length; ++i) {
    var connection = config['connections'][i];

    var module = modules[connection['module']],
        fn = module[connection['fn']];

    puppyEmitter.on(connection['on'], fn.bind(module));
}
