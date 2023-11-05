class Paleta{
    constructor(name,contenedor){
        this.name = name;
        this.elementoDOM = null;
        this.crearPaleta(contenedor);
    }
    crearPaleta(contenedor){
        this.elementoDOM = document.createElement("li")
        this.elementoDOM.setAttribute("id",this.name)//se le aplica el Id único (único dentro del perfil del usuario)
        this.elementoDOM.classList.add("paleta")
        let content = document.createElement("div")
        content.classList.add("content")
        let top = document.createElement("section")
        top.classList.add("top")
        let enlace = document.createElement("a")
        console.log(this.name)
        enlace.innerHTML = this.name
        enlace.addEventListener("click", async (event) => {
            event.preventDefault()
        /*  #7 -> Séptimo fetch, para hacer render a colors.ejs con la paleta correcta.
            FORMATO:
            si se envía desde aquí, no hay posible respuesta de error.
            ver: db.js addNewColor
        */
            await fetch(`/get-palette/${this.name}`)
            .then( respuesta => respuesta.text())
            .then( () => {
                enlace.setAttribute("href",`/get-palette/${this.name}`)
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
                let newName = textarea.value.trim()
                if (newName !== this.name) {
                    if (/^[a-záéíóúñ \-._\d]{1,27}$/i.test(newName)) {
/*                  #8 -> Octavo fetch, para actualizar el nombre de la paleta.
                    FORMATO:
                    respuesta ok: r.value = ok (acknowledge)
                    respuesta ko: r.value = "Descripción del error"
*/
                        fetch("/update-palette",{
                            method : "PUT",
                            body : JSON.stringify({nombre : this.name, nuevo : newName}),
                            headers : {
                                "Content-type" : "application/json"
                            }
                        })
                        .then( respuesta => respuesta.json())
                        .then(r => {
                            textarea.classList.add("displayNone")
                            enlace.classList.remove("displayNone")
                            editando = false
                            if (!r.err) {
                                enlace.innerHTML = newName
                                this.name = newName
                                this.elementoDOM.setAttribute("id",this.name)
                                //se actualiza su id para que el buscarpaleta siga siendo efectivo
                            }else this.errorAnimation(enlace,this.name,r.value)
                        })
                    }else{
                        textarea.classList.add("displayNone")
                        enlace.classList.remove("displayNone")
                        editando = false
                        this.errorAnimation(enlace,this.name,"a-zA-záéíóú0-9 .-_ min 2 max 20")
                    }
                }else{
                    textarea.classList.add("displayNone")
                    enlace.classList.remove("displayNone")
                    editando = false
                }
            }else {
                //editando
                enlace.classList.add("displayNone")
                textarea.classList.remove("displayNone")
                textarea.value = this.name
                editando = true
            }

        })
        let topElements = [enlace,textarea,editButton]
        topElements.forEach( element => { top.appendChild(element)})
        let colorContainer = document.createElement("section")
        colorContainer.classList.add("colorsContainer")
        let ul = document.createElement("ul")
        let arrColores = []
        ul.classList.add("colors")
        let p = document.createElement("p")
        /*  #9 -> Noveno fetch, para mostrar la previsualización de los colores de la paleta.
            FORMATO:
            respuesta ok: r.value = arr colores = [{r : x, g : y, b : z, id : 1234567890},...]
            respuesta ko: r.value = false
        */
        fetch(`/get-colors-from-palette`,{
            method : "POST",
            body : JSON.stringify({paleta : this.name}),
            headers : {
                "Content-type" : "application/json"
            }
        })
        .then(respuesta => respuesta.json())
        .then(r => {
            console.log(r)
            if (!r.err) {
                r.value.forEach(({r,g,b}) => {
                    //por cada color se crea el li con su correspondiente tooltip
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
            }else p.innerHTML = `Ha ocurrido un error, recarga la página.`
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
/*          #10 -> Décimo fetch, para eliminar una paleta determinada.
            FORMATO:
            No puede ocurrir un error salvo:
                - error de conexion, manejado con status 500
                - el usuario manipule el fetch desde inpeccionar elemento,
                en ese caso el servidor responderá con status 500, r.err = true, r.value = false.
*/
            fetch(`/delete-palette`,{
                method : "DELETE",
                body : JSON.stringify({
                    nombre : this.name
                }),
                headers : {
                    "Content-type" : "application/json"
                }
            })
            .then(respuesta => respuesta.json())
            .then(r => {
                if (!r.err) {
                    this.elementoDOM.classList.add("paletteDisappears")
                    setTimeout(() => {this.elementoDOM.remove()}, 200);//para la animación
                }
            })
    }//animaciones
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
            element.innerHTML = name
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