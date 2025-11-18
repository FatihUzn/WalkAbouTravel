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

// === YENİ EKLEMELER: Galeri sayfalandırma için (Sadece Turizm Galerisi için kalması gerektiği varsayıldı) ===
let globalPropertyImages = [];
let globalImageIndex = 0;
const IMAGES_PER_LOAD = 8; // Her seferinde 8 resim yükle
// === YENİ EKLEMELER SONU ===

// === Restorasyon değişkenleri kaldırıldı ===

// === openHouseDetail fonksiyonu KALDIRILDI (Artık sadece otel için lightbox kullanılacak) ===
/*
async function openHouseDetail(letter) { ... }
function closeHouseDetail() { ... }
*/

// === loadMorePropertyImages fonksiyonu KALDIRILDI (Detay galerisi yok) ===
/*
function loadMorePropertyImages() { ... }
*/

// === Restorasyon Galeri Fonksiyonları KALDIRILDI ===
/*
function setupRestorationGalleries() { ... }
function loadMoreRestorationImages(galleryType) { ... }
*/

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

// === showPage fonksiyonu MOBİL GERİ TUŞU için güncellendi ===
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
                
                // if (pageId === 'page-restorasyon') fileName = "restorasyon"; // KALDIRILDI
                
                
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

        // === Restorasyon galerisi kurulum kontrolü KALDIRILDI ===
        /*
        if (pageId === 'page-pruva-otel') {
          setupRestorationGalleries();
        }
        */
        
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


function preloadProjectImages() {
    const allImageUrls = [
        ...projects.otel.map(p => p.img),

    ]; 
    allImageUrls.forEach(url => {
        if (url.startsWith('http')) return; 
        const img = new Image();
        img.src = url; 
    });
    console.log("Proje görselleri arka planda yükleniyor.");
}
 
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
  
  // Sadece otel projesine özel kontrol kaldı
  if (category !== 'otel' || !projects.otel) {
    // Buraya düşerse ya yanlış kategori ya da data yok demektir.
    // Varsayılan olarak boş bırakıldı, loadCategory çağrılmazsa bu kısım çalışmaz.
    grid.innerHTML = `<p>Otel projesi kategorisi dışındaki tüm kategori görselleri kaldırılmıştır.</p>`;
    if (titleEl) titleEl.textContent = titles['default_projects'];
    grid.style.opacity = "1";
    return;
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
        // Bu kısım normalde otel dışı projeler için çalışıyordu, artık sadece otel kaldı
        grid.innerHTML = `<p data-key="no_projects">${langData.no_projects || 'Bu kategori için proje bulunamadı.'}</p>`;
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

// === BU FONKSİYON KALDIRILDI ===
// function handleScrollEffects() { ... }
// === KALDIRMA SONU ===

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
    const modal = document.getElementById("availability-modal");
    if (!modal) return;
    
    if (e.target && e.target.id === 'otel-search') {
        const message = document.getElementById("availability-message");
        if (!message) return;

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
                const subject = encodeURIComponent("Rezervasyon Talebi - Golden Palace Otel");
                const body = encodeURIComponent(`Merhaba,%0A%0A${checkin} - ${checkout} tarihleri arasında rezervasyon yapmak istiyorum.%0A%0Aİyi günler.`);
                window.location.href = `mailto:info@goldenpalace.com?subject=${subject}&body=${body}`;
            });

            message.parentElement.appendChild(mailBtn);
        } else {
            message.innerHTML = langData.modal_avail_fail || '❌ Maalesef bu tarihlerde müsait oda bulunamadı.';
        }

        modal.classList.add("show");
    }

    if (e.target && e.target.id === 'close-modal-btn') {
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
        // CTA Grubu 'discover-cta' index.html'den kaldırıldığı için bu uyarı kaldırıldı.
        // console.error("CTA Grubu 'discover-cta' bulunamadı!");
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

// === Lightbox açma, kapama ve navigasyon mantığı (Detay Galerisi için) KALDIRILDI ===
/*
document.addEventListener("click", function(e) { ... });
function updateLightboxNav() { ... }
function showNextImage() { ... }
function showPrevImage() { ... }
document.addEventListener("keydown", function (e) { ... });
let touchStartX = 0;
let touchEndX = 0;
const swipeThreshold = 50;
const lightbox = document.getElementById("lightbox");
if (lightbox) { ... }
let scale = 1;
let startDistance = 0;
const lightboxImg = document.getElementById("lightbox-img");
if (lightboxImg) { ... }
*/

// === Restorasyon modal olay dinleyicileri KALDIRILDI ===
/*
document.body.addEventListener('click', (e) => { ... });
function closeImageModal() { ... }
document.addEventListener('keydown', (event) => { ... });
*/