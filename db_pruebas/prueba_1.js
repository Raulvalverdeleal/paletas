const {MongoClient, ObjectId} = require("mongodb");
const {ERR_INFO} = require("../err_messages")
const urlConexion = "mongodb+srv://raulvalverdeleal:UqZ8YoXtuTrpr7jJUBkk49h77QeBk@colores.m4u4gev.mongodb.net/";

function conectar() {
    return MongoClient.connect(urlConexion)
}

function to_read() {
    return new Promise( async callback => {
        let conexion = await conectar()
        let coleccion = conexion.db("pruebas").collection("pruebas")
        callback(await coleccion.find().toArray())
        conexion.close()
    })
}

function to_add({
    tipo = null,//para saber de qué operación se trata
    id = null,//Para cuando se quiera añadir algo a un usuario, como una paleta
    o_usuario = null,//para cuando se quiera crear un usuario
    paleta = null,//si se crea una paleta, este es el obj básico paleta con un arr colores vacío. Si es para crear un color, paleta será "nombre".
    color = null//objeto color con id r g b
    }) {

    const filtro = { _id : new ObjectId(id)}
    let feedback = { err : false, m : ""}

    return new Promise( async callback => {
        let conexion = await conectar()
        let coleccion = conexion.db("pruebas").collection("pruebas")
        let {usuario} =  id == null ? {usuario : false} : await coleccion.findOne(filtro)
        let {paletas} = usuario
        switch (tipo) {

            case 1:
            //en tipo 1 |-> estás creando un usuario sin paletas.
            feedback.err = o_usuario.usuario.data.nombre.trim() == "" || o_usuario.usuario.data.password.trim() == "" || o_usuario.usuario.data.email.trim() == "" ? true : false;
            if (feedback.err) {
                let exist_n = await coleccion.findOne({ "usuario.data.nombre" : o_usuario.usuario.data.nombre.trim()})
                let exist_e = await coleccion.findOne({ "usuario.data.email" : o_usuario.usuario.data.email.trim()})
                feedback.m = Boolean(exist_n) || Boolean(exist_e) ? ERR_INFO.DATA_NOT_EMPTY : await coleccion.insertOne(o_usuario)
                feedback.err = Boolean(typeof(feedback.m) == "string") ? true : false
            }else feedback.m = ERR_INFO.DATA_NOT_EMPTY
            
            break;

            case 2:
            //en tipo 2 |-> estás creando una paleta vacía.
            feedback.err = paleta.nombre.trim() == "" ? true : false
            feedback.m = feedback.err ? ERR_INFO.NAME_PALETA_NOT_EMPTY : ""
            let arrBooleans_2 = []
            if (!feedback.err){
                paletas.forEach(o_paleta => {
                    feedback.err = o_paleta.nombre == paleta.nombre ? true : false
                    arrBooleans_2.push(feedback.err)
                })
                feedback.m = arrBooleans_2.includes(true) ? ERR_INFO.NAME_PALETA_EXISTS : ""
            }
            if (feedback.m == "") {
                paletas.push(paleta)
                feedback.m = await coleccion.updateOne(filtro,{$set : { "usuario.paletas" : paletas}})
            }
            break;

            case 3:
            //en tipo 3 |-> estás agregando un color a una paleta de un usuario
            let arrPaletas = []
            let arrColores = []
            paletas.forEach(({nombre}) => arrPaletas.push(nombre))
            paletas[arrPaletas.indexOf(paleta)].colores.forEach(({id}) => arrColores.push(id))
            feedback.err = Boolean(paletas[arrPaletas.indexOf(paleta)].colores[arrColores.indexOf(color.id)]) ? true : false
            if (!feedback.err) {
                paletas[arrPaletas.indexOf(paleta)].colores.push(color)
                feedback.m = await coleccion.updateOne(filtro,{$set : { "usuario.paletas" : paletas}})
            }else feedback.m = ERR_INFO.ID_COLOR_EXISTS
            break;

            default:
            feedback.err = true
            feedback.m = ERR_INFO.OTHER
            break;
        }
        callback(feedback)
        conexion.close()
    })
}

function to_update({
    tipo = null,
    id = null,
    paleta_n = null,//es el nombre de la paleta
    nuevo = null//puede ser un nuevo nombre, un nuevo obj color etc.
    }) {
    
    const filtro = { _id : new ObjectId(id)}
    let feedback = { err : false, m : ""}
    let _nuevo_ = typeof(nuevo) == "string" ? nuevo.trim() : nuevo
    let validacion = /^[a-záéíóúñ \-._\d]{3,20}$/i.test(_nuevo_)
    
    return new Promise( async callback => {
        let conexion = await conectar()
        let coleccion = conexion.db("pruebas").collection("pruebas")
        let {usuario} =  await coleccion.findOne(filtro)
        let {paletas} = usuario
        switch (tipo) {

            case 1:
            // en tipo 1 |-> estás editando el nombre
            let exist_n = await coleccion.findOne({ "usuario.data.nombre" : _nuevo_})
            feedback.m = !!exist_n ? ERR_INFO.NAME_EXISTS : ""
            if (!!!feedback.m) {
                feedback.m = validacion ? await coleccion.updateOne(filtro,{$set : { "usuario.data.nombre" : _nuevo_}}) : ERR_INFO.NOT_STANDAR_VALIDATION
            }
            feedback.err = typeof(feedback.m) == "string" ? true : false
            break;

            case 2:
            // en tipo 2 |-> estás editando la contraseña
            feedback.m = usuario.data.password !== _nuevo_ ? await coleccion.updateOne(filtro,{$set : { "usuario.data.password" : _nuevo_}}) : ERR_INFO.PASSWORD_IN_USE
            feedback.err = typeof(feedback.m) == "string" ? true : false
            break;

            case 3:
            // en tipo 3 |-> estás editando el correo electrónico
            let exist_e = await coleccion.findOne({ "usuario.data.email" : _nuevo_})
            feedback.m = !!exist_e ? ERR_INFO.EMAIL_EXISTS : ""
            if (!!!feedback.m) {
                feedback.m = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(_nuevo_) ? await coleccion.updateOne(filtro,{$set : { "usuario.data.email" : _nuevo_}}) : ERR_INFO.NOT_EMAIL_VALIDATION
            }
            feedback.err = typeof(feedback.m) == "string" ? true : false
            break;

            case 4:
            // en tipo 4 |-> estás editando el nombre de una paleta
            let arrPaletas_4 = []
            paletas.forEach(({nombre}) => arrPaletas_4.push(nombre))
            feedback.m = arrPaletas_4.includes(_nuevo_) ? ERR_INFO.NAME_PALETA_EXISTS : ""
            if (!!!feedback.m && validacion) {
                paletas[arrPaletas_4.indexOf(paleta_n)].nombre = _nuevo_
                feedback.m = await coleccion.updateOne(filtro,{$set : { "usuario.paletas" : paletas}})
            }else feedback.m = ERR_INFO.NOT_STANDAR_VALIDATION
            feedback.err = typeof(feedback.m) == "string" ? true : false
            break;

            case 5:
            // en tipo 5 |-> estás editando el color en una paleta
            let arrPaletas_5 = []
            let arrColores_5 = []
            paletas.forEach(({nombre}) => arrPaletas_5.push(nombre))
            paletas[arrPaletas_5.indexOf(paleta_n)].colores.forEach(({id}) => arrColores_5.push(id))
            paletas[arrPaletas_5.indexOf(paleta_n)].colores[arrColores_5.indexOf(nuevo.id)] = nuevo
            feedback.m = await coleccion.updateOne(filtro,{$set : { "usuario.paletas" : paletas}})
            break;

            default:
            feedback.err = true
            feedback.m = ERR_INFO.OTHER
            break;
        }
        callback(feedback)
        conexion.close()
    })
}

function to_delete({
    tipo = null,
    id = null,
    paleta = null,//nombre de la paleta
    color = null//id del color
    }){
    const filtro = { _id : new ObjectId(id)}
    let feedback = { err : false, m : ""}
    return new Promise( async callback => {
        let conexion = await conectar()
        let coleccion = conexion.db("pruebas").collection("pruebas")
        let {usuario} =  id == null ? {usuario : false} : await coleccion.findOne(filtro)
        let {paletas} = usuario

        switch (tipo) {

            case 1:
            // en tipo 1 |-> Estás eliminando usuario
            feedback.m = await coleccion.deleteOne(filtro)
            break;

            case 2:
            //en tipo 2 |-> Estás eliminando una paleta de un usuario
            let arrPAletas_2 = []
            paletas.forEach(({nombre}) => arrPAletas_2.push(nombre))
            paletas.splice(paletas.indexOf(arrPAletas_2.indexOf(paleta)),1)
            feedback.m = await coleccion.updateOne(filtro, {$set : { "usuario.paletas" : paletas}})
            break;

            case 3:
            //en tipo 3 |-> Estás eliminando un color de una paleta de un usuario
            let arrPAletas_3 = []
            let arrColores_3 = []
            paletas.forEach(({nombre}) => arrPAletas_3.push(nombre))
            paletas[arrPAletas_3.indexOf(paleta)].colores.forEach(({id}) => arrColores_3.push(id))
            paletas[arrPAletas_3.indexOf(paleta)].colores.splice(arrColores_3.indexOf(color),1)
            feedback.m = await coleccion.updateOne(filtro, {$set : { "usuario.paletas" : paletas}})
            break;

            default:
            feedback.err = true
            feedback.m = "El tipo es erróneo o los datos pasados bien no corresponden o son insuficientes"
            break;
        }
        callback(feedback)
        conexion.close()
    })
}
module.exports = {to_read,to_add,to_update,to_delete}