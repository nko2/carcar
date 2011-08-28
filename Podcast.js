var fs  = require('fs');

function Podcast(user, file) {
	this.user = user;
	this.file = file;
	this.filename = "podcasts/" + file + ".raw";
	this.stream = {};
	this.isOpen = false;
	this.fileDescription = {};
}

Podcast.prototype.record = function() {
	var self = this;
	this.stream = fs.createWriteStream(this.filename);
    this.stream.once('open', function(fd) {
        self.isOpen = true;
        self.fileDescription = fd;
    });
}

Podcast.prototype.append = function(samples) {
	this.stream.write(samples);
}

Podcast.prototype.stop = function() {
	this.isOpen = false;
	this.stream.end();
}

module.exports.Podcast = Podcast;