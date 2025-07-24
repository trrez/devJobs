import passport from "passport";
import Vacante from "../models/Vacantes.js";
import { Usuario } from "../models/Usuarios.js";
import crypto from 'crypto'
import { enviarEmail } from "../handlers/email.js";

const autenticarUsuario = passport.authenticate('local', {
    successRedirect: '/administracion',
    failureRedirect: '/iniciar-sesion',
    failureFlash: true,
    badRequestMessage: 'Ambos campos son obligatorios'
})

// Revisar si el usuario esta autenticado o no
const verificarUsuario = (req, res, next) => {

    // Revisar el usuario
    if(req.isAuthenticated()){ return next() } // Estan autenticados
    
    // Redireccionar
    res.redirect('/iniciar-sesion')
}

const mostrarPanel = async (req, res) => {

    // Consultar el usuario autenticado
    const vacantes = await Vacante.find({ autor: req.user._id}).lean()
    res.render('administracion',{
        nombrePagina: 'Panel de Administracion',
        tagline: 'Crea y Administra tus vacantes desde aqui',
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen,
        vacantes
    })
}

const cerrarSesion = async (req, res, next) => {
    req.logout(function(err) {
        if(err) return next(err)
        req.flash('correcto', 'Sesion Cerrada Correctamente')
        res.redirect('/iniciar-sesion')
    })
}

const formReestablecerPassword = (req, res) => {
    res.render('reestablecer-password',{
        nombrePagina : 'Reestablece tu password',
        tagline: 'Si ya tienes una cuenta pero olvidaste tu password, coloca tu email'
    })
}

const enviarToken = async (req, res) => {
    const usuario = await Usuario.findOne({ email: req.body.email })

    if(!usuario) {
        req.flash('error', 'La cuenta no existe')
        return res.redirect('/iniciar-sesion')
    }

    // El usuario existe
    usuario.token = crypto.randomBytes(20).toString('hex')
    usuario.expira = Date.now() + 3600000

    // Guarda el usuario
    await usuario.save()
    const resetUrl = `http://${req.headers.host}/reestablecer-password/${usuario.token}`

    // Enviar notificaciones por email
    await enviarEmail({
        usuario,
        subject: 'Password Reset',
        resetUrl,
        archivo: 'reset'
    })

    req.flash('correcto', 'Revisa tu email para las indicaciones')
    res.redirect('/iniciar-sesion')
}

// Valida si el token es valido y el usuario existe, muestra la vista
const reestablecerPassword = async (req,res) => {
    const usuario = await Usuario.findOne({
        token: req.params.token,
        expira: {
            $gt: Date.now()
        }
    })

    if(!usuario){
        req.flash('error', 'El formulario ya no es valido, intenta de nuevo')
        res.redirect('/reestablecer-password')
    }

    // Todo bien, muestra el formulario
    res.render('nuevo-password',{
        nombrePagina: 'Nuevo Password'
    })
}

const guardarPassword = async(req, res ) => {
    const usuario = await Usuario.findOne({
        token: req.params.token,
        expira: {
            $gt: Date.now()
        }
    })

    // No existe el usuario o el token es invalido
    if(!usuario){
        req.flash('error', 'El formulario ya no es valido, intenta de nuevo')
        res.redirect('/reestablecer-password')
    }

    // Asignar nuevo password, limpiar valores previos
    usuario.password = req.body.password
    usuario.token = undefined
    usuario.expira = undefined

    // Guardar en la base de datos
    await usuario.save()

    req.flash('correcto', 'Password cambiada')
    res.redirect('/iniciar-sesion')
}
 
export { autenticarUsuario, mostrarPanel, verificarUsuario, cerrarSesion,formReestablecerPassword, enviarToken, reestablecerPassword, guardarPassword }