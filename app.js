// === YARDIMCI FONKSİYONLAR ===
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

// === OTOMATİK RESİM LİSTESİ OLUŞTURUCU ===
function generateImages(baseName, count) {
    const images = [];
    for (let i = 1; i <= count; i++) {
        images.push(`assets/${baseName}${i}.webp`);
    }
    return images;
}

// === GLOBAL DEĞİŞKENLER ===
const translations = {}; 
const pageCache = {}; 
let globalPropertyImages = [];
let globalImageIndex = 0;
const IMAGES_PER_LOAD = 6; 

// === TURİZM VERİ TABANI ===
const TOUR_DATA = {
  // --- YURT İÇİ ---
  "TUR-TR-MARDIN": {
    "title": "Mardin - Tarihi Konaklar & Kültür Turu",
    "price": "5 Gün / 4 Gece, 8.900 TL",
    "location": "Mardin ve Çevresi",
    "area": "Güneydoğu Anadolu",
    "rooms": "Özel Butik Otel",
    "desc": "Binlerce yıllık medeniyetin izlerini taşıyan Mardin'de taş konakları, tarihi kiliseleri ve Dara Antik Kenti'ni keşfedin. Yemekler ve yerel rehberlik dahildir.",
    "images": generateImages("mardin tarihi ko nak-dokusu-", 16) 
  },
  "TUR-TR-ANTALYA": {
    "title": "Antalya - Koy Gezisi & Tarihi Kaleiçi",
    "price": "7 Gün / 6 Gece, 12.500 TL",
    "location": "Antalya, Kaş, Kemer",
    "area": "Akdeniz Bölgesi",
    "rooms": "Her şey Dahil Otel",
    "desc": "Akdeniz'in turkuaz sularında Kaş ve Kalkan koylarını keşfedin. Tarihi Kaleiçi'nin dar sokaklarında keyifli bir mola ve Aspendos Antik Tiyatrosu ziyareti.",
    "images": generateImages("antalya koy gezisi si-", 17)
  },
  "TUR-TR-KAPADOKYA": {
    "title": "Kapadokya - Balon ve Peribacaları Turu",
    "price": "4 Gün / 3 Gece, 9.800 TL",
    "location": "Göreme, Uçhisar, Avanos",
    "area": "İç Anadolu",
    "rooms": "Mağara Otel Konaklama",
    "desc": "Eşsiz Kapadokya vadilerinde gün doğumu balon turu deneyimi. Yer altı şehirleri, kiliseler ve çömlek atölyeleri gezisi. Tüm transferler dahil.",
    "images": generateImages("kapadokya-balon-turu-", 20)
  },
  "TUR-TR-FETHIYE": {
    "title": "Fethiye - Yamaç Paraşütü & Ölüdeniz",
    "price": "3 Gün / 2 Gece, 6.750 TL",
    "location": "Ölüdeniz, Kelebekler Vadisi",
    "area": "Ege Bölgesi",
    "rooms": "Butik Pansiyon",
    "desc": "Ölüdeniz'in eşsiz manzarasında Babadağ'dan yamaç paraşütü heyecanı. Kelebekler Vadisi tekne turu ve Likya Yolu yürüyüşü.",
    "images": generateImages("fethiye-oludeniz-manzarasi-", 19)
  },
  "TUR-TR-PAMUKKALE": {
    "title": "Pamukkale - Travertenler & Antik Kent",
    "price": "2 Gün / 1 Gece, 4.500 TL",
    "location": "Pamukkale, Hierapolis",
    "area": "Denizli",
    "rooms": "Termal Otel",
    "desc": "Pamukkale'nin bembeyaz traverten teraslarında yürüyüş. Hierapolis Antik Kenti ve Kleopatra Havuzu ziyareti.",
    "images": generateImages("pamukkale traver ten-dogal-", 11)
  },

  // --- YURT DIŞI ---
  "TUR-D-ISPANYA": {
    "title": "İspanya - Barselona & Endülüs Rüyası",
    "price": "9 Gün / 8 Gece, 1.800 €",
    "location": "Barselona, Granada, Sevilla",
    "area": "İspanya",
    "rooms": "4 Yıldızlı Oteller",
    "desc": "Gaudi'nin eserleri Sagrada Familia'yı ve Endülüs'ün büyülü El Hamra Sarayı'nı ziyaret edin. Flamenko gösterisi dahildir.",
    "images": generateImages("spain-", 15)
  },
  "TUR-D-RUSYA-KIS": {
    "title": "Rusya (Kış Masalı)",
    "price": "6 Gün / 5 Gece, 1.450 €",
    "location": "Moskova, St. Petersburg",
    "area": "Rusya Federasyonu",
    "rooms": "5 Yıldızlı Oteller",
    "desc": "Kızıl Meydan, Hermitage Müzesi ve Çar'ın yazlık sarayları. Rus Sanat ve tarihine odaklı özel tur.",
    "images": generateImages("rusya-", 13)
  },
  "TUR-D-BREZILYA": {
    "title": "Brezilya - Rio Karnavalı ve Amazon",
    "price": "10 Gün / 9 Gece, 2.990 $",
    "location": "Rio de Janeiro, Manaus",
    "area": "Brezilya",
    "rooms": "Lüks Lodge ve Oteller",
    "desc": "Rio'da Corcovado Dağı, Ipanema Plajı ve Sambadrome. Amazon Yağmur Ormanları'nda rehberli doğa gezisi.",
    "images": generateImages("brazil ", 15)
  },
  "TUR-D-AMERIKA": {
    "title": "ABD - New York & Batı Kıyısı",
    "price": "14 Gün / 13 Gece, 3.500 $",
    "location": "New York, Los Angeles, San Francisco",
    "area": "Amerika Birleşik Devletleri",
    "rooms": "4 Yıldızlı Oteller",
    "desc": "New York'ta Özgürlük Heykeli, LA'de Hollywood ve San Francisco'da Golden Gate Köprüsü. Tamamen rehberli büyük tur.",
    "images": generateImages("new-york-", 9)
  }
};


// === DETAY PENCERESİ ===
async function openHouseDetail(tourID) {
  const tour = TOUR_DATA[tourID]; 
  if (!tour) return;

  const detail = document.getElementById("house-detail");
  const content = document.getElementById("house-detail-content");
  
  content.innerHTML = `
    <h2 style="color: #ffcc66; font-family: 'Playfair Display', serif; margin-bottom: 20px;">${tour.title}</h2>
    
    <div class="house-info" style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 10px; border: 1px solid #333;">
      <div style="margin-bottom: 10px;">
        <i class="fas fa-map-marker-alt" style="color: #ffcc66; width: 20px;"></i> 
        <strong style="color: #fff;">Lokasyon:</strong> <span style="color: #ccc;">${tour.location} (${tour.area})</span>
      </div>
      <div style="margin-bottom: 10px;">
        <i class="fas fa-clock" style="color: #ffcc66; width: 20px;"></i> 
        <strong style="color: #fff;">Süre & Fiyat:</strong> <span style="color: #ffcc66; font-weight: bold;">${tour.price}</span>
      </div>
      <div style="margin-bottom: 10px;">
        <i class="fas fa-bed" style="color: #ffcc66; width: 20px;"></i> 
        <strong style="color: #fff;">Konaklama:</strong> <span style="color: #ccc;">${tour.rooms}</span>
      </div>
      <hr style="border: 0; border-top: 1px solid #444; margin: 20px 0;">
      <p style="color: #ddd; line-height: 1.6;">${tour.desc}</p>
      <div style="margin-top: 25px; text-align: center;">
          <a href="mailto:info@walkaboutravel.com?subject=Rezervasyon Talebi: ${tour.title}" class="btn" style="display: inline-block;">
             <i class="fas fa-paper-plane"></i> Rezervasyon Yap
          </a>
      </div>
    </div>
    <div class="detail-gallery" id="detail-gallery-container" style="margin-top: 30px;"></div>
  `;

  globalPropertyImages = tour.images || [];
  globalImageIndex = 0;
  loadMorePropertyImages();
  
  detail.style.display = "block";
  document.body.style.overflow = "hidden"; 
}

function closeHouseDetail() {
  const detail = document.getElementById("house-detail");
  if (detail) detail.style.display = "none";
  document.body.style.overflow = "auto"; 
}

// === GALERİ RESİM YÜKLEME ===
function loadMorePropertyImages() {
  const galleryContainer = document.getElementById('detail-gallery-container');
  if (!galleryContainer) return;
  if (globalPropertyImages.length === 0) {
      galleryContainer.innerHTML = "<p style='text-align:center; color:#666;'>Bu tur için henüz görsel eklenmemiş.</p>";
      return;
  }
  const imagesToLoad = globalPropertyImages.slice(globalImageIndex, globalImageIndex + IMAGES_PER_LOAD);
  const imagesHTML = imagesToLoad.map(img => 
    `<img loading="lazy" src="${img}" alt="Tur Görseli" onclick="openLightbox(this.src)" onerror="this.style.display='none'" style="cursor:pointer; transition: transform 0.3s;">`
  ).join("");
  galleryContainer.insertAdjacentHTML('beforeend', imagesHTML);
  globalImageIndex += IMAGES_PER_LOAD;
}

// === LIGHTBOX ===
function openLightbox(src) {
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    if(lightbox && lightboxImg) {
        lightboxImg.src = src;
        lightbox.style.display = "flex";
    }
}

// === SAYFA YÖNETİMİ VE DİL ===
async function setLanguage(lang) {
    let langData;
    if (translations[lang]) {
        langData = translations[lang];
    } else {
        try {
            const response = await fetch(`${lang}.json`);
            if (!response.ok) throw new Error("Dil dosyası yok");
            langData = await response.json(); 
            translations[lang] = langData; 
        } catch (error) {
            console.warn("Dil yüklenemedi, varsayılan (TR) kullanılıyor.");
            if (lang !== 'tr' && !translations['tr']) await setLanguage('tr');
            return;
        }
    }
    
    document.documentElement.lang = lang; 
    document.documentElement.dir = (lang === 'ar') ? 'rtl' : 'ltr';

    document.querySelectorAll('[data-key]').forEach(el => {
        const key = el.getAttribute('data-key');
        if (langData && langData[key]) el.innerHTML = langData[key];
    });
    localStorage.setItem('lang', lang);
}

async function showPage(pageId) {
    if (!pageId || pageId === '#') pageId = 'hero';
    document.querySelectorAll('.page-section').forEach(sec => sec.classList.remove('active', 'visible'));

    let newPage = document.getElementById(pageId);
    
    if (!newPage) {
        if (pageCache[pageId]) {
            document.getElementById('page-container').insertAdjacentHTML('beforeend', pageCache[pageId]);
        } else {
            try {
                let fileName = pageId;
                if (pageId.startsWith('page-')) fileName = pageId.replace('page-', '');
                if (pageId === 'page-satilik_kiralik') fileName = "satilik_kiralik";
                
                const response = await fetch(`${fileName}.html`);
                if (!response.ok) throw new Error("Sayfa bulunamadı");
                const html = await response.text();
                
                pageCache[pageId] = html; 
                document.getElementById('page-container').insertAdjacentHTML('beforeend', html);
            } catch (e) {
                console.error(e);
                return;
            }
        }
        newPage = document.getElementById(pageId);
    }

    if (newPage) {
        if (location.hash.replace('#', '') !== pageId) location.hash = pageId;
        newPage.classList.add('active');
        window.scrollTo(0, 0);

        const currentLang = localStorage.getItem('lang') || 'tr';
        if (translations[currentLang]) {
            newPage.querySelectorAll('[data-key]').forEach(el => {
                const key = el.getAttribute('data-key');
                if (translations[currentLang][key]) el.innerHTML = translations[currentLang][key];
            });
        }
        setTimeout(() => newPage.classList.add('visible'), 50);
    }
}

// === BAŞLANGIÇ AYARLARI VE SLIDER ===
document.addEventListener('DOMContentLoaded', async () => {
    await setLanguage(localStorage.getItem('lang') || 'tr');
    const initialPage = location.hash.replace('#', '') || 'hero';
    showPage(initialPage);

    window.addEventListener('hashchange', () => {
        showPage(location.hash.replace('#', '') || 'hero');
    });

    const menuToggle = document.getElementById('menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            document.getElementById('navbar').classList.toggle('open');
        });
    }

    document.body.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-page-back')) {
            e.preventDefault();
            location.hash = 'hero';
        }
        if (e.target.matches('[data-page]')) {
            e.preventDefault();
            const page = e.target.getAttribute('data-page');
            location.hash = page;
            document.getElementById('navbar').classList.remove('open');
        }
        if (e.target.id === 'lightbox') {
            e.target.style.display = 'none';
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === "Escape") {
            const detail = document.getElementById("house-detail");
            const lightbox = document.getElementById("lightbox");
            if (detail) detail.style.display = "none";
            if (lightbox) lightbox.style.display = "none";
            document.body.style.overflow = "auto";
        }
    });

    // --- HTML'DEN TAŞINAN HERO SLIDER MANTIĞI ---
    const sliderData = [
        {
            title: "Kurumsal Seyahat",
            description: "İş toplantılarınız ve kongreleriniz için özel lojistik ve konaklama çözümleri sunuyoruz."
        },
        {
            title: "Özel Turlar & Deneyimler",
            description: "Size özel rehberler ve benzersiz rotalarla unutulmaz kültür ve macera turları düzenliyoruz."
        },
        {
            title: "Bilet & Transfer",
            description: "Dünya çapında en uygun uçak, otobüs ve tren biletlerini hızlıca sağlıyor, konforlu transferinizi planlıyoruz."
        },
        {
            title: "Konaklama & Rezervasyon", 
            description: "İhtiyaçlarınıza uygun en lüks ve konforlu konaklama seçeneklerini güvenle rezerve ediyoruz."
        }
    ];

    let sliderIndex = 0; 
    const textElement = document.getElementById('changing-text'); 
    const intervalTime = 5000; 

    function changeTextWithFade() {
        if(textElement) {
            textElement.style.opacity = '0'; 
        }

        setTimeout(() => {
            if(textElement) {
                const currentData = sliderData[sliderIndex];
                textElement.innerHTML = `<strong>${currentData.title}</strong><br>${currentData.description}`;
                textElement.style.opacity = '1'; 
                sliderIndex = (sliderIndex + 1) % sliderData.length;
            }
        }, 500); 
    }

    if(textElement) {
        changeTextWithFade();
        setInterval(changeTextWithFade, intervalTime);
    }
});
