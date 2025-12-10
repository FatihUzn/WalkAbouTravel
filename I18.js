/* ================================================
   WALKABOUT TRAVEL - MULTI-LANGUAGE SYSTEM (i18n)
   ================================================ */

class I18n {
    constructor() {
        this.currentLang = localStorage.getItem('language') || 'tr';
        this.translations = {};
        this.loadTranslations();
    }

    async loadTranslations() {
        try {
            // Mevcut dili yükle
            const response = await fetch(`${this.currentLang}.json`);
            if (!response.ok) throw new Error('Translation file not found');
            
            this.translations = await response.json();
            this.applyTranslations();
            this.updateLangButtons();
        } catch (error) {
            console.error('Translation loading error:', error);
            // Fallback to Turkish if error
            if (this.currentLang !== 'tr') {
                this.currentLang = 'tr';
                this.loadTranslations();
            }
        }
    }

    applyTranslations() {
        // Tüm data-i18n elementlerini bul ve çevir
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.getTranslation(key);
            
            if (translation) {
                // Eğer element input/textarea ise placeholder güncelle
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    element.placeholder = translation;
                } else {
                    element.textContent = translation;
                }
            }
        });

        // data-i18n-html olan elementleri çevir (HTML içerikli)
        document.querySelectorAll('[data-i18n-html]').forEach(element => {
            const key = element.getAttribute('data-i18n-html');
            const translation = this.getTranslation(key);
            if (translation) {
                element.innerHTML = translation;
            }
        });

        // Title güncelle
        if (this.translations.title) {
            document.title = this.translations.title;
        }

        // HTML lang attribute güncelle
        document.documentElement.lang = this.currentLang;
        
        // RTL support for Arabic
        if (this.currentLang === 'ar') {
            document.documentElement.dir = 'rtl';
            document.body.classList.add('rtl');
        } else {
            document.documentElement.dir = 'ltr';
            document.body.classList.remove('rtl');
        }
    }

    getTranslation(key) {
        return this.translations[key] || key;
    }

    async changeLanguage(lang) {
        if (lang === this.currentLang) return;
        
        this.currentLang = lang;
        localStorage.setItem('language', lang);
        
        await this.loadTranslations();
        
        // Page reload olmasın, dinamik güncelleme
        this.applyTranslations();
        
        // Custom event dispatch et (başka componentler dinleyebilir)
        window.dispatchEvent(new CustomEvent('languageChanged', { 
            detail: { language: lang } 
        }));
    }

    updateLangButtons() {
        document.querySelectorAll('.lang-btn').forEach(btn => {
            const btnLang = btn.getAttribute('data-lang');
            if (btnLang === this.currentLang) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    // Sayfa yüklenirken bekleyen elementleri çevirmek için
    translateElement(element) {
        const key = element.getAttribute('data-i18n');
        if (key) {
            const translation = this.getTranslation(key);
            if (translation) {
                element.textContent = translation;
            }
        }
    }
}

// Global instance oluştur
const i18n = new I18n();

// Sayfa yüklendiğinde çalıştır
document.addEventListener('DOMContentLoaded', () => {
    // Dil butonlarına event listener ekle
    document.querySelectorAll('.lang-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const lang = button.getAttribute('data-lang');
            i18n.changeLanguage(lang);
        });
    });
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { I18n, i18n };
}
