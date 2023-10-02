const express = require("express")
const servidor = express()
const {colores,eliminar,agregar,editar,createCollection,readCollections,deleteCollection} = require("./db/configuracion.js");
let puerto = process.env.PORT || 4000;
let collection = ""

//Middleware que sirve los ficheros 
servidor.use("/",express.static("./front"))

//Middleware que lee los colores que hay en la colloection pasada
servidor.get("/lectura", async (peticion,respuesta) => {

    if (collection !== "") {
        let resultado = await colores(collection);
        respuesta.json(resultado)
    }else{
        respuesta.json({ error : "No se ha obtenido la paleta que mostrar" })
    }
    

})
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
servidor.get("/agregar/:r/:g/:b",async (peticion,respuesta) => {
    let resultado = await agregar({r : peticion.params.r, g : peticion.params.g, b : peticion.params.b},collection)
    respuesta.json(resultado)
})

//Middleware para actualizar un color en la collection correspondiente
servidor.get("/update/:id/:r/:g/:b",async (peticion,respuesta) => {
let resultado = 1
    if (peticion.params.id !== 1) {
        resultado = await editar({id : peticion.params.id, r : peticion.params.r, g : peticion.params.g, b : peticion.params.b},collection)
    }
    respuesta.json(resultado)
})

//Middleware que cra una nueva collection vacía
servidor.get("/createCollection/:name", async (peticion,respuesta) => {
    let consultando = await readCollections()
    consultando.forEach(({name}) => {
        if (peticion.params.name == name) {
            let error = { error : "already exists"}
            return respuesta.send(error)
        }
    });
    await createCollection(peticion.params.name)
})
let contador_1 = 1
//Middleware que recoge la collection a la cual se va anavegar
servidor.get("/collection/:name", (peticion,respuesta) => {
    collection = peticion.params.name
    console.log("consultando:\t" + collection + " " + contador_1)
    contador_1++
})

let contador_2 = 1
//Middleware que envía el nombre de la collection para saber cual tiene que leer
servidor.get("/lectura-collection", (peticion,respuesta) => {
    
    console.log("enviando:\t" + collection + " " + contador_2)
    respuesta.json(collection)
    contador_2++
})

//Middleware que elimina un color en una collection determinada
servidor.delete("/eliminar/:id", async (peticion,respuesta) => {
    let resultado = 1
    if (peticion.params.id !== 1) {
        resultado = await eliminar(peticion.params.id,collection)
    }
    respuesta.json(resultado)
})
servidor.listen(puerto)

servidor.delete("/delete-collection/:name", async (peticion,respuesta) => {
    let resultado = await deleteCollection(peticion.params.name)
    respuesta.json(resultado)
})