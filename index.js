const express = require("express")
const servidor = express()
const {json} = require("body-parser")
const {colores,eliminar,agregar,editar,createCollection,readCollections,deleteCollection} = require("./db/configuracion.js");
let puerto = process.env.PORT || 4000;
let collection = ""

servidor.use(json())

function validate(value){
    let resultado = 0
    if (value || value == 0) {
        let validate = /^\d{1,3}$/.test(Number(value))
        if (validate) {
            if (value >= 0 && value <= 255) {
                resultado = value
            }else if(value < 0){
                resultado = 0
            }else resultado = 255
        }else resultado = 0
    }else resultado = 0
    return resultado
}

//Middleware que sirve los ficheros 
servidor.use("/",express.static("./front"))



//Middleware que lee los colores que hay en la colloection pasada
servidor.get("/lectura", async (peticion,respuesta) => {

    if (collection !== "") {
        let resultado = await colores(collection);
        respuesta.json(resultado)
    }else{
        respuesta.json({ error : "No se ha indicado que paleta se debe mostrar." })
    }

})

//Middleware para el oreview de los colores.
servidor.get("/lectura/:name", async (peticion,respuesta) => {
        let resultado = await colores(peticion.params.name);
        respuesta.json(resultado)
})

//Middleware que lee todas las collections de la db para pintarlas en el index.html
servidor.get("/lectura-collections", async (peticion,respuesta) => {
    let resultado =  await readCollections()
    respuesta.json(resultado)
})
//Middleware para agregar un color a la collection correspondiente
servidor.post("/agregar-color",async (peticion,respuesta) => {
    let resultado = await agregar({r : validate(peticion.body.r), g : validate(peticion.body.g), b : validate(peticion.body.b)},collection)
    respuesta.json(resultado) 
    
})
//Middleware para actualizar un color en la collection correspondiente
servidor.put("/update-color",async (peticion,respuesta) => {
    let resultado = await editar({id : peticion.body.id, r : validate(peticion.body.r), g : validate(peticion.body.g), b : validate(peticion.body.b)},collection)
    respuesta.json(resultado)
})

//Middleware que cra una nueva collection vacía
servidor.post("/create-collection", async (peticion,respuesta) => {
    let consultando = await readCollections()
    let error = { is : false}
    if (peticion.body.name !== "") {
        consultando.forEach(({name}) => {
            if (peticion.body.name == name) {
                error.is = true
                respuesta.send(error)
    
            }
        });
        if (!error.is) {
            let resultado = await createCollection(peticion.body.name)
            console.log(resultado)
            respuesta.send(resultado)
        }
    }else{
        error.is = true
        respuesta.send(error)
    }
    
})

//Middleware que recoge la collection a la cual se va anavegar
servidor.get("/collection/:name", (peticion,respuesta) => {
    collection = peticion.params.name
    respuesta.send("ok")
})

//Middleware que envía el nombre de la collection para saber cual tiene que leer
servidor.get("/lectura-collection", (peticion,respuesta) => {    
    respuesta.json(collection)
})

//Middleware que elimina un color en una collection determinada
servidor.delete("/eliminar-color", async (peticion,respuesta) => {
    resultado = await eliminar(peticion.body.id,collection)
    respuesta.json(resultado)
})

//Middleware que elimina una collection determinada
servidor.delete("/delete-collection", async (peticion,respuesta) => {
    let resultado = await deleteCollection(peticion.body.name)
    respuesta.json(resultado)
})

servidor.listen(puerto)