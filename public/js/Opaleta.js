class Paleta{
    constructor(userId,name,contenedor){
        this.userId = userId
        this.name = name;
        this.elementoDOM = null;
        this.crearPaleta(contenedor);
    }
    crearPaleta(contenedor){
        this.elementoDOM = document.createElement("li")
        this.elementoDOM.setAttribute("id",this.name)
        this.elementoDOM.classList.add("paleta")
        let content = document.createElement("div")
        content.classList.add("content")
        let top = document.createElement("section")
        top.classList.add("top")
        let h3 = document.createElement("a")
        h3.innerHTML = this.name
        h3.addEventListener("click", async (event) => {
            event.preventDefault()
            await fetch(`/get-palette/${this.name}`)
            .then( respuesta => respuesta.text())
            .then( () => {
                h3.setAttribute("href",`/get-palette/${this.name}`)
                window.location.href = event.target.href
            })
        })
        let textarea = document.createElement("textarea")
        textarea.className = "nombrePaleta displayNone"
        let editButton = document.createElement("button")
        editButton.classList.add("edit")
        editButton.innerHTML = "<span class=\"material-symbols-outlined\">edit</span>"
        let editando = false
        editButton.addEventListener("click", () => {
            if (editando) {
                //guardar
                let nombre = /^[a-záéíóúñ \-._\d]{1,27}$/i.test(textarea.value) ? textarea.value.trim() : false
                if (nombre) {
                    fetch("/to-update",{
                        method : "PUT",
                        body : JSON.stringify({tipo : 4,id : this.userId, paleta_n : this.name, nuevo : nombre}),
                        headers : {
                            "Content-type" : "application/json"
                        }
                    })
                    .then( respuesta => respuesta.json())
                    .then(({r}) => {
                        textarea.classList.add("displayNone")
                        h3.classList.remove("displayNone")
                        editando = false
                        if (!!r.acknowledged) {
                            h3.innerHTML = nombre//salida del nombre
                            this.name = nombre
                        }else this.errorAnimation(h3,this.name,r)
                    })
                }else{
                    textarea.classList.add("displayNone")
                    h3.classList.remove("displayNone")
                    editando = false
                    let error = textarea.value.trim() == "" ? "Error, campo vacío." : "Nombre no vacío."
                    this.errorAnimation(h3,this.name,error)
                }
            }else {
                //editando
                h3.classList.add("displayNone")
                textarea.classList.remove("displayNone")
                textarea.value = this.name
                editando = true
            }

        })
        editButton.addEventListener("click", ()=>{/* editar */})
        let topElements = [h3,textarea,editButton]
        topElements.forEach( element => { top.appendChild(element)})
        let colorContainer = document.createElement("section")
        colorContainer.classList.add("colorsContainer")
        let ul = document.createElement("ul")
        let arrColores = []
        ul.classList.add("colors")
        let p = document.createElement("p")
        fetch(`/to-read`,{
            method : "POST",
            body : JSON.stringify({tipo : 3, id : this.userId, paleta : this.name}),
            headers : {
                "Content-type" : "application/json"
            }
        })
        .then(respuesta => respuesta.json())
        .then(respuesta => {        
            respuesta.array.colores.forEach(({r,g,b}) => {
                let li = document.createElement("li")
                li.classList.add("color")
                li.style.backgroundColor = `rgb(${r},${g},${b})`
                let tooltip = document.createElement("span")
                tooltip.classList.add("tooltiptext")
                let hexCode = rgbToHex(r,g,b)
                tooltip.innerHTML = `${hexCode}`
                arrColores.push("x")
                li.addEventListener("mouseover",()=>{this.hoverTooltip(tooltip)})
                li.addEventListener("mouseout",()=>{ tooltip.style.visibility = "hidden"})
                li.addEventListener("click",()=>{
                    navigator.clipboard.writeText(`${hexCode}`)
                    .then( () => tooltip.innerHTML = "Copiado!")
                    .catch( () => tooltip.innerHTML = "Error al copiar")
                    setTimeout(() => {
                        tooltip.innerHTML = `${hexCode}`
                    }, 1000);
                })
                li.appendChild(tooltip)
                ul.appendChild(li)
            })
            p.innerHTML = `Esta paleta tiene:<br><strong>${arrColores.length} colores.</strong>`
        })
        colorContainer.appendChild(ul)
        let bottom = document.createElement("section")
        bottom.classList.add("bottom")
        
        
        let deletButton = document.createElement("button")
        deletButton.classList.add("delete")
        deletButton.innerHTML = "<span class=\"material-symbols-outlined\">delete</span>"
        deletButton.addEventListener("click",()=>{this.delete()})
        let bottomElements = [p,deletButton]
        bottomElements.forEach( element => bottom.appendChild(element))
        let contentElements = [top,colorContainer,bottom]
        contentElements.forEach( element => content.append(element))
        this.elementoDOM.appendChild(content)
        contenedor.appendChild(this.elementoDOM)
    }
    delete(){
            fetch(`/to-delete`,{
                method : "DELETE",
                body : JSON.stringify({
                    tipo : 1,
                    id : this.userId,
                    paleta : this.name
                }),
                headers : {
                    "Content-type" : "application/json"
                }
            })
            .then(respuesta => respuesta.json())
            .then(({acknowledged}) => {
                if (acknowledged) {
                    this.elementoDOM.classList.add("paletteDisappears")
                    setTimeout(() => {this.elementoDOM.remove()}, 200);
                }else console.error("No se ha podido realizar la operacion de eliminar paleta")
            })
    }
    errorAnimation(element,name,message){
        element.innerHTML = message
        element.style.fontSize = "15px"
        element.style.lineHeight = "18px"
        element.style.color = "#ff4646"
        element.style.left = "0"
        element.style.pointerEvents = "none"
        setTimeout(() => {
            element.style.left = "20px"
        }, 100);
        setTimeout(() => {
            element.style.left = "0"
        }, 200);
        setTimeout(() => {
            element.style.left = "20px"
        }, 300);
        setTimeout(() => {
            element.style.left = "0"
        }, 400);
        setTimeout(() => {
            element.style.left = "20px"
        }, 500);
        setTimeout(() => {
            element.style.left = "0"
        }, 600);
        setTimeout(() => {
            element.style.left = "20px"
        }, 700);
        setTimeout(() => {
            element.style.left = "0"
        }, 800);
        setTimeout(() => {
            element.style.left = "0"
        }, 900);
        setTimeout(() => {
            element.style.color = "inherit"
            element.style.fontSize = "25px"
            element.style.lineHeight = "30px"
            element.innerHTML = name.split("-").join(" ")
            element.addEventListener("mouseover",()=>{ element.style.color = "rgb(69, 101, 231)" })
            element.addEventListener("mouseout",()=>{ element.style.color = "#555" })
            element.style.pointerEvents = "all"
        }, 3000);
    }
    hoverTooltip(element){
        element.style.visibility = "visible"
        element.style.scale = "0"
        let scale = 0
        let interval = setInterval(() => {
            if (scale < 1.2) {
                scale += 0.10
                element.style.scale = `${scale}`
            }else{
                element.style.scale = "1"
                clearInterval(interval)
            }
        }, 10);
    }
}