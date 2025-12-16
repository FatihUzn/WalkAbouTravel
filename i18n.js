// i18n.js - Dil Çeviri Sistemi (DÜZELTİLMİŞ)
// WalkAbout Travel - 2025

const i18n = {
  currentLang: 'tr',
  translations: {},
  
  async loadLanguage(lang) {
    try {
      console.log(`📥 Yükleniyor: ${lang}.json`);
      
      // Try data folder first
      let response = await fetch(`data/${lang}.json`);
      
      // If not found, try root
      if (!response.ok) {
        console.log(`⚠️ data/${lang}.json bulunamadı, root dizininde deneniyor...`);
        response = await fetch(`${lang}.json`);
      }
      
      if (!response.ok) {
        throw new Error(`Language file not found: ${lang}.json`);
      }
      
      this.translations[lang] = await response.json();
      console.log(`✅ Dil yüklendi: ${lang}`, Object.keys(this.translations[lang]).length, 'anahtar');
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
    
    // Hem noktalı hem alt çizgili anahtarları dene
    let translation = this.translations[this.currentLang][key];
    
    // Noktalı anahtar yoksa, alt çizgiliye çevir (nav.home → nav_home)
    if (!translation) {
      const underscoreKey = key.replace(/\./g, '_');
      translation = this.translations[this.currentLang][underscoreKey];
    }
    
    // Alt çizgili yoksa, noktalıya çevir (nav_home → nav.home)
    if (!translation) {
      const dotKey = key.replace(/_/g, '.');
      translation = this.translations[this.currentLang][dotKey];
    }
    
    if (!translation) {
      console.warn(`⚠️ Çeviri bulunamadı: ${key} (${this.currentLang})`);
      return key;
    }
    
    return translation;
  },
  
  async changeLanguage(lang) {
    console.log(`🔄 Dil değiştiriliyor: ${this.currentLang} → ${lang}`);
    
    // Load language if not already loaded
    if (!this.translations[lang]) {
      const loaded = await this.loadLanguage(lang);
      if (!loaded) {
        console.error(`❌ Dil değiştirilemedi: ${lang}`);
        alert(`Dil dosyası yüklenemedi: ${lang}`);
        return false;
      }
    }
    
    // Change language
    this.currentLang = lang;
    localStorage.setItem('language', lang);
    
    // Update page
    this.updatePageContent();
    
    // Update HTML lang attribute
    document.documentElement.lang = lang;
    
    // RTL support (Arabic)
    if (lang === 'ar') {
      document.body.setAttribute('dir', 'rtl');
      document.body.classList.add('rtl');
    } else {
      document.body.setAttribute('dir', 'ltr');
      document.body.classList.remove('rtl');
    }
    
    // Update active button
    this.updateActiveButton(lang);
    
    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent('languageChanged', { 
      detail: { lang: lang } 
    }));
    
    console.log(`✅ Dil başarıyla değiştirildi: ${lang}`);
    return true;
  },
  
  updatePageContent() {
    console.log(`🔄 Sayfa içeriği güncelleniyor (${this.currentLang})...`);
    let updateCount = 0;
    
    // Find and update all elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      const translation = this.t(key);
      
      // Input and textarea placeholder
      if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        if (element.placeholder !== translation) {
          element.placeholder = translation;
          updateCount++;
        }
      } 
      // Other elements textContent
      else {
        if (element.textContent !== translation) {
          element.textContent = translation;
          updateCount++;
        }
      }
    });
    
    // Update title
    const titleElement = document.querySelector('title');
    if (titleElement) {
      const titleKey = titleElement.getAttribute('data-i18n') || 'title';
      const titleTranslation = this.t(titleKey);
      if (titleTranslation !== titleKey && document.title !== titleTranslation) {
        document.title = titleTranslation;
        updateCount++;
      }
    }
    
    console.log(`✅ ${updateCount} element güncellendi`);
  },
  
  updateActiveButton(lang) {
    // Remove active class from all buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    
    // Add active class to selected button
    const activeBtn = document.querySelector(`.lang-btn[data-lang="${lang}"]`);
    if (activeBtn) {
      activeBtn.classList.add('active');
      console.log(`✅ Aktif buton işaretlendi: ${lang}`);
    } else {
      console.warn(`⚠️ Buton bulunamadı: ${lang}`);
    }
  },
  
  async init(defaultLang = 'tr') {
    console.log('🚀 i18n başlatılıyor...');
    
    // Get saved language from localStorage
    const savedLang = localStorage.getItem('language') || defaultLang;
    
    console.log(`📌 Kaydedilmiş dil: ${savedLang}`);
    
    // Load language file
    const loaded = await this.loadLanguage(savedLang);
    
    if (loaded) {
      this.currentLang = savedLang;
      this.updatePageContent();
      document.documentElement.lang = savedLang;
      
      // RTL support
      if (savedLang === 'ar') {
        document.body.setAttribute('dir', 'rtl');
        document.body.classList.add('rtl');
      }
      
      // Mark active button
      this.updateActiveButton(savedLang);
      
      console.log(`✅ i18n başlatıldı (${savedLang})`);
      
      // Setup language buttons after init
      this.setupLanguageButtons();
    } else {
      console.error('❌ i18n başlatılamadı!');
    }
  },
  
  setupLanguageButtons() {
    console.log('🔘 Dil butonları kuruluyor...');
    
    document.querySelectorAll('.lang-btn').forEach(button => {
      const lang = button.getAttribute('data-lang');
      
      if (!lang) {
        console.warn('⚠️ data-lang özelliği eksik:', button);
        return;
      }
      
      // Remove old listeners by cloning
      const newButton = button.cloneNode(true);
      button.parentNode.replaceChild(newButton, button);
      
      // Add new listener
      newButton.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        console.log(`🖱️ Dil butonu tıklandı: ${lang}`);
        
        // Disable button temporarily
        newButton.disabled = true;
        
        try {
          const success = await this.changeLanguage(lang);
          
          if (success) {
            // Show success message
            this.showToast(`✓ ${this.getLanguageName(lang)}`);
          } else {
            alert(`Dil değiştirilemedi: ${lang}`);
          }
        } catch (error) {
          console.error('❌ Dil değiştirme hatası:', error);
          alert('Dil değiştirirken bir hata oluştu!');
        } finally {
          // Re-enable button
          newButton.disabled = false;
        }
      });
      
      console.log(`✅ Event listener eklendi: ${lang}`);
    });
  },
  
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
  
  showToast(message) {
    // Remove existing toast
    const existingToast = document.querySelector('.language-toast');
    if (existingToast) {
      existingToast.remove();
    }
    
    // Create new toast
    const toast = document.createElement('div');
    toast.className = 'language-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // Show toast
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Hide and remove toast
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
};

// Add to global window
if (typeof window !== 'undefined') {
  window.i18n = i18n;
  console.log('📦 i18n modülü yüklendi');
}

// Node.js compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = i18n;
}