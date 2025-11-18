// Global değişkenler ve cache
let translations = {};
let currentLanguage = 'tr';
let pageCache = {};
let allGalleriesData = {}; 
let currentGalleryId = null; // Lightbox için o anki galeri ID'si
let currentImageIndex = 0;   // Lightbox için o anki görsel indeksi
let isProcessing = false;

// === Yardımcı Fonksiyonlar ===

// Lightbox detay alanlarını oluşturur ve DOM'a ekler
function createLightboxDetails() {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;

    // Lightbox detay konteynerini ekle (4. Adım Çözümü)
    const detailsHtml = `
        <div class="lightbox-details-container">
            <h3 id="lightbox-title"></h3>
            <p class="lightbox-desc" id="lightbox-desc"></p>
            <div class="lightbox-info-grid">
                <div>
                    <i class="fas fa-map-marker-alt"></i>
                    <span id="lightbox-location"></span>
                </div>
                <div>
                    <i class="fas fa-expand-arrows-alt"></i>
                    <span id="lightbox-area"></span>
                </div>
                <div>
                    <i class="fas fa-bed"></i>
                    <span id="lightbox-rooms"></span>
                </div>
            </div>
            <a href="mailto:info@walkabottravel.com" class="btn btn-mail-reserve" data-key="btn_mail_reserve">E-posta ile Rezervasyon Yap</a>
        </div>
    `;
    lightbox.insertAdjacentHTML('beforeend', detailsHtml);
}

// Lightbox detaylarını günceller
function updateLightboxDetails(galleryId) {
    const data = allGalleriesData[galleryId];
    if (!data) return;

    document.getElementById('lightbox-title').textContent = data.title;
    document.getElementById('lightbox-desc').textContent = data.desc;
    document.getElementById('lightbox-location').textContent = data.location;
    document.getElementById('lightbox-area').textContent = data.area;
    document.getElementById('lightbox-rooms').textContent = data.rooms;
    
    // Lightbox'taki rezervasyon butonunun dilini güncelle
    const reserveBtn = document.querySelector('.btn-mail-reserve');
    if (reserveBtn) {
        reserveBtn.textContent = translations[currentLanguage]?.btn_mail_reserve || 'E-posta ile Rezervasyon Yap';
    }
}

// Görseli açar ve detayları yükler (4. Adım Çözümü)
function openLightbox(galleryId, initialIndex = 0) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const data = allGalleriesData[galleryId];

    if (!lightbox || !lightboxImg || !data || data.images.length === 0) return;

    currentGalleryId = galleryId;
    currentImageIndex = initialIndex;

    lightboxImg.src = data.images[currentImageIndex];
    lightbox.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // Detayları güncelle
    updateLightboxDetails(galleryId);
    // Navigasyon butonlarını kontrol et
    checkLightboxNav();
}

// Lightbox'ı kapatır
function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.style.display = 'none';
        document.body.style.overflow = '';
        currentGalleryId = null;
    }
}

// Lightbox içinde bir sonraki görseli gösterir
function showNextImage() {
    const data = allGalleriesData[currentGalleryId];
    if (!data) return;

    currentImageIndex = (currentImageIndex + 1) % data.images.length;
    document.getElementById('lightbox-img').src = data.images[currentImageIndex];
    checkLightboxNav();
}

// Lightbox içinde bir önceki görseli gösterir
function showPrevImage() {
    const data = allGalleriesData[currentGalleryId];
    if (!data) return;

    currentImageIndex = (currentImageIndex - 1 + data.images.length) % data.images.length;
    document.getElementById('lightbox-img').src = data.images[currentImageIndex];
    checkLightboxNav();
}

// Lightbox navigasyon butonlarını kontrol eder (gerekliyse)
function checkLightboxNav() {
    const data = allGalleriesData[currentGalleryId];
    const prevBtn = document.getElementById('lightbox-prev');
    const nextBtn = document.getElementById('lightbox-next');

    if (prevBtn && nextBtn) {
        if (data && data.images.length > 1) {
            prevBtn.style.display = 'block';
            nextBtn.style.display = 'block';
        } else {
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'none';
        }
    }
}

// Galeri öğesini oluşturur
function createGalleryItem(galleryId, data) {
    const item = document.createElement('div');
    item.classList.add('house-card', 'property-card');
    item.dataset.galleryId = galleryId;
    
    // Görsel üzerine tıklama olayını ekle
    item.onclick = (e) => {
        // Lightbox'ı açarken tıklanan resmin indexini bul
        const img = e.currentTarget.querySelector('img');
        if (img) {
            const index = data.images.findIndex(src => src === img.getAttribute('src'));
            openLightbox(galleryId, index !== -1 ? index : 0);
        } else {
            openLightbox(galleryId, 0);
        }
    };

    // Galeri içeriğini oluştur
    const html = `
        <img loading="lazy" src="${data.images[0]}" alt="${data.title}" onerror="this.src='https://placehold.co/380x280/111/00CED1?text=${data.title.replace(' ', '+')}'">
        <div class="card-content">
            <h3 class="card-title">${data.title}</h3>
            <div class="card-info">
                <p>
                    <i class="fas fa-expand-arrows-alt"></i> 
                    <span data-key="page_otel_room_area">Alan:</span> ${data.area}
                </p>
                <p>
                    <i class="fas fa-bed"></i> 
                    <span data-key="page_otel_room_rooms">Oda Sayısı:</span> ${data.rooms}
                </p>
            </div>
            <a href="#page-pruva-otel" class="btn btn-page-detail" style="display: none;">Detaylı İncele</a>
        </div>
    `;
    item.innerHTML = html;
    
    // Metinleri çevir
    translateElement(item);
    
    return item;
}

// Otel galeri içeriğini render eder
function renderOtelGallery() {
    const container = document.getElementById('otel-gallery-container');
    if (!container) return;
    
    // Önceki içeriği temizle
    container.innerHTML = ''; 

    // Galeri verilerini döngüye al
    for (const galleryId in allGalleriesData) {
        if (allGalleriesData.hasOwnProperty(galleryId)) {
            const item = createGalleryItem(galleryId, allGalleriesData[galleryId]);
            container.appendChild(item);
        }
    }
}


// === Dil Yönetimi ===

// DOM öğesindeki tüm metinleri çevirir
function translateElement(element) {
    if (!element) return;
    
    element.querySelectorAll('[data-key]').forEach(el => {
        const key = el.getAttribute('data-key');
        const translation = translations[currentLanguage]?.[key];
        if (translation) {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = translation; // Input'lar için placeholder çevirisi
            } else {
                el.textContent = translation; // Normal metin çevirisi
            }
        }
    });
}

// Yeni dili ayarlar ve tüm sayfayı çevirir
function setLanguage(lang) {
    if (!translations[lang]) {
        console.warn(`Dil dosyası (${lang}.json) yüklenmedi veya mevcut değil.`);
        return;
    }
    
    currentLanguage = lang;
    localStorage.setItem('language', lang);

    // Aktif dil düğmesini vurgula
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-lang') === lang) {
            btn.classList.add('active');
        }
    });

    // Tüm DOM'u çevir
    translateElement(document.body);
    // Otel galeri kartlarındaki metinleri tekrar çevir (içerikleri dinamik oluşturuluyor)
    document.querySelectorAll('.house-card').forEach(card => translateElement(card));
    
    // HTML dil özelliğini güncelle (Arapça için sağdan sola desteği)
    document.documentElement.lang = lang;
    document.body.style.direction = lang === 'ar' ? 'rtl' : 'ltr';
    
    // Lightbox detaylarını güncelle
    if (currentGalleryId) {
        updateLightboxDetails(currentGalleryId);
    }
}


// === Sayfa Yönetimi ===

// Sayfa içeriğini dinamik olarak yükler (2. Adım Çözümü)
async function loadHtmlContent(pageId) {
    if (pageCache[pageId]) return; // Cache'de varsa yükleme

    let url;
    if (pageId === 'services') {
        url = 'services.html';
    } else if (pageId === 'tours') {
        url = 'tours.html';
    } else if (pageId === 'otel') { 
        url = 'otel.html';
    } else if (pageId === 'page-about') {
        url = 'about.html'; 
    } else if (pageId === 'page-pruva-otel') {
        url = 'pruva-otel.html';
    } else {
        return; 
    }
    
    if (url) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTML sayfası yüklenemedi: ${url}`);

            const htmlContent = await response.text();
            
            // Yüklenen içeriği cache'e ekle
            pageCache[pageId] = htmlContent;
            
            // Ana konteynere ekle (index.html'deki main etiketi)
            const pageContainer = document.getElementById('page-container');
            if (pageContainer) {
                pageContainer.insertAdjacentHTML('beforeend', htmlContent);
            }
        } catch (error) {
            console.error(`HTML içeriği yüklenirken hata: ${url}`, error);
        }
    }
}

// Belirli bir sayfayı gösterir
async function showPage(pageId) {
    // Navigasyon linklerini güncelle
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-page') === pageId) {
            link.classList.add('active');
        }
    });

    const isInternalPage = ['page-pruva-otel'].includes(pageId);
    
    if (pageId !== 'hero') {
        // İçerik yükleme gerektiren sayfaları yükle
        await loadHtmlContent(pageId); 
    }
    
    // Sayfa içeriklerini göster/gizle
    document.querySelectorAll('.page-section').forEach(section => {
        if (section.id === pageId) {
            section.style.display = 'block';
            section.classList.add('active');
            
            // Otel sayfası yüklendikten sonra galeriyi render et
            if (section.id === 'page-otel' && Object.keys(allGalleriesData).length > 0) {
                renderOtelGallery();
            }
            
            // Metinleri tekrar çevir
            translateElement(section);

        } else if (isInternalPage && section.id === 'page-otel' && pageId === 'page-pruva-otel') {
            // Pruva otel sayfası gösterilirken otel galerisi gizlenmeli.
            section.style.display = 'none';
            section.classList.remove('active');
        } else if (section.id === 'hero' && pageId !== 'hero') {
            section.style.display = 'none'; // hero sayfasını gizle
        } else if (section.id !== 'hero') {
            section.style.display = 'none';
            section.classList.remove('active');
        }
    });

    // Hash'i ayarla ve sayfa başına git
    if (pageId) {
        history.pushState(null, null, `#${pageId}`);
    }
    
    // Sayfa başına kaydır
    document.getElementById(pageId)?.scrollIntoView({ behavior: 'smooth' });

    // Mobil menüyü kapat
    if (document.body.classList.contains('menu-open')) {
        document.body.classList.remove('menu-open');
    }
}


// === Olay Dinleyicileri ve Başlatma ===

// === Veri Yükleme (Diller ve Galeri) === (1. Adım Çözümü)
async function loadAllData() {
    try {
        // Dil dosyalarını yükle: Tüm diller eklendi.
        const langFiles = ['tr', 'en', 'ar', 'zh'];
        for (const lang of langFiles) {
            try {
                const response = await fetch(`${lang}.json`);
                if (response.ok) {
                    translations[lang] = await response.json();
                } else {
                    console.warn(`[UYARI] Dil dosyası yüklenemedi: ${lang}.json (HTTP Hata: ${response.status})`);
                }
            } catch (err) {
                console.warn(`[UYARI] Dil dosyası yüklenirken kritik hata: ${lang}.json`, err);
            }
        }
        
        // Galeri verilerini yükle (Yolu 'galleries.json' olarak düzeltildi)
        const galleryResponse = await fetch('galleries.json?v=1.1'); 
        if (!galleryResponse.ok) {
             throw new Error('Kritik Hata: galleries.json verisi yüklenemedi.');
        }
        allGalleriesData = await galleryResponse.json();

        // Lightbox detaylarını bir kere oluştur
        createLightboxDetails();

        // Veriler yüklendikten sonra başlangıç ayarlarını yap
        const initialLang = localStorage.getItem('language') || 'tr';
        setLanguage(initialLang); 
        
        const initialPage = location.hash.replace('#', '') || 'hero';
        showPage(initialPage);
        
    } catch (error) {
        console.error('KRİTİK HATA: Uygulama verileri yüklenirken bir sorun oluştu:', error);
        // Hata durumunda, kullanıcının siteyi kullanabilmesi için en azından varsayılan sayfayı göster
        showPage('hero'); 
    }
}


document.addEventListener('DOMContentLoaded', () => {
    loadAllData();

    // Navigasyon tıklama olayları
    document.body.addEventListener('click', (e) => {
        // Navigasyon linkleri için
        const link = e.target.closest('a[data-page], .btn-page-back');
        if (link) {
            const pageId = link.getAttribute('data-page') || link.getAttribute('href')?.replace('#', '');
            if (pageId && pageId !== '#') {
                e.preventDefault();
                showPage(pageId);
            }
        }
    });

    // Mobil menü
    document.getElementById('menu-toggle').addEventListener('click', () => {
        document.body.classList.toggle('menu-open');
    });

    // Lightbox kapatma (arka plana tıklama)
    document.getElementById('lightbox').addEventListener('click', (e) => {
        if (e.target.id === 'lightbox' || e.target.classList.contains('lightbox-close-btn')) {
            closeLightbox();
        }
    });

    // Lightbox kapatma (ESC tuşu)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && document.getElementById('lightbox').style.display === 'flex') {
            closeLightbox();
        }
        // Lightbox içinde ok tuşları ile gezme
        if (document.getElementById('lightbox').style.display === 'flex' && currentGalleryId) {
            if (e.key === 'ArrowRight') {
                showNextImage();
            } else if (e.key === 'ArrowLeft') {
                showPrevImage();
            }
        }
    });

    // Header scroll efekti
    window.addEventListener('scroll', () => {
        const header = document.getElementById('main-header');
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
});