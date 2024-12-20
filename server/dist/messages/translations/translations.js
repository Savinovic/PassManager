import { availableLanguages } from '../../constants/AvailableLanguages.js';
import en from './en.json' assert { type: 'json' };
import it from './it.json' assert { type: 'json' };
export const tr = (key, language) => {
    let langData = {};
    switch (language) {
        case availableLanguages[0]:
            langData = en;
            break;
        case availableLanguages[1]:
            langData = it;
            break;
        default:
            langData = en;
    }
    return langData[key];
};
