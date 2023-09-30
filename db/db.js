const {MongoClient, ObjectId} = require("mongodb");
const urlConexion = "mongodb+srv://raulvalverdeleal:UqZ8YoXtuTrpr7jJUBkk49h77QeBk@colores.m4u4gev.mongodb.net/";


function conectar() {
    return MongoClient.connect(urlConexion)
}

function agregar(o_color) {
    return new Promise( async callback => {
        let conexion = await conectar()
        let coleccion = conexion.db("colores").collection("colores")
        callback(await coleccion.insertOne({r : o_color.r, g : o_color.g, b : o_color.b}))
    })
}

for (let i = 0; i < 10; i++) {
    let [r,g,b] = [0,0,0].map(() => Math.floor(Math.random() * 256));
    agregar({r,g,b})
    
}
