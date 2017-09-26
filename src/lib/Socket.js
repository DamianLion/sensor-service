
let Io;

class Socket {
    constructor (server) {
        Io = require('socket.io').listen(server);
    }
    static io () {
        return Io
    }
}

module.exports = Socket;