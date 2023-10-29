const form = document.querySelector("form")
const inputs = document.querySelectorAll("input")
const section = document.querySelector("section")
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
    inputs.forEach( (input,i) => {
        if (input.value.trim() == "") {
            event.preventDefault()
            errorAnimation("Error, campo vacio.",input)
            if(i == 2){
                setTimeout(() => {
                    inputs[2].setAttribute("type","password")
                }, 3000);
            }
        }else if(!/^[a-záéíóúñ \-._\d]{3,20}$/i.test(inputs[0].value.trim())){
            event.preventDefault()
            errorAnimation("Nombre no válido",inputs[0])
        }else if(!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/i.test(inputs[1].value.trim())){
            event.preventDefault()
            errorAnimation("Email no válido",inputs[1])
        }else if(inputs[2].value.trim().split("").length < 10){
            event.preventDefault()
            errorAnimation("Min 10 caracteres",inputs[2])
            setTimeout(() => {
                inputs[2].setAttribute("type","password")
            }, 3000);
        }
    })
})
document.addEventListener("DOMContentLoaded",()=>{
    if(inputs[0].value !== ""){
        errorAnimation(inputs[0].value,inputs[0])
    }
})