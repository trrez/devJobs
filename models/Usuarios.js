import mongoose from "mongoose"
import bcrypt from "bcrypt"

const usuarioSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true
    },
    nombre: {
        type: String,
        required: [true, 'Agrega tu nombre'],
    },
    password:{
        type: String,
        required: true,
        trim: true
    },
    token: String,
    expira: Date,
    imagen: String
})

// Metodo para hashear los passwords
usuarioSchema.pre('save', async function(next) {
    // si el password ya esta hasheado
    if(!this.isModified('password')){
        return next()
    }
    // si no esta hasheado
    try {
        const salt = await bcrypt.genSaltSync(12)
        this.password = await bcrypt.hash(this.password, salt)
        next()
    } catch (error) {
        next(error)
    }
})

usuarioSchema.post('save', function(error, doc, next){
    if(error.name === "MongoServerError" && error.code === 11000){
        next('Este correo ya esta registrado')
    }else{
        next(error)
    }
})

// Autenticar Usuarios
usuarioSchema.methods = {
    compararPassword: async function(password){
        return await bcrypt.compare(password, this.password)
    }
}

const Usuario = mongoose.model('Usuarios', usuarioSchema)

export { Usuario }