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

        let delete_button = document.createElement("button")
        delete_button.innerHTML = "-"
        delete_button.addEventListener("click", () => {
            this.delete(name)
        })
        this.elementoDOM.appendChild(delete_button)
        
        this.elementoDOM.addEventListener("click",()=>{
            fetch(`/collection/${this.name}`)
            .then( console.log("collection enviada: " + this.name))
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
