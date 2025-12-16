// i18n.js - Dil Çeviri Sistemi (DÜZELTİLMİŞ - BUTONLAR ÇALIŞIYOR)
// WalkAbout Travel - 2025

const i18n = {
  currentLang: 'tr',
  translations: {},
  isChanging: false,
  
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
    
    const translation = this.translations[this.currentLang][key];
    
    if (!translation) {
      console.warn(`⚠️ Çeviri bulunamadı: ${key} (${this.currentLang})`);
      return key;
    }
    
    return translation;
  },
  
  async changeLanguage(lang) {
    // Çift tıklama önleme
    if (this.isChanging) {
      console.log('⏳ Dil değişimi devam ediyor, lütfen bekleyin...');
      return false;
    }
    
    this.isChanging = true;
    
    try {
      console.log(`🔄 Dil değiştiriliyor: ${this.currentLang} → ${lang}`);
      
      // Load language if not already loaded
      if (!this.translations[lang]) {
        const loaded = await this.loadLanguage(lang);
        if (!loaded) {
          console.error(`❌ Dil değiştirilemedi: ${lang}`);
          this.showToast(`❌ Dil dosyası yüklenemedi: ${lang}`, 'error');
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
      
      // Show success toast
      this.showToast(`✓ ${this.getLanguageName(lang)}`, 'success');
      
      return true;
    } catch (error) {
      console.error('❌ Dil değiştirme hatası:', error);
      this.showToast('❌ Dil değiştirme hatası!', 'error');
      return false;
    } finally {
      // 500ms sonra tekrar tıklama izni ver
      setTimeout(() => {
        this.isChanging = false;
      }, 500);
    }
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
  
  setupLanguageButtons() {
    console.log('🔘 Dil butonları kuruluyor...');
    
    // Use event delegation for better performance and reliability
    document.addEventListener('click', (e) => {
      const langBtn = e.target.closest('.lang-btn');
      
      if (!langBtn) return;
      
      e.preventDefault();
      e.stopPropagation();
      
      const lang = langBtn.getAttribute('data-lang');
      
      if (!lang) {
        console.warn('⚠️ data-lang özelliği eksik:', langBtn);
        return;
      }
      
      console.log(`🖱️ Dil butonu tıklandı: ${lang}`);
      
      // Don't change if already active
      if (langBtn.classList.contains('active') && this.currentLang === lang) {
        console.log(`⚠️ Dil zaten aktif: ${lang}`);
        return;
      }
      
      // Change language
      this.changeLanguage(lang);
    }, true); // Use capture phase for priority
    
    console.log(`✅ Event delegation kuruldu (tüm .lang-btn için)`);
  },
  
  async init(defaultLang = 'tr') {
    console.log('🚀 i18n başlatılıyor...');
    
    // CRITICAL: Setup language buttons FIRST (event delegation)
    this.setupLanguageButtons();
    
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
    } else {
      console.error('❌ i18n başlatılamadı!');
    }
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
  
  showToast(message, type = 'success') {
    // Remove existing toast
    const existingToast = document.querySelector('.language-toast');
    if (existingToast) {
      existingToast.remove();
    }
    
    // Create new toast
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
    
    // Show toast
    setTimeout(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(0)';
    }, 10);
    
    // Hide and remove toast
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100px)';
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