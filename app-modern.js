// ================================================
// WALKABOUT TRAVEL - MODERN APP.JS
// Version: 2.0
// ================================================

// === TOUR DATABASE ===
const TOUR_DATA = {
  // --- YURT İÇİ ---
  "TUR-TR-MARDIN": {
    "title": "Mardin - Tarihi Konaklar & Kültür Turu",
    "price": "8.900 TL",
    "duration": "5 Gün / 4 Gece",
    "location": "Mardin ve Çevresi",
    "area": "Güneydoğu Anadolu",
    "accommodation": "Özel Butik Otel",
    "groupSize": "10-15 Kişi",
    "badge": "Popüler",
    "description": `
      <p>Binlerce yıllık medeniyetin izlerini taşıyan Mardin, Mezopotamya'nın kalbinde yer alan eşsiz bir şehirdir. Taş konakları, dar sokakları ve panoramik manzarasıyla büyüleyen bu antik şehirde, tarihin en derin izlerini takip edeceksiniz.</p>
      
      <h3>Tur Programı</h3>
      <p>5 günlük turumuza Mardin'in tarihi merkezinde başlayacağız. Dara Antik Kenti, Deyrulzafaran Manastırı ve Kasımiye Medresesi'ni ziyaret edeceğiz.</p>
      
      <div class="tour-highlights">
        <h4>✨ Tur Dahilinde</h4>
        <ul>
          <li><i class="fas fa-check-circle"></i> Havalimanı karşılama ve transferler</li>
          <li><i class="fas fa-check-circle"></i> 4 gece butik otel konaklaması</li>
          <li><i class="fas fa-check-circle"></i> Sabah kahvaltıları ve akşam yemekleri</li>
          <li><i class="fas fa-check-circle"></i> Profesyonel Türkçe rehber</li>
          <li><i class="fas fa-check-circle"></i> Müze ve antik kent giriş ücretleri</li>
          <li><i class="fas fa-check-circle"></i> Seyahat sigortası</li>
        </ul>
      </div>
      
      <h3>Görülecek Yerler</h3>
      <p>Mardin Kalesi, Zinciriye Medresesi, Kasımiye Medresesi, Dara Antik Kenti, Deyrulzafaran Manastırı, Midyat gümüş atölyeleri ve daha fazlası...</p>
    `,
    "images": generateTourImages("mardin-tarihi-konak-dokusu-", 16)
  },
  
  "TUR-TR-ANTALYA": {
    "title": "Antalya - Koy Gezisi & Tarihi Kaleiçi",
    "price": "12.500 TL",
    "duration": "7 Gün / 6 Gece",
    "location": "Antalya, Kaş, Kemer",
    "area": "Akdeniz Bölgesi",
    "accommodation": "Her şey Dahil Otel",
    "groupSize": "15-20 Kişi",
    "badge": "Özel",
    "description": `
      <p>Akdeniz'in turkuaz sularında unutulmaz bir yolculuğa çıkmaya hazır mısınız? Antalya'nın en güzel koylarını, tarihi Kaleiçi'ni ve antik kentleri keşfedeceğiniz 7 günlük bu turda, hem dinlenecek hem de tarihi zenginlikleri göreceksiniz.</p>
      
      <h3>Tur Programı</h3>
      <p>Antalya'da başlayıp Kaş ve Kemer'e uzanan rotamızda, tekne turları, tarihi geziler ve doğa yürüyüşleri sizi bekliyor.</p>
      
      <div class="tour-highlights">
        <h4>✨ Tur Dahilinde</h4>
        <ul>
          <li><i class="fas fa-check-circle"></i> Havalimanı transferleri</li>
          <li><i class="fas fa-check-circle"></i> 6 gece her şey dahil otel</li>
          <li><i class="fas fa-check-circle"></i> Tekne turu (öğle yemeği dahil)</li>
          <li><i class="fas fa-check-circle"></i> Aspendos Antik Tiyatrosu ziyareti</li>
          <li><i class="fas fa-check-circle"></i> Profesyonel rehber</li>
          <li><i class="fas fa-check-circle"></i> Seyahat sigortası</li>
        </ul>
      </div>
    `,
    "images": generateTourImages("antalya-koy-gezisi-", 17)
  },
  
  "TUR-TR-KAPADOKYA": {
    "title": "Kapadokya - Balon ve Peribacaları Turu",
    "price": "9.800 TL",
    "duration": "4 Gün / 3 Gece",
    "location": "Göreme, Uçhisar, Avanos",
    "area": "İç Anadolu",
    "accommodation": "Mağara Otel Konaklama",
    "groupSize": "12-18 Kişi",
    "badge": "Popüler",
    "description": `
      <p>Kapadokya'nın eşsiz peribacaları ve gün doğumu balon turları ile unutulmaz bir deneyim yaşayın. Dünyanın en özel coğrafyalarından birinde, yer altı şehirlerini, vadileri ve tarihi kiliseleri keşfedeceksiniz.</p>
      
      <div class="tour-highlights">
        <h4>✨ Tur Dahilinde</h4>
        <ul>
          <li><i class="fas fa-check-circle"></i> Gün doğumu balon turu</li>
          <li><i class="fas fa-check-circle"></i> 3 gece mağara otel</li>
          <li><i class="fas fa-check-circle"></i> Göreme Açık Hava Müzesi</li>
          <li><i class="fas fa-check-circle"></i> Derinkuyu Yer Altı Şehri</li>
          <li><i class="fas fa-check-circle"></i> Avanos çömlek atölyesi</li>
          <li><i class="fas fa-check-circle"></i> Tüm transferler ve rehber</li>
        </ul>
      </div>
    `,
    "images": generateTourImages("kapadokya-balon-turu-", 20)
  },
  
  "TUR-TR-FETHIYE": {
    "title": "Fethiye - Yamaç Paraşütü & Ölüdeniz",
    "price": "6.750 TL",
    "duration": "3 Gün / 2 Gece",
    "location": "Ölüdeniz, Kelebekler Vadisi",
    "area": "Ege Bölgesi",
    "accommodation": "Butik Pansiyon",
    "groupSize": "8-12 Kişi",
    "badge": "Macera",
    "description": `
      <p>Babadağ'dan yamaç paraşütü ile Ölüdeniz'in turkuaz sularına süzülün. Kelebekler Vadisi'nde tekne turu yapın ve Likya Yolu'nda doğa yürüyüşü deneyimi yaşayın.</p>
      
      <div class="tour-highlights">
        <h4>✨ Tur Dahilinde</h4>
        <ul>
          <li><i class="fas fa-check-circle"></i> Yamaç paraşütü deneyimi</li>
          <li><i class="fas fa-check-circle"></i> Tekne turu (öğle yemeği dahil)</li>
          <li><i class="fas fa-check-circle"></i> 2 gece butik pansiyon</li>
          <li><i class="fas fa-check-circle"></i> Likya Yolu rehberli yürüyüş</li>
        </ul>
      </div>
    `,
    "images": generateTourImages("fethiye-oludeniz-manzarasi-", 19)
  },
  
  "TUR-TR-PAMUKKALE": {
    "title": "Pamukkale - Travertenler & Antik Kent",
    "price": "4.500 TL",
    "duration": "2 Gün / 1 Gece",
    "location": "Pamukkale, Hierapolis",
    "area": "Denizli",
    "accommodation": "Termal Otel",
    "groupSize": "15-20 Kişi",
    "badge": "Hızlı Tur",
    "description": `
      <p>Pamukkale'nin bembeyaz traverten teraslarında yürüyün ve Kleopatra Havuzu'nda termal sularda yüzün. Hierapolis Antik Kenti'ni keşfedin.</p>
      
      <div class="tour-highlights">
        <h4>✨ Tur Dahilinde</h4>
        <ul>
          <li><i class="fas fa-check-circle"></i> Travertenler girişi</li>
          <li><i class="fas fa-check-circle"></i> Hierapolis Antik Kenti</li>
          <li><i class="fas fa-check-circle"></i> 1 gece termal otel</li>
          <li><i class="fas fa-check-circle"></i> Kleopatra Havuzu</li>
        </ul>
      </div>
    `,
    "images": generateTourImages("pamukkale-traverten-dogal-", 11)
  },

  // --- YURT DIŞI ---
  "TUR-D-ISPANYA": {
    "title": "İspanya - Barselona & Endülüs Rüyası",
    "price": "1.800 €",
    "duration": "9 Gün / 8 Gece",
    "location": "Barselona, Granada, Sevilla",
    "area": "İspanya",
    "accommodation": "4 Yıldızlı Oteller",
    "groupSize": "20-25 Kişi",
    "badge": "Premium",
    "description": `
      <p>Gaudi'nin eşsiz eserleri, Endülüs'ün büyülü sarayları ve flamenko gösterileri ile dolu İspanya turumuza katılın!</p>
      
      <div class="tour-highlights">
        <h4>✨ Tur Dahilinde</h4>
        <ul>
          <li><i class="fas fa-check-circle"></i> Uçak bileti dahil</li>
          <li><i class="fas fa-check-circle"></i> 8 gece 4 yıldızlı otel</li>
          <li><i class="fas fa-check-circle"></i> Sagrada Familia rehberli tur</li>
          <li><i class="fas fa-check-circle"></i> El Hamra Sarayı ziyareti</li>
          <li><i class="fas fa-check-circle"></i> Flamenko gösterisi</li>
          <li><i class="fas fa-check-circle"></i> Schengen vizesi desteği</li>
        </ul>
      </div>
    `,
    "images": generateTourImages("spain-", 15)
  },
  
  "TUR-D-RUSYA-KIS": {
    "title": "Rusya - Kış Masalı (Moskova & St. Petersburg)",
    "price": "1.450 €",
    "duration": "6 Gün / 5 Gece",
    "location": "Moskova, St. Petersburg",
    "area": "Rusya Federasyonu",
    "accommodation": "5 Yıldızlı Oteller",
    "groupSize": "15-20 Kişi",
    "badge": "Kış Özel",
    "description": `
      <p>Kızıl Meydan, Hermitage Müzesi ve Çar'ın saraylarında tarihe yolculuk yapın. Kar manzaraları eşliğinde unutulmaz bir deneyim!</p>
    `,
    "images": generateTourImages("rusya-", 13)
  },
  
  "TUR-D-BREZILYA": {
    "title": "Brezilya - Rio Karnavalı ve Amazon",
    "price": "2.990 $",
    "duration": "10 Gün / 9 Gece",
    "location": "Rio de Janeiro, Manaus",
    "area": "Brezilya",
    "accommodation": "Lüks Lodge ve Oteller",
    "groupSize": "15-20 Kişi",
    "badge": "Egzotik",
    "description": `
      <p>Rio Karnavalı'nın coşkusu ve Amazon Yağmur Ormanları'nın doğal güzelliğiyle dolu macera!</p>
    `,
    "images": generateTourImages("brazil-", 15)
  },
  
  "TUR-D-AMERIKA": {
    "title": "ABD - New York & Batı Kıyısı",
    "price": "3.500 $",
    "duration": "14 Gün / 13 Gece",
    "location": "New York, Los Angeles, San Francisco",
    "area": "Amerika Birleşik Devletleri",
    "accommodation": "4 Yıldızlı Oteller",
    "groupSize": "20-25 Kişi",
    "badge": "Kapsamlı",
    "description": `
      <p>Amerika'nın iki kıyısını keşfedin! New York'tan Hollywood'a, Golden Gate'ten Özgürlük Heykeli'ne kadar...</p>
    `,
    "images": generateTourImages("new-york-", 9)
  }
};

// === HELPER FUNCTIONS ===
function generateTourImages(baseName, count) {
    const images = [];
    for (let i = 1; i <= count; i++) {
        images.push(`assets/${baseName}${i}.webp`);
    }
    return images;
}

// === TOUR DETAIL PAGE LOADER ===
function loadTourDetail(tourId) {
    const tour = TOUR_DATA[tourId];
    
    if (!tour) {
        console.error('Tour not found:', tourId);
        return;
    }

    // Set hero image
    document.getElementById('tourHeroImage').src = tour.images[0];
    document.getElementById('tourBadge').textContent = tour.badge || 'Tur';
    document.getElementById('tourTitle').textContent = tour.title;

    // Set meta info
    const meta = document.getElementById('tourMeta');
    meta.innerHTML = `
        <div class="tour-meta-item">
            <i class="fas fa-clock"></i>
            <span>${tour.duration}</span>
        </div>
        <div class="tour-meta-item">
            <i class="fas fa-map-marker-alt"></i>
            <span>${tour.location}</span>
        </div>
        <div class="tour-meta-item">
            <i class="fas fa-users"></i>
            <span>${tour.groupSize}</span>
        </div>
    `;

    // Set description
    document.getElementById('tourDescription').innerHTML = tour.description;

    // Set price
    document.getElementById('tourPrice').textContent = tour.price;

    // Set info list
    const infoList = document.getElementById('tourInfoList');
    infoList.innerHTML = `
        <li>
            <span class="tour-info-label">Süre</span>
            <span class="tour-info-value">${tour.duration}</span>
        </li>
        <li>
            <span class="tour-info-label">Lokasyon</span>
            <span class="tour-info-value">${tour.location}</span>
        </li>
        <li>
            <span class="tour-info-label">Konaklama</span>
            <span class="tour-info-value">${tour.accommodation}</span>
        </li>
        <li>
            <span class="tour-info-label">Grup Büyüklüğü</span>
            <span class="tour-info-value">${tour.groupSize}</span>
        </li>
    `;

    // Set gallery
    galleryImages = tour.images;
    const gallery = document.getElementById('tourGallery');
    gallery.innerHTML = tour.images.map((img, index) => `
        <div class="gallery-item" onclick="openLightbox(${index})">
            <img src="${img}" alt="${tour.title} - Görsel ${index + 1}" loading="lazy">
        </div>
    `).join('');

    // Set booking buttons
    const emailSubject = `Rezervasyon Talebi: ${tour.title}`;
    const emailBody = `Merhaba WalkAbout Travel,%0D%0A%0D%0A${tour.title} turu için rezervasyon yapmak istiyorum.%0D%0A%0D%0ASüre: ${tour.duration}%0D%0AFiyat: ${tour.price}%0D%0A%0D%0ALütfen bana detaylı bilgi gönderebilir misiniz?`;
    
    document.getElementById('emailBtn').href = `mailto:info@walkaboutravel.com?subject=${emailSubject}&body=${emailBody}`;
    
    const whatsappMsg = `Merhaba! *${tour.title}* turu hakkında bilgi almak istiyorum.%0A%0A📍 Lokasyon: ${tour.location}%0A⏰ Süre: ${tour.duration}%0A💰 Fiyat: ${tour.price}`;
    document.getElementById('whatsappBtn').href = `https://wa.me/5491135870045?text=${whatsappMsg}`;
}

// === EXPORT FOR GLOBAL ACCESS ===
if (typeof window !== 'undefined') {
    window.TOUR_DATA = TOUR_DATA;
    window.loadTourDetail = loadTourDetail;
}
