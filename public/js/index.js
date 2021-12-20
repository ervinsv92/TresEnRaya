const btnContinuar = document.getElementById('btnContinuar');
const txtUsuario = document.getElementById('txtUsuario');

try {
    let socket = io();

    socket.on("user_created", idUser=>{
        let id = sessionStorage.getItem(S_ID_USER) || '';
        if(id == idUser){
            
        }
    })

    btnContinuar.addEventListener('click', ()=>{
        let id = create_UUID();
        sessionStorage.setItem(S_ID_USER, id);
        socket.emit("init_user", {id, name:txtUsuario.value});
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