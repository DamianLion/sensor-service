const r = require( 'rethinkdb' );

class Sensors {
    static getAll (req, res, next) {
        r.db('cuyplin')
            .table('sensors')
            .orderBy({index: "createdAt"})
            .run(req._rdbConn)
            .then(function(cursor) {
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
        r.db('cuyplin')
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