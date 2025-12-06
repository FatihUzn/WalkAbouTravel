import { PATHS } from '../config/constants.js';

// YEDEK VERİ (FALLBACK): JSON Yüklenemezse devreye girer
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
        
        const posts = await response.json();
        renderBlogGrid(posts);
        
        // Blog verilerini detay modalı için global scope'a kaydet (basitlik için)
        window.blogPostsData = posts; 
        
    } catch (error) {
        console.warn('Blog verisi yüklenemedi, yedek veri kullanılıyor:', error);
        
        // Hata durumunda MOCK_DATA kullan
        renderBlogGrid(MOCK_DATA);
        window.blogPostsData = MOCK_DATA;
    }
}

function renderBlogGrid(posts) {
    const container = document.getElementById('blog-grid-display');
    if (!container) return;
    
    if (!posts || posts.length === 0) {
        container.innerHTML = '<p>Henüz yazı yok.</p>';
        return;
    }
    
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    container.innerHTML = posts.map(post => `
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
    const posts = window.blogPostsData || [];
    const post = posts.find(p => p.id === id);
    
    if (post) {
        document.getElementById('modal-title').innerText = post.title;
        document.getElementById('modal-date').innerText = post.date;
        
        const img = document.getElementById('modal-img');
        img.src = post.image;
        img.onerror = function() { this.src = PATHS.FALLBACK_IMAGE; this.onerror = null; };
        
        document.getElementById('modal-full-content').innerHTML = post.fullContent;
        
        const modal = document.getElementById('blog-modal');
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