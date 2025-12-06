import { PATHS, DEFAULT_LANGUAGE } from '../config/constants.js';
import { setLanguage, getCurrentLanguage } from './language.js';
import { showError } from '../utils/helpers.js';

const pageCache = {};

export async function showPage(pageId) {
  try {
    if (!pageId || pageId === '#') pageId = 'hero';
    
    // Tüm bölümleri gizle
    document.querySelectorAll('.page-section').forEach(sec => {
      sec.classList.remove('active');
    });

    let newPage = document.getElementById(pageId);
    
    // Sayfa DOM'da yoksa yükle (AJAX)
    if (!newPage) {
      if (pageCache[pageId]) {
        document.getElementById('page-container').insertAdjacentHTML('beforeend', pageCache[pageId]);
      } else {
        // Dosya ismini belirle (örn: page-about -> about.html)
        let fileName = pageId.replace('page-', '');
        
        // Özel dosya isimleri eşleşmesi (eski yapıdan kalma varsa)
        if (pageId === 'page-satilik_kiralik') fileName = "satilik_kiralik";
        if (pageId === 'page-tours') fileName = "tours"; 
        
        const response = await fetch(`${PATHS.PAGES}${fileName}.html`);
        
        if (!response.ok) {
           // Fallback: Belki dosya pages klasöründe değildir, ana dizindedir?
           const retry = await fetch(`${fileName}.html`);
           if(!retry.ok) throw new Error(`Sayfa bulunamadı: ${fileName}`);
           
           const html = await retry.text();
           pageCache[pageId] = html;
           document.getElementById('page-container').insertAdjacentHTML('beforeend', html);
        } else {
           const html = await response.text();
           pageCache[pageId] = html;
           document.getElementById('page-container').insertAdjacentHTML('beforeend', html);
        }
      }
      newPage = document.getElementById(pageId);
    }

    if (newPage) {
      // URL Hash güncelle
      if (location.hash.replace('#', '') !== pageId) {
        location.hash = pageId;
      }
      
      newPage.classList.add('active');
      window.scrollTo(0, 0);

      // Yeni yüklenen sayfa için dili tekrar uygula
      const currentLang = getCurrentLanguage();
      await setLanguage(currentLang);
    }
  } catch (error) {
    console.error('Sayfa yükleme hatası:', error);
    showError('Sayfa yüklenemedi. Lütfen menüyü kullanarak tekrar deneyin.');
  }
}