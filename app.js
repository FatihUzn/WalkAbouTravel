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

// === YENİ EKLEMELER: Galeri sayfalandırma için ===
let globalPropertyImages = [];
let globalImageIndex = 0;
const IMAGES_PER_LOAD = 8; 
// === YENİ EKLEMELER SONU ===


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

// === updateTexts Fonksiyonu (SAYFA İÇERİKLERİNİ GÜNCELLER) ===
function updateTexts(lang) {
    const texts = translations[lang];
    if (!texts) return;

    document.querySelectorAll('[data-key]').forEach(element => {
        const key = element.getAttribute('data-key');
        if (texts[key]) {
            // Dil yönünü (LTR/RTL) ayarla
            if (lang === 'ar' || lang === 'zh') {
                document.body.dir = 'rtl';
            } else {
                document.body.dir = 'ltr';
            }
            // Başlık ve metinler için ayrı kontrol
            if (element.tagName === 'TITLE') {
                 document.title = texts[key];
            } else if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = texts[key];
            } else {
                element.textContent = texts[key];
            }
        }
    });
    
    // Aktif dil butonunu vurgula
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-lang') === lang) {
            btn.classList.add('active');
        }
    });

    // Otel detaylarını yüklerken dilin güncel olduğundan emin ol
    const activePage = location.hash.replace('#', '') || 'hero';
    if (activePage.startsWith('detail-')) {
        const key = activePage.substring(7);
        renderHotelDetail(key); 
    }
}

// === Otel Detaylarını Oluşturma (SADECE OTEL İÇİN) ===
function renderHotelDetail(key) {
    if (!allGalleriesData) return;
    const property = allGalleriesData[key];
    const lang = localStorage.getItem('language') || 'tr';
    const texts = translations[lang];
    const contentDiv = document.getElementById('house-detail-content');
    
    if (!property || !contentDiv || !texts) {
        contentDiv.innerHTML = `<p>Detaylar yüklenemedi.</p>`;
        return;
    }

    const priceText = texts['js_fiyat'] || 'Fiyat';
    const locationText = texts['js_konum'] || 'Konum';
    const areaText = texts['js_alan'] || 'Alan';
    const roomsText = texts['js_oda_sayisi'] || 'Oda Sayısı';

    const detailHTML = `
        <div class="detail-header">
            <h2 data-key="detail_title_${key}">${property.title}</h2>
            <p class="detail-desc" data-key="detail_desc_${key}">${property.desc}</p>
        </div>
        <div class="detail-meta-grid">
            <div class="meta-item"><span>${locationText}:</span> <strong data-key="detail_location_${key}">${property.location}</strong></div>
            <div class="meta-item"><span>${areaText}:</span> <strong data-key="detail_area_${key}">${property.area}</strong></div>
            <div class="meta-item"><span>${roomsText}:</span> <strong data-key="detail_rooms_${key}">${property.rooms}</strong></div>
            <div class="meta-item"><span>${priceText}:</span> <strong class="price" data-key="detail_price_${key}">${property.price}</strong></div>
        </div>
        <div class="detail-image-gallery" id="property-gallery">
            </div>
        <div id="gallery-loader" style="text-align: center; margin-top: 20px;">
             <button onclick="loadMorePropertyImages()" class="btn btn-load-more" data-key="btn_load_more">Daha Fazla Görsel Yükle</button>
        </div>
    `;
    
    contentDiv.innerHTML = detailHTML;
    
    globalPropertyImages = property.images;
    globalImageIndex = 0;
    
    // İlk set resimleri yükle
    const galleryDiv = document.getElementById('property-gallery');
    if (galleryDiv) galleryDiv.innerHTML = '';
    loadMorePropertyImages();

    document.getElementById('house-detail').classList.add('open');
}

function closeHouseDetail() {
    document.getElementById('house-detail').classList.remove('open');
    // Sayfayı hero'ya yönlendir
    location.hash = '#page-otel';
}

function loadMorePropertyImages() {
    const galleryDiv = document.getElementById('property-gallery');
    const loaderBtn = document.querySelector('#gallery-loader button');

    if (!galleryDiv) return;

    const imagesToLoad = globalPropertyImages.slice(globalImageIndex, globalImageIndex + IMAGES_PER_LOAD);

    imagesToLoad.forEach(imagePath => {
        const img = document.createElement('img');
        img.src = imagePath;
        img.alt = 'Otel Detay Görseli';
        img.loading = 'lazy';
        img.onclick = () => openLightbox(imagePath);
        galleryDiv.appendChild(img);
    });

    globalImageIndex += IMAGES_PER_LOAD;

    if (globalImageIndex >= globalPropertyImages.length) {
        if (loaderBtn) loaderBtn.style.display = 'none';
    } else {
        if (loaderBtn) loaderBtn.style.display = 'block';
    }
}

function openLightbox(imageSrc) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    if (lightbox && lightboxImg) {
        lightboxImg.src = imageSrc;
        lightbox.style.display = 'flex';
        // Lightbox için global resim listesini ve indeksi ayarla
        currentImages = globalPropertyImages;
        currentIndex = currentImages.findIndex(img => img === imageSrc);
        updateLightboxNav();
    }
}

function closeLightbox() {
    document.getElementById('lightbox').style.display = 'none';
    const lightboxImg = document.getElementById("lightbox-img");
    if (lightboxImg) {
        lightboxImg.style.transform = 'scale(1)'; 
        lightboxImg.style.cursor = 'zoom-in';
    }
}

function updateLightboxNav() {
    const prevBtn = document.getElementById('lightbox-prev');
    const nextBtn = document.getElementById('lightbox-next');
    if (prevBtn) prevBtn.style.display = (currentIndex > 0) ? 'block' : 'none';
    if (nextBtn) nextBtn.style.display = (currentIndex < currentImages.length - 1) ? 'block' : 'none';
}

function showNextImage() {
    if (currentIndex < currentImages.length - 1) {
        currentIndex++;
        document.getElementById('lightbox-img').src = currentImages[currentIndex];
        updateLightboxNav();
    }
}

function showPrevImage() {
    if (currentIndex > 0) {
        currentIndex--;
        document.getElementById('lightbox-img').src = currentImages[currentIndex];
        updateLightboxNav();
    }
}

document.addEventListener("keydown", function (e) {
    if (document.getElementById('lightbox').style.display === 'flex') {
        if (e.key === "ArrowRight") {
            showNextImage();
        } else if (e.key === "ArrowLeft") {
            showPrevImage();
        } else if (e.key === "Escape") {
            closeLightbox();
        }
    }
});


// === showPage Fonksiyonu (SAYFALARI YÜKLER) ===
async function showPage(pageId) {
    const container = document.getElementById('page-container');
    const hash = `#${pageId}`;
    
    // Ana sayfada (hero) ise ana sayfayı göster
    if (pageId === 'hero') {
        container.innerHTML = '';
        document.getElementById('hero').classList.add('active');
        document.getElementById('house-detail').classList.remove('open');
        document.title = translations[localStorage.getItem('language') || 'tr']?.title || 'WalkABotTravel';
        return;
    }

    document.getElementById('hero').classList.remove('active');
    
    // Detay sayfasıysa (detail-OTEL1 gibi) detay sayfasını göster
    if (pageId.startsWith('detail-')) {
        const key = pageId.substring(7);
        renderHotelDetail(key);
        return;
    } else {
        document.getElementById('house-detail').classList.remove('open');
    }

    // Navigasyonu güncelle
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-page') === pageId) {
            link.classList.add('active');
        }
    });

    // Sayfa başlığını güncelle
    const lang = localStorage.getItem('language') || 'tr';
    const texts = translations[lang];
    if (texts && texts[pageId.replace('page-', '') + '_main_title']) {
        document.title = `${texts[pageId.replace('page-', '') + '_main_title']} | ${texts.title}`;
    }

    // Sayfa önbellekte varsa, oradan yükle
    if (pageCache[pageId]) {
        container.innerHTML = pageCache[pageId];
        updateTexts(lang);
        return;
    }

    // HTML dosyasını yükle
    let fileName = pageId.replace('page-', '');
    
    // Dosya adı eşleşmeleri (projects -> tours)
    if (pageId === 'page-services') fileName = 'services';
    if (pageId === 'page-tours') fileName = 'tours'; // projects yerine tours
    if (pageId === 'page-contact') fileName = 'contact';
    if (pageId === 'page-otel') fileName = 'otel';
    if (pageId === 'page-about') fileName = 'about';

    try {
        const response = await fetch(`${fileName}.html?v=1.6`);
        if (!response.ok) throw new Error(`HTML sayfası yüklenemedi: ${fileName}.html`);
        const html = await response.text();
        
        // Sadece iç içeriği göster
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        const pageContent = tempDiv.querySelector('.page-section');

        if (pageContent) {
            container.innerHTML = pageContent.innerHTML;
            pageCache[pageId] = pageContent.innerHTML;
        } else {
            container.innerHTML = `<section class="page-section"><h2>Sayfa Bulunamadı</h2><p>Hata: .page-section etiketi bulunamadı.</p></section>`;
        }
        
        updateTexts(lang);

    } catch (error) {
        console.error(error);
        container.innerHTML = `<section class="page-section"><h2>Hata</h2><p>${error.message}</p></section>`;
    }
}

// === GENEL İŞLEMLER ===
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Veri ve Dil Yükleme
    try {
        const [galleriesResponse, trResponse, enResponse, arResponse, zhResponse] = await Promise.all([
            fetch('data/galleries.json?v=1.1'),
            fetch('tr.json?v=1.6'),
            fetch('en.json?v=1.6'),
            fetch('ar.json?v=1.6'),
            fetch('zh.json?v=1.6')
        ]);

        allGalleriesData = await galleriesResponse.json();
        translations['tr'] = await trResponse.json();
        translations['en'] = await enResponse.json();
        translations['ar'] = await arResponse.json();
        translations['zh'] = await zhResponse.json();

    } catch (error) {
        console.error("Başlangıç verileri yüklenemedi:", error);
    }

    // 2. Dil ayarını yap
    const storedLang = localStorage.getItem('language') || 'tr';
    await setLanguage(storedLang);

    // 3. Menü Toggle
    const menuToggle = document.getElementById('menu-toggle');
    const navbar = document.getElementById('navbar');
    if (menuToggle && navbar) {
        menuToggle.addEventListener('click', () => {
            navbar.classList.toggle('open');
            menuToggle.querySelector('i').classList.toggle('fa-bars');
            menuToggle.querySelector('i').classList.toggle('fa-times');
        });
    }

    // 4. Header Scroll
    const header = document.getElementById('main-header');
    if (header) {
        const handleScroll = throttle(() => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }, 100);
        window.addEventListener('scroll', handleScroll);
        // İlk yüklemede de kontrol et
        handleScroll();
    }
    
    // 5. Otel kartlarına tıklama olayı
    document.getElementById('page-container').addEventListener('click', (e) => {
        const card = e.target.closest('.property-card');
        if (card) {
            const key = card.getAttribute('data-key');
            if (key) {
                e.preventDefault();
                location.hash = `#detail-${key}`;
            }
        }
    });

    // 6. Geri butonu ve Hash değişimi
    document.body.addEventListener('click', (e) => {
        if (e.target && e.target.classList.contains('btn-page-back')) {
            e.preventDefault();
            const targetHash = e.target.getAttribute('href') || '#hero';
            location.hash = targetHash; 
        }
    });

    window.addEventListener('hashchange', () => {
        const pageId = location.hash.replace('#', '') || 'hero';
        showPage(pageId);
    });

    const initialPage = location.hash.replace('#', '') || 'hero';
    showPage(initialPage);
    
    // 7. Lightbox tıklama
    const lightbox = document.getElementById("lightbox");
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox || e.target.classList.contains('lightbox-nav-btn')) {
                // Nav butonlara tıklayınca kapanmasın
                return;
            } else {
                closeLightbox();
            }
        });
    }
    
});