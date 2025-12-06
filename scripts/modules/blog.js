import { PATHS } from '../config/constants.js';

// Verileri hafızada tutmak için değişken
let cachedPosts = [];

// YEDEK VERİ (FALLBACK)
const MOCK_DATA = [
    {
        "id": 1,
        "title": "Kapadokya'da Balon Turu Deneyimi",
        "image": "assets/images/kapadokya-balon-turu-1.webp",
        "date": "2025-10-15",
        "category": "GEZİ REHBERİ",
        "summary": "Peri bacalarının üzerinde gün doğumunu izlemek hayatınızda yaşayabileceğiniz en büyüleyici deneyimlerden biri.",
        "fullContent": "<p>Peri bacalarının üzerinde gün doğumunu izlemek hayatınızda yaşayabileceğiniz en büyüleyici deneyimlerden biri. Sabahın ilk ışıklarıyla birlikte gökyüzüne yükselen yüzlerce balon, Kapadokya'nın eşsiz coğrafyasını bir masal diyarına dönüştürüyor.</p><p><strong>Ne Zaman Gidilmeli?</strong><br>En iyi sezon Nisan-Ekim arasıdır ancak kışın karlar altındaki manzarası da ayrı bir güzeldir.</p>"
    },
    {
        "id": 2,
        "title": "Vizesiz Gidilebilecek 10 Cennet Ülke",
        "image": "assets/images/antalya-koy-gezisi-1.webp",
        "date": "2025-09-20",
        "category": "İPUÇLARI",
        "summary": "Pasaportunuzu kapıp hemen yola çıkabileceğiniz, turkuaz suları ve tarihiyle büyüleyen o ülkeler hangileri?",
        "fullContent": "<p>Pasaportunuzu kapıp hemen yola çıkabileceğiniz, turkuaz suları ve tarihiyle büyüleyen o ülkeler hangileri?</p>"
    },
    {
        "id": 3,
        "title": "Avrupa Turu İçin Çanta Hazırlama Rehberi",
        "image": "assets/images/spain-1.webp",
        "date": "2025-08-05",
        "category": "REHBER",
        "summary": "Uzun bir Avrupa seyahatine çıkarken yanınıza almanız gerekenler ve hayat kurtaran minimalist paketleme tüyoları.",
        "fullContent": "<p>Uzun bir Avrupa seyahatine çıkarken yanınıza almanız gerekenler...</p>"
    }
];

export async function loadBlogData() {
    try {
        const response = await fetch(PATHS.BLOG_DATA);
        if (!response.ok) throw new Error('Blog verisi alınamadı');
        
        cachedPosts = await response.json();
        
    } catch (error) {
        console.warn('Blog verisi yüklenemedi, yedek veri kullanılıyor:', error);
        cachedPosts = MOCK_DATA;
    }

    // Modal açılırken global erişim gerekebilir diye window'a da atıyoruz
    window.blogPostsData = cachedPosts;
}

// BU FONKSİYONU ARTIK APP.JS ÇAĞIRACAK (EXPORT EKLENDİ)
export function renderBlogGrid() {
    const container = document.getElementById('blog-grid-display');
    
    // Eğer sayfada blog container yoksa (başka sayfadaysak) işlemi durdur
    if (!container) return;
    
    // Veri yoksa mesaj göster
    if (!cachedPosts || cachedPosts.length === 0) {
        container.innerHTML = '<p>Henüz yazı yok.</p>';
        return;
    }
    
    // Tarihe göre sırala (Yeniden eskiye)
    const sortedPosts = [...cachedPosts].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    container.innerHTML = sortedPosts.map(post => `
        <article class="blog-card" onclick="openBlogModal(${post.id})">
            <div class="card-img-top">
                <img src="${post.image}" alt="${post.title}" loading="lazy"
                     onerror="this.src='${PATHS.FALLBACK_IMAGE}'; this.onerror=null;">
            </div>
            <div class="card-body">
                <span class="card-date">${post.date}</span>
                <h3>${post.title}</h3>
                <p class="card-excerpt">${post.summary}</p>
                <span class="read-more-link">Devamını Oku <i>→</i></span>
            </div>
        </article>
    `).join('');
}

export function openBlogModal(id) {
    // Veriyi cachedPosts veya window'dan al
    const posts = cachedPosts.length > 0 ? cachedPosts : (window.blogPostsData || []);
    const post = posts.find(p => p.id === id);
    
    if (post) {
        const titleEl = document.getElementById('modal-title');
        const dateEl = document.getElementById('modal-date');
        const imgEl = document.getElementById('modal-img');
        const contentEl = document.getElementById('modal-full-content');
        const modal = document.getElementById('blog-modal');

        if (titleEl) titleEl.innerText = post.title;
        if (dateEl) dateEl.innerText = post.date;
        
        if (imgEl) {
            imgEl.src = post.image;
            imgEl.onerror = function() { this.src = PATHS.FALLBACK_IMAGE; this.onerror = null; };
        }
        
        if (contentEl) contentEl.innerHTML = post.fullContent;
        
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
}

export function closeBlogModal() {
    const modal = document.getElementById('blog-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}