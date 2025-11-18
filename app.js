// --- BLOK 1: Otel Rezervasyon Modalı ---
// (Artık 'DOMContentLoaded' içinde değil, gerektiğinde çağrılacak)
function setupOtelModal() {
  const reserveBtn = document.getElementById("hero-reserve-btn");
  const reservationContainer = document.getElementById("otel-reservation-container");
  const closeBtn = document.getElementById("otel-close");

  if (reserveBtn && reservationContainer) {
    reserveBtn.addEventListener("click", () => {
      reservationContainer.classList.add("show");
      reservationContainer.scrollIntoView({ behavior: "smooth" });
    });
  }
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      reservationContainer.classList.remove("show");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  const searchBtn = document.getElementById("otel-search");
  const modal = document.getElementById("availability-modal");
  const message = document.getElementById("availability-message");
  const closeModalBtn = document.getElementById("close-modal-btn");

  if (searchBtn) {
    searchBtn.addEventListener("click", () => {
      const checkin = document.getElementById("otel-checkin").value;
      const checkout = document.getElementById("otel-checkout").value;
      
      const currentLang = localStorage.getItem('lang') || 'tr';
      const langData = translations[currentLang] || {};

      if (!checkin || !checkout) {
        message.textContent = langData.alert_dates || "⚠️ Lütfen giriş ve çıkış tarihlerini seçin.";
        modal.classList.add("show");
        return;
      }

      const existingMailBtn = message.parentElement.querySelector('.btn-mail');
      if (existingMailBtn) existingMailBtn.remove();

      const random = Math.random();
      if (random > 0.5) {
        message.innerHTML = langData.modal_avail_success || "✅ Müsait odalar bulundu!<br><br><strong>...</strong>";
        const mailBtn = document.createElement("button");
        mailBtn.textContent = langData.btn_mail_reserve || "E-posta ile Rezervasyon Yap";
        mailBtn.classList.add("btn", "btn-mail");
        mailBtn.style.marginTop = "15px";
        mailBtn.addEventListener("click", () => {
          const subject = encodeURIComponent("Rezervasyon Talebi - WalkAboutTravel Otel");
          const body = encodeURIComponent(`Merhaba,%0A%0A${checkin} - ${checkout} tarihleri arasında rezervasyon yapmak istiyorum.`);
          window.location.href = `mailto:info@WalkAboutTravel.com?subject=${subject}&body=${body}`;
        });
        message.parentElement.appendChild(mailBtn);
      } else {
        message.textContent = langData.modal_avail_fail || "❌ Maalesef bu tarihlerde müsait oda bulunamadı.";
      }
      modal.classList.add("show");
    });
  }

  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", () => {
      modal.classList.remove("show");
    });
  }
}
// --- BLOK 1 SONU ---


// --- BLOK 2: Ana Uygulama Mantığı (GÜNCELLENDİ) ---

// 🌟 ADIM 1.A GÜNCELLEMESİ: 'translations' artık boş bir önbellek
const translations = {};

// 🌟 ADIM 1.B GÜNCELLEMESİ: 'projects' artık 'null' bir önbellek
let allProjectsData = null;

// 🌟 ADIM 2.A GÜNCELLEMESİ: HTML Sayfa Önbelleği
const pageCache = {};

// --- Fonksiyonlar ---

// 🌟 GÜNCELLEME: 'setLanguage' artık 'async' ve 'fetch' kullanıyor
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
      console.warn(error);
      if (lang !== 'en') return await setLanguage('en');
      return;
    }
  }
  
  document.querySelector('title').textContent = langData['title'];
  document.documentElement.lang = lang;
  document.documentElement.dir = (lang === 'ar') ? 'rtl' : 'ltr';

  // 🌟 GÜNCELLEME: Sadece 'active' sayfalardaki metinleri değil,
  // header/footer gibi kalıcı elementleri de çevir.
  document.querySelectorAll('body [data-key]').forEach(el => {
    const key = el.getAttribute('data-key');
    if (langData[key]) {
      el.innerHTML = langData[key];
    }
  });

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('data-lang') === lang) btn.classList.add('active');
  });

  localStorage.setItem('lang', lang);
}

// Mobil Menü Toggle
function setupMobileMenu() {
  const menuToggle = document.getElementById('menu-toggle');
  if (menuToggle) {
    menuToggle.addEventListener('click', function() {
      const navbar = document.getElementById('navbar');
      if (navbar) navbar.classList.toggle('open');
    });
  }
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      const navbar = document.getElementById('navbar');
      if (navbar) navbar.classList.remove('open');
    });
  });
}

// Proje verilerini yükle (eğer yüklü değilse)
async function loadProjectsData() {
  if (allProjectsData) return; // Zaten yüklü
  try {
    const response = await fetch('data/projects.json');
    if (!response.ok) throw new Error('data/projects.json yüklenemedi');
    allProjectsData = await response.json();
  } catch (error) {
    console.error(error);
  }
}

// Arka planda resim yükleme
async function preloadProjectImages() {
  await loadProjectsData(); // Önce veriyi yükle
  if (!allProjectsData) return;

  const allImageUrls = [
    ...allProjectsData.otel.map(p => p.img),
    ...allProjectsData.insaat.map(p => p.img),
    ...allProjectsData.restorasyon.map(p => p.img),
    ...allProjectsData.satilik_kiralik.map(p => p.img)
  ];
  allImageUrls.forEach(url => {
    if (url.startsWith('http')) return;
    const img = new Image();
    img.src = url;
  });
  console.log("Proje görselleri arka planda yükleniyor.");
}

// Kategori yükleme (async)
async function loadCategory(category, checkin = null, checkout = null) {
  const grid = document.getElementById("project-grid");
  if (!grid) return;
  grid.style.opacity = "0";

  const titleEl = document.getElementById('projects-title');
  const currentLang = localStorage.getItem('lang') || 'tr';
  const langData = translations[currentLang] || {};

  await loadProjectsData(); // Verinin yüklendiğinden emin ol
  if (!allProjectsData) return;

  // Başlıkları ayarla
  if (category === 'otel' && checkin && checkout) {
    const dateTitle = (langData.no_rooms || 'Müsait Odalar').replace('Bu tarihlerde müsait oda bulunamadı.', '').trim();
    titleEl.textContent = `${langData.drop_hotel || 'Otelimiz'} ${dateTitle} (${checkin} - ${checkout})`;
  } else {
    const keyMap = {'otel': 'drop_hotel', 'insaat': 'drop_construction', 'restorasyon': 'drop_restoration', 'satilik_kiralik': 'drop_rental', 'default': 'projects_title_featured'};
    titleEl.textContent = langData[keyMap[category] || keyMap['default']] || "Projeler";
  }

  setTimeout(() => {
    grid.innerHTML = "";
    let itemsToDisplay = allProjectsData[category];

    if (category === 'otel' && checkin) {
      itemsToDisplay = allProjectsData.otel.filter(() => Math.random() > 0.3);
      if (itemsToDisplay.length === 0) {
        grid.innerHTML = `<p data-key="no_rooms">${langData.no_rooms || 'Bu tarihlerde müsait oda bulunamadı.'}</p>`;
        grid.style.opacity = "1";
        return;
      }
    }

    if (!itemsToDisplay || category === 'default') {
      grid.innerHTML = `
        <div class="project-card"><img src="assets/for_hotel.jpg" alt="Otel" loading="lazy"><h3 data-key="project_h3_residence">Otel</h3></div>
        <div class="project-card"><img src="assets/for_tour.jpg" alt="Tur" loading="lazy"><h3 data-key="project_h3_commercial">Tur</h3></div>
        <div class="project-card"><img src="assets/for_villa.jpg" alt="Villa" loading="lazy"><h3 data-key="project_h3_multipurpose">Villa</h3></div>`;
      titleEl.textContent = langData.projects_title_featured || 'Öne Çıkan Projelerimiz';
      grid.querySelectorAll('[data-key]').forEach(el => {
         const key = el.getAttribute('data-key');
         if (langData[key]) el.innerHTML = langData[key];
      });
    } else {
      itemsToDisplay.forEach(project => {
        const card = document.createElement("div");
        card.className = "project-card";
        card.innerHTML = `<img src="${project.img.startsWith('http') ? project.img : project.img}" alt="${project.name}" loading="lazy"><h3>${project.name}</h3>${project.price ? `<p class="project-price">${project.price}</p>` : ''}`;
        grid.appendChild(card);
      });
    }

    grid.style.opacity = "1";
    // Kart animasyonlarını tetikle
    grid.querySelectorAll('.project-card').forEach((card, i) => {
      card.style.opacity = '0';
      card.style.transform = 'scale(0.9)';
      setTimeout(() => {
        card.style.transition = 'all 1s cubic-bezier(0.25, 1, 0.5, 1)';
        card.style.opacity = '1';
        card.style.transform = 'scale(1)';
      }, i * 100);
    });
  }, 300);
}

// Scroll Efektleri
function handleScrollEffects() {
  const scrollY = window.scrollY;
  const header = document.querySelector('header');
  const hero = document.getElementById('hero');

  if (hero && hero.classList.contains('active')) {
    hero.style.opacity = Math.max(0, 1 - (scrollY / (hero.offsetHeight * 0.7)));
  } else if (hero) {
    hero.style.opacity = 1;
  }

  if (header) {
    const newOpacity = 0.6 - (Math.min(scrollY / 300, 1) * 0.2);
    header.style.background = `rgba(255, 255, 255, ${newOpacity})`;
  }
}

// Projeler Rezervasyon Formu Kurulumu
function setupProjectReservation() {
  // 🌟 GÜNCELLEME: Event delegation (Olay aktarımı) kullan
  // Buton henüz DOM'da olmayabilir.
  document.body.addEventListener('click', (e) => {
    if (e.target.id === 'project-search') {
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

// 🌟🌟🌟 YENİ: ADIM 2.D GÜNCELLEMESİ - HTML Tembel Yükleme 🌟🌟🌟
async function showPage(pageId) {
  // 1. Tüm aktif sayfaları gizle
  document.querySelectorAll('.page-section').forEach(section => {
    section.classList.remove('active');
    section.classList.remove('visible');
  });

  // 2. Sayfa zaten DOM'a yüklenmiş mi?
  let newPage = document.getElementById(pageId);
  
  if (!newPage) {
    // 3. Sayfa yüklenmemiş: Önbellekten veya fetch ile çek
    if (pageCache[pageId]) {
      // Hafızada (cache) varsa oradan al
      document.getElementById('page-container').insertAdjacentHTML('beforeend', pageCache[pageId]);
    } else {
      // Hafızada yoksa, pages/ klasöründen çek
      try {
        // Sayfa ID'sini dosya adına çevir
        // (Not: 'page-otel' gibi ID'ler için 'page-' kısmını atmamız gerek)
        let fileName = pageId.replace('page-', ''); // 'page-otel' -> 'otel'

        const response = await fetch(`pages/${fileName}.html`);
        if (!response.ok) throw new Error(`Sayfa yüklenemedi: ${fileName}.html`);
        
        const html = await response.text();
        pageCache[pageId] = html; // Gelecekte kullanmak için hafızaya al
        document.getElementById('page-container').insertAdjacentHTML('beforeend', html);
      } catch (error) {
        console.error(error);
        if (pageId !== 'hero') showPage('hero'); // Hata olursa anasayfaya dön
        return;
      }
    }
    // HTML DOM'a eklendikten sonra elementi tekrar seç
    newPage = document.getElementById(pageId);
  }

  // 4. Anasayfa ise, ilgili bölümleri de göster
  let pagesToShow = [newPage];
  if (pageId === 'hero') {
    const relatedSectionIds = ['explore-why-us', 'destinations', 'projects'];
    relatedSectionIds.forEach(id => {
      const section = document.getElementById(id);
      if (section) pagesToShow.push(section);
    });
  }

  // 5. Tüm seçilen sayfaları göster, çevir ve animasyonlarını çalıştır
  const currentLang = localStorage.getItem('lang') || 'tr';
  const langData = translations[currentLang] || {};

  pagesToShow.forEach(page => {
    page.classList.add('active');

    // 🌟 YENİ: Yüklenen HTML'e çeviriyi uygula
    page.querySelectorAll('[data-key]').forEach(el => {
      const key = el.getAttribute('data-key');
      if (langData[key]) el.innerHTML = langData[key];
    });

    // 🌟 YENİ: Gerekliyse, yeni yüklenen sayfa için özel JS'i kur
    if (pageId === 'page-otel' && !page.dataset.modalLoaded) {
      setupOtelModal();
      page.dataset.modalLoaded = true; // Tekrar kurulmasın
    }

    // Animasyonları tetikle
    setTimeout(() => {
      page.classList.add('visible');
      const cards = page.querySelectorAll('.project-card, .latest-card, .service-card, .ew-card, .about-content');
      cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'scale(0.9)';
        setTimeout(() => {
          card.style.transition = 'all 1s cubic-bezier(0.25, 1, 0.5, 1)';
          card.style.opacity = '1';
          card.style.transform = 'scale(1)';
        }, index * 100);
      });
    }, 50);
  });

  window.scrollTo(0, 0);
  if (document.getElementById('hero')) document.getElementById('hero').style.opacity = 1;
}


// 🌟 GÜNCELLEME: 'DOMContentLoaded' artık 'async' ve 'await' kullanıyor
document.addEventListener('DOMContentLoaded', async () => {

  const desktopLangSelector = document.querySelector('.language-selector.desktop-only');
  const mobileLangSelector = document.querySelector('.language-selector.mobile-only');

  if (window.innerWidth <= 768) {
    if (desktopLangSelector) desktopLangSelector.style.display = 'none';
  } else {
    if (mobileLangSelector) mobileLangSelector.style.display = 'none';
  }

  // 1. Önce Dili Yükle
  try {
    await setLanguage(localStorage.getItem('lang') || 'tr');
  } catch (e) {
    console.error("İlk dil yüklenemedi:", e);
  }
  
  // 2. Diğer fonksiyonları kur
  setupMobileMenu();
  setupProjectReservation(); // Artık Event Delegation kullanıyor
  setTimeout(preloadProjectImages, 1000); // Projeleri arka planda yükle

  // 3. "Keşfet" Modalını Kur
  const cta = document.getElementById("discover-cta");
  const categoryModal = document.getElementById("category-modal");
  const categoryModalClose = document.getElementById("category-modal-close");

  if (cta && categoryModal && categoryModalClose) {
    const button = cta.querySelector(".btn");
    button.addEventListener("click", e => {
      e.preventDefault();
      e.stopPropagation();
      categoryModal.classList.add("show");
    });
    categoryModalClose.addEventListener("click", () => categoryModal.classList.remove("show"));
    categoryModal.addEventListener("click", (e) => {
      if (e.target === categoryModal) categoryModal.classList.remove("show");
    });
    if (cta.querySelector(".dropdown")) cta.querySelector(".dropdown").style.display = 'none';
    
    document.querySelectorAll('.category-button').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.getAttribute("data-page");
            const cat = link.getAttribute("data-category");
            
            if (page === 'projects') {
                showPage('projects'); // 'projects' ID'li anasayfa bölümünü göster
                const projectForm = document.getElementById('project-reservation-form');
                if (cat === 'otel') {
                    if (projectForm) projectForm.style.display = 'block';
                    loadCategory('otel');
                } else if (cat === 'satilik_kiralik') {
                    if (projectForm) projectForm.style.display = 'none';
                    loadCategory('satilik_kiralik');
                }
            } else if (page === 'tours') {
                showPage('destinations'); // 'destinations' ID'li anasayfa bölümünü göster
            }
            categoryModal.classList.remove("show");
        });
    });
  }

  // 4. NavBar (SPA) Tıklamalarını Kur
  document.querySelectorAll('.nav-link[data-page]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const pageId = link.getAttribute('data-page');
      showPage(pageId); // 🌟 Artık yeni async 'showPage' fonksiyonunu çağırıyor
    });
  });

  window.addEventListener('scroll', handleScrollEffects);
  
  // 5. İlk Sayfayı Yükle
  showPage('hero');
});
// --- BLOK 2 SONU ---


// --- BLOK 3: Swiper Başlatma ---
const swiper = new Swiper(".mySwiper", {
  slidesPerView: 3,
  spaceBetween: 40,
  centeredSlides: true,
  loop: true,
  autoplay: {
    delay: 3000,
    disableOnInteraction: false,
  },
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
  breakpoints: {
    0: { slidesPerView: 1 },
    768: { slidesPerView: 2 },
    1024: { slidesPerView: 3 }
  }
});

// Swiper tıklamalarını kur
document.querySelectorAll(".swiper-slide.project-card").forEach(card => {
  card.addEventListener("click", () => {
    const cat = card.getAttribute("data-category");
    if(cat) {
        showPage("projects");
        loadCategory(cat);
        const projectForm = document.getElementById('project-reservation-form');
        if (projectForm) {
            projectForm.style.display = (cat === 'otel') ? 'block' : 'none';
        }
    }
  });
});
// --- BLOK 3 SONU ---