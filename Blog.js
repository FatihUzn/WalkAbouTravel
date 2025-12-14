/* ================================================
   WALKABOUT TRAVEL - BLOG SYSTEM (EMBEDDED DATA)
   Emergency Fix - Direct Data Loading
   ================================================ */

class BlogManager {
    constructor() {
        // VERİLERİ DİREKT BURAYA YAZIYORUZ (DOSYA ARAMA YOK)
        this.posts = [
            {
                "id": 5,
                "title": "Ölüdeniz'de Yamaç Paraşütü: Adrenalin Dolu Bir Gün",
                "image": "assets/fethiye-oludeniz-manzarasi-14.webp",
                "date": "2025-06-28",
                "category": "MACERA",
                "summary": "Babadağ'dan atlayıp Ölüdeniz'in turkuaz sularına süzülmek nasıl bir duygu? İşte deneyimimiz.",
                "fullContent": "<p>Babadağ'dan 1960 metre yükseklikten Ölüdeniz'in eşsiz manzarasına doğru atlayış yapmak, hayatta en az bir kez yaşanması gereken deneyimlerden biri.</p><p><strong>Hazırlık Süreci:</strong><br>Yamaç paraşütü için herhangi bir deneyim gerekmez. Tandem uçuşlarda deneyimli pilotlar tüm süreci yönetir.</p>"
            },
            {
                "id": 4,
                "title": "Mardin'in Gizli Köşeleri: Taş Konaklar Rehberi",
                "image": "assets/mardin-tarihi-konak-dokusu-1.webp",
                "date": "2025-07-12",
                "category": "KÜLTÜR",
                "summary": "Mesopotamya'nın binlerce yıllık mirasını taşıyan Mardin'de mutlaka görülmesi gereken tarihi konaklar.",
                "fullContent": "<p>Mardin, taş konaklarıyla ünlü bu muhteşem şehir, Mesopotamya'nın binlerce yıllık tarihini sokaklarında taşıyor. Her köşesinde farklı bir medeniyet, her taşında bir hikaye var.</p><p><strong>Mutlaka Görülmesi Gerekenler:</strong></p><ul><li><strong>Kasımiye Medresesi:</strong> 15. yüzyıldan kalma bu muhteşem yapı, Artuklu mimarisinin en güzel örneklerinden biri.</li><li><strong>Zinciriye Medresesi:</strong> Taş işçiliğinin doruk noktası.</li></ul>"
            },
            {
                "id": 1,
                "title": "Kapadokya'da Balon Turu Deneyimi",
                "image": "assets/kapadokya-balon-turu-1.webp",
                "date": "2025-10-15",
                "category": "GEZİ REHBERİ",
                "summary": "Peri bacalarının üzerinde gün doğumunu izlemek hayatınızda yaşayabileceğiniz en büyüleyici deneyimlerden biri.",
                "fullContent": "<p>Peri bacalarının üzerinde gün doğumunu izlemek hayatınızda yaşayabileceğiniz en büyüleyici deneyimlerden biri. Sabahın ilk ışıklarıyla birlikte gökyüzüne yükselen yüzlerce balon, Kapadokya'nın eşsiz coğrafyasını bir masal diyarına dönüştürüyor.</p><p><strong>Ne Zaman Gidilmeli?</strong><br>En iyi sezon Nisan-Ekim arasıdır ancak kışın karlar altındaki manzarası da ayrı bir güzeldir.</p>"
            },
            {
                "id": 2,
                "title": "Vizesiz Gidilebilecek 10 Cennet Ülke",
                "image": "assets/antalya-koy-gezisi-1.webp",
                "date": "2025-09-20",
                "category": "İPUÇLARI",
                "summary": "Pasaportunuzu kapıp hemen yola çıkabileceğiniz, turkuaz suları ve tarihiyle büyüleyen o ülkeler hangileri?",
                "fullContent": "<p>Vize prosedürleriyle uğraşmadan tatil yapmanın keyfi paha biçilemez. İşte en güzel vizesiz destinasyonlar...</p><ul><li><strong>Karadağ:</strong> Adriyatik'in incisi.</li><li><strong>Sırbistan:</strong> Eğlenceli gece hayatı ve lezzetli yemekler.</li><li><strong>Tayland:</strong> Egzotik adalar ve tapınaklar.</li></ul>"
            },
            {
                "id": 3,
                "title": "Avrupa Turu İçin Çanta Hazırlama Rehberi",
                "image": "assets/spain-1.webp",
                "date": "2025-08-05",
                "category": "REHBER",
                "summary": "Uzun bir Avrupa seyahatine çıkarken yanınıza almanız gerekenler ve hayat kurtaran minimalist paketleme tüyoları.",
                "fullContent": "<p>Uzun bir Avrupa seyahatine çıkarken yanınıza almanız gerekenler ve hayat kurtaran minimalist paketleme tüyoları. </p><p>Öncelikle 'Kapsül Gardırop' mantığını benimseyin. Birbiriyle uyumlu 3 tişört, 2 pantolon ve 1 rahat yürüyüş ayakkabısı size 1 hafta yeter.</p>"
            }
        ];
        
        this.currentPost = null;
        this.init();
    }

    init() {
        this.setupModal();
        this.renderBlogGrid();
    }

    renderBlogGrid() {
        // İki ID'yi de kontrol ediyoruz (Garanti olsun diye)
        const container = document.getElementById('blogContainer') || document.getElementById('blog-grid-display');
        
        if (!container) {
            console.error('⚠️ Blog kutusu (div) bulunamadı!');
            return;
        }

        if (this.posts.length === 0) {
            container.innerHTML = '<p style="text-align:center;">Henüz yazı yok.</p>';
            return;
        }

        // SADECE 3 YAZI LİMİTİNİ KALDIRDIK (Hepsi gözükecek)
        const displayPosts = this.posts;

        let html = '';
        displayPosts.forEach(post => {
            html += this.createBlogCard(post);
        });

        container.innerHTML = html;
        this.attachClickEvents();
        console.log(`✅ ${displayPosts.length} blog yazısı başarıyla yüklendi.`);
    }

    createBlogCard(post) {
        // Resim yoksa varsayılan resim kullan
        const imageUrl = post.image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&h=400&fit=crop';
        
        return `
            <div class="blog-card" data-post-id="${post.id}" style="cursor: pointer;">
                <div class="blog-image">
                    <img src="${imageUrl}" alt="${post.title}" loading="lazy" style="width:100%; height:250px; object-fit:cover;">
                </div>
                <div class="blog-content" style="padding:20px;">
                    <div class="blog-meta" style="color:#666; font-size:0.9em; margin-bottom:10px;">
                        <span><i class="far fa-calendar"></i> ${post.date}</span>
                        ${post.category ? `<span style="margin-left:10px;"><i class="fas fa-tag"></i> ${post.category}</span>` : ''}
                    </div>
                    <h3 style="margin-bottom:10px; color:#333;">${post.title}</h3>
                    <p style="color:#666; font-size:0.95em; line-height:1.6;">${post.summary}</p>
                    <a href="#" class="blog-read-more" data-post-id="${post.id}" style="display:inline-block; margin-top:15px; color:#38bdf8; font-weight:600; text-decoration:none;">
                        Devamını Oku <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
            </div>
        `;
    }

    attachClickEvents() {
        document.querySelectorAll('.blog-card, .blog-read-more').forEach(element => {
            element.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation(); // Tıklama çakışmasını önle
                const postId = element.getAttribute('data-post-id');
                this.openModal(postId);
            });
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

            // Kapatma eventleri
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
        
        document.getElementById('blogModalImage').src = post.image;
        document.getElementById('blogModalTitle').textContent = post.title;
        document.getElementById('blogModalContent').innerHTML = post.fullContent || post.summary;
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
