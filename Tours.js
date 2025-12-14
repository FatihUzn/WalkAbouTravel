// Tours.js - WalkAbout Travel Tour Display Component
// Blog.js ile aynı mantıkta çalışır

class TourManager {
    constructor() {
        this.tours = [];
        this.currentLang = localStorage.getItem('language') || 'tr';
        this.filteredCategory = 'all';
        this.init();
    }

    async init() {
        await this.loadTours();
        this.setupEventListeners();
        this.displayTours();
    }

    async loadTours() {
        try {
            const response = await fetch('data/tours.json');
            if (!response.ok) throw new Error('Tours not found');
            this.tours = await response.json();
            console.log(`✅ ${this.tours.length} tur yüklendi`);
        } catch (error) {
            console.error('❌ Turlar yüklenemedi:', error);
            this.tours = this.getSampleTours();
        }
    }

    setupEventListeners() {
        // Kategori filtreleri
        document.querySelectorAll('.tour-category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.target.dataset.category;
                this.filterByCategory(category);
            });
        });

        // Dil değişimi
        document.addEventListener('languageChanged', (e) => {
            this.currentLang = e.detail.lang;
            this.displayTours();
        });
    }

    filterByCategory(category) {
        this.filteredCategory = category;
        
        // Aktif butonu güncelle
        document.querySelectorAll('.tour-category-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-category="${category}"]`).classList.add('active');
        
        this.displayTours();
    }

    displayTours() {
        const container = document.querySelector('.tours-grid');
        if (!container) return;

        // Filtreleme
        let filtered = this.tours;
        if (this.filteredCategory !== 'all') {
            filtered = this.tours.filter(tour => tour.category === this.filteredCategory);
        }

        // Temizle
        container.innerHTML = '';

        // Turları göster
        filtered.forEach(tour => {
            const card = this.createTourCard(tour);
            container.appendChild(card);
        });

        // Sayı güncelle
        const countElement = document.querySelector('.tour-count');
        if (countElement) {
            countElement.textContent = filtered.length;
        }
    }

    createTourCard(tour) {
        const card = document.createElement('div');
        card.className = 'tour-card';
        card.dataset.category = tour.category;

        const title = this.currentLang === 'tr' ? tour.title : tour.title_en;
        const description = this.currentLang === 'tr' ? tour.description : tour.description_en;

        card.innerHTML = `
            <div class="tour-card-image">
                <img src="${tour.image}" alt="${title}" loading="lazy">
                <div class="tour-card-badge">${tour.category}</div>
            </div>
            <div class="tour-card-content">
                <h3 class="tour-card-title">${title}</h3>
                <div class="tour-card-meta">
                    <span class="tour-meta-item">
                        <i class="fas fa-tag"></i>
                        <strong>${tour.price}</strong>
                    </span>
                    <span class="tour-meta-item">
                        <i class="fas fa-clock"></i>
                        ${tour.duration}
                    </span>
                    <span class="tour-meta-item">
                        <i class="fas fa-map-marker-alt"></i>
                        ${tour.location}
                    </span>
                </div>
                <p class="tour-card-description">${description}</p>
                <button class="tour-card-btn" onclick="tourManager.showTourModal('${tour.id}')">
                    <i class="fas fa-info-circle"></i>
                    <span data-i18n="tour_details">${this.currentLang === 'tr' ? 'Detayları Gör' : 'View Details'}</span>
                </button>
            </div>
        `;

        return card;
    }

    showTourModal(tourId) {
        const tour = this.tours.find(t => t.id === tourId);
        if (!tour) return;

        const title = this.currentLang === 'tr' ? tour.title : tour.title_en;
        const content = this.currentLang === 'tr' ? tour.content : tour.content_en;

        // Modal oluştur
        const modal = document.createElement('div');
        modal.className = 'tour-modal';
        modal.innerHTML = `
            <div class="tour-modal-overlay" onclick="tourManager.closeTourModal()"></div>
            <div class="tour-modal-content">
                <button class="tour-modal-close" onclick="tourManager.closeTourModal()">
                    <i class="fas fa-times"></i>
                </button>
                
                <div class="tour-modal-header">
                    <img src="${tour.image}" alt="${title}" class="tour-modal-image">
                    <div class="tour-modal-badge">${tour.category}</div>
                </div>
                
                <div class="tour-modal-body">
                    <h2 class="tour-modal-title">${title}</h2>
                    
                    <div class="tour-modal-meta">
                        <div class="tour-modal-meta-item">
                            <i class="fas fa-tag"></i>
                            <div>
                                <strong>${this.currentLang === 'tr' ? 'Fiyat' : 'Price'}</strong>
                                <span>${tour.price}</span>
                            </div>
                        </div>
                        <div class="tour-modal-meta-item">
                            <i class="fas fa-clock"></i>
                            <div>
                                <strong>${this.currentLang === 'tr' ? 'Süre' : 'Duration'}</strong>
                                <span>${tour.duration}</span>
                            </div>
                        </div>
                        <div class="tour-modal-meta-item">
                            <i class="fas fa-map-marker-alt"></i>
                            <div>
                                <strong>${this.currentLang === 'tr' ? 'Lokasyon' : 'Location'}</strong>
                                <span>${tour.location}</span>
                            </div>
                        </div>
                        <div class="tour-modal-meta-item">
                            <i class="fas fa-map"></i>
                            <div>
                                <strong>${this.currentLang === 'tr' ? 'Bölge' : 'Region'}</strong>
                                <span>${tour.area}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="tour-modal-content-text">
                        ${content}
                    </div>
                    
                    <div class="tour-modal-actions">
                        <a href="https://wa.me/5491135870045?text=${encodeURIComponent('Merhaba! ' + title + ' hakkında bilgi almak istiyorum.')}" 
                           class="btn btn-whatsapp" target="_blank">
                            <i class="fab fa-whatsapp"></i>
                            ${this.currentLang === 'tr' ? 'WhatsApp ile Bilgi Al' : 'Get Info via WhatsApp'}
                        </a>
                        <a href="tel:+902125551923" class="btn btn-phone">
                            <i class="fas fa-phone"></i>
                            ${this.currentLang === 'tr' ? 'Hemen Ara' : 'Call Now'}
                        </a>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        
        // Animasyon için setTimeout
        setTimeout(() => modal.classList.add('show'), 10);
        
        // Body scroll kapat
        document.body.style.overflow = 'hidden';
    }

    closeTourModal() {
        const modal = document.querySelector('.tour-modal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.remove();
                document.body.style.overflow = '';
            }, 300);
        }
    }

    getSampleTours() {
        return [
            {
                id: 'TUR-1',
                title: 'Kapadokya - Balon ve Peribacaları Turu',
                title_en: 'Cappadocia - Balloon & Fairy Chimneys Tour',
                price: '9800 TL',
                duration: '4 Gün / 3 Gece',
                location: 'Göreme, Uçhisar, Avanos',
                area: 'İç Anadolu',
                category: 'Kültür',
                description: 'Kapadokya\'nın büyülü atmosferinde sıcak hava balonu, peribacaları ve tarihi yeraltı şehirleri.',
                description_en: 'Hot air balloon, fairy chimneys and historical underground cities in the magical atmosphere of Cappadocia.',
                image: 'assets/kapadokya.jpg',
                content: '<h3>🎈 Programa Dahil Olanlar</h3><ul><li>Sıcak hava balonu turu</li><li>Göreme Açık Hava Müzesi</li><li>Profesyonel rehber</li></ul>',
                content_en: '<h3>🎈 Included</h3><ul><li>Hot air balloon tour</li><li>Goreme Open Air Museum</li><li>Professional guide</li></ul>'
            }
        ];
    }
}

// Initialize
let tourManager;
document.addEventListener('DOMContentLoaded', () => {
    tourManager = new TourManager();
});

// CSS Stilleri
const tourStyles = `
<style>
/* Tour Grid */
.tours-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 30px;
    padding: 40px 0;
}

/* Tour Card */
.tour-card {
    background: white;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    transition: all 0.3s ease;
}

.tour-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 15px 40px rgba(0,0,0,0.2);
}

.tour-card-image {
    position: relative;
    height: 250px;
    overflow: hidden;
}

.tour-card-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s;
}

.tour-card:hover .tour-card-image img {
    transform: scale(1.1);
}

.tour-card-badge {
    position: absolute;
    top: 15px;
    right: 15px;
    background: linear-gradient(135deg, #38bdf8, #3b82f6);
    color: white;
    padding: 8px 16px;
    border-radius: 20px;
    font-weight: 600;
    font-size: 14px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.2);
}

.tour-card-content {
    padding: 25px;
}

.tour-card-title {
    font-size: 20px;
    color: #1e293b;
    margin-bottom: 15px;
    font-weight: 700;
    line-height: 1.4;
}

.tour-card-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 15px;
    padding-bottom: 15px;
    border-bottom: 2px solid #f1f5f9;
}

.tour-meta-item {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: #64748b;
    font-size: 14px;
}

.tour-meta-item i {
    color: #38bdf8;
}

.tour-card-description {
    color: #64748b;
    line-height: 1.6;
    margin-bottom: 20px;
}

.tour-card-btn {
    width: 100%;
    padding: 12px;
    background: linear-gradient(135deg, #38bdf8, #3b82f6);
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

.tour-card-btn:hover {
    background: linear-gradient(135deg, #0284c7, #2563eb);
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(56, 189, 248, 0.4);
}

/* Tour Modal */
.tour-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10000;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.tour-modal.show {
    opacity: 1;
}

.tour-modal-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(5px);
}

.tour-modal-content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90%;
    max-width: 900px;
    max-height: 90vh;
    background: white;
    border-radius: 20px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.tour-modal-close {
    position: absolute;
    top: 20px;
    right: 20px;
    width: 40px;
    height: 40px;
    background: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    z-index: 10001;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 10px rgba(0,0,0,0.2);
    transition: all 0.3s;
}

.tour-modal-close:hover {
    background: #ef4444;
    color: white;
    transform: rotate(90deg);
}

.tour-modal-header {
    position: relative;
    height: 300px;
}

.tour-modal-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.tour-modal-badge {
    position: absolute;
    top: 20px;
    left: 20px;
    background: linear-gradient(135deg, #38bdf8, #3b82f6);
    color: white;
    padding: 10px 20px;
    border-radius: 25px;
    font-weight: 600;
    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
}

.tour-modal-body {
    padding: 30px;
    overflow-y: auto;
    flex: 1;
}

.tour-modal-title {
    font-size: 28px;
    color: #1e293b;
    margin-bottom: 20px;
    font-weight: 700;
}

.tour-modal-meta {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
    margin-bottom: 30px;
    padding: 20px;
    background: #f8fafc;
    border-radius: 12px;
}

.tour-modal-meta-item {
    display: flex;
    gap: 12px;
    align-items: flex-start;
}

.tour-modal-meta-item i {
    font-size: 20px;
    color: #38bdf8;
    margin-top: 2px;
}

.tour-modal-meta-item strong {
    display: block;
    color: #1e293b;
    font-size: 14px;
    margin-bottom: 4px;
}

.tour-modal-meta-item span {
    color: #64748b;
    font-size: 16px;
}

.tour-modal-content-text {
    color: #475569;
    line-height: 1.8;
    margin-bottom: 30px;
}

.tour-modal-content-text h3 {
    color: #1e293b;
    margin: 25px 0 15px;
    font-size: 20px;
}

.tour-modal-content-text ul {
    padding-left: 20px;
}

.tour-modal-content-text li {
    margin-bottom: 8px;
}

.tour-modal-actions {
    display: flex;
    gap: 15px;
    padding-top: 20px;
    border-top: 2px solid #f1f5f9;
}

.btn-whatsapp {
    flex: 1;
    padding: 15px;
    background: linear-gradient(135deg, #25d366, #128c7e);
    color: white;
    text-decoration: none;
    border-radius: 10px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    transition: all 0.3s;
}

.btn-whatsapp:hover {
    background: linear-gradient(135deg, #128c7e, #075e54);
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(37, 211, 102, 0.4);
}

.btn-phone {
    flex: 1;
    padding: 15px;
    background: linear-gradient(135deg, #38bdf8, #3b82f6);
    color: white;
    text-decoration: none;
    border-radius: 10px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    transition: all 0.3s;
}

.btn-phone:hover {
    background: linear-gradient(135deg, #0284c7, #2563eb);
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(56, 189, 248, 0.4);
}

/* Category Filters */
.tour-category-filters {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin-bottom: 30px;
    justify-content: center;
}

.tour-category-btn {
    padding: 10px 20px;
    background: white;
    border: 2px solid #e2e8f0;
    border-radius: 25px;
    cursor: pointer;
    transition: all 0.3s;
    font-weight: 600;
    color: #64748b;
}

.tour-category-btn:hover {
    border-color: #38bdf8;
    color: #38bdf8;
}

.tour-category-btn.active {
    background: linear-gradient(135deg, #38bdf8, #3b82f6);
    color: white;
    border-color: transparent;
}

/* Mobile */
@media (max-width: 768px) {
    .tours-grid {
        grid-template-columns: 1fr;
        gap: 20px;
    }
    
    .tour-modal-content {
        width: 95%;
        max-height: 95vh;
    }
    
    .tour-modal-header {
        height: 200px;
    }
    
    .tour-modal-body {
        padding: 20px;
    }
    
    .tour-modal-title {
        font-size: 22px;
    }
    
    .tour-modal-meta {
        grid-template-columns: 1fr;
    }
    
    .tour-modal-actions {
        flex-direction: column;
    }
}
</style>
`;

// Stilleri head'e ekle
document.head.insertAdjacentHTML('beforeend', tourStyles);
