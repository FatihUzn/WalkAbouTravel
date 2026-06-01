// Tours.js - WalkAbout Travel
// Admin'in kaydettiği flat format ile uyumlu (title_en, description_en, vb.)

class TourManager {
    constructor() {
        this.tours = [];
        this.currentLang = localStorage.getItem('language') || 'tr';
        this.filteredCategory = 'all';
        this.init();
    }

    async init() {
        await this.loadAllTours();
        this.setupEventListeners();

        // i18n henüz başlatılmamış olabilir — biraz bekle
        if (window.i18n && window.i18n.currentLang) {
            this.currentLang = window.i18n.currentLang;
        } else {
            this.currentLang = localStorage.getItem('language') || 'tr';
        }

        this.displayTours();
    }

    async loadAllTours() {
        try {
            const response = await fetch('data/tours.json');
            if (response.ok) {
                this.tours = await response.json();
                console.log(`✅ ${this.tours.length} tur yüklendi`);
            } else {
                console.warn('tours.json yüklenemedi');
                this.tours = [];
            }
        } catch (error) {
            console.warn('Yükleme hatası:', error.message);
            this.tours = [];
        }
    }

    // Slug yardımcı — PHP tour.php ile aynı mantık
    getTourSlug(tour) {
        const lang = this.currentLang;
        const prefix = { tr: '', en: '/en', es: '/es', ar: '/ar', pt: '/pt' };
        const slugKey = lang === 'tr' ? 'slug_tr' : 'slug_' + lang;
        let slug = tour[slugKey] || tour['slug_en'] || tour['slug'] || '';

        if (!slug) {
            const titleKey = lang === 'tr' ? 'title' : ('title_' + lang);
            const title = tour[titleKey] || tour['title_en'] || tour['title'] || '';
            slug = title.toLowerCase()
                .replace(/[şŞ]/g,'s').replace(/[ğĞ]/g,'g')
                .replace(/[üÜ]/g,'u').replace(/[öÖ]/g,'o')
                .replace(/[ıİ]/g,'i').replace(/[çÇ]/g,'c')
                .replace(/[^a-z0-9\s-]/g,'')
                .replace(/[\s-]+/g,'-').trim();
        }

        return (prefix[lang] || '') + '/' + slug + '/';
    }

    getField(tour, field, lang) {
        // 1. Nested obje formatı: { title: { tr: "...", en: "..." } }
        if (tour[field] && typeof tour[field] === 'object' && !Array.isArray(tour[field])) {
            return tour[field][lang] || tour[field]['en'] || tour[field]['tr'] || '';
        }
        // 2. Flat format — JSON'daki gerçek key sırası:
        //    title_en, title_es, title_ar mevcut; title_pt YOK → EN'e düş
        //    title (TR), description (TR) → base field
        if (lang !== 'tr') {
            if (tour[`${field}_${lang}`]) return tour[`${field}_${lang}`];
            if (tour[`${field}_en`])      return tour[`${field}_en`];   // pt gibi eksik diller için
        }
        return tour[field] || '';   // TR base field
    }

    setupEventListeners() {
        document.querySelectorAll('.tour-category-btn')?.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filterByCategory(e.target.dataset.category);
            });
        });

        window.addEventListener('languageChanged', (e) => {
            // detail.lang → detail (eski string format) → localStorage → 'tr'
            const lang = (e.detail && e.detail.lang)
                ? e.detail.lang
                : (typeof e.detail === 'string' && e.detail ? e.detail : null);
            this.currentLang = lang || localStorage.getItem('language') || 'tr';
            this.displayTours();
        });
    }

    filterByCategory(category) {
        this.filteredCategory = category;

        document.querySelectorAll('.tour-category-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-category="${category}"]`)?.classList.add('active');

        this.displayTours();
    }

    displayTours() {
        const container = document.querySelector('.tours-grid');
        if (!container) {
            console.error('❌ .tours-grid elementi bulunamadı!');
            return;
        }

        let filtered = this.filteredCategory === 'all'
            ? this.tours
            : this.tours.filter(tour => tour.category === this.filteredCategory);

        container.innerHTML = '';

        if (filtered.length === 0) {
            const noTours = (window.i18n && window.i18n.t) ? window.i18n.t('tours_empty') : 'Henüz tur bulunmuyor.';
            container.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #64748b; padding: 40px;">${noTours}</p>`;
            return;
        }

        filtered.forEach(tour => {
            container.appendChild(this.createTourCard(tour));
        });

        console.log(`📊 ${filtered.length} tur gösteriliyor (${this.filteredCategory})`);
    }

    createTourCard(tour) {
        const card = document.createElement('div');
        card.className = 'tour-card';
        card.style.cursor = 'pointer';

        const lang = this.currentLang;
        const title = this.getField(tour, 'title', lang);
        const description = this.getField(tour, 'description', lang);

        const noDesc = (window.i18n && window.i18n.t) ? window.i18n.t('tour_no_desc') : 'Açıklama bulunmuyor.';
        const shortDesc = description
            ? description.substring(0, 100) + '...'
            : noDesc;

        const linkText   = (window.i18n && window.i18n.t) ? window.i18n.t('tour_detail_btn')  : 'Detayları Gör';
        const priceLabel = (window.i18n && window.i18n.t) ? window.i18n.t('starting_from')    : 'Starting Price';
        const rating     = tour.rating || '4.9';

        card.innerHTML = `
            <div class="tour-image">
                <img src="${tour.image}" alt="${title}" loading="lazy"
                     onerror="this.src='https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600'">
                <div class="tour-badge">${tour.duration || ''}</div>
            </div>
            <div class="tour-content">
                <h3>${title}</h3>
                <p>${shortDesc}</p>
                <div class="tour-features">
                    ${tour.location ? `<span class="feature-tag"><i class="fas fa-map-marker-alt"></i> ${tour.location}</span>` : ''}
                    <span class="feature-tag"><i class="fas fa-star"></i> ${rating}</span>
                </div>
                <div class="tour-card-footer">
                    <div class="tour-price-block">
                        <span class="tour-price-label">${priceLabel}</span>
                        <span class="tour-price-value">${tour.price || ''}</span>
                    </div>
                    <a href="${this.getTourSlug(tour)}" class="tour-link" onclick="event.stopPropagation()">
                        ${linkText} <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
            </div>
        `;

        card.addEventListener('click', (e) => {
            if (!e.target.closest('.tour-link')) {
            window.location.href = this.getTourSlug(tour);
            }
        });

        return card;
    }
}

// Başlat
let tourManager;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        tourManager = new TourManager();
    });
} else {
    tourManager = new TourManager();
}

console.log('✅ Tours.js yüklendi');
