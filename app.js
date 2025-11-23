// --- YARDIMCI FONKSİYONLAR ---
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

// --- GLOBAL DEĞİŞKENLER ---
const translations = {}; 
let allGalleriesData = null; 
const pageCache = {}; 

// Galeri Sayfalandırma Değişkenleri
let globalPropertyImages = [];
let globalImageIndex = 0;
const IMAGES_PER_LOAD = 8; 

// Restorasyon Galerisi Değişkenleri
const RESTORATION_IMAGES_PER_LOAD = 4;
const restorationBeforePaths = [
  "assets/restorasyon-1-befor.webp", "assets/restorasyon-2-before.webp", "assets/restorasyon-3-before.webp",
  "assets/restorasyon-4-before.webp", "assets/restorasyon-5-before.webp", "assets/restorasyon-6-before.webp",
  "assets/restorasyon-7-before.webp", "assets/restorasyon-8-before.webp", "assets/restorasyon-9-before.webp",
  "assets/restorasyon-10-before.webp", "assets/restorasyon-11-before.webp", "assets/restorasyon-12-before.webp",
  "assets/restorasyon-13-before.webp"
];
const restorationAfterPaths = [
  "assets/restorasyon-1-after.webp", "assets/restorasyon-2-after.webp", "assets/restorasyon-3-after.webp",
  "assets/restorasyon-4-after.webp", "assets/restorasyon-5-after.webp", "assets/restorasyon-6-after.webp",
  "assets/restorasyon-7-after.webp", "assets/restorasyon-8-after.webp", "assets/restorasyon-9-after.webp",
  "assets/restorasyon-10-after.webp", "assets/restorasyon-11-after.webp", "assets/restorasyon-12-after.webp",
  "assets/restorasyon-13-after.webp"
];
let globalRestorationBeforeIndex = 0;
let globalRestorationAfterIndex = 0;

// --- EV DETAY & GALERİ FONKSİYONLARI ---
async function openHouseDetail(letter) {
  if (!allGalleriesData) {
    try {
      const response = await fetch('data/galleries.json?v=1.1'); 
      if (!response.ok) throw new Error('Galeri verisi yüklenemedi');
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
      console.error(`'${letter}' için ev detayı bulunamadı.`);
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

  if (letter.startsWith('OTEL')) {
      priceHTML = `<p><strong>${langData.js_fiyat || 'Fiyat'}:</strong> <a href="https://bwizmirhotel.com/" target="_blank" rel="noopener noreferrer" style="color: var(--gold-light); text-decoration: underline;">${priceText}</a></p>`;
  } else {
      priceHTML = `<p><strong>${langData.js_fiyat || 'Fiyat'}:</strong> ${priceText}</p>`;
  }
  
  globalPropertyImages = h.images || [];
  globalImageIndex = 0;

  content.innerHTML = `
    <h2>${langData[titleKey] || h.title}</h2>
    <div class="house-info">
      <p><strong>${langData.js_konum || 'Konum'}:</strong> ${langData[locationKey] || h.location}</p>
      <p><strong>${langData.js_alan || 'Alan'}:</strong> ${langData[areaKey] || h.area}</p>
      <p><strong>${langData.js_oda_sayisi || 'Oda Sayısı'}:</strong> ${langData[roomsKey] || h.rooms}</p>
      ${priceHTML}
      <p>${langData[descKey] || h.desc}</p>
    </div>
    <div class="detail-gallery" id="detail-gallery-container"></div>
    <div id="gallery-loader-container" style="text-align: center; margin-top: 20px; margin-bottom: 20px;"></div>
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

  if (!galleryContainer || !loaderContainer) return;

  const imagesToLoad = globalPropertyImages.slice(globalImageIndex, globalImageIndex + IMAGES_PER_LOAD);

  if (imagesToLoad.length === 0 && globalImageIndex === 0) {
     galleryContainer.innerHTML = "<p>Bu galeri için resim bulunamadı.</p>";
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

// --- RESTORASYON GALERİSİ FONKSİYONLARI ---
function setupRestorationGalleries() {
  globalRestorationBeforeIndex = 0;
  globalRestorationAfterIndex = 0;
  
  const beforeGallery = document.getElementById('restoration-gallery-before');
  const afterGallery = document.getElementById('restoration-gallery-after');
  const beforeLoader = document.getElementById('restoration-loader-before');
  const afterLoader = document.getElementById('restoration-loader-after');

  if (beforeGallery) beforeGallery.innerHTML = '';
  if (afterGallery) afterGallery.innerHTML = '';
  if (beforeLoader) beforeLoader.innerHTML = '';
  if (afterLoader) afterLoader.innerHTML = '';

  loadMoreRestorationImages('before');
  loadMoreRestorationImages('after');
}

function loadMoreRestorationImages(galleryType) {
  let galleryContainer, loaderContainer, imagesArray, currentIndex;
  let altText = "Restorasyon - ";
  let placeholderText = "";

  if (galleryType === 'before') {
    galleryContainer = document.getElementById('restoration-gallery-before');
    loaderContainer = document.getElementById('restoration-loader-before');
    imagesArray = restorationBeforePaths;
    currentIndex = globalRestorationBeforeIndex;
    altText += "Önce";
    placeholderText = "Önce";
  } else {
    galleryContainer = document.getElementById('restoration-gallery-after');
    loaderContainer = document.getElementById('restoration-loader-after');
    imagesArray = restorationAfterPaths;
    currentIndex = globalRestorationAfterIndex;
    altText += "Sonra";
    placeholderText = "Sonra";
  }

  if (!galleryContainer || !loaderContainer) return;

  const imagesToLoad = imagesArray.slice(currentIndex, currentIndex + RESTORATION_IMAGES_PER_LOAD);

  if (imagesToLoad.length === 0 && currentIndex === 0) {
    galleryContainer.innerHTML = "<p>Bu galeri için resim bulunamadı.</p>";
    loaderContainer.innerHTML = "";
    return;
  }

  const imagesHTML = imagesToLoad.map((img, index) => 
    `<img loading="lazy" src="${img}" alt="${altText} ${currentIndex + index + 1}" onerror="this.src='https://placehold.co/350x260/111/f59e0b?text=${placeholderText}+${currentIndex + index + 1}'">`
  ).join("");

  galleryContainer.insertAdjacentHTML('beforeend', imagesHTML);

  if (galleryType === 'before') {
    globalRestorationBeforeIndex += RESTORATION_IMAGES_PER_LOAD;
  } else {
    globalRestorationAfterIndex += RESTORATION_IMAGES_PER_LOAD;
  }
  
  currentIndex = (galleryType === 'before') ? globalRestorationBeforeIndex : globalRestorationAfterIndex;
  loaderContainer.innerHTML = '';

  if (currentIndex < imagesArray.length) {
    const currentLang = localStorage.getItem('lang') || 'tr';
    const langData = translations[currentLang] || {};
    const buttonText = langData.btn_load_more || 'Daha Fazla Göster';
    loaderContainer.innerHTML = `<button class="btn" id="load-more-btn-${galleryType}" onclick="loadMoreRestorationImages('${galleryType}')">${buttonText}</button>`;
  }
}

// --- DİL VE SİSTEM FONKSİYONLARI ---
async function setLanguage(lang) {
    let langData;
    if (translations[lang]) {
        langData = translations[lang];
    } else {
        try {
            const response = await fetch(`${lang}.json`);
            if (!response.ok) throw new Error(`Dil dosyası ${lang}.json yüklenemedi`);
            langData = await response.json(); 
            translations[lang] = langData; 
        } catch (error) {
            console.warn(`Dil hatası:`, error);
            if (lang !== 'en') return await setLanguage('en'); 
            return;
        }
    }
    
    document.querySelector('title').textContent = langData['title'];
    document.documentElement.lang = lang; 
    document.documentElement.dir = (lang === 'ar') ? 'rtl' : 'ltr';

    document.querySelectorAll('[data-key]').forEach(el => {
        const key = el.getAttribute('data-key');
        if (langData[key]) el.innerHTML = langData[key];
    });

    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-lang') === lang) btn.classList.add('active');
    });
   
    localStorage.setItem('lang', lang);
}

// --- SAYFA YÖNETİMİ (ROUTING) ---
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

                if (fileName !== pageId) {
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
            newPage.querySelectorAll('[data-key]').forEach(el => {
                const key = el.getAttribute('data-key');
                if (translations[currentLang][key]) {
                    el.innerHTML = translations[currentLang][key];
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
        location.hash = 'hero'; 
    }
}

// --- UI KURULUMLARI ---
function setupMobileMenu() {
    const menuToggle = document.getElementById('menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            const navbar = document.getElementById('navbar');
            if (navbar) {
                navbar.classList.toggle('open');
                const mobileLangSelector = navbar.querySelector('.language-selector.mobile-only');
                if (mobileLangSelector) mobileLangSelector.style.display = 'flex';
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
    if (heroSection) heroSection.classList.add('visible');
}

// --- PROJE VERİLERİ VE KATEGORİ YÖNETİMİ ---
const projects = {
  otel: [
    { name: "Lüks Kral Dairesi", price: " gecelik ₺15.000", img: "assets/otel1.webp" },
    { name: "Deniz Manzaralı Suit", price: " gecelik ₺8.500", img: "assets/otel2.webp" },
    { name: "Standart Oda", price: " gecelik ₺4.200", img: "assets/otel3.webp" },
    { name: "Aile Odası", price: " gecelik ₺6.800", img: "assets/otel4.webp" },
    { name: "Ekonomik Oda", price: " gecelik ₺3.500", img: "assets/otel5.webp" }
  ],
  insaat: [
    { name: "Modern Gökdelen", img: "assets/insaat1.webp" },
    { name: "Alışveriş Merkezi", img: "assets/insaat2.webp" },
    { name: "Lüks Konut Sitesi", img: "assets/insaat3.webp" },
    { name: "Ofis Kuleleri", img: "assets/insaat4.webp" },
    { name: "Endüstriyel Tesis", img: "assets/insaat5.webp" }
  ],
  restorasyon: [
    { name: "Tarihi Yalı Restorasyonu", img: "assets/restorasyon1.webp" },
    { name: "Eski Kilise Canlandırma", img: "assets/restorasyon2.webp" },
    { name: "Kervansaray Yenileme", img: "assets/restorasyon3.webp" },
    { name: "Tarihi Saat Kulesi", img: "assets/restorasyon4.webp" },
    { name: "Şehir Surları", img: "assets/restorasyon5.webp" }
  ],
  satilik_kiralik: [
    { name: "Satılık Lüks Villa", price: "₺45.000.000", img: "https://placehold.co/320x220/f59e0b/0a0a0a?text=Satılık+Ev" },
    { name: "Kiralık Rezidans", price: "aylık ₺80.000", img: "https://placehold.co/320x220/f59e0b/0a0a0a?text=Kiralık+Ev" }
  ]
};

function preloadProjectImages() {
    const allImageUrls = [
        ...projects.otel.map(p => p.img),
        ...projects.insaat.map(p => p.img),
        ...projects.restorasyon.map(p => p.img),
        ...projects.satilik_kiralik.map(p => p.img)
    ]; 
    allImageUrls.forEach(url => {
        if (url.startsWith('http')) return; 
        const img = new Image();
        img.src = url; 
    });
}

function loadCategory(category, checkin = null, checkout = null) {
  if (category === 'satilik_kiralik') return; 
  
  const grid = document.getElementById("project-grid"); 
  if (!grid) return;
  grid.style.opacity = "0";

  const titleEl = document.getElementById('projects-title'); 
  const currentLang = localStorage.getItem('lang') || 'tr';
  const langData = translations[currentLang] || {}; 
  
  const titles = {
        'otel': langData.page_otel_h1 || 'Otelimiz',
        'insaat': langData.page_insaat_h1 || 'İnşaat Projeleri',
        'restorasyon': langData.page_restorasyon_h1 || 'Restorasyon Projeleri',
        'satilik_kiralik': langData.page_satilik_h2 || 'Satılık/Kiralık Evler',
        'default_projects': langData.projects_title_featured || 'Öne Çıkan Projelerimiz'
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
        grid.innerHTML = `
            <div class="project-card"><img src="assets/for_konut.webp" loading="lazy"><h3>Konut Projeleri</h3></div>
            <div class="project-card"><img src="assets/for_ticari.webp" loading="lazy"><h3>Ticari Projeler</h3></div>`;
        if (titleEl) titleEl.textContent = titles['default_projects'];
        grid.style.opacity = "1";
        return;
    }

    itemsToDisplay.forEach(project => {
      const card = document.createElement("div");
      card.className = "project-card";
      card.style.opacity = '0';
      card.style.transform = 'scale(0.9)';
      
      const imgSrc = project.img.startsWith('http') ? project.img : `${project.img}`; 
      const priceHTML = project.price ? `<p class="project-price">${project.price}</p>` : '';
      
      card.innerHTML = `<img src="${imgSrc}" alt="${project.name}" loading="lazy" onerror="this.src='https://placehold.co/320x220/111/f59e0b?text=${project.name}'"><h3>${project.name}</h3>${priceHTML}`;
      grid.appendChild(card);
    });
    grid.style.opacity = "1";
  }, 300);
}

function setupProjectReservation() {
    document.body.addEventListener('click', (e) => {
        if (e.target && e.target.id === 'project-search') {
            const checkin = document.getElementById('project-check-in').value;
            const checkout = document.getElementById('project-check-out').value;
            if (!checkin || !checkout) {
                alert('Lütfen tarih seçin.');
                return;
            }
            if (new Date(checkin) >= new Date(checkout)) {
                alert('Çıkış tarihi, giriş tarihinden sonra olmalıdır.');
                return;
            }
            loadCategory('otel', checkin, checkout);
        }
    });
}

// --- ANA OLAY DİNLEYİCİSİ (INIT) ---
document.addEventListener('DOMContentLoaded', async () => {
    window.scrollTo(0, 0); 
    
    const desktopLangSelector = document.querySelector('.language-selector.desktop-only');
    const mobileLangSelector = document.querySelector('.language-selector.mobile-only');

    if (window.innerWidth <= 768) {
        if (desktopLangSelector) desktopLangSelector.style.display = 'none';
    } else {
        if (mobileLangSelector) mobileLangSelector.style.display = 'none';
    }
    
    let finalLang = localStorage.getItem('lang') || 'tr';
    try {
        await setLanguage(finalLang);
    } catch (e) {
        console.error("Dil yüklenemedi:", e);
        await setLanguage('tr'); 
    }
    
    setTimeout(preloadProjectImages, 1000); 
    setupMobileMenu();
    setupProjectReservation(); 

    // CTA Grubu
    const cta = document.getElementById("discover-cta");
    if (cta) {
        cta.querySelector(".btn").addEventListener("click", e => {
            e.preventDefault(); e.stopPropagation(); cta.classList.toggle("open");
        });
        document.addEventListener("click", e => {
            if (!cta.contains(e.target)) cta.classList.remove("open");
        });
        cta.querySelectorAll(".dropdown a").forEach(link => {
            link.addEventListener("click", e => {
                e.preventDefault(); e.stopPropagation();
                location.hash = link.getAttribute("data-page");
                cta.classList.remove("open");
            });
        });
    }

    // Link Yönlendirmeleri
    document.querySelectorAll('.nav-link[data-page], .btn-hero-link[data-page]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            location.hash = link.getAttribute('data-page'); 
        });
    });  

    document.body.addEventListener('click', (e) => {
        if (e.target && e.target.classList.contains('btn-page-back')) {
            e.preventDefault();
            location.hash = e.target.getAttribute('href') || '#hero'; 
        }
        
        // Otel Rezervasyon Modal Tetikleyicileri
        if (e.target.id === 'hero-reserve-btn') {
             const cont = document.getElementById("otel-reservation-container");
             if(cont) { cont.classList.add("show"); cont.scrollIntoView({behavior:"smooth"}); }
        }
        if (e.target.id === 'otel-close') {
             const cont = document.getElementById("otel-reservation-container");
             if(cont) cont.classList.remove("show");
        }
        
        // Modal Kapama
        if (e.target.id === 'close-modal-btn') {
            const modal = document.getElementById("availability-modal");
            if (modal) modal.classList.remove("show");
        }
        
        // Otel Arama Butonu
        if (e.target.id === 'otel-search') {
             const modal = document.getElementById("availability-modal");
             const msg = document.getElementById("availability-message");
             if(modal && msg) {
                 const ci = document.getElementById("otel-checkin").value;
                 const co = document.getElementById("otel-checkout").value;
                 if(!ci || !co) { msg.innerHTML = '⚠️ Lütfen tarih seçin.'; }
                 else {
                     const isAvail = Math.random() > 0.5;
                     msg.innerHTML = isAvail ? '✅ Müsait odalar bulundu!' : '❌ Maalesef bu tarihlerde oda yok.';
                 }
                 modal.classList.add("show");
             }
        }
        
        // Restorasyon Modalı
        if (e.target.closest('.image-modal-close-btn') || e.target.id === 'restorationImageModal') {
            closeImageModal();
        }
        
        const rCard = e.target.closest('.restoration-card');
        if (rCard && (e.target.closest('.img-wrapper') || e.target.closest('.img-comparison-container'))) {
            const mBefore = document.getElementById('modalBeforeImage');
            const mAfter = document.getElementById('modalAfterImage');
            const bImg = rCard.querySelector('.img-wrapper:first-child img');
            const aImg = rCard.querySelector('.img-wrapper:last-child img');
            if(bImg && aImg && mBefore && mAfter) {
                mBefore.src = bImg.src; mAfter.src = aImg.src;
                document.getElementById('restorationImageModal').classList.add('show');
            }
        }
    });

    // Hash Değişikliği
    window.addEventListener('hashchange', () => {
        showPage(location.hash.replace('#', '') || 'hero');
    });

    showPage(location.hash.replace('#', '') || 'hero');
});

// --- LIGHTBOX (RESİM BÜYÜTME) SİSTEMİ - GÜNCELLENMİŞ VERSİYON ---
let currentImages = [];
let currentIndex = 0;

document.addEventListener("click", function(e) {
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  
  if (!lightbox || !lightboxImg) return; 

  const clickedImg = e.target.closest("img");
  
  // Resme tıklanmadıysa veya lightbox'ın siyah alanına tıklandıysa kapat
  if (!clickedImg) {
      if (e.target.id === "lightbox") lightbox.style.display = "none";
      return;
  }

  // Sadece .detail-gallery içindeki resimlere tepki ver
  const galleryContainer = clickedImg.closest(".detail-gallery");
  
  if (galleryContainer) {
    e.preventDefault(); // Varsayılan davranışı durdur
    e.stopPropagation(); // Olayın yukarı taşınmasını durdur (Detay sayfasının etkilenmemesi için)

    currentImages = Array.from(galleryContainer.querySelectorAll("img"));
    currentIndex = currentImages.indexOf(clickedImg);
    
    lightboxImg.src = clickedImg.src;
    lightbox.style.display = "flex";

    updateLightboxNav(); 
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
  if (currentIndex < currentImages.length - 1) { 
    currentIndex++;
    updateLightboxImage();
  }
}

function showPrevImage() {
  if (currentIndex > 0) {
    currentIndex--;
    updateLightboxImage();
  } 
}

function updateLightboxImage() {
    const lightboxImg = document.getElementById("lightbox-img");
    if (lightboxImg) {
        lightboxImg.src = currentImages[currentIndex].src;
        lightboxImg.style.transform = "scale(1)";
        scale = 1;
    }
    updateLightboxNav();
}

// Lightbox Klavye Kontrolü
document.addEventListener("keydown", function (e) {
  const lightbox = document.getElementById("lightbox");
  if (lightbox && lightbox.style.display === "flex") {
    if (e.key === "ArrowRight") showNextImage();
    else if (e.key === "ArrowLeft") showPrevImage();
    else if (e.key === "Escape") lightbox.style.display = "none";
  }
});

// --- DOKUNMATİK / SWIPE KONTROLLERİ ---
let touchStartX = 0;
let touchEndX = 0;
const swipeThreshold = 50;
const lightboxEl = document.getElementById("lightbox");

if (lightboxEl) {
    lightboxEl.addEventListener("touchstart", function(e) {
      if (e.touches.length === 1) { touchStartX = e.touches[0].clientX; touchEndX = 0; }
    }, { passive: true });

    lightboxEl.addEventListener("touchmove", function(e) {
      if (e.touches.length === 1) touchEndX = e.touches[0].clientX;
    }, { passive: true });

    lightboxEl.addEventListener("touchend", function(e) {
      const img = document.getElementById("lightbox-img");
      if (!img) return;
      const curScale = img.style.transform ? parseFloat(img.style.transform.replace("scale(", "")) : 1;
      
      if (curScale > 1 || e.touches.length > 0) return;
      if (touchStartX === 0 || touchEndX === 0) return; 
      
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > swipeThreshold) { 
        (diff > 0) ? showNextImage() : showPrevImage();
      }
      touchStartX = 0; touchEndX = 0;
    });
}

// Zoom (Pinch) Kontrolleri
let scale = 1;
let startDistance = 0;
const lightboxImgEl = document.getElementById("lightbox-img");

if (lightboxImgEl) {
    lightboxImgEl.addEventListener("touchstart", function (e) {
      if (e.touches.length === 2) {
        e.preventDefault();
        startDistance = Math.hypot(e.touches[0].pageX - e.touches[1].pageX, e.touches[0].pageY - e.touches[1].pageY);
      }
    }, { passive: false });

    lightboxImgEl.addEventListener("touchmove", function (e) {
      if (e.touches.length === 2) {
        e.preventDefault();
        const dist = Math.hypot(e.touches[0].pageX - e.touches[1].pageX, e.touches[0].pageY - e.touches[1].pageY);
        scale = Math.min(Math.max(1, dist / startDistance), 3);
        lightboxImgEl.style.transform = `scale(${scale})`;
      }
    }, { passive: false });

    lightboxImgEl.addEventListener("touchend", function () {
      if (scale !== 1) {
        lightboxImgEl.style.transition = "transform 0.3s ease";
        lightboxImgEl.style.transform = "scale(1)";
        scale = 1;
        setTimeout(() => lightboxImgEl.style.transition = "", 300);
      }
    });
}

// Restorasyon Modalı Yardımcısı
function closeImageModal() {
    const modal = document.getElementById('restorationImageModal');
    if (modal) {
        modal.classList.remove('show');
        document.getElementById('modalBeforeImage').src = '';
        document.getElementById('modalAfterImage').src = '';
    }
}
