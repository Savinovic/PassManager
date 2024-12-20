import nodemailer from 'nodemailer';
import { config } from './utilities.js';
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: config.GMAIL_ADDRESS,
        pass: config.GMAIL_PASSWORD,
    },
    logger: true,
    debug: true, // Mostra informazioni di debug
});
export default transporter;
