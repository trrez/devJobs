import Vacante from '../models/Vacantes.js'

const mostrarTrabajos = async (req, res) => {
    const vacantes = await Vacante.find().lean()

    if(!vacantes) return next()

    res.render('home', {
        nombrePagina: 'devJobs',
        tagline: 'Encuentra y publica trabajos para desarrolladores web',
        barra: true,
        boton: true,
        vacantes
    })
}



export { mostrarTrabajos }