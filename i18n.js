// i18n.js - Dil Çeviri Sistemi
// WalkAbout Travel - 2025

const i18n = {
  currentLang: 'tr',
  translations: {},
  
  async loadLanguage(lang) {
    try {
      // Try data folder first
      let response = await fetch(`data/${lang}.json`);
      
      // If not found, try root
      if (!response.ok) {
        response = await fetch(`${lang}.json`);
      }
      
      if (!response.ok) {
        throw new Error(`Language file not found: ${lang}.json`);
      }
      
      this.translations[lang] = await response.json();
      console.log(`✅ Language loaded: ${lang}`);
      return true;
    } catch (error) {
      console.error(`❌ Language loading error (${lang}):`, error);
      return false;
    }
  },
  
  t(key) {
    if (!this.translations[this.currentLang]) {
      console.warn(`⚠️ Language not loaded: ${this.currentLang}`);
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
      console.warn(`⚠️ Translation not found: ${key} (${this.currentLang})`);
      return key;
    }
    
    return translation;
  },
  
  async changeLanguage(lang) {
    console.log(`🔄 Changing language to: ${lang}`);
    
    // Load language if not already loaded
    if (!this.translations[lang]) {
      const loaded = await this.loadLanguage(lang);
      if (!loaded) {
        console.error(`❌ Could not change language: ${lang}`);
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
    
    console.log(`✅ Language changed to: ${lang}`);
    return true;
  },
  
  updatePageContent() {
    // Find and update all elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      const translation = this.t(key);
      
      // Input and textarea placeholder
      if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        element.placeholder = translation;
      } 
      // Other elements textContent
      else {
        element.textContent = translation;
      }
    });
    
    // Update title
    const titleElement = document.querySelector('title');
    if (titleElement) {
      const titleKey = titleElement.getAttribute('data-i18n') || 'title';
      const titleTranslation = this.t(titleKey);
      if (titleTranslation !== titleKey) {
        document.title = titleTranslation;
      }
    }
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
    }
  },
  
  async init(defaultLang = 'tr') {
    // Get saved language from localStorage
    const savedLang = localStorage.getItem('language') || defaultLang;
    
    console.log(`🚀 Initializing i18n with language: ${savedLang}`);
    
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
      
      console.log(`✅ i18n initialized successfully with ${savedLang}`);
    } else {
      console.error('❌ i18n initialization failed!');
    }
  }
};

// Add to global window
if (typeof window !== 'undefined') {
  window.i18n = i18n;
  
  console.log('📦 i18n module loaded');
  
  // Initialize when page loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.i18n.init('tr');
    });
  } else {
    window.i18n.init('tr');
  }
}

// Node.js compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = i18n;
}
