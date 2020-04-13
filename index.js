const server = require('./server')()
const dir = __dirname;
console.log(dir)

// server.create(dir);
server.create();
server.start();