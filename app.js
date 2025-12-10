/* ================================================
   WALKABOUT TRAVEL - TOUR DATA & FUNCTIONALITY
   ================================================ */

// Tour Data Object
const TOUR_DATA = {
    "TUR-TR-MARDIN": {
        "title": "Mardin - Tarihi Konaklar & Kültür Turu",
        "price": "8.900 TL",
        "duration": "5 Gün / 4 Gece",
        "location": "Mardin ve Çevresi",
        "area": "Güneydoğu Anadolu",
        "category": "Kültür",
        "image": "assets/mardin-tarihi-konak-dokusu-1.webp",
        "description": `
            <p>Mezopotamya'nın kalbinde, binlerce yıllık medeniyetlerin izlerini taşıyan Mardin'de unutulmaz bir kültür yolculuğu sizi bekliyor.</p>
            
            <h3>Tur Programı</h3>
            <p><strong>1. Gün:</strong> İstanbul'dan Mardin'e uçuş. Havalimanı karşılama ve otele transfer. Serbest zaman ve akşam yemeği.</p>
            
            <p><strong>2. Gün:</strong> Mardin şehir turu. Ulu Cami, Zinciriye Medresesi, Kasımiye Medresesi ziyareti. Taş konakların mimarisini keşfetme. Panoramik şehir manzarası.</p>
            
            <p><strong>3. Gün:</strong> Dara Antik Kenti gezisi. Deyrulzafaran Manastırı ziyareti. Yerel lezzetler ve Mardin mutfağı workshop'u.</p>
            
            <p><strong>4. Gün:</strong> Midyat gezisi. Mor Gabriel Manastırı. Gümüş ve telkari atölyeleri. Serbest zaman.</p>
            
            <p><strong>5. Gün:</strong> Kahvaltı sonrası serbest zaman. Havalimanına transfer ve İstanbul'a dönüş.</p>
            
            <div class="tour-highlights">
                <h4><i class="fas fa-star"></i> Tur Özellikleri</h4>
                <ul>
                    <li><i class="fas fa-check-circle"></i> Profesyonel Türkçe rehber eşliği</li>
                    <li><i class="fas fa-check-circle"></i> Butik taş konak otelde 4 gece konaklama</li>
                    <li><i class="fas fa-check-circle"></i> Sabah kahvaltıları ve 4 akşam yemeği dahil</li>
                    <li><i class="fas fa-check-circle"></i> Tüm müze ve giriş ücretleri dahil</li>
                    <li><i class="fas fa-check-circle"></i> Klimali lüks araç ile transferler</li>
                    <li><i class="fas fa-check-circle"></i> Seyahat sigortası</li>
                </ul>
            </div>
        `,
        "images": [
            "assets/mardin-tarihi-konak-dokusu-1.webp",
            "assets/mardin-tarihi-konak-dokusu-2.webp",
            "assets/mardin-tarihi-konak-dokusu-3.webp",
            "assets/mardin-tarihi-konak-dokusu-4.webp",
            "assets/mardin-tarihi-konak-dokusu-5.webp",
            "assets/mardin-tarihi-konak-dokusu-6.webp"
        ]
    },
    
    "TUR-TR-ANTALYA": {
        "title": "Antalya - Köy Gezisi & Tarihi Kaleiçi",
        "price": "12.500 TL",
        "duration": "7 Gün / 6 Gece",
        "location": "Antalya, Kaş, Kemer",
        "area": "Akdeniz Bölgesi",
        "category": "Deniz",
        "image": "assets/antalya-koy-gezisi-1.webp",
        "description": `
            <p>Akdeniz'in turkuaz sularında eşsiz koyları keşfedin. Kaş ve Kalkan'ın büyülü atmosferinde tarihi Kaleiçi'nin dar sokaklarında kaybolun.</p>
            
            <h3>Tur Programı</h3>
            <p><strong>1. Gün:</strong> Antalya'ya varış, otele yerleşme ve Kaleiçi gezisi.</p>
            <p><strong>2-3. Gün:</strong> Kaş tekne turu, Kekova batık şehir, Simena Kalesi.</p>
            <p><strong>4. Gün:</strong> Kalkan köyü ve plaj günü.</p>
            <p><strong>5. Gün:</strong> Aspendos Antik Tiyatrosu ve Side gezisi.</p>
            <p><strong>6. Gün:</strong> Kemer ve Phaselis Antik Kenti.</p>
            <p><strong>7. Gün:</strong> Serbest zaman ve dönüş.</p>
            
            <div class="tour-highlights">
                <h4><i class="fas fa-star"></i> Tur Özellikleri</h4>
                <ul>
                    <li><i class="fas fa-check-circle"></i> Her Şey Dahil 5 yıldız otel</li>
                    <li><i class="fas fa-check-circle"></i> Özel tekne turları</li>
                    <li><i class="fas fa-check-circle"></i> Tüm transferler ve giriş ücretleri</li>
                    <li><i class="fas fa-check-circle"></i> Rehber eşliğinde kültür turları</li>
                </ul>
            </div>
        `,
        "images": ["assets/antalya-koy-gezisi-1.webp"]
    },
    
    "TUR-TR-KAPADOKYA": {
        "title": "Kapadokya - Balon ve Peribacaları Turu",
        "price": "9.800 TL",
        "duration": "4 Gün / 3 Gece",
        "location": "Göreme, Uçhisar, Avanos",
        "area": "İç Anadolu",
        "category": "Popüler",
        "image": "assets/kapadokya-balon-turu-1.webp",
        "description": `
            <p>Dünyanın en büyülü doğal oluşumları arasında yer alan Kapadokya vadilerinde gün doğumu balon turu deneyimi.</p>
            
            <h3>Tur Programı</h3>
            <p><strong>1. Gün:</strong> Kayseri/Nevşehir havalimanı karşılama, mağara otele yerleşme.</p>
            <p><strong>2. Gün:</strong> Gün doğumu balon turu (opsiyonel), Göreme Açık Hava Müzesi, Paşabağ Vadisi.</p>
            <p><strong>3. Gün:</strong> Derinkuyu yer altı şehri, Ihlara Vadisi yürüyüşü, Avanos çömlek atölyesi.</p>
            <p><strong>4. Gün:</strong> Uçhisar Kalesi, serbest zaman ve dönüş.</p>
            
            <div class="tour-highlights">
                <h4><i class="fas fa-star"></i> Tur Özellikleri</h4>
                <ul>
                    <li><i class="fas fa-check-circle"></i> Mağara otelde 3 gece konaklama</li>
                    <li><i class="fas fa-check-circle"></i> Balon turu fiyat avantajı</li>
                    <li><i class="fas fa-check-circle"></i> Tüm müze girişleri dahil</li>
                    <li><i class="fas fa-check-circle"></i> Öğle yemekleri dahil</li>
                </ul>
            </div>
        `,
        "images": [
            "assets/kapadokya-balon-turu-1.webp",
            "assets/kapadokya-balon-turu-2.webp",
            "assets/kapadokya-balon-turu-3.webp"
        ]
    },
    
    "TUR-TR-FETHIYE": {
        "title": "Fethiye - Yamaç Paraşütü & Ölüdeniz",
        "price": "6.750 TL",
        "duration": "3 Gün / 2 Gece",
        "location": "Ölüdeniz, Kelebekler Vadisi",
        "area": "Ege Bölgesi",
        "category": "Macera",
        "image": "assets/fethiye-oludeniz-manzarasi-14.webp",
        "description": `
            <p>Babadağ'dan 1960 metre yükseklikten Ölüdeniz'in turkuaz sularına doğru yamaç paraşütü heyecanı.</p>
            
            <h3>Tur Programı</h3>
            <p><strong>1. Gün:</strong> Fethiye varış, otele yerleşme, Ölüdeniz plajı.</p>
            <p><strong>2. Gün:</strong> Babadağ yamaç paraşütü, Kelebekler Vadisi tekne turu.</p>
            <p><strong>3. Gün:</strong> Likya Yolu yürüyüşü ve dönüş.</p>
            
            <div class="tour-highlights">
                <h4><i class="fas fa-star"></i> Tur Özellikleri</h4>
                <ul>
                    <li><i class="fas fa-check-circle"></i> Yamaç paraşütü dahil (tandem uçuş)</li>
                    <li><i class="fas fa-check-circle"></i> Butik otel konaklama</li>
                    <li><i class="fas fa-check-circle"></i> Tekne turu ve rehber</li>
                </ul>
            </div>
        `,
        "images": ["assets/fethiye-oludeniz-manzarasi-14.webp"]
    },
    
    "TUR-TR-PAMUKKALE": {
        "title": "Pamukkale - Travertenler & Antik Kent",
        "price": "4.500 TL",
        "duration": "2 Gün / 1 Gece",
        "location": "Pamukkale, Hierapolis",
        "area": "Denizli",
        "category": "Doğa",
        "image": "assets/pamukkale-traverten-dogal-1.webp",
        "description": `
            <p>Pamukkale'nin bembeyaz traverten teraslarında yürüyüş ve Hierapolis Antik Kenti keşfi.</p>
            
            <h3>Tur Programı</h3>
            <p><strong>1. Gün:</strong> Denizli havalimanı karşılama, Pamukkale gezisi, termal otel.</p>
            <p><strong>2. Gün:</strong> Hierapolis Antik Kenti, Kleopatra Havuzu ve dönüş.</p>
            
            <div class="tour-highlights">
                <h4><i class="fas fa-star"></i> Tur Özellikleri</h4>
                <ul>
                    <li><i class="fas fa-check-circle"></i> Termal otelde konaklama</li>
                    <li><i class="fas fa-check-circle"></i> Tüm girişler dahil</li>
                    <li><i class="fas fa-check-circle"></i> Öğle yemeği dahil</li>
                </ul>
            </div>
        `,
        "images": ["assets/pamukkale-traverten-dogal-1.webp"]
    },
    
    "TUR-D-ISPANYA": {
        "title": "İspanya - Barselona & Endülüs Rüyası",
        "price": "1.800 €",
        "duration": "9 Gün / 8 Gece",
        "location": "Barselona, Granada, Sevilla",
        "area": "İspanya",
        "category": "Premium",
        "image": "assets/spain-1.webp",
        "description": `
            <p>Gaudi'nin mimari şaheserlerinden Endülüs'ün büyülü El Hamra Sarayı'na muhteşem bir İspanya turu.</p>
            
            <h3>Tur Programı</h3>
            <p><strong>1-3. Gün:</strong> Barselona - Sagrada Familia, Park Güell, Gotik Mahalle.</p>
            <p><strong>4-5. Gün:</strong> Granada - El Hamra Sarayı, Albaicín Mahallesi.</p>
            <p><strong>6-7. Gün:</strong> Sevilla - Alcázar Sarayı, Giralda Kulesi, flamenko gösterisi.</p>
            <p><strong>8-9. Gün:</strong> Madrid ve dönüş.</p>
            
            <div class="tour-highlights">
                <h4><i class="fas fa-star"></i> Tur Özellikleri</h4>
                <ul>
                    <li><i class="fas fa-check-circle"></i> 4 yıldız otel konaklamaları</li>
                    <li><i class="fas fa-check-circle"></i> Sabah kahvaltıları dahil</li>
                    <li><i class="fas fa-check-circle"></i> Flamenko gösterisi biletleri</li>
                    <li><i class="fas fa-check-circle"></i> Tüm müze girişleri</li>
                </ul>
            </div>
        `,
        "images": ["assets/spain-1.webp"]
    },
    
    "TUR-D-RUSYA-KIS": {
        "title": "Rusya - Kış Masalı",
        "price": "1.450 €",
        "duration": "6 Gün / 5 Gece",
        "location": "Moskova, St. Petersburg",
        "area": "Rusya Federasyonu",
        "category": "Kış",
        "image": "assets/rusya-1.webp",
        "description": `
            <p>Kızıl Meydan'dan Hermitage Müzesi'ne, Çar'ların ihtişamlı dünyasına yolculuk.</p>
            
            <h3>Tur Programı</h3>
            <p><strong>1-3. Gün:</strong> Moskova - Kızıl Meydan, Kremlin, Bolşoy Tiyatrosu.</p>
            <p><strong>4-6. Gün:</strong> St. Petersburg - Hermitage, Peterhof Sarayı, Katerina Sarayı.</p>
            
            <div class="tour-highlights">
                <h4><i class="fas fa-star"></i> Tur Özellikleri</h4>
                <ul>
                    <li><i class="fas fa-check-circle"></i> 5 yıldız otel konaklamaları</li>
                    <li><i class="fas fa-check-circle"></i> Rus sanat ve kültür odaklı</li>
                    <li><i class="fas fa-check-circle"></i> Hızlı tren transferi</li>
                </ul>
            </div>
        `,
        "images": ["assets/rusya-1.webp"]
    },
    
    "TUR-D-BREZILYA": {
        "title": "Brezilya - Rio Karnavalı ve Amazon",
        "price": "2.990 $",
        "duration": "10 Gün / 9 Gece",
        "location": "Rio de Janeiro, Manaus",
        "area": "Brezilya",
        "category": "Festival",
        "image": "assets/brazil-1.webp",
        "description": `
            <p>Rio Karnavalı'nın coşkusu ve Amazon Ormanları'nın gizemli dünyası bir arada.</p>
            
            <h3>Tur Programı</h3>
            <p><strong>1-5. Gün:</strong> Rio de Janeiro - Karnaval, Corcovado, Şeker Kafa Dağı.</p>
            <p><strong>6-10. Gün:</strong> Manaus - Amazon cruise, yağmur ormanı trekking.</p>
            
            <div class="tour-highlights">
                <h4><i class="fas fa-star"></i> Tur Özellikleri</h4>
                <ul>
                    <li><i class="fas fa-check-circle"></i> Karnaval özel tribün biletleri</li>
                    <li><i class="fas fa-check-circle"></i> Amazon lodge konaklaması</li>
                    <li><i class="fas fa-check-circle"></i> Rehberli jungle tours</li>
                </ul>
            </div>
        `,
        "images": ["assets/brazil-1.webp"]
    },
    
    "TUR-D-AMERIKA": {
        "title": "ABD - New York & Batı Kıyısı",
        "price": "3.500 $",
        "duration": "14 Gün / 13 Gece",
        "location": "New York, Los Angeles, San Francisco",
        "area": "Amerika Birleşik Devletleri",
        "category": "Metropol",
        "image": "assets/new-york-1.webp",
        "description": `
            <p>Amerika'nın en ikonik şehirlerini kapsayan kapsamlı bir keşif turu.</p>
            
            <h3>Tur Programı</h3>
            <p><strong>1-5. Gün:</strong> New York - Manhattan, Brooklyn, Özgürlük Heykeli.</p>
            <p><strong>6-10. Gün:</strong> Los Angeles - Hollywood, Santa Monica, Universal Studios.</p>
            <p><strong>11-14. Gün:</strong> San Francisco - Golden Gate, Alcatraz, Napa Vadisi.</p>
            
            <div class="tour-highlights">
                <h4><i class="fas fa-star"></i> Tur Özellikleri</h4>
                <ul>
                    <li><i class="fas fa-check-circle"></i> 4 yıldız merkezi oteller</li>
                    <li><i class="fas fa-check-circle"></i> İç hat uçuşlar dahil</li>
                    <li><i class="fas fa-check-circle"></i> Tüm şehir turları rehberli</li>
                </ul>
            </div>
        `,
        "images": ["assets/new-york-1.webp"]
    }
};

// Load Tour Detail Function
function loadTourDetail(tourId) {
    const tour = TOUR_DATA[tourId];
    
    if (!tour) {
        console.error('Tour not found:', tourId);
        return;
    }
    
    // Update hero section
    document.getElementById('tourHeroImage').src = tour.image;
    document.getElementById('tourBadge').textContent = tour.category;
    document.getElementById('tourTitle').textContent = tour.title;
    
    // Update meta info
    document.getElementById('tourMeta').innerHTML = `
        <div class="tour-meta-item">
            <i class="fas fa-clock"></i>
            <span>${tour.duration}</span>
        </div>
        <div class="tour-meta-item">
            <i class="fas fa-map-marker-alt"></i>
            <span>${tour.location}</span>
        </div>
        <div class="tour-meta-item">
            <i class="fas fa-tag"></i>
            <span>${tour.price}</span>
        </div>
    `;
    
    // Update description
    document.getElementById('tourDescription').innerHTML = tour.description;
    
    // Update price
    document.getElementById('tourPrice').textContent = tour.price;
    
    // Update info list
    document.getElementById('tourInfoList').innerHTML = `
        <li>
            <span class="tour-info-label">Süre</span>
            <span class="tour-info-value">${tour.duration}</span>
        </li>
        <li>
            <span class="tour-info-label">Lokasyon</span>
            <span class="tour-info-value">${tour.location}</span>
        </li>
        <li>
            <span class="tour-info-label">Bölge</span>
            <span class="tour-info-value">${tour.area}</span>
        </li>
        <li>
            <span class="tour-info-label">Kategori</span>
            <span class="tour-info-value">${tour.category}</span>
        </li>
    `;
    
    // Update gallery
    galleryImages = tour.images || [tour.image];
    const galleryHtml = galleryImages.map((img, index) => `
        <div class="gallery-item" onclick="openLightbox(${index})">
            <img src="${img}" alt="${tour.title}" onerror="this.src='https://placehold.co/400x300/0ea5e9/FFF?text=Tour'">
        </div>
    `).join('');
    document.getElementById('tourGallery').innerHTML = galleryHtml;
    
    // Update booking buttons
    const emailSubject = encodeURIComponent(`${tour.title} Hakkında Bilgi`);
    const emailBody = encodeURIComponent(`Merhaba,\n\n${tour.title} (${tour.price}) hakkında detaylı bilgi almak istiyorum.\n\nTeşekkürler.`);
    document.getElementById('emailBtn').href = `mailto:info@walkaboutravel.com?subject=${emailSubject}&body=${emailBody}`;
    
    const whatsappText = encodeURIComponent(`Merhaba! ${tour.title} hakkında bilgi almak istiyorum.`);
    document.getElementById('whatsappBtn').href = `https://wa.me/5491135870045?text=${whatsappText}`;
    
    // Update page title
    document.title = `${tour.title} - WalkAbout Travel`;
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TOUR_DATA, loadTourDetail };
}
