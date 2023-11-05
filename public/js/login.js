const form = document.querySelector("form")
const inputs = document.querySelectorAll("input")
const section = document.querySelector("section")
//La razón de la animación en js en lugar de css es por comodida a la hora de mostrar errores.
function errorAnimation(message,element){
    element.value = message
    element.style.position = "relative"
    element.style.color = "#ff4646"
    element.style.left = "0"
    element.setAttribute("type","text")
    element.style.pointerEvents = "none"
    setTimeout(() => {
        element.style.left = "-10px"
    }, 100);
    setTimeout(() => {
        element.style.left = "10px"
    }, 200);
    setTimeout(() => {
        element.style.left = "-10px"
    }, 300);
    setTimeout(() => {
        element.style.left = "10px"
    }, 400);
    setTimeout(() => {
        element.style.left = "-10px"
    }, 500);
    setTimeout(() => {
        element.style.left = "10px"
    }, 600);
    setTimeout(() => {
        element.style.left = "-10px"
    }, 700);
    setTimeout(() => {
        element.style.left = "0"
    }, 800);
    setTimeout(() => {
        element.style.color = "inherit"
        element.value = ""
        element.style.pointerEvents = "all"
    }, 3000);
}
form.addEventListener("submit", (event) => {
    if (inputs.length == 2) {//Este caso es para el login
        //Aunque parece repetirse, cambian cosas sutiles, lo que hace muy complejo reutilizar algo de código
        inputs.forEach( (input) => {
        if (input.value.trim() == "") {
            event.preventDefault()
            errorAnimation("Error, campo vacio.",input)
            setTimeout(() => {
                inputs[1].setAttribute("type","password")
                input.value("")
            }, 3000);
        }else if(!/^[a-záéíóúñ \-._\d]{3,20}$/i.test(inputs[0].value.trim()) && 
        !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(inputs[0].value.trim())){
            event.preventDefault()
            errorAnimation("Identificador no válido",inputs[0])
            setTimeout(() => {
                input.value("")
            }, 3000);
        }else if(inputs[1].value.length < 10){
            event.preventDefault()
            errorAnimation("Min 10 caracteres",inputs[1])
            setTimeout(() => {
                inputs[1].value = ""
                inputs[1].setAttribute("type","password")
            }, 3000);
        }else if(inputs[1].value.length > 20){
            event.preventDefault()
            errorAnimation("Max 20 caracteres",inputs[1])
            setTimeout(() => {
                inputs[1].value = ""
                inputs[1].setAttribute("type","password")
            }, 3000);
        }})
    }else{//Este caso es para el signUp
        inputs.forEach( (input) => {
        if (input.value.trim() == "") {//Evaluación de campos vacíos.
            event.preventDefault()
            errorAnimation("Error, campo vacio.",input)
            setTimeout(() => {
                inputs[2].setAttribute("type","password")
                //En la animación se le cambia el atributo type a text, para que el mensaje se pueda ver.
                //Cuando la animación termina, después de 3000s vuelve a password.
            }, 3000);
        }else if(!/^[a-záéíóúñ \-._\d]{3,20}$/i.test(inputs[0].value.trim())){//Evaluación de nombre de usuario.
            event.preventDefault()
            errorAnimation("Nombre no válido",inputs[0])
        }else if(!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(inputs[1].value.trim())){//Evaluación de email de usuario.
            event.preventDefault()
            errorAnimation("Email no válido",inputs[1])
        }else if(inputs[2].value.length < 10){//Evaluación de longitud mínima de contraseña.
            event.preventDefault()
            errorAnimation("Min 10 caracteres",inputs[2])
            setTimeout(() => {
                inputs[2].setAttribute("type","password")
            }, 3000);
        }else if(inputs[2].value.length > 20){//Evaluación de longitud máxima de contraseña.
            event.preventDefault()
            errorAnimation("Max 20 caracteres",inputs[2])
            setTimeout(() => {
                inputs[2].setAttribute("type","password")
            }, 3000);
        }})
    }
})
document.addEventListener("DOMContentLoaded",()=>{
    inputs.forEach( input => {
        if (input.value !== "") {
            errorAnimation(input.value,input)
            setTimeout(() => {
                inputs[1].setAttribute("type","password")
            }, 3000);
        }
    })
})