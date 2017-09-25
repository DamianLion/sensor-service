const RethinkDb = require('./src/lib/RethinkDb');
const config = require('./src/config/config');

//RethinkDB
const rethinkDb = new RethinkDb();
rethinkDb.connect()
    .then(connection => {
        return rethinkDb.init(config.rethinkdb.db);
    })
    .then(result => {
        rethinkDb.close()
        boot()
    })
    .catch(err => {
        throw err
    });

function boot() {
    const app = require('./src/app');
    const port = process.env.PORT || 3000;
    app.set('port', port);
    app.listen(app.get('port'), function () {
        console.info(`Express server listening on port ${ port }`);
    }).on('error', function (err) {
        console.error('Cannot start server, port most likely in use');
        console.error(err);
    });
}