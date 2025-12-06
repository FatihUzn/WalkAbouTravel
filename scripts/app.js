// === YARDIMCI FONKSİYONLAR ===
function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
}

// === OTOMATİK RESİM LİSTESİ OLUŞTURUCU (✅ FIXED) ===
function generateImages(baseName, count) {
    const images = [];
    for (let i = 1; i <= count; i++) {
        // ✅ FIXED: Added /images/ to path
        images.push(`assets/images/${baseName}${i}.webp`);
    }
    return images;
}

// === GLOBAL DEĞİŞKENLER ===
const translations = {}; 
const pageCache = {}; 
let globalPropertyImages = [];
let globalImageIndex = 0;
const IMAGES_PER_LOAD = 6; 

// Lightbox State
let currentGalleryImages = [];
let currentLightboxIndex = 0;

// === TURİZM VERİ TABANI (✅ FIXED FILENAMES) ===
const TOUR_DATA = {
  
  // --- YURT İÇİ ---
  "TUR-TR-MARDIN": {
    "title": "Mardin - Tarihi Konaklar & Kültür Turu",
    "price": "5 Gün / 4 Gece, 8.900 TL",
    "location": "Mardin ve Çevresi",
    "area": "Güneydoğu Anadolu",
    "rooms": "Özel Butik Otel",
    "desc": "Binlerce yıllık medeniyetin izlerini taşıyan Mardin'de taş konakları, tarihi kiliseleri ve Dara Antik Kenti'ni keşfedin. Yemekler ve yerel rehberlik dahildir.",
    // ✅ FIXED: Removed spaces and typos
    "images": generateImages("mardin-tarihi-konak-dokusu-", 16) 
  },
  "TUR-TR-ANTALYA": {
    "title": "Antalya - Koy Gezisi & Tarihi Kaleiçi",
    "price": "7 Gün / 6 Gece, 12.500 TL",
    "location": "Antalya, Kaş, Kemer",
    "area": "Akdeniz Bölgesi",
    "rooms": "Her şey Dahil Otel",
    "desc": "Akdeniz'in turkuaz sularında Kaş ve Kalkan koylarını keşfedin. Tarihi Kaleiçi'nin dar sokaklarında keyifli bir mola ve Aspendos Antik Tiyatrosu ziyareti.",
    // ✅ FIXED: Corrected filename
    "images": generateImages("antalya-koy-gezisi-", 17)
  },
  "TUR-TR-KAPADOKYA": {
    "title": "Kapadokya - Balon ve Peribacaları Turu",
    "price": "4 Gün / 3 Gece, 9.800 TL",
    "location": "Göreme, Uçhisar, Avanos",
    "area": "İç Anadolu",
    "rooms": "Mağara Otel Konaklama",
    "desc": "Eşsiz Kapadokya vadilerinde gün doğumu balon turu deneyimi. Yer altı şehirleri, kiliseler ve çömlek atölyeleri gezisi. Tüm transferler dahil.",
    "images": generateImages("kapadokya-balon-turu-", 20)
  },
  "TUR-TR-FETHIYE": {
    "title": "Fethiye - Yamaç Paraşütü & Ölüdeniz",
    "price": "3 Gün / 2 Gece, 6.750 TL",
    "location": "Ölüdeniz, Kelebekler Vadisi",
    "area": "Ege Bölgesi",
    "rooms": "Butik Pansiyon",
    "desc": "Ölüdeniz'in eşsiz manzarasında Babadağ'dan yamaç paraşütü heyecanı. Kelebekler Vadisi tekne turu ve Likya Yolu yürüyüşü.",
    "images": generateImages("fethiye-oludeniz-manzarasi-", 19)
  },
  "TUR-TR-PAMUKKALE": {
    "title": "Pamukkale - Travertenler & Antik Kent",
    "price": "2 Gün / 1 Gece, 4.500 TL",
    "location": "Pamukkale, Hierapolis",
    "area": "Denizli",
    "rooms": "Termal Otel",
    "desc": "Pamukkale'nin bembeyaz traverten teraslarında yürüyüş. Hierapolis Antik Kenti ve Kleopatra Havuzu ziyareti.",
    // ✅ FIXED: Corrected spelling
    "images": generateImages("pamukkale-traverten-dogal-", 11)
  },

  // --- YURT DIŞI ---
  "TUR-D-ISPANYA": {
    "title": "İspanya - Barselona & Endülüs Rüyası",
    "price": "9 Gün / 8 Gece, 1.800 €",
    "location": "Barselona, Granada, Sevilla",
    "area": "İspanya",
    "rooms": "4 Yıldızlı Oteller",
    "desc": "Gaudi'nin eserleri Sagrada Familia'yı ve Endülüs'ün büyülü El Hamra Sarayı'nı ziyaret edin. Flamenko gösterisi dahildir.",
    "images": generateImages("spain-", 15)
  },
  // ✅ FIXED: Added -KIS to match HTML reference
  "TUR-D-RUSYA-KIS": {
    "title": "Rusya (Kış Masalı)",
    "price": "6 Gün / 5 Gece, 1.450 €",
    "location": "Moskova, St. Petersburg",
    "area": "Rusya Federasyonu",
    "rooms": "5 Yıldızlı Oteller",
    "desc": "Kızıl Meydan, Hermitage Müzesi ve Çar'ın yazlık sarayları. Rus Sanat ve tarihine odaklı özel tur.",
    "images": generateImages("rusya-", 13)
  },
  "TUR-D-BREZILYA": {
    "title": "Brezilya - Rio Karnavalı ve Amazon",
    "price": "10 Gün / 9 Gece, 2.990 $",
    "location": "Rio de Janeiro, Manaus",
    "area": "Brezilya",
    "rooms": "Lüks Lodge ve Oteller",
    "desc": "Rio'da Corcovado Dağı, Ipanema Plajı ve Sambadrome. Amazon Yağmur Ormanları'nda rehberli doğa gezisi.",
    "images": generateImages("brazil-", 15)
  },
  "TUR-D-AMERIKA": {
    "title": "ABD - New York & Batı Kıyısı",
    "price": "14 Gün / 13 Gece, 3.500 $",
    "location": "New York, Los Angeles, San Francisco",
    "area": "Amerika Birleşik Devletleri",
    "rooms": "4 Yıldızlı Oteller",
    "desc": "New York'ta Özgürlük Heykeli, LA'de Hollywood ve San Francisco'da Golden Gate Köprüsü. Tamamen rehberli büyük tur.",
    "images": generateImages("new-york-", 9)
  }
};

// REST OF THE FILE CONTINUES AS BEFORE...
// (Include the rest of your app.js here - I'm showing just the critical fixes)

console.log('✅ App.js loaded with corrected paths');
console.log('Tour data:', Object.keys(TOUR_DATA).length, 'tours');