let items = 0
class Color{
    constructor(paleta,color,contenedor){
        this.paleta = paleta;
        this.color = color;
        this.elementoDOM = null;
        this.editando = false;
        this.crearColor(contenedor);
    }
    crearColor(contenedor){
    let [r,g,b] = [this.color.r,this.color.g,this.color.b]
    this.elementoDOM = document.createElement("li")
    this.elementoDOM.classList.add("color")
    this.elementoDOM.style.backgroundColor = `rgb(${r},${g},${b})`
    this.elementoDOM.addEventListener("mouseover", () => {
        this.elementoDOM.style.width = `${items > 1 && items < 7 ? (100 / items) + 25 : items == 1 ? 100 : 30}vw`
        this.elementoDOM.style.maxWidth = `${items > 1 && items < 7 ? (100 / items) + 25 : items == 1 ? 100 : 30}vw`
        hslCode.style.opacity = "1"
    });
    this.elementoDOM.addEventListener("mouseout",()=>{
        hslCode.style.opacity = "0"
        this.elementoDOM.style.width = "100%"
        
    })
    
    let section = document.createElement("section")
    let [h,s,l] = rgbToHsl(r,g,b)
    let hslCode = document.createElement("p")
    hslCode.innerHTML = `H: <b>${Math.round(h)}</b>, S: <b>${Math.round(s)}</b>, L: <b>${Math.round(l)}</b>`
    hslCode.style.opacity = "0"
    hslCode.addEventListener("click",()=>{
        navigator.clipboard.writeText(hslToHex(h,s,l))
        .then( () => hslCode.innerHTML = "Copiado!")
        .catch( () => hslCode.innerHTML = "Error al copiar")
        setTimeout(() => {
            hslCode.innerHTML = `H: <b>${Math.round(h)}</b>, S: <b>${Math.round(s)}</b>, L: <b>${Math.round(l)}</b>`
        }, 1000);
    })
    let editButton = document.createElement("button")
    let editButtonSpan = document.createElement("span")
    editButtonSpan.className = "material-symbols-outlined"
    editButtonSpan.innerHTML = "edit"
    editButtonSpan.style.color = "black"
    let editInput = document.createElement("input")
    editInput.setAttribute("type","color")
    editInput.className = "displayNone"
    let editando = false
    editButton.addEventListener("click",()=>{
        if (!editando) {
            editInput.className = ""
            editInput.value = hslToHex(h,s,l)
            hslCode.className = "displayNone"
        }else{
            let rgb = hexToRgb(editInput.value)
            this.color.r = rgb.r
            this.color.g = rgb.g
            this.color.b = rgb.b
            fetch(`/to-update`,{
            method : "PUT",
            body : JSON.stringify({
                tipo : 5,
                paleta_n : this.paleta,
                color : {
                    id : this.color.id,
                    r : this.color.r,
                    g : this.color.g,
                    b : this.color.b
                }
            }),
            headers : {
                "Content-type" : "application/json"
            }
            })
            .then( respuesta => respuesta.json())
            .then( ({modifiedCount}) => {
                if (modifiedCount == 0) {
                    console.log("ok")
                    console.error("No se ha podido realizar la operación de editar")
                }else{
                    editInput.className = "displayNone"
                    hslCode.className = ""
                    this.elementoDOM.style.backgroundColor = editInput.value
                    let [nh,ns,nl] = hexToHSL(editInput.value)
                    hslCode.innerHTML = `H: <b>${Math.round(nh)}</b>, S: <b>${Math.round(ns)}</b>, L: <b>${Math.round(nl)}</b>`
                }
            })
        }
        editando = !editando
    })
    editInput.addEventListener("input",()=>{
        this.elementoDOM.style.backgroundColor = editInput.value
    })
    let newSection = document.createElement("section")
    let newSectionElements = [editButton,hslCode,editInput]
    editButton.appendChild(editButtonSpan)
    newSectionElements.forEach( element => newSection.appendChild(element))
    section.appendChild(newSection)
    let deleteButton = document.createElement("button")
    let deleteButtonIcon = document.createElement("span")
    deleteButtonIcon.className = "material-symbols-outlined"
    deleteButtonIcon.innerHTML = "delete"
    deleteButton.appendChild(deleteButtonIcon)
    deleteButton.addEventListener("click", ()=> this.deleteColor())
    section.appendChild(deleteButton)
    this.elementoDOM.appendChild(section)
    contenedor.appendChild(this.elementoDOM)
    }
    deleteColor(){
        fetch(`/to-delete`,{
            method : "DELETE",
            body : JSON.stringify({
                tipo : 2,
                paleta_n : this.paleta,
                colorId : this.color.id
            }),
            headers : {
                "Content-type" : "application/json"
            }
        })
        .then(respuesta => respuesta.json())
        .then(respuesta => {
            if (!!!respuesta.acknowledged) {
                console.error("no fue posible realizar la operación de borrar")
            }else{
                items--
                this.elementoDOM.remove()                
            } 
        })
    }
}
