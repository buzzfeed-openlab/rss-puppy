
var MarkovChain = require('markovchain').MarkovChain

var ReviewGenerator = module.exports = function (eventEmitter, config) {
    this.emitter = eventEmitter;
    this.content_file = config['content_file'];
    this.chain = new MarkovChain({ files: this.content_file });

    setInterval(this.generateReview.bind(this), config['interval']);
};

ReviewGenerator.prototype.generateReview = function () {
    this.chain.start(function (wordData) {
        var words = Object.keys(wordData);
        return words[Math.floor(Math.random() * words.length)];
    })
    .end(function (sentence) {
        return sentence.length >= 120;
    })
    .process(function (err, sentence) {
        if (err) {
            throw err;
        }

        this.emitter.emit('new-review', sentence);

    }.bind(this));
};
