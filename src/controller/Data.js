const r = require('rethinkdb');
const RethinkDb = require('../lib/RethinkDb');
const config = require('../config/config');
const Socket = require('../lib/Socket');

const table = 'data';

function feed(connection) {
    r.db(config.rethinkdb.db)
        .table(table)
        .changes({
            includeTypes: 'add',
            squash: false,
            includeInitial: false
        })
        .run(connection, function(err, cursor) {
            // TODO implement filter by which sensor is owned by which user and whom to send this event
            cursor.each((err, row) => {
                if (err) throw err;
                console.log(row);
                Socket.io().sockets.emit('sensor', row.new_val);
            });
        });
}

//RethinkDB
const rethinkDb = new RethinkDb();
rethinkDb.connect()
    .then(connection => {
        feed(connection);
    })
    .catch(err => {
        console.log(err)
    });

class Data {

    static getAll (req, res, next) {
        r.db(config.rethinkdb.db)
            .table(table)
            .run(req._rdbConn)
            .then(function (cursor) {
                return cursor.toArray();
            })
            .then(result => {
                res.json(result);
            })
            .catch(err => next(err));
    }

    static post (req, res, next) {
        let sensorData = req.body;
        sensorData.createdAt = r.now(); // Set the field `createdAt` to the current time
        r.db(config.rethinkdb.db)
            .table(table)
            .insert(sensorData, {returnChanges: true})
            .run(req._rdbConn)
            .then(result => {
                if (result.inserted !== 1) {
                    next(new Error("Document was not inserted."));
                }
                else {
                    res.json(result.changes[0].new_val);
                }
            })
            .catch(err => next(err));
    }
}

module.exports = Data;