import { config } from '../config/utilities.js'
import { AvailableLanguages } from '../constants/AvailableLanguages.js'
import { tr } from './translations/translations.js'

const registerSendCodeMessage = (to: string, code: string, language: AvailableLanguages) => {
  return {
    from: `Lockify 🔐 <${config.NOREPLY_ADDRESS}>`,
    to,
    subject: `🛡️ ${tr('registerMessageSubject', language)} 🔐`,
    text: `${tr('registerMessageBody', language)} ${code}`,
    html: `${tr('registerMessageBody', language)} <h2>${code}</h2>`,
  }
}

export { registerSendCodeMessage }
