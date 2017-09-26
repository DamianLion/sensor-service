const r = require('rethinkdb');
const RethinkDb = require('../lib/RethinkDb');
const config = require('../config/config');
const io = require('socket.io');

function activateChangefeed(connection) {
    r.db(config.rethinkdb.db).table('sensors').changes({
        // includeTypes: 'add'
        // includeInitial: false
    }).run(connection, function(err, cursor) {
        cursor.next(function(err, row) {
            if (err) throw err;
            console.log(row);
            global.io.sockets.emit('waterLevelEmit', {
                timeStamp: new Date(),
                unit: 'ml',
                value: 1000
            });
        });
    });
}

//RethinkDB
const rethinkDb = new RethinkDb();
rethinkDb.connect()
    .then(connection => {
        activateChangefeed(connection);
    })
    .catch(err => {
        console.log(err)
    });

class Sensors {
    static getAll(req, res, next) {
        r.db(config.rethinkdb.db)
            .table('sensors')
            .orderBy({index: "createdAt"})
            .run(req._rdbConn)
            .then(function (cursor) {
                return cursor.toArray();
            })
            .then(result => {
                res.json(result);
            })
            .catch(err => next(err));
    }

    static post(req, res, next) {
        let sensorData = req.body;
        sensorData.createdAt = r.now(); // Set the field `createdAt` to the current time
        r.db(config.rethinkdb.db)
            .table('sensors')
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

module.exports = Sensors;