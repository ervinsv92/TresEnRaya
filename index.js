const express = require('express');
const Socket = require('./utils/sockets');
const app = express();
const server = require('http').createServer(app);
const PORT = 3000;

app.use(express.static(__dirname + '/public'));

let socket = new Socket(server);
socket.init();

server.listen(PORT, err =>{
    if(err) throw new Error(`Error en servidor ${err}`)
    console.log(`El servidor se está ejecutando en el puerto ${PORT}`);
});