const arr = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","0","1","2","3","4","5","6","7","8","9"]
function generateId() {
    let id = [0,1,2,3,4,5,6,7,8,9].map( () => arr[Math.floor(Math.random() * 62)]).join("")
    return typeof(id) == "string" ? id : "err"
    //este id tiene: 62^10 valores posibles. Escalable añadiendo más caracteres, o más longitud. Pero para colores dentro de una paleta dentro de un usuario será suficiente.
}
module.exports = {generateId}

