import emailConfig from "../config/email.js";
import nodemailer from 'nodemailer'
import hbs from 'nodemailer-express-handlebars'
import util from 'util'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import path from "path";

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const transport = nodemailer.createTransport({
    host: emailConfig.host,
    port: emailConfig.port,
    auth: {
        user : emailConfig.user,
        pass : emailConfig.pass,
    }
})

// Utilizar templates de handlebars
transport.use('compile', hbs({
    viewEngine: {
        extName: '.handlebars',
        partialsDir: path.join(__dirname, './../views/emails'),
        defaultLayout: false
},
    viewPath : path.resolve(__dirname, './../views/emails'),
    extName: '.handlebars'
}))

const enviarEmail = async(opciones) => {
    const opcionesEmail = {
        from : 'devJobs <noreply@devjobs.com',
        to: opciones.usuario.email,
        subject: opciones.subject,
        template: opciones.archivo,
        context: {
            resetUrl: opciones.resetUrl
        }
    }

    const sendMail = util.promisify(transport.sendMail, transport)
    return sendMail.call(transport, opcionesEmail)
}

export { enviarEmail }