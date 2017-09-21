var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(3000);

/* app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
}); */

setInterval(function() {  
  io.sockets.emit('waterLevelEmit', {
    timeStamp: new Date(),
    unit: 'ml',
    value: randomIntFromInterval(200,400)
  });
}, 1000);

io.on('connection', function (socket) {
  //socket.emit('waterLevelEmit', { level: 300 });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});

function randomIntFromInterval(min,max)
{
    return Math.floor(Math.random()*(max-min+1)+min);
}