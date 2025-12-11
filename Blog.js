/* ================================================
   WALKABOUT TRAVEL - BLOG SYSTEM WITH MODAL
   Modal Düzeltilmiş Versiyon - 11 Aralık 2025
   ================================================ */

class BlogManager {
    constructor() {
        this.posts = [];
        this.currentPost = null;
        this.init();
    }

    async init() {
        try {
            await this.loadPosts();
            this.setupModal();
            this.renderBlogGrid();
        } catch (error) {
            console.error('Blog initialization error:', error);
        }
    }

    async loadPosts() {
        try {
            const response = await fetch('/WalkAboutTravel/data/blog-posts.json');
           const response = await fetch('https://fatihuzn.github.io/WalkAboutTravel/data/blog-posts.json');
            if (!response.ok) throw new Error('Blog posts not found');
            
            this.posts = await response.json();
            console.log('✅ Blog posts loaded:', this.posts.length);
        } catch (error) {
            console.warn('⚠️ Could not load blog-posts.json, using fallback data');
            this.posts = this.getFallbackPosts();
        }
    }

    getFallbackPosts() {
        return [
            {
                "id": 1,
                "title": "Kapadokya'da Balon Turu Deneyimi",
                "image": "assets/kapadokya-balon-turu-1.webp",
                "date": "2025-10-15",
                "category": "GEZİ REHBERİ",
                "summary": "Peri bacalarının üzerinde gün doğumunu izlemek hayatınızda yaşayabileceğiniz en büyüleyici deneyimlerden biri.",
                "fullContent": "<p>Peri bacalarının üzerinde gün doğumunu izlemek hayatınızda yaşayabileceğiniz en büyüleyici deneyimlerden biri. Sabahın ilk ışıklarıyla birlikte gökyüzüne yükselen yüzlerce balon, Kapadokya'nın eşsiz coğrafyasını bir masal diyarına dönüştürüyor.</p><p><strong>Ne Zaman Gidilmeli?</strong><br>En iyi sezon Nisan-Ekim arasıdır ancak kışın karlar altındaki manzarası da ayrı bir güzeldir.</p><p><strong>İpucu:</strong><br>Rezervasyonunuzu en az 1 ay önceden yaptırmayı unutmayın, yerler çok çabuk doluyor!</p>"
            },
            {
                "id": 2,
                "title": "Vizesiz Gidilebilecek Cennet Ülkeler",
                "image": "assets/antalya-koy-gezisi-1.webp",
                "date": "2025-09-20",
                "category": "İPUÇLARI",
                "summary": "Pasaportunuzu kapıp hemen yola çıkabileceğiniz destinasyonlar.",
                "fullContent": "<p>Vize prosedürleriyle uğraşmadan tatil yapmanın keyfi paha biçilemez. İşte en güzel vizesiz destinasyonlar...</p>"
            },
            {
                "id": 3,
                "title": "Avrupa Turu İçin Çanta Hazırlama",
                "image": "assets/spain-1.webp",
                "date": "2025-08-05",
                "category": "REHBER",
                "summary": "Minimalist paketleme tüyoları ve hayat kurtaran ipuçları.",
                "fullContent": "<p>Avrupa turunda kapsül gardırop sistemi ile hafif seyahat edin. 3 üst, 2 alt, 1 ayakkabı yeterli!</p>"
            }
        ];
    }

    renderBlogGrid() {
        const container = document.getElementById('blogContainer');
        if (!container) {
            console.warn('⚠️ #blogContainer element not found');
            return;
        }

        if (!this.posts || this.posts.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
                    <i class="fas fa-pen-fancy" style="font-size: 48px; color: var(--ocean-blue); margin-bottom: 20px;"></i>
                    <h3 style="color: var(--deep-navy); margin-bottom: 10px;">Henüz Blog Yazısı Yok</h3>
                    <p style="color: var(--soft-gray);">Yakında yeni içerikler eklenecek.</p>
                </div>
            `;
            return;
        }

        // Sort by date (newest first)
        const sortedPosts = [...this.posts].sort((a, b) => 
            new Date(b.date) - new Date(a.date)
        );

        // Show only first 3 posts on homepage
        const displayPosts = sortedPosts;

        let html = '';
        displayPosts.forEach(post => {
            html += this.createBlogCard(post);
        });

        container.innerHTML = html;

        // Add click events
        this.attachClickEvents();
        
        console.log(`✅ Rendered ${displayPosts.length} blog posts`);
    }

    createBlogCard(post) {
        const imageUrl = post.image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&h=400&fit=crop';
        const description = post.description || post.summary || '';
        const excerpt = description.length > 120 ? description.substring(0, 120) + '...' : description;

        return `
            <div class="blog-card" data-post-id="${post.id}">
                <div class="blog-image">
                    <img src="${imageUrl}" 
                         alt="${post.title}" 
                         loading="lazy"
                         onerror="this.src='https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&h=400&fit=crop'">
                </div>
                <div class="blog-content">
                    <div class="blog-meta">
                        <span><i class="far fa-calendar"></i> ${post.date}</span>
                        ${post.category ? `<span><i class="fas fa-tag"></i> ${post.category}</span>` : ''}
                    </div>
                    <h3>${post.title}</h3>
                    <p>${excerpt}</p>
                    <a href="#" class="tour-link blog-read-more" data-post-id="${post.id}">
                        Devamını Oku <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
            </div>
        `;
    }

    attachClickEvents() {
        // Blog kartlarına ve "Devamını Oku" linklerine tıklama eventi
        document.querySelectorAll('.blog-card, .blog-read-more').forEach(element => {
            element.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const postId = element.getAttribute('data-post-id');
                if (postId) {
                    this.openModal(postId);
                }
            });
        });
    }

    setupModal() {
        // Modal HTML'i yoksa oluştur
        if (!document.getElementById('blogModal')) {
            const modalHTML = `
                <div id="blogModal" class="blog-modal-overlay">
                    <div class="blog-modal-content">
                        <button class="blog-modal-close" aria-label="Close modal">
                            <i class="fas fa-times"></i>
                        </button>
                        <div class="blog-modal-header">
                            <img id="blogModalImage" src="" alt="" class="blog-modal-image">
                        </div>
                        <div class="blog-modal-body">
                            <div class="blog-modal-meta">
                                <span id="blogModalCategory" class="blog-category-badge"></span>
                                <span id="blogModalDate" class="blog-date-badge"></span>
                            </div>
                            <h2 id="blogModalTitle" class="blog-modal-title"></h2>
                            <div id="blogModalContent" class="blog-modal-text"></div>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHTML);

            // Close button event
            const closeBtn = document.querySelector('.blog-modal-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.closeModal());
            }

            // Modal dışına tıklanınca kapat
            document.getElementById('blogModal').addEventListener('click', (e) => {
                if (e.target.id === 'blogModal') {
                    this.closeModal();
                }
            });

            // ESC tuşu ile kapat
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.closeModal();
                }
            });

            console.log('✅ Blog modal created');
        }

        // CSS ekle
        this.injectModalStyles();
    }

    injectModalStyles() {
        if (document.getElementById('blogModalStyles')) return;

        const styles = `
            <style id="blogModalStyles">
                /* ========== MODAL OVERLAY - DÜZELTİLMİŞ ========== */
                .blog-modal-overlay {
                    display: none;
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.9);
                    z-index: 10000;
                    padding: 0;
                    overflow-y: auto;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }

                .blog-modal-overlay.active {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 1;
                    padding: 20px;
                }

                /* ========== MODAL CONTENT - DÜZELTİLMİŞ ========== */
                .blog-modal-content {
                    background: white;
                    border-radius: 20px;
                    max-width: 900px;
                    width: 100%;
                    max-height: 90vh;
                    position: relative;
                    animation: slideUp 0.4s ease;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    margin: auto;
                }

                @keyframes slideUp {
                    from {
                        transform: translateY(50px);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }

                /* ========== CLOSE BUTTON - DÜZELTİLMİŞ ========== */
                .blog-modal-close {
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    width: 45px;
                    height: 45px;
                    border-radius: 50%;
                    background: white;
                    border: 2px solid #0c4a6e;
                    font-size: 20px;
                    color: #0c4a6e;
                    cursor: pointer;
                    z-index: 10001;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                }

                .blog-modal-close:hover {
                    background: var(--ocean-blue);
                    color: white;
                    border-color: var(--ocean-blue);
                    transform: rotate(90deg);
                }

                /* ========== MODAL HEADER (IMAGE) ========== */
                .blog-modal-header {
                    flex-shrink: 0;
                    overflow: hidden;
                    border-radius: 20px 20px 0 0;
                }

                .blog-modal-image {
                    width: 100%;
                    height: 300px;
                    object-fit: cover;
                    display: block;
                }

                /* ========== MODAL BODY (SCROLLABLE) - DÜZELTİLMİŞ ========== */
                .blog-modal-body {
                    padding: 40px 50px;
                    overflow-y: auto;
                    flex: 1;
                }

                /* Custom scrollbar */
                .blog-modal-body::-webkit-scrollbar {
                    width: 8px;
                }

                .blog-modal-body::-webkit-scrollbar-track {
                    background: #f1f5f9;
                }

                .blog-modal-body::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 4px;
                }

                .blog-modal-body::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }

                .blog-modal-meta {
                    display: flex;
                    gap: 15px;
                    margin-bottom: 25px;
                    flex-wrap: wrap;
                }

                .blog-category-badge {
                    display: inline-block;
                    padding: 6px 16px;
                    background: rgba(14, 165, 233, 0.1);
                    color: var(--ocean-blue);
                    border-radius: 20px;
                    font-size: 13px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }

                .blog-date-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 16px;
                    background: rgba(251, 191, 36, 0.1);
                    color: #f59e0b;
                    border-radius: 20px;
                    font-size: 13px;
                    font-weight: 600;
                }

                .blog-modal-title {
                    font-family: 'Playfair Display', serif;
                    font-size: 32px;
                    color: var(--deep-navy);
                    margin-bottom: 25px;
                    line-height: 1.3;
                }

                .blog-modal-text {
                    font-size: 17px;
                    line-height: 1.8;
                    color: var(--soft-gray);
                }

                .blog-modal-text p {
                    margin-bottom: 20px;
                }

                .blog-modal-text h3 {
                    font-family: 'Playfair Display', serif;
                    font-size: 24px;
                    color: var(--deep-navy);
                    margin: 30px 0 15px;
                }

                .blog-modal-text strong {
                    color: var(--ocean-blue);
                    font-weight: 600;
                }

                .blog-modal-text ul {
                    margin: 20px 0;
                    padding-left: 25px;
                }

                .blog-modal-text li {
                    margin-bottom: 10px;
                    line-height: 1.7;
                }

                /* ========== RESPONSIVE - DÜZELTİLMİŞ ========== */
                @media (max-width: 768px) {
                    .blog-modal-overlay.active {
                        padding: 0;
                        align-items: flex-start;
                    }

                    .blog-modal-content {
                        max-height: 100vh;
                        border-radius: 0;
                        margin: 0;
                    }

                    .blog-modal-image {
                        height: 200px;
                    }

                    .blog-modal-body {
                        padding: 30px 20px;
                    }

                    .blog-modal-title {
                        font-size: 24px;
                    }

                    .blog-modal-text {
                        font-size: 16px;
                    }

                    .blog-modal-close {
                        top: 10px;
                        right: 10px;
                        width: 40px;
                        height: 40px;
                        font-size: 18px;
                    }
                }

                @media (max-width: 480px) {
                    .blog-modal-title {
                        font-size: 22px;
                    }

                    .blog-modal-body {
                        padding: 25px 15px;
                    }
                }
            </style>
        `;
        document.head.insertAdjacentHTML('beforeend', styles);
    }

    openModal(postId) {
        const post = this.posts.find(p => p.id == postId);
        if (!post) {
            console.error('❌ Post not found:', postId);
            return;
        }

        this.currentPost = post;

        // Modal içeriğini doldur
        const modal = document.getElementById('blogModal');
        const imageUrl = post.image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=900&h=400&fit=crop';
        
        document.getElementById('blogModalImage').src = imageUrl;
        document.getElementById('blogModalTitle').textContent = post.title;
        document.getElementById('blogModalDate').innerHTML = `<i class="far fa-calendar"></i> ${post.date}`;
        document.getElementById('blogModalCategory').textContent = post.category || 'BLOG';
        document.getElementById('blogModalContent').innerHTML = post.content || post.fullContent || post.description || post.summary;

        // Modal'ı göster
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Scroll'u en üste al
        const modalBody = document.querySelector('.blog-modal-body');
        if (modalBody) {
            modalBody.scrollTop = 0;
        }
        
        console.log('✅ Modal opened for:', post.title);
    }

    closeModal() {
        const modal = document.getElementById('blogModal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
            this.currentPost = null;
            console.log('✅ Modal closed');
        }
    }
}

// Global instance oluştur
let blogManager;

// Sayfa yüklendiğinde başlat
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        blogManager = new BlogManager();
    });
} else {
    blogManager = new BlogManager();
}

// Export for use in other modules (Node.js uyumluluğu için)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BlogManager, blogManager };
}

console.log('✅ Blog.js loaded successfully');
