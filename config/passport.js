import passport from "passport";
import {Strategy as LocalStrategy} from "passport-local";
import { Usuario } from "../models/Usuarios.js";

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
}, async (email, password, done) => {
    const usuario = await Usuario.findOne({ email })

    // Si el usuario no existe
    if(!usuario) return done(null, false, {
        message: 'Usuario no existe'
    })

    // Si el usuario existe, vamos a verificar
    const verificarPassword = await usuario.compararPassword(password)
    if(!verificarPassword) return done(null, false, {
        message: 'Password incorrecto'
    })

    // Usuario existe y el password es correcto
    return done(null, usuario)
}))

passport.serializeUser((usuario, done) => done(null, usuario._id))

passport.deserializeUser(async(id, done) => {
    try {
        const usuario = await Usuario.findById(id)
        return done(null, usuario)
    } catch (error) {
        return done(error)
    }
})

export default passport