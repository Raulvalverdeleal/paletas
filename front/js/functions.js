const contenedor = document.querySelector(".contenedor");
let collection_name = ""
const nav = document.querySelector("nav")
fetch("/lectura-collection")
.then( respuesta => respuesta.json())
.then( respuesta => {

    collection_name = respuesta

    fetch("/lectura")
    .then(respuesta_2 => respuesta_2.json())
    .then(respuesta_2 => {
        if (!respuesta_2.error) {
            respuesta_2.forEach(({_id,r,g,b,}) => {
                new Color(_id, {r,g,b}, true, contenedor,collection_name)
            });
        }else{
            let h1 = document.createElement("h1")
            h1.innerHTML = respuesta_2.error
            h1.classList.add("error")
            document.querySelector("body").appendChild(h1)
            document.querySelector("a").style.zIndex = "1000"
        }
    })
   
    let h1 = document.createElement("h1")
    h1.innerHTML = "Estás en: " + collection_name
    nav.appendChild(h1)
    
})

window.addEventListener("keypress", event => {
    switch (event.key) {
        case ' ':
            let [r,g,b] = [0,0,0].map(() => Math.floor(Math.random() * 256));
            new Color(1, {r,g,b}, false, contenedor, collection_name)
        break;
        case 'Enter':
            let savedColors = []
            fetch("/lectura")
            .then( respuesta => respuesta.json())
            .then( respuesta => {
                respuesta.forEach(({r,g,b}) => {
                    return savedColors.push(`rgb(${r},${g},${b})`)
                })
                const colorText = savedColors.join("\n");
                const blob = new Blob([colorText], { type: "text/plain" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "Color.txt";
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            })
            
        break;
    }
})

