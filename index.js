const express = require("express")
const servidor = express()
let puerto = process.env.PORT || 4000;




servidor.listen(puerto)