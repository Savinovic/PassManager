import createError from 'http-errors';
import { log, config } from '../config/utilities.js';
import transporter from '../config/nodemailerOptions.js';
const sendEmail = (message) => {
    return new Promise((resolve, reject) => {
        const mailOptions = {
            from: message.from,
            to: message.to,
            subject: message.subject,
            text: message.text,
            html: message.html,
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(config.GMAIL_ADDRESS);
                console.log(config.GMAIL_PASSWORD);
                log.error('Nodemailer Error:', error.message);
                return reject(createError(500, 'Error during sending an email.'));
            }
            log.info('Email sent:', info.response);
            return resolve();
        });
    });
};
export default sendEmail;
