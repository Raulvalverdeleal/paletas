const ERR_INFO = Object.freeze({
    DATA_NOT_EMPTY : "rellena todos los campos",
    NAME_o_EMAIL_EXISTS : "El nombre de usuario o el correo ya están en uso.",
    NAME_PALETA_EXISTS : "Este nombre de paleta ya está en uso",
    NAME_EXISTS : "El usuario ya existe",
    NF_PALETA : "No se ha encontrado la paleta con nombre: ",
    NF_COLOR : "No se ha encontrado el color con id: ",
    EMAIL_EXISTS : "El correo ya está en uso",
    PASSWORD_IN_USE : "La contraseña es la misma",
    NAME_PALETA_NOT_EMPTY : "El nombre de la paleta no puede estar vacío",
    ID_COLOR_EXISTS : "El id ya existe.",
    NAME_EXISTS : "El usuario ya existe",
    NOT_EMAIL_VALIDATION : "El correo introducido no es válido",
    NOT_STANDAR_VALIDATION : "Los caracteres que puede contener son: a-z inlcuyendo acentos y ñ, '.' , '_' y '-'. Tiene que tener una longitud de entre 3 y 20 caracteres.",
    OTHER : "El tipo es erróneo o los datos pasados bien no corresponden o son insuficientes",
    

})
module.exports = {ERR_INFO}