class Color{
    constructor(id,color,saved,contenedor){
        this.id = id;
        this.color = color;
        this.elementoDOM = null;
        this.saved = false;//CAMBIAR
        this.editando = false;
        this.crearTarea(saved,contenedor);
    }
    crearTarea(saved,contenedor){
        this.elementoDOM = document.createElement("li")
        this.elementoDOM.classList.add("contenedor")
        window.addEventListener("keypress", event => {
            switch (event.key) {
                case 'c':
                        if (!this.saved) {
                            this.elementoDOM.remove()
                            break;
                        }
                    
            }
        })

        let div_color = document.createElement("div")
        div_color.classList.add("color")
        div_color.style.backgroundColor = `rgb(${this.color.r},${this.color.g},${this.color.b})`
        

        let info = document.createElement("section")
        info.classList.add("info")
        //textoColor
        let info_text = document.createElement("section")
        info_text.classList.add("info_text")
        let color_r = document.createElement("p")
        let color_g = document.createElement("p")
        let color_b = document.createElement("p")
        info_text.appendChild(color_r)
        info_text.appendChild(color_g)
        info_text.appendChild(color_b)

        color_r.innerHTML = "R: " + this.color.r
        color_g.innerHTML = "G: " + this.color.g
        color_b.innerHTML = "B: " + this.color.b

        let input_r = document.createElement("input")
        input_r.setAttribute("type","number")
        input_r.style.display = "none"
        let input_g = document.createElement("input")
        input_g.setAttribute("type","number")
        input_g.style.display = "none"
        let input_b = document.createElement("input")
        input_b.setAttribute("type","number")
        input_b.style.display = "none"

        info_text.appendChild(input_r)
        info_text.appendChild(input_g)
        info_text.appendChild(input_b)

        div_color.addEventListener("click", ()=> {
            this.editando = !this.editando
            if (this.editando) {
                
                color_r.style.display = "none"
                color_g.style.display = "none"
                color_b.style.display = "none"

                input_r.style.display = "inline"
                input_r.value = this.color.r
                input_r.addEventListener("input",()=> div_color.style.backgroundColor = `rgb(${input_r.value},${input_g.value},${input_b.value})`)

                input_g.style.display = "inline"
                input_g.value = this.color.g
                input_g.addEventListener("input",()=> div_color.style.backgroundColor = `rgb(${input_r.value},${input_g.value},${input_b.value})`)


                input_b.style.display = "inline"
                input_b.value = this.color.b
                input_b.addEventListener("input",()=> div_color.style.backgroundColor = `rgb(${input_r.value},${input_g.value},${input_b.value})`)

            }
            else{

                input_r.style.display = "none"
                input_g.style.display = "none"
                input_b.style.display = "none"

                color_r.style.display = "block"
                this.color.r = input_r.value

                color_g.style.display = "block"
                this.color.g = input_g.value

                color_b.style.display = "block"
                this.color.b =input_b.value

                color_r.innerHTML = "R: " + this.color.r
                color_g.innerHTML = "G: " + this.color.g
                color_b.innerHTML = "B: " + this.color.b

                this.editcolor()

            }

            
            
        })
        
        //boton copy & save
        let info_navigate = document.createElement("section")
        info_navigate.classList.add("info_navigate")
        let copiar = document.createElement("button")
        copiar.innerHTML = "C"
        copiar.addEventListener("click", ()=> this.copyColor())
        let save = document.createElement("button")
        save.innerHTML = "S"
        save.addEventListener("click", ()=> {
            this.saveColor()
            save.className = `${this.saved ? "guardado" : ""}`
            
        })
        save.className = `${this.saved ? "guardado" : ""}`
        info_navigate.appendChild(copiar)
        info_navigate.appendChild(save)
        
        info.appendChild(info_text)
        info.appendChild(info_navigate)

        this.elementoDOM.appendChild(div_color)
        this.elementoDOM.appendChild(info)

        contenedor.appendChild(this.elementoDOM)
    }
    async saveColor(){
        this.saved = !this.saved
        if (this.saved) {
            console.log("llamada a fetch POST")
        }else{
            console.log("llamada a fetch DELETE")
        }
        
    }
    copyColor(){
        navigator.clipboard.writeText(`rgb(${this.color.r},${this.color.g},${this.color.b})`)
        console.log("color copiado")
    }
    editcolor(){
        console.log("editando color")
    }
}