import mongoose from "mongoose"
import dotenv from 'dotenv'
dotenv.config({ path: ".env"})

const db = async() => {
    try {
        await mongoose.connect(process.env.DATABASE)
        console.log("Conectado a la base de datos")
    } catch (error) {
        console.log("Error en la conexion",error)
    }
}

export { db }