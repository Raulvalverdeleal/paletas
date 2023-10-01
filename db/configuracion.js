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
    })
}

function eliminar(id,collection) {
    return new Promise( async callback => {
        let conexion = await conectar()
        let coleccion = conexion.db("colores").collection(collection)
        callback(await coleccion.deleteOne({_id : new ObjectId(id)}))
    })
}

function agregar(o_color,collection) {
    return new Promise( async callback => {
        let conexion = await conectar()
        let coleccion = conexion.db("colores").collection(collection)
        callback(await coleccion.insertOne({r : o_color.r, g : o_color.g, b : o_color.b}))
    })
}

function editar(o_color,collection) {
    return new Promise( async callback => {
        let conexion = await conectar()
        let coleccion = conexion.db("colores").collection(collection)
        callback(await coleccion.updateOne({ _id : new ObjectId(o_color.id)},{$set : {r : o_color.r, g : o_color.g, b : o_color.b}}))
    })
}

function readCollections(){
    return new Promise( async callback => {
        let conexion = await conectar()
        callback(await conexion.db("colores").listCollections().toArray())
    })
}

function createCollection(name){
    return new Promise( async callback => {
        let conexion = await conectar()
        callback( await conexion.db("colores").createCollection(name))        
    })
}

function deleteCollection(name){
    return new Promise( async callback => {
        let conexion = await conectar()
        callback( await conexion.db("colores").dropCollection(name))        
    })
}

module.exports = {colores,eliminar,agregar,editar,createCollection,readCollections,deleteCollection}