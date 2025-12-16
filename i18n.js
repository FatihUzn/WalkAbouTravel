/* ================================================
   WALKABOUT TRAVEL - DİL DEĞİŞTİRME SİSTEMİ
   FINAL VERSİYON - ÇALIŞIYOR
   ================================================ */

console.log('🚀 i18n.js yükleniyor...');

const i18n = {
  currentLang: 'tr',
  translations: {},
  isChanging: false,
  
  // Dil dosyasını yükle
  async loadLanguage(lang) {
    try {
      console.log(`📥 ${lang}.json yükleniyor...`);
      
      // Önce data/ klasöründen dene
      let response = await fetch(`data/${lang}.json`);
      
      // Bulamazsan root'tan dene
      if (!response.ok) {
        console.log(`⚠️ data/${lang}.json bulunamadı, root deneniyor...`);
        response = await fetch(`${lang}.json`);
      }
      
      if (!response.ok) {
        throw new Error(`Dil dosyası bulunamadı: ${lang}.json`);
      }
      
      this.translations[lang] = await response.json();
      console.log(`✅ ${lang} yüklendi (${Object.keys(this.translations[lang]).length} anahtar)`);
      return true;
    } catch (error) {
      console.error(`❌ ${lang} yüklenemedi:`, error);
      return false;
    }
  },
  
  // Çeviri getir
  t(key) {
    if (!this.translations[this.currentLang]) {
      console.warn(`⚠️ Dil yüklenmemiş: ${this.currentLang}`);
      return key;
    }
    
    const translation = this.translations[this.currentLang][key];
    if (!translation) {
      console.warn(`⚠️ Çeviri yok: ${key}`);
      return key;
    }
    
    return translation;
  },
  
  // Dil değiştir
  async changeLanguage(lang) {
    if (this.isChanging) {
      console.log('⏳ Dil değişimi devam ediyor...');
      return false;
    }
    
    this.isChanging = true;
    console.log(`🔄 Dil değiştiriliyor: ${this.currentLang} → ${lang}`);
    
    try {
      // Dil yüklü değilse yükle
      if (!this.translations[lang]) {
        const loaded = await this.loadLanguage(lang);
        if (!loaded) {
          throw new Error(`${lang} yüklenemedi`);
        }
      }
      
      // Dili değiştir
      this.currentLang = lang;
      localStorage.setItem('language', lang);
      document.documentElement.lang = lang;
      
      // RTL desteği (Arapça)
      if (lang === 'ar') {
        document.body.setAttribute('dir', 'rtl');
        document.body.classList.add('rtl');
      } else {
        document.body.setAttribute('dir', 'ltr');
        document.body.classList.remove('rtl');
      }
      
      // Sayfayı güncelle
      this.updatePageContent();
      this.updateActiveButton(lang);
      
      // Event gönder
      window.dispatchEvent(new CustomEvent('languageChanged', { 
        detail: { lang: lang } 
      }));
      
      console.log(`✅ Dil değiştirildi: ${lang}`);
      this.showToast(`✓ ${this.getLanguageName(lang)}`, 'success');
      
      return true;
    } catch (error) {
      console.error('❌ Dil değiştirme hatası:', error);
      this.showToast('❌ Hata!', 'error');
      return false;
    } finally {
      setTimeout(() => {
        this.isChanging = false;
      }, 500);
    }
  },
  
  // Sayfa içeriğini güncelle
  updatePageContent() {
    console.log(`🔄 Sayfa güncelleniyor (${this.currentLang})...`);
    let count = 0;
    
    // Tüm data-i18n elementleri
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      const translation = this.t(key);
      
      // Input/Textarea placeholder
      if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        if (element.placeholder !== translation) {
          element.placeholder = translation;
          count++;
        }
      } 
      // Diğer elementler
      else {
        if (element.textContent !== translation) {
          element.textContent = translation;
          count++;
        }
      }
    });
    
    // Title güncelle
    const titleElement = document.querySelector('title');
    if (titleElement) {
      const titleKey = titleElement.getAttribute('data-i18n') || 'title';
      document.title = this.t(titleKey);
      count++;
    }
    
    console.log(`✅ ${count} element güncellendi`);
  },
  
  // Aktif butonu işaretle
  updateActiveButton(lang) {
    document.querySelectorAll('.lang-btn').forEach(btn => {
      if (btn.getAttribute('data-lang') === lang) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    console.log(`✅ Aktif buton: ${lang}`);
  },
  
  // Butonları başlat
  initButtons() {
    console.log('🔘 Dil butonları başlatılıyor...');
    
    const buttons = document.querySelectorAll('.lang-btn');
    console.log(`📍 ${buttons.length} dil butonu bulundu`);
    
    if (buttons.length === 0) {
      console.error('❌ HİÇ DİL BUTONU BULUNAMADI!');
      console.log('💡 HTML\'de şu yapıyı kontrol edin:');
      console.log('   <button class="lang-btn" data-lang="tr">TR</button>');
      return;
    }
    
    // Her butona listener ekle
    buttons.forEach((btn, index) => {
      const lang = btn.getAttribute('data-lang');
      
      if (!lang) {
        console.warn(`⚠️ Buton ${index + 1}: data-lang eksik!`);
        return;
      }
      
      // Eski listener'ları temizle (clone ile)
      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);
      
      // Yeni listener ekle
      newBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        console.log(`🖱️ BUTON TIKLANDI: ${lang.toUpperCase()}`);
        
        if (this.currentLang === lang) {
          console.log('⚠️ Bu dil zaten aktif');
          return;
        }
        
        this.changeLanguage(lang);
      });
      
      console.log(`✅ Buton ${index + 1} hazır: ${lang.toUpperCase()}`);
    });
    
    console.log('✅ Tüm butonlar hazır!');
  },
  
  // Başlat
  async init(defaultLang = 'tr') {
    console.log('🚀 i18n başlatılıyor...');
    console.log(`🌍 Varsayılan dil: ${defaultLang}`);
    
    // localStorage'dan kayıtlı dili al
    const savedLang = localStorage.getItem('language') || defaultLang;
    console.log(`💾 Kaydedilmiş dil: ${savedLang}`);
    
    // Dil dosyasını yükle
    const loaded = await this.loadLanguage(savedLang);
    
    if (loaded) {
      this.currentLang = savedLang;
      document.documentElement.lang = savedLang;
      
      // RTL desteği
      if (savedLang === 'ar') {
        document.body.setAttribute('dir', 'rtl');
        document.body.classList.add('rtl');
      }
      
      // Sayfayı güncelle
      this.updatePageContent();
      this.updateActiveButton(savedLang);
      
      console.log(`✅ i18n başlatıldı (${savedLang})`);
    } else {
      console.error('❌ i18n başlatılamadı!');
    }
    
    // Butonları başlat
    console.log('⏳ Butonlar başlatılıyor...');
    
    // DOM hazır mı kontrol et
    if (document.readyState === 'loading') {
      console.log('⏳ DOM henüz hazır değil, bekleniyor...');
      document.addEventListener('DOMContentLoaded', () => {
        console.log('✅ DOM hazır!');
        this.initButtons();
      });
    } else {
      console.log('✅ DOM zaten hazır!');
      this.initButtons();
    }
  },
  
  // Dil ismi al
  getLanguageName(lang) {
    const names = {
      'tr': 'Türkçe',
      'en': 'English',
      'es': 'Español',
      'ru': 'Русский',
      'de': 'Deutsch',
      'ar': 'العربية',
      'zh': '中文'
    };
    return names[lang] || lang.toUpperCase();
  },
  
  // Toast bildirimi göster
  showToast(message, type = 'success') {
    // Eski toast'u kaldır
    const existing = document.querySelector('.language-toast');
    if (existing) existing.remove();
    
    // Yeni toast oluştur
    const toast = document.createElement('div');
    toast.className = `language-toast ${type}`;
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      background: ${type === 'success' ? '#38bdf8' : '#ef4444'};
      color: white;
      padding: 15px 25px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 14px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      z-index: 10000;
      opacity: 0;
      transform: translateX(100px);
      transition: all 0.3s ease;
      pointer-events: none;
    `;
    document.body.appendChild(toast);
    
    // Göster
    setTimeout(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(0)';
    }, 10);
    
    // Gizle ve kaldır
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100px)';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
};

// Global olarak ekle
if (typeof window !== 'undefined') {
  window.i18n = i18n;
  console.log('✅ i18n global olarak tanımlandı (window.i18n)');
  
  // Debug için
  window.testLanguage = function(lang) {
    console.log(`🧪 Test: ${lang}`);
    if (window.i18n) {
      window.i18n.changeLanguage(lang);
    } else {
      console.error('❌ i18n bulunamadı!');
    }
  };
  
  console.log('💡 Test için konsola yazın: testLanguage("en")');
}

// Node.js uyumluluğu
if (typeof module !== 'undefined' && module.exports) {
  module.exports = i18n;
}

console.log('✅ i18n.js yükleme tamamlandı!');