const {MongoClient, ObjectId} = require("mongodb");
const urlConexion = "mongodb+srv://raulvalverdeleal:UqZ8YoXtuTrpr7jJUBkk49h77QeBk@colores.m4u4gev.mongodb.net/";

function conectar() {
    return MongoClient.connect(urlConexion)
}

function colores(collection) {
    return new Promise( async callback => {
        let conexion = await conectar()
        let coleccion = conexion.db("colores").collection(collection)
        callback(await coleccion.find({}).toArray())
        conexion.close()
    })
}

function eliminar(id,collection) {
    return new Promise( async callback => {
        let conexion = await conectar()
        let coleccion = conexion.db("colores").collection(collection)
        callback(await coleccion.deleteOne({_id : new ObjectId(id)}))
        conexion.close()
    })
}

function agregar(o_color,collection) {
    return new Promise( async callback => {
        let conexion = await conectar()
        let coleccion = conexion.db("colores").collection(collection)
        callback(await coleccion.insertOne({r : o_color.r, g : o_color.g, b : o_color.b}))
        conexion.close()
    })
}

function editar(o_color,collection) {
    return new Promise( async callback => {
        let conexion = await conectar()
        let coleccion = conexion.db("colores").collection(collection)
        callback(await coleccion.updateOne({ _id : new ObjectId(o_color.id)},{$set : {r : o_color.r, g : o_color.g, b : o_color.b}}))
        conexion.close()
    })
}

function readCollections(){
    return new Promise( async callback => {
        let conexion = await conectar()
        callback(await conexion.db("colores").listCollections().toArray())
        conexion.close()
    })
}

function createCollection(name){
    return new Promise( async callback => {
        let conexion = await conectar()
        let new_collection = await conexion.db("colores").createCollection(name)
        let resultado = { is : true}
        new_collection ? resultado : resultado.is = false
        callback(resultado)
        conexion.close()
    })
}

function deleteCollection(name){
    return new Promise( async callback => {
        let conexion = await conectar()
        callback( await conexion.db("colores").dropCollection(name))
        conexion.close()  
    })
}

module.exports = {colores,eliminar,agregar,editar,createCollection,readCollections,deleteCollection}

