import { DEFAULT_LANGUAGE, PATHS } from '../config/constants.js';

const translations = {};

export async function setLanguage(lang) {
  let langData;
  
  if (translations[lang]) {
    langData = translations[lang];
  } else {
    try {
      const response = await fetch(`${PATHS.LANGUAGES}${lang}.json`);
      if (!response.ok) throw new Error(`Dil dosyası bulunamadı: ${lang}`);
      
      langData = await response.json();
      translations[lang] = langData;
    } catch (error) {
      console.warn("Dil yüklenemedi, varsayılan (TR) kullanılıyor:", error);
      if (lang !== DEFAULT_LANGUAGE) {
        await setLanguage(DEFAULT_LANGUAGE);
      }
      return;
    }
  }
  
  // HTML ve Yön Ayarı
  document.documentElement.lang = lang;
  document.documentElement.dir = (lang === 'ar') ? 'rtl' : 'ltr';

  // Metinleri Güncelle
  document.querySelectorAll('[data-key]').forEach(el => {
    const key = el.getAttribute('data-key');
    if (langData && langData[key]) {
      // Güvenli HTML ekleme
      el.innerHTML = langData[key];
    }
  });
  
  // Aktif Dil Butonunu Güncelle
  document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.lang === lang) btn.classList.add('active');
  });

  localStorage.setItem('lang', lang);
}

export function getCurrentLanguage() {
    return localStorage.getItem('lang') || DEFAULT_LANGUAGE;
}