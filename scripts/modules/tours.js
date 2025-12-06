import { PATHS, IMAGES_PER_LOAD } from '../config/constants.js';
import { generateImages, showError, handleImageError } from '../utils/helpers.js';
import { openGallery } from './lightbox.js';

let tourData = {};
let currentGallery = {
    images: [],
    index: 0
};

// 1. Verileri JSON'dan Çek
export async function loadTourData() {
  try {
    const response = await fetch(PATHS.TOURS_DATA);
    if (!response.ok) throw new Error('Tur verileri yüklenemedi');
    
    const data = await response.json();
    
    // Resim yollarını oluştur
    Object.entries(data).forEach(([id, tour]) => {
      if (tour.imagePrefix && tour.imageCount) {
        tour.images = generateImages(tour.imagePrefix + '-', tour.imageCount);
      }
    });
    
    tourData = data;
    return data;
  } catch (error) {
    console.error('Tour data error:', error);
  }
}

// 2. KARTLARI LİSTELEME FONKSİYONU (YENİ EKLENEN KISIM)
export function renderTourGrid(category = 'all') {
    const grid = document.getElementById('tours-grid');
    const titleEl = document.getElementById('tours-page-title');
    const subtitleEl = document.getElementById('tours-page-subtitle');
    
    if (!grid) return; // Eğer o sayfada değilsek dur.

    grid.innerHTML = ''; // Önce temizle

    // Başlığı Güncelle
    if (titleEl) {
        if (category === 'domestic') {
            titleEl.textContent = "Yurt İçi Kültür Turları";
            if (subtitleEl) subtitleEl.textContent = "Anadolu'nun eşsiz güzelliklerini keşfedin";
        } else if (category === 'international') {
            titleEl.textContent = "Yurt Dışı Rotalar";
            if (subtitleEl) subtitleEl.textContent = "Dünyanın en popüler destinasyonları";
        } else {
            titleEl.textContent = "Tüm Rotalarımız";
            if (subtitleEl) subtitleEl.textContent = "Size uygun bir tatil mutlaka var";
        }
    }

    // Verileri Filtrele
    const tours = Object.entries(tourData).filter(([id, tour]) => {
        if (category === 'all') return true;
        // ID'si TUR-TR ile başlayanlar Yurt İçi, TUR-D ile başlayanlar Yurt Dışı
        if (category === 'domestic') return id.startsWith('TUR-TR');
        if (category === 'international') return id.startsWith('TUR-D');
        return true;
    });

    if (tours.length === 0) {
        grid.innerHTML = '<p style="width:100%; text-align:center;">Bu kategoride tur bulunamadı.</p>';
        return;
    }

    // HTML Oluştur ve Ekrana Bas
    tours.forEach(([id, tour]) => {
        // İlk resmi al, yoksa fallback kullan
        const mainImage = tour.images && tour.images.length > 0 
            ? tour.images[0] 
            : PATHS.FALLBACK_IMAGE;

        const cardHTML = `
            <div class="house-card" onclick="openHouseDetail('${id}')">
                <img loading="lazy" src="${mainImage}" alt="${tour.title}"
                     onerror="this.src='${PATHS.FALLBACK_IMAGE}'; this.onerror=null;">
                <h3>${tour.title}</h3>
            </div>
        `;
        grid.insertAdjacentHTML('beforeend', cardHTML);
    });
}

// 3. Detay Penceresini (Modal) Açma
export function openHouseDetail(tourID) {
  const tour = tourData[tourID];

  if (!tour) {
    console.error(`Tur bulunamadı: ${tourID}`);
    alert("Bu turun detaylarına şu an ulaşılamıyor.");
    return;
  }

  const detail = document.getElementById("house-detail");
  const content = document.getElementById("house-detail-content");
  
  if (!detail || !content) return;

  // İçerik HTML
  content.innerHTML = `
    <h2 class="page-title-gold">${tour.title}</h2>
    
    <div class="house-info">
      <div style="margin-bottom: 10px;">
        <i class="fas fa-map-marker-alt" style="color: #4c99ff; width: 20px;"></i> 
        <strong>Lokasyon:</strong> <span style="color: #666;">${tour.location} (${tour.area})</span>
      </div>
      
      <div style="margin-bottom: 10px;">
        <i class="fas fa-clock" style="color: #4c99ff; width: 20px;"></i> 
        <strong>Süre & Fiyat:</strong> <span style="color: #0056b3; font-weight: bold;">${tour.price}</span>
      </div>
      
      <div style="margin-bottom: 10px;">
        <i class="fas fa-bed" style="color: #4c99ff; width: 20px;"></i> 
        <strong>Konaklama:</strong> <span style="color: #666;">${tour.rooms}</span>
      </div>

      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
      
      <p>${tour.desc}</p>

      <div style="margin-top: 25px; text-align: center;">
        <a href="mailto:info@walkaboutravel.com?subject=Rezervasyon: ${tour.title}" class="btn">
          <i class="fas fa-paper-plane"></i> Rezervasyon Yap
        </a>
      </div>
    </div>

    <div class="detail-gallery" id="detail-gallery-container"></div>
    <div id="gallery-loader" style="text-align:center; margin-top:20px;"></div>
  `;

  // Galeri Kurulumu
  currentGallery.images = tour.images || [];
  currentGallery.index = 0;
  
  loadMorePropertyImages();
  
  detail.style.display = "block";
  document.body.style.overflow = "hidden";
}

export function closeHouseDetail() {
  const detail = document.getElementById("house-detail");
  if (detail) detail.style.display = "none";
  document.body.style.overflow = "auto";
}

// 4. "Daha Fazla Yükle" Mantığı (Galeri İçin)
export function loadMorePropertyImages() {
  const container = document.getElementById('detail-gallery-container');
  const loader = document.getElementById('gallery-loader');
  
  if (!container) return;

  if (currentGallery.images.length === 0) {
    container.innerHTML = "<p>Görsel bulunamadı.</p>";
    return;
  }

  const nextImages = currentGallery.images.slice(
    currentGallery.index, 
    currentGallery.index + IMAGES_PER_LOAD
  );

  const html = nextImages.map((img, i) => {
    const absoluteIndex = currentGallery.index + i;
    return `<img loading="lazy" src="${img}" 
      onclick="window.openGlobalGallery(${absoluteIndex})" 
      onerror="this.src='${PATHS.FALLBACK_IMAGE}'; this.onerror=null;" 
      style="cursor:pointer;">`;
  }).join("");

  container.insertAdjacentHTML('beforeend', html);
  currentGallery.index += IMAGES_PER_LOAD;

  if (currentGallery.index < currentGallery.images.length) {
      loader.innerHTML = `<button class="btn" onclick="window.loadMorePropertyImages()">Daha Fazla Göster</button>`;
  } else {
      loader.innerHTML = '';
  }
}

export function getCurrentGalleryImages() {
    return currentGallery.images;
}