const http = require('http')

const RethinkDb = require('./lib/RethinkDb');
const config = require('./config/config');
const Io = require('./lib/Io');

//RethinkDB
const rethinkDb = new RethinkDb();
rethinkDb.connect()
    .then(connection => {
        // init db
        return rethinkDb.init(config.rethinkdb.db);
    })
    .then(result => {
        // close initial db connection
        rethinkDb.close();
        boot()
    })
    .catch(err => {
        throw err
    });

function boot() {
    const app = require('express')();
    const port = process.env.PORT || 3000;

    // set port
    app.set('port', port);

    const server = http.Server(app);

    /**
     * initialize socket
     * must be initialized before mounting app
     */
    new Io(server);

    // mount app to express
    app.use(require('./app'));

    server.listen(app.get('port'), function () {
        console.info(`Express server listening on port ${ port }`);
    }).on('error', function (err) {
        console.error('Cannot start server, port most likely in use');
        console.error(err);
    });
}