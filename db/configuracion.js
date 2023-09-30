const {MongoClient, ObjectId} = require("mongodb");
const urlConexion = "mongodb+srv://raulvalverdeleal:UqZ8YoXtuTrpr7jJUBkk49h77QeBk@colores.m4u4gev.mongodb.net/";

function conectar() {
    return MongoClient.connect(urlConexion)
}

function colores() {
    return new Promise( async callback => {
        let conexion = await conectar()
        let coleccion = conexion.db("colores").collection("colores")

        callback(await coleccion.find({}).toArray())
    })
}

function eliminar(id) {
    return new Promise( async callback => {
        let conexion = await conectar()
        let coleccion = conexion.db("colores").collection("colores")
        callback(await coleccion.deleteOne({_id : new ObjectId(id)}))
    })
}

function agregar(o_color) {
    return new Promise( async callback => {
        let conexion = await conectar()
        let coleccion = conexion.db("colores").collection("colores")
        callback(await coleccion.insertOne({r : o_color.r, g : o_color.g, b : o_color.b}))
    })
}

function editar(o_color) {
    return new Promise( async callback => {
        let conexion = await conectar()
        let coleccion = conexion.db("colores").collection("colores")
            let resultado = await coleccion.updateOne({ _id : new ObjectId("65140f83c7cf4adf4c186514")},{$set : {r : 0, g : 0, b : 0}})

        callback(await coleccion.updateOne({ _id : new ObjectId(o_color.id)},{$set : {r : o_color.r, g : o_color.g, b : o_color.b}}))
    })
}
module.exports = {colores,eliminar,agregar,editar}