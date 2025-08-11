import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import enTranslation from './locales/en.json'
import frTranslation from './locales/fr.json'
import esTranslation from './locales/es.json'
import deTranslation from './locales/de.json'
import arTranslation from './locales/ar.json'

export const resources = {
  en: { translation: enTranslation },
  fr: { translation: frTranslation },
  es: { translation: esTranslation },
  de: { translation: deTranslation },
  ar: { translation: arTranslation },
}

export const supportedLanguages = [
  { code: 'en', name: 'English', dir: 'ltr' },
  { code: 'fr', name: 'Français', dir: 'ltr' },
  { code: 'es', name: 'Español', dir: 'ltr' },
  { code: 'de', name: 'Deutsch', dir: 'ltr' },
  { code: 'ar', name: 'العربية', dir: 'rtl' },
]

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  })

export default i18n

// Helper hooks
import { useTranslation as useI18nTranslation } from 'react-i18next'

export const useTranslation = () => {
  const { t, i18n } = useI18nTranslation()
  
  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang)
    const language = supportedLanguages.find(l => l.code === lang)
    if (language) {
      document.documentElement.dir = language.dir
      document.documentElement.lang = language.code
    }
  }
  
  return {
    t,
    i18n,
    changeLanguage,
    currentLanguage: i18n.language,
    languages: supportedLanguages,
  }
}