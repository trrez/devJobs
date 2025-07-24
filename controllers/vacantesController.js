import { check, validationResult } from 'express-validator'
import Vacante from '../models/Vacantes.js'
import multer from 'multer'
import shortid from 'shortid'
import fs from "fs-extra"
import path from 'path';
import { fileURLToPath } from 'url';

// Formulario para crear una vacante
const formularioNuevaVacante = (req, res) => {
    res.render('nueva-vacante',{
        nombrePagina: 'Nueva Vacante',
        tagline: 'Llena el formulario y publica tu vacante',
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen,
    })
}

const agregarVacante = async (req, res) => {
    
    const vacante = new Vacante(req.body)

    // usuario autor de la vacante
    vacante.autor = req.user._id

    // Crear arreglo de habilidades (skills)
    vacante.skills = req.body.skills.split(',')
    
    // Almacenarlo en la base de datos
    const nuevaVacante = await vacante.save()

    // Redireccionar
    res.redirect(`/vacantes/${nuevaVacante.url}`)
}

const mostrarVacantes = async (req, res, next) => {
    const vacante = await Vacante.findOne({ url: req.params.url }).populate('autor').lean()
    
    // Si no hay vacante
    if(!vacante) return next()

    res.render('vacante', {
        vacante,
        nombrePagina: vacante.titulo,
        barra: true
    })
}

const formEditarVacante = async (req, res, next) => {
    const vacante = await Vacante.findOne({ url: req.params.url }).lean()

    if(!vacante) return next()

    res.render('editar-vacante', {
        nombrePagina: `Editar - ${vacante.titulo}`,
        vacante,
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen,
    })
}

const editarVacante = async(req, res) => {
    const vacanteActualizada = req.body
    vacanteActualizada.skills = req.body.skills.split(',')

    const vacante = await Vacante.findOneAndUpdate({ url: req.params.url }, vacanteActualizada, {
        new: true,
        runValidators: true
    })

    res.redirect(`/vacantes/${vacante.url}`)
}

// Validar y sanitizar el formulario
const validarVacante = async (req, res, next) => {
    // Sanitizar los datos
    await check('titulo').notEmpty()
    .withMessage('El titulo no puede estar vacio')
    .escape()
    .trim()
    .run(req)
    await check('empresa').notEmpty()
    .withMessage('El nombre de la empresa no puede estar vacio')
    .escape()
    .trim()
    .run(req)
    await check('ubicacion').notEmpty()
    .withMessage('Agrega la ubicacion')
    .escape()
    .trim()
    .run(req)
    await check('contrato')
    .notEmpty().withMessage('El tipo de contrato es obligatorio')
    .isIn(['Freelance', 'Tiempo Completo', 'Medio Tiempo', 'Por Proyecto'])
    .withMessage('Selecciona un contrato válido')
    .run(req)

    let errores = validationResult(req)
    if(!errores.isEmpty()){
        req.flash('error', errores.array().map(error => error.msg))
        return res.render('nueva-vacante', {
            nombrePagina: 'Nueva Vacante',
            tagline: 'Llena el formulario y publica tu vacante',
            cerrarSesion: true,
            nombre: req.user.nombre,
            mensajes: req.flash()
        }) 
    }
    next()
}

const eliminarVacante = async (req, res) => {
    const { id } = req.params
    const vacante = await Vacante.findById( id )
    if(verificarAutor(vacante, req.user)){
        // Todo bien, si es el usuario, elimina
        await vacante.deleteOne()
        res.status(200).send('Vacante Eliminada Correctamente')
    }else{
        // No permirido
        res.status(403).send('error')
    }
}

const verificarAutor = (vacante = {}, usuario = {}) => {
    if(!vacante.autor.equals(usuario._id)){
        return false
    }
    return true
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Verifica y crea el directorio 'uploads' si no existe
const uploadDir = path.join(__dirname, "../public/uploads/cv");
fs.ensureDirSync(uploadDir);

//Subir archivos en PDF
const subirCV = (req, res, next) => {
    upload(req,res, function(error){
        if(error){
            if(error instanceof multer.MulterError){
                if(error.code === 'LIMIT_FILE_SIZE'){
                    req.flash('error', 'El archivo es muy grande: Maximo 100kb')
                }else{
                    req.flash('error', error.message)
                }
            }else{
                req.flash('error', error.message)
            }
            res.redirect('back')
        }else{
            next()
        }
    })
}

const configuracionMulter = {
    limits: {fileSize : 1000000 },
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, path.join(__dirname, '../public/uploads/cv'))
        },
        filename:(req, file, cb) => {
            const extension = file.mimetype.split('/')[1]
            cb(null, `${shortid.generate()}.${extension}`)
        }
    }),
    fileFilter(req, file, cb){
        if(file.mimetype === 'application/pdf'){
            // El callback se ejecuta como true o false
            cb(null, true)
        }else{
            cb(new Error('Formato no valido'), false)
        }
    }
}

const upload = multer(configuracionMulter).single('cv')

// Almacenar los candidatos en la BD
const contactar = async(req, res, next) => {
    const vacante = await Vacante.findOne({ url: req.params.url })
    
    // si no existe la vacante
    if(!vacante) return next()

        //si existe, construir el nuevo objeto
        const nuevoCandidato = {
            nombre: req.body.nombre,
            email: req.body.email,
            cv: req.file.filename
        }

        // Almacenar la vacane
        vacante.candidatos.push(nuevoCandidato)
        await vacante.save()

        // Mensaje flash y redireccion
        req.flash('correcto', "Se envio tu curriculum correctamente" )
        res.redirect('/')
}

const mostrarCandidatos = async (req, res, next) => {
    const vacante = await Vacante.findById(req.params.id).lean()

    if(vacante.autor != req.user._id.toString()){
        return next()
    }

    if(!vacante) return next()
    
    res.render('candidatos', {
        nombrePagina: `Candidatos Vacante - ${vacante.titulo}`,
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen,
        candidatos: vacante.candidatos
    })
}

const buscarVacantes = async(req, res) => {
    const vacantes = await Vacante.find({
        $text: {
            $search: req.body.q
        }
    }).lean()
    

    // Mostrar las vacantes
    res.render('home', {
        nombrePagina: `Resultados para la busqueda: ${req.body.q}`,
        barra: true,
        vacantes
    })
}

export { formularioNuevaVacante, agregarVacante,mostrarVacantes, formEditarVacante, editarVacante, validarVacante, eliminarVacante, subirCV, contactar, mostrarCandidatos, buscarVacantes }