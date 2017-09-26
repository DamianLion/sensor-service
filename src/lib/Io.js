
let socket;

class Io {
    constructor (server) {
        this.server = server;
        //const io = require('socket.io')(server);
        socket = require('socket.io').listen(server);
    }
    static getIO () {
        return socket
    }
}

module.exports = Io;