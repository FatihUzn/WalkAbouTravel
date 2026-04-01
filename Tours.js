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

    // Admin flat formatını okur: title_en, title_es, description_en, vb.
    // Nested formatı da destekler: { title: { tr: "...", en: "..." } } (geriye uyumluluk)
    getField(tour, field, lang) {
        // 1. Nested obje formatı
        if (tour[field] && typeof tour[field] === 'object') {
            return tour[field][lang] || tour[field]['tr'] || '';
        }
        // 2. Flat format (admin kayıtları)
        if (lang === 'tr') {
            return tour[field] || '';
        }
        return tour[`${field}_${lang}`] || tour[field] || '';
    }

    setupEventListeners() {
        document.querySelectorAll('.tour-category-btn')?.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filterByCategory(e.target.dataset.category);
            });
        });

        document.addEventListener('languageChanged', (e) => {
            this.currentLang = (e.detail && e.detail.lang)
                ? e.detail.lang
                : (e.detail || localStorage.getItem('language') || 'tr');
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
            container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #64748b; padding: 40px;">Henüz tur bulunmuyor.</p>';
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

        const shortDesc = description
            ? description.substring(0, 120) + '...'
            : 'Açıklama bulunmuyor.';

        const linkText = {
            tr: 'Detayları Gör',
            en: 'View Details',
            es: 'Ver Detalles',
            ru: 'Подробнее',
            de: 'Details ansehen',
            zh: '查看详情',
            ar: 'عرض التفاصيل'
        }[lang] || 'Detayları Gör';

        card.innerHTML = `
            <div class="tour-image">
                <img src="${tour.image}" alt="${title}" loading="lazy"
                     onerror="this.src='https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600'">
                <div class="tour-badge">${tour.category || ''}</div>
            </div>
            <div class="tour-content">
                <h3>${title}</h3>
                <p>${shortDesc}</p>
                <div class="tour-features">
                    ${tour.duration ? `<span class="feature-tag"><i class="fas fa-clock"></i> ${tour.duration}</span>` : ''}
                    ${tour.price ? `<span class="feature-tag"><i class="fas fa-tag"></i> ${tour.price}</span>` : ''}
                    ${tour.location ? `<span class="feature-tag"><i class="fas fa-map-marker-alt"></i> ${tour.location}</span>` : ''}
                </div>
                <a href="tour-detail.html?id=${tour.id}" class="tour-link">
                    <span>${linkText}</span>
                    <i class="fas fa-arrow-right"></i>
                </a>
            </div>
        `;

        card.addEventListener('click', (e) => {
            if (!e.target.closest('.tour-link')) {
                window.location.href = `tour-detail.html?id=${tour.id}`;
            }
        });

        return card;
    }
}

// Başlat
let tourManager;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('📄 DOM hazır, TourManager başlatılıyor...');
        tourManager = new TourManager();
    });
} else {
    console.log('📄 DOM zaten hazır, TourManager başlatılıyor...');
    tourManager = new TourManager();
}

console.log('✅ Tours.js yüklendi');
