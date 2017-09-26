'use strict';

const r = require('rethinkdb');
const config = require('../config/config.js');

function connect(credentials) {
    return new Promise((fulfill, reject) => {
        r.connect(credentials, function (err, conn) {
            if (err) reject(err);
            fulfill(conn)
        })
    })
}

class RethinkDB {
    constructor() {
        this.connection = null;
    }

    close() {
        this.connection.close();
    }

    connect() {
        return new Promise((fulfill, reject) => {
            connect(config.rethinkdb)
                .then(connection => {
                    this.connection = connection
                    fulfill(connection)
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    createIndex (db, table, index) {
        return new Promise((fulfill, reject) => {
            r.db(db).table(table).indexList().contains(index).do(exists => {
                return r.branch(
                    exists,
                    {created: 0},
                    r.db(db).table(table).indexCreate(index)
                );
            }).run(this.connection, (err, result) => {
                if (err) reject(err);
                console.log('index created', result.created, db);
                fulfill(result);
            });
        })
    }

    createDb (db) {
        return new Promise((fulfill, reject) => {
            r.dbList().contains(db).do(exists => {
                return r.branch(
                    exists,
                    {dbs_created: 0},
                    r.dbCreate(db)
                );
            }).run(this.connection, (err, result) => {
                if (err) reject(err);
                console.log('dbs_created', result.dbs_created, db);
                fulfill(result);
            });
        })
    }

    createTable (db, table) {
        return new Promise((fulfill, reject) => {
            r.db(db).tableList().contains(table).do(exists => {
                return r.branch(
                    exists,
                    {tables_created: 0},
                    r.db(db).tableCreate(table)
                );
            }).run(this.connection, (err, result) => {
                if (err) reject(err);
                console.log('tables_created', result.tables_created, table);
                fulfill(result);
            });
        })
    }

    init(db) {
        return new Promise((fulfill, reject) => {
            /**
             * should only create db and table if nothing is there yet
             * - sensors
             * - device
             */
            this.createDb(db)
                .then(result => {
                    return this.createTable(db, 'sensors')
                })
                .then(result => {
                    return this.createTable(db, 'devices')
                })
                .then(result => {
                    return this.createIndex(db, 'sensors', 'createdAt')
                })
                .then(result => {
                    return this.createIndex(db, 'devices', 'createdAt')
                })
                .then(result => {
                    fulfill(result)
                })
                .catch(err => {
                    reject(err)
                });
        })
    }
}

module.exports = RethinkDB;