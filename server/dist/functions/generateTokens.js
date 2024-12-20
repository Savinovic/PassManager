import jwt from 'jsonwebtoken';
import createError from 'http-errors';
import { config, log } from '../config/utilities.js';
const getAccessToken = (userId, userEmail) => {
    return new Promise((resolve, reject) => {
        jwt.sign({
            id: userId,
            email: userEmail,
        }, config.JWT_ACCESS_TOKEN_SECRET, { expiresIn: '600s' }, (error, token) => {
            if (error) {
                log.error(error.message);
                return reject(createError(500, 'Error during generating an access token.'));
            }
            return resolve(token);
        });
    });
};
const getRefreshToken = (userId, userEmail) => {
    return new Promise((resolve, reject) => {
        jwt.sign({
            id: userId,
            email: userEmail,
        }, config.JWT_REFRESH_TOKEN_SECRET, { expiresIn: '900s' }, (error, token) => {
            if (error) {
                log.error(error.message);
                return reject(createError(500, 'Error during generating a refresh token.'));
            }
            return resolve(token);
        });
    });
};
export { getAccessToken, getRefreshToken };
