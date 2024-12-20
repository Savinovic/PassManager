import { isValidObjectId } from 'mongoose';
import createError from 'http-errors';
import { UNPROCESSABLE_ENTITY } from '../constants/ErrorMessages.js';
const isValidId = (a, b) => (req, _res, next) => {
    if (!req.params)
        return next(createError(422, UNPROCESSABLE_ENTITY));
    if (a !== null)
        if (!isValidObjectId(eval('req.params.' + a)))
            return next(createError(422, UNPROCESSABLE_ENTITY));
    if (b !== null)
        if (!isValidObjectId(eval('req.params.' + b)))
            return next(createError(422, UNPROCESSABLE_ENTITY));
    return next();
};
export { isValidId };
