const {MongoClient, ObjectId} = require("mongodb");
const {ERR_INFO} = require("../err_messages");
const { generateId } = require("../id_generator");
const urlConexion = "mongodb+srv://raulvalverdeleal:UqZ8YoXtuTrpr7jJUBkk49h77QeBk@colores.m4u4gev.mongodb.net/"
const bcrypt = require('bcrypt');
const saltRounds = 10;
function conectar() {
    return MongoClient.connect(urlConexion)
}

//1
function getUserById(id){
	return new Promise( async callback => {
		let conexion = await conectar()
		let collection = conexion.db("pruebas").collection("pruebas")
		let usuario = await collection.findOne({ _id : new ObjectId(id) })
		callback(usuario)
		conexion.close()
	})
}
//2
function loginUser(userName,password){
	return new Promise ( async callback => {
		let conexion = await conectar()
		let collection = conexion.db("pruebas").collection("pruebas")
		let filtro = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/i.test(userName) ? {"usuario.data.email" : userName} : {"usuario.data.nombre" : userName}
		let req  = await collection.findOne(filtro)
		let resultado = ERR_INFO.NF_USER
		if(!!req){
            try {
                const comparation = await bcrypt.compare(password,req.usuario.data.password)
    			if (comparation) {
                    callback(req)
                }else callback("contraseña errónea")
            } catch (error) {
                callback("error")
            }
		}
		callback(resultado)
		conexion.close()
	})
}
//3
function getPallets(id){
	return new Promise ( async callback => {
		let conexion = await conectar()
		let collection = conexion.db("pruebas").collection("pruebas")
		let usuario = await collection.findOne({ _id : new ObjectId(id)})
		let resultado = usuario.usuario.paletas
		callback(resultado)
		conexion.close()
	})
}
//4
function getColorsFromPallet(id,pallet){
	return new Promise ( async callback => {
		let conexion = await conectar()
		let collection = conexion.db("pruebas").collection("pruebas")
		let {usuario} = await collection.findOne({ _id : new ObjectId(id) })
		let arrPaletas = []
		usuario.paletas.forEach(({nombre}) => arrPaletas.push(nombre))
		let resultado = usuario.paletas[arrPaletas.indexOf(pallet)] == undefined ? false : usuario.paletas[arrPaletas.indexOf(pallet)]
		callback(resultado)
		conexion.close()
	})
}

//1
function addNewUser(name, email, password) {
    return new Promise(async callback => {
        let conexion = await conectar();
        let collection = conexion.db("pruebas").collection("pruebas");
        let validacion_n = /^[a-záéíóúñ \-._\d]{3,20}$/i.test(name);
        let validacion_e = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/i.test(email);
        let resultado = !validacion_e ? ERR_INFO.NOT_EMAIL_VALIDATION : !validacion_n ? ERR_INFO.NOT_STANDAR_VALIDATION : "";
        if (validacion_n && validacion_e) {
            let exist_n = await collection.findOne({ "usuario.data.nombre": name.trim() });
            let exist_e = await collection.findOne({ "usuario.data.email": email.trim() });
            if (exist_n || exist_e) {
                resultado = ERR_INFO.NAME_o_EMAIL_EXISTS;
            } else {
                try {
                    const hashedPassword = await bcrypt.hash(password, saltRounds);
                    let usuario = {usuario: {data: {nombre: name,password: hashedPassword,email: email},paletas: []}};
                    resultado = await collection.insertOne(usuario);
                } catch (err) {
                    callback("Error al encriptar la contraseña");
                    return;
                }
            }
        }
        callback(resultado);
        conexion.close();
    });
}

//2
function addNewPallete(id,paleta){
    return new Promise(async callback => {
        let conexion = await conectar()
        let collection = conexion.db("pruebas").collection("pruebas")
        let {usuario} = await getUserById(id)
        let {paletas} = usuario
        let arrPaletas_4 = []
        paletas.forEach(({nombre}) => arrPaletas_4.push(nombre))
        let exist = arrPaletas_4.includes(paleta.trim()) ? true : false
        let resultado = ""
        if (!exist && /^[a-záéíóúñ \-._\d]{3,20}$/i.test(paleta.trim())) {
            let newPaleta = { nombre : paleta, colores : []}
            paletas.push(newPaleta)
            await collection.updateOne({_id : new ObjectId(id)},{$set : { "usuario.paletas" : paletas}})
            resultado = { userId : id, pallete_n : paleta }
        }else resultado = exist ? ERR_INFO.NAME_PALETA_EXISTS : ERR_INFO.NOT_STANDAR_VALIDATION
        callback(resultado)
        conexion.close()
    })
}
//3
function addNewColor(id,paleta,color){
    return new Promise(async callback => {
        let conexion = await conectar()
        let collection = conexion.db("pruebas").collection("pruebas")
        let arrPaletas = []
        let arrColores = []
        let paletas = await getPallets(id)
        paletas.forEach(({nombre}) => arrPaletas.push(nombre))
        paletas[arrPaletas.indexOf(paleta)].colores.forEach(({id}) => arrColores.push(id))
        while(Boolean(paletas[arrPaletas.indexOf(paleta)].colores[arrColores.indexOf(color.id)])){
            color.id = generateId()
        }
        paletas[arrPaletas.indexOf(paleta)].colores.push(color)
        let {acknowledged} = await collection.updateOne({ _id : new ObjectId(id)},{$set : { "usuario.paletas" : paletas}})
        let resultado = acknowledged ? color.id : ""
        callback(resultado)
        conexion.close()
    })
}
//1
function updateUserName(id,newName){
    return new Promise( async callback => {
        let conexion = await conectar()
        let collection = conexion.db("pruebas").collection("pruebas")
        let exist = await collection.findOne({"usuario.data.nombre" : newName})
        let resultado = ERR_INFO.NAME_EXISTS
        if (!exist) {
            let {usuario} = await collection.findOne({_id : new ObjectId(id)})
            resultado = usuario.data.nombre == newName ? ERR_INFO.NAME_EXISTS : ""
            let validacion = /^[a-záéíóúñ \-._\d]{3,20}$/i.test(newName.trim())
            if (!resultado) {
                resultado = validacion ? await collection.updateOne({_id : new ObjectId (id)},{$set : { "usuario.data.nombre" : newName}}) : ERR_INFO.NOT_STANDAR_VALIDATION
            }
        }
        callback(resultado)
        conexion.close()
    })
}
//2
function updateUserPassword(id,newPassword){
    return new Promise( async callback =>{
        let conexion = await conectar()
        let collection = conexion.db("pruebas").collection("pruebas")
        let hashedPassword = await bcrypt.hash(newPassword,saltRounds)
        resultado = newPassword.trim().split("").length >= 10 ? await collection.updateOne({_id : new ObjectId(id)},{$set : { "usuario.data.password" : hashedPassword}}) : ERR_INFO.PASSWORD_SHORT
        callback(resultado)
        conexion.close()
    }) 
}
//3
function updateUserEmail(id,newEmail){
    return new Promise( async callback => {
        let conexion = await conectar()
        let collection = conexion.db("pruebas").collection("pruebas")
        let exist = await collection.findOne({"usuario.data.email" : newEmail })
        let resultado = ERR_INFO.EMAIL_EXISTS
        if (!exist) {
            resultado = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/i.test(newEmail) ? await collection.updateOne({ _id : new ObjectId(id)}, {$set : {"usuario.data.email" : newEmail}}) : ERR_INFO.NOT_EMAIL_VALIDATION
        }
        callback(resultado)
        conexion.close()
    })
}
//4
function updatePaletteName(id,oldName,newName){
    return new Promise(async callback => {
        let conexion = await conectar()
        let collection = conexion.db("pruebas").collection("pruebas")
        let {usuario} = await getUserById(id)
        let {paletas} = usuario
        let arrPaletas_4 = []
        paletas.forEach(({nombre}) => arrPaletas_4.push(nombre))
        let exist = arrPaletas_4.includes(newName.trim()) ? true : false
        let resultado = ""
        if (!exist && /^[a-záéíóúñ \-._\d]{3,20}$/i.test(newName.trim())) {
            paletas[arrPaletas_4.indexOf(oldName)].nombre = newName
            resultado = await collection.updateOne({_id : new ObjectId(id)},{$set : { "usuario.paletas" : paletas}})
        }else resultado =  exist ? ERR_INFO.NAME_PALETA_EXISTS : ERR_INFO.NOT_STANDAR_VALIDATION        
        callback(resultado)
        conexion.close()
    })
}
//5
function updateColor(id,paletteName,color){
    return new Promise( async callback => {
        let conexion = await conectar()
        let collection = conexion.db("pruebas").collection("pruebas")
        let {usuario} = await getUserById(id)
        let {paletas} = usuario
        let arrPaletas_5 = []
        let arrColores_5 = []
        paletas.forEach(({nombre}) => arrPaletas_5.push(nombre))
        paletas[arrPaletas_5.indexOf(paletteName)].colores.forEach(({id}) => arrColores_5.push(id))
        paletas[arrPaletas_5.indexOf(paletteName)].colores[arrColores_5.indexOf(color.id)] = color
        let resultado = await collection.updateOne({_id : new ObjectId(id)},{$set : { "usuario.paletas" : paletas}})
        callback(resultado)
        conexion.close()
    })
}
//1
function deleteUser(id){
    return new Promise( async callback => {
        let conexion = await conectar()
        let collection = conexion.db("pruebas").collection("pruebas")
        let resultado = await collection.deleteOne({ _id : new ObjectId(id)})
        callback(resultado)
        conexion.close()
    })
}
//2
function deletePallete(id,paleta){
    console.log(paleta)
    return new Promise(async callback => {
        let conexion = await conectar()
        let collection = conexion.db("pruebas").collection("pruebas")
        let arrPAletas_2 = []
        let paletas = await getPallets(id)
        console.log(paletas)
        paletas.forEach(({nombre}) => arrPAletas_2.push(nombre))
        paletas.splice(arrPAletas_2.indexOf(paleta),1)
        console.log(paletas)
        let resultado = await collection.updateOne({ _id : new ObjectId(id)}, {$set : { "usuario.paletas" : paletas}})
        callback(resultado)
        conexion.close()
    })
}
//3
function deleteColor(id,paleta,colorId){
    return new Promise( async callback => {
        let conexion = await conectar()
        let collection = conexion.db("pruebas").collection("pruebas")
        let paletas = await getPallets(id)
        let arrPAletas_3 = []
        let arrColores_3 = []
        paletas.forEach(({nombre}) => arrPAletas_3.push(nombre))
        paletas[arrPAletas_3.indexOf(paleta)].colores.forEach(({id}) => arrColores_3.push(id))
        paletas[arrPAletas_3.indexOf(paleta)].colores.splice(arrColores_3.indexOf(colorId),1)
        let resultado = await collection.updateOne({_id : new ObjectId(id)}, {$set : { "usuario.paletas" : paletas}})
        callback(resultado)
        conexion.close()
    }) 
}
module.exports = {
getUserById,
loginUser,
getPallets,
getColorsFromPallet,
addNewUser,
addNewPallete,
addNewColor,
updateUserPassword,
updateUserName,
updateUserEmail,
updatePaletteName,
updateColor,
deleteUser,
deletePallete,
deleteColor}