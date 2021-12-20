let {Server: SocketIO} = require('socket.io');

class Socket{
    static instancia;
    constructor(http){
        if(Socket.instancia){
            return Socket.instancia;
        }

        Socket.instancia = this;
        this.io = new SocketIO(http);

        this.users = [];//{id:1, name:''}
        this.rooms = [];//{id:1, players:[{id:'', name:'', symbol:'', turn:1, wins:1}], playing:1, game:[][], chat:[]}
    }

    init(){
        try {
            this.io.on("connection", async (socket) =>{
                socket.emit("escuchar_productos", this.data.obtenerProductos());
                socket.emit("escuchar_mensajes", await contenedor.getAll());

                socket.on("mensaje", async (data) =>{
                    await contenedor.save(data);
                    this.io.emit('escuchar_mensajes',await contenedor.getAll());                    
                });

                socket.on("producto", data =>{
                    this.data.guardarProducto(data)
                    this.io.emit('escuchar_productos', this.data.obtenerProductos());
                });
            });
        } catch (error) {
            console.log(error);
        }
    }
}

module.exports = Socket;