// === 1. MODÜLLERİ İÇERİ AKTAR (IMPORT) ===
import { DEFAULT_LANGUAGE } from './config/constants.js';
import { setLanguage, getCurrentLanguage } from './modules/language.js';
import { showPage } from './modules/navigation.js';
import { loadTourData, openHouseDetail, closeHouseDetail, loadMorePropertyImages, getCurrentGalleryImages, renderTourGrid } from './modules/tours.js';
import { openGallery, closeLightbox, showNextImage, showPrevImage } from './modules/lightbox.js';
import { loadBlogData, openBlogModal, closeBlogModal, renderBlogGrid } from './modules/blog.js';

// === 2. FONKSİYONLARI HTML'E AÇ (WINDOW BAĞLANTISI) ===
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

// Özel Galeri Açma Fonksiyonu
window.openGlobalGallery = (index) => {
    const images = getCurrentGalleryImages();
    openGallery(images, index);
};

// === 3. UYGULAMAYI BAŞLAT (INITIALIZATION) ===
document.addEventListener('DOMContentLoaded', async () => {
    console.log("🚀 Uygulama başlatılıyor...");

    try {
        // A. Verileri Yükle
        console.log("📦 Veriler yükleniyor...");
        await Promise.all([
            loadTourData(),
            loadBlogData()
        ]);
        console.log("✅ Veriler yüklendi");

        // B. Dili Ayarla
        const lang = getCurrentLanguage();
        await setLanguage(lang);

        // C. Homepage Blog'u Render Et (YENİ EKLENEN)
        console.log("📝 Homepage blog render ediliyor...");
        renderBlogGrid('blog-grid-display');

        // D. Doğru Sayfayı Göster
        const initialPage = location.hash.replace('#', '') || 'hero';
        await handleRouting(initialPage);

        // E. Dinleyicileri Kur
        setupEventListeners();
        
        console.log("✅ Uygulama hazır!");

    } catch (error) {
        console.error("❌ Başlatma hatası:", error);
    }
});

// === 4. SAYFA YÖNLENDİRME MANTIĞI ===
async function handleRouting(pageId) {
    await showPage(pageId);

    // TURLAR SAYFASI İÇİN ÖZEL İŞLEM
    if (pageId === 'page-tours' || pageId === 'tours') {
        const savedCat = localStorage.getItem('selectedCategory') || 'all';
        console.log('🗺️ Tur sayfası render ediliyor, kategori:', savedCat);
        renderTourGrid(savedCat);
        localStorage.removeItem('selectedCategory');
    }

    // BLOG SAYFASI İÇİN ÖZEL İŞLEM
    if (pageId === 'page-blog' || pageId === 'blog') {
        console.log('📰 Blog sayfası render ediliyor...');
        renderBlogGrid();
    }
}

// === 5. OLAY DİNLEYİCİLERİ (EVENT LISTENERS) ===
function setupEventListeners() {
    // A. URL Değişimini Dinle
    window.addEventListener('hashchange', () => {
        const pageId = location.hash.replace('#', '') || 'hero';
        handleRouting(pageId);
    });

    // B. Mobil Menü
    const menuToggle = document.getElementById('menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            const navbar = document.getElementById('navbar');
            navbar.classList.toggle('open');
        });
    }

    // C. Kategori Linkleri (GELİŞTİRİLMİŞ)
    document.body.addEventListener('click', (e) => {
        const categoryLink = e.target.closest('[data-category]');
        if (categoryLink) { 
            const cat = categoryLink.dataset.category;
            console.log('🏷️ Kategori seçildi:', cat);
            localStorage.setItem('selectedCategory', cat);
            
            // Eğer zaten tours sayfasındaysak, sadece render et
            if (location.hash === '#page-tours' || location.hash === '#tours') {
                e.preventDefault();
                renderTourGrid(cat);
            }
        }
    });

    // D. Klavye Kontrolleri
    document.addEventListener('keydown', (e) => {
        if (e.key === "Escape") {
            closeLightbox();
            closeHouseDetail();
            closeBlogModal();
        }
        if (document.getElementById('lightbox-modal')?.style.display === 'flex') {
            if (e.key === 'ArrowRight') showNextImage();
            if (e.key === 'ArrowLeft') showPrevImage();
        }
    });

    // E. Lightbox Butonları
    document.getElementById('next-btn')?.addEventListener('click', (e) => {
        e.stopPropagation();
        showNextImage();
    });
    document.getElementById('prev-btn')?.addEventListener('click', (e) => {
        e.stopPropagation();
        showPrevImage();
    });
    document.getElementById('close-lightbox')?.addEventListener('click', closeLightbox);
    
    // F. Blog Modalı Dışına Tıklama
    const blogModal = document.getElementById('blog-modal');
    if (blogModal) {
        blogModal.addEventListener('click', (e) => {
            if (e.target === blogModal) closeBlogModal();
        });
    }
}