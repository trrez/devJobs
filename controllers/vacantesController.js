import { check, validationResult } from 'express-validator'
import Vacante from '../models/Vacantes.js'

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
    console.log(vacante)
    
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

export { formularioNuevaVacante, agregarVacante,mostrarVacantes, formEditarVacante, editarVacante, validarVacante, eliminarVacante }