// === 1. MODÜLLERİ İÇERİ AKTAR (IMPORT) ===
import { DEFAULT_LANGUAGE } from './config/constants.js';
import { setLanguage, getCurrentLanguage } from './modules/language.js';
import { showPage } from './modules/navigation.js';
import { loadTourData, openHouseDetail, closeHouseDetail, loadMorePropertyImages, getCurrentGalleryImages, renderTourGrid } from './modules/tours.js';
import { openGallery, closeLightbox, showNextImage, showPrevImage } from './modules/lightbox.js';
import { loadBlogData, openBlogModal, closeBlogModal } from './modules/blog.js';

// === 2. FONKSİYONLARI HTML'E AÇ (WINDOW BAĞLANTISI) ===
// HTML'deki onclick="openHouseDetail(...)" komutlarının çalışması için şarttır.
window.setLanguage = setLanguage;
window.showPage = showPage;
window.openHouseDetail = openHouseDetail;
window.closeHouseDetail = closeHouseDetail;
window.loadMorePropertyImages = loadMorePropertyImages;
window.closeLightbox = closeLightbox;
window.showNextImage = showNextImage;
window.showPrevImage = showPrevImage;
window.openBlogModal = openBlogModal;
window.closeModal = closeBlogModal;
window.renderTourGrid = renderTourGrid; 

// Özel Galeri Açma Fonksiyonu (Tours modülünden anlık veriyi alır)
window.openGlobalGallery = (index) => {
    const images = getCurrentGalleryImages();
    openGallery(images, index);
};

// === 3. UYGULAMAYI BAŞLAT (INITIALIZATION) ===
document.addEventListener('DOMContentLoaded', async () => {
    console.log("Uygulama başlatılıyor...");

    try {
        // A. Verileri Yükle (Turlar ve Bloglar)
        await Promise.all([
            loadTourData(),
            loadBlogData()
        ]);

        // B. Dili Ayarla (Kaydedilmiş dil veya varsayılan)
        const lang = getCurrentLanguage();
        await setLanguage(lang);

        // C. Doğru Sayfayı Göster
        // Eğer linkte #page-tours varsa orayı, yoksa ana sayfayı aç
        const initialPage = location.hash.replace('#', '') || 'hero';
        await handleRouting(initialPage);

        // D. Dinleyicileri Kur (Butonlar, Klavye vb.)
        setupEventListeners();

    } catch (error) {
        console.error("Başlatma hatası:", error);
    }
});

// === 4. SAYFA YÖNLENDİRME MANTIĞI ===
async function handleRouting(pageId) {
    // İstenen sayfayı ekrana getir
    await showPage(pageId);

    // Eğer "Turlar" sayfasına geldiysek, içeriği (Grid'i) doldur
    if (pageId === 'page-tours' || pageId === 'tours') {
        // Kullanıcının seçtiği kategoriyi hafızadan al (yoksa 'all')
        const savedCat = localStorage.getItem('selectedCategory') || 'all';
        renderTourGrid(savedCat);
        // Kullandıktan sonra temizle (ki sonraki girişlerde karışmasın)
        localStorage.removeItem('selectedCategory');
    }
}

// === 5. OLAY DİNLEYİCİLERİ (EVENT LISTENERS) ===
function setupEventListeners() {
    // A. URL Değişimini Dinle (Geri/İleri tuşları için)
    window.addEventListener('hashchange', () => {
        const pageId = location.hash.replace('#', '') || 'hero';
        handleRouting(pageId);
    });

    // B. Mobil Menü Aç/Kapa
    const menuToggle = document.getElementById('menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            const navbar = document.getElementById('navbar');
            navbar.classList.toggle('open');
        });
    }

    // C. Kategori Linklerini Takip Et (data-category)
    document.body.addEventListener('click', (e) => {
        // Tıklanan öğe veya ebeveyni 'data-category' içeriyor mu?
        const categoryLink = e.target.closest('[data-category]');
        if (categoryLink) {
            const cat = categoryLink.dataset.category;
            // Seçimi kaydet, sayfa yüklendiğinde kullanacağız
            localStorage.setItem('selectedCategory', cat);
            // Sayfa yenilenmeden gridi güncellemek için (opsiyonel ama iyi bir UX)
            if (location.hash === '#page-tours' || location.hash === '#tours') {
                renderTourGrid(cat);
            }
        }
    });

    // D. Klavye Kontrolleri (ESC, Sağ, Sol)
    document.addEventListener('keydown', (e) => {
        if (e.key === "Escape") {
            closeLightbox();
            closeHouseDetail();
            closeBlogModal();
        }
        // Sadece Lightbox açıkken ok tuşlarını dinle
        if (document.getElementById('lightbox-modal')?.style.display === 'flex') {
            if (e.key === 'ArrowRight') showNextImage();
            if (e.key === 'ArrowLeft') showPrevImage();
        }
    });

    // E. Lightbox Butonları (ID ile doğrudan erişim)
    document.getElementById('next-btn')?.addEventListener('click', (e) => {
        e.stopPropagation(); // Tıklamanın arkaya geçmesini engelle
        showNextImage();
    });
    document.getElementById('prev-btn')?.addEventListener('click', (e) => {
        e.stopPropagation();
        showPrevImage();
    });
    document.getElementById('close-lightbox')?.addEventListener('click', closeLightbox);
    
    // F. Blog Modalı Dışına Tıklama (Kapatmak için)
    const blogModal = document.getElementById('blog-modal');
    if (blogModal) {
        blogModal.addEventListener('click', (e) => {
            if (e.target === blogModal) closeBlogModal();
        });
    }
}