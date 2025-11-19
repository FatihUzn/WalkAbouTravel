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

let globalPropertyImages = [];
let globalImageIndex = 0;
const IMAGES_PER_LOAD = 8; 

// Turizm dönüşümü için statik restorasyon yolları temizlendi
const restorationBeforePaths = [];
const restorationAfterPaths = [];
let globalRestorationBeforeIndex = 0;
let globalRestorationAfterIndex = 0;

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

  const detail = document.getElementById("house-detail");
  const content = document.getElementById("house-detail-content");
  
  const h = allGalleriesData[letter]; 
  if (!h) {
      console.error(`'${letter}' için detay bulunamadı.`);
      return;
  }
  
  const currentLang = localStorage.getItem('lang') || 'tr';
  const langData = translations[currentLang] || {}; 

  const titleKey = `prop_${letter}_title`;
  const locationKey = `prop_${letter}_location`;
  const areaKey = `prop_${letter}_area`;
  const roomsKey = `prop_${letter}_rooms`;
  const descKey = `prop_${letter}_desc`;
  const priceKey = `prop_${letter}_price`;

  const priceText = langData[priceKey] || h.price;
  let priceHTML = '';
  let mailButtonHTML = '';

  // === TURİZM DÖNÜŞÜMÜ: Fiyat linki ve butonu ===
  if (letter.startsWith('OTEL') || letter.length === 1) { 
      priceHTML = `<p><strong>${langData.js_fiyat || 'Tur Fiyatı'}:</strong> ${priceText}</p>`;
      
      mailButtonHTML = `
          <div style="text-align: center; margin-top: 30px;">
              <a href="mailto:info@walkaboutravel.com?subject=Turizm%20Sorgulama%20-%20${encodeURIComponent(langData[titleKey] || h.title)}" class="btn" style="padding: 12px 25px; font-size: 16px; background: var(--blue-dark); border-color: var(--blue-light); color: var(--text); text-decoration: none;">
                  ${langData.btn_mail_reserve || 'E-posta ile Bilgi Al'}
              </a>
          </div>`;

  } else {
      // Emlak/Fallback
      priceHTML = `<p><strong>${langData.js_fiyat || 'Fiyat'}:</strong> ${priceText}</p>`;
  }
  
  globalPropertyImages = h.images || [];
  globalImageIndex = 0;

  // === HTML içeriğini güncelle (Turizm terimleri kullanılarak) ===
  content.innerHTML = `
    <h2>${langData[titleKey] || h.title}</h2>
    
    <div class="house-info">
      <p><strong>${langData.js_konum || 'Destinasyon'}:</strong> ${langData[locationKey] || h.location}</p>
      <p><strong>${langData.js_alan || 'Süre'}:</strong> ${langData[areaKey] || h.area}</p>
      <p><strong>${langData.js_oda_sayisi || 'Kişi Sayısı'}:</strong> ${langData[roomsKey] || h.rooms}</p>
      ${priceHTML}
      <p style="font-style: italic; color: var(--text-muted); margin-top: 20px;">${langData[descKey] || h.desc}</p>
    </div>

    <div class="detail-gallery" id="detail-gallery-container">
    </div>
    
    <div id="gallery-loader-container" style="text-align: center; margin-top: 20px; margin-bottom: 20px;">
    </div>
    
    ${mailButtonHTML || ''}
  `;
  
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

function loadMorePropertyImages() {
  const galleryContainer = document.getElementById('detail-gallery-container');
  const loaderContainer = document.getElementById('gallery-loader-container');

  if (!galleryContainer || !loaderContainer) {
    return;
  }

  const imagesToLoad = globalPropertyImages.slice(globalImageIndex, globalImageIndex + IMAGES_PER_LOAD);

  if (imagesToLoad.length === 0 && globalImageIndex === 0) {
     galleryContainer.innerHTML = "<p>Bu tur/destinasyon için resim bulunamadı.</p>";
     loaderContainer.innerHTML = "";
     return;
  }

  const imagesHTML = imagesToLoad.map(img => 
    `<img loading="lazy" src="${img}" alt="Galeri Resmi" onerror="this.remove()">`
  ).join("");

  galleryContainer.insertAdjacentHTML('beforeend', imagesHTML);

  globalImageIndex += IMAGES_PER_LOAD;

  loaderContainer.innerHTML = '';

  if (globalImageIndex < globalPropertyImages.length) {
    const currentLang = localStorage.getItem('lang') || 'tr';
    const langData = translations[currentLang] || {};
    const buttonText = langData.btn_load_more || 'Daha Fazla Göster';
    
    loaderContainer.innerHTML = `<button class="btn" id="load-more-btn" onclick="loadMorePropertyImages()">${buttonText}</button>`;
  }
}

// === TURİZM DÖNÜŞÜMÜ: Blog/Hikaye Galerisi Kurulumu (Basitleştirilmiş) ===
function setupRestorationGalleries() {
    
    const beforeGallery = document.getElementById('restoration-gallery-before');
    const afterGallery = document.getElementById('restoration-gallery-after');

    if (beforeGallery && afterGallery) {
        
        const currentLang = localStorage.getItem('lang') || 'tr';
        const langData = translations[currentLang] || {};
        
        const blogPostTitle = document.getElementById('blog-post-title');
        const blogContentArea = document.getElementById('blog-content-area');
        
        if (blogPostTitle) blogPostTitle.textContent = langData.restoration_hub_card_1 || 'Peru: İnka Yolu Macerası';
        
        if (blogContentArea) {
            blogContentArea.innerHTML = `
                <p>WalkAbouTravel Ekibi olarak bu ayki rotamız, Güney Amerika'nın kalbi Peru'ya ve efsanevi <strong>İnka Yolu'na</strong> oldu. Bu, sadece bir yürüyüş değil, aynı zamanda tarihin ve doğanın derinliklerine yapılan mistik bir yolculuktu.</p>
                
                <h4 style="color: var(--blue-dark); margin-top: 30px;">Gezgin Görüşü (data-key="restoration_before" içeriği)</h4>
                <p>Trekking zorluydu ama her adım, Machu Picchu'nun büyüleyici manzarasıyla ödüllendirildi. Hava inceldiği için nefes almak zorlaşsa da, yerel rehberlerimizin bilgisi ve enerjisi sayesinde motivasyonumuz hiç düşmedi.</p>

                <h4 style="color: var(--blue-dark); margin-top: 30px;">Destinasyon Bilgisi (data-key="restoration_after" içeriği)</h4>
                <p>İnka Yolu için en uygun dönem kuru mevsimdir (Mayıs-Ekim arası). İzinler sınırlıdır ve aylar öncesinden rezerve edilmelidir. Yürüyüşe başlamadan önce 2-3 gün Cusco'da rakıma alışmak hayati önem taşır. Paket turlarımız vize ve izin işlemlerini kapsamaktadır.</p>

                <div class="restoration-gallery detail-gallery" id="restoration-gallery-after">
                    <img loading="lazy" src="assets/restorasyon-1-after.webp" alt="Machu Picchu Manzarası" onerror="this.src='https://placehold.co/350x260/111/f59e0b?text=Blog+1'">
                    <img loading="lazy" src="assets/restorasyon-2-after.webp" alt="İnka Yolu" onerror="this.src='https://placehold.co/350x260/111/f59e0b?text=Blog+2'">
                    <img loading="lazy" src="assets/restorasyon-3-after.webp" alt="Yerel Halk" onerror="this.src='https://placehold.co/350x260/111/f59e0b?text=Blog+3'">
                </div>
            `;
        }
        
        beforeGallery.innerHTML = ''; 
        afterGallery.innerHTML = '';
        
        const beforeLoader = document.getElementById('restoration-loader-before');
        const afterLoader = document.getElementById('restoration-loader-after');
        if (beforeLoader) beforeLoader.innerHTML = '';
        if (afterLoader) afterLoader.innerHTML = '';
    }
}

function loadMoreRestorationImages(galleryType) {
    // Bloga dönüştürdüğümüz için bu mantık artık kullanılmayacak
}


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

// HATA DÜZELTME BURADA YAPILDI: langData is not defined
async function showPage(pageId) {
    
    if (!pageId || pageId === '#') pageId = 'hero';

    document.querySelectorAll('.page-section').forEach(section => {
        section.classList.remove('active');
    });

    let newPage = document.getElementById(pageId);
    
    if (!newPage) {
        if (pageCache[pageId]) {
            document.getElementById('page-container').insertAdjacentHTML('beforeend', pageCache[pageId]);
        } else {
            try {
                let fileName = pageId;
                if (pageId === 'page-about') fileName = 'about';
                if (pageId === 'page-services') fileName = 'services';
                if (pageId === 'page-projects') fileName = 'projects';
                if (pageId === 'page-contact') fileName = 'contact';
                if (pageId === 'page-otel') fileName = 'otel';
                if (pageId === 'page-insaat') fileName = 'insaat';
                if (pageId === 'page-restorasyon') fileName = "restorasyon";
                if (pageId === 'page-satilik_kiralik') fileName = "satilik_kiralik";
                
                if (pageId === 'page-pruva-otel') fileName = "pruva-otel";

                if (fileName === pageId) { 
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
                location.hash = 'hero'; 
                return;
            }
        }
        newPage = document.getElementById(pageId);
    }

    if (newPage) {
        
        if (location.hash.replace('#', '') !== pageId) {
            location.hash = pageId;
        }

        newPage.classList.add('active');
        window.scrollTo(0, 0); 
        
        const currentLang = localStorage.getItem('lang') || 'tr';
        if (translations[currentLang]) {
            const currentLangData = translations[currentLang]; // Düzeltildi
            
            newPage.querySelectorAll('[data-key]').forEach(el => {
                const key = el.getAttribute('data-key');
                if (currentLangData[key]) {
                    el.innerHTML = currentLangData[key]; // Düzeltildi
                }
            });
        }

        if (pageId === 'page-pruva-otel') {
          setupRestorationGalleries();
        }

        newPage.classList.remove('visible');
        
        setTimeout(() => {
            const cards = newPage.querySelectorAll('.project-card, .latest-card, .service-card, .house-card, .restoration-card');
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
        location.hash = 'hero'; 
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

const projects = {
  otel: [],
  insaat: [],
  restorasyon: [],
  satilik_kiralik: []
};

function preloadProjectImages() {
    console.log("Proje görselleri arka planda yükleniyor. (Pasif)");
}

function loadCategory(category, checkin = null, checkout = null) {
    // Artık kullanılmıyor
}

function setupProjectReservation() {
    // Artık kullanılmıyor
}


document.body.addEventListener('click', (e) => {
    
    // Otel sorgulama butonu mantığı (Eğer form tekrar eklenirse kullanılabilir)
    if (e.target && e.target.id === 'otel-search') {
        const modal = document.getElementById("availability-modal");
        const message = document.getElementById("availability-message");
        if (!modal || !message) return;

        const currentLang = localStorage.getItem('lang') || 'tr';
        const langData = translations[currentLang] || {};

        const checkin = document.getElementById("otel-checkin").value;
        const checkout = document.getElementById("otel-checkout").value;

        if (!checkin || !checkout) {
            message.innerHTML = langData.modal_avail_alert_select || '⚠️ Lütfen başlangıç ve dönüş tarihlerini seçin.';
            modal.classList.add("show");
            return;
        }

        const oldMailBtn = message.parentElement.querySelector('.btn-mail');
        if (oldMailBtn) oldMailBtn.remove();

        const random = Math.random();
        if (random > 0.5) {
            message.innerHTML = langData.modal_avail_success || '✅ Uygun tur paketleri bulundu!';
            
            const mailBtn = document.createElement("a");
            mailBtn.textContent = langData.btn_mail_reserve || 'E-posta ile Bilgi Al';
            mailBtn.classList.add("btn", "btn-mail");
            mailBtn.style.marginTop = "15px";
            mailBtn.href = "#";

            mailBtn.addEventListener("click", (e) => {
                e.preventDefault();
                const subject = encodeURIComponent("Turizm Sorgulama - WalkAbouTravel");
                const body = encodeURIComponent(`Merhaba,%0A%0A${checkin} - ${checkout} tarihleri arasında tur paketi sorgulamak istiyorum.%0A%0Aİyi günler.%0A%0A`);
                window.location.href = `mailto:info@walkaboutravel.com?subject=${subject}&body=${body}`;
            });

            message.parentElement.appendChild(mailBtn);
        } else {
            message.innerHTML = langData.modal_avail_fail || '❌ Maalesef bu tarihlerde uygun tur paketi bulunamadı.';
        }

        modal.classList.add("show");
    }

    if (e.target && e.target.id === 'close-modal-btn') {
        const modal = document.getElementById("availability-modal");
        if (modal) modal.classList.remove("show");
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
    
    setupMobileMenu();
    setupProjectReservation(); 

    document.querySelectorAll('.nav-link[data-page], .btn-hero-link[data-page]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = link.getAttribute('data-page');
            location.hash = pageId; 
        });
    });  
    document.body.addEventListener('click', (e) => {
        if (e.target && e.target.classList.contains('btn-page-back')) {
            e.preventDefault();
            const targetHash = e.target.getAttribute('href') || '#hero';
            location.hash = targetHash.replace('#', '');
        }
    });

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

  const clickedDetailImg = e.target.closest(".detail-gallery img");
  if (clickedDetailImg) {
    const gallery = clickedDetailImg.closest(".detail-gallery");
    currentImages = Array.from(gallery.querySelectorAll("img"));
    currentIndex = currentImages.indexOf(clickedDetailImg);
    
    lightboxImg.src = clickedDetailImg.src;
    lightbox.style.display = "flex";

    updateLightboxNav(); 
  }

  if (e.target.id === "lightbox") {
    lightbox.style.display = "none";
  }
});

function updateLightboxNav() {
  const prevBtn = document.getElementById('lightbox-prev');
  const nextBtn = document.getElementById('lightbox-next');
  if (!prevBtn || !nextBtn) return;

  prevBtn.style.display = (currentIndex === 0) ? 'none' : 'block';
  nextBtn.style.display = (currentIndex === currentImages.length - 1) ? 'none' : 'block';
}

function showNextImage() {
  if (!currentImages.length) return;
  
  if (currentIndex < currentImages.length - 1) { 
    currentIndex++;
  }
  
  const lightboxImg = document.getElementById("lightbox-img");
  if (lightboxImg) {
    lightboxImg.src = currentImages[currentIndex].src;
    lightboxImg.style.transition = "transform 0s";
    lightboxImg.style.transform = "scale(1)";
    scale = 1;
  }
  updateLightboxNav(); 
}

function showPrevImage() {
  if (!currentImages.length) return;

  if (currentIndex > 0) {
    currentIndex--;
  } 
  
  const lightboxImg = document.getElementById("lightbox-img");
  if (lightboxImg) {
    lightboxImg.src = currentImages[currentIndex].src;
    lightboxImg.style.transition = "transform 0s";
    lightboxImg.style.transform = "scale(1)";
    scale = 1;
  }
  updateLightboxNav(); 
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
    }
  }
});

let touchStartX = 0;
let touchEndX = 0;
const swipeThreshold = 50;
const lightbox = document.getElementById("lightbox");

if (lightbox) {
    lightbox.addEventListener("touchstart", function(e) {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchEndX = 0;
      }
    }, { passive: true });

    lightbox.addEventListener("touchmove", function(e) {
      if (e.touches.length === 1) {
        touchEndX = e.touches[0].clientX;
      }
    }, { passive: true });

    lightbox.addEventListener("touchend", function(e) {
      const lightboxImg = document.getElementById("lightbox-img");
      if (!lightboxImg) return;
      const currentScale = lightboxImg.style.transform ? parseFloat(lightboxImg.style.transform.replace("scale(", "")) : 1;
      
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
const lightboxImg = document.getElementById("lightbox-img");

if (lightboxImg) {
    lightboxImg.addEventListener("touchstart", function (e) {
      if (e.touches.length === 2) {
        e.preventDefault();
        const dx = e.touches[0].pageX - e.touches[1].pageX;
        const dy = e.touches[0].pageY - e.touches[1].pageY;
        startDistance = Math.hypot(dx, dy);
      }
    }, { passive: false });

    lightboxImg.addEventListener("touchmove", function (e) {
      if (e.touches.length === 2) {
        e.preventDefault();
        const dx = e.touches[0].pageX - e.touches[1].pageX;
        const dy = e.touches[0].pageY - e.touches[1].pageY;
        const newDistance = Math.hypot(dx, dy);
        let pinchScale = newDistance / startDistance;
        scale = Math.min(Math.max(1, pinchScale), 3);
        lightboxImg.style.transform = `scale(${scale})`;
      }
    }, { passive: false });

    lightboxImg.addEventListener("touchend", function () {
      if (scale !== 1) {
        lightboxImg.style.transition = "transform 0.3s ease";
        lightboxImg.style.transform = "scale(1)";
        scale = 1;
        setTimeout(() => lightboxImg.style.transition = "", 300);
      }
    });
}

document.body.addEventListener('click', (e) => {
    const modalOverlay = document.getElementById('restorationImageModal');
    if (!modalOverlay) return;

    if (e.target.closest('.image-modal-close-btn')) {
        closeImageModal();
    }
    if (e.target === modalOverlay) {
        closeImageModal();
    }

    const card = e.target.closest('.restoration-card');
    if (card && (e.target.closest('.img-wrapper') || e.target.closest('.img-comparison-container'))) {
        const modalBeforeImage = document.getElementById('modalBeforeImage');
        const modalAfterImage = document.getElementById('modalAfterImage');
        
        const beforeImg = card.querySelector('.img-wrapper:first-child img');
        const afterImg = card.querySelector('.img-wrapper:last-child img');

        if (beforeImg && afterImg && modalBeforeImage && modalAfterImage) {
            modalBeforeImage.src = beforeImg.src;
            modalAfterImage.src = afterImg.src;
            modalOverlay.classList.add('show');
        }
    }
});

function closeImageModal() {
    const modalOverlay = document.getElementById('restorationImageModal');
    const modalBeforeImage = document.getElementById('modalBeforeImage');
    const modalAfterImage = document.getElementById('modalAfterImage');
    
    if (modalOverlay) modalOverlay.classList.remove('show');
    if (modalBeforeImage) modalBeforeImage.src = '';
    if (modalAfterImage) modalAfterImage.src = '';
}

document.addEventListener('keydown', (event) => {
    const modalOverlay = document.getElementById('restorationImageModal');
    if (event.key === 'Escape' && modalOverlay && modalOverlay.classList.contains('show')) {
        closeImageModal();
    }
});