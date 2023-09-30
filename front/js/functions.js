const contenedor = document.querySelector(".contenedor");
//llamada a fetch de lectura.
fetch("/lectura")
.then( respuesta => respuesta.json())
.then( respuesta => {

    respuesta.forEach(({_id,r,g,b}) => {
        new Color(_id, {r,g,b}, true, contenedor)
    });

})

window.addEventListener("keypress", event => {
    switch (event.key) {
        case ' ':
                let [r,g,b] = [0,0,0].map(() => Math.floor(Math.random() * 256));
                new Color(1, {r,g,b}, false, contenedor)
            break;
    
        default: 
            break;
    }
})

