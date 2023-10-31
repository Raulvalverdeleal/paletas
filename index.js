const express = require("express")
const session = require("express-session")
const servidor = express()
const {ERR_INFO} = require("./err_messages")
const body_parser = require("body-parser")
const async = require("async")
const {getUserById,loginUser,getPallets,getColorsFromPallet,addNewUser,addNewPallete,addNewColor,deleteUser,deletePallete,deleteColor,updateUserName,updateUserPassword,updateUserEmail,updatePaletteName,updateColor} = require("./db/db.js");
let puerto = process.env.PORT || 4000;
servidor.use(session({
    secret : "/owr0r03ys-,¿/owr0r¿31Bs-,¿r0r/owka5u:k31B31Bs-,¿At2s-,$lus-,¿/ow31B¿u:k=?A¿=?A//owr0ru:k)Y*-WN¿zG@#b3ç4¡9R(CJjtHgFBm(N#¿h?14-u¿U4S*S.¿U4S4-u",
    resave : false,
    saveUninitialized : false
}))
servidor.set("view engine","ejs")
servidor.use(body_parser.json())
servidor.use(body_parser.urlencoded({ extended : true }))
servidor.use(express.static("./public"))

function validate(value){
    let resultado = Number(value)
    let validate = /^[0-9]{1,3}$/.test(resultado) && (resultado >= 0 && resultado <= 255)
    return validate ? resultado : 0
}
servidor.get("/", (peticion,respuesta) =>{
    return !!peticion.session.usuario ? respuesta.render("index",{usuario : peticion.session.usuario}) : respuesta.redirect("/signup")
})

servidor.get("/signup",async (peticion,respuesta) => {
    return !!!peticion.session.usuario ? respuesta.render("signup",{error : peticion.session.errUsExists}) : respuesta.redirect("/")
})
const createAccountQueue = async.queue((task, callback) => {
    task(callback)
},1)
servidor.post("/signup",(peticion,respuesta) => {
    createAccountQueue.push( async callback => {
        if (!!!peticion.session.usuario) {
        let resultado = await addNewUser(peticion.body.nombre,peticion.body.email,peticion.body.password)
            if(typeof(resultado) !== "string"){
                let o_usuario = await getUserById(resultado.insertedId)
                peticion.session.usuario = o_usuario
            }else peticion.session.errUsExists = ERR_INFO.NAME_EXISTS
        }
        if (createAccountQueue.length() === 0) {
            respuesta.redirect("/");
        }
        callback()
    })
})
const loginQueue = async.queue((task, callback) => {
    task(callback)
},1)
servidor.post("/login",async (peticion,respuesta) => {
    loginQueue.push( async callback => {
        if (!!!peticion.session.usuario) {                
        let o_usuario = await loginUser(peticion.body.id,peticion.body.password)
            if (typeof(o_usuario) !== "string") {
                peticion.session.usuario = o_usuario
            }else{
                peticion.session.errlogin = o_usuario
                return respuesta.redirect("/login")
            }
        }
        if (createAccountQueue.length() === 0) {
            respuesta.redirect("/");
        }
        callback()
    })
})
servidor.get("/login",(peticion,respuesta) => {
    if (!!!peticion.session.usuario) {
        return peticion.session.errlogin ? respuesta.render("login",{error : peticion.session.errlogin}) : respuesta.render("login",{error : ""})
    }
    respuesta.redirect("/")
})
servidor.get("/logout",(peticion,respuesta) => {
    peticion.session.destroy()
    respuesta.redirect("/signup")
})
servidor.get("/deleteuser", async (peticion,respuesta) => {
    let resultado = await deleteUser(peticion.session.usuario._id)
    respuesta.send(resultado)

})
servidor.post("/to-read", async (peticion,respuesta) => {

    let {tipo} = peticion.body
    let resultado = "Ha habido un error"

    switch (tipo) {
        case 1:
        resultado = await getUserById(peticion.session.usuario._id)
        break;
        
        case 2:
        resultado = await getPallets(peticion.session.usuario._id)
        break;

        case 3:
        resultado = {
            array : await getColorsFromPallet(peticion.session.usuario._id,peticion.body.paleta),
        }
        break;

        default:
        resultado = ERR_INFO.OTHER
        break;
    }
    respuesta.send(resultado)
})
servidor.post("/to-add",async (peticion,respuesta) => {

    let {tipo} = peticion.body
    let resultado = "ha habido un error"

    switch (tipo) {
        case 2:
        resultado = await addNewPallete(peticion.session.usuario._id,peticion.body.paleta)
        break;

        case 3:
        let o_color = {
            r : validate(peticion.body.color.r),
            g : validate(peticion.body.color.g),
            b : validate(peticion.body.color.b)
        }
        resultado = {id : await addNewColor(peticion.session.usuario._id, peticion.body.paleta_n, o_color)}
        break;

        default:
        resultado = ERR_INFO.OTHER
        break;
    }
    respuesta.send({ r : resultado})
})
servidor.put("/to-update",async (peticion,respuesta) => {

    let {tipo} = peticion.body
    let resultado = ""
    switch (tipo) {
        case 1:
        resultado = peticion.body.newName.trim() !== "" ? await updateUserName(peticion.session.usuario._id, peticion.body.newName) : ERR_INFO.DATA_NOT_EMPTY
        if (!!resultado.acknowledged) {
            peticion.session.usuario.usuario.data.nombre = peticion.body.newName
        }
        break;

        case 2:
        resultado =  peticion.body.newEmail.trim() !== "" ? await updateUserEmail(peticion.session.usuario._id, peticion.body.newEmail) : ERR_INFO.DATA_NOT_EMPTY
        if (!!resultado.acknowledged) {
            peticion.session.usuario.usuario.data.email = peticion.body.newEmail
        }
        break;

        case 3:
        resultado = await updateUserPassword(peticion.session.usuario._id, peticion.body.newPassword)
        if (!!resultado.acknowledged) {
            peticion.session.usuario.usuario.data.password = peticion.body.newPassword
        }
        break;

        case 4:
        resultado = await updatePaletteName(peticion.session.usuario._id,peticion.body.paleta_n,peticion.body.nuevo)
        break;

        case 5:
        resultado = await updateColor(peticion.session.usuario._id, peticion.body.paleta_n, peticion.body.color)
        break;

        default:
        resultado = ERR_INFO.OTHER
        break;
    }
    respuesta.send({r : resultado}) 
})
servidor.delete("/to-delete", async (peticion,respuesta) => {

    let {tipo} = peticion.body
    let resultado = { err : false, m : ""}
    switch (tipo) {
        case 1:
        console.log(peticion.body.paleta)
        resultado = await deletePallete(peticion.session.usuario._id, peticion.body.paleta)
        break;

        case 2:
        resultado = await deleteColor(peticion.session.usuario._id, peticion.body.paleta_n, peticion.body.colorId)
        break;

        default:
        resultado = ERR_INFO.OTHER
        break;
    }
    respuesta.send(resultado)
})
servidor.get("/get-palette/:name",async (peticion,respuesta) => {
    if (!!peticion.session.usuario) {
        peticion.session.visiting = peticion.params.name
        respuesta.render("colors",{paleta : peticion.params.name})
    }else{
        respuesta.redirect("/")
    }
})

servidor.listen(puerto)