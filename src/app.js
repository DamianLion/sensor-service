const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const bodyParser = require('body-parser');

const RethinkDbInterface = require('./lib/RethinkDb');
const RethinkDb = new RethinkDbInterface('localhost', 28015);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

/*
 * Create a RethinkDB connection, and save it in req._rdbConn
 */
function createConnection(req, res, next) {
    RethinkDb.connect()
        .then(connection => {
            req._rdbConn = connection
            next();
        })
        .catch(err => {
            next(err);
        });
}

/*
 * Close the RethinkDB connection
 */
function closeConnection(req, res, next) {
    req._rdbConn.close();
}

// Middleware that will create a connection to the database
app.use(createConnection);

const router = require('./router/router');
app.use(router);

// Middleware to close a connection to the database
app.use(closeConnection);

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

module.exports= app;