import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en/translation.json';
import sw from './locales/sw/translation.json';
import fr from './locales/fr/translation.json';
import ha from './locales/ha/translation.json';
import yo from './locales/yo/translation.json';

const savedLanguage = typeof window !== 'undefined' ? localStorage.getItem('afripay_lang') : null;
const initialLanguage = savedLanguage || 'en';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    sw: { translation: sw },
    fr: { translation: fr },
    ha: { translation: ha },
    yo: { translation: yo }
  },
  lng: initialLanguage,
  fallbackLng: 'en',
  interpolation: { escapeValue: false }
});

export default i18n;
