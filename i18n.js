/* ================================================
   WALKABOUT TRAVEL - DİL DEĞİŞTİRME SİSTEMİ
   BÜYÜK/KÜÇÜK HARF UYUMLU - TÜM DİLLER ÇALIŞIYOR
   ================================================ */

console.log('🚀 i18n.js yükleniyor...');

const i18n = {
  currentLang: 'tr',
  translations: {},
  isChanging: false,
  
  // Dil dosyasını yükle (büyük/küçük harf uyumlu)
  async loadLanguage(lang) {
    try {
      console.log(`📥 ${lang}.json yükleniyor...`);
      
      // Dosya ismi varyantları
      const variants = [
        lang.toLowerCase(),                                    // tr, en, es, ru, de
        lang.toUpperCase(),                                    // TR, EN, ES, RU, DE
        lang.charAt(0).toUpperCase() + lang.slice(1).toLowerCase()  // Tr, En, Es, Ru, De
      ];
      
      let response = null;
      let loadedFrom = '';
      
      // ÖNCE data/ klasöründe ara
      for (const variant of variants) {
        try {
          response = await fetch(`data/${variant}.json`);
          if (response.ok) {
            loadedFrom = `data/${variant}.json`;
            console.log(`✅ Bulundu: ${loadedFrom}`);
            break;
          }
        } catch (e) {
          // Sessizce devam
        }
      }
      
      // Bulunamadıysa root'ta ara
      if (!response || !response.ok) {
        console.log(`⚠️ data/ klasöründe bulunamadı, root deneniyor...`);
        for (const variant of variants) {
          try {
            response = await fetch(`${variant}.json`);
            if (response.ok) {
              loadedFrom = `${variant}.json`;
              console.log(`✅ Bulundu: ${loadedFrom}`);
              break;
            }
          } catch (e) {
            // Sessizce devam
          }
        }
      }
      
      // Hiçbir yerde bulunamadı
      if (!response || !response.ok) {
        throw new Error(`Dil dosyası bulunamadı: ${variants.join(', ')}.json`);
      }
      
      this.translations[lang] = await response.json();
      console.log(`✅ ${lang.toUpperCase()} yüklendi: ${loadedFrom} (${Object.keys(this.translations[lang]).length} anahtar)`);
      return true;
    } catch (error) {
      console.error(`❌ ${lang.toUpperCase()} yüklenemedi:`, error);
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
      
      console.log(`✅ Dil değiştirildi: ${lang.toUpperCase()}`);
      this.showToast(`✓ ${this.getLanguageName(lang)}`, 'success');
      
      return true;
    } catch (error) {
      console.error('❌ Dil değiştirme hatası:', error);
      this.showToast(`❌ ${lang.toUpperCase()} yüklenemedi!`, 'error');
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
    console.log(`✅ Aktif buton: ${lang.toUpperCase()}`);
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
      
      console.log(`✅ i18n başlatıldı (${savedLang.toUpperCase()})`);
    } else {
      console.error('❌ i18n başlatılamadı!');
    }
    
    // NOT: Butonlar artık index.html'den başlatılıyor!
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
    console.log(`🧪 Test: ${lang.toUpperCase()}`);
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
