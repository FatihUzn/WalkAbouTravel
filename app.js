function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
}

const translations = {}; 
const pageCache = {}; 

// EMLAK VE GALERİ İŞLEMLERİNE AİT TÜM DEĞİŞKENLER KALDIRILMIŞTIR

// === Dil ve Çeviri İşlemleri ===

async function fetchTranslations(lang) {
  try {
    const response = await fetch(`${lang}.json`);
    if (!response.ok) throw new Error(`Dil dosyası (${lang}.json) bulunamadı.`);
    const data = await response.json();
    translations[lang] = data;
  } catch (error) {
    console.error(`Çeviri dosyası yüklenirken hata: ${error}`);
  }
}

function applyTranslations(lang) {
  const elements = document.querySelectorAll('[data-key]');
  const currentTranslations = translations[lang];

  if (!currentTranslations) return;

  elements.forEach(element => {
    const key = element.getAttribute('data-key');
    const translation = currentTranslations[key];

    if (translation) {
      if (element.tagName === 'INPUT' && element.hasAttribute('placeholder')) {
        element.placeholder = translation;
      } else if (element.tagName === 'INPUT' && element.type === 'submit' || element.tagName === 'BUTTON' && element.type === 'submit') {
        element.value = translation;
      } else if (element.tagName === 'TITLE') {
        document.title = translation;
      } else {
        element.textContent = translation;
      }
    }
  });

  // HTML'deki lang özelliğini güncelle
  document.documentElement.setAttribute('lang', lang);

  // Arapça için özel RTL/Font ayarı
  if (lang === 'ar') {
    document.body.classList.add('rtl');
  } else {
    document.body.classList.remove('rtl');
  }
}

async function switchLanguage(lang) {
  await fetchTranslations(lang);
  applyTranslations(lang);
  localStorage.setItem('preferredLang', lang);
}

// === Sayfa Yükleme ve Yönlendirme İşlemleri ===

function showPage(pageId) {
  const main = document.querySelector('main');
  const sections = main.querySelectorAll('.page-section');
  
  sections.forEach(section => {
    if (section.id === pageId) {
      section.classList.add('active');
    } else {
      section.classList.remove('active');
    }
  });

  window.history.pushState(null, '', `#${pageId.replace('page-', '')}`);
  
  if (pageId === 'hero') {
    document.body.classList.remove('nav-open');
  }
  
  // Tüm Otel/Emlak/Restorasyon çağrıları kaldırıldı
}

async function fetchPageContent(pageId) {
    const url = `${pageId}.html`;
    if (pageCache[pageId]) {
        return pageCache[pageId];
    }
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Sayfa yüklenemedi: ${url}`);
        const content = await response.text();
        pageCache[pageId] = content;
        return content;
    } catch (error) {
        console.error(error);
        return `<section id="page-${pageId}" class="page-section"><div class="error-message">Hata: ${url} sayfası yüklenemedi.</div></section>`;
    }
}

// Dinamik olarak tüm HTML parçacıklarını yükler
async function loadAllPageContents() {
    const pagesToLoad = [
        'about', 
        'services', 
        'projects', 
        'contact',
    ];
    
    const container = document.getElementById('page-content-container');
    if (!container) return;

    for (const pageId of pagesToLoad) {
        const content = await fetchPageContent(pageId);
        container.insertAdjacentHTML('beforeend', content);
    }
}

// EMLAK, GALERİ VERİSİ VE DETAY MODAL İŞLEMLERİ TAMAMEN KALDIRILMIŞTIR


// === Genel Event Listener'lar ve Başlangıç ===

document.addEventListener('DOMContentLoaded', async () => {
    // Tüm sayfa içeriklerini yükle
    await loadAllPageContents();

    // Dil ayarını yükle
    const savedLang = localStorage.getItem('preferredLang') || 'tr';
    await switchLanguage(savedLang);
    document.getElementById('language-switch').value = savedLang;
    
    // Galeri/Emlak verisi yükleme çağrısı kaldırıldı

    // URL'deki hash'e göre doğru sayfayı göster
    let pageId = 'hero';
    if (window.location.hash) {
        const hash = window.location.hash.substring(1);
        if (hash) {
             pageId = 'page-' + hash; 
        }
    }
    showPage(pageId);
    
    // Mobil menü işlevi
    const menuToggle = document.querySelector('.menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            document.body.classList.toggle('nav-open');
        });
    }

    // Navigasyon bağlantılarına tıklama işlevi
    document.querySelectorAll('.nav-links a, .dropdown-menu a').forEach(link => {
        link.addEventListener('click', (e) => {
            const hash = e.currentTarget.getAttribute('href');
            if (hash && hash.startsWith('#page-')) {
                const pageId = hash.substring(1);
                showPage(pageId);
                document.body.classList.remove('nav-open'); // Menüyü kapat
            }
        });
    });

    // EMLAK GALERİSİ VE LIGHTBOX EVENT LISTENERLARI KALDIRILDI
});