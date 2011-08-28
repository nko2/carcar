var express = require('express');
var nko = require('nko')('hfu9xf2WkLaqCx+T');
var sio = require('socket.io');
var fs  = require('fs');

require("./normalize");
var Podcast = require("./Podcast").Podcast;

var app     = express.createServer();

app.set('views', __dirname + '/views');
app.set('views', __dirname + '/views');
app.register('.html', require('ejs'));
app.set('view engine', 'html');

app.use(express.methodOverride());
app.use(express.bodyParser());
app.use(app.router);

app.get('/', function(req, res, next){
	res.render("index");
});

app.get('/restart', function(req, res, next){
  res.redirect("/");
});

app.get('/talk', function(req, res, next){
    res.render("talk");
});

app.get('/listen', function(req, res, next){
    res.render("listen");
});


app.use(express.errorHandler({ showStack: true }));
app.use(express.static(__dirname));

app.listen(80, function () {
  var addr = app.address();
  console.log('   app listening on http://' + addr.address + ':' + addr.port);
});

var users = {
	milfont: {
		podcasts: []
	}
};

var io = sio.listen(app);
io.set('log level', 1);

io.sockets.on('connection', function (client) {

  client.on('user message', function (user, file, msg) {
    client.broadcast.emit('podcast', "milfont", msg);
    var podcast = users[user].podcasts.filter(function(podcast){
        return podcast.file === file;
    }).first();
    if(podcast) podcast.append(msg);
  });
  
  client.on('start', function(user, name) {
  	var podcast = new Podcast(user, name);
  	podcast.record();
  	users[user].podcasts.add(podcast);
  });
  
  client.on('stop', function(user, file) {
    console.log("stop");
    users[user].podcasts.each(function(podcast){
        if(podcast.isOpen) podcast.stop();
    });
  });
  
  client.on('listen', function(){
    console.log("listen");
  })

});
