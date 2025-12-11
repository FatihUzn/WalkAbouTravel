// Blog.js - Blog Sistemi
// WalkAbout Travel - 2025

class BlogManager {
    constructor() {
        this.posts = [];
        this.currentLang = 'tr';
        this.modal = null;
        this.init();
    }

    async init() {
        await this.loadPosts();
        this.injectModalStyles();
        this.createModal();
        this.renderBlogGrid();
        this.setupLanguageListener();
    }

    async loadPosts() {
        try {
            const response = await fetch('/data/blog-posts.json');
            this.posts = await response.json();
            console.log('✅ Blog yazıları yüklendi:', this.posts.length);
        } catch (error) {
            console.error('❌ Blog yükleme hatası:', error);
        }
    }

    setupLanguageListener() {
        if (window.i18n) {
            const originalChange = window.i18n.changeLanguage.bind(window.i18n);
            window.i18n.changeLanguage = async (lang) => {
                await originalChange(lang);
                this.currentLang = lang;
                this.renderBlogGrid();
            };
        }
    }

    getTitle(post) {
        if (this.currentLang === 'en' && post.title_en) {
            return post.title_en;
        }
        return post.title;
    }

    getSummary(post) {
        if (this.currentLang === 'en' && post.summary_en) {
            return post.summary_en;
        }
        return post.summary;
    }

    getDescription(post) {
        if (this.currentLang === 'en' && post.description_en) {
            return post.description_en;
        }
        return post.description;
    }

    getFullContent(post) {
        if (this.currentLang === 'en' && post.fullContent_en) {
            return post.fullContent_en;
        }
        return post.fullContent;
    }

    renderBlogGrid() {
        const blogGrid = document.getElementById('blogGrid');
        if (!blogGrid) return;

        blogGrid.innerHTML = this.posts.map(post => `
            <article class="blog-card" data-blog-id="${post.id}">
                <div class="blog-image-wrapper">
                    <img src="${post.image}" alt="${this.getTitle(post)}" class="blog-image" loading="lazy">
                    <div class="blog-overlay">
                        <span class="blog-category">${post.category}</span>
                    </div>
                </div>
                <div class="blog-content">
                    <div class="blog-meta">
                        <span class="blog-date">
                            <i class="far fa-calendar-alt"></i>
                            ${this.formatDate(post.date)}
                        </span>
                        <span class="blog-author">
                            <i class="far fa-user"></i>
                            ${post.author}
                        </span>
                    </div>
                    <h3 class="blog-title">${this.getTitle(post)}</h3>
                    <p class="blog-excerpt">${this.getDescription(post)}</p>
                    <button class="blog-read-more" data-blog-id="${post.id}">
                        ${this.currentLang === 'en' ? 'Read More' : 'Devamını Oku'}
                        <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            </article>
        `).join('');

        document.querySelectorAll('.blog-read-more').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const postId = parseInt(e.currentTarget.dataset.blogId);
                this.openModal(postId);
            });
        });
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        
        if (this.currentLang === 'en') {
            return date.toLocaleDateString('en-US', options);
        }
        return date.toLocaleDateString('tr-TR', options);
    }

    injectModalStyles() {
        if (document.getElementById('blogModalStyles')) return;

        const style = document.createElement('style');
        style.id = 'blogModalStyles';
        style.textContent = `
            <style id="blogModalStyles">
                .blog-modal-overlay {
                    display: none;
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.9);
                    z-index: 10000;
                    padding: 20px;
                    overflow-y: auto;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }

                .blog-modal-overlay.active {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 1;
                }

                .blog-modal-content {
                    background: white;
                    border-radius: 20px;
                    max-width: 900px;
                    width: 100%;
                    position: relative;
                    animation: slideUp 0.4s ease;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                    margin: 40px auto;
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

                .blog-modal-close {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    background: white;
                    border: 2px solid #0ea5e9;
                    color: #0c4a6e;
                    font-size: 24px;
                    font-weight: bold;
                    cursor: pointer;
                    z-index: 10002;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                }

                .blog-modal-close:hover {
                    background: #ef4444;
                    color: white;
                    border-color: #ef4444;
                    transform: rotate(90deg) scale(1.1);
                    box-shadow: 0 6px 25px rgba(239, 68, 68, 0.4);
                }

                .blog-modal-image {
                    width: 100%;
                    height: 400px;
                    object-fit: cover;
                    border-radius: 20px 20px 0 0;
                }

                .blog-modal-body {
                    padding: 50px;
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
                    font-size: 36px;
                    color: var(--deep-navy);
                    margin-bottom: 30px;
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

                @media (max-width: 768px) {
                    .blog-modal-image {
                        height: 250px;
                    }

                    .blog-modal-body {
                        padding: 30px 20px;
                    }

                    .blog-modal-title {
                        font-size: 28px;
                    }

                    .blog-modal-text {
                        font-size: 16px;
                    }
                    
                    .blog-modal-close {
                        top: 10px;
                        right: 10px;
                        width: 45px;
                        height: 45px;
                        font-size: 20px;
                    }
                }
            </style>
        `;
        document.head.appendChild(style);
    }

    createModal() {
        this.modal = document.createElement('div');
        this.modal.className = 'blog-modal-overlay';
        this.modal.innerHTML = `
            <div class="blog-modal-content">
                <button class="blog-modal-close" aria-label="Close">
                    <i class="fas fa-times"></i>
                </button>
                <img src="" alt="" class="blog-modal-image">
                <div class="blog-modal-body">
                    <div class="blog-modal-meta"></div>
                    <h2 class="blog-modal-title"></h2>
                    <div class="blog-modal-text"></div>
                </div>
            </div>
        `;

        document.body.appendChild(this.modal);

        this.modal.querySelector('.blog-modal-close').addEventListener('click', () => this.closeModal());
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.closeModal();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                this.closeModal();
            }
        });
    }

    openModal(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (!post) return;

        const modalContent = this.modal.querySelector('.blog-modal-content');
        const modalImage = this.modal.querySelector('.blog-modal-image');
        const modalMeta = this.modal.querySelector('.blog-modal-meta');
        const modalTitle = this.modal.querySelector('.blog-modal-title');
        const modalText = this.modal.querySelector('.blog-modal-text');

        modalImage.src = post.image;
        modalImage.alt = this.getTitle(post);

        modalMeta.innerHTML = `
            <span class="blog-category-badge">${post.category}</span>
            <span class="blog-date-badge">
                <i class="far fa-calendar-alt"></i>
                ${this.formatDate(post.date)}
            </span>
        `;

        modalTitle.textContent = this.getTitle(post);
        modalText.innerHTML = this.getFullContent(post);

        document.body.style.overflow = 'hidden';
        this.modal.style.display = 'flex';
        
        setTimeout(() => {
            this.modal.classList.add('active');
        }, 10);
    }

    closeModal() {
        this.modal.classList.remove('active');
        
        setTimeout(() => {
            this.modal.style.display = 'none';
            document.body.style.overflow = '';
        }, 300);
    }
}

if (typeof window !== 'undefined') {
    window.BlogManager = BlogManager;
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            new BlogManager();
        });
    } else {
        new BlogManager();
    }
}
