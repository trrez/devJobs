import { check, validationResult } from "express-validator";
import { Usuario } from "../models/Usuarios.js"
import multer from "multer";
import path from 'path';
import { fileURLToPath } from 'url';
import shortid from "shortid"
import fs from "fs-extra"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Verifica y crea el directorio 'uploads' si no existe
const uploadDir = path.join(__dirname, "../public/uploads/perfiles");
fs.ensureDirSync(uploadDir);

const configuracionMulter = {
    limits: {fileSize : 1000000 },
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, path.join(__dirname, '../public/uploads/perfiles'))
        },
        filename:(req, file, cb) => {
            const extension = file.mimetype.split('/')[1]
            cb(null, `${shortid.generate()}.${extension}`)
        }
    }),
    fileFilter(req, file, cb){
        if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg'){
            // El callback se ejecuta como true o false
            cb(null, true)
        }else{
            cb(new Error('Formato no valido'), false)
        }
    }
}
const subirImagen = (req, res, next) => {
    upload(req,res, function(error){
        if(error){
            if(error instanceof multer.MulterError){
                if(error.code === 'LIMIT_FILE_SIZE'){
                    req.flash('error', 'Imagen muy pesada')
                    return res.redirect('/editar-perfil')
                }else{
                    req.flash('error', error.message)
                }
            }else{
                req.flash('error', error.message)
            }
            res.redirect('/administracion')
            return
        }else{
            return next()
        }
    })
}


const upload = multer(configuracionMulter).single('imagen')

const formCrearCuenta = (req, res) => {
    res.render('crear-cuenta', {
        nombrePagina: 'Crea tu cuenta de DevJobs',
        tagline: 'Comienza a publicar tus vacantes gratis, solo debes crear una cuenta'
    })
}

const validarRegistro = async (req, res, next) => {
    await check('nombre').notEmpty()
    .withMessage('El nombre es obligatorio')
    .escape()
    .trim()
    .run(req)
    await check('email').isEmail()
    .withMessage('El email es obligatorio')
    .normalizeEmail()
    .run(req)

    // Confirmando que ambas password coincidan
    await check("password")
    .isLength({ min: 6 })
    .withMessage("Password debe tener al menos 6 caracteres.")
    .run(req);
    await check("repetir_password")
    .equals(req.body.password)
    .withMessage("Las passwords no coinciden.")
    .run(req);

    let errores = validationResult(req)
    if(!errores.isEmpty()){
        req.flash('error', errores.array().map(error => error.msg))
        // Si hay errores
        return res.render('crear-cuenta', {
             nombrePagina: 'Crea tu cuenta de DevJobs',
             tagline: 'Comienza a publicar tus vacantes gratis, solo debes crear una cuenta',
             mensajes: req.flash()
        })
    }
    // Si toda la validacion es correcta
    next()
}

const validarPerfil =  async (req, res, next) => {
    await check('nombre').notEmpty()
    .withMessage('El nombre es obligatorio')
    .escape()
    .trim()
    .run(req)
    await check('email').isEmail()
    .withMessage('El email es obligatorio')
    .normalizeEmail()
    .run(req)

    // Si el usuario cambio la password
    if(req.body.password){
        await check("password")
        .isLength({ min: 6 })
        .withMessage("Password debe tener al menos 6 caracteres.")
        .run(req);
    }

    let errores = validationResult(req)
    if(!errores.isEmpty()){
        req.flash('error', errores.array().map(error => error.msg))
        // Si hay errores
        return res.render('editar-perfil', {
                nombrePagina: 'Editar Perfil',
                cerrarSesion: true,
                nombre: req.user.nombre,
                imagen: req.user.imagen,
                usuario: req.user.toObject(),
                mensajes: req.flash()
        })
    }
    // Si toda la validacion es correcta
    next()
}
 
const crearUsuario = async (req, res, next) => {
    try {
        const usuario = new Usuario(req.body)
        await usuario.save()
        res.redirect('/iniciar-sesion')
    } catch (error) {
        req.flash('error', error)
        res.redirect('/crear-cuenta')
    }

}

const formIniciarSesion = (req, res) => {
    res.render('iniciar-sesion',{
        nombrePagina: 'Iniciar Sesion devJobs'
    })
}

// Formulario editar perfil
const formEditarPerfil = async(req, res) => {
    const usuario = await Usuario.findById(req.user._id).lean()
    res.render('editar-perfil',{
        nombrePagina: 'Editar Perfil',
        cerrarSesion: true,
        nombre: usuario.nombre,
        imagen: req.user.imagen,
        usuario
    })
}

// Guardar cambios editar perfil
const editarPerfil = async(req, res) => {
    const usuario = await Usuario.findById(req.user._id)
    
    usuario.nombre = req.body.nombre
    usuario.email = req.body.email
    if(req.body.password){
        usuario.password = req.body.password
    }

    if(req.file){
        usuario.imagen = req.file.filename
    }

    await usuario.save()

    req.flash('correcto', 'Cambios Guardados Correctamente')

    res.redirect("/administracion")
}




export { formCrearCuenta, crearUsuario, validarRegistro, formIniciarSesion, formEditarPerfil, editarPerfil, validarPerfil , subirImagen}