'use strict';

const r = require( 'rethinkdb' );

function connect (host, port) {
    return new Promise((fulfill, reject) => {
        r.connect( {host, port}, function(err, conn) {
            if (err) reject(err);
            fulfill(conn)
        })
    })
}

class RethinkDB {
    constructor (host, port) {
        this.host = host;
        this.port = port;
    }
    get connection () {
        return connect(this.host, this.port);
    }
}

module.exports = RethinkDB;