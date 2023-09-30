const contenedor = document.querySelector(".contenedor");
//llamada a fetch de lectura.

window.addEventListener("keypress", event => {
    switch (event.key) {
        case ' ':
                let [r,g,b] = [0,0,0].map(() => Math.floor(Math.random() * 256));
                new Color(1, {r,g,b}, (Math.random() > 0.5) ? true : false, contenedor)
            break;
    
        default: 
            break;
    }
})

