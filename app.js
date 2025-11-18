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
let allGalleriesData = null; // Galeri verisi kullanılmasa da, yapıyı korumak için tutulabilir.
const pageCache = {}; 

// === GALERİ DEĞİŞKENLERİ: Artık sadece seyahat galerileri için kullanılacak ===
let globalPropertyImages = [];
let globalImageIndex = 0;
const IMAGES_PER_LOAD = 8; // Her seferinde 8 resim yükle
// === GALERİ DEĞİŞKENLERİ SONU ===

// --- Emlak/Restorasyon ile ilgili değişkenler KALDIRILDI (restorationBeforePaths, globalRestorationIndex vb.) ---

// openHouseDetail fonksiyonu Seyahat Galerisine uyarlandı (Artık Destinasyon Galerisi olabilir)
async function openHouseDetail(letter) {
  
  if (!allGalleriesData) {
    try {
      const response = await fetch('data/galleries.json?v=1.1'); 
      if (!response.ok) {
        throw new Error('Galeri verisi data/galleries.json yüklenemedi');
      }
      allGalleriesData = await response.json(); 
    } catch (error) {
      console.error(error);
      return; 
    }
  }

  // ID'ler Emlak/Otel temalı olduğundan değiştirilmedi, ancak içeriği seyahat destinasyonuna göre değişmeli.
  const detail = document.getElementById("house-detail");
  const content = document.getElementById("house-detail-content");
  
  const h = allGalleriesData[letter]; 
  if (!h) {
      console.error(`'${letter}' için detay bulunamadı.`);
      return;
  }
  
  const currentLang = localStorage.getItem('lang') || 'tr';
  const langData = translations[currentLang] || {}; 

  // Dil dosyalarından aranacak anahtarları oluştur (Seyahat Destinasyonuna Uyarlandı)
  const titleKey = `prop_${letter}_title`;
  const locationKey = `prop_${letter}_location`; // Örn: Ülke/Şehir
  const areaKey = `prop_${letter}_duration`; // Örn: Tur Süresi
  const roomsKey = `prop_${letter}_activities`; // Örn: Ana Aktiviteler
  const descKey = `prop_${letter}_desc`;
  const priceKey = `prop_${letter}_price`;

  // Fiyatı dil dosyasından al (bulamazsa galleries.json'dan al)
  const priceText = langData[priceKey] || h.price;
  let priceHTML = '';

  // Otel temalı özel link KALDIRILDI. Artık Rezervasyon linki konulabilir.
  priceHTML = `<p><strong>${langData.js_fiyat || 'Fiyat/Paket'}:</strong> ${priceText}</p>`;
  
  globalPropertyImages = h.images || [];
  globalImageIndex = 0;

  // HTML içeriği güncellendi (Emlak/Otel yerine Seyahat Destinasyonu)
  content.innerHTML = `
    <h2>${langData[titleKey] || h.title}</h2>
    
    <div class="house-info">
      <p><strong>${langData.js_konum || 'Destinasyon'}:</strong> ${langData[locationKey] || h.location}</p>
      <p><strong>${langData.js_alan || 'Süre'}:</strong> ${langData[areaKey] || h.duration}</p>
      <p><strong>${langData.js_oda_sayisi || 'Aktiviteler'}:</strong> ${langData[roomsKey] || h.activities}</p>
      ${priceHTML}
      <p>${langData[descKey] || h.desc}</p>
    </div>

    <div class="detail-gallery" id="detail-gallery-container">
      </div>
    
    <div id="gallery-loader-container" style="text-align: center; margin-top: 20px; margin-bottom: 20px;">
      <button class="btn" onclick="openContactForm()"> Hemen Rezervasyon Yap </button>
    </div>
  `;
  
  // İlk resim grubunu yükle
  loadMorePropertyImages();
  
  detail.style.display = "block";
  document.body.style.overflow = "hidden"; 
}

function closeHouseDetail() {
  const detail = document.getElementById("house-detail");
  if (detail) {
    detail.style.display = "none";
  }
  document.body.style.overflow = "auto"; 
}

// Yeni bir iletişim formuna yönlendirme fonksiyonu eklendi
function openContactForm() {
    closeHouseDetail();
    location.hash = 'page-contact';
}

// === Mülk Galerisi (Satılık/Otel) fonksiyonu Seyahat Galerisine uyarlandı ===
function loadMorePropertyImages() {
  const galleryContainer = document.getElementById('detail-gallery-container');
  const loaderContainer = document.getElementById('gallery-loader-container');

  if (!galleryContainer || !loaderContainer) {
    console.error("Galeri konteynerleri bulunamadı.");
    return;
  }

  // Yüklenecek resim dilimini al
  const imagesToLoad = globalPropertyImages.slice(globalImageIndex, globalImageIndex + IMAGES_PER_LOAD);

  if (imagesToLoad.length === 0 && globalImageIndex === 0) {
     galleryContainer.innerHTML = "<p>Bu galeri için resim bulunamadı.</p>";
     // Sadece rezervasyon butonu kalacak
     loaderContainer.innerHTML = `<button class="btn" onclick="openContactForm()"> Hemen Rezervasyon Yap </button>`;
     return;
  }

  // Resimler için HTML oluştur
  const imagesHTML = imagesToLoad.map(img => 
    `<img loading="lazy" src="${img}" alt="Destinasyon Galeri Resmi" onerror="this.remove()">`
  ).join("");

  // Resimleri galeriye ekle
  galleryContainer.insertAdjacentHTML('beforeend', imagesHTML);

  // İndeksi güncelle
  globalImageIndex += IMAGES_PER_LOAD;

  // Sadece rezervasyon butonu kalacak.
  loaderContainer.innerHTML = ''; 
  
  // Hâlâ yüklenecek resim varsa, butonu tekrar ekle
  if (globalImageIndex < globalPropertyImages.length) {
    const currentLang = localStorage.getItem('lang') || 'tr';
    const langData = translations[currentLang] || {};
    const buttonText = langData.btn_load_more || 'Daha Fazla Göster';
    
    // Rezervasyon butonu altında, daha fazla göster butonu
    loaderContainer.innerHTML = `
        <button class="btn" onclick="openContactForm()"> Hemen Rezervasyon Yap </button>
        <button class="btn btn-secondary" id="load-more-btn" onclick="loadMorePropertyImages()" style="margin-top: 10px;">${buttonText}</button>
    `;
  } else {
    // Tüm resimler yüklendiğinde, sadece rezervasyon butonu kalsın
    loaderContainer.innerHTML = `<button class="btn" onclick="openContactForm()"> Hemen Rezervasyon Yap </button>`;
  }
}
// === Mülk Galerisi SONU ===

// --- Restorasyon Galerisi fonksiyonları KALDIRILDI (setupRestorationGalleries, loadMoreRestorationImages) ---


async function setLanguage(lang) {
    let langData;

    if (translations[lang]) {
        langData = translations[lang];
    } else {
        try {
            const response = await fetch(`${lang}.json`);
            if (!response.ok) {
                throw new Error(`Dil dosyası ${lang}.json yüklenemedi`);
            }
            langData = await response.json(); 
            translations[lang] = langData; 
        } catch (error) {
            console.warn(`Dil dosyası ${lang}.json yüklenemedi veya işlenemedi:`, error);
            if (lang !== 'en') {
                return await setLanguage('en'); 
            }
            return;
        }
    }
    
    document.querySelector('title').textContent = langData['title'];
    document.documentElement.lang = lang; 
    
    if (lang === 'ar') {
        document.documentElement.dir = 'rtl';
    } else {
        document.documentElement.dir = 'ltr';
    }

    document.querySelectorAll('[data-key]').forEach(el => {
        const key = el.getAttribute('data-key');
        if (langData[key]) {
            el.innerHTML = langData[key];
        }
    });

    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-lang') === lang) {
            btn.classList.add('active');
        }
    });
   
    localStorage.setItem('lang', lang);
}

// === showPage fonksiyonu Turizm temasına göre güncellendi ===
async function showPage(pageId) {
    
    // URL hash'i boşsa veya # ise 'hero' sayfasını varsay
    if (!pageId || pageId === '#') pageId = 'hero';

    // Blog ve Guide kısımları zaten index.html'de olduğu için
    if (pageId === 'blog' || pageId === 'guide') {
        const targetSection = document.getElementById(pageId);
        if (targetSection) {
            // Sadece kaydırma yap
            window.scrollTo({
                top: targetSection.offsetTop - 100, // Header yüksekliği kadar offset
                behavior: 'smooth'
            });
            // URL hash'ini güncelle (sonsuz döngüye girmemek için kontrol et)
            if (location.hash.replace('#', '') !== pageId) {
                location.hash = pageId;
            }
        }
        return; 
    }

    // Aktif sayfa sınıfını kaldır (hero'dan başka bir sayfaya geçişte)
    document.querySelectorAll('.page-section').forEach(section => {
        // Hero hariç, dinamik yüklenen tüm sayfaları gizle
        if (section.id !== 'hero' && section.id !== 'blog' && section.id !== 'guide') {
            section.classList.remove('active');
        }
    });

    let newPage = document.getElementById(pageId);
    
    if (!newPage) {
        if (pageCache[pageId]) {
            document.getElementById('page-container').insertAdjacentHTML('beforeend', pageCache[pageId]);
        } else {
            try {
                let fileName = pageId;
                
                // --- Emlak/İnşaat/Otel Sayfa Rotaları KALDIRILDI ve Yerine Seyahat Rotaları Konuldu ---
                if (pageId === 'page-about') fileName = 'about';
                if (pageId === 'page-services') fileName = 'services'; // Destinasyonlar sayfası
                if (pageId === 'page-contact') fileName = 'contact'; // Rezervasyon sayfası
                
                // Artık kullanılmayan emlak/inşaat/otel sayfa rotaları kaldırıldı:
                // if (pageId === 'page-projects') fileName = 'projects';
                // if (pageId === 'page-otel') fileName = 'otel';
                // if (pageId === 'page-insaat') fileName = 'insaat';
                // if (pageId === 'page-restorasyon') fileName = "restorasyon";
                // if (pageId === 'page-satilik_kiralik') fileName = "satilik_kiralik";
                // if (pageId === 'blog-main') fileName = "blog"; 
                // if (pageId === 'blog-featured-home') fileName = "restorasyon"; 
                // if (pageId === 'page-pruva-otel') fileName = "pruva-otel";
                
                if (fileName === pageId || fileName === 'hero') { 
                   /* 'hero' zaten index.html'de */
                } else {
                    const response = await fetch(`${fileName}.html`);
                    if (!response.ok) throw new Error(`Sayfa yüklenemedi: ${fileName}.html`);
                    const html = await response.text();
                    pageCache[pageId] = html; 
                    document.getElementById('page-container').insertAdjacentHTML('beforeend', html);
                }
            } catch (error) {
                console.error(error);
                location.hash = 'hero'; // Hata olursa anasayfaya dön
                return;
            }
        }
        newPage = document.getElementById(pageId);
    }

    if (newPage) {
        
        // URL hash'ini güncelle (sonsuz döngüye girmemek için kontrol et)
        if (location.hash.replace('#', '') !== pageId) {
            location.hash = pageId;
        }

        newPage.classList.add('active');
        window.scrollTo(0, 0); 
        
        const currentLang = localStorage.getItem('lang') || 'tr';
        if (translations[currentLang]) {
            newPage.querySelectorAll('[data-key]').forEach(el => {
                const key = el.getAttribute('data-key');
                if (translations[currentLang][key]) {
                    el.innerHTML = translations[currentLang][key];
                }
            });
        }

        // --- Restorasyon Galerisi kurulumu KALDIRILDI ---
        
        newPage.classList.remove('visible');
        
        setTimeout(() => {
            // Seyahat temasına uygun kart sınıfları korundu
            const cards = newPage.querySelectorAll('.project-card, .latest-card, .service-card, .house-card');
            cards.forEach(card => {
                card.classList.remove('card-fade-in');
                card.style.animationDelay = '';
            });
            cards.forEach((card, index) => {
                card.style.animationDelay = `${index * 100}ms`;
                card.classList.add('card-fade-in');
            });
            newPage.classList.add('visible');
        }, 50);
        
    } else {
        console.error(`Sayfa bulunamadı: ${pageId}`);
        location.hash = 'hero'; // Sayfa bulunamazsa anasayfaya dön
    }
}

function setupMobileMenu() {
    const menuToggle = document.getElementById('menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            const navbar = document.getElementById('navbar');
            if (navbar) {
                navbar.classList.toggle('open');
                const mobileLangSelector = navbar.querySelector('.language-selector.mobile-only');
                if (mobileLangSelector) {
                    mobileLangSelector.style.display = 'flex';
                }
            }
        });
    }

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            const navbar = document.getElementById('navbar');
            if (navbar) {
                navbar.classList.remove('open');
                const mobileLangSelector = navbar.querySelector('.language-selector.mobile-only');
                if (mobileLangSelector) mobileLangSelector.style.display = 'none';
            }
        });
    });
}

function setupScrollReveal() {
    const heroSection = document.getElementById('hero');
    if (heroSection) {
        heroSection.classList.add('visible');
    }
}

// --- projects objesi ve buna bağlı tüm fonksiyonlar (loadCategory, preloadProjectImages, setupProjectReservation) KALDIRILDI ---
// Artık turizm temasına uygun, temiz bir app.js.


document.body.addEventListener('click', (e) => {
    // --- Emlak/Otel rezervasyon ve arama event listener'ları KALDIRILDI ---
    // (project-search, otel-reservation-container, otel-close, otel-search, close-modal-btn)

    // Yeni CTA (Keşfet) butonu
    if (e.target && e.target.id === 'hero-reserve-btn') {
        e.preventDefault();
        location.hash = 'page-contact'; // Rezervasyon sayfasına yönlendir.
    }
});


document.addEventListener('DOMContentLoaded', async () => {
    window.scrollTo(0, 0); 
    
    const desktopLangSelector = document.querySelector('.language-selector.desktop-only');
    const mobileLangSelector = document.querySelector('.language-selector.mobile-only');

    if (window.innerWidth <= 768) {
        if (desktopLangSelector) desktopLangSelector.style.display = 'none';
    } else {
        if (mobileLangSelector) mobileLangSelector.style.display = 'none';
    }
    
    let finalLang = 'tr'; 
    const supportedLangs = ['tr', 'en', 'zh', 'ar'];
    
    const savedLang = localStorage.getItem('lang');
    
    if (savedLang && supportedLangs.includes(savedLang)) {
        finalLang = savedLang;
    } else {
        const browserLang = navigator.language.split('-')[0]; 
        if (supportedLangs.includes(browserLang)) {
            finalLang = browserLang;
        }
    }

    try {
        await setLanguage(finalLang);
    } catch (e) {
        console.error("Dil yüklenemedi:", e);
        await setLanguage('tr'); 
    }
    
    // --- preloadProjectImages çağrısı KALDIRILDI ---
    setupMobileMenu();
    // --- setupProjectReservation çağrısı KALDIRILDI ---

    // === KEŞFET BUTONU (CTA) İÇİN ===
    // HTML'de 'discover-cta' ID'si KALDIRILDIĞI için bu kod bloğu KALDIRILDI.
    // Nav linkleri ve Hero linkleri tüm işlevi görüyor.

   // === Nav linkleri ve Hero linkleri artık hash'i değiştiriyor ===
    document.querySelectorAll('.nav-link[data-page], .btn-hero-link[data-page]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = link.getAttribute('data-page');
            
            // Eğer link zaten bir section ID'sine sahipse (blog, guide), showPage kendisi scroll edecek.
            if (pageId === 'blog' || pageId === 'guide') {
                showPage(pageId);
            } else {
                 // Diğer sayfalarda (about, services, contact) showPage'i çağır
                location.hash = pageId; 
            }
        });
    });  
  
    // === 'Geri' tuşu artık hash'i değiştiriyor ===
    document.body.addEventListener('click', (e) => {
        if (e.target && e.target.classList.contains('btn-page-back')) {
            e.preventDefault();
            const targetHash = e.target.getAttribute('href') || '#hero';
            location.hash = targetHash; 
        }
    });

    // === Hash değişimi ===
    window.addEventListener('hashchange', () => {
        const pageId = location.hash.replace('#', '') || 'hero';
        showPage(pageId);
    });

    const initialPage = location.hash.replace('#', '') || 'hero';
    showPage(initialPage);
}); 


let currentImages = [];
let currentIndex = 0;

document.addEventListener("click", function(e) {
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  
  if (!lightbox || !lightboxImg) return; 

  // SADECE .detail-gallery içindeki resimlere tıklandığında lightbox'ı aç
  const clickedDetailImg = e.target.closest(".detail-gallery img");
  if (clickedDetailImg) {
    // Lightbox'ı açmadan önce sayfa kaydırmayı durdur
    document.body.style.overflow = "hidden";
    
    const gallery = clickedDetailImg.closest(".detail-gallery");
    currentImages = Array.from(gallery.querySelectorAll("img"));
    currentIndex = currentImages.indexOf(clickedDetailImg);
    
    lightboxImg.src = clickedDetailImg.src;
    lightbox.style.display = "flex";

    updateLightboxNav(); 
  }

  // Lightbox'ın dışına (arka plana) veya kapatma butonuna tıklanırsa kapat
  if (e.target.id === "lightbox" || e.target.id === "lightbox-close") {
    lightbox.style.display = "none";
    document.body.style.overflow = "auto"; // Kapatınca sayfa kaydırmayı aç
  }
});

// YENİ FONKSİYON: Butonları gizle/göster
function updateLightboxNav() {
  const prevBtn = document.getElementById('lightbox-prev');
  const nextBtn = document.getElementById('lightbox-next');
  if (!prevBtn || !nextBtn) return;

  // Baştaysak 'Geri' butonunu gizle
  prevBtn.style.display = (currentIndex === 0) ? 'none' : 'flex';
  
  // Sondaysak 'İleri' butonunu gizle
  nextBtn.style.display = (currentIndex === currentImages.length - 1) ? 'none' : 'flex';
}

function showNextImage() {
  if (!currentImages.length) return;
  
  if (currentIndex < currentImages.length - 1) { 
    currentIndex++;
  } else {
    // Sona ulaşıldı, bir şey yapma
    return;
  }
  
  const lightboxImg = document.getElementById("lightbox-img");
  if (lightboxImg) {
    lightboxImg.src = currentImages[currentIndex].src;
    // Zoom sıfırlama
    lightboxImg.style.transition = "transform 0s";
    lightboxImg.style.transform = "scale(1)";
    scale = 1;
    // Kısa bir süre sonra transition'ı geri getir
    setTimeout(() => lightboxImg.style.transition = "transform 0.3s ease", 10);
  }
  updateLightboxNav(); // Butonların durumunu güncelle
}

function showPrevImage() {
  if (!currentImages.length) return;

  if (currentIndex > 0) {
    currentIndex--;
  } else {
    // Başa ulaşıldı, bir şey yapma
    return;
  } 
  
  const lightboxImg = document.getElementById("lightbox-img");
  if (lightboxImg) {
    lightboxImg.src = currentImages[currentIndex].src;
    // Zoom sıfırlama
    lightboxImg.style.transition = "transform 0s";
    lightboxImg.style.transform = "scale(1)";
    scale = 1;
    // Kısa bir süre sonra transition'ı geri getir
    setTimeout(() => lightboxImg.style.transition = "transform 0.3s ease", 10);
  }
  updateLightboxNav(); // Butonların durumunu güncelle
}


document.addEventListener("keydown", function (e) {
  const lightbox = document.getElementById("lightbox");
  if (lightbox && lightbox.style.display === "flex") {
    if (e.key === "ArrowRight") {
      showNextImage();
    } else if (e.key === "ArrowLeft") {
      showPrevImage();
    } else if (e.key === "Escape") {
      lightbox.style.display = "none";
      document.body.style.overflow = "auto"; // ESC ile kapatınca kaydırmayı aç
    }
  }
});

let touchStartX = 0;
let touchEndX = 0;
const swipeThreshold = 50;
const lightboxSwipe = document.getElementById("lightbox"); // ID çakışmasını önlemek için farklı değişken adı

if (lightboxSwipe) {
    lightboxSwipe.addEventListener("touchstart", function(e) {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchEndX = 0;
      }
    }, { passive: true });

    lightboxSwipe.addEventListener("touchmove", function(e) {
      if (e.touches.length === 1) {
        touchEndX = e.touches[0].clientX;
      }
    }, { passive: true });

    lightboxSwipe.addEventListener("touchend", function(e) {
      const lightboxImg = document.getElementById("lightbox-img");
      if (!lightboxImg) return;
      const currentScale = lightboxImg.style.transform ? parseFloat(lightboxImg.style.transform.replace("scale(", "")) : 1;
      
      // Eğer zoom yapılmışsa veya birden fazla parmak varsa swipe'ı engelle
      if (currentScale > 1 || e.touches.length > 0) return;
      if (touchStartX === 0 || touchEndX === 0) return; 
      
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > swipeThreshold) { 
        if (diff > 0) { 
          showNextImage();
        } else { 
          showPrevImage();
        }
      }
      touchStartX = 0;
      touchEndX = 0;
    });
}

let scale = 1;
let startDistance = 0;
const lightboxImgZoom = document.getElementById("lightbox-img");

if (lightboxImgZoom) {
    lightboxImgZoom.addEventListener("touchstart", function (e) {
      if (e.touches.length === 2) {
        e.preventDefault();
        const dx = e.touches[0].pageX - e.touches[1].pageX;
        const dy = e.touches[0].pageY - e.touches[1].pageY;
        startDistance = Math.hypot(dx, dy);
      }
    }, { passive: false });

    lightboxImgZoom.addEventListener("touchmove", function (e) {
      if (e.touches.length === 2) {
        e.preventDefault();
        const dx = e.touches[0].pageX - e.touches[1].pageX;
        const dy = e.touches[0].pageY - e.touches[1].pageY;
        const newDistance = Math.hypot(dx, dy);
        // Minimum zoom 1, maksimum zoom 3
        let pinchScale = newDistance / startDistance;
        scale = Math.min(Math.max(1, pinchScale), 3);
        lightboxImgZoom.style.transform = `scale(${scale})`;
      }
    }, { passive: false });

    lightboxImgZoom.addEventListener("touchend", function () {
      // Bırakıldığında scale 1'den büyükse, yumuşakça 1'e geri dön
      if (scale !== 1) {
        lightboxImgZoom.style.transition = "transform 0.3s ease";
        lightboxImgZoom.style.transform = "scale(1)";
        scale = 1;
        // Animasyon bitince transition'ı kaldır
        setTimeout(() => lightboxImgZoom.style.transition = "", 300);
      }
    });
}

// --- Restorasyon modalı ile ilgili tüm event listener ve fonksiyonlar KALDIRILDI ---
// (document.body.addEventListener('click', (e) => { ... restorationImageModal ... }), closeImageModal)