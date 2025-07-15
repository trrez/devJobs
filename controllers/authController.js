import passport from "passport";
import Vacante from "../models/Vacantes.js";
import mongoose from "mongoose";

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

export { autenticarUsuario, mostrarPanel, verificarUsuario, cerrarSesion }