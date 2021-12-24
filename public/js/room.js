const txtMensaje = document.getElementById('txtMensaje');
const btnEnviarMensaje = document.getElementById('btnEnviarMensaje');
const listaMensajes = document.getElementById('listaMensajes');
let s_user;
let s_room;

window.onload = ()=>{
    s_user = JSON.parse(localStorage.getItem(S_USER));
    s_id_room = JSON.parse(localStorage.getItem(S_ID_ROOM));
}

try {
    let socket = io();

    socket.on("user_created", idUser=>{
        if(idUser == s_user.id){
            window.location = "menu.html";
        }
    })

    btnEnviarMensaje.addEventListener('click', ()=>{

        if(txtMensaje.ariaValueMax.trim()==""){
            alert("Debe ingresar el mensaje")
            return;
        }

        socket.emit("message_user", s_user, s_id_room, txtMensaje.value);
    })
} catch (error) {
    
}