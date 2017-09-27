const r = require('rethinkdb');
const config = require('../config/config');

const table = 'sensors';

class Sensors {
    static getOne (req, res, next) {
        const id = req.params.id;
        r.db(config.rethinkdb.db)
            .table(table)
            .get(id)
            .merge(function(sensor) {
                return {
                    device: r.table("devices").get(sensor("device_id")),
                    data: r.table("data").orderBy({index: "createdAt"}).filter((data) => {
                        return data("sensor_id").eq(sensor("id"))
                    }).limit(10).coerceTo("ARRAY")
                }
            })
            .run(req._rdbConn)
            .then(result => {
                res.json(result);
            })
            .catch(err => next(err));
    }

    static getAll (req, res, next) {
        r.db(config.rethinkdb.db)
            .table(table)
            .orderBy({index: "createdAt"})
            .merge(function(sensor) {
                return {
                    device: r.table("devices").get(sensor("device_id")),
                    data: r.table("data").filter((data) => {
                        return data("sensor_id").eq(sensor("id"))
                    }).limit(10).coerceTo("ARRAY")
                }
            })
            .without('device_id')
            .run(req._rdbConn)
            .then(function (cursor) {
                return cursor.toArray();
            })
            .then(result => {
                res.json(result);
            })
            .catch(err => next(err));
    }

    static updateOne (req, res, next) {
        const id = req.params.id;
        const sensor = req.body;

        if (sensor && id) {
            r.db(config.rethinkdb.db)
                .table(table)
                .get(id)
                .update(sensor, {returnChanges: true})
                .run(req._rdbConn)
                .then(result => {
                    if (result.changes && result.changes.length > 0 && result.changes[0] && result.changes[0].new_val) {
                        return res.json(result.changes[0].new_val);
                    } else {
                        return res.json(result)
                    }
                })
                .catch(err => next(err));
        }
        else {
            next(new Error("Input Validation Failed"));
        }
    }

    static deleteOne (req, res, next) {
        const id = req.params.id;

        if (id) {
            r.db(config.rethinkdb.db)
                .table(table)
                .get(id)
                .delete()
                .run(req._rdbConn)
                .then(result => {
                    return res.json(result);
                })
                .catch(err => next(err));
        }
        else {
            next(new Error("Input Validation Failed"));
        }
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

module.exports = Sensors;