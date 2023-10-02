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

        enlace.addEventListener("click",()=>{
            fetch(`/collection/${this.name}`)
            .then( console.log("collection enviada: " + this.name))
        })
        let contador = 0
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
        
            fetch(`/delete-collection/${collection}`,{
                method : "DELETE"
            })
            .then(respuesta => respuesta.json())
            .then(respuesta => {
                if (respuesta) {
                    this.elementoDOM.remove()
                }
            })

    }
         
}
