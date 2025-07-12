import Vacante from '../models/Vacantes.js'

// Formulario para crear una vacante
const formularioNuevaVacante = (req, res) => {
    res.render('nueva-vacante',{
        nombrePagina: 'Nueva Vacante',
        tagline: 'Llena el formulario y publica tu vacante'
    })
}

const agregarVacante = async (req, res) => {
    const vacante = new Vacante(req.body)

    // Crear arreglo de habilidades (skills)
    vacante.skills = req.body.skills.split(',')
    
    // Almacenarlo en la base de datos
    const nuevaVacante = await vacante.save()

    // Redireccionar
    res.redirect(`/vacantes/${nuevaVacante.url}`)
}

const mostrarVacantes = async (req, res, next) => {
    const vacante = await Vacante.findOne({ url: req.params.url }).lean()
    
    // Si no hay vacante
    if(!vacante) return next()

    res.render('vacante', {
        vacante,
        nombrePagina: vacante.titulo,
        barra: true
    })

}

export { formularioNuevaVacante, agregarVacante,mostrarVacantes }