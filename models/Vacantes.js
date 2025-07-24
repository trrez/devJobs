import mongoose from "mongoose"
import slugify from "slugify"
import shortid from "shortid"

const vacanteSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: [true, 'El nombre de la vacante es obligatorio'],
        trim: true
    },
    empresa:{
        type: String,
        trim: true
    },
    ubicacion: {
        type: String,
        trim: true,
        required: [true, "La ubicación es obligatoria"]
    },
    salario: {
        type: String,
        default: 0,
        trim: true
    },
    contrato: {
        type: String,
        trim: true
    },
    descripcion: {
        type: String,
        trim: true
    },
    url: {
        type: String,
        lowercase: true,
        trim: true
    },
    skills: [String],
    candidatos: [{
        nombre: String,
        email: String,
        cv: String
    }],
    autor: {
        type: mongoose.Schema.ObjectId,
        ref: 'Usuarios',
        required: 'El autor es obligatorio'
    }
})

vacanteSchema.pre('save', async function(){
    // Crear la URL
    const slug = slugify(this.titulo, { lower: true, strict:true, remove:/[*+~.()'"!:@]/g }) 
    this.url = `${slug}-${shortid.generate()}`
})

// Añadir índice de texto para búsquedas con $text
vacanteSchema.index({
    titulo: 'text',
    descripcion: 'text',
    empresa: 'text'
  })

const Vacante =mongoose.model('Vacante', vacanteSchema)

export default Vacante