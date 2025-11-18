// --- app.js (SADECE HERO ve TEMEL İŞLEVLER) ---

// --- BLOK 1 VE BLOK 3 (Modal, Swiper, Kategori Mantığı) KALDIRILDI ---

// --- BLOK 2: Ana Uygulama Mantığı (Basitleştirildi) ---

// 🌟 ADIM 1.A: Çeviri önbelleği
const translations = {};

// --- Fonksiyonlar ---

// Dili Ayarlama ve Çeviri Fonksiyonu (ASYNC - Güncel ve Hızlı)
async function setLanguage(lang) {
  let langData;

  if (translations[lang]) {
    langData = translations[lang];
  } else {
    try {
      // Dil dosyasını (tr.json, en.json vb.) çek
      const response = await fetch(`${lang}.json`);
      if (!response.ok) throw new Error(`Dil dosyası ${lang}.json yüklenemedi`);
      langData = await response.json();
      translations[lang] = langData;
    } catch (error) {
      console.warn(error);
      // Hata olursa ve 'en' değilse, İngilizce'yi denemeye devam et
      if (lang !== 'en') return await setLanguage('en');
      return;
    }
  }
  
  // HTML ve global elementlerin çevirisi
  document.querySelector('title').textContent = langData['title'];
  document.documentElement.lang = lang;
  document.documentElement.dir = (lang === 'ar') ? 'rtl' : 'ltr';

  // Body'deki (Header/Footer dahil) tüm çevrilecek elementleri güncelle
  document.querySelectorAll('body [data-key]').forEach(el => {
    const key = el.getAttribute('data-key');
    if (langData[key]) {
      el.innerHTML = langData[key];
    }
  });

  // Aktif dil butonunu işaretle
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('data-lang') === lang) btn.classList.add('active');
  });

  localStorage.setItem('lang', lang);
}

// Mobil Menü Toggle
function setupMobileMenu() {
  const menuToggle = document.getElementById('menu-toggle');
  if (menuToggle) {
    menuToggle.addEventListener('click', function() {
      const navbar = document.getElementById('navbar');
      if (navbar) navbar.classList.toggle('open');
    });
  }
  // Menüdeki tek linke tıklayınca menüyü kapat
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      const navbar = document.getElementById('navbar');
      if (navbar) navbar.classList.remove('open');
    });
  });
}

// Scroll Efektleri (Hero Opaklığı)
function handleScrollEffects() {
  const scrollY = window.scrollY;
  const header = document.querySelector('header');
  const hero = document.getElementById('hero');

  // Hero section sadece anasayfadaysa (active ise) opaklığını azalt
  if (hero && hero.classList.contains('active')) {
    hero.style.opacity = Math.max(0, 1 - (scrollY / (hero.offsetHeight * 0.7)));
  } else if (hero) {
    hero.style.opacity = 1;
  }

  // Header arka plan opaklığını scroll'a göre ayarla
  if (header) {
    const newOpacity = 0.6 - (Math.min(scrollY / 300, 1) * 0.2);
    header.style.background = `rgba(255, 255, 255, ${newOpacity})`;
  }
}

// Sayfa Gösterme (SADECE HERO İÇİN BASİTLEŞTİRİLDİ)
function showPage(pageId) {
  // Sadece 'hero' sayfası aktif kalır.
  document.querySelectorAll('.page-section').forEach(section => {
    section.classList.remove('active');
    section.classList.remove('visible');
  });

  const activePage = document.getElementById(pageId);
  if (activePage) {
    activePage.classList.add('active');
    
    // Animasyonu tetikle
    setTimeout(() => {
        activePage.classList.add('visible');
    }, 50);

  }

  // Navigasyon linklerini işaretle
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('data-page') === pageId) {
        link.classList.add('active');
    }
  });
  
  window.scrollTo(0, 0);
}


// DOM Yüklendiğinde Başlat (ASYNC)
document.addEventListener('DOMContentLoaded', async () => {

  // Mobil/Desktop dil seçici gösterimini ayarla
  const desktopLangSelector = document.querySelector('.language-selector.desktop-only');
  const mobileLangSelector = document.querySelector('.language-selector.mobile-only');

  if (window.innerWidth <= 768) {
    if (desktopLangSelector) desktopLangSelector.style.display = 'none';
  } else {
    if (mobileLangSelector) mobileLangSelector.style.display = 'none';
  }

  // 1. Önce Dili Yükle
  try {
    await setLanguage(localStorage.getItem('lang') || 'tr');
  } catch (e) {
    console.error("İlk dil yüklenemedi:", e);
  }
  
  // 2. Diğer fonksiyonları kur
  setupMobileMenu();

  // 3. Kategori Modalı ve "Keşfet" mantığı KALDIRILDI.
  
  // 4. NavBar (SPA) Tıklamalarını Kur (Sadece Anasayfa linki kaldı)
  document.querySelectorAll('.nav-link[data-page]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const pageId = link.getAttribute('data-page');
      showPage(pageId);
    });
  });

  window.addEventListener('scroll', handleScrollEffects);
  
  // 5. İlk Sayfayı Yükle
  showPage('hero');
});
// --- app.js SONU ---