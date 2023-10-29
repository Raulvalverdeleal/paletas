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
const buscarPaleta = document.querySelector("#buscarPaleta")

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
            new Paleta( usuario._id, nombre, contenedor)
        });
})

logOut.addEventListener("click",()=>{
    window.location.href = "/logout"
})

function itemAnimation(section,maxHeight,openHeight,message){
    section.style.height = maxHeight
    let infoItem = document.createElement("p")
    infoItem.style.scale = "1"
    let stillIn = true
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
        section.style.height = stillIn ? openHeight : "30px"
    }, 3000);
    section.appendChild(infoItem)
    section.addEventListener("mouseout",()=>{
        infoItem.remove()
        stillIn = false
        section.style.height = "30px"
    })
    section.addEventListener("mouseover",()=>{
        section.style.height = openHeight
    })
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
        sectionMenu4.innerHTML = "Borrar cuenta"
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

sectionMenu4.addEventListener("click", ()=>{
    contador++
    switch (contador) {
        case 1:
            sectionMenu4.innerHTML = "Click para confirmar" 
        break;
        case 2:
            sectionMenu4.innerHTML = "¿De verdad quieres?" 
        break;
        case 3:
            sectionMenu4.innerHTML = "Perderás todos tus datos" 
        break;
        case 4:
            sectionMenu4.innerHTML = "¿Estás seguro?" 
        break;
        case 5:
            let texto = "OK, procesando"
            sectionMenu4.innerHTML = texto
            let puntos = 0
            sectionMenu4.style.pointerEvents = "none"
            let interval = setInterval(() => {
                if (puntos == 3) {
                    texto = "OK, procesando"
                    puntos = 0
                    sectionMenu4.innerHTML = texto
                }
                texto += "."
                sectionMenu4.innerHTML = texto
                puntos++
            }, 500);
            setTimeout(() => {
                clearInterval(interval)
                sectionMenu4.style.pointerEvents = "all"
                sectionMenu4.innerHTML = "Por si acaso, click otra vez"
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
            body : JSON.stringify({ tipo : 2, paleta : nombre}),
            headers : {
                "Content-type" : "application/json"
            }
            })
            .then(respuesta => respuesta.json())
            .then(({r}) => { 
                if (typeof(r) == "string") {
                    errorAnimation(r)
                }else{
                    new Paleta(r.userId , r.pallete_n, contenedor)
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
            itemAnimation(sectionMenu1,"130px","100px",r)
        })
    }else itemAnimation(sectionMenu1,"130px","100px","Rellene los campos.")
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
            itemAnimation(sectionMenu2,"130px","100px",r)
        })
    }else itemAnimation(sectionMenu2,"130px","100px","Rellene los campos.")
    
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
            itemAnimation(sectionMenu3,"230px","190px",r)
        })
        }else itemAnimation(sectionMenu3,"230px","190px","No coinciden.")
    }
)
buscarPaleta.addEventListener("input",()=>{
    const paletas = document.getElementsByClassName("paleta")
    article.style.display = "none"
    for (let i = 0; i < paletas.length; i++) {
        paletas[i].classList.add("paletteDisappears")
        setTimeout(() => {  
            const buscar = new RegExp(buscarPaleta.value.trim(),"i")
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
buscarPaleta.addEventListener("blur",()=>{
    article.style.display = "block"
})