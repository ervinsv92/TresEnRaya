const btnCrearSala = document.getElementById('btnCrearSala');
const txtCodigo = document.getElementById('txtCodigo');
const btnIngresarSala = document.getElementById('btnIngresarSala');

try {
    let socket = io();

    socket.on("room_created", idRoom=>{
        if(idRoom){
            window.location ="room.html"
        }
    })

    socket.on("joined_room", idRoom=>{
        if(idRoom){
            window.location ="room.html"
        }
    })

    btnCrearSala.addEventListener('click', (e)=>{
        //let id = create_UUID();
        //let user = {id, name:txtUsuario.value}
        
        const user = JSON.parse(localStorage.getItem(S_USER));
        console.log(user)
        socket.emit("init_room", user.id);
    });

    btnIngresarSala.addEventListener('click', (e)=>{
        //let id = create_UUID();
        //let user = {id, name:txtUsuario.value}
        //sessionStorage.setItem(S_USER, user);
        //socket.emit("init_user", user);
        if(txtCodigo.value.trim() ==""){
            alert("Debe ingresar un código.");
            return;
        }

        const {id} = JSON.parse(localStorage.getItem(S_USER));
        socket.emit("join_room", id, txtCodigo.value.trim());
    });
} catch (error) {
    
}