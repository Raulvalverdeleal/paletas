const express = require("express")
const servidor = express()
const {json} = require("body-parser")
const {colores,eliminar,agregar,editar,createCollection,readCollections,deleteCollection} = require("./db/configuracion.js");
let puerto = process.env.PORT || 4000;
let collection = ""

servidor.use(json())

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
    let resultado = await agregar({r : peticion.body.r, g : peticion.body.g, b : peticion.body.b},collection)
    respuesta.json(resultado) 
    
})
//Middleware para actualizar un color en la collection correspondiente
servidor.put("/update-color",async (peticion,respuesta) => {
    let resultado = await editar({id : peticion.body.id, r : peticion.body.r, g : peticion.body.g, b : peticion.body.b},collection)
    respuesta.json(resultado)
})

//Middleware que cra una nueva collection vacía
servidor.get("/createCollection/:name", async (peticion,respuesta) => {
    let consultando = await readCollections()
    let error_status = false
    consultando.forEach(({name}) => {
        if (peticion.params.name == name) {
            let error = { error : "already exists"}
            respuesta.send(error)
            error_status = true

        }
    });
    if (!error_status) {
        console.log("ok")
        await createCollection(peticion.params.name)
        respuesta.send({hola : "hoola"})
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
    let resultado = 1
    if (peticion.params.id !== 1) {
        resultado = await eliminar(peticion.body.id,collection)
    }
    respuesta.json(resultado)
})
servidor.listen(puerto)
//Middleware que elimina una collection determinada
servidor.delete("/delete-collection/:name", async (peticion,respuesta) => {
    let resultado = await deleteCollection(peticion.params.name)
    respuesta.json(resultado)
})