var express = require('express');
var nko = require('nko')('hfu9xf2WkLaqCx+T');
var sio = require('socket.io');
var fs  = require('fs');

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
    res.end();
});

app.use(express.errorHandler({ showStack: true }));
app.use(express.static(__dirname));

app.listen(80, function () {
  var addr = app.address();
  console.log('   app listening on http://' + addr.address + ':' + addr.port);
});

var stream;

var io = sio.listen(app);
io.set('log level', 1);

io.sockets.on('connection', function (client) {
    
  client.on('user message', function (msg) {
    client.broadcast.emit('podcast', "MIlfont", msg);
    if(stream) {
        try {
            stream.write(msg);
        } catch(e) {
            console.log(stream, e);
        }
    }
  });
  
  client.on('start', function(name) {
    stream = fs.createWriteStream("podcasts/" + name + ".wav");
    stream.once('open', function(fd) {
        
    });
  });
  
  client.on('stop', function() {
    console.log("stop");
    stream.end();
  });
  
  client.on('listen', function(){
    console.log("listen");
    
  })

});