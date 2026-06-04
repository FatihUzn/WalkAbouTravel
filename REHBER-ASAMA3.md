# Aşama 3 — Veri Yapısı Rehberi

## 1. tours.json — FAQ Alanları

Her tur nesnesine aşağıdaki alanları ekleyin:

```json
{
  "title": "Kapadokya Balon Turu",
  "slug_tr": "kapadokya-balon-turu",
  "slug_en": "cappadocia-balloon-tour",

  // Türkçe FAQ (faq)
  "faq": [
    {
      "q": "Kapadokya balon turu ne kadar sürer?",
      "a": "Tur yaklaşık 1 saat havada geçer. Transfer ve hazırlık süresiyle birlikte toplam 3-4 saat ayırmanız önerilir."
    },
    {
      "q": "Balon turu minimum kaç kişiyle yapılır?",
      "a": "Balonlar genellikle 8-20 kişi kapasitelidir. Bireysel rezervasyon yapabilirsiniz."
    },
    {
      "q": "İptal politikası nedir?",
      "a": "Hava koşulları nedeniyle iptal durumunda tam iade yapılır. Kişisel iptallerde 48 saat öncesine kadar %100 iade sağlanır."
    }
  ],

  // İngilizce FAQ (faq_en)
  "faq_en": [
    {
      "q": "How long does the Cappadocia balloon tour last?",
      "a": "The flight itself lasts approximately 1 hour. Including transfers and preparation, allow 3-4 hours total."
    },
    {
      "q": "What is the minimum group size?",
      "a": "Balloons typically carry 8-20 passengers. You can book as an individual."
    },
    {
      "q": "What is the cancellation policy?",
      "a": "Full refund for weather cancellations. Personal cancellations receive 100% refund if made 48+ hours in advance."
    }
  ],

  // Diğer diller: faq_es, faq_ar, faq_pt (aynı yapı)
  "faq_es": [...],
  "faq_ar": [...],
  "faq_pt": [...]
}
```

---

## 2. data/blog-posts.json — Yapı

```json
[
  {
    "slug": "kapadokya-gezi-rehberi",
    "published": true,
    "date": "2025-06-10",
    "dateModified": "2025-06-15",
    "readTime": "8",
    "author": "WalkAbout Travel",
    "image": "/assets/blog/kapadokya-cover.jpg",

    // Kategori (dil bazlı)
    "category": "Gezi Rehberi",
    "category_en": "Travel Guide",
    "category_es": "Guía de Viaje",
    "category_ar": "دليل السفر",
    "category_pt": "Guia de Viagem",

    // Başlık
    "title": "Kapadokya Gezi Rehberi: Bilmeniz Gereken Her Şey",
    "title_en": "Cappadocia Travel Guide: Everything You Need to Know",
    "title_es": "Guía de Viaje a Capadocia: Todo lo que Necesitas Saber",
    "title_ar": "دليل السفر إلى كابادوكيا: كل ما تحتاج معرفته",
    "title_pt": "Guia de Viagem à Capadócia: Tudo o que Você Precisa Saber",

    // Özet (meta description için ~155 karakter)
    "excerpt": "Kapadokya'nın peri bacaları, yer altı şehirleri ve balon turları hakkında kapsamlı rehber.",
    "excerpt_en": "A comprehensive guide to Cappadocia's fairy chimneys, underground cities and balloon tours.",

    // İçerik (HTML destekler)
    "content": "<h2>Neden Kapadokya?</h2><p>Kapadokya...</p>",
    "content_en": "<h2>Why Cappadocia?</h2><p>Cappadocia...</p>",

    // Etiketler (tur tag'leriyle eşleşince "İlgili Turlar" bölümü otomatik çıkar)
    "tags": ["kapadokya", "balon", "türkiye"],

    // Blog yazısına özel FAQ (opsiyonel)
    "faq": [
      {
        "q": "Kapadokya'ya en iyi ne zaman gidilir?",
        "a": "İlkbahar (Nisan-Mayıs) ve sonbahar (Eylül-Ekim) en ideal dönemlerdir."
      }
    ],
    "faq_en": [
      {
        "q": "When is the best time to visit Cappadocia?",
        "a": "Spring (April-May) and autumn (September-October) are ideal."
      }
    ]
  }
]
```

---

## 3. .htaccess URL Şeması

| URL | Açıklama |
|-----|----------|
| `/blog/` | Türkçe blog listesi |
| `/en/blog/` | İngilizce blog listesi |
| `/blog/kapadokya-gezi-rehberi/` | Türkçe yazı |
| `/en/blog/cappadocia-travel-guide/` | İngilizce yazı |

> **Not:** Blog yazılarında farklı dil slug'ları desteklenmez (slug tüm dillerde aynıdır). Gerekirse ileride `slug_en`, `slug_tr` alanları eklenebilir.

---

## 4. Google'ın Göreceği Schema'lar

### Tur sayfaları (`tour.php`)
- `TouristTrip` — fiyat, süre, sağlayıcı, puan
- `FAQPage` — her soru/cevap için `Question` + `Answer` (varsa)

### Blog yazısı (`blog-post.php`)
- `BlogPosting` — başlık, yazar, tarih, görsel, yayıncı
- `BreadcrumbList` — Ana Sayfa › Blog › Yazı Başlığı
- `FAQPage` — varsa

### Blog listesi (`blog.php`)
- `BreadcrumbList` — Ana Sayfa › Blog






























