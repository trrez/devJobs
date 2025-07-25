import mongoose from "mongoose"
import {db} from "./config/db.js"

import express from "express"
import router from "./routes/index.js"
import { create } from "express-handlebars"
import path from "path"
import {fileURLToPath} from "url"
import dotenv from "dotenv"
dotenv.config({ path: ".env"})
import cookieParser from "cookie-parser"
import session from "express-session"
import MongoStore from "connect-mongo"
import helpers from "./helpers/handlebars.js"
import flash from "connect-flash"
import passport from "./config/passport.js"
import createError from "http-errors"

const app = express()

// Habilitar lectura de datos de formularios
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// conectar a la base de datos
try {
    await db()
} catch (error) {
    console.log(error)
}

// Habilitar handlebars como view engine version vieja
//app.engine('handlebars',
//    engine({
//        defaultLayout: 'layout',
//        helpers: helpers
//    })
//)

const hbs = create({
    defaultLayout: 'layout',
    helpers: helpers
})

app.engine('handlebars', hbs.engine)
app.set('view engine', "handlebars")

app.use(cookieParser())

app.use(session({
    secret: process.env.SECRETO,
    key: process.env.KEY,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl : process.env.DATABASE })
}))

// Inicializar passport
app.use(passport.initialize());
app.use(passport.session());


// static files
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
app.use(express.static(path.join(__dirname, 'public')))

// Alertas y flash messages
app.use(flash())

//Crear nuestro middleware
app.use((req, res, next) => {
    res.locals.mensajes = req.flash()
    next()
})

app.use("/", router)

// 404 pagina no existe
app.use((req, res, next) => {
    next(createError(404, 'No encontrado'))
})


// Administracion de los errores
app.use((error, req, res, next) => {
    res.locals.mensaje = error.message
    const status = error.status || 500
    res.locals.status = status
    res.status(status)
    res.render('error')
})

app.listen(process.env.PUERTO)