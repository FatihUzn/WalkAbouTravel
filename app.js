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

// Global Durum Değişkenleri
const translations = {}; 
let allGalleriesData = null; 
const pageCache = {}; 
let currentLanguage = 'tr'; 

// === Galeri ve Lightbox için ===
let globalPropertyImages = [];
let globalImageIndex = 0;

// === Veri Yükleme (Diller ve Galeri) ===
async function loadAllData() {
    try {
        // Dil dosyalarını yükle (Örnekte sadece tr.json kullanılıyor varsayılmıştır)
        const trResponse = await fetch('tr.json');
        translations['tr'] = await trResponse.json();
        
        // Galeri verilerini yükle
        // Not: data/galleries.json varsayılmıştır. Eğer dosya kök dizindeyse yolu 'galleries.json' olarak değiştirin.
        const galleryResponse = await fetch('data/galleries.json?v=1.1'); 
        allGalleriesData = await galleryResponse.json();

        // Veriler yüklendikten sonra başlangıç ayarlarını yap
        const initialLang = localStorage.getItem('language') || 'tr';
        setLanguage(initialLang); // Başlangıç dilini ayarla

        const initialPage = location.hash.replace('#', '') || 'hero';
        showPage(initialPage); // Başlangıç sayfasını göster

    } catch (error) {
        console.error('Veriler yüklenirken hata oluştu:', error);
    }
}

// === Dil Fonksiyonları ===
function setLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('language', lang);
    const selectedTranslations = translations[lang] || translations['tr'];
    
    document.querySelectorAll('[data-key]').forEach(element => {
        const key = element.getAttribute('data-key');
        if (selectedTranslations[key]) {
            element.textContent = selectedTranslations[key];
        }
    });

    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.lang === lang) {
            btn.classList.add('active');
        }
    });
    
    // Dil değişimi Otel galerisindeki metinleri de etkilemeli (daha çok başlıklar için)
    if (document.getElementById('page-otel').classList.contains('active')) {
        renderOtelGallery();
    }
}

// === HTML İçerik Yükleyici (Dinamik yüklenen sayfalar için) ===
async function loadHtmlContent(pageId) {
    let url;
    if (pageId === 'services') {
        url = 'services.html';
    } else if (pageId === 'tours') {
        url = 'tours.html';
    } else {
        return; 
    }

    if (pageCache[pageId]) {
        document.getElementById(`page-${pageId}`).innerHTML = pageCache[pageId];
        setLanguage(currentLanguage); // Yüklenen içeriğe dil ayarını uygula
        return;
    }

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Sayfa yüklenemedi: ${url}`);
        const html = await response.text();
        pageCache[pageId] = html;
        document.getElementById(`page-${pageId}`).innerHTML = html;
        setLanguage(currentLanguage); // Yüklenen içeriğe dil ayarını uygula
    } catch (error) {
        console.error(`HTML içeriği yüklenemedi: ${error}`);
    }
}


// === DÜZELTME 3: OTEL GALERİSİNİ DİNAMİK YÜKLEME FONKSİYONU ===
function renderOtelGallery() {
    const container = document.getElementById('otel-gallery-container');

    if (!container || !allGalleriesData) {
        return;
    }

    container.innerHTML = ''; // Eski kartları temizle
    
    // Sadece OTEL ile başlayan anahtarları filtrele
    const otelKeys = Object.keys(allGalleriesData).filter(key => key.startsWith('OTEL'));

    otelKeys.forEach(key => {
        const room = allGalleriesData[key];
        
        // galleries.json'daki title'ı kullanıyoruz
        const roomTitle = room.title; 
        
        // İlk görseli kart görseli olarak kullan
        const mainImage = room.images && room.images.length > 0 ? room.images[0] : 'https://placehold.co/350x280/111/f59e0b?text=Görsel+Bulunamadı';

        const card = document.createElement('div');
        card.className = 'house-card';
        
        // DÜZELTME 2: openHouseDetail yerine openLightbox kullan
        card.setAttribute('onclick', `openLightbox('${key}')`); 

        card.innerHTML = `
            <img src="${mainImage}" alt="${roomTitle}" loading="lazy" onerror="this.src='https://placehold.co/350x280/111/f59e0b?text=Görsel+Bulunamadı'">
            <h3>${roomTitle}</h3>
        `;

        container.appendChild(card);
    });
}


// === Sayfa Yöneticisi ===
function showPage(pageId) {
    document.querySelectorAll('.page-section').forEach(section => {
        section.classList.remove('active');
        section.style.display = 'none';
    });
    
    const targetPage = document.getElementById(`page-${pageId}`);
    if (targetPage) {
        targetPage.classList.add('active');
        targetPage.style.display = 'block';

        // Gerekli HTML içeriğini yükle
        loadHtmlContent(pageId); 

        // DÜZELTME 3: Otel sayfası yüklendiğinde galeriyi dinamik olarak oluştur
        if (pageId === 'otel') {
            renderOtelGallery(); 
        }

        // Başlıkta hash'i güncelle
        location.hash = pageId === 'hero' ? '' : pageId;
    }
}


// === Lightbox Fonksiyonları ===
function openLightbox(propertyId) {
    if (!allGalleriesData || !allGalleriesData[propertyId]) {
        console.error('Galeri verisi bulunamadı:', propertyId);
        return;
    }

    const item = allGalleriesData[propertyId];
    globalPropertyImages = item.images;
    globalImageIndex = 0; 

    // Lightbox detaylarını set et
    document.getElementById('lightbox-title').textContent = item.title;
    document.getElementById('lightbox-location').textContent = item.location;
    document.getElementById('lightbox-area').textContent = item.area;
    document.getElementById('lightbox-rooms').textContent = item.rooms;
    document.getElementById('lightbox-desc').textContent = item.desc;

    // Lightbox'ı göster
    showCurrentImage(); 
    document.getElementById('lightbox').style.display = 'flex';
}

function closeLightbox() {
    document.getElementById('lightbox').style.display = 'none';
}

function showCurrentImage() {
    const imgElement = document.getElementById('lightbox-img');
    const imageCount = globalPropertyImages.length;
    
    if (imageCount > 0) {
        imgElement.src = globalPropertyImages[globalImageIndex];
        // Navigasyon butonlarını göster/gizle
        document.getElementById('lightbox-prev').style.display = imageCount > 1 ? 'block' : 'none';
        document.getElementById('lightbox-next').style.display = imageCount > 1 ? 'block' : 'none';
    } else {
        imgElement.src = 'https://placehold.co/600x400?text=Görsel+Yok';
        document.getElementById('lightbox-prev').style.display = 'none';
        document.getElementById('lightbox-next').style.display = 'none';
    }
}

function showNextImage() {
    if (globalPropertyImages.length > 0) {
        globalImageIndex = (globalImageIndex + 1) % globalPropertyImages.length;
        showCurrentImage();
    }
}

function showPrevImage() {
    if (globalPropertyImages.length > 0) {
        globalImageIndex = (globalImageIndex - 1 + globalPropertyImages.length) % globalPropertyImages.length;
        showCurrentImage();
    }
}

// === Başlatma (init) ===
function init() {
    // Tüm verileri (diller, galeriler) yükle ve siteyi başlat
    loadAllData();

    // Dil butonları
    document.querySelectorAll('.lang-btn').forEach(button => {
        button.addEventListener('click', () => {
            setLanguage(button.dataset.lang);
        });
    });

    // Navigasyon (linkleri dinle)
    document.querySelectorAll('.nav-links a, .btn-page-back, .logo-link').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#page-')) {
                e.preventDefault();
                const pageId = href.replace('#page-', '');
                showPage(pageId);
            } else if (href === '#') {
                e.preventDefault();
                showPage('hero');
            }
        });
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
}

// DOM Yüklendiğinde init fonksiyonunu çağır
document.addEventListener('DOMContentLoaded', init);