const contenedor = document.querySelector(".contenedor");
const colorForm = document.querySelector(".addColorButtons li form")
const colorInput = document.querySelector(".addColorButtons li form input")
const addColorButtons = document.querySelectorAll(".addColorButtons li button")
const navInputs = document.querySelectorAll("nav section input")
const h2 = document.querySelector("h2")
const nav = document.querySelector("nav")
const exportButton = document.querySelector("nav section:last-child :last-child:not(span)")
const tooltip = document.querySelector("nav .tooltiptext")
const displayInfo = document.querySelector("#displayInfo")
const info = document.querySelector("#info")
const pops = document.querySelectorAll(".item")
const tooltips = document.querySelectorAll("#info .tooltip")
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
            console.log(contenedor)
            console.log(respuesta)
            items = respuesta.array.colores.length
            respuesta.array.colores.forEach(({id,r,g,b}) => {
                new Color(respuesta.array.nombre,{id,r,g,b},contenedor)
            })
        }
    })
})
colorForm.addEventListener("submit",(event)=>{
    event.preventDefault()
    let ocolor = hexToRgb(colorInput.value)
    fetch("/to-add",{
        method : "POST",
        body : JSON.stringify({tipo : 3, paleta_n : h2.innerHTML, color : ocolor}),
        headers : {
            "Content-type" : "application/json"
        }
    })
    .then( respuesta => respuesta.json())
    .then( respuesta => {
        ocolor.id = respuesta.r
        items++
        new Color(h2.innerHTML,ocolor,contenedor)
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
        console.log(hc,sc,lc)
        addColorButtons[0].style.backgroundColor = `hsl(${h + Number(navInputs[0].value)},${(s + Number(navInputs[1].value)) < 101 ? Number(navInputs[1].value) + s : 100}%,${(l + Number(navInputs[2].value)) < 101 ? Number(navInputs[2].value) + l : 100}%)`
        addColorButtons[1].style.backgroundColor = `hsl(${h - Number(navInputs[0].value)},${(s - Number(navInputs[1].value)) > -1 ? s - Number(navInputs[1].value) : 0}%,${(l - Number(navInputs[2].value)) > -1 ? l - Number(navInputs[2].value) : 0}%)`
        addColorButtons[2].style.backgroundColor = `hsl(${hc},${sc}%,${lc}%)`
    }
})
addColorButtons.forEach( button => {
    button.addEventListener("click",()=>{
        if (!!button.style.backgroundColor) {
            let [r,g,b] = extractRGBValues(button.style.backgroundColor)
            let ocolor = {r : r, g : g, b : b}
            fetch("/to-add",{
            method : "POST",
            body : JSON.stringify({tipo : 3, paleta_n : h2.innerHTML, color : ocolor}),
            headers : {
                "Content-type" : "application/json"
                }
            })
            .then( respuesta => respuesta.json())
            .then( respuesta => {
                ocolor.id = respuesta.r
                items++
                new Color(h2.innerHTML,ocolor,contenedor)
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
let opened = false
displayInfo.addEventListener("click",()=>{
    info.classList.remove("displayNone")
    opened = !opened
    if (opened) {
        pops.forEach( item => item.classList.remove("close"))
        info.style.display = "inline-block"
        info.classList.remove("closeInfo")
        info.classList.add("on")
    }else{
        pops.forEach( item => item.classList.add("close"))
        info.classList.remove("on")
        info.classList.add("closeInfo")
        tooltips.forEach( item => { item.style.display = "none"})
        pops.forEach( item => { item.style.display = "inline-block"})
        setTimeout(() => {
            info.style.display = "none"
        }, 200);
    }
    
})
for (let i = 0; i < pops.length; i++) {
    pops[i].addEventListener("click",()=>{
        pops.forEach( item => item.style.display = "inline-block")
        tooltips.forEach( item => {
                item.style.display = "none"
                tooltips[i].style.display = "inline-block"
                pops[i].style.display = "none"
        })
    })
    tooltips[i].addEventListener("click",()=>{
        tooltips[i].style.display = "none"
        pops[i].style.display = "inline-block"
    })
    
}