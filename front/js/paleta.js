class Paleta{
    constructor(name,contenedor){
        this.name = name;
        this.elementoDOM = null;
        this.crearPaleta(name,contenedor);
    }
    crearPaleta(name,contenedor){
        this.elementoDOM = document.createElement("li")
        let enlace = document.createElement("a")
        enlace.setAttribute("href","palette.html")
        enlace.innerHTML = this.name
        this.elementoDOM.appendChild(enlace)

        enlace.addEventListener("click",(event)=>{
            event.preventDefault()
            fetch(`/collection/${this.name}`)
            .then( respuesta => respuesta.text())
            .then( respuesta => {
                window.location.href = event.target.href
            })
        })
        let contador = 0
        console.log(this.name)
        fetch(`/lectura/${this.name}`)
        .then(respuesta => respuesta.json())
        .then(respuesta => {
            respuesta.forEach(({r,g,b}) => {
                if (contador < 3) {
                    let span = document.createElement("span")
                    span.style.minWidth = "25px"
                    span.style.height = "100%"
                    span.style.borderRadius = "5px"
                    span.style.backgroundColor = `rgb(${r},${g},${b})`
                    this.elementoDOM.appendChild(span)
                }
                contador++
            });
            let delete_button = document.createElement("button")
            delete_button.innerHTML = "-"
            delete_button.addEventListener("click", () => {
                this.delete(name)
            })
            this.elementoDOM.appendChild(delete_button)
        })
        contenedor.appendChild(this.elementoDOM)
        
    }
    delete(collection){
        
            fetch(`/delete-collection`,{
                method : "DELETE",
                body : JSON.stringify({ name : collection}),
                headers : {
                    "Content-type" : "application/json"
                }
            })
            .then(respuesta => respuesta.json())
            .then(respuesta => {
                console.log(respuesta)
                if (respuesta) {
                    this.elementoDOM.remove()
                }else console.error("No se ha podido realizar la operacion de eliminar paleta")
            })

    }
         
}
