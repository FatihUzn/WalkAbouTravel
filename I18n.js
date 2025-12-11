// i18n.js - Dil Çeviri Sistemi
// WalkAbout Travel - 2025

const i18n = {
  // Varsayılan dili İngilizce yaptık (TR silindiği için)
  currentLang: 'en',
  translations: {},
  
  // Dil dosyasını yükle
  async loadLanguage(lang) {
    try {
      const response = await fetch(`${lang}.json`);
      if (!response.ok) throw new Error(`Dil dosyası yüklenemedi: ${lang}.json`);
      this.translations[lang] = await response.json();
      console.log(`✅ ${lang.toUpperCase()} dil dosyası yüklendi`, this.translations[lang]);
      return true;
    } catch (error) {
      console.error(`❌ Dil yükleme hatası (${lang}):`, error);
      return false;
    }
  },
  
  // Çeviri anahtarını getir
  t(key) {
    if (!this.translations[this.currentLang]) {
      console.warn(`Dil yüklenmemiş: ${this.currentLang}`);
      return key;
    }
    return this.translations[this.currentLang][key] || key;
  },
  
  // Dili değiştir
  async changeLanguage(lang) {
    console.log(`🌍 Dil değiştiriliyor: ${this.currentLang} → ${lang}`);
    
    // Dil dosyası yüklü değilse yükle
    if (!this.translations[lang]) {
      const loaded = await this.loadLanguage(lang);
      if (!loaded) {
        console.error(`Dil değiştirilemedi: ${lang}`);
        return false;
      }
    }
    
    // Mevcut dili güncelle
    this.currentLang = lang;
    
    // localStorage'a kaydet
    localStorage.setItem('language', lang);
    
    // Sayfayı güncelle
    this.updatePageContent();
    
    // HTML lang attribute
    document.documentElement.lang = lang;
    
    // RTL desteği (Arapça için)
    if (lang === 'ar') {
      document.body.setAttribute('dir', 'rtl');
    } else {
      document.body.setAttribute('dir', 'ltr');
    }
    
    console.log(`✅ Dil değiştirildi: ${lang.toUpperCase()}`);
    return true;
  },
  
  // Sayfa içeriğini güncelle
  updatePageContent() {
    // Tüm data-i18n elementlerini güncelle
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      const translation = this.t(key);
      
      if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        element.placeholder = translation;
      } else {
        element.textContent = translation;
      }
    });
    
    // Title güncelle
    const titleKey = document.querySelector('title')?.getAttribute('data-i18n');
    if (titleKey) {
      document.title = this.t(titleKey);
    }
    
    console.log('📝 Sayfa içeriği güncellendi');
  },
  
  // Başlangıç
  // Varsayılan dil parametresi 'en' olarak güncellendi
  async init(defaultLang = 'en') {
    console.log('🚀 i18n sistemi başlatılıyor...');
    
    // localStorage'dan dil tercihi
    const savedLang = localStorage.getItem('language') || defaultLang;
    
    // Varsayılan dili yükle
    await this.loadLanguage(savedLang);
    this.currentLang = savedLang;
    
    // Sayfa içeriğini güncelle
    this.updatePageContent();
    
    // HTML lang attribute
    document.documentElement.lang = savedLang;
    
    // RTL desteği
    if (savedLang === 'ar') {
      document.body.setAttribute('dir', 'rtl');
    }
    
    console.log(`✅ i18n hazır! Aktif dil: ${savedLang.toUpperCase()}`);
  }
};

// Sayfa yüklendiğinde başlat
if (typeof window !== 'undefined') {
  window.i18n = i18n;
  
  // DOM hazır olduğunda çalıştır
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      // Init fonksiyonu artık varsayılan olarak İngilizce açılacak
      i18n.init();
    });
  } else {
    i18n.init();
  }
}

// Export (modül olarak kullanılırsa)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = i18n;
}
