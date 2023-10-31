const article = document.querySelector("article")
const h2nombre = document.querySelector("article h2")
const menuButton = document.querySelector("nav button:first-child")
const menu = document.querySelector(".menu")
const fondo = document.querySelector(".fondo")
const contenedor = document.querySelector(".supreme")
const logOut = document.querySelector("nav button:last-child")
const form = document.querySelector("nav form")
const input = document.querySelector("nav form input:first-child")
const cambiarNombreform = document.querySelector(".menu li:first-child form")
const cambiarNombreInput = document.querySelector(".menu li:first-child form input:first-child")
const cambiarEmailform = document.querySelector(".menu li:nth-child(2) form")
const cambiarEmailInput = document.querySelector(".menu li:nth-child(2) form input:first-child")
const cambiarContrasenaForm = document.querySelector(".menu li:nth-child(3) form")
const cambiarContrasenaInput1 = document.querySelector(".menu li:nth-child(3) form input:first-child")
const cambiarContrasenaInput2 = document.querySelector(".menu li:nth-child(3) form input:nth-child(2)")
const sectionMenu1 = document.querySelector(".menu li:first-child")
const sectionMenu2 = document.querySelector(".menu li:nth-child(2)")
const sectionMenu3 = document.querySelector(".menu li:nth-child(3)")
const sectionMenu4 = document.querySelector(".menu li:nth-child(4)")
const sectionMenu5 = document.querySelector(".menu li:last-child")
const buscarPaleta = document.querySelectorAll(".buscarPaleta")
const stopPropagation = document.querySelectorAll("input[type=text],input[type=password],input[type=submit]")

fetch("/to-read",{
    method : "POST",
    body : JSON.stringify({ tipo : 1 }),
    headers : {
        "Content-type" : "application/json"
    }
})
.then( respuesta => respuesta.json())
.then( usuario => {
    
        usuario.usuario.paletas.forEach(({nombre}) => {
            new Paleta(nombre, contenedor)
        });
})

logOut.addEventListener("click",()=>{
    window.location.href = "/logout"
})
function itemAnimation(section,maxHeight,message){
    section.style.height = maxHeight
    let infoItem = document.createElement("p")
    infoItem.style.scale = "1"
    if (message.acknowledged) {
        infoItem.innerHTML = "Cambios guardados"
        infoItem.className = "menuInfo menuSucces"
    }else{
        infoItem.innerHTML = message
        infoItem.className = "menuInfo menuError"
    }
    setTimeout(() => {
            infoItem.style.scale = "0"
    }, 2700);
    setTimeout(() => {
        infoItem.remove()
        section.removeAttribute("style")
    }, 3000);
    section.appendChild(infoItem)
}


let contador = 0
let menuDisplayed = false
menuButton.addEventListener("click", ()=> {
    menuDisplayed = !menuDisplayed
    if (menuDisplayed) {
        menu.classList.remove("hidden")
        fondo.className = "fondo"
    }else{
        contador = 0
        sectionMenu5.innerHTML = "Borrar cuenta"
        menu.classList.add("hidden")
        fondo.className = "fondo displayNone"

    }
})
fondo.addEventListener("click",()=> {
    menu.classList.add("hidden")
    fondo.className = "fondo displayNone"
    menuDisplayed = false
})
window.addEventListener("scroll", (event)=>{
    article.style.position = "relative"
    article.style.left = `-${window.scrollY * 2}px`
})

sectionMenu5.addEventListener("click", ()=>{
    contador++
    switch (contador) {
        case 1:
            sectionMenu5.innerHTML = "Click para confirmar" 
        break;
        case 2:
            sectionMenu5.innerHTML = "¿De verdad quieres?" 
        break;
        case 3:
            sectionMenu5.innerHTML = "Perderás todos tus datos" 
        break;
        case 4:
            sectionMenu5.innerHTML = "¿Estás seguro?" 
        break;
        case 5:
            let texto = "OK, procesando"
            sectionMenu5.innerHTML = texto
            let puntos = 0
            sectionMenu5.style.pointerEvents = "none"
            let interval = setInterval(() => {
                if (puntos == 3) {
                    texto = "OK, procesando"
                    puntos = 0
                    sectionMenu5.innerHTML = texto
                }
                texto += "."
                sectionMenu5.innerHTML = texto
                puntos++
            }, 500);
            setTimeout(() => {
                clearInterval(interval)
                sectionMenu5.style.pointerEvents = "all"
                sectionMenu5.innerHTML = "Por si acaso, click otra vez"
            }, 3000);
        break;
        case 6:
            fetch("deleteuser",{
                method : "GET"
            })
            .then( respuesta => respuesta.json())
            .then( respuesta => {
                console.log(respuesta)
                if(respuesta.deletedCount){
                    window.location.href = "/logout"
                }
            })
        break;
    }
})
function errorAnimation(message){
    input.value = message
    input.style.position = "relative"
    input.style.color = "#ff4646"
    input.style.left = "0"
    input.style.pointerEvents = "none"
    setTimeout(() => {
        input.style.left = "-20px"
    }, 100);
    setTimeout(() => {
        input.style.left = "0"
    }, 200);
    setTimeout(() => {
        input.style.left = "-20px"
    }, 300);
    setTimeout(() => {
        input.style.left = "0"
    }, 400);
    setTimeout(() => {
        input.style.left = "-20px"
    }, 500);
    setTimeout(() => {
        input.style.left = "0"
    }, 600);
    setTimeout(() => {
        input.style.left = "-20px"
    }, 700);
    setTimeout(() => {
        input.style.left = "0"
    }, 800);
    setTimeout(() => {
        input.style.color = "inherit"
        input.value = ""

        input.style.pointerEvents = "all"
    }, 3000);
}
form.addEventListener("submit",(event) => {
    event.preventDefault()
    if (input.value.trim() !== "") {
        let nombre = /^[a-záéíóúñ \-._\d]{1,27}$/i.test(input.value) ? input.value.trim() : false
        if (nombre) {
            fetch(`/to-add`,{
            method : "POST",
            body : JSON.stringify({tipo : 2, paleta : nombre}),
            headers : {
                "Content-type" : "application/json"
            }
            })
            .then(respuesta => respuesta.json())
            .then(({r}) => { 
                if (typeof(r) == "string") {
                    errorAnimation(r)
                }else{
                    new Paleta(r.pallete_n, contenedor)
                    input.value = ""
                }
            })
        }else{
            errorAnimation("27 char max, sólo a-z 0-9 -_.")
        }
    }else errorAnimation("Campo vacío.")
})

cambiarNombreform.addEventListener("submit",(event)=>{
    event.preventDefault()
    let nombre = cambiarNombreInput.value.trim()
    if (nombre) {
        fetch("/to-update",({
            method : "PUT",
            body : JSON.stringify({tipo : 1, newName : nombre}),
            headers : {
                "Content-type" : "application/json"
            }
        }))
        .then( respuesta => respuesta.json())
        .then( ({r}) => {
            itemAnimation(sectionMenu1,"140px",r)
        })
    }else itemAnimation(sectionMenu1,"140px","Rellene los campos.")
})
cambiarEmailform.addEventListener("submit",(event)=>{
    event.preventDefault()
    let email = cambiarEmailInput.value.trim()
    if (email) {
        fetch("/to-update",({
        method : "PUT",
        body : JSON.stringify({tipo : 2, newEmail : email}),
        headers : {
                "Content-type" : "application/json"
            }
        }))
        .then( respuesta => respuesta.json())
        .then( ({r}) => {
            itemAnimation(sectionMenu2,"140px",r)
        })
    }else itemAnimation(sectionMenu2,"140px","Rellene los campos.")
    
})
cambiarContrasenaForm.addEventListener("submit",(event) => {
    event.preventDefault()
    if (cambiarContrasenaInput1.value.trim() == cambiarContrasenaInput2.value.trim()) {
        fetch("/to-update",{
            method : "PUT",
            body : JSON.stringify({tipo : 3, newPassword : cambiarContrasenaInput2.value}),
            headers : {
                "Content-type" : "application/json"
            }
        })
        .then( respuesta => respuesta.json())
        .then( ({r}) => {
            itemAnimation(sectionMenu3,"240px",r)
        })
        }else itemAnimation(sectionMenu3,"240px","No coinciden.")
    }
)
buscarPaleta.forEach( item => {
    item.addEventListener("input",()=>{
        const paletas = document.getElementsByClassName("paleta")
        article.style.display = "none"
        for (let i = 0; i < paletas.length; i++) {
            paletas[i].classList.add("paletteDisappears")
            setTimeout(() => {  
                const buscar = new RegExp(item.value.trim(),"i")
                let arrIds = []
                for (let j = 0; j < paletas.length; j++) {
                arrIds.push(paletas[j].attributes.id.value)
                }
                const matchedPalettes = arrIds.filter( id => buscar.test(id))
                paletas[i].style.display = "none"   
                matchedPalettes.forEach( id => {
                let paleta = document.getElementById(id)
                paleta.classList.remove("paletteDisappears")
                paleta.style.display = "flex"
                })
            }, 200);
        }
    })
    item.addEventListener("blur",()=>{
        article.style.display = "block"
    })
})

let contador1 = 0
sectionMenu1.addEventListener("click",()=>{
    sectionMenu2.className = ""
    sectionMenu3.className = ""
    sectionMenu4.className = ""
    sectionMenu2.removeAttribute("style")
    sectionMenu3.removeAttribute("style")
    sectionMenu4.removeAttribute("style")
    sectionMenu1.classList.toggle("opened12")
})
let contador2 = 0
sectionMenu2.addEventListener("click",()=>{
    sectionMenu1.className = ""
    sectionMenu3.className = ""
    sectionMenu4.className = ""
    sectionMenu1.removeAttribute("style")
    sectionMenu3.removeAttribute("style")
    sectionMenu4.removeAttribute("style")
    sectionMenu2.classList.toggle("opened12")
})
let contador3 = 0
sectionMenu3.addEventListener("click",()=>{
    sectionMenu1.className = ""
    sectionMenu2.className = ""
    sectionMenu4.className = ""
    sectionMenu1.removeAttribute("style")
    sectionMenu2.removeAttribute("style")
    sectionMenu4.removeAttribute("style")
    sectionMenu3.classList.toggle("opened3")
})
let contador4 = 0
sectionMenu4.addEventListener("click",()=>{
    sectionMenu1.className = ""
    sectionMenu2.className = ""
    sectionMenu3.className = ""
    sectionMenu1.removeAttribute("style")
    sectionMenu2.removeAttribute("style")
    sectionMenu3.removeAttribute("style")
    sectionMenu4.classList.toggle("opened")
})
stopPropagation.forEach( input => input.addEventListener("click",(e)=>{e.stopPropagation()}))