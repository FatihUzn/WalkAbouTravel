// Tours.js - WalkAbout Travel
// Hem galleries.json hem de tours.json'dan okur ve birleştirir

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
        const allTours = [];

        // 1. galleries.json'dan yükle (eski sistem)
        try {
            const galResponse = await fetch('data/galleries.json');
            if (galResponse.ok) {
                const galleries = await galResponse.json();
                
                for (const [id, gallery] of Object.entries(galleries)) {
                    allTours.push({
                        id: id,
                        title: gallery.title,
                        title_en: gallery.title,
                        price: gallery.price,
                        location: gallery.location,
                        area: gallery.area,
                        category: this.getCategoryFromId(id),
                        description: gallery.desc,
                        description_en: gallery.desc,
                        image: gallery.images?.[0] || 'assets/placeholder.jpg',
                        content: gallery.desc,
                        content_en: gallery.desc,
                        source: 'galleries'
                    });
                }
                console.log(`✅ ${allTours.length} tur yüklendi (galleries.json)`);
            }
        } catch (error) {
            console.warn('⚠️ galleries.json yüklenemedi:', error.message);
        }

        // 2. tours.json'dan yükle (yeni sistem)
        try {
            const toursResponse = await fetch('data/tours.json');
            if (toursResponse.ok) {
                const tours = await toursResponse.json();
                
                // Duplicate kontrolü - aynı ID varsa tours.json'daki öncelikli
                tours.forEach(tour => {
                    const existingIndex = allTours.findIndex(t => t.id === tour.id);
                    if (existingIndex !== -1) {
                        allTours[existingIndex] = { ...tour, source: 'tours' };
                    } else {
                        allTours.push({ ...tour, source: 'tours' });
                    }
                });
                console.log(`✅ ${tours.length} tur yüklendi (tours.json)`);
            }
        } catch (error) {
            console.warn('⚠️ tours.json yüklenemedi:', error.message);
        }

        this.tours = allTours;
        console.log(`🎯 TOPLAM ${this.tours.length} tur hazır`);
    }

    getCategoryFromId(id) {
        if (id.includes('TR')) return 'Türkiye';
        if (id.includes('D-ISPANYA') || id.includes('D-RUSYA')) return 'Avrupa';
        if (id.includes('D-BREZILYA') || id.includes('D-AMERIKA')) return 'Amerika';
        return 'Genel';
    }

    setupEventListeners() {
        document.querySelectorAll('.tour-category-btn')?.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filterByCategory(e.target.dataset.category);
            });
        });

        document.addEventListener('languageChanged', (e) => {
            this.currentLang = e.detail.lang;
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
        if (!container) return;

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
        
        const title = this.currentLang === 'en' && tour.title_en ? tour.title_en : tour.title;
        const description = this.currentLang === 'en' && tour.description_en ? tour.description_en : tour.description;

        card.innerHTML = `
            <div class="tour-image">
                <img src="${tour.image}" alt="${title}" loading="lazy" 
                     onerror="this.src='https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600'">
                <div class="tour-badge">${tour.category}</div>
            </div>
            <div class="tour-content">
                <h3>${title}</h3>
                <p>${description.substring(0, 120)}...</p>
                <div class="tour-features">
                    ${tour.price ? `<span class="feature-tag"><i class="fas fa-tag"></i> ${tour.price}</span>` : ''}
                    ${tour.location ? `<span class="feature-tag"><i class="fas fa-map-marker-alt"></i> ${tour.location}</span>` : ''}
                </div>
                <a href="tour-detail.html?id=${tour.id}" class="tour-link">
                    <span>${this.currentLang === 'tr' ? 'Detayları Gör' : 'View Details'}</span>
                    <i class="fas fa-arrow-right"></i>
                </a>
            </div>
        `;

        return card;
    }
}

// Başlat
let tourManager;
document.addEventListener('DOMContentLoaded', () => {
    tourManager = new TourManager();
});
