const express = require("express")
const session = require("express-session")
const servidor = express()
const {ERR_INFO} = require("./err_messages")
const body_parser = require("body-parser")
const async = require("async")//para poder hacer colas de tareas y evitar la concurrencia.
//Únicamente se establecen colas de tareas en los middleware que ejecutan operaciones asincronas con la base de datos.
const { 
getUserById,
loginUser,
getPallets,
getColorsFromPallet,
addNewUser,
addNewPallete,
addNewColor,
deleteUser,
deletePallete,
deleteColor,
updateUserName,
updateUserPassword,
updateUserEmail,
updatePaletteName,
updateColor} = require("./db/db.js");

let puerto = process.env.PORT || 4000

//Valida que lo valores guardados en r g y b sean números entre 0 y 255
function validate(value){
    let resultado = Number(value)
    let validate = /^[0-9]{1,3}$/.test(resultado) && (resultado >= 0 && resultado <= 255)
    return validate ? resultado : 0
}

/* -- */
//Configuración.
servidor.use(session({
    secret : process.env.COOKIE,
    resave : false,
    saveUninitialized : false
}))
servidor.set("view engine","ejs")
servidor.use(body_parser.json())
servidor.use(body_parser.urlencoded({ extended : true }))
servidor.use(express.static("./public"))
/* -- */

/* -- */
//Middlewares que NO tienen implementada una cola de tareas.
//Ya que no realizan operaciones con la base de datos.
servidor.get("/", (pet,res) =>{
    //si existe sesión -> render index.ejs donde se encuentran las paletas del usuario.
    //si no existe sesión -> render signup.ejs donde el usuario creará su sesión.
    return !!pet.session.usuario ? res.render("index",{usuario : pet.session.usuario}) : res.redirect("/signup")
})
servidor.get("/signup",async (pet,res) => {
    //si existe sesión -> redirige a / que hará render de index.ejs
    //si no existe sesión -> render signup.ejs con el error que haya ocurrido.
    return !!!pet.session.usuario ? res.render("signup",{error : pet.session.errUsExists}) : res.redirect("/")
})
servidor.get("/login",(pet,res) => {
    //si existe sesión -> redirige a / dónde se hará render de index.ejs
    //si no existe sesión -> render de login.ejs con el error que haya ocurrido
    return !!!pet.session.usuario ? res.render("login",{error : pet.session.errlogin}) : res.redirect("/")
})
servidor.get("/get-palette/:name", (pet,res) => {
    try {
        if (!!!pet.session.usuario) {throw new Error("No hay ninguna sesión iniciada.")}//sólo permite acceder a una paleta si se ha inniciado sesión
        if(!/^[a-záéíóúñ \-._\d]{3,20}$/i.test(pet.body.paleta)){//comprueba que el parámetro sea válido como nombre de paleta
            throw new Error(`La paleta enviada para abrir no ha pasado la validación: ${pet.params.name}`)
        }
        res.render("colors",{paleta : pet.params.name})
    } catch (error) {
        //si ocurre cualquier error vuelta al directorio raiz y se registra el error
        res.redirect("/")
        console.error("Error al abrir una paleta, middleware -> /get-palette/:name",error)
    }
})
servidor.get("/logout",(pet,res) => {
    try {
        if (!pet.session.usuario) {throw new Error("No hay ninguna sesión iniciada")}//sólo permite cerrar session si hay una iniciada
        pet.session.destroy()
    } catch (error) {
        //si ocurre cualquier se registra y informamos de un error interno
        res.status(500)
        console.error("Error al cerrar sesión, middleware -> /logout",error)
    } finally {
        //en cualquier caso:
        res.redirect("/")
    }
})
/* -- */

/* -- */
//Creación de cuentas e inicio de sesión:
/* Cola para la creación de cuentas. */
const createAccountQueue = async.queue((task, callback) => {
    task(callback)
},1)//No permite que una petición entre al middleware hasta que la anterior haya terminado.
// 1 es el número de peticiones a la vez que va a soportar este middleware.
servidor.post("/signup",(pet,res) => {
    createAccountQueue.push( async callback => {
        try {
            if (!!pet.session.usuario) {throw new Error("Ya hay una sesión iniciada.")}//validaciones necesarias
/* 
            Hay que tener en cuenta que todas esta validaciones se hacen en el front también, por lo que
            si llega a no cumplirse ninguna de estas validaciones, lo más probable es que se trate de un intento
            de inserción de datos maliciosos. Por lo que se registra el error junto con el dato que lo ha provocado.
        --> Aplica para todas las validaciones de datos.
*/
            if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(pet.body.email)) {
                throw new Error(`El email no encaja con la validación: ${pet.body.email}`)
            }
            if (!/^[a-záéíóúñ \-._\d]{3,20}$/i.test(pet.body.nombre)) {
                throw new Error(`El nombre no encaja con la validación: ${pet.body.nombre}`)
            }
            if (pet.body.password.length < 10) {
                throw new Error(`La contraseña no llega a la longitud mínima: ${pet.body.password}`)
            }
            if (pet.body.password.length > 20) {
                throw new Error(`La contraseña sobrepasa la longitud máxima: ${pet.body.password}`)
            }
            let resultado = await addNewUser(pet.body.nombre,pet.body.email,pet.body.password)
            //Cuando resultado sea string, será la descripción del error, como por ejemplo: el usuario existe.
            if(typeof(resultado) !== "string"){
                let o_usuario = await getUserById(resultado.insertedId)
                pet.session.usuario = o_usuario
            }else pet.session.errUsExists = ERR_INFO.NAME_EXISTS//este es el error que se le envía a signup.ejs
        } catch (error) {
            //si ocurre cualquier se registra y informamos de un error interno
            console.error("Error al crear una nueva cuenta de usuario, middleware-> /signup (POST)", error)
            res.status(500)
        } finally {
            //En cualquier caso:
            res.redirect("/")
            callback()//indica que la tarea ha terminado y puede entrar la siguiente
        }
    })
})
// Cola para los inicios de sesión.
const loginQueue = async.queue((task, callback) => {
    task(callback)
},1)//Ejecución secuencial.
servidor.post("/login", (pet,res) => {
    loginQueue.push( async callback => {
        res.status(200)
        try {
            if (!!pet.session.usuario) {throw new Error("Ya hay una sesión iniciada.")}
            if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(pet.body.id) && 
                !/^[a-záéíóúñ \-._\d]{3,20}$/i.test(pet.body.id)) {
                //pet.body.id NO es un id como colorID o pet.session.usuario._id
                //Es con lo que se ha identificado el usuario en el formulario, bien sea su nombre o su email
                throw new Error(`El id del usuario(nombre o email) no encaja con la validación: ${pet.body.id}`)
            }
            if (pet.body.password.length < 10) {
                throw new Error(`La contraseña no llega a la longitud mínima: ${pet.body.password}`)
            }
            if (pet.body.password.length > 20) {
                throw new Error(`La contraseña no llega a la longitud máxima: ${pet.body.password}`)
            }
            //Mismo funcionamiento que en /signup
            let resultado = await loginUser(pet.body.id,pet.body.password)
            if (typeof(resultado) !== "string") {
                pet.session.usuario = resultado//objeto usuario
            }else{
                pet.session.errlogin = resultado//error
            }
        } catch (error) {
            console.error("Error en el inicio de sesión de un usuario, middleware -> /login (POST)", error)
            res.status(500)
        } finally {
            res.redirect("/login")
            callback()
        }
    })
})
/* -- */
/* Resto de middlewares -> Todos tienen la misma estructura y funcionamiento.

Cola para obtener las paletas de un usuario. */
const queueGetPalettes = async.queue((task, callback) => {
    task(callback)
},1)//Ejecución secuencial.
servidor.get("/get-palettes", (pet,res) => {
    queueGetPalettes.push( async callback =>{
        let r = { err : true, value : null }//es el feedback
        //r de respuesta, para diferenciarse de res,
        res.status(200)
        try {
            if (!!!pet.session.usuario) {throw new Error("No hay una ninguna sesión iniciada.")}
            r.value = await getPallets(pet.session.usuario._id)
            r.err = false
            //Los errores ya están manejados en la función getpallets
            //Si ocurre un error en la operación aterrizaría en este catch
        } catch (error) {
            //No se informa al usuario de que ocurre internamente en el usuario por motivos de seguridad.
            r.value = false
            r.err = true
            console.error("Error en la peticion de coger las paletas de un usuario, middleware -> /get-palettes", error)
            res.status(500)
            //se registra el error y se envía un internal server error sin descripción.
        } finally {
            //Envío del feedback y finalización de la task.
            res.send(r)
            callback()
        }
    })
})
// Cola para obtener los colores de una paleta.
const queueGetColorsFromPalette = async.queue((task, callback) => {
    task(callback)
},1)//Ejecución secuencial.
servidor.post("/get-colors-from-palette", (pet,res) => {
    queueGetColorsFromPalette.push( async callback =>{
        let r = { err : true, value : null }
        res.status(200)
        try {
            if (!!!pet.session.usuario) {throw new Error("No hay ninguna sesión iniciada.")}
            if(!/^[a-záéíóúñ \-._\d]{3,20}$/i.test(pet.body.paleta)){
                throw new Error(`La paleta enviada a consultar sus colores no cumple la validación: ${pet.body.paleta}`)
            }
            r.value = await getColorsFromPallet(pet.session.usuario._id,pet.body.paleta)
            r.err = typeof(r.value) == "object" ? false : true
            //r.value, si todo ha salido bien será un array vacío o con colores
            //r.value si sale mal será Boolean false
        } catch (error) {
            r.value = false
            r.err = true
            //Los únicos errores que ocurren en el servidor que se informan al usuario son los de "ya existe".
            console.error("Error en la peticion de coger los colores de una paleta, middleware -> /get-colors-from-palette", error)
            res.status(500)
        } finally {
            res.send(r)
            callback()
        }
    })
})
// Cola para añadir una nueva paleta.
const queueAddNewPalette = async.queue((task, callback) => {
    task(callback)
},1)//Ejecución secuencial.
servidor.post("/add-new-palette", (pet,res) => {
    queueAddNewPalette.push( async callback =>{
        let r = { err : true, value : null }
        res.status(200)
        try {
            if (!!!pet.session.usuario) {throw new Error("No hay ninguna sesión iniciada.")}
            if(!/^[a-záéíóúñ \-._\d]{3,20}$/i.test(pet.body.paleta)){
                throw new Error(`La paleta enviada a añadir no ha pasado la validación: ${pet.body.paleta}`)
            }
            r.value = await addNewPallete(pet.session.usuario._id,pet.body.paleta)
            r.err = typeof(r.value) == "string" ? true : false
            //Si r.value es string, será la descripción del error, como por ejemplo: ese nombre ya existe.
            //Este tipo de errores no interesa registrarlos, sólo enviarlos al usuario.
        } catch (error) {
            r.value = false
            r.err = true
            console.error("Error al añadir nueva paleta, middleware -> /add-new-palette", error)
            res.status(500)
        } finally {
            res.send(r)
            callback()
        }
    })
})
// Cola para añadir un color.
const queueAddNewColor = async.queue((task, callback) => {
    task(callback)
},1)//Ejecucion secuencial.
servidor.post("/add-new-color", (pet,res) => {
    queueAddNewColor.push( async callback =>{
        let r = { err : true, value : null }
        res.status(200)
        try {
            if (!!!pet.session.usuario) {throw new Error("No hay ninguna sesión iniciada.")}
            if( typeof(pet.body.color) !== "object"){
                throw new Error("El valor color enviado a añadir no es un objeto.")
            }
            let o_color = {
                r : validate(pet.body.color.r),
                g : validate(pet.body.color.g),
                b : validate(pet.body.color.b)
            }
            //La función validate recibe un valor, si pasa la validación retorna el valor, y si no retorna 0.
            r.value = await addNewColor(pet.session.usuario._id, pet.body.nombre, o_color)
            r.err = false
        } catch (error) {
            r.value = false
            r.err = true
            console.error("Error al añadir nuevo color, middleware -> /add-new-color", error)
            res.status(500)
        } finally {
            res.send(r)
            callback()
        }
    })
})
// cola para actualizar el nombre de usuario. 
const queueUpdateUserName = async.queue((task, callback) => {
    task(callback)
},1)//Ejecución secuencial.
servidor.put("/update-user-name", (pet,res) => {
    queueUpdateUserName.push( async callback =>{
        let r = { err : true, value : null }
        res.status(200)
        try {
            if (!!!pet.session.usuario) {throw new Error("No hay ninguna sesión iniciada.")}
            if (!/^[a-záéíóúñ \-._\d]{3,20}$/i.test(pet.body.newName)) {
                throw new Error(`El nuevo nombre de usuario no cumple la validación. Nombre: ${pet.body.newName}`)
            }
            r.value = await updateUserName(pet.session.usuario._id, pet.body.newName)
            r.err = typeof(r.value) == "string" ? true : false
            //Si es un string será la descripción del error, si no, será Boolean (acknowledged)
            if (!r.err) {
                pet.session.usuario.usuario.data.nombre = pet.body.newName
                //acualizar la session para que cuando cargue index.ejs el h2 lo haga con el nombre correcto.
            }
        } catch (error) {
            r.value = "Error"
            r.err = true
            console.error("Error al actualizar nombre de usuario, middleware -> /update-user-name", error)
            res.status(500)
        } finally {
            res.send(r)
            callback()
        }
    })
})
//Cola para actualizar el email del usuario.
const queueUpdateUserEmail = async.queue((task, callback) => {
    task(callback)
},1)//Ejecución secuencial.
servidor.put("/update-user-email", (pet,res) => {
    queueUpdateUserEmail.push( async callback =>{
        let r = { err : true, value : null }
        res.status(200)
        try {
            if (!!!pet.session.usuario) {throw new Error("No hay ninguna sesión iniciada.")}
            if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(pet.body.newEmail)) {
                throw new Error(`El email no ha pasado la validación: ${pet.body.newEmail}`)
            }
            r.value = await  updateUserEmail(pet.session.usuario._id, pet.body.newEmail)
            r.err = typeof(r.value) == "string" ? true : false
            //Si r.value es string, es porque ha ocurrido el error de ya existe.
        } catch (error) {
            r.value = false
            r.err = true
            console.error("Error al actualizar email, middleware -> /update-user-email", error)
            res.status(500)
        } finally {
            res.send(r)
            callback()
        }
    })
})
//Cola para actualizar la contraseña del usuario.
const queueUpdateUserPassword = async.queue((task, callback) => {
    task(callback)
},1)//Ejecución secuencial.
servidor.put("/update-user-password", (pet,res) => {
    queueUpdateUserPassword.push( async callback =>{
        let r = { err : true, value : null }
        res.status(200)
        try {
            if (!!!pet.session.usuario) {throw new Error("No hay ninguna sesión iniciada.")}
            if (pet.body.newPassword.length < 10) {
                throw new Error(`La contraseña no llega a la longitud mínima: ${pet.body.newPassword}`)
            }
            if (pet.body.newPassword.length > 10) {
                throw new Error(`La contraseña sobrepasa la longitud máxima: ${pet.body.newPassword}`)
            }
            //La contraseña se muestra en los logs ya que si ha llegado hasta aquí pasando la validación del front
            //Es porque el usuario ha tratado de saltarse la validación y lo más probable es que sea una inserción de datos maliciosa
            r.value = await updateUserPassword(pet.session.usuario._id, pet.body.newPassword)
            r.err = false
        } catch (error) {
            r.value = false
            r.err = true
            console.error("Error al actualizar contraseña, middleware -> /update-user-password", error)
            res.status(500)
        } finally {
            res.send(r)
            callback()
        }
    })
})
//Cola para actualizar el nombre de una paleta.
const queueUpdatePalette = async.queue((task, callback) => {
    task(callback)
},1)//Ejecución secuencial.
servidor.put("/update-palette", (pet,res) => {
    queueUpdatePalette.push( async callback =>{
        let r = { err : true, value : null }
        res.status(200)
        try {
            if (!!!pet.session.usuario) {throw new Error("No hay ninguna sesión iniciada.")}
            if (!/^[a-záéíóúñ \-._\d]{3,20}$/i.test(pet.body.nombre)) {
                throw new Error(`El nombre de la paleta (El antiguo) enviado a actualizar no cumple la validación. Nombre: ${pet.body.nombre}`)
            }
            if (!/^[a-záéíóúñ \-._\d]{3,20}$/i.test(pet.body.nuevo)) {
                throw new Error(`El nombre de la paleta (El nuevo) enviado a actualizar no cumple la validación. Nombre: ${pet.body.nuevo}`)
            }
            r.value = await updatePaletteName(pet.session.usuario._id,pet.body.nombre,pet.body.nuevo)
            r.err = typeof(r.value) == "string" ? true : false
        } catch (error) {
            r.value = false
            r.err = true
            console.error("Error al actualizar paleta, middleware -> /update-paleta", error)
            res.status(500)
        } finally {
            res.send(r)
            callback()
        }
    })
})
//Cola para actualizar un color.
const queueUpdateColor = async.queue((task, callback) => {
    task(callback)
},1)//Ejecución secuencial.
servidor.put("/update-color", (pet,res) => {
    queueUpdateColor.push( async callback =>{
        let r = { err : true, value : null }
        res.status(200)
        try {
            if (!!!pet.session.usuario) {throw new Error("No hay ninguna sesión iniciada.")}
            if (!/^[a-záéíóúñ \-._\d]{3,20}$/i.test(pet.body.nombre)) {
                throw new Error(`El nombre de la paleta del color enviado a actualizar, no cumple la validación. Nombre: ${pet.body.nombre}`)
            }
            if (typeof(pet.body.color) !== "object") {
                throw new Error(`El tipo de pet.body.color no es un objeto: ${pet.body.color}`)
            }
            if (!/^[a-zA-z\d]{10}$/.test(pet.body.color.id)) {
                throw new Error(`El id del color no ha pasado la validación: ${pet.body.colorId}`)
            }
            //Como se han implementado las colas, no habrá problemas de concurrencia con este tipos de variables.
            let colorToUpdate = {
                id : pet.body.color.id,
                r : validate(pet.body.color.r),
                g : validate(pet.body.color.g),
                b : validate(pet.body.color.b)
            }
            r.value = await updateColor(pet.session.usuario._id, pet.body.nombre, colorToUpdate)
            r.err = false
        } catch (error) {
            r.value = false
            r.err = true
            console.error("Error al actualizar color, middleware -> /update-color", error)
            res.status(500)
        } finally {
            res.send(r)
            callback()
        }
    })
})
//Cola para eliminar un color.
const queueDeleteColor = async.queue((task, callback) => {
    task(callback)
},1)//Ejecución secuencial.
servidor.delete("/delete-color", (pet,res) => {
    queueDeleteColor.push( async callback =>{
        let r = { err : true, value : null }
        res.status(200)
        try {
            if (!!!pet.session.usuario) {throw new Error("No hay ninguna sesión iniciada.")}
            if (!/^[a-zA-z\d]{10}$/.test(pet.body.colorId)) {
                throw new Error(`El id del color no ha pasado la validación: ${pet.body.colorId}`)
            }
            r.value = await deleteColor(pet.session.usuario._id, pet.body.nombre, pet.body.colorId)
            r.err = false
        } catch (error) {
            r.value = false
            r.err = true
            console.error("Error al eliminar color, middleware -> /delete-color", error)
            res.status(500)
        } finally {
            res.send(r)
            callback()
        }
    })
})
//Cola para borrar una paleta.
const queueDeletePalette = async.queue((task, callback) => {
    task(callback)
},1)//Ejecución secuencial.
servidor.delete("/delete-palette", (pet,res) => {
    queueDeletePalette.push( async callback =>{
        let r = { err : true, value : null }
        res.status(200)
        try {
            if (!!!pet.session.usuario) {throw new Error("No hay ninguna sesión iniciada.")}
            if (!/^[a-záéíóúñ \-._\d]{3,20}$/i.test(pet.body.nombre)) {
                throw new Error(`El nombre de la paleta enviado a eliminar, no cumple la validación. Nombre: ${pet.body.nombre}`)
            }
            r.value = await deletePallete(pet.session.usuario._id, pet.body.nombre)
            r.err = false
        } catch (error) {
            r.value = false
            r.err = true
            console.error("Error al eliminar paleta, middleware -> /delete-palette", error)
            res.status(500)
        } finally {
            res.send(r)
            callback()
        }
    })
})
//Cola para eliminar un color.
const queueDeleteUser = async.queue((task, callback) => {
    task(callback)
},1)//ejecución secuencial.
servidor.get("/delete-user",(pet,res) => {
    queueDeleteUser.push( async callback =>{
        let r = { err : null, value : null }
        res.status(200)
        try {
            if (!!!pet.session.usuario) {throw new Error("No hay ninguna sesión iniciada.")}
            r.value = await deleteUser(pet.session.usuario._id)
            r.err = false
        } catch (error) {
            r.value = false
            r.err = true
            console.error("Error al eliminar usuario, middleware -> /delete-user", error)
            res.status(500)
        } finally {
            res.send(r)
            callback()
        }
    })
})
/* -- 2263 líneas de JS*/
servidor.listen(puerto)
