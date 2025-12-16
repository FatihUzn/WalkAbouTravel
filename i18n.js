/* ================================================
   WALKABOUT TRAVEL - DİL SİSTEMİ (i18n)
   Versiyon: 3.0 - Basit ve Çalışır
   ================================================ */

console.log('🌍 i18n.js yükleniyor...');

const i18n = {
  currentLang: 'tr',
  translations: {},
  isLoading: false,
  
  // Dil dosyasını yükle
  async loadLanguage(lang) {
    try {
      console.log(`📥 Dil dosyası yükleniyor: ${lang}.json`);
      
      // Önce data klasöründen dene
      let response = await fetch(`data/${lang}.json`);
      
      // Bulamazsa root'tan dene
      if (!response.ok) {
        console.log(`⚠️ data/${lang}.json bulunamadı, root'tan deneniyor...`);
        response = await fetch(`${lang}.json`);
      }
      
      if (!response.ok) {
        throw new Error(`Dil dosyası bulunamadı: ${lang}.json`);
      }
      
      this.translations[lang] = await response.json();
      console.log(`✅ Yüklendi: ${lang} (${Object.keys(this.translations[lang]).length} anahtar)`);
      return true;
      
    } catch (error) {
      console.error(`❌ Yükleme hatası (${lang}):`, error);
      return false;
    }
  },
  
  // Çeviri al
  t(key) {
    if (!this.translations[this.currentLang]) {
      console.warn(`⚠️ Dil yüklenmemiş: ${this.currentLang}`);
      return key;
    }
    
    const translation = this.translations[this.currentLang][key];
    
    if (!translation) {
      console.warn(`⚠️ Çeviri bulunamadı: "${key}" (${this.currentLang})`);
      return key;
    }
    
    return translation;
  },
  
  // Dili değiştir
  async changeLanguage(lang) {
    if (this.isLoading) {
      console.log('⏳ Dil değişimi devam ediyor...');
      return false;
    }
    
    this.isLoading = true;
    console.log(`🔄 Dil değiştiriliyor: ${this.currentLang} → ${lang}`);
    
    try {
      // Dil yüklü değilse yükle
      if (!this.translations[lang]) {
        const loaded = await this.loadLanguage(lang);
        if (!loaded) {
          throw new Error(`Dil yüklenemedi: ${lang}`);
        }
      }
      
      // Dili değiştir
      this.currentLang = lang;
      localStorage.setItem('language', lang);
      
      // Sayfayı güncelle
      this.updatePage();
      
      // HTML lang attribute
      document.documentElement.lang = lang;
      
      // RTL desteği (Arapça)
      if (lang === 'ar') {
        document.body.setAttribute('dir', 'rtl');
        document.body.classList.add('rtl');
      } else {
        document.body.setAttribute('dir', 'ltr');
        document.body.classList.remove('rtl');
      }
      
      // Aktif butonu güncelle
      this.updateButtons(lang);
      
      // Toast göster
      this.showToast(lang);
      
      // Event dispatch
      window.dispatchEvent(new CustomEvent('languageChanged', { 
        detail: { lang } 
      }));
      
      console.log(`✅ Dil değiştirildi: ${lang}`);
      return true;
      
    } catch (error) {
      console.error('❌ Dil değiştirme hatası:', error);
      alert(`Dil değiştirilemedi: ${error.message}`);
      return false;
    } finally {
      setTimeout(() => {
        this.isLoading = false;
      }, 500);
    }
  },
  
  // Sayfa içeriğini güncelle
  updatePage() {
    console.log('🔄 Sayfa güncelleniyor...');
    let count = 0;
    
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      const translation = this.t(key);
      
      if (translation !== key) {
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
          element.placeholder = translation;
        } else {
          element.textContent = translation;
        }
        count++;
      }
    });
    
    // Title güncelle
    const titleElement = document.querySelector('title');
    if (titleElement && titleElement.hasAttribute('data-i18n')) {
      const titleKey = titleElement.getAttribute('data-i18n');
      document.title = this.t(titleKey);
      count++;
    }
    
    console.log(`✅ ${count} element güncellendi`);
  },
  
  // Butonları güncelle
  updateButtons(lang) {
    document.querySelectorAll('.lang-btn').forEach(btn => {
      const btnLang = btn.getAttribute('data-lang');
      if (btnLang === lang) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  },
  
  // Toast bildirimi göster
  showToast(lang) {
    const names = {
      'tr': '✓ Türkçe',
      'en': '✓ English',
      'es': '✓ Español',
      'ru': '✓ Русский',
      'de': '✓ Deutsch',
      'ar': '✓ العربية',
      'zh': '✓ 中文'
    };
    
    // Eski toast'u kaldır
    const oldToast = document.querySelector('.language-toast');
    if (oldToast) {
      oldToast.remove();
    }
    
    // Yeni toast oluştur
    const toast = document.createElement('div');
    toast.className = 'language-toast';
    toast.textContent = names[lang] || `✓ ${lang.toUpperCase()}`;
    document.body.appendChild(toast);
    
    // Animasyon
    setTimeout(() => {
      toast.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  },
  
  // Buton event listener'larını kur
  setupButtons() {
    console.log('🔘 Dil butonları kuruluyor...');
    
    const buttons = document.querySelectorAll('.lang-btn');
    console.log(`Bulunan buton sayısı: ${buttons.length}`);
    
    buttons.forEach(button => {
      const lang = button.getAttribute('data-lang');
      
      if (!lang) {
        console.warn('⚠️ data-lang eksik:', button);
        return;
      }
      
      // Event listener ekle
      button.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        console.log(`🖱️ Tıklama: ${lang}`);
        
        // Butonu geçici kapat
        button.disabled = true;
        
        try {
          await this.changeLanguage(lang);
        } finally {
          // Butonu tekrar aç
          setTimeout(() => {
            button.disabled = false;
          }, 500);
        }
      });
      
      console.log(`✅ Listener eklendi: ${lang}`);
    });
  },
  
  // Başlatma
  async init() {
    console.log('🚀 i18n başlatılıyor...');
    
    // Kaydedilmiş dili al
    const savedLang = localStorage.getItem('language') || 'tr';
    console.log(`💾 Kaydedilmiş dil: ${savedLang}`);
    
    // Dil dosyasını yükle
    const loaded = await this.loadLanguage(savedLang);
    
    if (loaded) {
      this.currentLang = savedLang;
      this.updatePage();
      this.updateButtons(savedLang);
      
      if (savedLang === 'ar') {
        document.body.setAttribute('dir', 'rtl');
        document.body.classList.add('rtl');
      }
      
      console.log(`✅ i18n hazır (${savedLang})`);
    } else {
      console.error('❌ i18n başlatılamadı!');
    }
    
    // Butonları kur
    this.setupButtons();
  }
};

// Global'e ekle
window.i18n = i18n;

// DOM hazır olduğunda başlat
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM yüklendi, i18n başlatılıyor...');
    i18n.init();
  });
} else {
  console.log('📄 DOM zaten hazır, i18n başlatılıyor...');
  i18n.init();
}

console.log('✅ i18n.js modülü yüklendi');