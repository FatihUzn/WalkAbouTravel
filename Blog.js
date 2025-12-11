/* ================================================
   WALKABOUT TRAVEL - BLOG SYSTEM WITH MODAL
   Optimized Version - 10 Aralık 2025
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
            const response = await fetch('data/blog-posts.json');
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
        const displayPosts = sortedPosts.slice(0, 3);

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
