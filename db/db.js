const {MongoClient, ObjectId} = require("mongodb")
const {ERR_INFO} = require("../err_messages")
const { generateId } = require("../id_generator")
const urlConexion = process.env.URL_MONGO
const bcrypt = require('bcrypt')
const saltRounds = 10

//Esta función permite que se establezca una conexión con la primera petición que necesite acceder a la base de datos.
//Osea, la creación de una cuenta de usuario.
//Luego las demás funciones reutilizarán esa conexión evitando crear y cerrar una conexión por cada función, lo que empeora el rendimiento.
let dbClient
async function conectar() {
  if (!dbClient) {
    dbClient = new MongoClient(urlConexion)
    await dbClient.connect()
  }
  return dbClient
}

async function getUserById(id) {
    const conexion = await conectar()
    try {
        const collection = conexion.db("pruebas").collection("pruebas")
        const finded = await collection.findOne({ _id: new ObjectId(id) })
        if (!finded) {throw new Error(`No se ha realizado la operación de consultar usuario: ${id},${finded}`)}
/*
        let resultado = await addNewUser(pet.body.nombre,pet.body.email,pet.body.password)
        if(typeof(resultado) !== "string"){
        ->  let o_usuario = await getUserById(resultado.insertedId)
                                                        ----------
        si no encuentra ninguno, findOne retorna null, lo cual dado el funcionamiento
        del código, es imposible salvo un error de conexión, por lo que el error lo atrapa el catch
        que lo manda al middleware, que lo registrrá.
*/
        return finded//Esto será petición.session.usuario
    } catch (error) {
        throw error
    }
}

async function loginUser(userName, password) {
    const conexion = await conectar()
    try {
        const collection = conexion.db("pruebas").collection("pruebas")
        const filtro = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/i.test(userName) ? { "usuario.data.email": userName } : { "usuario.data.nombre": userName }
        //El usuario puede iniciar sesión con su correo o con su nombre de usuario.
        const finded = await collection.findOne(filtro)
        if (!finded) {
            return ERR_INFO.NF_USER
        }
        const comparation = await bcrypt.compare(password, finded.usuario.data.password)
        //Uso de bycript para el manejo de las contraseñas de usuarios.
        if (comparation) {
            return finded//Esto será oetició.sessio.usuario
        } else {
            return "contraseña errónea"
        }
    } catch (error) {
        throw error
    }
}

async function getPallets(id) {
    const conexion = await conectar()
    try {
        const collection = conexion.db("pruebas").collection("pruebas")
        const usuario = await collection.findOne({ _id: new ObjectId(id) })
        if (!usuario) {throw new Error(`No se ha realizado la operación de consultar paletas del usuario: ${id},${usuario}`)}
        return usuario.usuario.paletas //retorna directamente el array de paletas del usuario.
    } catch (error) {
        throw error
    }
}

async function getColorsFromPallet(id, pallet) {
    const conexion = await conectar()
    try {
        //Esta es la estructura de una paleta: { nombre : "paleta-1", colores : []}
        const collection = conexion.db("pruebas").collection("pruebas")
        const { usuario } = await collection.findOne({ _id: new ObjectId(id) })
        const arrPaletas = usuario.paletas.map(({ nombre }) => nombre)//Cada paleta del usuario la sustituye por su nombre
        return arrPaletas.includes(pallet) ? usuario.paletas[arrPaletas.indexOf(pallet)].colores : false
        //Comparando los nombre se obtiene el índice y se accede a .colores
    } catch (error) {
        throw error
    }
}

async function addNewUser(name, email, password) {
    const conexion = await conectar()
    try {
        const collection = conexion.db("pruebas").collection("pruebas")
        const exist_n = await collection.findOne({ "usuario.data.nombre": name.trim() })
        const exist_e = await collection.findOne({ "usuario.data.email": email.trim() })
        if (exist_n || exist_e) {return ERR_INFO.NAME_o_EMAIL_EXISTS}
        //Estos errores son los que en los middleware se identifican con typeof(r.value) == "string" ? ...
        const hashedPassword = await bcrypt.hash(password, saltRounds)
        const usuario = {
            usuario: {
                data: {
                    nombre: name,
                    password: hashedPassword,
                    email: email
                },
                paletas: []
            }
        }
        const resultado = await collection.insertOne(usuario)
        if (!resultado) {throw new Error(`No se ha realizado la operación de añadir usuario: ${name},${email},${hashedPassword},${resultado}`)}
        return resultado //Aqui se podrá acceder al insertedId, que servirá para getUserById, y session.usuario = ...
    } catch (error) {
        throw error
    }
}

async function addNewPallete(id, paleta) {
    const conexion = await conectar()
    try {

/*      No hay forma dinámica de acceder a paletas, es decir es posible `paletas[${i}].colores`
        Por lo que la solución es coger todo el array paletas, añadir una, y actualizar todo el array paletas.
        Es por esto que la semántica de las operaciones se pierde, hay funciones que son addColor,
        y lo que están haciendo es updateOne.
*/
        const collection = conexion.db("pruebas").collection("pruebas")
        const { usuario } = await getUserById(id)
        const { paletas } = usuario
        const arrPaletas = paletas.map(({ nombre }) => nombre)//mismo proceso que en get colors from palette
        const exist = arrPaletas.includes(paleta.trim())

        if (exist) {return ERR_INFO.NAME_PALETA_EXISTS}

        const newPaleta = { nombre: paleta, colores: [] }
        paletas.push(newPaleta)
        const resultado = (await collection.updateOne({ _id: new ObjectId(id) }, { $set: { "usuario.paletas": paletas } })).acknowledged
        if (!resultado) {throw new Error(`No se ha realizado la operación de añadir paleta: ${id},${paleta},${paletas},${resultado}`)}
        return { nombre : paleta }
    } catch (error) {
        throw error
    }
}

async function addNewColor(id, paleta, color) {
    const conexion = await conectar()
    try {
        const collection = conexion.db("pruebas").collection("pruebas")
        const paletas = await getPallets(id)
        const arrPaletas = paletas.map(({ nombre }) => nombre)//primero obtenemos el array de los nombres de paletas
        const arrColores = paletas[arrPaletas.indexOf(paleta)].colores.map(({ id }) => id)//Luego el array de los id de los colores de la paleta
        /*
        Si un usuario con una sesión iniciada, escribe la URL .../get-palette/nombre <- Siendo ese nombre diferente a todas sus paletas.
        y en esa plantilla hace submit a /add-new-color
        resultará este error: 
        Error al añadir nuevo color, middleware -> /add-new-color TypeError: Cannot read properties of undefined (reading 'colores')
        este error es atrapado por el catch y registrado en los logs del servidor.
        */
        color.id = generateId()
        while (arrColores.includes(color.id)) {
            color.id = generateId()
        }
        //Se genera un id único para el nuvo color y se añade al objeto: 
        //antes: { r: x, g: y, b: z}
        //ahora: { r: x, g: y, b: z, id: 1234567890}
        if (color.id) {
            paletas[arrPaletas.indexOf(paleta)].colores.push(color)
        }
        const resultado = (await collection.updateOne({ _id: new ObjectId(id) }, { $set: { "usuario.paletas": paletas } })).acknowledged
        if (!resultado) {throw new Error(`No se ha realizado la operación de añadir color: ${id},${paleta},${color},${paletas},${resultado}`)}
        return color.id//Este color id es el que está esperando a ser añadido en el objeto Color del front.
    } catch (error) {
        throw error
    }
}

async function updateUserName(id, newName) {
    const conexion = await conectar()
    try {
        const collection = conexion.db("pruebas").collection("pruebas")
        const exist = await collection.findOne({ "usuario.data.nombre": newName })
        if (exist) {return ERR_INFO.NAME_EXISTS}
        const resultado = (await collection.updateOne({ _id: new ObjectId(id) }, { $set: { "usuario.data.nombre": newName } })).acknowledged
        if (!resultado) {throw new Error(`No se ha realizado la operación de actualizar nombre de usuario: ${id},${newName},${resultado}`)}
        return resultado
    } catch (error) {
        throw error
    }
}

async function updateUserPassword(id, newPassword) {
    const conexion = await conectar()
    try {
        const collection = conexion.db("pruebas").collection("pruebas")
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds)
        const resultado = (await collection.updateOne({ _id: new ObjectId(id) }, { $set: { "usuario.data.password": hashedPassword } })).acknowledged
        if (!resultado) {throw new Error(`No se ha realizado la operación de actualizar contraseña: ${id},${hashedPassword},${resultado}`)}
        return resultado
    } catch (error) {
        throw error
    }
}

async function updateUserEmail(id, newEmail) {
    const conexion = await conectar()
    try {
        const collection = conexion.db("pruebas").collection("pruebas")
        const exist = await collection.findOne({ "usuario.data.email": newEmail })
        if (exist) {return ERR_INFO.EMAIL_EXISTS}
        const resultado = (await collection.updateOne({ _id: new ObjectId(id) }, { $set: { "usuario.data.email": newEmail } })).acknowledged
        if (!resultado) {throw new Error(`No se ha realizado la operación de actualizar email: ${id},${newEmail},${resultado}`)}
        return resultado
    } catch (error) {
        throw error
    }
}

async function updatePaletteName(id, oldName, newName) {
    const conexion = await conectar()
    try {
        const collection = conexion.db("pruebas").collection("pruebas")
        const { usuario } = await getUserById(id)
        const { paletas } = usuario
        const arrPaletas = paletas.map(({ nombre }) => nombre)//Array de nombres de las paletas del usuario
        const exist = arrPaletas.includes(newName.trim())//Comprobación de si ya existe el nombre
        if (exist) {return ERR_INFO.NAME_PALETA_EXISTS}
        paletas[arrPaletas.indexOf(oldName)].nombre = newName//Se accede a la antigua y se le actualiza el nombre
        const resultado = (await collection.updateOne({ _id: new ObjectId(id) }, { $set: { "usuario.paletas": paletas } })).acknowledged
        if (!resultado) {throw new Error(`No se ha realizado la operación de actualizar paleta: ${id},${oldName},${newName},${paletas},${resultado}`)}
        return resultado
    } catch (error) {
        throw error
    }
}

async function updateColor(id, paletteName, color) {
    const conexion = await conectar()
    try {
        const collection = conexion.db("pruebas").collection("pruebas")
        const { usuario } = await getUserById(id)
        const { paletas } = usuario
        const arrPaletas = paletas.map(({ nombre }) => nombre)//Array de nombres de las paletas del usuario
        const arrColores = paletas[arrPaletas.indexOf(paletteName)].colores.map(({ id }) => id)//Array de los id de los colores de la paleta
        paletas[arrPaletas.indexOf(paletteName)].colores[arrColores.indexOf(color.id)] = color//Se accede al color a actualizar, y se le asigna el nuevo objeto { r: nx, g: ny, b: nz, id: 1234567890}
        const resultado = (await collection.updateOne({ _id: new ObjectId(id) }, { $set: { "usuario.paletas": paletas } })).acknowledged
        if (!resultado) {throw new Error(`No se ha realizado la operación de actualizar color: ${id},${paletteName},${color},${paletas},${resultado}`)}
        return resultado
    } catch (error) {
        throw error
    }
}

async function deleteUser(id) {
    const conexion = await conectar()
    try {
        const collection = conexion.db("pruebas").collection("pruebas")
        const resultado = (await collection.deleteOne({ _id: new ObjectId(id) })).deletedCount
        if (!resultado) {throw new Error(`No se ha realizado la operación de eliminar usuario: ${id},${resultado}`)}
        return resultado
    } catch (error) {
        throw error
    }
}

async function deletePallete(id, paleta) {
    const conexion = await conectar()
    try {
        const collection = conexion.db("pruebas").collection("pruebas")
        const arrPaletas = []
        const paletas = await getPallets(id)
        paletas.forEach(({ nombre }) => arrPaletas.push(nombre))//Array de nombres de paleta
        paletas.splice(arrPaletas.indexOf(paleta), 1)//Se elimina la paleta
        const resultado = (await collection.updateOne({ _id: new ObjectId(id) }, { $set: { "usuario.paletas": paletas } })).acknowledged
        if (!resultado) {throw new Error(`No se ha realizado la operación de eliminar paleta: ${id},${paleta},${paletas},${resultado}`)}
        return resultado
    } catch (error) {
        throw error
    }
}

async function deleteColor(id, paleta, colorId) {
    const conexion = await conectar()
    try {
        const collection = conexion.db("pruebas").collection("pruebas")
        const paletas = await getPallets(id)
        const arrPaletas = []
        const arrColores = []
        paletas.forEach(({ nombre }) => arrPaletas.push(nombre))//Array de nombres de paletas
        paletas[arrPaletas.indexOf(paleta)].colores.forEach(({ id }) => arrColores.push(id))//Se accede a la paleta y se extraen los ids de los colores en un array
        paletas[arrPaletas.indexOf(paleta)].colores.splice(arrColores.indexOf(colorId), 1)//Se elimina el color
        const resultado = (await collection.updateOne({ _id: new ObjectId(id) }, { $set: { "usuario.paletas": paletas } })).acknowledged
        if (!resultado) {throw new Error(`No se ha realizado la operación de eliminar color: ${id},${paleta},${colorId},${paletas},${resultado}`)}
        return resultado
    } catch (error) {
        throw error
    }
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