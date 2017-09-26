const r = require('rethinkdb');
const RethinkDb = require('../lib/RethinkDb');
const config = require('../config/config');
const Socket = require('../lib/Socket');

class Sensors {
    static getAll(req, res, next) {
        r.db(config.rethinkdb.db)
            .table('devices')
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
            .table('devices')
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