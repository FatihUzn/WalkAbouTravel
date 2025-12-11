// i18n.js - Dil Çeviri Sistemi
// WalkAbout Travel - 2025

const i18n = {
  currentLang: 'tr',
  translations: {},
  
  async loadLanguage(lang) {
    try {
      const response = await fetch(`/data/${lang}.json`);
      if (!response.ok) throw new Error(`Dil dosyası yüklenemedi: ${lang}.json`);
      this.translations[lang] = await response.json();
      console.log(`✅ ${lang.toUpperCase()} dil dosyası yüklendi`);
      return true;
    } catch (error) {
      console.error(`❌ Dil yükleme hatası (${lang}):`, error);
      return false;
    }
  },
  
  t(key) {
    if (!this.translations[this.currentLang]) {
      console.warn(`Dil yüklenmemiş: ${this.currentLang}`);
      return key;
    }
    return this.translations[this.currentLang][key] || key;
  },
  
  async changeLanguage(lang) {
    console.log(`🌍 Dil değiştiriliyor: ${this.currentLang} → ${lang}`);
    
    if (!this.translations[lang]) {
      const loaded = await this.loadLanguage(lang);
      if (!loaded) {
        console.error(`Dil değiştirilemedi: ${lang}`);
        return false;
      }
    }
    
    this.currentLang = lang;
    localStorage.setItem('language', lang);
    this.updatePageContent();
    document.documentElement.lang = lang;
    
    if (lang === 'ar') {
      document.body.setAttribute('dir', 'rtl');
    } else {
      document.body.setAttribute('dir', 'ltr');
    }
    
    console.log(`✅ Dil değiştirildi: ${lang.toUpperCase()}`);
    return true;
  },
  
  updatePageContent() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      const translation = this.t(key);
      
      if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        element.placeholder = translation;
      } else {
        element.textContent = translation;
      }
    });
    
    const titleKey = document.querySelector('title')?.getAttribute('data-i18n');
    if (titleKey) {
      document.title = this.t(titleKey);
    }
    
    console.log('📝 Sayfa içeriği güncellendi');
  },
  
  async init(defaultLang = 'tr') {
    console.log('🚀 i18n sistemi başlatılıyor...');
    
    const savedLang = localStorage.getItem('language') || defaultLang;
    
    await this.loadLanguage(savedLang);
    this.currentLang = savedLang;
    this.updatePageContent();
    document.documentElement.lang = savedLang;
    
    if (savedLang === 'ar') {
      document.body.setAttribute('dir', 'rtl');
    }
    
    console.log(`✅ i18n hazır! Aktif dil: ${savedLang.toUpperCase()}`);
  }
};

if (typeof window !== 'undefined') {
  window.i18n = i18n;
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      i18n.init('tr');
    });
  } else {
    i18n.init('tr');
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = i18n;
}
