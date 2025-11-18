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
const IMAGES_PER_LOAD = 8; // Her seferinde 8 resim yükle
// === YENİ EKLEMELER SONU ===


async function openHouseDetail(letter) {
  
  // Sadece otel için kullanılacaksa, bu kontrolü ekleyin:
  // if (!letter.startsWith('OTEL')) return;
  
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
  
  // Orijinal veriyi (fallback için) al
  const h = allGalleriesData[letter]; 
  if (!h) {
      console.error(`'${letter}' için ev detayı bulunamadı.`);
      return;
  }
  
  // Geçerli dili ve dil verisini al
  const currentLang = localStorage.getItem('lang') || 'tr';
  const langData = translations[currentLang] || {}; 

  // Dil dosyalarından aranacak anahtarları oluştur
  const titleKey = `prop_${letter}_title`;
  const locationKey = `prop_${letter}_location`;
  const areaKey = `prop_${letter}_area`;
  const roomsKey = `prop_${letter}_rooms`;
  const descKey = `prop_${letter}_desc`;
  const priceKey = `prop_${letter}_price`;

  // Fiyatı dil dosyasından al (bulamazsa galleries.json'dan al)
  const priceText = langData[priceKey] || h.price;
  let priceHTML = '';

  // Bu bölüm sadece OTEL için güncellendi
  if (letter.startsWith('OTEL')) {
      // Fiyat kısmı için yer tutucu link bırakıldı
      priceHTML = `<p><strong>${langData.js_fiyat || 'Fiyat'}:</strong> <a href="#" target="_blank" rel="noopener noreferrer" style="color: var(--gold-light); text-decoration: underline;">${priceText}</a></p>`;
  } else {
      // Bu kısım otel dışı tur paketleri için kullanılabilir
      priceHTML = `<p><strong>${langData.js_fiyat || 'Fiyat'}:</strong> ${priceText}</p>`;
  }
  
  globalPropertyImages = h.images || [];
  globalImageIndex = 0;

  // HTML içeriğini güncelle
  content.innerHTML = `
    <h2>${langData[titleKey] || h.title}</h2>
    
    <div class="house-info">
      <p><strong>${langData.js_konum || 'Konum'}:</strong> ${langData[locationKey] || h.location}</p>
      <p><strong>${langData.js_alan || 'Alan'}:</strong> ${langData[areaKey] || h.area}</p>
      <p><strong>${langData.js_oda_sayisi || 'Oda Sayısı'}:</strong> ${langData[roomsKey] || h.rooms}</p>
      ${priceHTML}
      <p>${langData[descKey] || h.desc}</p>
    </div>

    <div class="detail-gallery" id="detail-gallery-container">
      </div>
    
    <div id="gallery-loader-container" style="text-align: center; margin-top: 20px; margin-bottom: 20px;">
      </div>
  `;
  
  // İlk resim grubunu yükle
  loadMorePropertyImages();
  
  const detailElement = document.getElementById("house-detail");
  if(detailElement) detailElement.style.display = "block";
  document.body.style.overflow = "hidden"; 
}

function closeHouseDetail() {
  const detail = document.getElementById("house-detail");
  if (detail) {
    detail.style.display = "none";
  }
  document.body.style.overflow = "auto"; 
}

// === Mülk Galerisi (Otel/Turlar) Fonksiyonu ===
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
     loaderContainer.innerHTML = "";
     return;
  }

  // Resimler için HTML oluştur
  const imagesHTML = imagesToLoad.map(img => 
    `<img loading="lazy" src="${img}" alt="Galeri Resmi" onerror="this.remove()">`
  ).join("");

  // Resimleri galeriye ekle
  galleryContainer.insertAdjacentHTML('beforeend', imagesHTML);

  // İndeksi güncelle
  globalImageIndex += IMAGES_PER_LOAD;

  // Butonu temizle
  loaderContainer.innerHTML = '';

  // Hâlâ yüklenecek resim varsa, butonu tekrar ekle
  if (globalImageIndex < globalPropertyImages.length) {
    // Çeviri verisini al
    const currentLang = localStorage.getItem('lang') || 'tr';
    const langData = translations[currentLang] || {};
    const buttonText = langData.btn_load_more || 'Daha Fazla Göster';
    
    loaderContainer.innerHTML = `<button class="btn" id="load-more-btn" onclick="loadMorePropertyImages()">${buttonText}</button>`;
  }
}
// === Mülk Galerisi Fonksiyonu Sonu ===


async function setLanguage(lang) {
    let langData;

    if (translations[lang]) {
        langData = translations[lang];
    } else {
        try {
            // Sadece TR ve EN yüklemesini destekliyoruz. ZH ve AR kaldırıldı.
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
    
    // RTL desteği kaldırıldı (AR dili kaldırıldığı için)
    document.documentElement.dir = 'ltr';

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

// === showPage fonksiyonu ===
async function showPage(pageId) {
    
    // URL hash'i boşsa veya # ise 'hero' sayfasını varsay
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
                if (pageId === 'page-contact') fileName = 'contact';
                if (pageId === 'page-otel') fileName = 'otel';
                
                // Kalkan Sayfalar (projects, insaat, restorasyon, satilik_kiralik, pruva-otel) kaldırıldı.
                
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

        // Restorasyon galerisi çağrısı kaldırıldı.

        newPage.classList.remove('visible');
        
        setTimeout(() => {
            // Animasyon sadece .service-card ve .house-card'lar için kaldı.
            const cards = newPage.querySelectorAll('.service-card, .house-card'); 
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

function setupProjectReservation() {
    document.body.addEventListener('click', (e) => {
        if (e.target && e.target.id === 'project-search') {
            const checkin = document.getElementById('project-check-in').value;
            const checkout = document.getElementById('project-check-out').value;
            const currentLang = localStorage.getItem('lang') || 'tr';
            const langData = translations[currentLang] || {};
            
            if (!checkin || !checkout) {
                alert(langData.alert_dates || 'Lütfen giriş ve çıkış tarihlerini seçin.');
                return;
            }
            if (new Date(checkin) >= new Date(checkout)) {
                alert(langData.alert_invalid_date || 'Çıkış tarihi, giriş tarihinden sonra olmalıdır.');
                return;
            }
            loadCategory('otel', checkin, checkout);
        }
    });
}


document.body.addEventListener('click', (e) => {
    const reservationContainer = document.getElementById("otel-reservation-container");

    if (e.target && e.target.id === 'hero-reserve-btn') {
        if (reservationContainer) {
            reservationContainer.classList.add("show");
            reservationContainer.scrollIntoView({ behavior: "smooth" });
        }
    }
    
    if (e.target && e.target.id === 'otel-close') {
        if (reservationContainer) {
            reservationContainer.classList.remove("show");
            const heroOtel = document.getElementById('page-otel');
            if (heroOtel) {
                heroOtel.scrollIntoView({ behavior: "smooth" });
            }
        }
    }
});


document.body.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'otel-search') {
        const modal = document.getElementById("availability-modal");
        const message = document.getElementById("availability-message");
        if (!modal || !message) return;

        const currentLang = localStorage.getItem('lang') || 'tr';
        const langData = translations[currentLang] || {};

        const checkin = document.getElementById("otel-checkin").value;
        const checkout = document.getElementById("otel-checkout").value;

        if (!checkin || !checkout) {
            message.innerHTML = langData.modal_avail_alert_select || '⚠️ Lütfen giriş ve çıkış tarihlerini seçin.';
            modal.classList.add("show");
            return;
        }

        const oldMailBtn = message.parentElement.querySelector('.btn-mail');
        if (oldMailBtn) oldMailBtn.remove();

        const random = Math.random();
        if (random > 0.5) {
            message.innerHTML = langData.modal_avail_success || '✅ Müsait odalar bulundu!';
            
            const mailBtn = document.createElement("button");
            mailBtn.textContent = langData.btn_mail_reserve || 'E-posta ile Rezervasyon Yap';
            mailBtn.classList.add("btn", "btn-mail");
            mailBtn.style.marginTop = "15px";

            mailBtn.addEventListener("click", () => {
                // E-posta adresini genel info adresinizle değiştirdik
                const subject = encodeURIComponent("Rezervasyon Talebi - WalkABouTravel");
                const body = encodeURIComponent(`Merhaba,%0A%0A${checkin} - ${checkout} tarihleri arasında rezervasyon yapmak istiyorum.%0A%0Aİyi günler.`);
                window.location.href = `mailto:info@WalkABouTravel.com?subject=${subject}&body=${body}`;
            });

            message.parentElement.appendChild(mailBtn);
        } else {
            message.innerHTML = langData.modal_avail_fail || '❌ Maalesef bu tarihlerde müsait oda bulunamadı.';
        }

        modal.classList.add("show");
    }

    if (e.target && e.target.id === 'close-modal-btn') {
        const modal = document.getElementById("availability-modal");
        if (modal) modal.classList.remove("show");
    }
});


const projects = {
  // Sadece otel kart başlıkları kaldı. Görseller rastgele atanacak.
  otel: [
    { name: "Lüks Kral Dairesi", price: " gecelik ₺15.000" },
    { name: "Deniz Manzaralı Suit", price: " gecelik ₺8.500" },
    { name: "Standart Oda", price: " gecelik ₺4.200" },
    { name: "Aile Odası", price: " gecelik ₺6.800" },
    { name: "Ekonomik Oda", price: " gecelik ₺3.500" }
  ]
  // insaat, restorasyon ve satilik_kiralik kategorileri kaldırıldı
};

function preloadProjectImages() {
    // Görsel yolu kalmadığı için bu fonksiyonun içi boşaltıldı.
    console.log("Otel görselleri artık yüklenmiyor (Görsel yolları kaldırıldı).");
}

function loadCategory(category, checkin = null, checkout = null) {
  // Sadece 'otel' kategorisi kaldı. Diğer kategoriler artık yüklenmeyecek.
  if (category !== 'otel') {
      console.warn(`Kategori '${category}' kaldırıldı.`);
      return; 
  }
  
  const grid = document.getElementById("project-grid"); 
  if (!grid) {
      console.error("Proje grid'i bulunamadı (ID: project-grid)");
      return;
  }
  grid.style.opacity = "0";

  const titleEl = document.getElementById('projects-title'); 
  const currentLang = localStorage.getItem('lang') || 'tr';
  const langData = translations[currentLang] || {}; 
  
  const titles = {
        'otel': langData.page_otel_h1 || 'Otelimiz',
        'default_projects': langData.projects_title_featured || 'Öne Çıkan Hizmetlerimiz'
  };
  
  if (titleEl) {
      if(category === 'otel' && checkin && checkout) {
          const dateTitle = (langData.no_rooms || 'Müsait Odalar').replace('Bu tarihlerde müsait oda bulunamadı.', '').trim();
          titleEl.textContent = `${titles['otel']} ${dateTitle} (${checkin} - ${checkout})`;
      } else {
          titleEl.textContent = titles[category] || titles['default_projects'];
      }
  }

  setTimeout(() => {
    grid.innerHTML = "";
    let itemsToDisplay = projects[category];
    
    if(category === 'otel' && checkin) {
        itemsToDisplay = projects.otel.filter(() => Math.random() > 0.3); 
        if (itemsToDisplay.length === 0) {
            grid.innerHTML = `<p data-key="no_rooms">${langData.no_rooms || 'Bu tarihlerde müsait oda bulunamadı.'}</p>`;
            grid.style.opacity = "1";
            return;
        }
    }

    if (!itemsToDisplay) {
        grid.innerHTML = `<p>${langData.no_projects || 'Şu anda yüklenecek otel bilgisi bulunmuyor.'}</p>`;
        if (titleEl) titleEl.textContent = titles['default_projects'];
        grid.style.opacity = "1";
        return;
    }

    // Yeni Rastgele Görsel Atama Mantığı
    const randomImages = [
        "antalya.webp", "fethiye.webp", "istanbul.webp", "mardin.webp", 
        "tur-kapadokya-balon-01.webp", "tur-pamukkale-traverten-01.webp" 
    ];
    let imageIndex = 0;

    itemsToDisplay.forEach(project => {
      const card = document.createElement("div");
      card.className = "project-card"; 
      card.style.opacity = '0';
      card.style.transform = 'scale(0.9)';
      
      // Rastgele görsel seçimi (assets klasörünüzdeki yeni turizm görsellerinden)
      const imgSrc = `assets/${randomImages[imageIndex % randomImages.length]}`; 
      imageIndex++;
      
      const priceHTML = project.price ? `<p class="project-price">${project.price}</p>` : '';
      
      // img etiketine artık project.img kullanılmıyor, rastgele atanan imgSrc kullanılıyor.
      card.innerHTML = `<img src="${imgSrc}" alt="${project.name}" loading="lazy" onerror="this.src='https://placehold.co/320x220/111/f59e0b?text=${project.name}'"><h3>${project.name}</h3>${priceHTML}`;
      grid.appendChild(card);
    });
    
    grid.style.opacity = "1";
  }, 300);
}


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
    // Desteklenen diller sadece 'tr' ve 'en' olarak güncellendi.
    const supportedLangs = ['tr', 'en']; 
    
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
    
    setTimeout(preloadProjectImages, 1000); 
    setupMobileMenu();
    setupProjectReservation(); 

    // KEŞFET BUTONU (CTA) kodu kaldırıldı. (index.html'den de kaldırıldı)

   // Nav linkleri ve YENİ HERO LİNKLERİ artık hash'i değiştiriyor
    document.querySelectorAll('.nav-link[data-page], .btn-hero-link[data-page]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = link.getAttribute('data-page');
            location.hash = pageId; 
        });
    });  
  // 'Geri' tuşu artık hash'i değiştiriyor
    document.body.addEventListener('click', (e) => {
        if (e.target && e.target.classList.contains('btn-page-back')) {
            e.preventDefault();
            const targetHash = e.target.getAttribute('href') || '#hero';
            location.hash = targetHash; 
        }
    });

    // Hash değişimi
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
    const gallery = clickedDetailImg.closest(".detail-gallery");
    currentImages = Array.from(gallery.querySelectorAll("img"));
    currentIndex = currentImages.indexOf(clickedDetailImg);
    
    lightboxImg.src = clickedDetailImg.src;
    lightbox.style.display = "flex";

    updateLightboxNav(); 
  }

  // Lightbox'ın dışına (arka plana) tıklanırsa kapat
  if (e.target.id === "lightbox") {
    lightbox.style.display = "none";
  }
});

// YENİ FONKSİYON: Butonları gizle/göster
function updateLightboxNav() {
  const prevBtn = document.getElementById('lightbox-prev');
  const nextBtn = document.getElementById('lightbox-next');
  if (!prevBtn || !nextBtn) return;

  // Baştaysak 'Geri' butonunu gizle
  prevBtn.style.display = (currentIndex === 0) ? 'none' : 'block';
  
  // Sondaysak 'İleri' butonunu gizle
  nextBtn.style.display = (currentIndex === currentImages.length - 1) ? 'none' : 'block';
}

function showNextImage() {
  if (!currentImages.length) return;
  
  // Kapatma mantığı kaldırıldı, sadece ilerle
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
  updateLightboxNav(); // Butonların durumunu güncelle
}

function showPrevImage() {
  if (!currentImages.length) return;

  // Kapatma mantığı kaldırıldı, sadece gerile
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
    }
  }
});

let touchStartX = 0;
let touchEndX = 0;
const swipeThreshold = 50;
const lightboxSwipe = document.getElementById("lightbox"); // Çakışmayı önlemek için yeni değişken

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
const lightboxImgScale = document.getElementById("lightbox-img"); // Çakışmayı önlemek için yeni değişken

if (lightboxImgScale) {
    lightboxImgScale.addEventListener("touchstart", function (e) {
      if (e.touches.length === 2) {
        e.preventDefault();
        const dx = e.touches[0].pageX - e.touches[1].pageX;
        const dy = e.touches[0].pageY - e.touches[1].pageY;
        startDistance = Math.hypot(dx, dy);
      }
    }, { passive: false });

    lightboxImgScale.addEventListener("touchmove", function (e) {
      if (e.touches.length === 2) {
        e.preventDefault();
        const dx = e.touches[0].pageX - e.touches[1].pageX;
        const dy = e.touches[0].pageY - e.touches[1].pageY;
        const newDistance = Math.hypot(dx, dy);
        let pinchScale = newDistance / startDistance;
        scale = Math.min(Math.max(1, pinchScale), 3);
        lightboxImgScale.style.transform = `scale(${scale})`;
      }
    }, { passive: false });

    lightboxImgScale.addEventListener("touchend", function () {
      if (scale !== 1) {
        lightboxImgScale.style.transition = "transform 0.3s ease";
        lightboxImgScale.style.transform = "scale(1)";
        scale = 1;
        setTimeout(() => lightboxImgScale.style.transition = "", 300);
      }
    });
}