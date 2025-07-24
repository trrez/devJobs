import dotenv from 'dotenv'
dotenv.config({ path: ".env"})

const emailConfig = {
    user: process.env.USER_MAIL,
    pass: process.env.PASS_MAIL,
    host: process.env.HOST_MAIL,
    port: process.env.PORT_MAIL
}

export default emailConfig