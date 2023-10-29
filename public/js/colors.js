const contenedor = document.querySelector(".contenedor");
const colorForm = document.querySelector(".addColorButtons li form")
const colorInput = document.querySelector(".addColorButtons li form input")
const addColorButtons = document.querySelectorAll(".addColorButtons li button")
const navInputs = document.querySelectorAll("nav section input")
const h2 = document.querySelector("h2")
const nav = document.querySelector("nav")
const exportButton = document.querySelector("nav section:last-child :last-child:not(span)")
const tooltip = document.querySelector(".tooltiptext")
let info = ""
document.addEventListener("DOMContentLoaded", ()=> {
    fetch("/to-read",{
        method : "POST",
        body : JSON.stringify({ tipo : 3, paleta : h2.innerHTML}),
        headers : {
            "Content-type" : "application/json"
        }
    })
    .then(respuesta => respuesta.json())
    .then(respuesta => {
        if (!!respuesta.array) {
            info = respuesta.id
            items = respuesta.array.colores.length
            respuesta.array.colores.forEach(({id,r,g,b}) => {
                new Color(respuesta.id,respuesta.array.nombre,{id,r,g,b},contenedor)
            })
        }
    })
})
colorForm.addEventListener("submit",(event)=>{
    event.preventDefault()
    let ocolor = hexToRgb(colorInput.value)
    fetch("/to-add",{
        method : "POST",
        body : JSON.stringify({tipo : 3, id : info, paleta_n : h2.innerHTML, color : ocolor}),
        headers : {
            "Content-type" : "application/json"
        }
    })
    .then( respuesta => respuesta.json())
    .then( respuesta => {
        ocolor.id = respuesta.r
        items++
        new Color(info,h2.innerHTML,ocolor,contenedor)
    })
})
function extractRGBValues(backgroundColor) {
  // El valor de backgroundColor tiene el formato "rgb(r, g, b)" o "rgba(r, g, b, a)"
  const rgbRegex = /rgb\((\d+),\s*(\d+),\s*(\d+)\)/;
  const match = backgroundColor.match(rgbRegex);

  if (match) {
    const r = parseInt(match[1], 10);
    const g = parseInt(match[2], 10);
    const b = parseInt(match[3], 10);

    return [r, g, b];
  } else {
    return null; // No se encontró un valor RGB válido
  }
}
navInputs[0].addEventListener("input",()=>{
    navInputs[0].value = navInputs[0].value > 0 && navInputs[0].value < 361 ? navInputs[0].value : navInputs[0].value > 360 ? null : null
})
navInputs[1].addEventListener("input",()=>{
    navInputs[1].value = navInputs[1].value > 0 && navInputs[1].value < 101 ? navInputs[1].value : navInputs[1].value > 100 ? null : null
})
navInputs[2].addEventListener("input",()=>{
    navInputs[2].value = navInputs[2].value > 0 && navInputs[2].value < 101 ? navInputs[2].value : navInputs[2].value > 100 ? null : null
})
window.addEventListener("click",(event)=>{
    if (event.target.classList.contains("color")) {
        let [r,g,b] = extractRGBValues(event.target.style.backgroundColor)
        let [h,s,l] = rgbToHsl(r,g,b)
        let [hc,sc,lc] = calculateComplementaryHSL(h,s,l)
        console.log(analogoR)
        analogoR.style.backgroundColor = `hsl(${h + Number(navInputs[0].value)},${(s + Number(navInputs[1].value)) < 101 ? Number(navInputs[1].value) + s : 100}%,${(l + Number(navInputs[2].value)) < 101 ? Number(navInputs[2].value) + l : 100}%)`
        analogoL.style.backgroundColor = `hsl(${h - Number(navInputs[0].value)},${(s - Number(navInputs[1].value)) > -1 ? s - Number(navInputs[1].value) : 0}%,${(l - Number(navInputs[2].value)) > -1 ? l - Number(navInputs[2].value) : 0}%)`
        complementario.style.backgroundColor = `hsl(${hc},${sc}%,${lc}%)`
    }
})
addColorButtons.forEach( button => {
    button.addEventListener("click",()=>{
        if (!!button.style.backgroundColor) {
            let [r,g,b] = extractRGBValues(button.style.backgroundColor)
            let ocolor = {r : r, g : g, b : b}
            fetch("/to-add",{
            method : "POST",
            body : JSON.stringify({tipo : 3, id : info, paleta_n : h2.innerHTML, color : ocolor}),
            headers : {
                "Content-type" : "application/json"
                }
            })
            .then( respuesta => respuesta.json())
            .then( respuesta => {
                ocolor.id = respuesta.r
                items++
                new Color(info,h2.innerHTML,ocolor,contenedor)
            })
        }
    })
})
exportButton.addEventListener("click",()=>{
    if (document.getElementsByClassName("color").length !== 0) {
        let colorElements = document.querySelectorAll('.color');
        let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${colorElements.length * 110}" height="120">`;
        colorElements.forEach((colorBox, index) => {
        const color = colorBox.style.backgroundColor;
        const x = index * 110;
        svgContent += `<rect x="${x}" y="10" width="100" height="100" fill="${color}"/>`;
        });
        svgContent += `</svg>`;
        navigator.clipboard.writeText(svgContent)
        .then( hoverTooltip(tooltip))
    }
})
function hoverTooltip(element){
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
    setTimeout(() => {
        let scale2 = 1
        let interval2 = setInterval(() => {
            if (scale2 > 0) {
                scale2 -= 0.10
                element.style.scale = `${scale2}`
            }else{
                element.style.scale = "0"
                element.style.visibility = "hidden"
                clearInterval(interval2)
            }
        }, 10);
    }, 2000);
}