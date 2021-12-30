const btnCrearSala = document.getElementById('btnCrearSala');
const txtCodigo = document.getElementById('txtCodigo');
const btnIngresarSala = document.getElementById('btnIngresarSala');

try {
    let socket = io();

    socket.on("room_created", (idRoom, idUser)=>{
        const user = JSON.parse(localStorage.getItem(S_USER));
        if(idRoom && user.id == idUser){
            localStorage.setItem(S_ID_ROOM, idRoom);
            window.location ="room.html"
        }
    })

    socket.on("joined_room", (idRoom, idUser)=>{
        const user = JSON.parse(localStorage.getItem(S_USER));
        if(idRoom && user.id == idUser){
            localStorage.setItem(S_ID_ROOM, idRoom);
            window.location ="room.html"
        }
    })

    btnCrearSala.addEventListener('click', (e)=>{
        const user = JSON.parse(localStorage.getItem(S_USER));
        socket.emit("init_room", user.id);
    });

    btnIngresarSala.addEventListener('click', (e)=>{
        if(txtCodigo.value.trim() ==""){
            alert("Debe ingresar un código.");
            return;
        }

        const {id} = JSON.parse(localStorage.getItem(S_USER));
        socket.emit("join_room", id, txtCodigo.value.trim());
    });
} catch (error) {
    
}