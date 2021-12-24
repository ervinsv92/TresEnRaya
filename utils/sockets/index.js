let {Server: SocketIO} = require('socket.io');
const { uuid } = require('uuidv4');

class Socket{
    static instancia;
    constructor(http){
        if(Socket.instancia){
            return Socket.instancia;
        }

        Socket.instancia = this;
        this.io = new SocketIO(http);

        this.users = [];//{id:1, name:''}
        this.rooms = [];//{id:1, players:[{id:'', name:'', symbol:'', turn:1, wins:1}], playing:1, game:[][], chat:[], joinCode:''}
    }

    init(){
        try {
            this.io.on("connection", async (socket) =>{
                //socket.emit("escuchar_productos", this.data.obtenerProductos());
                //socket.emit("escuchar_mensajes", await contenedor.getAll());

                socket.on("init_user", async (user) =>{

                    this.users.push(user);
                    console.log("Init user: ", this.users)
                    this.io.emit('user_created',user.id);                    
                });

                socket.on("init_room", async (idUser) =>{
                    const user = this.users.find(x =>x.id === idUser);
                    user.symbol = 'o';
                    user.turn = 1;
                    user.wins = 0;

                    let room = {
                        id: uuid(),
                        players:[user],
                        playing:1,
                        chat:[]
                    }

                    room.game = this.emptyGame();
                    room.joinCode = this.generateJoinCode(); 
                    this.rooms.push(room);
                    this.io.emit('room_created',room.id);                    
                });

                socket.on("join_room", async (idUser, joinCode) =>{
                    const user = this.users.find(x =>x.id === idUser);
                    user.symbol = 'x';
                    user.turn = 2;
                    user.wins = 0;

                    let idxRoom = this.rooms.findIndex(x=>x.joinCode == joinCode)

                    this.rooms[idxRoom].players.push(user);
                    this.io.emit('joined_room',this.rooms[idxRoom].id);                    
                });

                socket.on("message_user", async (user, idRoom, messaje) =>{
                    let idxRoom = this.rooms.findIndex(x=>x.id == idRoom)
                    let msn = `<li>${Date.now} - ${user.name}: ${mensaje}</li>`;

                    this.rooms[idxRoom].chat.push(msn);
                    this.io.emit('joined_room',this.rooms[idxRoom].id);                    
                });

                
                
            });
        } catch (error) {
            console.log(error);
        }
    }

    emptyGame(){
        return [['','',''],['','',''],['','','']]
    }

    generateJoinCode(){
        const MAX = 99999;
        const MIN = 10000;
        let joinCode = 0;
        let found = false;

        while(!found){
            let random = Math.floor(Math.random() * (MAX-MIN)+MIN);
            let idx = this.rooms.findIndex(x=>x.joinCode === random);
            if(idx === -1){
                found = true
                joinCode = random
            }
        }
        return joinCode;
    }
}

module.exports = Socket;