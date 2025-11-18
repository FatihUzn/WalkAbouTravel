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
let allGalleriesData = null; 
const pageCache = {}; 

// === Galeri sayfalandırma için (Sadece Otel galerisi için korundu) ===
let globalPropertyImages = [];
let globalImageIndex = 0;
const IMAGES_PER_LOAD = 8; 
// === Galeri sayfalandırma sonu ===

// === HTML İçerik Yükleyici (loadHtmlContent) ===
async function loadHtmlContent(pageId) {
    let url;
    if (pageId === 'services') {
        url = 'services.html';
    } else if (pageId === 'tours') {
        url = 'tours.html';
    } else {
        return; // Sadece bu sayfalar harici yüklenir
    }

    if (pageCache[pageId]) {
        document.getElementById(`page-${pageId}`).innerHTML = pageCache[pageId];
        return;
    }

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Sayfa yüklenemedi: ${url}`);
        const html = await response.text();
        pageCache[pageId] = html;
        document.getElementById(`page-${pageId}`).innerHTML = html;
    } catch (error) {
        console.error(`HTML içeriği yüklenirken hata oluştu: ${error}`);
    }
}

// === setLanguage Fonksiyonu (DİLLERİ YÜKLER) ===
async function setLanguage(lang) {
    if (!translations[lang]) {
        try {
            const response = await fetch(`${lang}.json?v=1.6`);
            if (!response.ok) throw new Error(`Dil dosyası yüklenemedi: ${lang}`);
            translations[lang] = await response.json();
        } catch (error) {
            console.error(error);
            return;
        }
    }
    
    document.documentElement.lang = lang;
    localStorage.setItem('language', lang);
    updateTexts(lang);
}

// === updateTexts Fonksiyonu (SAYFA İÇERİKLERİNİ GÜNCELLEME) ===
function updateTexts(lang) {
    const elements = document.querySelectorAll('[data-key]');
    elements.forEach(el => {
        const key = el.getAttribute('data-key');
        if (translations[lang] && translations[lang][key]) {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = translations[lang][key];
            } else if (el.tagName === 'TITLE') {
                 document.title = translations[lang][key];
            } else {
                el.innerHTML = translations[lang][key];
            }
        }
    });

    // Galeriler yüklüyse metinlerini güncelle
    if (allGalleriesData) {
        renderGalleries();
    }
}

// === Galerileri Yükle ve Render Et (loadGalleries) ===
async function loadGalleries() {
    if (allGalleriesData) {
        renderGalleries();
        return;
    }
    try {
        const response = await fetch('data/galleries.json?v=1.1');
        if (!response.ok) throw new Error('Galeriler yüklenemedi.');
        allGalleriesData = await response.json();
        renderGalleries();
    } catch (error) {
        console.error('Galeri verileri yüklenirken hata oluştu:', error);
    }
}

// === Galerileri HTML'e Yazdır (renderGalleries) ===
function renderGalleries() {
    if (!allGalleriesData) return;

    const currentLang = document.documentElement.lang;
    const t = translations[currentLang] || {};

    // OTEL Galerisi
    const otelGallery = document.getElementById('otel-gallery-content');
    if (otelGallery) {
        otelGallery.innerHTML = `
            <h2 data-key="page_otel_gallery_h1">${t.page_otel_gallery_h1 || 'Otel Galeri'}</h2>
            <p data-key="page_gallery_p">${t.page_gallery_p || 'Detaylar için tıklayın.'}</p>
            <div class="gallery-grid" id="otel-room-gallery">
                ${Object.keys(allGalleriesData).filter(key => key.startsWith('OTEL')).map(key => generatePropertyCard(key, allGalleriesData[key], 'OTEL')).join('')}
            </div>
            <div id="otel-gallery-detail" style="display: none;"></div>
        `;
    }

    // Ticari/Konut (İnşaat) Galerisi - Satılık
    const forSaleGallery = document.getElementById('insaat-gallery-for-sale');
    if (forSaleGallery) {
        forSaleGallery.innerHTML = '';
        Object.keys(allGalleriesData).filter(key => key.startsWith('PROP_S')).forEach(key => {
            forSaleGallery.innerHTML += generatePropertyCard(key, allGalleriesData[key], 'INSAAT_SALE');
        });
    }

    // Ticari/Konut (İnşaat) Galerisi - Kiralık
    const forRentGallery = document.getElementById('insaat-gallery-for-rent');
    if (forRentGallery) {
        forRentGallery.innerHTML = '';
        Object.keys(allGalleriesData).filter(key => key.startsWith('PROP_K')).forEach(key => {
            forRentGallery.innerHTML += generatePropertyCard(key, allGalleriesData[key], 'INSAAT_RENT');
        });
    }

    updateTexts(currentLang); // Yeni yüklenen HTML içeriğindeki metinleri de güncelle
}

// === Galeri Kartı Oluşturma (generatePropertyCard) ===
function generatePropertyCard(key, data, type) {
    const isOtel = type === 'OTEL';
    
    // Otel kartları lightbox'ı açmalı, İnşaat kartları sadece bilgi göstermeli
    const clickHandler = isOtel ? `onclick="openLightbox('${key}')"` : '';
    const linkClass = isOtel ? 'property-card otel-card' : 'property-card insaat-card';
    const imagePath = data.images && data.images.length > 0 ? data.images[0] : 'assets/placeholder.webp';

    // İnşaat kartları için gösterilecek ek metinsel detaylar
    let detailsHtml = '';
    if (!isOtel) {
        detailsHtml = `
            <p class="prop-detail"><i class="fas fa-map-marker-alt"></i> ${data.location}</p>
            <p class="prop-detail"><i class="fas fa-ruler-combined"></i> ${data.area}</p>
            <p class="prop-detail"><i class="fas fa-door-open"></i> ${data.rooms}</p>
        `;
    }

    return `
        <div class="${linkClass}" data-key="${key}" ${clickHandler}>
            <img loading="lazy" src="${imagePath}" alt="${data.title}" onerror="this.src='assets/placeholder.webp'">
            <div class="card-content">
                <h4 class="card-title">${data.title}</h4>
                <p class="card-price">${data.price}</p>
                ${detailsHtml}
            </div>
            <span class="card-tag ${isOtel ? 'tag-otel' : 'tag-insaat'}">${isOtel ? 'İncele' : 'Detay'}</span>
        </div>
    `;
}

// === Sayfa Yönlendirme (showPage) ===
async function showPage(pageId) {
    const pages = ['hero', 'about', 'services', 'tours', 'otel', 'insaat', 'contact'];
    
    // Geçersiz hash'leri ana sayfaya yönlendir
    if (!pages.some(p => p === pageId)) {
        pageId = 'hero';
        location.hash = ''; // URL'yi temizle
    }

    // HTML içeriklerini yükle
    await loadHtmlContent(pageId);
    
    // Galerileri yükle
    if (pageId === 'otel' || pageId === 'insaat') {
        await loadGalleries();
    }
    
    pages.forEach(id => {
        const page = document.getElementById(`page-${id}`);
        if (page) {
            if (id === pageId) {
                page.classList.add('active');
            } else {
                page.classList.remove('active');
            }
        }
    });

    // Sayfayı üste kaydır
    if (pageId !== 'hero') {
        window.scrollTo(0, 0);
    }
}

// === openLightbox (Artık sadece otel odası detayları için) ===
function openLightbox(key) {
    const galleryData = allGalleriesData[key];
    if (!galleryData || !galleryData.images || galleryData.images.length === 0) {
        console.error('Galeri verisi bulunamadı:', key);
        return;
    }

    globalPropertyImages = galleryData.images;
    globalImageIndex = 0;

    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');

    if (lightbox && lightboxImg) {
        lightboxImg.src = globalPropertyImages[globalImageIndex];
        lightbox.style.display = 'flex';
        updateLightboxNav();
    }
}

// === Lightbox Navigasyon ve Swipes ===
function updateLightboxNav() {
    const lightboxPrev = document.getElementById('lightbox-prev');
    const lightboxNext = document.getElementById('lightbox-next');
    if (lightboxPrev) lightboxPrev.style.display = globalImageIndex > 0 ? 'block' : 'none';
    if (lightboxNext) lightboxNext.style.display = globalPropertyImages.length > 1 && globalImageIndex < globalPropertyImages.length - 1 ? 'block' : 'none';
}

function showNextImage() {
    if (globalImageIndex < globalPropertyImages.length - 1) {
        globalImageIndex++;
        document.getElementById('lightbox-img').src = globalPropertyImages[globalImageIndex];
        updateLightboxNav();
    }
}

function showPrevImage() {
    if (globalImageIndex > 0) {
        globalImageIndex--;
        document.getElementById('lightbox-img').src = globalPropertyImages[globalImageIndex];
        updateLightboxNav();
    }
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.style.display = 'none';
        globalPropertyImages = [];
        globalImageIndex = 0;
    }
}

// === Dinleyici Başlatma ===
function initListeners() {
    // Dil değiştirme butonları
    document.querySelector('.language-selector').addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            setLanguage(e.target.getAttribute('data-lang'));
        }
    });

    // Hash değişimi
    window.addEventListener('hashchange', () => {
        const pageId = location.hash.replace('#', '') || 'hero';
        showPage(pageId);
    });
    
    // Lightbox kapatma
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            // Tıklama resmin kendisi, oklar veya modal içeriği değilse kapat
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
    }
    
    // ESC ile kapatma
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && lightbox && lightbox.style.display === 'flex') {
            closeLightbox();
        }
    });

    // Form gönderme (örnek)
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            document.getElementById('form-message').textContent = 'Mesajınız başarıyla gönderildi!';
            contactForm.reset();
        });
    }

    // Başlangıç dilini ayarla
    const initialLang = localStorage.getItem('language') || 'tr';
    setLanguage(initialLang);

    // Başlangıç sayfasını göster
    const initialPage = location.hash.replace('#', '') || 'hero';
    showPage(initialPage);
}

// Sayfa yüklendiğinde başlat
document.addEventListener('DOMContentLoaded', initListeners);