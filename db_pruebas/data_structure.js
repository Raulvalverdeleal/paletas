//{ u : [{ d : [{n : "n"},{p : "*"},{e : "@"}]},{ p : [{n : "n", c : [{r,g,b}]},{n : "n", c : [{r,g,b}]},{n : "n", c : [{r,g,b}]}]}]}
const {to_add,to_read,to_update,to_delete} = require("./prueba_1.js")

let usuario = { usuario : {
    data : {
        nombre : "user_36",
        password : "12345678",
        email : "joseeeblabla@gmail.com"
     },
     paletas : []
}}
let paleta = { nombre : "", 
          colores : []
}

/*
async function operacion(name,new_name){
    let consulta = await consultar()
    let id = ""
    consulta.forEach( element => {
        if (element.usuario.data.nombre == name) {
            id = element._id
        }
    });
    let cambio = await update(id,1,new_name)
}
*/
async function update_paleta(id,paleta,color){
    let cambio = await delete_subitem(3,id,"paleta-34",2)
    console.log(cambio)
}
async function add_paleta(){
    let cambio = await to_delete({tipo : 3, id : "651daa2dd1fe43a72d4b2528", paleta : "paleta-3", color : 1}).then(({m}) => console.log(m))
}
//update_paleta("651daa2dd1fe43a72d4b2528","tercera-paleta",{r: 0, g: 0, b: 0})
add_paleta("651daa2dd1fe43a72d4b2528","segunda-paleta",{r: 0, g: 0, b: 0})


