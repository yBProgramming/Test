var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  io.sockets.emit('echo')
  res.json({'g': 'OK I am ok'});
});

io.on('connection', function(socket){
  console.log('a user connected');
});

http.listen(4200, function(){
  console.log('listening on *:3000');
});