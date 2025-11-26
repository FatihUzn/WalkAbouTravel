// === YARDIMCI FONKSİYONLAR ===
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

// === GLOBAL DEĞİŞKENLER ===
const translations = {}; 
const pageCache = {}; 
let globalPropertyImages = [];
let globalImageIndex = 0;
const IMAGES_PER_LOAD = 8; 

// --- RESTORASYON GALERİ DEĞİŞKENLERİ ---
const RESTORATION_IMAGES_PER_LOAD = 4;
const restorationBeforePaths = Array.from({length: 13}, (_, i) => `assets/restorasyon-${i+1}-before.webp`);
const restorationAfterPaths = Array.from({length: 13}, (_, i) => `assets/restorasyon-${i+1}-after.webp`);
let globalRestorationBeforeIndex = 0;
let globalRestorationAfterIndex = 0;


// === MANUEL VERİ TABANI (Sorunu Çözen Kısım) ===
// Dışarıdan dosya (json) aramak yerine verileri buraya sabitliyoruz.
const MANUAL_GALLERIES = {
    // --- OTEL ODALARI ---
    'OTEL1': { 
        title: 'Kral Dairesi', location: 'İzmir / Konak', area: '85 m²', rooms: '2+1', price: '₺15.000 / Gece', 
        desc: 'Panoramik deniz manzaralı, jakuzili ve özel teraslı en lüks dairemiz.',
        images: ['assets/ks1.webp', 'assets/otel1.webp', 'assets/otel2.webp']
    },
    'OTEL2': { 
        title: 'Deniz Manzaralı Suit', location: 'İzmir / Konak', area: '60 m²', rooms: '1+1', price: '₺8.500 / Gece', 
        desc: 'Ege denizinin maviliğine uyanacağınız, geniş oturma alanlı suit.',
        images: ['assets/b1_plus1.webp', 'assets/otel3.webp']
    },
    'OTEL3': { title: 'Aile Odası', location: 'İzmir / Konak', area: '50 m²', rooms: '1+1', price: '₺6.800 / Gece', desc: 'Geniş aileler için ideal, ferah ve konforlu.', images: ['assets/b2_plus1.webp'] },
    'OTEL4': { title: 'Standart Oda (Deniz)', location: 'İzmir / Konak', area: '30 m²', rooms: '1+0', price: '₺4.200 / Gece', desc: 'Deniz manzaralı standart oda.', images: ['assets/fs1.webp'] },
    'OTEL5': { title: 'Standart Oda (Kara)', location: 'İzmir / Konak', area: '28 m²', rooms: '1+0', price: '₺3.500 / Gece', desc: 'Şehir manzaralı sessiz oda.', images: ['assets/em1.webp'] },

    // --- SATILIK / KİRALIK EMLAK ---
    'A': { 
        title: 'NURİPAŞA BİNA', location: 'Zeytinburnu', area: '450 m²', rooms: 'Komple Bina', price: 'Fiyat Sorunuz', 
        desc: 'Merkezi konumda, yatırımlık komple bina.', 
        images: ['assets/house-galleryA.webp', 'assets/house_inner1.webp', 'assets/house_inner2.webp'] 
    },
    'B': { title: 'BÜYÜKYALI 3.5+1', location: 'Zeytinburnu', area: '210 m²', rooms: '3.5+1', price: 'Fiyat Sorunuz', desc: 'Lüks site içerisinde, sosyal olanaklara sahip daire.', images: ['assets/house-galleryB.webp'] },
    'C': { title: 'KAYAŞEHİR EMLAK KONUT', location: 'Başakşehir', area: '140 m²', rooms: '3+1', price: 'Fiyat Sorunuz', desc: 'Gelişmekte olan bölgede fırsat daire.', images: ['assets/house-galleryC.webp'] },
    'D': { title: 'BAHÇELİEVLER DUBLEKS', location: 'Bahçelievler', area: '280 m²', rooms: '6+2', price: 'Fiyat Sorunuz', desc: 'Geniş aileler için ferah dubleks.', images: ['assets/house-galleryD.webp'] },
    'E': { title: 'THE İSTANBUL RESIDENCE', location: 'Veliefendi', area: '110 m²', rooms: '2+1', price: 'Kiralık', desc: 'Residans konforunda kiralık daire.', images: ['assets/house-galleryE.webp'] },
    'F': { title: 'THE İSTANBUL 1+1', location: 'Veliefendi', area: '75 m²', rooms: '1+1', price: 'Kiralık', desc: 'Yalnız yaşayanlar için ideal lüks daire.', images: ['assets/house-galleryF.webp'] },
    'G': { title: 'YEDİ MAVİ 3+1', location: 'Zeytinburnu', area: '190 m²', rooms: '3+1', price: 'Satılık', desc: 'Denize sıfır markalı konut projesi.', images: ['assets/house-galleryG.webp'] },
    'H': { title: 'YEDİ MAVİ H BLOK', location: 'Zeytinburnu', area: '185 m²', rooms: '3+1', price: 'Kiralık', desc: 'Özel blokta kiralık lüks daire.', images: ['assets/house-galleryH.webp'] }
};


// === ANA FONKSİYON: DETAY PENCERESİNİ AÇ ===
async function openHouseDetail(letter) {
  
  // JSON Fetch sistemini iptal ettik. Doğrudan manuel veriden çekiyoruz.
  const h = MANUAL_GALLERIES[letter]; 

  if (!h) {
      console.error(`'${letter}' ID'li veri MANUAL_GALLERIES içinde bulunamadı.`);
      alert("Bu projenin detayları şu anda yüklenemiyor."); // Kullanıcıya bilgi ver
      return;
  }

  const detail = document.getElementById("house-detail");
  const content = document.getElementById("house-detail-content");
  
  // Çeviri sistemi varsa kullan, yoksa verideki metni al
  const currentLang = localStorage.getItem('lang') || 'tr';
  const langData = translations[currentLang] || {}; 

  // İçeriği oluştur
  const priceLabel = langData.js_fiyat || 'Fiyat';
  const locationLabel = langData.js_konum || 'Konum';
  const areaLabel = langData.js_alan || 'Alan';
  const roomsLabel = langData.js_oda_sayisi || 'Oda Sayısı';

  content.innerHTML = `
    <h2>${h.title}</h2>
    
    <div class="house-info">
      <p><strong>${locationLabel}:</strong> ${h.location}</p>
      <p><strong>${areaLabel}:</strong> ${h.area}</p>
      <p><strong>${roomsLabel}:</strong> ${h.rooms}</p>
      <p><strong>${priceLabel}:</strong> ${h.price}</p>
      <hr style="border: 0; border-top: 1px solid #333; margin: 15px 0;">
      <p>${h.desc}</p>
    </div>

    <div class="detail-gallery" id="detail-gallery-container">
      </div>
    
    <div id="gallery-loader-container" style="text-align: center; margin-top: 20px; margin-bottom: 20px;"></div>
  `;

  // Global resim listesini güncelle
  globalPropertyImages = h.images || [];
  globalImageIndex = 0;
  
  // İlk resim grubunu yükle
  loadMorePropertyImages();
  
  // Pencereyi Göster
  detail.style.display = "block";
  document.body.style.overflow = "hidden"; // Arka planı kilitle
}

function closeHouseDetail() {
  const detail = document.getElementById("house-detail");
  if (detail) {
    detail.style.display = "none";
  }
  document.body.style.overflow = "auto"; 
}

// === GALERİ RESİM YÜKLEME ===
function loadMorePropertyImages() {
  const galleryContainer = document.getElementById('detail-gallery-container');
  const loaderContainer = document.getElementById('gallery-loader-container');

  if (!galleryContainer) return;

  const imagesToLoad = globalPropertyImages.slice(globalImageIndex, globalImageIndex + IMAGES_PER_LOAD);

  if (imagesToLoad.length === 0 && globalImageIndex === 0) {
     galleryContainer.innerHTML = "<p style='text-align:center; color:#666;'>Görsel hazırlanıyor...</p>";
     if(loaderContainer) loaderContainer.innerHTML = "";
     return;
  }

  const imagesHTML = imagesToLoad.map(img => 
    `<img loading="lazy" src="${img}" alt="Detay Görseli" onclick="openLightbox(this.src)" onerror="this.style.display='none'">`
  ).join("");

  galleryContainer.insertAdjacentHTML('beforeend', imagesHTML);
  globalImageIndex += IMAGES_PER_LOAD;

  if(loaderContainer) {
      loaderContainer.innerHTML = '';
      if (globalImageIndex < globalPropertyImages.length) {
        loaderContainer.innerHTML = `<button class="btn" id="load-more-btn" onclick="loadMorePropertyImages()">Daha Fazla</button>`;
      }
  }
}

// === LIGHTBOX (BÜYÜK RESİM) İŞLEVLERİ ===
function openLightbox(src) {
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    if(lightbox && lightboxImg) {
        lightboxImg.src = src;
        lightbox.style.display = "flex";
    }
}
// Diğer Lightbox kapatma/gezme olayları aşağıda listener'da tanımlı...


// === SAYFA YÖNETİMİ VE DİL ===
async function setLanguage(lang) {
    let langData;
    if (translations[lang]) {
        langData = translations[lang];
    } else {
        try {
            const response = await fetch(`${lang}.json`);
            if (!response.ok) throw new Error("Dil dosyası yok");
            langData = await response.json(); 
            translations[lang] = langData; 
        } catch (error) {
            console.warn("Dil yüklenemedi, varsayılan (TR) kullanılıyor.");
            if (lang !== 'tr' && !translations['tr']) await setLanguage('tr');
            return;
        }
    }
    
    document.documentElement.lang = lang; 
    document.documentElement.dir = (lang === 'ar') ? 'rtl' : 'ltr';

    document.querySelectorAll('[data-key]').forEach(el => {
        const key = el.getAttribute('data-key');
        if (langData && langData[key]) el.innerHTML = langData[key];
    });
    localStorage.setItem('lang', lang);
}

async function showPage(pageId) {
    if (!pageId || pageId === '#') pageId = 'hero';

    // Tüm sayfaları gizle
    document.querySelectorAll('.page-section').forEach(sec => sec.classList.remove('active', 'visible'));

    let newPage = document.getElementById(pageId);
    
    // Sayfa HTML içinde yoksa (Harici yükleme)
    if (!newPage) {
        if (pageCache[pageId]) {
            document.getElementById('page-container').insertAdjacentHTML('beforeend', pageCache[pageId]);
        } else {
            try {
                // Sayfa adlarını dosya adlarına eşleştir
                let fileName = pageId;
                if (pageId.startsWith('page-')) fileName = pageId.replace('page-', '');
                if (pageId === 'page-satilik_kiralik') fileName = "satilik_kiralik";
                
                const response = await fetch(`${fileName}.html`);
                if (!response.ok) throw new Error("Sayfa bulunamadı");
                const html = await response.text();
                
                pageCache[pageId] = html; 
                document.getElementById('page-container').insertAdjacentHTML('beforeend', html);
            } catch (e) {
                console.error(e);
                return;
            }
        }
        newPage = document.getElementById(pageId);
    }

    if (newPage) {
        if (location.hash.replace('#', '') !== pageId) location.hash = pageId;
        
        newPage.classList.add('active');
        window.scrollTo(0, 0);

        // Dil çevirilerini uygula
        const currentLang = localStorage.getItem('lang') || 'tr';
        if (translations[currentLang]) {
            newPage.querySelectorAll('[data-key]').forEach(el => {
                const key = el.getAttribute('data-key');
                if (translations[currentLang][key]) el.innerHTML = translations[currentLang][key];
            });
        }
        
        // Restorasyon özel ayarı
        if (pageId === 'page-pruva-otel' || fileName === 'restorasyon') {
             setupRestorationGalleries();
        }

        // Animasyon için kısa gecikme
        setTimeout(() => newPage.classList.add('visible'), 50);
    }
}

// === RESTORASYON GALERİLERİ ===
function setupRestorationGalleries() {
  globalRestorationBeforeIndex = 0;
  globalRestorationAfterIndex = 0;
  
  const beforeGal = document.getElementById('restoration-gallery-before');
  const afterGal = document.getElementById('restoration-gallery-after');
  
  if (beforeGal) { beforeGal.innerHTML = ''; loadMoreRestorationImages('before'); }
  if (afterGal) { afterGal.innerHTML = ''; loadMoreRestorationImages('after'); }
}

function loadMoreRestorationImages(type) {
  const container = document.getElementById(type === 'before' ? 'restoration-gallery-before' : 'restoration-gallery-after');
  const loader = document.getElementById(type === 'before' ? 'restoration-loader-before' : 'restoration-loader-after');
  const images = type === 'before' ? restorationBeforePaths : restorationAfterPaths;
  let idx = type === 'before' ? globalRestorationBeforeIndex : globalRestorationAfterIndex;

  if (!container) return;

  const slice = images.slice(idx, idx + RESTORATION_IMAGES_PER_LOAD);
  if(slice.length === 0) return;

  container.insertAdjacentHTML('beforeend', slice.map(src => `<img src="${src}" loading="lazy">`).join(''));
  
  if (type === 'before') globalRestorationBeforeIndex += RESTORATION_IMAGES_PER_LOAD;
  else globalRestorationAfterIndex += RESTORATION_IMAGES_PER_LOAD;
  
  if (loader) {
      loader.innerHTML = '';
      if ((type === 'before' ? globalRestorationBeforeIndex : globalRestorationAfterIndex) < images.length) {
          loader.innerHTML = `<button class="btn" onclick="loadMoreRestorationImages('${type}')">Daha Fazla</button>`;
      }
  }
}

// === BAŞLANGIÇ AYARLARI (DOM READY) ===
document.addEventListener('DOMContentLoaded', async () => {
    
    // Dil Ayarı
    await setLanguage(localStorage.getItem('lang') || 'tr');

    // Sayfa Yönlendirme (Hash kontrolü)
    const initialPage = location.hash.replace('#', '') || 'hero';
    showPage(initialPage);

    // Hash değişimini dinle (Geri butonu vs için)
    window.addEventListener('hashchange', () => {
        showPage(location.hash.replace('#', '') || 'hero');
    });

    // Mobil Menü
    const menuToggle = document.getElementById('menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            document.getElementById('navbar').classList.toggle('open');
        });
    }

    // Navigasyon Tıklamaları
    document.body.addEventListener('click', (e) => {
        // Geri Butonu
        if (e.target.classList.contains('btn-page-back')) {
            e.preventDefault();
            location.hash = 'hero';
        }
        // İç Linkler
        if (e.target.matches('[data-page]')) {
            e.preventDefault();
            const page = e.target.getAttribute('data-page');
            location.hash = page;
            // Mobilde menüyü kapat
            document.getElementById('navbar').classList.remove('open');
        }
        // Lightbox Kapatma
        if (e.target.id === 'lightbox') {
            e.target.style.display = 'none';
        }
    });

    // Klavye (ESC ile modal kapatma)
    document.addEventListener('keydown', (e) => {
        if (e.key === "Escape") {
            const detail = document.getElementById("house-detail");
            const lightbox = document.getElementById("lightbox");
            if (detail) detail.style.display = "none";
            if (lightbox) lightbox.style.display = "none";
            document.body.style.overflow = "auto";
        }
    });
});
