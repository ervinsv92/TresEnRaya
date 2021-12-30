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
                    this.io.emit('room_created',room.id, idUser);                                  
                });

                socket.on("join_room", async (idUser, joinCode) =>{
                    const user = this.users.find(x =>x.id === idUser);
                    user.symbol = 'x';
                    user.turn = 2;
                    user.wins = 0;

                    let idxRoom = this.rooms.findIndex(x=>x.joinCode == joinCode)
                    this.rooms[idxRoom].players.push(user);
                    this.io.emit('joined_room',this.rooms[idxRoom].id, idUser);                    
                });

                socket.on("message_user", async (user, idRoom, messaje) =>{
                    let idxRoom = this.rooms.findIndex(x=>x.id == idRoom)
                    let msn = `<li>${Date.now()} - ${user.name}: ${messaje}</li>`;

                    this.rooms[idxRoom].chat.push(msn);
                    this.io.emit('load_messages',this.rooms[idxRoom].id, this.rooms[idxRoom].chat);                    
                });

                socket.on("load_room", (idRoom) =>{
                    let idxRoom = this.rooms.findIndex(x=>x.id == idRoom)
                    this.io.emit('loaded_room',this.rooms[idxRoom]);                    
                });

                socket.on("init_game", async (idRoom) =>{
                    let idxRoom = this.rooms.findIndex(x=>x.id == idRoom)
                    this.rooms[idxRoom].game = this.emptyGame();
                    let turnPlayerInitGame = this.getPlayerInitGame();
                    this.rooms[idxRoom].playing = turnPlayerInitGame;
                    let player = this.rooms[idxRoom].players.find(x => x.turn == this.rooms[idxRoom].playing);
                    
                    this.io.emit('start_game',this.rooms[idxRoom].id, this.rooms[idxRoom].game, player);                    
                });
                
                socket.on("jugada", async (idRoom, idUser, jugada) =>{
                    let idxRoom = this.rooms.findIndex(x=>x.id == idRoom);
                    let fil = jugada.split("-")[0];
                    let col = jugada.split("-")[1];

                    let jugando = this.rooms[idxRoom].players.find(x=>x.id == idUser);
                    let symbol = jugando.symbol;

                    if(this.rooms[idxRoom].game[fil][col] != ''){
                        this.io.emit('post_jugada_existente',this.rooms[idxRoom].id, idUser);                    
                        return;
                    }

                    this.rooms[idxRoom].game[fil][col] = symbol;
                    this.rooms[idxRoom].playing = this.rooms[idxRoom].playing == 1?2:1;

                    let player = this.rooms[idxRoom].players.find(x => x.turn == this.rooms[idxRoom].playing);

                    let stateGame = this.getStateGame(this.rooms[idxRoom].game, symbol);

                    if(stateGame!=0){
                        if(stateGame == 1){
                            let idxPlayer = this.rooms[idxRoom].players.findIndex(x=>x.id == jugando.id);
                            this.rooms[idxRoom].players[idxPlayer].wins++;
                        }

                        this.io.emit('fin_jugada',this.rooms[idxRoom].id, jugando, stateGame, this.rooms[idxRoom].players);                        
                        return;
                    }

                    this.io.emit('post_jugada',this.rooms[idxRoom].id, this.rooms[idxRoom].game, player);                    
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

    getPlayerInitGame(){
        return Math.floor(Math.random() * (3-1)+1);
    }

    getStateGame(game, symbol){
        let cantidadPendientes = 0;

        game.forEach(fil => {
            fil.forEach(col => {
                if(col == ''){
                    cantidadPendientes++;
                }
            });
        });

        if(game[0][0] == symbol && game[0][1] == symbol && game[0][2] == symbol){
            return 1;//Ganó
        }else if(game[1][0] == symbol && game[1][1] == symbol && game[1][2] == symbol){
            return 1;
        }else if(game[2][0] == symbol && game[2][1] == symbol && game[2][2] == symbol){
            return 1;
        }else if(game[0][0] == symbol && game[1][0] == symbol && game[2][0] == symbol){
            return 1;
        }else if(game[0][1] == symbol && game[1][1] == symbol && game[2][1] == symbol){
            return 1;
        }else if(game[0][2] == symbol && game[1][2] == symbol && game[2][2] == symbol){
            return 1;
        }else if(game[0][0] == symbol && game[1][1] == symbol && game[2][2] == symbol){
            return 1;
        }else if(game[2][0] == symbol && game[1][1] == symbol && game[0][2] == symbol){
            return 1;
        }else if(cantidadPendientes == 0){
            return 2;//Empate
        }else{
            return 0;//Sigue jugando
        }
    }


}

module.exports = Socket;