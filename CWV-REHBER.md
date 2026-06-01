# WalkAbout Travel — Core Web Vitals Optimizasyon Rehberi
## Aşama 4 · LCP · CLS · INP (eski: FID)

---

## Hangi metrik, ne anlama geliyor?

| Metrik | Hedef | Kötü | Ne ölçüyor? |
|--------|-------|------|-------------|
| **LCP** (Largest Contentful Paint) | ≤ 2.5 sn | > 4 sn | En büyük görünür içerik yüklenene kadar geçen süre |
| **CLS** (Cumulative Layout Shift) | ≤ 0.1 | > 0.25 | Sayfa yüklenirken öğelerin ne kadar kaydığı |
| **INP** (Interaction to Next Paint) | ≤ 200 ms | > 500 ms | Tıklama/dokunma sonrası görsel yanıt süresi |

---

## 1. LCP İyileştirmeleri (Hero Görseli Hızlandırma)

### 1a. Hero görselini `fetchpriority="high"` + `<link rel="preload">` ile öncele

```html
<!-- <head> içine ekle -->
<link rel="preload" as="image"
      href="/assets/tours/kappadokya-hero.jpg"
      fetchpriority="high">

<!-- HTML'deki img etiketi -->
<img src="/assets/tours/kappadokya-hero.jpg"
     alt="Kapadokya Balon Turu"
     width="1920" height="1080"
     fetchpriority="high"
     decoding="async">
```

**Etkisi:** Tarayıcı görseli diğer kaynaklardan önce ister. LCP ~0.5–1.2 sn iyileşebilir.

### 1b. Font Awesome'u render-blocking olmaktan çıkar

**Eski (render blocking):**
```html
<link rel="stylesheet" href="https://cdnjs.../font-awesome/6.4.0/css/all.min.css">
```

**Yeni (async — print trick):**
```html
<link rel="stylesheet"
      href="https://cdnjs.../font-awesome/6.4.0/css/all.min.css"
      media="print"
      onload="this.media='all'">
<noscript>
  <link rel="stylesheet" href="https://cdnjs.../font-awesome/6.4.0/css/all.min.css">
</noscript>
```

**Etkisi:** Font Awesome (~300 KB) artık kritik render yolunda değil. LCP ~0.3–0.6 sn iyileşir.

### 1c. Google Fonts'a preconnect ekle

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="dns-prefetch" href="https://cdnjs.cloudflare.com">
```

### 1d. Görsel formatı — WebP'e geç (sunucu taraflı)

```php
// PHP'de otomatik WebP sunumu
function bestImage(string $path): string {
    $webp = preg_replace('/\.(jpg|jpeg|png)$/i', '.webp', $path);
    $serverPath = __DIR__ . $webp;
    // WebP versiyonu varsa onu sun
    if (file_exists($serverPath)) return $webp;
    return $path;
}
```

cPanel'deki `cwebp` aracıyla dönüştürme:
```bash
# Toplu dönüştürme
find ./assets -name "*.jpg" -exec cwebp -q 82 {} -o {}.webp \;
```

**Etkisi:** Ortalama %25–35 daha küçük dosya → LCP doğrudan iyileşir.

---

## 2. CLS İyileştirmeleri (Sayfa Kaymasını Engelle)

### 2a. Tüm img etiketlerine width + height ekle (EN ÖNEMLİ)

Boyutsuz görsel: tarayıcı önce 0×0 yer ayırır, görsel gelince kaydırır = CLS.

```html
<!-- YANLIŞ -->
<img src="tour.jpg" alt="...">

<!-- DOĞRU -->
<img src="tour.jpg" alt="..." width="800" height="450">
```

CSS'te `object-fit:cover` ile orantı korunur, boyut bozulmaz.

### 2b. Hero bölümüne aspect-ratio ile yer rezerve et

```css
/* ESKI — görsel gelene kadar yükseklik bilinmiyor */
.tour-detail-hero { height: 65vh; }

/* YENİ — CSS'te yer önceden rezerve ediliyor */
.tour-detail-hero {
  aspect-ratio: 16 / 7;
  min-height: 400px;
  max-height: 65vh;
  background: #0c4a6e; /* görsel yüklenene kadar renk */
}
```

### 2c. Nav sabit yükseklik — breadcrumb margin-top eşleştir

```css
nav { min-height: 61px; } /* CLS: scroll sırasında nav yüksekliği değişmemeli */
.breadcrumb { margin-top: 61px; } /* nav'ın tam yüksekliğine eşit */
```

### 2d. Blog kart görselleri — aspect-ratio ile yer tut

```css
.blog-card-img-wrap {
  aspect-ratio: 16 / 9;
  background: #e2e8f0; /* placeholder */
  overflow: hidden;
}
.blog-card-img { width: 100%; height: 100%; object-fit: cover; }
```

### 2e. Harita iframe için sabit boyut

```css
.map-container { width: 100%; height: 400px; background: #f1f5f9; }
```

`loading="lazy"` ile de birleştir — sayfa dışındayken yüklenmesin.

### 2f. contain: layout ile accordion CLS'i engelle

Accordion/FAQ açılırken çevresindeki elementler kayabilir:

```css
.faq-item     { contain: layout; }
.itinerary-desc { contain: layout style; }
```

### 2g. Font display:swap (FOIT engellemek için)

```html
<link href="https://fonts.googleapis.com/css2?...&display=swap" rel="stylesheet">
```

`swap` → font yüklenene kadar sistem fontu gösterilir, yüklendikten sonra yer kaymıyorsa swap yapılır.

---

## 3. INP İyileştirmeleri (Dokunma / Tıklama Yanıt Hızı)

### 3a. JS'i body sonuna taşı + defer kullan

```html
<!-- YANLIŞ — <head>'de, render blocking -->
<script src="/app.js"></script>

<!-- DOĞRU — body sonunda, defer ile -->
<script src="/app.js" defer></script>
<script src="/i18n.js" defer></script>
```

### 3b. Event handler'larda requestAnimationFrame kullan

Accordion veya FAQ toggle sırasında DOM mutation'ları rAF içinde yap:

```js
function toggleFaq(btn) {
    const item = btn.closest('.faq-item');
    requestAnimationFrame(() => {
        item.classList.toggle('active');
        btn.setAttribute('aria-expanded',
            item.classList.contains('active') ? 'true' : 'false');
    });
}
```

### 3c. Dokunma hedeflerini büyüt (min 44×44 px)

```css
.menu-toggle     { min-width: 44px; min-height: 44px; }
.faq-question    { min-height: 64px; }
.btn             { min-height: 52px; }
.whatsapp-float  { width: 56px; height: 56px; }
```

### 3d. touch-action: manipulation — 300ms gecikmeyi kaldır

```css
.btn, .faq-question, .itinerary-day-title, .lang-dropdown-btn, .whatsapp-float {
  touch-action: manipulation;
}
```

Mobilde tarayıcı çift tıklama zoom'u beklemez → anında yanıt.

### 3e. CSS transition sürelerini kısalt

```css
/* ESKI */
.blog-card { transition: transform 0.3s, box-shadow 0.3s; }

/* YENİ — INP için daha kısa */
.blog-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
```

### 3f. localStorage yerine sessionStorage

`localStorage.setItem` senkron ve bazı cihazlarda yavaştır:

```js
// ESKI
localStorage.setItem('language', 'en');

// YENİ
sessionStorage.setItem('language', 'en');
```

---

## 4. Sunucu Taraflı Optimizasyonlar (.htaccess)

```apache
# ════ Gzip / Brotli sıkıştırma ════
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css application/javascript
  AddOutputFilterByType DEFLATE application/json image/svg+xml
</IfModule>

# ════ Browser caching ════
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpeg   "access plus 1 year"
  ExpiresByType image/webp   "access plus 1 year"
  ExpiresByType image/png    "access plus 1 year"
  ExpiresByType text/css     "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>

# ════ Cache-Control header ════
<FilesMatch "\.(jpg|jpeg|webp|png|gif|svg|css|js|woff2)$">
  Header set Cache-Control "public, max-age=31536000, immutable"
</FilesMatch>
```

---

## 5. PageSpeed Insights Kontrol Listesi

Bu değişiklikleri uyguladıktan sonra:

1. **https://pagespeed.web.dev** → sitenin URL'sini gir
2. Hem Mobil hem Masaüstü için analiz et
3. Hedef skorlar:

| Kriter | Önce (tahmini) | Sonra (hedef) |
|--------|---------------|---------------|
| Performance | 40–55 | 75–90 |
| LCP | 4–6 sn | < 2.5 sn |
| CLS | 0.2–0.4 | < 0.1 |
| INP | 300–600 ms | < 200 ms |

---

## 6. Hangi Dosya Neyi Değiştirdi — Özet

### `tour.php` değişiklikleri
- `<link rel="preload" as="image">` hero görseli için eklendi
- Font Awesome print trick ile async yükleniyor
- `preconnect` + `dns-prefetch` eklendi
- Hero img'e `width`, `height`, `fetchpriority="high"` eklendi
- `.tour-detail-hero` → `aspect-ratio: 16/7` ile CLS önlendi
- Logo img'e `width="40" height="40"` eklendi
- Tüm galeri img'lerine `width`, `height`, `loading="lazy/eager"` eklendi
- Map iframe'e `loading="lazy"` eklendi
- `contain: layout` accordion ve FAQ'a eklendi
- `min-height` nav ve breadcrumb'a eklendi
- `touch-action: manipulation` buton/FAQ/accordion'a eklendi
- `requestAnimationFrame` toggle fonksiyonlarına eklendi
- Tüm JS `defer` olarak yükleniyor
- `localStorage` → `sessionStorage` dönüştürüldü

### `blog.php` değişiklikleri
- Yukarıdakilerin tümü + blog kart görseli `aspect-ratio: 16/9` CLS fix
- İlk 3 kart `loading="eager"`, geri kalanlar `loading="lazy"`

---

## 7. Sonraki Adımlar (İsteğe Bağlı)

| Öncelik | İyileştirme | Etki |
|---------|-------------|------|
| ⭐⭐⭐ | Tüm görselleri WebP'e dönüştür | LCP –30% |
| ⭐⭐⭐ | CDN kullan (Cloudflare free tier) | LCP –20%, TTFB –50% |
| ⭐⭐ | Critical CSS inline et (above-the-fold) | LCP –10% |
| ⭐⭐ | tours.json'a imageWidth/imageHeight ekle | CLS tam çözüm |
| ⭐ | Service Worker + offline cache | Tekrar ziyaret LCP ≈ 0 |
