<?php
// ============================================================
//  tour.php — WalkAbout Travel SEO Tur Detay Sayfası
//  ✅ Core Web Vitals Optimized (LCP · CLS · INP)
//     v2 — 2025-06
// ============================================================

// SITE_URL: otomatik tespit — hangi domain'de çalışıyorsa o kullanılır
$_protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$_host     = $_SERVER['HTTP_HOST'] ?? 'localhost';
define('SITE_URL',  $_protocol . '://' . $_host);
define('SITE_NAME', 'WalkAbout Travel');

$LANG_PREFIXES = ['tr'=>'','en'=>'/en','es'=>'/es','ar'=>'/ar','pt'=>'/pt'];
$LANG_NAMES    = ['tr'=>'Türkçe','en'=>'English','es'=>'Español','ar'=>'العربية','pt'=>'Português'];

$uri = rtrim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/');
$currentLang = 'tr';
$slug = '';
foreach (['en','es','ar','pt'] as $lc) {
    if (str_starts_with($uri, '/'.$lc.'/')) {
        $currentLang = $lc;
        $slug = substr($uri, strlen('/'.$lc.'/'));
        break;
    }
}
if ($currentLang === 'tr') $slug = ltrim($uri, '/');

// --- Tours JSON — PHP serialize cache (685KB JSON'u her seferinde parse etme) ---
function loadToursCached(): array {
    $jsonFile  = __DIR__ . '/data/tours.json';
    $cacheFile = __DIR__ . '/data/tours.cache.php';

    // Cache geçerliyse direkt oku
    if (file_exists($cacheFile) && filemtime($cacheFile) >= filemtime($jsonFile)) {
        return unserialize(file_get_contents($cacheFile));
    }

    // Cache yok veya JSON daha yeni → yeniden oluştur
    $tours = json_decode(file_get_contents($jsonFile), true) ?? [];
    file_put_contents($cacheFile, serialize($tours), LOCK_EX);
    return $tours;
}
$tours = loadToursCached();

// Görsel path'i absolute yap — /assets/... formatında olmalı
// tours.json'da "assets/foto.webp" → "/assets/foto.webp"
function absPath(string $path): string {
    if (empty($path))                    return '';
    if (str_starts_with($path, 'http'))  return $path;  // zaten URL
    if (str_starts_with($path, '/'))     return $path;  // zaten absolute
    return '/' . $path;                                 // relative → absolute
}

function makeSlug(string $t): string {
    // 1. Türkçe karakterleri manuel olarak değiştir (iconv bazen Türkçede sorun yapabiliyor)
    $tr = ['ş','ğ','ü','ö','ı','ç','Ş','Ğ','Ü','Ö','İ','Ç'];
    $en = ['s','g','u','o','i','c','s','g','u','o','i','c'];
    $t = str_replace($tr, $en, $t);
    
    // 2. İspanyolca, Portekizce vb. tüm vurgulu harfleri (á, é, ñ, ã) ASCII karakterlere (a, e, n, a) çevir
    $t = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $t);
    
    // 3. Küçük harfe çevir, sadece harf ve rakamları bırak, boşlukları tireye çevir
    return strtolower(preg_replace('/[\s-]+/', '-', trim(preg_replace('/[^a-zA-Z0-9\s-]/', '', $t))));
}
function tourSlug(array $tour, string $lang): string {
    if (!empty($tour['slug_'.$lang])) return $tour['slug_'.$lang];
    if (!empty($tour['slug']))        return $tour['slug'];
    $f = $lang==='tr' ? 'title' : 'title_'.$lang;
    return makeSlug($tour[$f] ?? $tour['title_en'] ?? $tour['title'] ?? '');
}
function getLangField(array $obj, string $field, string $lang) {
    if (isset($obj[$field]) && is_array($obj[$field]) && !array_is_list($obj[$field]))
        return $obj[$field][$lang] ?? $obj[$field]['en'] ?? $obj[$field]['tr'] ?? '';
    if ($lang!=='tr') {
        if (isset($obj[$field.'_'.$lang])) return $obj[$field.'_'.$lang];
        if (isset($obj[$field.'_en']))     return $obj[$field.'_en'];
    }
    return $obj[$field] ?? '';
}

// ── İtinerary günü içindeki dil alanını oku ─────────────────────────────────
// Gün nesnesi: { title, title_en, description, description_en, ... }
// getLangField ile aynı mantık ama liste değil tekil string döndürür
function getDayField(array $day, string $field, string $lang): string {
    if ($lang !== 'tr') {
        // Önce tam dil: title_en, title_es, title_ar, title_pt
        if (!empty($day[$field.'_'.$lang])) return $day[$field.'_'.$lang];
        // Yoksa EN'e düş
        if (!empty($day[$field.'_en']))     return $day[$field.'_en'];
    }
    // TR veya fallback
    return $day[$field] ?? '';
}

// ── Highlights listesini dile göre oku ───────────────────────────────────────
// highlights_en, highlights_es gibi ayrı listeler VEYA highlights (TR base)
function getHighlights(array $tour, string $lang): array {
    if ($lang !== 'tr') {
        if (!empty($tour['highlights_'.$lang]) && is_array($tour['highlights_'.$lang]))
            return $tour['highlights_'.$lang];
        if (!empty($tour['highlights_en']) && is_array($tour['highlights_en']))
            return $tour['highlights_en'];
    }
    return $tour['highlights'] ?? [];
}

$tour = null;
foreach ($tours as $t) {
    if (tourSlug($t, $currentLang) === $slug) { $tour = $t; break; }
}
// Fallback: eski/yanlış EN slug ile gelindi ise (örn. .com.tr/turkish-getaway-fast-yet-deep/)
if (!$tour && $currentLang === 'tr') {
    foreach ($tours as $t) {
        if (!empty($t['slug_en']) && $t['slug_en'] === $slug) { $tour = $t; break; }
    }
}
if (!$tour) { http_response_code(404); die('<h1>404 - Tour not found</h1><a href="/">← Home</a>'); }

$title       = getLangField($tour,'title',$currentLang);
$description = getLangField($tour,'description',$currentLang);
$shortDesc   = mb_substr(strip_tags($description),0,160);
$price       = $tour['price'] ?? '';
$duration    = $tour['duration'] ?? '';
$location    = $tour['location'] ?? '';
$image       = absPath($tour['image'] ?? '');
$rating      = $tour['rating'] ?? '4.9';
$reviewCount = $tour['reviewCount'] ?? '';

$canonicalUrl = SITE_URL.$LANG_PREFIXES[$currentLang].'/'.$slug.'/';
$hreflang = [];
foreach ($LANG_PREFIXES as $lc=>$p) $hreflang[$lc] = SITE_URL.$p.'/'.tourSlug($tour,$lc).'/';

$imageAbs = str_starts_with($image,'http') ? $image : SITE_URL.'/'.ltrim($image,'/');
$schemaPrice = preg_replace('/[^0-9.]/','', $price);
$currency    = str_contains($price,'€') ? 'EUR' : 'USD';
$schema = json_encode([
    '@context'=>'https://schema.org','@type'=>'TouristTrip',
    'name'=>$title,'description'=>$shortDesc,'url'=>$canonicalUrl,'image'=>$imageAbs,
    'touristType'=>$tour['category']??'General','duration'=>$duration,
    'offers'=>['@type'=>'Offer','price'=>$schemaPrice?:'0','priceCurrency'=>$currency,
               'availability'=>'https://schema.org/InStock','url'=>$canonicalUrl],
    'provider'=>['@type'=>'TravelAgency','name'=>SITE_NAME,'url'=>SITE_URL],
    'aggregateRating'=>['@type'=>'AggregateRating','ratingValue'=>$rating,'bestRating'=>'5',
                        'worstRating'=>'1','ratingCount'=>$reviewCount?:'10'],
], JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES|JSON_PRETTY_PRINT);

$faqKey    = $currentLang === 'tr' ? 'faq' : 'faq_'.$currentLang;
$faqItems  = !empty($tour[$faqKey]) ? $tour[$faqKey]
           : (!empty($tour['faq_en']) ? $tour['faq_en']
           : ($tour['faq'] ?? []));

$faqSchema = '';
if (!empty($faqItems) && is_array($faqItems)) {
    $entities = [];
    foreach ($faqItems as $item) {
        if (empty($item['q']) || empty($item['a'])) continue;
        $entities[] = [
            '@type'          => 'Question',
            'name'           => $item['q'],
            'acceptedAnswer' => ['@type'=>'Answer','text'=>strip_tags($item['a'])],
        ];
    }
    if ($entities) {
        $faqSchema = json_encode(
            ['@context'=>'https://schema.org','@type'=>'FAQPage','mainEntity'=>$entities],
            JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES|JSON_PRETTY_PRINT
        );
    }
}

$dict = [
    'tr'=>['home'=>'Ana Sayfa','tours'=>'Turlar','overview'=>'Tur Hakkında','day'=>'Gün','included'=>'Fiyata Dahil Olanlar','excluded'=>'Fiyata Dahil Olmayanlar','pricing'=>'Başlangıç Fiyatları','notes'=>'Önemli Notlar','map'=>'Tur Rotası','gallery'=>'Fotoğraf Galerisi','priceTitle'=>'BAŞLANGIÇ FİYATI','emailBtn'=>'Hemen Bilgi Al','waBtn'=>'WhatsApp Rezervasyon','pricingNote'=>'(*) Belirtilen fiyatlar başlangıç fiyatlarıdır.','pricingCol1'=>'Otel Sınıfı','pricingCol2'=>'Fiyat (Kişi Başı)','faqTitle'=>'Sıkça Sorulan Sorular'],
    'en'=>['home'=>'Home','tours'=>'Tours','overview'=>'Overview','day'=>'Day','included'=>'Included','excluded'=>'Not Included','pricing'=>'Starting Prices','notes'=>'Notes','map'=>'Maps','gallery'=>'Gallery','priceTitle'=>'STARTING FROM','emailBtn'=>'Inquire Now','waBtn'=>'Book via WhatsApp','pricingNote'=>'(*) Prices are starting prices. Contact us for exact pricing.','pricingCol1'=>'Hotel Class','pricingCol2'=>'Price (per person)','faqTitle'=>'Frequently Asked Questions'],
    'es'=>['home'=>'Inicio','tours'=>'Tours','overview'=>'Visión General','day'=>'Día','included'=>'Incluido','excluded'=>'No Incluido','pricing'=>'Precios','notes'=>'Notas','map'=>'Mapa','gallery'=>'Galería','priceTitle'=>'DESDE','emailBtn'=>'Consultar','waBtn'=>'Reservar (WhatsApp)','pricingNote'=>'(*) Precios iniciales.','pricingCol1'=>'Clase de Hotel','pricingCol2'=>'Precio (por persona)','faqTitle'=>'Preguntas Frecuentes'],
    'pt'=>['home'=>'Início','tours'=>'Passeios','overview'=>'Visão Geral','day'=>'Dia','included'=>'Incluído','excluded'=>'Não Incluído','pricing'=>'Preços Iniciais','notes'=>'Notas','map'=>'Mapa','gallery'=>'Galeria','priceTitle'=>'A PARTIR DE','emailBtn'=>'Consultar Agora','waBtn'=>'Reservar via WhatsApp','pricingNote'=>'(*) Os preços são iniciais.','pricingCol1'=>'Classe de Hotel','pricingCol2'=>'Preço (por pessoa)','faqTitle'=>'Perguntas Frequentes'],
    'ar'=>['home'=>'الرئيسية','tours'=>'جولات','overview'=>'ملخص','day'=>'يوم','included'=>'مشمول','excluded'=>'غير مشمول','pricing'=>'الأسعار','notes'=>'ملاحظات','map'=>'خريطة','gallery'=>'صالة عرض','priceTitle'=>'يبدأ من','emailBtn'=>'استفسر الآن','waBtn'=>'WhatsApp','pricingNote'=>'(*) أسعار مبدئية.','pricingCol1'=>'فئة الفندق','pricingCol2'=>'السعر (للشخص)','faqTitle'=>'الأسئلة الشائعة'],
];
$L = $dict[$currentLang] ?? $dict['tr'];

$descContent = getLangField($tour,'description',$currentLang);
$content     = getLangField($tour,'content',$currentLang);
if (!$descContent && $content) { $descContent = $content; $content = ''; }
$included    = getLangField($tour,'included',$currentLang);
$notIncluded = getLangField($tour,'not_included',$currentLang);
$notes       = getLangField($tour,'notes',$currentLang);
$rawGallery  = $tour['gallery'] ?? ($tour['images'] ?? ($image ? [$image] : []));
$gallery     = array_map('absPath', $rawGallery);

$waMsg    = urlencode('Merhaba, "'.$title.'" turu hakkında bilgi almak istiyorum.');
$emailSub = urlencode($title.' Bilgi Talebi');
$htmlDir  = $currentLang==='ar' ? ' dir="rtl"' : '';

// ── CLS: Hero görseli için gerçek boyutları hesapla ─────────────────────────
// Aspect ratio 16:9 varsayılan; tours.json'da imageWidth/imageHeight varsa kullan
$imgWidth  = $tour['imageWidth']  ?? 1920;
$imgHeight = $tour['imageHeight'] ?? 1080;

// ── HTTP/2 Server Push — kritik CSS/font için Early Hints ───────────────────
header('Link: </style.css>; rel=preload; as=style', false);
header('Link: </assets/walkabout_travel_logo.jpg>; rel=preload; as=image', false);
?>
<!DOCTYPE html>
<html lang="<?=htmlspecialchars($currentLang)?>"<?=$htmlDir?>>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title><?=htmlspecialchars($title)?> | <?=SITE_NAME?></title>
<meta name="description" content="<?=htmlspecialchars($shortDesc)?>">
<link rel="canonical" href="<?=htmlspecialchars($canonicalUrl)?>">
<?php foreach($hreflang as $lc=>$u): ?>
<link rel="alternate" hreflang="<?=$lc?>" href="<?=htmlspecialchars($u)?>">
<?php endforeach; ?>
<link rel="alternate" hreflang="x-default" href="<?=htmlspecialchars($hreflang['en'])?>">
<meta property="og:type" content="website">
<meta property="og:url" content="<?=htmlspecialchars($canonicalUrl)?>">
<meta property="og:title" content="<?=htmlspecialchars($title)?> | <?=SITE_NAME?>">
<meta property="og:description" content="<?=htmlspecialchars($shortDesc)?>">
<?php if($image): ?><meta property="og:image" content="<?=htmlspecialchars($imageAbs)?>"><?php endif; ?>
<script type="application/ld+json"><?=$schema?></script>
<?php if($faqSchema): ?><script type="application/ld+json"><?=$faqSchema?></script><?php endif; ?>
<link rel="icon" href="/assets/walkabout_travel_logo.jpg">

<!-- ════════════════════════════════════════════════════════════
     CORE WEB VITALS — LCP OPTİMİZASYONU
     1) Font Awesome'u asenkron yükle (render-blocking kaldır)
     2) Google Fonts display=swap + preconnect
     3) Hero görselini fetchpriority="high" + preload ile öncele
     ════════════════════════════════════════════════════════════ -->

<!-- DNS prefetch & preconnect — bağlantı süresi düşürür -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="dns-prefetch" href="https://cdnjs.cloudflare.com">

<!-- Google Fonts: display=swap → FOIT önlenir, CLS minimize -->
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;900&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">

<!-- LCP: hero görseli ön yükleme (varsa) -->
<?php if($image): ?>
<link rel="preload" as="image"
      href="<?=htmlspecialchars($image)?>"
      fetchpriority="high"
      imagesrcset="<?=htmlspecialchars($image)?>"
      imagesizes="100vw">
<?php endif; ?>

<!-- Font Awesome: render-blocking değil, print trick ile async yükle -->
<link rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      media="print"
      onload="this.media='all'">
<noscript>
  <link rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</noscript>

<!-- Site CSS -->
<link rel="stylesheet" href="/style.css">

<style>
/* ══════════════════════════════════════════════════════════════
   CWV RESET — Tüm kutular border-box, overflow-x engeli
   ══════════════════════════════════════════════════════════════ */
*,*::before,*::after { margin:0; padding:0; box-sizing:border-box; }
html { overflow-x:hidden; }
body { font-family:'Inter',sans-serif; background:#ffffff; color:#1e293b; overflow-x:hidden; }

/* ══════════════════════════════════════════════════════════════
   CLS: NAV — min-height sabit; layout shift önlenir
   ══════════════════════════════════════════════════════════════ */
nav {
  position:fixed !important; top:0 !important; left:0 !important; right:0 !important;
  z-index:1000 !important; min-height:61px !important; /* CLS: sabit yükseklik */
  background:rgba(255,255,255,0.98) !important;
  backdrop-filter:blur(10px) !important;
  border-bottom:1px solid rgba(0,0,0,0.08) !important;
  box-shadow:0 1px 3px rgba(0,0,0,0.05) !important;
  will-change:transform; /* INP: GPU katmanı */
  contain:layout style; /* CLS: içerik izole */
}
.header-top-row { display:none !important; }
.nav-container {
  display:flex !important; align-items:center !important;
  justify-content:space-between !important;
  padding:10px 40px !important; max-width:100% !important; margin:0 !important;
}
.logo { display:flex !important; align-items:center !important; gap:12px !important; text-decoration:none !important; }

/* CLS: logo img boyutları sabit — yükseklik/genişlik belirtilmeli */
.logo img { height:40px !important; width:40px !important; border-radius:8px !important; object-fit:cover !important; }
.logo-text { display:flex !important; flex-direction:column !important; }
.logo-title { font-family:'Playfair Display',serif !important; font-size:20px !important; font-weight:700 !important; color:#0c4a6e !important; line-height:1 !important; }
.logo-subtitle { font-size:10px !important; color:#64748b !important; letter-spacing:1.5px !important; text-transform:uppercase !important; margin-top:2px !important; }
.nav-links { display:flex !important; gap:40px !important; align-items:center !important; flex:1 !important; justify-content:center !important; list-style:none !important; }
.nav-links li { display:inline !important; }
.nav-links a { color:#0c4a6e !important; text-decoration:none !important; font-weight:600 !important; font-size:14px !important; transition:color 0.3s !important; text-transform:uppercase; }
.nav-links a:hover { color:#38bdf8 !important; }
.lang-dropdown { position:relative; margin-left:20px; }
.lang-dropdown-btn { background:transparent; border:1px solid #cbd5e1; color:#0c4a6e; padding:8px 15px; border-radius:8px; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:8px; min-height:38px; /* CLS */ }
.lang-dropdown-content { display:none; position:absolute; right:0; top:100%; margin-top:5px; background:white; min-width:150px; box-shadow:0 10px 25px rgba(0,0,0,0.1); border-radius:12px; border:1px solid #e2e8f0; overflow:hidden; z-index:1000; }
.lang-dropdown-content a { color:#475569; padding:12px 16px; text-decoration:none; display:block; font-size:14px; font-weight:500; transition:background 0.2s; }
.lang-dropdown-content a:hover { background:#f8fafc; color:#38bdf8; }
.lang-dropdown.active .lang-dropdown-content { display:block; }
.menu-toggle { display:none !important; font-size:24px !important; color:#0c4a6e !important; background:none !important; border:none !important; cursor:pointer !important; min-width:44px !important; min-height:44px !important; /* INP: dokunma hedefi büyüt */ }

/* ══════════════════════════════════════════════════════════════
   CLS: BREADCRUMB — margin-top nav'ın min-height'ına eşit
   ══════════════════════════════════════════════════════════════ */
.breadcrumb { padding:25px 40px; background:#f8fafc; margin-top:61px; border-bottom:1px solid #e2e8f0; min-height:64px; /* CLS */ }
.breadcrumb-container { max-width:1400px; margin:0 auto; display:flex; align-items:center; gap:10px; font-size:13px; font-weight:500; text-transform:uppercase; letter-spacing:0.5px; }
.breadcrumb a { color:#64748b; text-decoration:none; transition:color 0.3s; }
.breadcrumb a:hover { color:#38bdf8; }
.breadcrumb-separator { color:#cbd5e1; }
.breadcrumb-current { color:#0c4a6e; font-weight:700; }

/* ══════════════════════════════════════════════════════════════
   LCP + CLS: HERO — aspect-ratio ile yükseklik rezerve et
   img eksik boyutları: width/height attribute HTML'de belirtilmeli
   ══════════════════════════════════════════════════════════════ */
.tour-detail-hero {
  position:relative;
  /* CLS: aspect-ratio ile boşluk rezerve et → resim yüklenirken kaymaz */
  aspect-ratio:16/7;
  min-height:400px; max-height:65vh;
  overflow:hidden; display:flex; align-items:flex-end;
  background:#0c4a6e; /* LCP: görsel yüklenene kadar placeholder renk */
  contain:layout paint; /* CLS: dışa taşmayı izole et */
}
.tour-detail-hero img {
  position:absolute; top:0; left:0; width:100%; height:100%;
  object-fit:cover; z-index:0;
  /* LCP: fetchpriority HTML attribute'da da belirtildi; burada CSS ipucu */
  will-change:auto;
}
.tour-detail-hero::before {
  content:''; position:absolute; inset:0;
  background:linear-gradient(to bottom,rgba(0,0,0,0.1) 0%,rgba(0,0,0,0.3) 50%,rgba(0,0,0,0.9) 100%);
  z-index:1;
}
.tour-hero-content { position:relative; z-index:2; max-width:1400px; margin:0 auto; padding:60px 40px; width:100%; color:white; }
.tour-badge { display:inline-block; padding:8px 20px; background:#38bdf8; color:white; border-radius:20px; font-size:12px; font-weight:800; text-transform:uppercase; letter-spacing:1px; margin-bottom:20px; }
.tour-hero-content h1 { font-size:56px; font-weight:900; margin-bottom:30px; line-height:1.1; font-family:'Playfair Display',serif; text-shadow:0 4px 25px rgba(0,0,0,0.6); }
.tour-quick-look { display:flex; gap:40px; flex-wrap:wrap; margin-top:20px; padding-top:25px; border-top:1px solid rgba(255,255,255,0.2); }
.quick-item { display:flex; flex-direction:column; gap:8px; }
.quick-item i { font-size:24px; color:#38bdf8; }
.quick-item span { font-size:15px; font-weight:600; color:#f8fafc; }

/* ══════════════════════════════════════════════════════════════
   CONTENT LAYOUT
   ══════════════════════════════════════════════════════════════ */
.tour-detail-content { padding:80px 0; background:#ffffff; }
.tour-grid-layout { max-width:1400px; margin:0 auto; padding:0 40px; display:grid; grid-template-columns:2fr 1fr; gap:60px; }
.tour-main h2.section-heading { font-size:32px; font-family:'Playfair Display',serif; color:#0f172a; margin-bottom:30px; padding-bottom:15px; border-bottom:2px solid #e2e8f0; font-weight:800; }
.tour-overview { font-size:16px; line-height:1.8; color:#475569; margin-bottom:50px; }
.itinerary-item { margin-bottom:15px; border:1px solid #e2e8f0; border-radius:12px; overflow:hidden; background:#ffffff; contain:layout; /* CLS */ }
.itinerary-day-title { font-size:17px; font-weight:700; color:#0f172a; margin:0; padding:20px; background:#f8fafc; cursor:pointer; display:flex; justify-content:space-between; align-items:center; transition:background 0.3s; user-select:none; min-height:64px; /* INP: büyük dokunma hedefi */ }
.itinerary-day-title:hover { background:#f1f5f9; }
.itinerary-day-title .day-info { display:flex; align-items:center; gap:15px; }
.itinerary-day-title span.day-badge { background:#38bdf8; color:white; padding:6px 12px; border-radius:8px; font-size:13px; font-weight:800; letter-spacing:1px; text-transform:uppercase; }
.itinerary-day-title i { color:#94a3b8; transition:transform 0.4s; font-size:14px; flex-shrink:0; }

/* CLS: accordion — max-height yerine height:auto + clip-path animasyonu daha az CLS yaratır
   Eski max-height:0→1000px hâlâ çalışır ama clip-path daha smooth */
.itinerary-desc {
  max-height:0; overflow:hidden;
  transition:max-height 0.4s ease, padding 0.4s ease;
  font-size:15px; color:#475569; line-height:1.8;
  background:white; padding:0 20px;
  /* CLS: contain ile çevresel layout'u izole et */
  contain:layout style;
}
.itinerary-item.active { border-color:#38bdf8; }
.itinerary-item.active .itinerary-day-title { background:#f0f9ff; }
.itinerary-item.active .itinerary-desc { padding:20px; max-height:1000px; border-top:1px solid #e0f2fe; }
.itinerary-item.active .itinerary-day-title i { transform:rotate(180deg); color:#38bdf8; }

.info-table { width:100%; border-collapse:collapse; margin-bottom:50px; border-top:1px solid #e2e8f0; }
.info-table tr { border-bottom:1px solid #e2e8f0; }
.info-table td { padding:20px 0; font-size:16px; color:#475569; }
.info-table td:first-child { font-weight:700; color:#0f172a; width:35%; }
.inc-exc-container { display:grid; grid-template-columns:1fr 1fr; gap:40px; margin-bottom:60px; }
.inc-exc-box h3 { font-size:20px; font-weight:800; margin-bottom:25px; color:#0f172a; }
.inc-exc-list { list-style:none; }
.inc-exc-list li { display:flex; gap:15px; margin-bottom:15px; font-size:15px; color:#475569; align-items:flex-start; }
.inc-exc-list li i.fa-check { color:#10b981; font-size:16px; margin-top:3px; }
.inc-exc-list li i.fa-minus { color:#94a3b8; font-size:16px; margin-top:3px; }
.pricing-table-container { margin-bottom:60px; overflow-x:auto; }
.pricing-table { width:100%; border-collapse:collapse; border:1px solid #e2e8f0; text-align:center; }
.pricing-table th { background:#f8fafc; padding:20px; font-weight:700; color:#0f172a; border:1px solid #e2e8f0; }
.pricing-table td { padding:20px; border:1px solid #e2e8f0; font-size:16px; color:#475569; }
.pricing-table td:first-child { font-weight:700; color:#0f172a; text-align:left; }
.pricing-note { font-size:13px; font-style:italic; color:#64748b; margin-top:10px; }
.notes-list { list-style:none; margin-bottom:60px; }
.notes-list li { position:relative; padding-left:25px; margin-bottom:15px; font-size:15px; color:#475569; line-height:1.6; }
.notes-list li::before { content:'→'; position:absolute; left:0; top:0; color:#38bdf8; font-weight:bold; }

/* CLS: harita — sabit boyut rezerve et → iframe yüklenirken kaymaz */
.map-container { width:100%; height:400px; border-radius:16px; overflow:hidden; margin-bottom:60px; border:1px solid #e2e8f0; background:#f1f5f9; /* CLS: boş alan rengi */ }
.map-container iframe { width:100%; height:100%; border:none; }

/* ══════════════════════════════════════════════════════════════
   CLS: GALERİ — aspect-ratio ile yer rezervasyonu
   ══════════════════════════════════════════════════════════════ */
.gallery-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; margin-bottom:40px; }
.gallery-item {
  border-radius:12px; overflow:hidden; cursor:pointer;
  /* CLS: sabit oran → yüklenmeden önce yer tutar */
  aspect-ratio:4/3;
  background:#e2e8f0; /* CLS: placeholder */
  transition:transform 0.3s;
  contain:layout paint;
}
.gallery-item:hover { transform:translateY(-5px); }
.gallery-item img { width:100%; height:100%; object-fit:cover; transition:transform 0.5s; display:block; }
.gallery-item:hover img { transform:scale(1.1); }

/* ── SIDEBAR ──────────────────────────────────────────────────── */
.tour-sidebar { position:sticky; top:110px; height:fit-content; }
.tour-booking-card { background:white; padding:40px; border-radius:24px; box-shadow:0 10px 40px rgba(0,0,0,0.08); border:1px solid #e2e8f0; text-align:center; }
.price-label { font-size:13px; color:#64748b; font-weight:700; text-transform:uppercase; letter-spacing:1px; margin-bottom:10px; }
.price-amount { font-size:48px; font-weight:900; color:#0f172a; font-family:'Playfair Display',serif; line-height:1; margin-bottom:30px; }
.booking-cta { display:flex; flex-direction:column; gap:15px; }

/* INP: butonlar — min dokunma alanı 44×44px */
.btn {
  display:flex; align-items:center; justify-content:center;
  gap:10px; padding:16px 24px; border-radius:12px;
  font-weight:700; font-size:15px; text-decoration:none;
  transition:background-color 0.2s ease, transform 0.2s ease; /* INP: kısa transition */
  text-transform:uppercase;
  min-height:52px; /* INP */
  cursor:pointer;
  /* INP: touch-action belirt → tarayıcı hızlı yanıt verir */
  touch-action:manipulation;
}
.btn-primary { background:#38bdf8; color:white; }
.btn-primary:hover { background:#0284c7; transform:translateY(-2px); }
.btn-outline { background:transparent; border:2px solid #25d366; color:#25d366; }
.btn-outline:hover { background:#25d366; color:white; }

/* ── FAQ ──────────────────────────────────────────────────────── */
.faq-list { margin-bottom:60px; }
.faq-item { border:1px solid #e2e8f0; border-radius:12px; margin-bottom:12px; overflow:hidden; background:#fff; transition:border-color 0.3s; contain:layout; }
.faq-item.active { border-color:#38bdf8; }
.faq-question {
  font-size:16px; font-weight:700; color:#0f172a; margin:0;
  padding:20px 24px; background:#f8fafc; cursor:pointer;
  display:flex; justify-content:space-between; align-items:center; gap:16px;
  user-select:none; transition:background 0.2s;
  min-height:64px; /* INP */
  touch-action:manipulation; /* INP */
}
.faq-question:hover { background:#f1f5f9; }
.faq-item.active .faq-question { background:#f0f9ff; color:#0284c7; }
.faq-question i { color:#94a3b8; font-size:14px; flex-shrink:0; transition:transform 0.35s; }
.faq-item.active .faq-question i { transform:rotate(180deg); color:#38bdf8; }
.faq-answer {
  max-height:0; overflow:hidden;
  transition:max-height 0.4s ease, padding 0.4s ease;
  font-size:15px; color:#475569; line-height:1.8; padding:0 24px; background:#fff;
  contain:layout style;
}
.faq-item.active .faq-answer { max-height:600px; padding:20px 24px; border-top:1px solid #e0f2fe; }

/* ── LIGHTBOX ─────────────────────────────────────────────────── */
.lightbox { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.95); z-index:10000; justify-content:center; align-items:center; }
.lightbox.active { display:flex; }
.lightbox-content img { max-width:90vw; max-height:90vh; border-radius:12px; }
.lightbox-close,.lightbox-nav { position:absolute; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2); color:white; border-radius:50%; cursor:pointer; display:flex; justify-content:center; align-items:center; transition:background 0.2s; min-width:50px; min-height:50px; touch-action:manipulation; }
.lightbox-close { top:20px; right:20px; width:50px; height:50px; font-size:24px; }
.lightbox-nav { top:50%; transform:translateY(-50%); width:50px; height:50px; font-size:20px; }
.lightbox-prev { left:20px; } .lightbox-next { right:20px; }

/* WhatsApp float — sabit, layout'u etkilemez */
.whatsapp-float {
  position:fixed; bottom:30px; right:30px; z-index:999;
  background:#25d366; color:white; border-radius:50%;
  width:56px; height:56px; /* INP: büyük hedef */
  display:flex; align-items:center; justify-content:center;
  font-size:26px; box-shadow:0 4px 15px rgba(37,211,102,0.4);
  text-decoration:none; transition:transform 0.2s, background-color 0.2s;
  touch-action:manipulation; /* INP */
  will-change:transform;
}
.whatsapp-float:hover { transform:scale(1.1); background:#1da851; }

/* ══════════════════════════════════════════════════════════════
   RESPONSIVE
   ══════════════════════════════════════════════════════════════ */
@media (max-width:992px) {
  .nav-links {
    position:fixed !important; top:0 !important; right:-100% !important;
    height:100vh !important; width:80% !important; max-width:350px !important;
    background:white !important; flex-direction:column !important;
    padding:100px 40px !important; transition:right 0.4s ease !important;
    align-items:flex-start !important; box-shadow:-5px 0 30px rgba(0,0,0,0.15) !important;
    z-index:999 !important;
  }
  .nav-links.active { right:0 !important; }
  .menu-toggle { display:flex !important; align-items:center !important; justify-content:center !important; }
  .tour-grid-layout { grid-template-columns:1fr; gap:40px; }
  .tour-sidebar { position:static; }
  .tour-hero-content h1 { font-size:42px; }
  .inc-exc-container { grid-template-columns:1fr; gap:20px; }
  .gallery-grid { grid-template-columns:repeat(2,1fr); }
}
@media (max-width:576px) {
  .tour-detail-hero { aspect-ratio:4/3; max-height:none; min-height:300px; padding-top:100px; }
  .tour-hero-content h1 { font-size:32px; }
  .tour-quick-look { gap:20px; }
  .tour-grid-layout { padding:0 20px; }
  .gallery-grid { grid-template-columns:1fr; }
  .nav-container { padding:10px 20px !important; }
  .breadcrumb { padding:15px 20px; }
}
</style>
</head>
<body>

<nav id="navbar">
    <div class="nav-container">
        <a href="/" class="logo">
            <!-- CLS: width + height attribute zorunlu -->
            <img src="/assets/walkabout_travel_logo.jpg"
                 alt="WalkAbout Travel Logo"
                 width="40" height="40"
                 onerror="this.style.display='none'">
            <div class="logo-text">
                <span class="logo-title">WalkAbout Travel</span>
                <span class="logo-subtitle">TOURISM & TRAVEL</span>
            </div>
        </a>
        <ul class="nav-links" id="navLinks">
            <li><a href="/"><?=$L['home']?></a></li>
            <li><a href="/#popular-trips"><?=$L['tours']?></a></li>
            <li><a href="/#why-us">WHY US</a></li>
            <li><a href="/#blog">BLOG</a></li>
            <li><a href="/#contact">CONTACT</a></li>
        </ul>
        <div style="display:flex;align-items:center;">
            <div class="lang-dropdown">
                <button class="lang-dropdown-btn" aria-label="Select language" aria-expanded="false">
                    <i class="fas fa-globe" aria-hidden="true"></i>
                    <span class="current-lang-text"><?=strtoupper($currentLang)?></span>
                    <i class="fas fa-chevron-down" aria-hidden="true"></i>
                </button>
                <div class="lang-dropdown-content">
                    <?php foreach($hreflang as $lc=>$u): ?>
                    <a href="<?=htmlspecialchars($u)?>"><?=$LANG_NAMES[$lc]?></a>
                    <?php endforeach; ?>
                </div>
            </div>
            <button class="menu-toggle" id="menuToggle" aria-label="Open menu" aria-expanded="false">
                <i class="fas fa-bars" aria-hidden="true"></i>
            </button>
        </div>
    </div>
</nav>

<div class="breadcrumb">
    <div class="breadcrumb-container">
        <a href="/"><?=$L['home']?></a>
        <span class="breadcrumb-separator" aria-hidden="true">›</span>
        <a href="/#tours"><?=$L['tours']?></a>
        <span class="breadcrumb-separator" aria-hidden="true">›</span>
        <span class="breadcrumb-current"><?=htmlspecialchars($title)?></span>
    </div>
</div>

<!-- LCP elemanı: hero img -->
<div class="tour-detail-hero">
    <?php if($image): ?>
    <!-- CLS: width+height attribute + fetchpriority="high" (LCP görseli) -->
    <img src="<?=htmlspecialchars($image)?>"
         alt="<?=htmlspecialchars($title)?>"
         width="<?=(int)$imgWidth?>"
         height="<?=(int)$imgHeight?>"
         fetchpriority="high"
         decoding="async">
    <?php endif; ?>
    <div class="tour-hero-content">
        <span class="tour-badge"><?=htmlspecialchars($tour['category']??'TUR')?></span>
        <h1><?=htmlspecialchars($title)?></h1>
        <div class="tour-quick-look">
            <?php if(!empty($tour['meta'])): ?>
                <?php foreach(['duration'=>'fa-clock','languages'=>'fa-globe','months'=>'fa-calendar-check','availability'=>'fa-user-friends'] as $mk=>$icon): ?>
                <?php if(!empty($tour['meta'][$mk])): ?><div class="quick-item"><i class="fas <?=$icon?>" aria-hidden="true"></i><span><?=htmlspecialchars($tour['meta'][$mk])?></span></div><?php endif; ?>
                <?php endforeach; ?>
            <?php else: ?>
                <?php if($duration): ?><div class="quick-item"><i class="fas fa-clock" aria-hidden="true"></i><span><?=htmlspecialchars($duration)?></span></div><?php endif; ?>
                <?php if($location): ?><div class="quick-item"><i class="fas fa-map-marker-alt" aria-hidden="true"></i><span><?=htmlspecialchars($location)?></span></div><?php endif; ?>
                <?php if($rating): ?><div class="quick-item"><i class="fas fa-star" aria-hidden="true"></i><span><?=htmlspecialchars($rating)?> / 5</span></div><?php endif; ?>
            <?php endif; ?>
        </div>
    </div>
</div>

<div class="tour-detail-content">
    <div class="tour-grid-layout">
        <div class="tour-main">

            <?php if($descContent): ?>
            <h2 class="section-heading"><?=$L['overview']?></h2>
            <div class="tour-overview"><?=nl2br(is_string($descContent)?htmlspecialchars($descContent):'')?></div>
            <?php endif; ?>

            <?php
            $itinerary = [];
            if (!empty($tour['itinerary'])) $itinerary = $tour['itinerary'];
            elseif (!empty($tour['days']))  $itinerary = $tour['days'];
            ?>
            <?php if(!empty($itinerary)): ?>
            <div class="itinerary-section" style="margin-bottom:50px;">
                <?php if (!empty($tour['itinerary']) && is_array($tour['itinerary'])): ?>
    <div class="itinerary-section">
        <?php 
        foreach ($tour['itinerary'] as $index => $day): 
            // Aktif dile göre başlık seçimi (TR ise ana alan, değilse dilli alan veya fallback)
            $dayTitle = ($currentLang === 'tr') 
                ? ($day['title'] ?? '') 
                : ($day['title_' . $currentLang] ?? $day['title_en'] ?? $day['title'] ?? '');

            // Aktif dile göre açıklama seçimi
            $dayDesc = ($currentLang === 'tr') 
                ? ($day['description'] ?? '') 
                : ($day['description_' . $currentLang] ?? $day['description_en'] ?? $day['description'] ?? '');
            
            // Gün kelimesinin yerelleştirilmesi
            $dayLabel = 'Gün';
            if ($currentLang === 'en') { $dayLabel = 'Day'; }
            else if ($currentLang === 'es' || $currentLang === 'pt') { $dayLabel = 'Día'; }
            else if ($currentLang === 'ar') { $dayLabel = 'اليوم'; }
        ?>
            <div class="itinerary-day" style="contain: layout; margin-bottom: 24px;">
                <div class="itinerary-day-header" style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                    <span class="itinerary-day-number" style="font-weight: 800; color: #38bdf8; font-size: 18px; white-space: nowrap;">
                        <?= $dayLabel ?> <?= htmlspecialchars($day['day'] ?? ($index + 1)) ?>:
                    </span>
                    <h3 class="itinerary-day-title" style="font-size: 18px; margin: 0; color: #0f172a; font-weight: 700;">
                        <?= htmlspecialchars($dayTitle) ?>
                    </h3>
                </div>
                <div class="itinerary-desc" style="contain: layout style; padding-left: 15px; border-left: 2px solid #e2e8f0; color: #475569; line-height: 1.8;">
                    <p style="margin: 0; font-size: 15px;"><?= nl2br(htmlspecialchars($dayDesc)) ?></p>
                </div>
            </div>
        <?php endforeach; ?>
    </div>
<?php endif; ?>

            <?php if(!empty($tour['departureReturn'])): ?>
            <table class="info-table">
                <?php foreach($tour['departureReturn'] as $item):
                    $parts = explode(':',$item,2); ?>
                <tr><?php if(count($parts)>1): ?><td><?=htmlspecialchars(trim($parts[0]))?></td><td><?=htmlspecialchars(trim($parts[1]))?></td><?php else: ?><td colspan="2"><?=htmlspecialchars($item)?></td><?php endif; ?></tr>
                <?php endforeach; ?>
            </table>
            <?php endif; ?>

            <?php if((is_array($included)&&count($included))||(is_array($notIncluded)&&count($notIncluded))): ?>
            <div class="inc-exc-container">
                <div class="inc-exc-box"><h3><?=$L['included']?></h3>
                    <ul class="inc-exc-list"><?php if(is_array($included)) foreach($included as $item): ?><li><i class="fas fa-check" aria-hidden="true"></i><span><?=htmlspecialchars($item)?></span></li><?php endforeach; ?></ul>
                </div>
                <div class="inc-exc-box"><h3><?=$L['excluded']?></h3>
                    <ul class="inc-exc-list"><?php if(is_array($notIncluded)) foreach($notIncluded as $item): ?><li><i class="fas fa-minus" aria-hidden="true"></i><span><?=htmlspecialchars($item)?></span></li><?php endforeach; ?></ul>
                </div>
            </div>
            <?php endif; ?>

            <?php if(!empty($tour['pricing'])&&(isset($tour['pricing']['economy'])||isset($tour['pricing']['comfort'])||isset($tour['pricing']['luxury']))): ?>
            <div class="pricing-table-container">
                <h2 class="section-heading"><?=$L['pricing']?></h2>
                <table class="pricing-table">
                    <thead><tr><th><?=$L['pricingCol1']?></th><th><?=$L['pricingCol2']?></th></tr></thead>
                    <tbody>
                        <?php if(!empty($tour['pricing']['economy'])): ?><tr><td>Economy / Ekonomi</td><td><?=htmlspecialchars($tour['pricing']['economy'])?></td></tr><?php endif; ?>
                        <?php if(!empty($tour['pricing']['comfort'])): ?><tr><td>Comfort / Konfor</td><td style="color:#1d4ed8;"><?=htmlspecialchars($tour['pricing']['comfort'])?></td></tr><?php endif; ?>
                        <?php if(!empty($tour['pricing']['luxury'])): ?><tr><td>Luxury / Lüks</td><td style="color:#a16207;"><?=htmlspecialchars($tour['pricing']['luxury'])?></td></tr><?php endif; ?>
                    </tbody>
                </table>
                <p class="pricing-note"><?=$L['pricingNote']?></p>
            </div>
            <?php endif; ?>

            <?php if(is_array($notes)&&count($notes)): ?>
            <div>
                <h2 class="section-heading"><?=$L['notes']?></h2>
                <ul class="notes-list"><?php foreach($notes as $n): ?><li><?=htmlspecialchars($n)?></li><?php endforeach; ?></ul>
            </div>
            <?php endif; ?>

            <?php if(!empty($tour['mapUrl'])): ?>
            <div>
                <h2 class="section-heading"><?=$L['map']?></h2>
                <!-- CLS: harita iframe loading="lazy" — görünür alana girince yükle -->
                <div class="map-container">
                    <iframe src="<?=htmlspecialchars($tour['mapUrl'])?>"
                            title="<?=htmlspecialchars($title)?> harita"
                            allowfullscreen
                            loading="lazy"
                            referrerpolicy="no-referrer-when-downgrade"></iframe>
                </div>
            </div>
            <?php endif; ?>

            <?php if(!empty($gallery)): ?>
            <div style="margin-top:50px;">
                <h2 class="section-heading"><?=$L['gallery']?></h2>
                <div class="gallery-grid">
                    <?php foreach($gallery as $idx=>$img): ?>
                    <div class="gallery-item"
                         onclick="openLightbox(<?=$idx?>)"
                         role="button"
                         tabindex="0"
                         aria-label="<?=htmlspecialchars($title)?> galeri görseli <?=$idx+1?>">
                        <!-- CLS: width+height ile aspect-ratio korunur; loading=lazy (LCP değil) -->
                        <img src="<?=htmlspecialchars($img)?>"
                             alt="<?=htmlspecialchars($title)?> <?=$idx+1?>"
                             width="400" height="300"
                             loading="<?=$idx<3?'eager':'lazy'?>"
                             decoding="async">
                    </div>
                    <?php endforeach; ?>
                </div>
            </div>
            <?php endif; ?>

            <?php if(!empty($faqItems)&&is_array($faqItems)): ?>
            <div class="faq-section" style="margin-top:60px;">
                <h2 class="section-heading"><?=$L['faqTitle']?></h2>
                <div class="faq-list">
                    <?php foreach($faqItems as $fi=>$faq):
                        if(empty($faq['q'])||empty($faq['a'])) continue; ?>
                    <div class="faq-item<?=$fi===0?' active':''?>"
                         itemscope itemprop="mainEntity"
                         itemtype="https://schema.org/Question">
                        <h3 class="faq-question"
                            itemprop="name"
                            onclick="toggleFaq(this)"
                            role="button"
                            tabindex="0"
                            aria-expanded="<?=$fi===0?'true':'false'?>">
                            <span><?=htmlspecialchars($faq['q'])?></span>
                            <i class="fas fa-chevron-down" aria-hidden="true"></i>
                        </h3>
                        <div class="faq-answer"
                             itemscope itemprop="acceptedAnswer"
                             itemtype="https://schema.org/Answer">
                            <div itemprop="text"><?=nl2br(htmlspecialchars($faq['a']))?></div>
                        </div>
                    </div>
                    <?php endforeach; ?>
                </div>
            </div>
            <?php endif; ?>

        </div><!-- /tour-main -->

        <div class="tour-sidebar">
            <div class="tour-booking-card">
                <div class="price-label"><?=$L['priceTitle']?></div>
                <div class="price-amount"><?=htmlspecialchars($price)?></div>
                <div class="booking-cta">
                    <a href="mailto:info@walkabouttravel.com?subject=<?=$emailSub?>"
                       class="btn btn-primary"
                       aria-label="<?=htmlspecialchars($L['emailBtn'])?>">
                        <i class="fas fa-envelope" aria-hidden="true"></i>
                        <?=$L['emailBtn']?>
                    </a>
                    <a href="https://wa.me/902125551923?text=<?=$waMsg?>"
                       class="btn btn-outline"
                       target="_blank"
                       rel="noopener noreferrer"
                       aria-label="WhatsApp ile rezervasyon">
                        <i class="fab fa-whatsapp" aria-hidden="true"></i>
                        <?=$L['waBtn']?>
                    </a>
                </div>
            </div>
        </div>

    </div>
</div><!-- /tour-detail-content -->

<div class="lightbox" id="lightbox" role="dialog" aria-modal="true" aria-label="Galeri" onclick="closeLightbox()">
    <button class="lightbox-close" aria-label="Kapat" onclick="closeLightbox()">
        <i class="fas fa-times" aria-hidden="true"></i>
    </button>
    <button class="lightbox-nav lightbox-prev" aria-label="Önceki" onclick="event.stopPropagation();changeImage(-1)">
        <i class="fas fa-chevron-left" aria-hidden="true"></i>
    </button>
    <div class="lightbox-content" onclick="event.stopPropagation()">
        <img id="lightboxImg" src="" alt="">
    </div>
    <button class="lightbox-nav lightbox-next" aria-label="Sonraki" onclick="event.stopPropagation();changeImage(1)">
        <i class="fas fa-chevron-right" aria-hidden="true"></i>
    </button>
</div>

<a href="https://wa.me/902125551923?text=<?=$waMsg?>"
   class="whatsapp-float"
   target="_blank"
   rel="noopener noreferrer"
   aria-label="WhatsApp ile iletişim">
    <i class="fab fa-whatsapp" aria-hidden="true"></i>
</a>

<!-- ════════════════════════════════════════════════════════════
     JavaScript — defer ile yükle (INP: main thread engelleme yok)
     Tüm JS body sonuna taşındı + event delegation kullanıldı
     ════════════════════════════════════════════════════════════ -->
<script>
// Galeri verisi — PHP'den JSON
const galleryImages = <?=json_encode($gallery,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES)?>;
let currentImageIndex = 0;

// ── Lightbox ─────────────────────────────────────────────────
function openLightbox(i) {
    currentImageIndex = i;
    document.getElementById('lightboxImg').src = galleryImages[i];
    document.getElementById('lightbox').classList.add('active');
    document.body.style.overflow = 'hidden'; // CLS önleme: scroll engelle
}
function closeLightbox() {
    document.getElementById('lightbox').classList.remove('active');
    document.body.style.overflow = '';
}
function changeImage(d) {
    currentImageIndex = (currentImageIndex + d + galleryImages.length) % galleryImages.length;
    document.getElementById('lightboxImg').src = galleryImages[currentImageIndex];
}

// ── Accordion (itinerary) — INP: requestAnimationFrame ile ──
function toggleAccordion(btn) {
    const item = btn.closest('.itinerary-item');
    const isActive = item.classList.contains('active');
    // Tümünü kapat
    document.querySelectorAll('.itinerary-item.active').forEach(el => {
        el.classList.remove('active');
        el.querySelector('[aria-expanded]')?.setAttribute('aria-expanded','false');
    });
    if (!isActive) {
        requestAnimationFrame(() => {
            item.classList.add('active');
            btn.setAttribute('aria-expanded','true');
        });
    }
}

// ── FAQ toggle — INP: rAF ────────────────────────────────────
function toggleFaq(btn) {
    const item = btn.closest('.faq-item');
    requestAnimationFrame(() => {
        item.classList.toggle('active');
        btn.setAttribute('aria-expanded', item.classList.contains('active') ? 'true' : 'false');
    });
}

// ── Klavye erişilebilirliği (accordion/faq) ──────────────────
document.addEventListener('keydown', e => {
    if (e.key === ' ' || e.key === 'Enter') {
        const t = e.target;
        if (t.classList.contains('itinerary-day-title')) { e.preventDefault(); toggleAccordion(t); }
        if (t.classList.contains('faq-question'))        { e.preventDefault(); toggleFaq(t); }
        if (t.classList.contains('gallery-item'))        { t.click(); }
    }
    if (e.key === 'Escape') closeLightbox();
    const lb = document.getElementById('lightbox');
    if (lb.classList.contains('active')) {
        if (e.key === 'ArrowRight') changeImage(1);
        if (e.key === 'ArrowLeft')  changeImage(-1);
    }
});

// ── Nav menü (mobile) ────────────────────────────────────────
const menuToggle = document.getElementById('menuToggle');
const navLinks   = document.getElementById('navLinks');
if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', e => {
        e.stopPropagation();
        const open = navLinks.classList.toggle('active');
        menuToggle.setAttribute('aria-expanded', open);
        const icon = menuToggle.querySelector('i');
        icon?.classList.toggle('fa-bars', !open);
        icon?.classList.toggle('fa-times', open);
    });
}

// ── Dil dropdown (event delegation) ─────────────────────────
document.addEventListener('click', e => {
    const btn = e.target.closest('.lang-dropdown-btn');
    if (btn) {
        e.stopPropagation();
        const dd = btn.closest('.lang-dropdown');
        const open = dd.classList.toggle('active');
        btn.setAttribute('aria-expanded', open);
        return;
    }
    document.querySelectorAll('.lang-dropdown.active').forEach(d => {
        d.classList.remove('active');
        d.querySelector('.lang-dropdown-btn')?.setAttribute('aria-expanded','false');
    });
});

// ── Nav menü (mobile) ────────────────────────────────────────
const menuToggle = document.getElementById('menuToggle');
const navLinks   = document.getElementById('navLinks');
if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', e => {
        e.stopPropagation();
        const open = navLinks.classList.toggle('active');
        menuToggle.setAttribute('aria-expanded', open);
        const icon = menuToggle.querySelector('i');
        icon?.classList.toggle('fa-bars', !open);
        icon?.classList.toggle('fa-times', open);
    });
}

// ── Dil dropdown (event delegation) ─────────────────────────
document.addEventListener('click', e => {
    const btn = e.target.closest('.lang-dropdown-btn');
    if (btn) {
        e.stopPropagation();
        const dd = btn.closest('.lang-dropdown');
        const open = dd.classList.toggle('active');
        btn.setAttribute('aria-expanded', open);
        return;
    }
    document.querySelectorAll('.lang-dropdown.active').forEach(d => {
        d.classList.remove('active');
        d.querySelector('.lang-dropdown-btn')?.setAttribute('aria-expanded','false');
    });
});

// ── Dil tercihi (sessionStorage — localStorage yerine) ───────
// sessionStorage: tab başına; localStorage gibi uzun vadeli depolama gerekmiyor
sessionStorage.setItem('language','<?=$currentLang?>');
</script>
<script src="/i18n.js" defer></script>
<script src="/app.js" defer></script>
</body>
</html>