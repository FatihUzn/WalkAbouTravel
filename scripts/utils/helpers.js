import { PATHS } from '../config/constants.js';

// === YARDIMCI FONKSİYONLAR ===

// Belirli bir isme ve sayıya göre resim dizisi oluşturur
export function generateImages(baseName, count) {
  const images = [];
  for (let i = 1; i <= count; i++) {
    images.push(`${PATHS.IMAGES}${baseName}${i}.webp`);
  }
  return images;
}

// Hata mesajı gösterme fonksiyonu
export function showError(message) {
  const container = document.getElementById('page-container');
  if (container) {
    container.innerHTML = `
      <div style="text-align:center; padding:100px 20px;">
        <h2 style="color: red;">Bir Hata Oluştu</h2>
        <p>${message}</p>
        <button onclick="location.reload()" class="btn">Sayfayı Yenile</button>
      </div>
    `;
  }
}

// Resim yüklenemezse fallback kullan (HTML img etiketi için yardımcı)
export function handleImageError(imgElement) {
    imgElement.src = PATHS.FALLBACK_IMAGE;
    imgElement.onerror = null; // Sonsuz döngüyü önle
}