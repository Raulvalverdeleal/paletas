//En todos los casos: Si el usuario intenta saltarse la validación en el front, el servidor respondera con status 500 y r.value = false
//Aplica para Opaleja.js, Ocolor.js, login.js y colors.js
const article = document.querySelector("article")
const h2nombre = document.querySelector("article h2")
const menuButton = document.querySelector("nav button:first-child")
const menu = document.querySelector(".menu")
const fondo = document.querySelector(".fondo")
const contenedor = document.querySelector(".supreme")
const logOut = document.querySelector("nav button:last-child")
const form = document.querySelector("nav form")
const input = document.querySelector("nav form input:first-child")
/* -- */
//Con una función que recibiese los datos de fetch URL, body, validación necesaria, mensajes de error, alto de menú etc se podría simplificar.
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
const buscarPaleta = document.querySelector(".buscarPaleta")
/* -- */
//para todos los elementos clicables del menú desplegable, aunque como no perjudican al resto de elementos que encajen con la query, pues no es necesario filtrar más.
const stopPropagation = document.querySelectorAll("input[type=text],input[type=password],input[type=submit]")

//#1 -> Primer fetch, tiene como objetivo obtener las paletas de un determinado usuario.
fetch("/get-palettes")
.then( respuesta => respuesta.json())
.then( r => {
/* 
    FORMATO:
    respuesta ok: r.value : array de paletas [{ nombre : "paleta-1", colores : []},...]
    respuesta ko: r.err = false.
*/
    if (!r.err) {
        r.value.forEach(({nombre}) => {
            new Paleta(nombre, contenedor)
        });
    }
})

logOut.addEventListener("click",()=>{
    window.location.href = "/logout"
})

//Esta función anima el feedback de los formularios del menú despegable
function itemAnimation(section,maxHeight,message){
/*
    section: se refiere al li  del menú.
    maxHeight: se refiere a la altura que tendrá que tener cuando se muestre el error.
    message: con lo que identificará si debe mostrar un feedback positivo o negativo.
*/
    section.style.height = maxHeight
    let infoItem = document.createElement("p")
    infoItem.style.scale = "1"
    if (typeof(message) == "boolean" && message) {
/*  r.value, si no ha ocurrido ningún error, contendrá el valor acknowledge de la operación. */
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
//esta variable contador es para los mensajes de error de borrar cuenta.
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

//animación del article.
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
/*      Aunque sea una URL accesible para todo el mundo en el backend está securizada 
        #2 -> Segundo fetch, para eliminar todos los datos de una session.
*/
            fetch("/delete-user",{
                method : "GET"
            })
            .then( respuesta => respuesta.json())
            .then( r => {
                if(!r.err){
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
    let nombre = input.value.trim()
    if (/^[a-záéíóúñ \-._\d]{1,27}$/i.test(nombre)) {
/*  #3 -> Tercer fetch, para añadir nuevas paletas.
    FORMATO:
    respuesta ok: r.value = { nombre : "nombre paleta"}
    respuesta ko: r.value = "Descripción del error"
 */
        fetch(`/add-new-palette`,{
        method : "POST",
        body : JSON.stringify({paleta : nombre}),
        headers : {
            "Content-type" : "application/json"
        }
        })
        .then(respuesta => respuesta.json())
        .then(r => { 
            console.log(r)
            if (r.err) {
                errorAnimation(r.value)
            }else{
                new Paleta(r.value.nombre, contenedor)
                input.value = ""
            }
        })
    }else{
        errorAnimation("a-zA-záéíóú0-9 .-_ min 2 max 20")
    }
})
/*  #4 -> Cuarto fetch, para actualizar el nombre de usuario.
    FORMATO:
    respuesta ok: r.value = true (acknowledge)
    respuesta ko: r.value = "Descripción del error"
 */
cambiarNombreform.addEventListener("submit",(event)=>{
    event.preventDefault()
    let nombre = cambiarNombreInput.value.trim()
    if (/^[a-záéíóúñ \-._\d]{3,20}$/i.test(nombre)) {
        fetch("/update-user-name",({
            method : "PUT",
            body : JSON.stringify({newName : nombre}),
            headers : {
                "Content-type" : "application/json"
            }
        }))
        .then( respuesta => respuesta.json())
        .then( r => {
            itemAnimation(sectionMenu1,"140px",r.value)
            if (!r.err) {
                h2nombre.innerHTML = `<br>${nombre}`
            }
        })
    }else itemAnimation(sectionMenu1,"140px","a-zA-záéíóú0-9 .-_ min 2 max 20")
})
/*  #5 -> Quinto fetch, para actualizar el email de usuario.
    FORMATO:
    respuesta ok: r.value = true (acknowledge)
    respuesta ko: r.value = "Descripción del error"
 */
cambiarEmailform.addEventListener("submit",(event)=>{
    event.preventDefault()
    let email = cambiarEmailInput.value.trim()
    if (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
        fetch("/update-user-email",({
        method : "PUT",
        body : JSON.stringify({newEmail : email}),
        headers : {
                "Content-type" : "application/json"
            }
        }))
        .then( respuesta => respuesta.json())
        .then( r => {
            itemAnimation(sectionMenu2,"140px",r.value)
        })
    }else itemAnimation(sectionMenu2,"140px","Email no válido.")
    
})
/*  #6 -> Sexto fetch, para actualizar la contraseña del usuario.
    FORMATO:
    respuesta ok: r.value = true (acknowledge)
    respuesta ko: r.value = "Descripción del error"
 */
cambiarContrasenaForm.addEventListener("submit",(event) => {
    event.preventDefault()
    if (cambiarContrasenaInput1.value == cambiarContrasenaInput2.value) {
        if (cambiarContrasenaInput2.value.length < 10) {
            return itemAnimation(sectionMenu3,"240px","Min 10 caracteres.")
        }
        if (cambiarContrasenaInput2.value.length > 10) {
            return itemAnimation(sectionMenu3,"240px","Max 20 caracteres.")
        }
        fetch("/update-user-password",{
            method : "PUT",
            body : JSON.stringify({newPassword : cambiarContrasenaInput2.value}),
            headers : {
                "Content-type" : "application/json"
            }
        })
        .then( respuesta => respuesta.json())
        .then( r => {
            itemAnimation(sectionMenu3,"240px",r.value)
        })
    }else itemAnimation(sectionMenu3,"240px","No coinciden.")
})

buscarPaleta.addEventListener("input",()=>{
/*
    Los elementos Paleta en el html son de la siguiente manera:
    <li id="nombre-único-de-paleta" class="paleta">...</li>
    Así puedes seleccionar a uno, y a todos.
*/
    const paletas = document.getElementsByClassName("paleta")
    article.style.display = "none"
    for (let i = 0; i < paletas.length; i++) {
        paletas[i].classList.add("paletteDisappears")
        setTimeout(() => {  
            const buscar = new RegExp(buscarPaleta.value.trim(),"i")
            let arrIds = []//Se guardan los Ids de las paletas que hay en el momento del evento input
            for (let j = 0; j < paletas.length; j++) {
                arrIds.push(paletas[j].attributes.id.value)
            }
            const matchedPalettes = arrIds.filter( id => buscar.test(id))//Se filtran por el valor del input
            paletas[i].style.display = "none"   
            matchedPalettes.forEach( id => {
                //A las paletas que encajen se le aplican los siguientes cambios
                let paleta = document.getElementById(id)
                paleta.classList.remove("paletteDisappears")
                paleta.style.display = "flex"
            })
        }, 200);//este timeout es por la duración de la animación.
    }
})
buscarPaleta.addEventListener("blur",()=>{
    article.style.display = "block"
})
/* -- */
//menú acordeón
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
/* -- */