import { Request, Response } from 'express'
import createError from 'http-errors'
import bcrypt from 'bcryptjs';
import { totp } from 'otplib';
import Password from '../models/passwordModel.js'
import { log } from '../config/utilities.js'
import { createPasswordValidation, updatePasswordValidation } from '../validations/passwordValidation.js'
import { encryptPassword, decryptPassword, encryptSecret, decryptSecret} from '../functions/encryptDecrypt.js'
import { NEW_PASSWORD_ADDED, PASSWORD_UPDATED, PASSWORD_DELETED } from '../constants/SuccessMessages.js'
import { PASSWORD_DOES_NOT_EXIST, PASSWORD_NAME_ALREADY_EXISTS } from '../constants/ErrorMessages.js'

// GET - /passwords/getUserPasswords
const getUserPasswords = async (req: Request, res: Response) => {
  const { authenticatedUser } = res.locals

  let query = {}
  if (req.query.searchKeyword) {
    query = {
      addedBy: authenticatedUser.id,
      name: { $regex: req.query.searchKeyword, $options: 'i' },
    }
  } else query = { addedBy: authenticatedUser.id }

  let sortOrder = {}
  if (req.query.sortOrder && req.query.sortOrder === 'oldest') sortOrder = { createdAt: 1 }
  else if (req.query.sortOrder && req.query.sortOrder === 'newest') sortOrder = { createdAt: -1 }
  else if (req.query.sortOrder && req.query.sortOrder === 'ztoa') sortOrder = { name: -1 }
  else sortOrder = { name: 1 }

  const userPasswords = await Password.find(query, 'name').sort(sortOrder).exec()

  const userPasswordsFinal = userPasswords.map(element => {
    return { _id: element.id, name: element.name, totpSecret: element.totpSecret }
  })

  return res.status(200).send({ passwords: userPasswordsFinal })
}
// GET - /passwords/getUserPassword/:id
const getUserPassword = async (req: Request, res: Response) => {
  const { authenticatedUser } = res.locals

  const foundPassword = await Password.findOne({ _id: req.params.id, addedBy: authenticatedUser.id }).exec()
  if (!foundPassword) throw createError(404, PASSWORD_DOES_NOT_EXIST)

  const decryptedPassword = decryptPassword({ encryptedPassword: foundPassword.encryptedPassword, iv: foundPassword.iv })

  return res.status(200).send({ _id: foundPassword.id, password: decryptedPassword , totpSecret: foundPassword.totpSecret})
}
// POST - /passwords/createUserPassword
const createUserPassword = async (req: Request, res: Response) => {
  const { authenticatedUser } = res.locals
  const validationResult = await createPasswordValidation.validateAsync(req.body)

  const possibleDuplicates = await Password.find({ addedBy: authenticatedUser.id, name: validationResult.name }).exec()
  if (possibleDuplicates.length > 0) throw createError(409, PASSWORD_NAME_ALREADY_EXISTS)

  const { encryptedPassword, iv } = encryptPassword(validationResult.password)
  const {encryptedSecret, ivS}=encryptSecret(validationResult.secret)

  const createPassword = new Password({
    addedBy: authenticatedUser.id,
    name: validationResult.name,
    encryptedPassword: encryptedPassword,
    iv: iv,
    totpSecret: encryptedSecret,
    ivS: ivS,
  })

  await createPassword.save()

  return res.status(201).send({ message: NEW_PASSWORD_ADDED })
}
// PUT - /passwords/updateUserPassword/:id
const updateUserPassword = async (req: Request, res: Response) => {
  const { authenticatedUser } = res.locals
  const validationResult = await updatePasswordValidation.validateAsync(req.body)

  const possibleDuplicates = await Password.find({ addedBy: authenticatedUser.id, name: validationResult.name }).exec()
  if (possibleDuplicates.length > 1) throw createError(409, PASSWORD_NAME_ALREADY_EXISTS)

  const updatePassword = await Password.findOne({ _id: req.params.id, addedBy: authenticatedUser.id }).exec()
  if (!updatePassword) throw createError(404, PASSWORD_DOES_NOT_EXIST)

  const { encryptedPassword, iv } = encryptPassword(validationResult.password)

  updatePassword.name = validationResult.name
  updatePassword.encryptedPassword = encryptedPassword
  updatePassword.iv = iv
  await updatePassword.save()

  return res.status(201).send({ message: PASSWORD_UPDATED })
}
// DELETE - /passwords/deleteUserPassword/:id
const deleteUserPassword = async (req: Request, res: Response) => {
  const { authenticatedUser } = res.locals

  const deletePassword = await Password.findOne({ _id: req.params.id, addedBy: authenticatedUser.id }).exec()
  if (!deletePassword) throw createError(404, PASSWORD_DOES_NOT_EXIST)

  await deletePassword.remove()

  return res.status(200).send({ message: PASSWORD_DELETED })
}


// POST - /passwords/:id/setTotpSecret
const setTotpSecretForPassword = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // ID della voce di password
    const { totpSecret } = req.body;

    // Trova la voce di password
    const passwordEntry = await Password.findById(id);
    if (!passwordEntry) return res.status(404).send({ message: 'Password entry not found' });

    // Crittografa il segreto TOTP
    const {encryptedSecret, ivS}=encryptSecret(totpSecret)

    // Salva il segreto crittografato
    if (encryptedSecret) {
      passwordEntry.totpSecret = encryptedSecret;
    } else {
      return res.status(400).send({ message: 'Failed to encrypt TOTP secret' });
    }
    passwordEntry.ivS = ivS;
    await passwordEntry.save();

    return res.status(200).send({ message: 'TOTP secret set successfully' });
  } catch (error) {
    console.error('Error setting TOTP secret:', error);
    return res.status(500).send({ message: 'Internal server error' });
  }
};

// POST - /passwords/:id/removeTotpSecret
const removeTotpSecretForPassword = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // ID della voce di password

    // Trova la voce di password
    const passwordEntry = await Password.findById(id);
    if (!passwordEntry) return res.status(404).send({ message: 'Password entry not found' });

    // Imposta il segreto TOTP a null e la stringa IV su vuota
    passwordEntry.totpSecret = null;
    passwordEntry.ivS = '';
    await passwordEntry.save();

    return res.status(200).send({ message: 'TOTP secret removed successfully' });
  } catch (error) {
    console.error('Error removing TOTP secret:', error);
    return res.status(500).send({ message: 'Internal server error' });
  }
};

// POST - /passwords/:id/generateTotp
const generateTotpCode = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // ID della voce di password

    // Trova la voce di password
    const passwordEntry = await Password.findById(id);
    if (!passwordEntry) return res.status(404).send({ message: 'Password entry not found' });

    // Verifica che ci sia un segreto TOTP configurato
    if (!passwordEntry.totpSecret) return res.status(400).send({ message: 'No TOTP configured for this entry' });

    const {decryptedSecret} = decryptSecret({ encryptedSecret: passwordEntry.totpSecret, ivS: passwordEntry.ivS })

    // Genera un codice TOTP utilizzando il segreto decifrato
    const totpCode = totp.generate(decryptedSecret);

    return res.status(200).send({ totpCode });
  } catch (error) {
    console.error('Error generating TOTP code:', error);
    return res.status(500).send({ message: 'Internal server error' });
  }
};

// POST - /passwords/generate
const generatePassword = async (req: Request, res: Response) => {
  try {
    const { length = 12, includeNumbers = true, includeSpecial = true, includeUppercase = true } = req.body;

    if (length < 8 || length > 64) {
      return res.status(400).send({ message: 'Password length must be between 8 and 64 characters' });
    }

    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numberChars = '0123456789';
    const specialChars = '!@#$%^&*()-_=+[]{}|;:,.<>?';

    let characterPool = lowercaseChars;
    if (includeUppercase) characterPool += uppercaseChars;
    if (includeNumbers) characterPool += numberChars;
    if (includeSpecial) characterPool += specialChars;

    if (!characterPool.length) {
      return res.status(400).send({ message: 'At least one character type must be selected' });
    }

    let password = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characterPool.length);
      password += characterPool[randomIndex];
    }

    log.info('Password generated successfully');
    return res.status(200).send({ password });
  } catch (error) {
    log.error('Error generating password:', error);
    return res.status(500).send({ message: 'Internal server error' });
  }
};



export { getUserPasswords, getUserPassword, createUserPassword, updateUserPassword, deleteUserPassword, setTotpSecretForPassword, removeTotpSecretForPassword, generateTotpCode, generatePassword}
