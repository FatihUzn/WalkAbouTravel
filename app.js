// ==========================================
// 1. YARDIMCI FONKSİYONLAR
// ==========================================
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

// ==========================================
// 2. VERİ TABANI (RESİMLER VE DETAYLAR)
// ==========================================
// Not: Dışarıdan JSON dosyası aramamak için verileri buraya gömdük.
const galleryDatabase = {
  // --- TÜRKİYE ROTALARI ---
  "TUR-TR-MARDIN": {
      title: "Mardin Kültür Turu",
      desc: "Taş evlerin, dar sokakların ve tarihi manastırların büyüleyici atmosferi.",
      price: "₺12.500 (Kişi Başı)",
      location: "Mardin / Türkiye",
      images: [
          "assets/mardin-tarihi-konak-dokusu-1.webp",
          "assets/restorasyon1.webp", 
          "assets/background.webp"
      ]
  },
  "TUR-TR-ANTALYA": {
      title: "Antalya Koy Gezisi",
      desc: "Turkuaz suların ve gizli koyların keşfi. Tekne turu dahildir.",
      price: "₺8.000 (Kişi Başı)",
      location: "Antalya / Kaş",
      images: [
          "assets/antalya-koy-gezisi-1.webp",
          "assets/otel_hero-mobil.webp",
          "assets/for_hero.webp"
      ]
  },
  "TUR-TR-KAPADOKYA": {
      title: "Kapadokya Balon Turu",
      desc: "Peri bacaları üzerinde gün doğumu ve mağara otel konaklaması.",
      price: "₺15.000 (Kişi Başı)",
      location: "Nevşehir / Göreme",
      images: [
          "assets/kapadokya-balon-turu-1.webp",
          "assets/restorasyon2.webp",
          "assets/background.webp"
      ]
  },
  "TUR-TR-FETHIYE": {
      title: "Fethiye Ölüdeniz",
      desc: "Yamaç paraşütü ve dünyaca ünlü plajlarda dinlenme fırsatı.",
      price: "₺10.000 (Kişi Başı)",
      location: "Muğla / Fethiye",
      images: [
          "assets/fethiye-oludeniz-manzarasi-14.webp",
          "assets/otel1.webp",
          "assets/otel2.webp"
      ]
  },
  "TUR-TR-PAMUKKALE": {
      title: "Pamukkale Travertenleri",
      desc: "Beyaz cennet ve Hierapolis antik kenti gezisi.",
      price: "₺6.500 (Kişi Başı)",
      location: "Denizli",
      images: [
          "assets/pamukkale-traverten-dogal-1.webp",
          "assets/restorasyon3.webp",
          "assets/for_hero.webp"
      ]
  },

  // --- ULUSLARARASI ROTALAR ---
  "TUR-D-ISPANYA": {
      title: "İspanya & Endülüs Turu",
      desc: "Barselona, Madrid ve Sevilla'nın tarihi sokakları.",
      price: "€1.200 (Kişi Başı)",
      location: "İspanya",
      images: [
          "assets/spain-1.webp",
          "assets/insaat1.webp",
          "assets/insaat2.webp"
      ]
  },
  "TUR-D-RUSYA": {
      title: "Rusya Sanat Turu",
      desc: "Moskova Kızıl Meydan ve St. Petersburg müzeleri.",
      price: "$1.500 (Kişi Başı)",
      location: "Rusya",
      images: [
          "assets/rusya-1.webp",
          "assets/restorasyon4.webp",
          "assets/insaat3.webp"
      ]
  },
  "TUR-D-BREZILYA": {
      title: "Brezilya Karnavalı",
      desc: "Rio de Janeiro'nun renkli dünyası ve Amazon ormanları.",
      price: "$2.100 (Kişi Başı)",
      location: "Brezilya",
      images: [
          "assets/brazil-1.webp",
          "assets/otel3.webp",
          "assets/otel4.webp"
      ]
  },
  "TUR-D-AMERIKA": {
      title: "Amerika Batı Yakası",
      desc: "Los Angeles, Las Vegas ve Grand Canyon rotası.",
      price: "$2.500 (Kişi Başı)",
      location: "ABD",
      images: [
          "assets/new-york-1.webp",
          "assets/insaat4.webp",
          "assets/insaat5.webp"
      ]
  }
};

// Projeler Sayfası Verileri
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

// ==========================================
// 3. GLOBAL DEĞİŞKENLER
// ==========================================
const translations = {}; 
const pageCache = {}; 
let globalPropertyImages = [];
let globalImageIndex = 0;
let currentImages = [];
let currentIndex = 0;

// Restorasyon Galerisi Değişkenleri
const RESTORATION_IMAGES_PER_LOAD = 4;
const restorationBeforePaths = ["assets/restorasyon-1-befor.webp", "assets/restorasyon-2-before.webp", "assets/restorasyon-3-before.webp"];
const restorationAfterPaths = ["assets/restorasyon-1-after.webp", "assets/restorasyon-2-after.webp", "assets/restorasyon-3-after.webp"];
let globalRestorationBeforeIndex = 0;
let globalRestorationAfterIndex = 0;

// ==========================================
// 4. DETAY SAYFASI MANTIĞI (ÖNEMLİ KISIM)
// ==========================================
function openHouseDetail(id) {
  const detail = document.getElementById("house-detail");
  const content = document.getElementById("house-detail-content");
  
  // Veritabanından veriyi çek
  const data = galleryDatabase[id];
  
  // Eğer veri yoksa konsola yaz ve kullanıcıyı uyar
  if (!data) {
      console.warn(`Veri bulunamadı: ${id}. (JSON kullanılmıyor, app.js içindeki liste kullanılıyor)`);
      // Fallback: Eğer veri yoksa boş bir şablon açmasın diye uyarı verilebilir
      // alert("Bu içerik hazırlanıyor."); 
      // return; 
      // Şimdilik devam etsin ki kod kırılmasın
  }

  const safeData = data || { title: "Detaylar", desc: "İçerik yükleniyor...", price: "", location: "", images: [] };

  globalPropertyImages = safeData.images || [];
  globalImageIndex = 0;

  content.innerHTML = `
    <h2 style="color:#ffcc66; margin-top:20px; text-align:center;">${safeData.title}</h2>
    
    <div class="house-info" style="color:#ddd; text-align:left; max-width:800px; margin:0 auto; padding:20px;">
      <p><strong>📍 Konum:</strong> ${safeData.location}</p>
      <p><strong>💰 Fiyat:</strong> ${safeData.price}</p>
      <p>${safeData.desc}</p>
      <a href="mailto:info@walkaboutravel.com?subject=Rezervasyon: ${safeData.title}" class="btn" style="margin-top:15px; display:inline-block;">Rezervasyon Yap</a>
    </div>

    <h3 style="text-align:center; margin-top:40px; color:#ffcc66;">Galeri</h3>
    <div class="detail-gallery" id="detail-gallery-container" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(250px, 1fr)); gap:15px; padding:20px;">
      </div>
  `;
  
  const galleryContainer = document.getElementById('detail-gallery-container');
  
  if(globalPropertyImages.length > 0) {
      const imagesHTML = globalPropertyImages.map(img => 
        `<img src="${img}" alt="${safeData.title}" onclick="openLightbox(this)" style="width:100%; height:200px; object-fit:cover; cursor:pointer; border:1px solid #333; border-radius:8px;" onerror="this.src='assets/background.webp'">`
      ).join("");
      galleryContainer.innerHTML = imagesHTML;
  } else {
      galleryContainer.innerHTML = "<p style='text-align:center; color:#777;'>Bu destinasyon için henüz görsel eklenmedi.</p>";
  }

  detail.style.display = "block";
  detail.style.zIndex = "9998"; // Lightbox'ın (9999) bir altında
  document.body.style.overflow = "hidden"; 
}

function closeHouseDetail() {
  const detail = document.getElementById("house-detail");
  if (detail) detail.style.display = "none";
  document.body.style.overflow = "auto"; 
}

// ==========================================
// 5. RESTORASYON GALERİSİ İŞLEMLERİ
// ==========================================
function setupRestorationGalleries() {
  globalRestorationBeforeIndex = 0;
  globalRestorationAfterIndex = 0;
  loadMoreRestorationImages('before');
  loadMoreRestorationImages('after');
}

function loadMoreRestorationImages(galleryType) {
  let galleryContainer = document.getElementById(`restoration-gallery-${galleryType}`);
  let loaderContainer = document.getElementById(`restoration-loader-${galleryType}`);
  let imagesArray = (galleryType === 'before') ? restorationBeforePaths : restorationAfterPaths;
  let currentIndex = (galleryType === 'before') ? globalRestorationBeforeIndex : globalRestorationAfterIndex;
  
  if (!galleryContainer) return;

  // Şimdilik hepsini yükle (Basitleştirilmiş mantık)
  const imagesHTML = imagesArray.map((img, index) => 
    `<img loading="lazy" src="${img}" alt="Restorasyon" onclick="openLightbox(this)" onerror="this.src='https://placehold.co/350x260/111/f59e0b?text=Resim+Yok'">`
  ).join("");

  galleryContainer.innerHTML = imagesHTML;
  if(loaderContainer) loaderContainer.innerHTML = "";
}

// ==========================================
// 6. LIGHTBOX (RESİM BÜYÜTME) SİSTEMİ
// ==========================================
// Manuel açma fonksiyonu (HTML içindeki onclick="openLightbox(this)" için)
function openLightbox(imgElement) {
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    
    if(lightbox && lightboxImg) {
        // Tıklanan resmin bulunduğu galeriyi bulup listeyi güncelle (İleri/Geri için)
        const gallery = imgElement.closest(".detail-gallery, .house-gallery, .restoration-gallery");
        if (gallery) {
            currentImages = Array.from(gallery.querySelectorAll("img"));
            currentIndex = currentImages.indexOf(imgElement);
        } else {
            // Galeri içinde değilse tek resim gibi davran
            currentImages = [imgElement];
            currentIndex = 0;
        }

        lightboxImg.src = imgElement.src;
        lightbox.style.display = "flex";
        lightbox.style.zIndex = "9999"; // En üstte olduğundan emin ol
        
        updateLightboxNav();
    }
}

// Genel Tıklama Dinleyicisi (Otomatik yakalama ve kapatma için)
document.addEventListener("click", function(e) {
  const lightbox = document.getElementById("lightbox");
  
  // Eğer Lightbox'ın siyah arka planına tıklanırsa kapat
  if (e.target.id === "lightbox") {
      lightbox.style.display = "none";
      return;
  }
  
  // Kapatma butonuna tıklanırsa
  if (e.target.id === "lightbox-close") {
      lightbox.style.display = "none";
      return;
  }
});

function updateLightboxNav() {
  const prevBtn = document.getElementById('lightbox-prev');
  const nextBtn = document.getElementById('lightbox-next');
  if (!prevBtn || !nextBtn) return;
  
  // Tek resim varsa okları gizle
  if (currentImages.length <= 1) {
      prevBtn.style.display = 'none';
      nextBtn.style.display = 'none';
      return;
  }
  
  prevBtn.style.display = 'block';
  nextBtn.style.display = 'block';
}

function showNextImage() {
  if (currentImages.length > 0) {
    currentIndex = (currentIndex + 1) % currentImages.length; // Döngüsel
    document.getElementById("lightbox-img").src = currentImages[currentIndex].src;
  }
}

function showPrevImage() {
  if (currentImages.length > 0) {
    currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length; // Döngüsel
    document.getElementById("lightbox-img").src = currentImages[currentIndex].src;
  }
}

// ==========================================
// 7. SAYFA YÖNETİMİ VE DİL
// ==========================================
async function setLanguage(lang) {
    let langData;
    try {
        const response = await fetch(`${lang}.json`);
        if (!response.ok) throw new Error('Dil dosyası yüklenemedi');
        langData = await response.json(); 
        translations[lang] = langData; 
    } catch (error) {
        console.warn(error);
        if(lang !== 'tr') return; // Fallback yoksa dur
    }
    
    if(langData) {
        document.documentElement.lang = lang; 
        document.querySelectorAll('[data-key]').forEach(el => {
            const key = el.getAttribute('data-key');
            if (langData[key]) el.innerHTML = langData[key];
        });
    }
    localStorage.setItem('lang', lang);
}

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
                // Dosya adı eşleştirmeleri
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
                    if (!response.ok) throw new Error(`Sayfa yüklenemedi: ${fileName}`);
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
        
        // Sayfa özel yüklemeleri
        if (pageId === 'page-pruva-otel') {
          setupRestorationGalleries();
        }
        
        // Dil güncellemesi
        const currentLang = localStorage.getItem('lang') || 'tr';
        if (translations[currentLang]) {
            newPage.querySelectorAll('[data-key]').forEach(el => {
                const key = el.getAttribute('data-key');
                if (translations[currentLang][key]) el.innerHTML = translations[currentLang][key];
            });
        }
    }
}

function loadCategory(category) {
    const grid = document.getElementById("project-grid");
    if (!grid) return;
    
    // Satılık Kiralık için boş geç (kendi HTML'i var)
    if (category === 'satilik_kiralik') return;

    grid.innerHTML = "";
    const items = projects[category] || [];
    
    items.forEach(p => {
        const card = document.createElement("div");
        card.className = "project-card";
        card.innerHTML = `<img src="${p.img}" alt="${p.name}" onerror="this.src='assets/background.webp'"><h3>${p.name}</h3>${p.price ? `<p>${p.price}</p>` : ''}`;
        grid.appendChild(card);
    });
}

// ==========================================
// 8. BAŞLANGIÇ (INIT)
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
    window.scrollTo(0, 0); 
    
    // Dil Ayarı
    let savedLang = localStorage.getItem('lang') || 'tr';
    await setLanguage(savedLang);

    // Resimleri Ön Yükle
    setTimeout(() => {
        Object.values(galleryDatabase).forEach(data => {
            data.images.forEach(src => { const i = new Image(); i.src = src; });
        });
    }, 2000);

    // Mobil Menü
    const menuToggle = document.getElementById('menu-toggle');
    if(menuToggle) {
        menuToggle.addEventListener('click', () => {
            document.getElementById('navbar').classList.toggle('open');
        });
    }

    // Navigasyon Linkleri
    document.body.addEventListener('click', (e) => {
        // Nav Linkleri
        if (e.target.matches('.nav-link, .btn-hero-link')) {
            e.preventDefault();
            const page = e.target.getAttribute('data-page');
            if(page) location.hash = page;
            // Mobilde menüyü kapat
            document.getElementById('navbar').classList.remove('open');
        }
        // Geri Butonu
        if (e.target.matches('.btn-page-back')) {
            e.preventDefault();
            location.hash = 'hero';
        }
    });

    // Hash Değişimi Dinleyicisi
    window.addEventListener('hashchange', () => {
        const pageId = location.hash.replace('#', '') || 'hero';
        showPage(pageId);
    });

    // İlk Açılış
    const initialPage = location.hash.replace('#', '') || 'hero';
    showPage(initialPage);
});
