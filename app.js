// ==========================================
// HATA YAKALAYICI (EN BAŞA EKLENDİ)
// ==========================================
window.onerror = function(message, source, lineno, colno, error) {
    console.error("JS Hatası:", message);
    document.body.style.opacity = "1";
    const hero = document.getElementById('hero');
    if(hero) hero.style.display = "flex";
};

// ==========================================
// 1. VERİ TABANI (RESİMLER VE DETAYLAR)
// ==========================================
// NOT: Verileri buraya sabitledik, artık harici dosya aramıyor.
const galleryDatabase = {
  "TUR-TR-MARDIN": {
    title: "Mardin - Tarihi Konaklar & Kültür Turu",
    price: "5 Gün / 4 Gece, 8.900 TL",
    location: "Mardin ve Çevresi",
    area: "Güneydoğu Anadolu",
    rooms: "Özel Butik Otel",
    desc: "Binlerce yıllık medeniyetin izlerini taşıyan Mardin'de taş konakları, tarihi kiliseleri ve Dara Antik Kenti'ni keşfedin. Yemekler ve yerel rehberlik dahildir.",
    images: [
      "assets/mardin-tarihi-konak-dokusu-1.webp", "assets/mardin-tarihi-konak-dokusu-2.webp", "assets/mardin-tarihi-konak-dokusu-3.webp", "assets/mardin-tarihi-konak-dokusu-4.webp", "assets/mardin-tarihi-konak-dokusu-5.webp", "assets/mardin-tarihi-konak-dokusu-6.webp", "assets/mardin-tarihi-konak-dokusu-7.webp", "assets/mardin-tarihi-konak-dokusu-8.webp", "assets/mardin-tarihi-konak-dokusu-9.webp", "assets/mardin-tarihi-konak-dokusu-10.webp", "assets/mardin-tarihi-konak-dokusu-11.webp", "assets/mardin-tarihi-konak-dokusu-12.webp", "assets/mardin-tarihi-konak-dokusu-13.webp", "assets/mardin-tarihi-konak-dokusu-14.webp", "assets/mardin-tarihi-konak-dokusu-15.webp", "assets/mardin-tarihi-konak-dokusu-16.webp"
    ]
  },
  "TUR-TR-ANTALYA": {
    title: "Antalya - Koy Gezisi & Tarihi Kaleiçi",
    price: "7 Gün / 6 Gece, 12.500 TL",
    location: "Antalya, Kaş, Kemer",
    area: "Akdeniz Bölgesi",
    rooms: "Her şey Dahil Otel",
    desc: "Akdeniz'in turkuaz sularında Kaş ve Kalkan koylarını keşfedin. Tarihi Kaleiçi'nin dar sokaklarında keyifli bir mola ve Aspendos Antik Tiyatrosu ziyareti.",
    images: [
      "assets/antalya-koy-gezisi-1.webp"
    ]
  },
  "TUR-TR-KAPADOKYA": {
    title: "Kapadokya - Balon ve Peribacaları Turu",
    price: "4 Gün / 3 Gece, 9.800 TL",
    location: "Göreme, Uçhisar, Avanos",
    area: "İç Anadolu",
    rooms: "Mağara Otel Konaklama",
    desc: "Eşsiz Kapadokya vadilerinde gün doğumu balon turu deneyimi. Yer altı şehirleri, kiliseler ve çömlek atölyeleri gezisi. Tüm transferler dahil.",
    images: [
      "assets/kapadokya-balon-turu-1.webp", "assets/kapadokya-balon-turu-2.webp", "assets/kapadokya-balon-turu-3.webp", "assets/kapadokya-balon-turu-4.webp", "assets/kapadokya-balon-turu-5.webp", "assets/kapadokya-balon-turu-6.webp", "assets/kapadokya-balon-turu-7.webp", "assets/kapadokya-balon-turu-8.webp", "assets/kapadokya-balon-turu-9.webp", "assets/kapadokya-balon-turu-10.webp", "assets/kapadokya-balon-turu-11.webp", "assets/kapadokya-balon-turu-12.webp", "assets/kapadokya-balon-turu-13.webp", "assets/kapadokya-balon-turu-14.webp", "assets/kapadokya-balon-turu-15.webp", "assets/kapadokya-balon-turu-16.webp", "assets/kapadokya-balon-turu-17.webp", "assets/kapadokya-balon-turu-18.webp", "assets/kapadokya-balon-turu-19.webp", "assets/kapadokya-balon-turu-20.webp"
    ]
  },
  "TUR-TR-FETHIYE": {
    title: "Fethiye - Yamaç Paraşütü & Ölüdeniz",
    price: "3 Gün / 2 Gece, 6.750 TL",
    location: "Ölüdeniz, Kelebekler Vadisi",
    area: "Ege Bölgesi",
    rooms: "Butik Pansiyon",
    desc: "Ölüdeniz'in eşsiz manzarasında Babadağ'dan yamaç paraşütü heyecanı. Kelebekler Vadisi tekne turu ve Likya Yolu yürüyüşü.",
    images: [
      "assets/fethiye-oludeniz-manzarasi-14.webp"
    ]
  },
  "TUR-TR-PAMUKKALE": {
    title: "Pamukkale - Travertenler & Antik Kent",
    price: "2 Gün / 1 Gece, 4.500 TL",
    location: "Pamukkale, Hierapolis",
    area: "Denizli",
    rooms: "Termal Otel",
    desc: "Pamukkale'nin bembeyaz traverten teraslarında yürüyüş. Hierapolis Antik Kenti ve Kleopatra Havuzu ziyareti.",
    images: [
      "assets/pamukkale-traverten-dogal-1.webp", "assets/pamukkale-traverten-dogal-2.webp", "assets/pamukkale-traverten-dogal-3.webp", "assets/pamukkale-traverten-dogal-4.webp", "assets/pamukkale-traverten-dogal-5.webp", "assets/pamukkale-traverten-dogal-6.webp", "assets/pamukkale-traverten-dogal-7.webp", "assets/pamukkale-traverten-dogal-8.webp", "assets/pamukkale-traverten-dogal-9.webp", "assets/pamukkale-traverten-dogal-10.webp", "assets/pamukkale-traverten-dogal-11.webp", "assets/pamukkale-traverten-dogal-12.webp"
    ]
  },
  "TUR-D-ISPANYA": {
    title: "İspanya - Barselona & Endülüs Rüyası",
    price: "9 Gün / 8 Gece, 1.800 €",
    location: "Barselona, Granada, Sevilla",
    area: "İspanya",
    rooms: "4 Yıldızlı Oteller",
    desc: "Gaudi'nin eserleri Sagrada Familia'yı ve Endülüs'ün büyülü El Hamra Sarayı'nı ziyaret edin. Flamenko gösterisi dahildir.",
    images: [
      "assets/spain-1.webp", "assets/spain-2.webp", "assets/spain-3.webp", "assets/spain-4.webp", "assets/spain-5.webp", "assets/spain-6.webp", "assets/spain-7.webp", "assets/spain-8.webp", "assets/spain-9.webp", "assets/spain-10.webp", "assets/spain-11.webp", "assets/spain-12.webp", "assets/spain-13.webp", "assets/spain-14.webp", "assets/spain-15.webp"
    ]
  },
  "TUR-D-RUSYA": {
    title: "Rusya (kış Masalı)",
    price: "6 Gün / 5 Gece, 1.450 €",
    location: "Moskova, St. Petersburg",
    area: "Rusya Federasyonu",
    rooms: "5 Yıldızlı Oteller",
    desc: "Kızıl Meydan, Hermitage Müzesi ve Çar'ın yazlık sarayları. Rus Sanat ve tarihine odaklı özel tur.",
    images: [
      "assets/rusya-1.webp", "assets/rusya-2.webp", "assets/rusya-3.webp", "assets/rusya-4.webp", "assets/rusya-5.webp", "assets/rusya-6.webp", "assets/rusya-7.webp", "assets/rusya-8.webp", "assets/rusya-9.webp", "assets/rusya-10.webp", "assets/rusya-11.webp", "assets/rusya-12.webp", "assets/rusya-13.webp"
    ]
  },
  "TUR-D-BREZILYA": {
    title: "Brezilya - Rio Karnavalı ve Amazon",
    price: "10 Gün / 9 Gece, 2.990 $",
    location: "Rio de Janeiro, Manaus",
    area: "Brezilya",
    rooms: "Lüks Lodge ve Oteller",
    desc: "Rio'da Corcovado Dağı, Ipanema Plajı ve Sambadrome. Amazon Yağmur Ormanları'nda rehberli doğa gezisi.",
    images: [
      "assets/brazil-1.webp", "assets/brazil-2.webp", "assets/brazil-3.webp", "assets/brazil-4.webp", "assets/brazil-5.webp", "assets/brazil-6.webp", "assets/brazil-7.webp", "assets/brazil-8.webp", "assets/brazil-9.webp", "assets/brazil-10.webp", "assets/brazil-11.webp", "assets/brazil-12.webp", "assets/brazil-13.webp", "assets/brazil-14.webp", "assets/brazil-15.webp"
    ]
  },
  "TUR-D-AMERIKA": {
    title: "ABD - New York & Batı Kıyısı",
    price: "14 Gün / 13 Gece, 3.500 $",
    location: "New York, Los Angeles, San Francisco",
    area: "Amerika Birleşik Devletleri",
    rooms: "4 Yıldızlı Oteller",
    desc: "New York'ta Özgürlük Heykeli, LA'de Hollywood ve San Francisco'da Golden Gate Köprüsü. Tamamen rehberli büyük tur.",
    images: [
      "assets/new-york-1.webp", "assets/new-york-2.webp", "assets/new-york-3.webp", "assets/new-york-4.webp", "assets/new-york-5.webp", "assets/new-york-6.webp", "assets/new-york-7.webp", "assets/new-york-8.webp", "assets/new-york-9.webp"
    ]
  }
};

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
// 2. GLOBAL DEĞİŞKENLER
// ==========================================
const translations = {}; 
const pageCache = {}; 
let globalPropertyImages = [];
let currentImages = [];
let currentIndex = 0;

// Restorasyon Galerisi Değişkenleri
const restorationBeforePaths = ["assets/restorasyon-1-befor.webp", "assets/restorasyon-2-before.webp"];
const restorationAfterPaths = ["assets/restorasyon-1-after.webp", "assets/restorasyon-2-after.webp"];
let globalRestorationBeforeIndex = 0;
let globalRestorationAfterIndex = 0;

// ==========================================
// 3. DETAY SAYFASI MANTIĞI
// ==========================================
function openHouseDetail(id) {
  const detail = document.getElementById("house-detail");
  const content = document.getElementById("house-detail-content");
  
  // Veritabanından veriyi çek
  const data = galleryDatabase[id];
  
  // Eğer veri yoksa varsayılan boş veri kullan
  const safeData = data || { 
    title: "Detaylar", 
    desc: "İçerik yükleniyor veya bulunamadı...", 
    price: "", 
    location: "", 
    images: [] 
  };

  // Global resim listesini güncelle (Lightbox için)
  globalPropertyImages = safeData.images || [];

  content.innerHTML = `
    <h2 style="color:#ffcc66; margin-top:20px; text-align:center;">${safeData.title}</h2>
    
    <div class="house-info" style="color:#ddd; text-align:left; max-width:800px; margin:0 auto; padding:20px;">
      <p><strong>📍 Konum:</strong> ${safeData.location}</p>
      <p><strong>💰 Fiyat:</strong> ${safeData.price}</p>
      <p>${safeData.desc}</p>
      <a href="mailto:info@walkaboutravel.com" class="btn" style="margin-top:15px; display:inline-block;">Rezervasyon Yap</a>
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
      galleryContainer.innerHTML = "<p style='text-align:center; color:#777;'>Görsel bulunamadı.</p>";
  }

  if(detail) {
      detail.style.display = "block";
      detail.style.zIndex = "9998"; 
      document.body.style.overflow = "hidden"; 
  }
}

function closeHouseDetail() {
  const detail = document.getElementById("house-detail");
  if (detail) detail.style.display = "none";
  document.body.style.overflow = "auto"; 
}

// ==========================================
// 4. LIGHTBOX (RESİM BÜYÜTME)
// ==========================================
function openLightbox(imgElement) {
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    
    if(lightbox && lightboxImg) {
        const gallery = imgElement.closest(".detail-gallery, .house-gallery, .restoration-gallery");
        if (gallery) {
            currentImages = Array.from(gallery.querySelectorAll("img"));
            currentIndex = currentImages.indexOf(imgElement);
        } else {
            currentImages = [imgElement];
            currentIndex = 0;
        }

        lightboxImg.src = imgElement.src;
        lightbox.style.display = "flex";
        lightbox.style.zIndex = "9999"; 
        
        updateLightboxNav();
    }
}

document.addEventListener("click", function(e) {
  const lightbox = document.getElementById("lightbox");
  if (e.target.id === "lightbox" || e.target.id === "lightbox-close") {
      if(lightbox) lightbox.style.display = "none";
  }
});

function updateLightboxNav() {
  const prevBtn = document.getElementById('lightbox-prev');
  const nextBtn = document.getElementById('lightbox-next');
  if (!prevBtn || !nextBtn) return;
  
  if (currentImages.length <= 1) {
      prevBtn.style.display = 'none';
      nextBtn.style.display = 'none';
  } else {
      prevBtn.style.display = 'block';
      nextBtn.style.display = 'block';
  }
}

function showNextImage() {
  if (currentImages.length > 0) {
    currentIndex = (currentIndex + 1) % currentImages.length;
    document.getElementById("lightbox-img").src = currentImages[currentIndex].src;
  }
}

function showPrevImage() {
  if (currentImages.length > 0) {
    currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
    document.getElementById("lightbox-img").src = currentImages[currentIndex].src;
  }
}

// ==========================================
// 5. SAYFA YÖNETİMİ (ROUTING)
// ==========================================
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
                    if (!response.ok) throw new Error("Dosya bulunamadı");
                    const html = await response.text();
                    pageCache[pageId] = html; 
                    document.getElementById('page-container').insertAdjacentHTML('beforeend', html);
                }
            } catch (error) {
                console.warn("Sayfa yüklenemedi:", error);
                if(document.getElementById('hero')) {
                     location.hash = 'hero';
                     document.getElementById('hero').classList.add('active');
                     return;
                }
            }
        }
        newPage = document.getElementById(pageId);
    }

    if (newPage) {
        if (location.hash.replace('#', '') !== pageId) {
            location.hash = pageId;
        }
        newPage.classList.add('active');
        const homeBlog = document.getElementById('homepage-blog');
        if (homeBlog) {
            if (pageId === 'hero') homeBlog.classList.add('active');
            else homeBlog.classList.remove('active');
        }
        window.scrollTo(0, 0); 
        
        const currentLang = localStorage.getItem('lang') || 'tr';
        if (translations[currentLang]) {
            newPage.querySelectorAll('[data-key]').forEach(el => {
                const key = el.getAttribute('data-key');
                if (translations[currentLang][key]) el.innerHTML = translations[currentLang][key];
            });
        }
    } else {
        const hero = document.getElementById('hero');
        if(hero) hero.classList.add('active');
    }
}

function loadCategory(category) {
    const grid = document.getElementById("project-grid");
    if (!grid) return;
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

async function setLanguage(lang) {
    try {
        const response = await fetch(`${lang}.json`);
        if (response.ok) {
            const langData = await response.json();
            translations[lang] = langData;
            document.documentElement.lang = lang; 
            document.querySelectorAll('[data-key]').forEach(el => {
                const key = el.getAttribute('data-key');
                if (langData[key]) el.innerHTML = langData[key];
            });
        }
    } catch (e) { console.warn("Dil yüklenemedi:", e); }
    localStorage.setItem('lang', lang);
}

// ==========================================
// 6. BAŞLANGIÇ (INIT)
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log("Site başlatılıyor...");
        
        let savedLang = localStorage.getItem('lang') || 'tr';
        await setLanguage(savedLang);

        const menuToggle = document.getElementById('menu-toggle');
        if(menuToggle) {
            menuToggle.addEventListener('click', () => {
                const nav = document.getElementById('navbar');
                if(nav) nav.classList.toggle('open');
            });
        }

        document.body.addEventListener('click', (e) => {
            if (e.target.matches('.nav-link, .btn-hero-link')) {
                e.preventDefault();
                const page = e.target.getAttribute('data-page');
                if(page) location.hash = page;
                const nav = document.getElementById('navbar');
                if(nav) nav.classList.remove('open');
            }
            if (e.target.matches('.btn-page-back')) {
                e.preventDefault();
                location.hash = 'hero';
            }
        });

        window.addEventListener('hashchange', () => {
            const pageId = location.hash.replace('#', '') || 'hero';
            showPage(pageId);
        });

        const initialPage = location.hash.replace('#', '') || 'hero';
        showPage(initialPage);

        setTimeout(() => {
            document.body.style.opacity = "1";
            const hero = document.getElementById('hero');
            if(hero && !location.hash) hero.classList.add('active');
        }, 500);

    } catch (err) {
        console.error("Başlatma hatası:", err);
        document.body.style.opacity = "1";
        const hero = document.getElementById('hero');
        if(hero) hero.style.display = "flex";
    }
// ==========================================
// 7. HEADER SCROLL EFEKTİ (EKLEME)
// ==========================================
window.addEventListener('scroll', function() {
    const header = document.getElementById('main-header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
        header.style.padding = '5px 32px'; // Biraz küçült
    } else {
        header.classList.remove('scrolled');
        header.style.padding = '16px 32px'; // Eski haline getir
    }
});