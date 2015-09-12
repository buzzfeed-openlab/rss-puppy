
var NytTweeterModule = module.exports = function (emitter, config) {
    this.emitter = emitter;
    this.previousMostPopular = {};
};

NytTweeterModule.prototype.checkForNewMostPopular = function (stories) {
    for (var i = 0; i < stories.length; ++i) {
        story = stories[i];

        if (!this.previousMostPopular[story['url']]) {
            this.previousMostPopular[story['url']] = story;
            this.emitter.emit('new-nyt-story', story['title']);
        }
    }
};
