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

/*  #11 -> Undécimo fetch, para cargar los colores en la plantilla colores.ejs
    FORMATO:
    mismo formato que el visto en Opaleta linea 96.
*/
document.addEventListener("DOMContentLoaded", ()=> {
    fetch("/get-colors-from-palette",{
        method : "POST",
        body : JSON.stringify({paleta : h2.innerHTML}),
        headers : {
            "Content-type" : "application/json"
        }
    })
    .then(respuesta => respuesta.json())
    .then(r => {
        if (!r.err) {
            items = r.value.length
            r.value.forEach(({id,r,g,b}) => {
                new Color(h2.innerHTML,{id,r,g,b},contenedor)
            })
        }
    })
})
/*  #12 -> Duodécimo fetch, para añadir un color desde el formulario
    FORMATO: 
    respuesta ok -> r.value = id del color añadido
    respuesta ko -> r.value = false
*/
colorForm.addEventListener("submit",(event)=>{
    event.preventDefault()
    let ocolor = hexToRgb(colorInput.value)
    //el value de un input type color, siempre es en hexadecimal,
    //esta función lo trasforma a rgb con el siguiente formato: { r: x, g: y, b: z }
    fetch("/add-new-color",{
        method : "POST",
        body : JSON.stringify({nombre : h2.innerHTML, color : ocolor}),
        headers : {
            "Content-type" : "application/json"
        }
    })
    .then( respuesta => respuesta.json())
    .then( r => {
        if (!r.err) {
            ocolor.id = r.value //se añade la propiedad restante a objeto color
            items++ //se hace update al valor en base al cual los colores calculan su ancho
            new Color(h2.innerHTML,ocolor,contenedor)   
        }
    })
})

//función para convertit "rgb( x, y, z)" en [x,y,z]
function extractRGBValues(backgroundColor) {
  // El valor de backgroundColor tiene el formato rgb(r, g, b)"
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
/* -- */
// Validación de los valores H S L del nav.
navInputs[0].addEventListener("input",()=>{
    navInputs[0].value = navInputs[0].value > 0 && navInputs[0].value < 361 ? navInputs[0].value : navInputs[0].value > 360 ? null : null
})
navInputs[1].addEventListener("input",()=>{
    navInputs[1].value = navInputs[1].value > 0 && navInputs[1].value < 101 ? navInputs[1].value : navInputs[1].value > 100 ? null : null
})
navInputs[2].addEventListener("input",()=>{
    navInputs[2].value = navInputs[2].value > 0 && navInputs[2].value < 101 ? navInputs[2].value : navInputs[2].value > 100 ? null : null
})
/* -- */

window.addEventListener("click",(event)=>{
    if (event.target.classList.contains("color")) {
    //si el elemento tiene .color, osea es un li de ul.contenedor, entonces:
        //se manejan las conversiones y cálculos necesarios.
        let [r,g,b] = extractRGBValues(event.target.style.backgroundColor)
        let [h,s,l] = rgbToHsl(r,g,b)
        let [hc,sc,lc] = calculateComplementaryHSL(h,s,l)//c se refiere a complementary
        //De si la suma o resta, sobrepasa los límites de los valores H S L, se encarga el navegador.
        addColorButtons[0].style.backgroundColor = `hsl(${h + Number(navInputs[0].value)},${s + Number(navInputs[1].value)}%,${l + Number(navInputs[2].value)}%)`
        addColorButtons[1].style.backgroundColor = `hsl(${h - Number(navInputs[0].value)},${s - Number(navInputs[1].value)}%,${l - Number(navInputs[2].value)}%)`
        addColorButtons[2].style.backgroundColor = `hsl(${hc},${sc}%,${lc}%)`
    }
})
addColorButtons.forEach( button => {
/*  #13 -> Decimotercer fetch, para añadir un color desde los botones modificadores
    FORMATO: 
    respuesta ok -> r.value = id del color añadido
    respuesta ko -> r.value = false
    */
    button.addEventListener("click",()=>{
        if (!!button.style.backgroundColor) {
            let [r,g,b] = extractRGBValues(button.style.backgroundColor)
            let ocolor = {r : r, g : g, b : b}
            fetch("/add-new-color",{
            method : "POST",
            body : JSON.stringify({nombre : h2.innerHTML, color : ocolor}),
            headers : {
                "Content-type" : "application/json"
                }
            })
            .then( respuesta => respuesta.json())
            .then( r => {
                if (!r.err) {
                    ocolor.id = r.value
                    items++
                    new Color(h2.innerHTML,ocolor,contenedor)
                }
            })
        }
    })
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
//Exporta un SVG copiado al portapapeles:
exportButton.addEventListener("click",()=>{
    if (document.getElementsByClassName("color").length !== 0) {//si la paleta contiene al menos un color, entonces:
        let colorElements = document.querySelectorAll('.color');
        let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${colorElements.length * 110}" height="220">`;
        //crea el "documento, con 220 px de altura y items * 110 de anchura"
        //por cada li .color:
        colorElements.forEach((colorBox, index) => {
            const color = colorBox.style.backgroundColor;//establece el color de relleno del rectángulo.
            const x = index * 110;//establece la coordenada x del rectángulo, su ancho + 10 de margen.
            svgContent += `<rect x="${x}" y="10" width="100" height="200" rx="20" ry="20" fill="${color}"/>`;
            //Concatena al string inicial, un rectángulo de ancho 100 y altura 200, donde rx y ry se refieren al border radius, y le asigna de relleno el propio color del li.color
        });
        svgContent += `</svg>`;//añade etiqueta de cierre.
        navigator.clipboard.writeText(svgContent)
        .then(hoverTooltip(tooltip))
    }
})
//Abre el tutorial
let opened = false
displayInfo.addEventListener("click",()=>{
    info.classList.remove("displayNone")
    opened = !opened
    pops.forEach( item => item.classList.remove("close"))
    info.style.display = "inline-block"
    info.classList.remove("closeInfo")
    info.classList.add("on")
})
//cierra el tutorial
info.addEventListener("click",()=>{
    opened = !opened
    pops.forEach( item => item.classList.add("close"))
    info.classList.remove("on")
    info.classList.add("closeInfo")
    tooltips.forEach( item => { item.style.display = "none"})
    pops.forEach( item => { item.style.display = "inline-block"})
    setTimeout(() => {
        info.style.display = "none"
    }, 200);
})
//controla el toggle de cerrar y abrir las tooltips, pops son los círculos.
for (let i = 0; i < pops.length; i++) {
    pops[i].addEventListener("click",(e)=>{
        e.stopPropagation()
        pops.forEach( item => item.style.display = "inline-block")
        tooltips.forEach( item => {
            item.style.display = "none"
            tooltips[i].style.display = "inline-block"
            pops[i].style.display = "none"
        })
    })
    tooltips[i].addEventListener("click",(e)=>{
        e.stopPropagation()
        tooltips[i].style.display = "none"
        pops[i].style.display = "inline-block"
    })
    
}

// Funcionalidad de arrastrar elemento:
let elementoDestino = null; // Para rastrear el elemento de destino
contenedor.addEventListener("dragstart", (event) => {
  // Establece el dato que se va a arrastrar (en este caso, el ID del elemento)
  event.dataTransfer.setData("text/plain", event.target.id);
});
// Evento al arrastrar sobre el contenedor
contenedor.addEventListener("dragover", (event) => {
  event.preventDefault(); // Permite soltar elementos aquí
  // Obtiene el elemento de destino
  const targetElement = event.target;
  // Verifica si el destino es un elemento <li>
  if (targetElement.tagName === "LI") {
    // Quita la clase de resaltado del elemento anterior, si lo hay
    if (elementoDestino) {
      elementoDestino.classList.remove("insert-highlight");
    }
    // Establece el nuevo elemento de destino y le aplica una clase de resaltado
    elementoDestino = targetElement;
    elementoDestino.classList.add("insert-highlight");
    //Esto es lo que añade y quita el border left
  }
});
// Evento al salir del área de destino
contenedor.addEventListener("dragleave", () => {
  // Quita la clase de resaltado cuando se sale del elemento de destino
  if (elementoDestino) {
    elementoDestino.classList.remove("insert-highlight");
  }
});
// Evento al soltar un elemento
contenedor.addEventListener("drop", (event) => {
  event.preventDefault();
  // Obtiene el ID del elemento arrastrado desde el portapapeles de datos
  const data = event.dataTransfer.getData("text/plain");
  const elementoArrastrado = document.getElementById(data);
  // Inserta el elemento en la posición correcta
  if (elementoDestino) {
    elementoDestino.classList.remove("insert-highlight"); // Quita la clase de resaltado
    elementoDestino.parentNode.insertBefore(elementoArrastrado, elementoDestino);
  } else {
    contenedor.appendChild(elementoArrastrado);
  }
});
