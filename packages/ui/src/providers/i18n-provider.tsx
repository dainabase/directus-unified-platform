import * as React from 'react'
import { I18nextProvider } from 'react-i18next'
import i18n from '../i18n'

export interface I18nProviderProps {
  children: React.ReactNode
  locale?: string
}

export function I18nProvider({ children, locale = 'en' }: I18nProviderProps) {
  React.useEffect(() => {
    if (locale && locale !== i18n.language) {
      i18n.changeLanguage(locale)
    }
  }, [locale])

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
}