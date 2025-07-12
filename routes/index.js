import express from "express"
import { mostrarTrabajos } from "../controllers/homeController.js"
import { formularioNuevaVacante,agregarVacante, mostrarVacantes } from "../controllers/vacantesController.js"

const router = express.Router()

router.get("/", mostrarTrabajos)
router.get('/vacantes/nueva', formularioNuevaVacante)
router.post('/vacantes/nueva', agregarVacante)
// Mostrar vacantes (singular)
router.get('/vacantes/:url', mostrarVacantes)

export default router