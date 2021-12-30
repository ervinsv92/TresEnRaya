const txtMensaje = document.getElementById('txtMensaje');
const btnEnviarMensaje = document.getElementById('btnEnviarMensaje');
const listaMensajes = document.getElementById('listaMensajes');
const spnJugando = document.getElementById('spnJugando');
const btnIniciarJuego = document.getElementById('btnIniciarJuego');
const divJuego = document.getElementById('divJuego');
const tableroJuego = document.getElementById('tableroJuego');
const spnCodigo = document.getElementById('spnCodigo');
const ulJugadores = document.getElementById('ulJugadores');

let s_user = JSON.parse(localStorage.getItem(S_USER));
let s_id_room = localStorage.getItem(S_ID_ROOM);
let _room;
let _jugando;

const IMG_D = "./img/default.png";
const IMG_X = "./img/x.jpg";
const IMG_O = "./img/o.jpg";

window.onload = (e)=>{
    mostrarJuego(false);
}

try {
    let socket = io();
    socket.emit("load_room", s_id_room);
    socket.on("loaded_room", room=>{
        if(room.id == s_id_room){
            _room = room;
            spnCodigo.textContent = room.joinCode;
            pintarJugadores(_room.players);
            PintarCuadroJuego(_room.game);
        }
    })

    socket.on("load_messages", (idRoom, messages) =>{
        if(idRoom == s_id_room){
            listaMensajes.innerHTML = '';
            let chat = '';
            messages.forEach(message => {
                chat += message;
            });
            listaMensajes.innerHTML = chat;
        }
    })

    socket.on("start_game", (idRoom, game, player) =>{
        if(idRoom == s_id_room){
            mostrarJuego(true);
            PintarCuadroJuego(game);
            _jugando = player;
            spnJugando.textContent = _jugando.name;
        }
    });

    socket.on("post_jugada", (idRoom, game, player) =>{
        if(idRoom == s_id_room){
            PintarCuadroJuego(game);
            _jugando = player;
            spnJugando.textContent = _jugando.name;
        }
    });

    socket.on("post_jugada_existente", (idRoom, idUser) =>{
        if(idRoom == s_id_room && idUser == s_user.id){
            alert("El campo seleccionado ya está en uso");
        }
    });

    socket.on("fin_jugada", (idRoom, player, stateGame, jugadores) =>{
        if(idRoom == s_id_room){
            if(stateGame == 1){
                pintarJugadores(jugadores);
                alert(`Gana el Jugador ${player.turn}: ${player.name}`);
            }else if(stateGame == 2){
                alert("El juego termina en empate.")
            }
            mostrarJuego(false);
            _jugando = null;
        }
    });

    btnEnviarMensaje.addEventListener('click', ()=>{
        if(txtMensaje.value.trim()==""){
            alert("Debe ingresar el mensaje")
            return;
        }

        socket.emit("message_user", s_user, s_id_room, txtMensaje.value);
        txtMensaje.value = "";
    })

    btnIniciarJuego.addEventListener('click', ()=>{
        socket.emit("init_game", s_id_room);
    })

    document.body.addEventListener('click', function (evt) {
        if (evt.target.className === 'btnJugada') {

            if(_jugando == null){
                alert("El juego no ha iniciado.")
                return;
            }

            if(_jugando.id != s_user.id){
                alert("No es tu turno.")
                return;
            }
            socket.emit("jugada", s_id_room, s_user.id, evt.target.id);
        }
    }, false);
} catch (error) {
    
}

const PintarCuadroJuego = (lista)=>{
    for(let contadorFil = 0; contadorFil<lista.length; contadorFil++){
        for(let contadorCol = 0; contadorCol<lista.length; contadorCol++){
            let id = contadorFil+"-"+contadorCol;
            const jugada = document.getElementById(id);

            switch (lista[contadorFil][contadorCol]) {
                case '':
                    jugada.src = IMG_D;
                    break;
                case 'x':
                    jugada.src = IMG_X;
                    break;
                case 'o':
                    jugada.src = IMG_O;
                    break;
                        
                default:
                    break;
            }
        }
    }
}

const mostrarJuego = (mostrar)=>{
    btnIniciarJuego.classList.remove("d-none", "d-block");
    divJuego.classList.remove("d-none", "d-block");
    if(mostrar){
        btnIniciarJuego.classList.add("d-none");
        divJuego.classList.add("d-block");
    }else{
        btnIniciarJuego.classList.add("d-block");
        divJuego.classList.add("d-none");
    }
}

const pintarJugadores = (players)=>{
    ulJugadores.innerHTML = '';
    let playersHtml = '';
    players.forEach(player => {
        if(player.id == s_user.id){
            playersHtml += `<li style='color:blue;'>Jugador ${player.turn}: ${player.name} - Ganadas: ${player.wins}</li>`;
        }else{
            playersHtml += `<li>Jugador ${player.turn}: ${player.name} - Ganadas: ${player.wins}</li>`;
        }
    });
    ulJugadores.innerHTML = playersHtml;
}