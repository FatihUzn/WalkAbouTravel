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

// === YENİ EKLEMELER: Blog (Eski Restorasyon) Galerisi için ===
const RESTORATION_IMAGES_PER_LOAD = 4; // Blog'da 4'er 4'er yükle
// Blog içerikleri, eski restorasyon resim yollarını kullanmaya devam edecek (sadece metinler değişti)
const restorationBeforePaths = [
  "assets/restorasyon-1-befor.webp",
  "assets/restorasyon-2-before.webp",
  "assets/restorasyon-3-before.webp",
  "assets/restorasyon-4-before.webp",
  "assets/restorasyon-5-before.webp",
  "assets/restorasyon-6-before.webp",
  "assets/restorasyon-7-before.webp",
  "assets/restorasyon-8-before.webp",
  "assets/restorasyon-9-before.webp",
  "assets/restorasyon-10-before.webp",
  "assets/restorasyon-11-before.webp",
  "assets/restorasyon-12-before.webp",
  "assets/restorasyon-13-before.webp"
];
const restorationAfterPaths = [
  "assets/restorasyon-1-after.webp",
  "assets/restorasyon-2-after.webp",
  "assets/restorasyon-3-after.webp",
  "assets/restorasyon-4-after.webp",
  "assets/restorasyon-5-after.webp",
  "assets/restorasyon-6-after.webp",
  "assets/restorasyon-7-after.webp",
  "assets/restorasyon-8-after.webp",
  "assets/restorasyon-9-after.webp",
  "assets/restorasyon-10-after.webp",
  "assets/restorasyon-11-after.webp",
  "assets/restorasyon-12-after.webp",
  "assets/restorasyon-13-after.webp"
];
let globalRestorationBeforeIndex = 0;
let globalRestorationAfterIndex = 0;
// === YENİ EKLEMELER SONU ===

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

  if (letter.startsWith('OTEL')) {
      // Otel fiyatı özel link içeriyor
      priceHTML = `<p><strong>${langData.js_fiyat || 'Detay'}:</strong> <a href="https://bwizmirhotel.com/" target="_blank" rel="noopener noreferrer" style="color: var(--gold-light); text-decoration: underline;">${priceText}</a></p>`;
  } else {
      // Normal mülk fiyatı
      priceHTML = `<p><strong>${langData.js_fiyat || 'Detay'}:</strong> ${priceText}</p>`;
  }
  
// === DEĞİŞİKLİK BAŞLANGICI: Global değişkenleri ayarla ===
  globalPropertyImages = h.images || [];
  globalImageIndex = 0;
  // === DEĞİŞİKLİK SONU ===

  // === DEĞİŞİKLİK BAŞLANGICI: HTML içeriğini güncelle ===
  // Galeri kısmı (detail-gallery) artık boş geliyor ve JS ile doldurulacak.
  content.innerHTML = `
    <h2>${langData[titleKey] || h.title}</h2>
    
    <div class="house-info">
      <p><strong>${langData.js_konum || 'Konum'}:</strong> ${langData[locationKey] || h.location}</p>
      <p><strong>${langData.js_alan || 'Gezi Türü'}:</strong> ${langData[areaKey] || h.area}</p>
      <p><strong>${langData.js_oda_sayisi || 'Süre'}:</strong> ${langData[roomsKey] || h.rooms}</p>
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
  // === DEĞİŞİKLİK SONU ===
  
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

// === YENİ FONKSİYON 1: Gezi/Tur Galerisi ===
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
// === FONKSİYON 1 SONU ===


// === YENİ FONKSİYON 2: Blog (Eski Restorasyon) Galerisi Kurulumu ===
function setupRestorationGalleries() {
  // İndeksleri sıfırla
  globalRestorationBeforeIndex = 0;
  globalRestorationAfterIndex = 0;
  
  // Galerileri temizle (sayfa önbellekten yüklenmişse dolu olabilir)
  const beforeGallery = document.getElementById('restoration-gallery-before');
  const afterGallery = document.getElementById('restoration-gallery-after');
  const beforeLoader = document.getElementById('restoration-loader-before');
  const afterLoader = document.getElementById('restoration-loader-after');

  if (beforeGallery) beforeGallery.innerHTML = '';
  if (afterGallery) afterGallery.innerHTML = '';
  if (beforeLoader) beforeLoader.innerHTML = '';
  if (afterLoader) afterLoader.innerHTML = '';

  // İlk resim gruarını yükle
  loadMoreRestorationImages('before');
  loadMoreRestorationImages('after');
}
// === FONKSİYON 2 SONU ===


// === YENİ FONKSİYON 3: Blog Resim Yükleyici ===
function loadMoreRestorationImages(galleryType) {
  let galleryContainer, loaderContainer, imagesArray, currentIndex;
  let altText = "Blog - ";
  let placeholderText = "";

  // Hangi galeri (Önce/Sonra) için işlem yapacağımızı belirle
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

  if (!galleryContainer || !loaderContainer) {
    return;
  }

  // Yüklenecek resim dilimini al
  const imagesToLoad = imagesArray.slice(currentIndex, currentIndex + RESTORATION_IMAGES_PER_LOAD);

  if (imagesToLoad.length === 0 && currentIndex === 0) {
    galleryContainer.innerHTML = "<p>Bu galeri için resim bulunamadı.</p>";
    loaderContainer.innerHTML = "";
    return;
  }

  // Resimler için HTML oluştur
  const imagesHTML = imagesToLoad.map((img, index) => 
    `<img loading="lazy" src="${img}" alt="${altText} ${currentIndex + index + 1}" onerror="this.src='https://placehold.co/350x260/111/f59e0b?text=${placeholderText}+${currentIndex + index + 1}'">`
  ).join("");

  // Resimleri galeriye ekle
  galleryContainer.insertAdjacentHTML('beforeend', imagesHTML);

  // İndeksi güncelle
  if (galleryType === 'before') {
    globalRestorationBeforeIndex += RESTORATION_IMAGES_PER_LOAD;
  } else {
    globalRestorationAfterIndex += RESTORATION_IMAGES_PER_LOAD;
  }
  
  // Güncellenmiş indeksi tekrar al (bir sonraki kontrol için)
  currentIndex = (galleryType === 'before') ? globalRestorationBeforeIndex : globalRestorationAfterIndex;

  // Butonu temizle
  loaderContainer.innerHTML = '';

  // Hâlâ yüklenecek resim varsa, butonu tekrar ekle
  if (currentIndex < imagesArray.length) {
    // Çeviri verisini al
    const currentLang = localStorage.getItem('lang') || 'tr';
    const langData = translations[currentLang] || {};
    const buttonText = langData.btn_load_more || 'Daha Fazla Göster';
    
    // onclick fonksiyonuna hangi galeriyi yükleyeceğini ('before'/'after') parametre olarak ver
    loaderContainer.innerHTML = `<button class="btn" id="load-more-btn-${galleryType}" onclick="loadMoreRestorationImages('${galleryType}')">${buttonText}</button>`;
  }
}
// === FONKSİYON 3 SONU ===


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

// === showPage fonksiyonu (Kayma Düzeltmesi uygulandı) ===
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
                if (pageId === 'page-projects') fileName = 'projects';
                if (pageId === 'page-contact') fileName = 'contact';
                if (pageId === 'page-otel') fileName = 'otel';
                // if (pageId === 'page-insaat') fileName = 'insaat'; // Kaldırıldı
                if (pageId === 'page-restorasyon') fileName = "restorasyon";
                if (pageId === 'page-satilik_kiralik') fileName = "satilik_kiralik";
                
                // === YENİ EKLEME (3. İSTEK): Yeni galeri sayfası rotası ===
                if (pageId === 'page-pruva-otel') fileName = "pruva-otel";
                // === YENİ EKLEME SONU ===

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

        // === GÜNCELLEME (3. İSTEK): Restorasyon galerisi artık 'page-pruva-otel' sayfasında yükleniyor ===
        if (pageId === 'page-pruva-otel') {
          setupRestorationGalleries();
        }
        // === GÜNCELLEME SONU ===

        newPage.classList.remove('visible');
        
        // === KAYMA SORUNU DÜZELTMESİ: Kart gecikme döngüsü kaldırıldı ===
        setTimeout(() => {
            const cards = newPage.querySelectorAll('.project-card, .latest-card, .service-card, .house-card, .restoration-card');
            
            // Tüm kartlardan eski animasyon gecikmelerini temizle
            cards.forEach(card => {
                card.style.animationDelay = '';
            });
            
            // Tüm kartlara yeni, basitleştirilmiş animasyon sınıfını ekle (Gecikmesiz toplu yükleme)
            cards.forEach((card) => {
                card.classList.remove('card-fade-in'); 
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

function setupCardAnimations() {
    // Bu fonksiyon artık showPage içinde çağrılıyor
}

// === YENİ KONSEPTE UYGUN PROJECTS VERİSİ (Seyahat/Turizm) ===
const projects = {
  // Yeni: Kendi Turlarımız
  otel: [ 
    { name: "İstanbul Tarihi Yarımada Turu", price: " ₺2.500", img: "assets/istanbul-tour.webp" },
    { name: "Kapadokya Balon Turu Paketi", price: " ₺7.800", img: "assets/kapadokya-tour.webp" },
    { name: "Ege'nin Mavi Kıyıları Rotası", price: " ₺5.100", img: "assets/ege-tour.webp" },
    { name: "Karadeniz Yayla Gezisi", price: " ₺3.900", img: "assets/karadeniz-tour.webp" },
    { name: "Anadolu'nun Gizemli Yolları", price: " ₺6.200", img: "assets/anadolu-tour.webp" }
  ],
  // insaat kaldırıldı (kullanılmadığı için tutmaya gerek yok)
  // Yeni: Blog
  restorasyon: [ 
    { name: "Türkiye'nin En İyi 10 Kahvesi", img: "assets/blog1.webp" },
    { name: "Kışın Gezilecek 5 Termal Bölge", img: "assets/blog2.webp" },
    { name: "Yerel Lezzetler: Antep Mutfağı", img: "assets/blog3.webp" },
    { name: "Bütçe Dostu 7 Günlük Seyahat Planı", img: "assets/blog4.webp" },
    { name: "Adrenalin Severler İçin Yamaç Paraşütü", img: "assets/blog5.webp" }
  ],
  // Yeni: Türkiye'de Gezilecek Yerler
  satilik_kiralik: [ 
    { name: "Sultanahmet Meydanı, İstanbul", price: "Tarihi", img: "assets/sultanahmet.webp" },
    { name: "Pamukkale Travertenleri, Denizli", price: "Doğa Harikası", img: "assets/pamukkale.webp" },
    { name: "Efes Antik Kenti, İzmir", price: "Arkeolojik", img: "assets/efes.webp" },
    { name: "Uzungöl, Trabzon", price: "Yayla Turizmi", img: "assets/uzungol.webp" },
    { name: "Peri Bacaları, Kapadokya", price: "Jeolojik Oluşum", img: "assets/kapadokya.webp" }
  ]
};

function preloadProjectImages() {
    const allImageUrls = [
        ...projects.otel.map(p => p.img),
        ...projects.restorasyon.map(p => p.img),
        ...projects.satilik_kiralik.map(p => p.img)
    ]; 
    allImageUrls.forEach(url => {
        if (url.startsWith('http')) return; 
        const img = new Image();
        img.src = url; 
    });
    console.log("Proje görselleri (Yeni Konsept) arka planda yükleniyor.");
}

function loadCategory(category, checkin = null, checkout = null) {
  // satilik_kiralik artık Gezilecek Yerler ama mantık aynı
  const grid = document.getElementById("project-grid"); 
  if (!grid) {
      console.error("Proje grid'i bulunamadı (ID: project-grid)");
      return;
  }
  grid.style.opacity = "0";

  const titleEl = document.getElementById('projects-title'); 
  const currentLang = localStorage.getItem('lang') || 'tr';
  const langData = translations[currentLang] || {}; 
  
  // === BAŞLIKLARI ZORLA GÜNCELLEME BAŞLANGICI (Yeni Metinler) ===
  const titles = {
        'otel': langData.page_otel_h1 || 'Kendi Turlarımız',
        'insaat': langData.page_insaat_h1 || 'İnşaat Projeleri', 
        'restorasyon': langData.page_restorasyon_h1 || 'Blog Yazıları',
        'satilik_kiralik': langData.page_satilik_h2 || 'Türkiye\'de Gezilecek Yerler',
        'default_projects': langData.projects_title_featured || 'Öne Çıkan Gezi Rotalarımız'
  };
  
  if (titleEl) {
      // Dil dosyası yoksa veya eski anahtar varsa bile bizim yeni metnimizi gösterecek
      const categoryMap = {
          'otel': 'Kendi Turlarımız',
          'restorasyon': 'Blog Yazıları',
          'satilik_kiralik': 'Türkiye\'de Gezilecek Yerler',
      };
      
      const newTitle = categoryMap[category] || titles[category] || titles['default_projects'];

      if(category === 'otel' && checkin && checkout) {
          const dateTitle = (langData.no_rooms || 'Müsait Turlar').replace('Bu tarihlerde müsait oda bulunamadı.', '').trim();
          titleEl.textContent = `${newTitle} ${dateTitle} (${checkin} - ${checkout})`;
      } else {
          titleEl.textContent = newTitle;
      }
  }
  // === BAŞLIKLARI ZORLA GÜNCELLEME SONUŞU ===

  setTimeout(() => {
    grid.innerHTML = "";
    let itemsToDisplay = projects[category];
    
    // Otel (Turlar) için müsaitlik kontrolü mantığı korunuyor
    if(category === 'otel' && checkin) {
        itemsToDisplay = projects.otel.filter(() => Math.random() > 0.3); 
        if (itemsToDisplay.length === 0) {
            grid.innerHTML = `<p data-key="no_rooms">${langData.no_rooms || 'Bu tarihlerde müsait tur bulunamadı.'}</p>`;
            grid.style.opacity = "1";
            return;
        }
    }

    if (!itemsToDisplay) {
        // Eski fallback konut/ticari yerine turizm/gezi fallbackleri
        grid.innerHTML = `
            <div class="project-card">
              <img src="assets/for_konut.webp" alt="Tarihi Gezi" loading="lazy">
              <h3 data-key="project_h3_residence">${langData.project_h3_residence || 'Tarihi Geziler'}</h3>
            </div>
            <div class="project-card">
              <img src="assets/for_ticari.webp" alt="Doğa Turu" loading="lazy">
              <h3 data-key="project_h3_commercial">${langData.project_h3_commercial || 'Doğa Turları'}</h3>
            </div>
            <div class="project-card">
              <img src="assets/for_cok_amacli.webp" alt="Kültür Turu" loading="lazy">
              <h3 data-key="project_h3_multipurpose">${langData.project_h3_multipurpose || 'Kültür ve Sanat Rotaları'}</h3>
            </div>`;
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
      // Fiyat/Detay bilgisi gösterimi korunuyor
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
            const currentLang = localStorage.getItem('lang') || 'tr';
            const langData = translations[currentLang] || {};
            
            if (!checkin || !checkout) {
                alert(langData.alert_dates || 'Lütfen başlangıç ve bitiş tarihlerini seçin.');
                return;
            }
            if (new Date(checkin) >= new Date(checkout)) {
                alert(langData.alert_invalid_date || 'Bitiş tarihi, başlangıç tarihinden sonra olmalıdır.');
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
            message.innerHTML = langData.modal_avail_alert_select || '⚠️ Lütfen tur başlangıç ve bitiş tarihlerini seçin.';
            modal.classList.add("show");
            return;
        }

        const oldMailBtn = message.parentElement.querySelector('.btn-mail');
        if (oldMailBtn) oldMailBtn.remove();

        const random = Math.random();
        if (random > 0.5) {
            message.innerHTML = langData.modal_avail_success || '✅ Müsait turlar bulundu!';
            
            const mailBtn = document.createElement("button");
            mailBtn.textContent = langData.btn_mail_reserve || 'E-posta ile Rezervasyon Yap';
            mailBtn.classList.add("btn", "btn-mail");
            mailBtn.style.marginTop = "15px";

            mailBtn.addEventListener("click", () => {
                const subject = encodeURIComponent("Tur Rezervasyon Talebi - Golden Palace Travel");
                const body = encodeURIComponent(`Merhaba,%0A%0A${checkin} - ${checkout} tarihleri arasındaki tura rezervasyon yapmak istiyorum.%0A%0Aİyi günler.`);
                window.location.href = `mailto:info@goldenpalace.com?subject=${subject}&body=${body}`;
            });

            message.parentElement.appendChild(mailBtn);
        } else {
            message.innerHTML = langData.modal_avail_fail || '❌ Maalesef bu tarihlerde müsait tur bulunamadı.';
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
    
    setTimeout(preloadProjectImages, 1000); 
    setupMobileMenu();
    setupProjectReservation(); 
    
    // === ROTATING TEXT BAŞLANGICI (Yeni İçerik) ===
    const data = [
        {
            title: "Tarihi Turlar",
            description: "İstanbul'un saklı kalmış güzelliklerini, uzman rehberler eşliğinde keşfedin."
        },
        {
            title: "Kültürel Etkinlikler",
            description: "Yöresel lezzetler, festivaller ve el sanatları atölyelerine katılın."
        },
        {
            title: "Doğa Yürüyüşleri",
            description: "Karadeniz'in yeşil yaylalarından Akdeniz'in masmavi kıyılarına uzanan unutulmaz rotalar."
        },
        {
            title: "Seyahat İpuçları",
            description: "Bölgesel ulaşım, konaklama ve bütçe planlama rehberleri."
        }
    ];

    let index = 0; 
    const textElement = document.getElementById('changing-text'); 
    const intervalTime = 5000; // 5 saniye

    function changeTextWithFade() {
        // 1. Fade Out: Opaklığı sıfıra düşür
        if(textElement) {
            textElement.style.opacity = '0'; 
        }

        // 2. Metni 0.5 saniye sonra değiştir
        setTimeout(() => {
            if(textElement) {
                const currentData = data[index];
                
                // Metin içeriğini Kalın Başlık ve Açıklama olarak HTML'e yaz
                textElement.innerHTML = `<strong>${currentData.title}</strong><br>${currentData.description}`;
                
                // 3. Fade In: Opaklığı tekrar 1 yap
                textElement.style.opacity = '1'; 
                
                // 4. İndeksi bir sonraki öğeye ilerlet (Döngü)
                index = (index + 1) % data.length;
            }
        }, 500); // CSS transition süresi ile uyumlu (0.5 saniye)
    }

    // HTML öğesi yüklü ise döngüyü başlat
    if(textElement) {
        // İlk yükleme için hemen çağır
        changeTextWithFade(); 
        // Sonra aralıklarla tekrar et
        setInterval(changeTextWithFade, intervalTime);
    }
    // === ROTATING TEXT SONU ===
    

    // === KEŞFET BUTONU (CTA) İÇİN ===
    const cta = document.getElementById("discover-cta");
    if (cta) {
        const button = cta.querySelector(".btn");
        const dropdown = cta.querySelector(".dropdown");

        button.addEventListener("click", e => {
            e.preventDefault();
            e.stopPropagation();
            cta.classList.toggle("open");
        });

        document.addEventListener("click", e => {
            if (cta && !cta.contains(e.target)) cta.classList.remove("open");
        });

        dropdown.querySelectorAll("a[data-page]").forEach(link => {
            link.addEventListener("click", e => {
                e.preventDefault();
                e.stopPropagation();
                const pageId = link.getAttribute("data-page");
                location.hash = pageId;
                cta.classList.remove("open");
            });
        });
    } else {
        console.error("CTA Grubu 'discover-cta' bulunamadı!");
    }

   // === Nav linkleri ve YENİ HERO LİNKLERİ artık hash'i değiştiriyor ===
    document.querySelectorAll('.nav-link[data-page], .btn-hero-link[data-page]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = link.getAttribute('data-page');
            location.hash = pageId; 
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
}); // ✅ sadece bu bir tane kapanış olacak


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