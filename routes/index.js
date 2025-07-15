import express from "express"
import { mostrarTrabajos } from "../controllers/homeController.js"
import { formularioNuevaVacante,agregarVacante, mostrarVacantes, formEditarVacante, editarVacante , validarVacante, eliminarVacante} from "../controllers/vacantesController.js"
import { formCrearCuenta,crearUsuario, validarRegistro,formIniciarSesion, formEditarPerfil, editarPerfil, validarPerfil , subirImagen} from "../controllers/usuarioController.js"
import { autenticarUsuario, mostrarPanel, verificarUsuario, cerrarSesion } from "../controllers/authController.js"

const router = express.Router()

router.get("/", mostrarTrabajos)

router.get('/vacantes/nueva', verificarUsuario, formularioNuevaVacante)
router.post('/vacantes/nueva', verificarUsuario, validarVacante, agregarVacante)
// Mostrar vacantes (singular)
router.get('/vacantes/:url', mostrarVacantes)

// Editar vacante
router.get('/vacante/editar/:url', verificarUsuario, formEditarVacante)

// Actualizar vacante
router.post('/vacantes/editar/:url', verificarUsuario, validarVacante, editarVacante)

// Eliminar Vacante
router.delete('/vacantes/eliminar/:id', eliminarVacante)

// Crear Cuentas
router.get('/crear-cuenta', formCrearCuenta)
router.post('/crear-cuenta',
    validarRegistro, 
    crearUsuario
)

// Autentificar Usuarios
router.get('/iniciar-sesion', formIniciarSesion)
router.post('/iniciar-sesion', autenticarUsuario)

// Cerrar Sesion
router.get('/cerrar-sesion', verificarUsuario, cerrarSesion)

// Panel de administracion
router.get("/administracion", verificarUsuario, mostrarPanel)

// Editar Perfil
router.get('/editar-perfil', verificarUsuario, formEditarPerfil)
router.post("/editar-perfil", 
    verificarUsuario, 
    //validarPerfil,
    subirImagen, 
    editarPerfil)



export default router