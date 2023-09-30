const express = require("express")
const servidor = express()
const {colores,eliminar,agregar,editar} = require("./db/configuracion.js")
let puerto = process.env.PORT || 4000;


servidor.use("/",express.static("./front"))

servidor.get("/lectura", async (peticion,respuesta) => {
    let resultado = await colores();
    respuesta.json(resultado)
})

servidor.get("/agregar/:r/:g/:b",async (peticion,respuesta) => {
    let resultado = await agregar({r : peticion.params.r, g : peticion.params.g, b : peticion.params.b})
    respuesta.json(resultado)
})

servidor.get("/update/:id/:r/:g/:b",async (peticion,respuesta) => {
    let resultado = await editar({id : peticion.params.id, r : peticion.params.r, g : peticion.params.g, b : peticion.params.b})
    respuesta.json(resultado)
})

servidor.delete("/eliminar/:id", async (peticion,respuesta) => {
    let resultado = await eliminar(peticion.params.id)
    respuesta.json(resultado)
})
servidor.listen(puerto)