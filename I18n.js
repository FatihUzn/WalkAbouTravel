// i18n.js - Dil Çeviri Sistemi (DÜZELTİLMİŞ)
// WalkAbout Travel - 2025

const i18n = {
  currentLang: 'tr',
  translations: {},
  
  async loadLanguage(lang) {
    try {
      console.log(`🔄 Dil dosyası yükleniyor: ${lang}.json`);
      
      // Önce data klasöründen deneyelim
      let response = await fetch(`data/${lang}.json`);
      
      // Eğer data klasörü yoksa, root'tan deneyelim
      if (!response.ok) {
        response = await fetch(`${lang}.json`);
      }
      
      if (!response.ok) {
        throw new Error(`Dil dosyası yüklenemedi: ${lang}.json`);
      }
      
      this.translations[lang] = await response.json();
      console.log(`✅ ${lang.toUpperCase()} dil dosyası başarıyla yüklendi`);
      console.log(`📦 ${Object.keys(this.translations[lang]).length} çeviri yüklendi`);
      return true;
    } catch (error) {
      console.error(`❌ Dil yükleme hatası (${lang}):`, error);
      return false;
    }
  },
  
  t(key) {
    if (!this.translations[this.currentLang]) {
      console.warn(`⚠️ Dil yüklenmemiş: ${this.currentLang}`);
      return key;
    }
    
    const translation = this.translations[this.currentLang][key];
    if (!translation) {
      console.warn(`⚠️ Çeviri bulunamadı: ${key} (${this.currentLang})`);
      return key;
    }
    
    return translation;
  },
  
  async changeLanguage(lang) {
    console.log(`🌍 Dil değiştiriliyor: ${this.currentLang} → ${lang}`);
    
    // Eğer dil yüklü değilse, önce yükle
    if (!this.translations[lang]) {
      const loaded = await this.loadLanguage(lang);
      if (!loaded) {
        console.error(`❌ Dil değiştirilemedi: ${lang}`);
        alert(`Dil dosyası yüklenemedi: ${lang}. Lütfen sayfayı yenileyin.`);
        return false;
      }
    }
    
    // Dili değiştir
    this.currentLang = lang;
    localStorage.setItem('language', lang);
    
    // Sayfayı güncelle
    this.updatePageContent();
    
    // HTML lang attribute'unu güncelle
    document.documentElement.lang = lang;
    
    // RTL desteği (Arapça için)
    if (lang === 'ar') {
      document.body.setAttribute('dir', 'rtl');
      document.body.classList.add('rtl');
    } else {
      document.body.setAttribute('dir', 'ltr');
      document.body.classList.remove('rtl');
    }
    
    // Aktif butonu güncelle
    this.updateActiveButton(lang);
    
    console.log(`✅ Dil başarıyla değiştirildi: ${lang.toUpperCase()}`);
    return true;
  },
  
  updatePageContent() {
    console.log('📝 Sayfa içeriği güncelleniyor...');
    let updatedCount = 0;
    
    // Tüm data-i18n attribute'larını bul ve güncelle
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      const translation = this.t(key);
      
      // Input ve textarea için placeholder
      if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        element.placeholder = translation;
      } 
      // Select için option'ları güncelle
      else if (element.tagName === 'SELECT') {
        // Select için özel işlem gerekebilir
        element.textContent = translation;
      }
      // Diğer elementler için textContent
      else {
        element.textContent = translation;
      }
      
      updatedCount++;
    });
    
    // Title'ı güncelle
    const titleElement = document.querySelector('title');
    if (titleElement) {
      const titleKey = titleElement.getAttribute('data-i18n') || 'title';
      const titleTranslation = this.t(titleKey);
      if (titleTranslation !== titleKey) {
        document.title = titleTranslation;
      }
    }
    
    console.log(`✅ ${updatedCount} element güncellendi`);
  },
  
  updateActiveButton(lang) {
    // Tüm dil butonlarından active class'ını kaldır
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    
    // Seçili dil butonuna active class'ı ekle
    const activeBtn = document.querySelector(`.lang-btn[data-lang="${lang}"]`);
    if (activeBtn) {
      activeBtn.classList.add('active');
    }
  },
  
  async init(defaultLang = 'tr') {
    console.log('🚀 i18n sistemi başlatılıyor...');
    
    // localStorage'dan kaydedilmiş dili al
    const savedLang = localStorage.getItem('language') || defaultLang;
    console.log(`💾 Kaydedilmiş dil: ${savedLang}`);
    
    // Dil dosyasını yükle
    const loaded = await this.loadLanguage(savedLang);
    
    if (loaded) {
      this.currentLang = savedLang;
      this.updatePageContent();
      document.documentElement.lang = savedLang;
      
      // RTL desteği
      if (savedLang === 'ar') {
        document.body.setAttribute('dir', 'rtl');
        document.body.classList.add('rtl');
      }
      
      // Aktif butonu işaretle
      this.updateActiveButton(savedLang);
      
      console.log(`✅ i18n hazır! Aktif dil: ${savedLang.toUpperCase()}`);
    } else {
      console.error('❌ i18n başlatılamadı!');
    }
  }
};

// Global window'a ekle
if (typeof window !== 'undefined') {
  window.i18n = i18n;
  
  // Sayfa yüklendiğinde başlat
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      console.log('📄 DOM yüklendi, i18n başlatılıyor...');
      i18n.init('tr');
    });
  } else {
    console.log('📄 DOM zaten yüklü, i18n başlatılıyor...');
    i18n.init('tr');
  }
}

// Node.js uyumluluğu
if (typeof module !== 'undefined' && module.exports) {
  module.exports = i18n;
}

console.log('✅ i18n.js yüklendi');
