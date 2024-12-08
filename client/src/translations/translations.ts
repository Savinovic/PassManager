import { AvailableLanguages, availableLanguages } from '../constants/AppSettings'
import en from './en.json'
import it from './it.json'

export const tr = (key: string, language?: AvailableLanguages): string => {
  if (!language) language = (localStorage.getItem('language') as AvailableLanguages) || availableLanguages[0]

  let langData: { [key: string]: string } = {}

  switch (language) {
    case availableLanguages[0]:
      langData = en
      break
    case availableLanguages[1]:
      langData = it
      break
    default:
      langData = en
  }

  return langData[key]
}
