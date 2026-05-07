/* ================================================
   WALKABOUT TRAVEL - BLOG SYSTEM
   Admin flat format ile uyumlu:
   title_en, excerpt_en, content_en, vb.
   ================================================ */

class BlogManager {
    constructor() {
        this.posts = [];
        this.currentLang = localStorage.getItem('language') || 'tr';
        this.init();
    }

    async init() {
        await this.loadBlogPosts();
        this.setupModal();
        this.renderBlogGrid();
        this.setupLangListener();
    }

    async loadBlogPosts() {
        try {
            const response = await fetch('data/blog-posts.json');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            this.posts = await response.json();
            console.log(`✅ ${this.posts.length} blog yazısı yüklendi`);
        } catch (error) {
            console.error('❌ Blog yükleme hatası:', error);
            this.posts = [];
        }
    }

    // Admin flat formatını okur: title_en, excerpt_en, content_en vb.
    // Nested formatı da destekler: { title: { tr: "...", en: "..." } } (geriye uyumluluk)
    getField(post, field, lang) {
        // 1. Nested obje formatı
        if (post[field] && typeof post[field] === 'object') {
            return post[field][lang] || post[field]['tr'] || '';
        }
        // 2. Flat format (admin kayıtları)
        if (lang === 'tr') {
            return post[field] || '';
        }
        return post[`${field}_${lang}`] || post[field] || '';
    }

    setupLangListener() {
        window.addEventListener('languageChanged', (e) => {
            this.currentLang = (e.detail && e.detail.lang)
                ? e.detail.lang
                : (e.detail || localStorage.getItem('language') || 'tr');
            this.renderBlogGrid();
        });
    }

    renderBlogGrid() {
        const container = document.getElementById('blogContainer') || document.getElementById('blog-grid-display');

        if (!container) {
            console.error('⚠️ Blog kutusu (div) bulunamadı!');
            return;
        }

        if (this.posts.length === 0) {
            container.innerHTML = '<p style="text-align:center;">Henüz yazı yok.</p>';
            return;
        }

        let html = '';
        this.posts.forEach(post => {
            html += this.createBlogCard(post);
        });

        container.innerHTML = html;

        if (!container.dataset.listenerAttached) {
            this.attachClickEvents();
            container.dataset.listenerAttached = 'true';
        }
    }

    createBlogCard(post) {
        const lang = this.currentLang;
        const imageUrl = post.image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&h=400&fit=crop';

        // Admin flat format: title / title_en, excerpt / excerpt_en
        const title = this.getField(post, 'title', lang);
        const excerpt = this.getField(post, 'excerpt', lang)
                     || this.getField(post, 'description', lang); // eski format desteği

        return `
            <div class="blog-card" data-post-id="${post.id}" style="cursor: pointer;">
                <div class="blog-image">
                    <img src="${imageUrl}" alt="${title}" loading="lazy" style="width:100%; height:250px; object-fit:cover;">
                </div>
                <div class="blog-content" style="padding:20px;">
                    <div class="blog-meta" style="color:#666; font-size:0.9em; margin-bottom:10px;">
                        <span><i class="far fa-calendar"></i> ${post.date || ''}</span>
                        ${post.category ? `<span style="margin-left:10px;"><i class="fas fa-tag"></i> ${post.category}</span>` : ''}
                    </div>
                    <h3 style="margin-bottom:10px; color:#333;">${title}</h3>
                    <p style="color:#666; font-size:0.95em; line-height:1.6;">${excerpt}</p>
                    <a href="#" class="blog-read-more" data-post-id="${post.id}" style="display:inline-block; margin-top:15px; color:#38bdf8; font-weight:600; text-decoration:none;">
                        Devamını Oku <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
            </div>
        `;
    }

    attachClickEvents() {
        const container = document.getElementById('blogContainer')
                       || document.getElementById('blog-grid-display');
        if (!container) return;

        container.addEventListener('click', (e) => {
            e.preventDefault();
            const target = e.target.closest('[data-post-id]');
            if (target) this.openModal(target.getAttribute('data-post-id'));
        });
    }

    setupModal() {
        if (!document.getElementById('blogModal')) {
            const modalHTML = `
                <div id="blogModal" class="blog-modal-overlay">
                    <div class="blog-modal-content">
                        <button class="blog-modal-close"><i class="fas fa-times"></i></button>
                        <img id="blogModalImage" class="blog-modal-image" src="">
                        <div class="blog-modal-body">
                            <h2 id="blogModalTitle" class="blog-modal-title"></h2>
                            <div id="blogModalContent" class="blog-modal-text"></div>
                        </div>
                    </div>
                </div>`;
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            this.injectModalStyles();

            document.querySelector('.blog-modal-close').addEventListener('click', () => this.closeModal());
            document.getElementById('blogModal').addEventListener('click', (e) => {
                if (e.target.id === 'blogModal') this.closeModal();
            });
        }
    }

    injectModalStyles() {
        if (document.getElementById('blogModalStyles')) return;
        const styles = `
            <style id="blogModalStyles">
                .blog-modal-overlay { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 9999; justify-content: center; align-items: center; padding: 20px; }
                .blog-modal-overlay.active { display: flex; }
                .blog-modal-content { background: white; width: 100%; max-width: 800px; max-height: 90vh; overflow-y: auto; border-radius: 15px; position: relative; animation: slideIn 0.3s ease; }
                .blog-modal-close { position: absolute; top: 15px; right: 15px; background: white; border: none; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; font-size: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.2); z-index: 10; }
                .blog-modal-image { width: 100%; height: 300px; object-fit: cover; }
                .blog-modal-body { padding: 30px; }
                .blog-modal-title { margin-bottom: 20px; color: #1a1a1a; font-size: 24px; }
                .blog-modal-text { line-height: 1.8; color: #444; }
                @keyframes slideIn { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            </style>`;
        document.head.insertAdjacentHTML('beforeend', styles);
    }

    openModal(postId) {
        const post = this.posts.find(p => p.id == postId);
        if (!post) return;

        const lang = this.currentLang;

        // Admin flat format: content / content_en
        // Eski format desteği: fullContent, description
        const title = this.getField(post, 'title', lang);
        const content = this.getField(post, 'content', lang)
                     || this.getField(post, 'fullContent', lang)
                     || this.getField(post, 'description', lang);

        document.getElementById('blogModalImage').src = post.image || '';
        document.getElementById('blogModalTitle').textContent = title;
        document.getElementById('blogModalContent').innerHTML = content;
        document.getElementById('blogModal').classList.add('active');
    }

    closeModal() {
        document.getElementById('blogModal').classList.remove('active');
    }
}

// Başlat
document.addEventListener('DOMContentLoaded', () => {
    new BlogManager();
});
