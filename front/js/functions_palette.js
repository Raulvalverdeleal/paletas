const button = document.querySelector("button")
const form = document.querySelector("form")
const input = document.querySelector("input")
const contenedor = document.querySelector(".contenedor")


fetch("/lectura-collections")
.then( respuesta => respuesta.json())
.then( respuesta => {
    
    respuesta.forEach(({name}) => {
        new Paleta(name, contenedor)
    });    

})


form.addEventListener("submit",(event) => {
    event.preventDefault()
    if (input.value.trim() !== "") {
        let nombre = input.value.trim().split(" ").join("-")
        fetch(`/createCollection/${nombre}`)
        new Paleta(nombre, contenedor)
        input.value = ""
    }else input.value = "Escriba algo."
    

})

