const app = require('express')();
const Io = require('./lib/Io');

const RethinkDb = require('./lib/RethinkDb');
const rethinkDb = new RethinkDb('localhost', 28015);

const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const cors = require('cors');
app.use(cors());

// Create a RethinkDB connection, and save it in req._rdbConn
function createConnection(req, res, next) {
    rethinkDb.connect()
        .then(connection => {
            req._rdbConn = connection;
            next();
        })
        .catch(err => {
            next(err);
        });
}

// Close the RethinkDB connection
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
    Io.getIO().sockets.emit('sensor', {
        timeStamp: new Date(),
        unit: 'ml',
        value: randomIntFromInterval(200,400)
    });
}, 1000);

Io.getIO().on('connection', function (socket) {
    socket.emit('waterLevelEmit', { level: 300 });
    socket.on('my other event', function (data) {
        console.log(data);
    });
});

function randomIntFromInterval(min,max)
{
    return Math.floor(Math.random()*(max-min+1)+min);
}

module.exports= app;