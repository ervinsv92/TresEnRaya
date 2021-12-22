const btnContinuar = document.getElementById('btnContinuar');
const txtUsuario = document.getElementById('txtUsuario');

try {
    let socket = io();

    socket.on("user_created", idUser=>{
        let userS = JSON.parse(localStorage.getItem(S_USER));
        if(idUser == userS.id){
            window.location = "menu.html";
        }
    })

    btnContinuar.addEventListener('click', ()=>{
        let id = create_UUID();
        let user = {id, name:txtUsuario.value}
        localStorage.setItem(S_USER, JSON.stringify(user));
        socket.emit("init_user", user);
    })
} catch (error) {
    
}

function create_UUID(){
    var dt = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (dt + Math.random()*16)%16 | 0;
        dt = Math.floor(dt/16);
        return (c=='x' ? r :(r&0x3|0x8)).toString(16);
    });
    return uuid;
}