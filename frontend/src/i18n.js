import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import sw from './locales/sw.json';
import fr from './locales/fr.json';
import ha from './locales/ha.json';

const RTL_LOCALES = ['ar'];

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, sw: { translation: sw }, fr: { translation: fr }, ha: { translation: ha } },
  lng: localStorage.getItem('afripay_lang') || 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false }
});

i18n.on('languageChanged', (lng) => {
  document.documentElement.dir = RTL_LOCALES.includes(lng) ? 'rtl' : 'ltr';
});

if (typeof document !== 'undefined') {
  document.documentElement.dir = RTL_LOCALES.includes(i18n.language) ? 'rtl' : 'ltr';
}

export default i18n;
