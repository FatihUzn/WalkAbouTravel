<?php
// ============================================================
//  tour.php — WalkAbout Travel SEO Tur Detay Sayfası
//  ✅ Core Web Vitals Optimized (LCP · CLS · INP)
//     v3 — 2025-06 — Minimal Redesign
// ============================================================

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

function loadToursCached(): array {
    $jsonFile  = __DIR__ . '/data/tours.json';
    $cacheFile = __DIR__ . '/cache/tours.php';
    if (file_exists($cacheFile) && filemtime($cacheFile) >= filemtime($jsonFile)) {
        $data = @include $cacheFile;
        if (is_array($data)) return $data;
    }
    $tours = json_decode(file_get_contents($jsonFile), true) ?? [];
    if (!is_dir(dirname($cacheFile))) mkdir(dirname($cacheFile), 0755, true);
    file_put_contents($cacheFile, '<?php return ' . var_export($tours, true) . ';', LOCK_EX);
    return $tours;
}
$tours = loadToursCached();

function absPath(string $path): string {
    if (empty($path))                    return '';
    if (str_starts_with($path, 'http'))  return $path;
    if (str_starts_with($path, '/'))     return $path;
    return '/' . $path;
}

function makeSlug(string $t): string {
    $tr = ['ş','ğ','ü','ö','ı','ç','Ş','Ğ','Ü','Ö','İ','Ç'];
    $en = ['s','g','u','o','i','c','s','g','u','o','i','c'];
    $t = str_replace($tr, $en, $t);
    $t = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $t);
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
function getDayField(array $day, string $field, string $lang): string {
    if ($lang !== 'tr') {
        if (!empty($day[$field.'_'.$lang])) return $day[$field.'_'.$lang];
        if (!empty($day[$field.'_en']))     return $day[$field.'_en'];
    }
    return $day[$field] ?? '';
}
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

$imageAbs    = str_starts_with($image,'http') ? $image : SITE_URL.'/'.ltrim($image,'/');
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
    'tr'=>['home'=>'Ana Sayfa','tours'=>'Turlar','overview'=>'Tur Hakkında','day'=>'Gün','included'=>'Fiyata Dahil Olanlar','excluded'=>'Fiyata Dahil Olmayanlar','pricing'=>'Başlangıç Fiyatları','notes'=>'Önemli Notlar','map'=>'Tur Rotası','gallery'=>'Fotoğraf Galerisi','priceTitle'=>'BAŞLANGIÇ FİYATI','emailBtn'=>'Bilgi Al','waBtn'=>'WhatsApp Rezervasyon','pricingNote'=>'(*) Belirtilen fiyatlar başlangıç fiyatlarıdır.','pricingCol1'=>'Otel Sınıfı','pricingCol2'=>'Fiyat (Kişi Başı)','faqTitle'=>'Sıkça Sorulan Sorular'],
    'en'=>['home'=>'Home','tours'=>'Tours','overview'=>'Overview','day'=>'Day','included'=>'Included','excluded'=>'Not Included','pricing'=>'Starting Prices','notes'=>'Notes','map'=>'Map','gallery'=>'Gallery','priceTitle'=>'STARTING FROM','emailBtn'=>'Inquire Now','waBtn'=>'Book via WhatsApp','pricingNote'=>'(*) Prices are starting prices. Contact us for exact pricing.','pricingCol1'=>'Hotel Class','pricingCol2'=>'Price (per person)','faqTitle'=>'Frequently Asked Questions'],
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

$imgWidth  = $tour['imageWidth']  ?? 1920;
$imgHeight = $tour['imageHeight'] ?? 1080;

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

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="dns-prefetch" href="https://cdnjs.cloudflare.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Inter:wght@400;500;600;700&display=swap" media="print" onload="this.media='all'">
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Inter:wght@400;500;600;700&display=swap"></noscript>

<?php if($image): ?>
<link rel="preload" as="image"
      href="<?=htmlspecialchars($image)?>"
      fetchpriority="high"
      imagesrcset="<?=htmlspecialchars($image)?>"
      imagesizes="100vw">
<?php endif; ?>

<link rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      media="print" onload="this.media='all'">
<noscript>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</noscript>
<link rel="stylesheet" href="/style.css">

<style>
/* ─── RESET ──────────────────────────────────────────────── */
*,*::before,*::after { margin:0; padding:0; box-sizing:border-box; }
html { overflow-x:hidden; scroll-behavior:smooth; }
body { font-family:'Inter',sans-serif; background:#f8fafc; color:#1e293b; overflow-x:hidden; }

/* ─── NAV ────────────────────────────────────────────────── */
nav {
  position:fixed !important; top:0; left:0; right:0;
  z-index:1000; min-height:64px;
  background:rgba(255,255,255,0.97) !important;
  backdrop-filter:blur(16px) !important;
  border-bottom:1px solid rgba(0,0,0,0.06) !important;
  box-shadow:none !important;
  will-change:transform; contain:layout style;
}
.header-top-row { display:none !important; }
.nav-container {
  display:flex !important; align-items:center !important;
  justify-content:space-between !important;
  padding:0 48px !important; height:64px !important;
  max-width:100% !important; margin:0 !important;
}
.logo { display:flex !important; align-items:center !important; gap:12px !important; text-decoration:none !important; }
.logo img { height:38px !important; width:38px !important; border-radius:8px !important; object-fit:cover !important; }
.logo-text { display:flex !important; flex-direction:column !important; }
.logo-title { font-family:'Playfair Display',serif !important; font-size:19px !important; font-weight:700 !important; color:#0c4a6e !important; line-height:1 !important; }
.logo-subtitle { font-size:9px !important; color:#94a3b8 !important; letter-spacing:2px !important; text-transform:uppercase !important; margin-top:3px !important; }
.nav-links { display:flex !important; gap:36px !important; align-items:center !important; flex:1 !important; justify-content:center !important; list-style:none !important; }
.nav-links li { display:inline !important; }
.nav-links a { color:#475569 !important; text-decoration:none !important; font-weight:500 !important; font-size:13px !important; letter-spacing:0.5px !important; transition:color 0.2s !important; text-transform:uppercase; }
.nav-links a:hover { color:#0c4a6e !important; }
.lang-dropdown { position:relative; margin-left:16px; }
.lang-dropdown-btn { background:transparent; border:1px solid #e2e8f0; color:#475569; padding:7px 14px; border-radius:8px; font-weight:500; font-size:13px; cursor:pointer; display:flex; align-items:center; gap:7px; min-height:36px; transition:border-color 0.2s; }
.lang-dropdown-btn:hover { border-color:#94a3b8; }
.lang-dropdown-content { display:none; position:absolute; right:0; top:calc(100% + 8px); background:white; min-width:150px; box-shadow:0 8px 30px rgba(0,0,0,0.1); border-radius:12px; border:1px solid #f1f5f9; overflow:hidden; z-index:1000; }
.lang-dropdown-content a { color:#475569; padding:11px 16px; text-decoration:none; display:block; font-size:13px; font-weight:500; transition:background 0.15s; }
.lang-dropdown-content a:hover { background:#f8fafc; color:#0c4a6e; }
.lang-dropdown.active .lang-dropdown-content { display:block; }
.menu-toggle { display:none !important; font-size:22px !important; color:#475569 !important; background:none !important; border:none !important; cursor:pointer !important; min-width:44px !important; min-height:44px !important; touch-action:manipulation !important; }

/* ─── BREADCRUMB ─────────────────────────────────────────── */
.breadcrumb { padding:16px 48px; background:#fff; margin-top:64px; border-bottom:1px solid #f1f5f9; min-height:52px; }
.breadcrumb-container { max-width:1400px; margin:0 auto; display:flex; align-items:center; gap:8px; font-size:12px; font-weight:500; text-transform:uppercase; letter-spacing:0.7px; }
.breadcrumb a { color:#94a3b8; text-decoration:none; transition:color 0.2s; }
.breadcrumb a:hover { color:#0c4a6e; }
.breadcrumb-separator { color:#e2e8f0; }
.breadcrumb-current { color:#475569; }

/* ─── HERO ───────────────────────────────────────────────── */
.tour-detail-hero {
  position:relative;
  aspect-ratio:16/7; min-height:420px; max-height:70vh;
  overflow:hidden; display:flex; align-items:flex-end;
  background:#0c4a6e; contain:layout paint;
}
.tour-detail-hero img {
  position:absolute; top:0; left:0; width:100%; height:100%;
  object-fit:cover; z-index:0; will-change:auto;
}
.tour-detail-hero::before {
  content:''; position:absolute; inset:0; z-index:1;
  background:linear-gradient(
    to bottom,
    rgba(0,0,0,0.05) 0%,
    rgba(0,0,0,0.15) 35%,
    rgba(0,0,0,0.80) 100%
  );
}
.tour-hero-content {
  position:relative; z-index:2;
  max-width:1400px; margin:0 auto; padding:64px 48px; width:100%; color:white;
}
.tour-badge {
  display:inline-block; padding:5px 14px;
  background:rgba(56,189,248,0.85); backdrop-filter:blur(4px);
  color:white; border-radius:4px; font-size:11px; font-weight:700;
  text-transform:uppercase; letter-spacing:1.5px; margin-bottom:14px;
}
.tour-hero-content h1 {
  font-family:'Playfair Display',serif; font-size:52px; font-weight:900;
  margin-bottom:24px; line-height:1.1;
  text-shadow:0 2px 16px rgba(0,0,0,0.4);
}
.tour-quick-look {
  display:flex; gap:32px; flex-wrap:wrap;
  padding-top:22px; border-top:1px solid rgba(255,255,255,0.12);
}
.quick-item { display:flex; align-items:center; gap:9px; }
.quick-item i { font-size:15px; color:#38bdf8; }
.quick-item span { font-size:14px; font-weight:500; color:rgba(255,255,255,0.88); }

/* ─── CONTENT LAYOUT ─────────────────────────────────────── */
.tour-detail-content { padding:72px 0 96px; background:#f8fafc; }
.tour-grid-layout {
  max-width:1400px; margin:0 auto; padding:0 48px;
  display:grid; grid-template-columns:1fr 340px; gap:64px;
}

/* ─── SECTION HEADINGS — minimal accent bar ──────────────── */
.tour-main h2.section-heading {
  font-size:20px; font-family:'Playfair Display',serif; color:#0f172a;
  margin-bottom:28px; font-weight:700; letter-spacing:-0.2px;
  padding-left:14px;
  border-left:3px solid #38bdf8;
}

/* ─── OVERVIEW ───────────────────────────────────────────── */
.tour-overview {
  font-size:16px; line-height:1.9; color:#475569;
  margin-bottom:64px; white-space:pre-line;
}

/* ─── ITINERARY ──────────────────────────────────────────── */
.itinerary-section { margin-bottom:64px; }
.itinerary-item {
  margin-bottom:6px; border-radius:10px; overflow:hidden; background:#fff;
  border:1px solid #f1f5f9;
  box-shadow:0 1px 3px rgba(0,0,0,0.03);
  transition:border-color 0.2s, box-shadow 0.2s; contain:layout;
}
.itinerary-item.active {
  border-color:#bae6fd;
  box-shadow:0 4px 20px rgba(14,165,233,0.07);
}
.itinerary-day-title {
  font-size:15px; font-weight:600; color:#334155; margin:0;
  padding:17px 22px; background:#fff; cursor:pointer;
  display:flex; justify-content:space-between; align-items:center;
  transition:background 0.15s; user-select:none; min-height:58px;
  gap:16px; touch-action:manipulation;
}
.itinerary-item.active .itinerary-day-title { background:#f0f9ff; color:#0c4a6e; }
.itinerary-day-title:hover { background:#f8fafc; }
.itinerary-day-title .day-info { display:flex; align-items:center; gap:13px; }
.itinerary-day-title span.day-badge {
  background:#0c4a6e; color:white; padding:4px 10px;
  border-radius:4px; font-size:10px; font-weight:700;
  letter-spacing:1px; text-transform:uppercase; flex-shrink:0;
}
.itinerary-item.active .day-badge { background:#0284c7; }
.itinerary-day-title i { color:#cbd5e1; font-size:13px; flex-shrink:0; transition:transform 0.3s; }
.itinerary-item.active .itinerary-day-title i { transform:rotate(180deg); color:#38bdf8; }
.itinerary-desc {
  max-height:0; overflow:hidden;
  transition:max-height 0.4s ease, padding 0.3s;
  font-size:15px; color:#475569; line-height:1.85;
  background:#fff; padding:0 22px; contain:layout style;
}
.itinerary-item.active .itinerary-desc {
  max-height:1000px; padding:20px 22px;
  border-top:1px solid #e0f2fe;
}

/* ─── INFO TABLE ─────────────────────────────────────────── */
.info-table { width:100%; border-collapse:collapse; margin-bottom:64px; }
.info-table tr { border-bottom:1px solid #f1f5f9; }
.info-table tr:last-child { border-bottom:none; }
.info-table td { padding:15px 0; font-size:15px; color:#475569; }
.info-table td:first-child { font-weight:600; color:#0f172a; width:38%; }

/* ─── INCLUDED / EXCLUDED ────────────────────────────────── */
.inc-exc-container { display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:64px; }
.inc-exc-box {
  background:#fff; border-radius:12px; padding:28px 24px;
  border:1px solid #f1f5f9; box-shadow:0 1px 3px rgba(0,0,0,0.03);
}
.inc-exc-box h3 { font-size:15px; font-weight:700; margin-bottom:18px; color:#0f172a; }
.inc-exc-list { list-style:none; }
.inc-exc-list li { display:flex; gap:11px; margin-bottom:11px; font-size:14px; color:#64748b; align-items:flex-start; line-height:1.55; }
.inc-exc-list li i.fa-check { color:#10b981; font-size:13px; margin-top:2px; flex-shrink:0; }
.inc-exc-list li i.fa-minus { color:#cbd5e1; font-size:13px; margin-top:2px; flex-shrink:0; }

/* ─── PRICING TABLE ──────────────────────────────────────── */
.pricing-table-container { margin-bottom:64px; overflow-x:auto; }
.pricing-table { width:100%; border-collapse:collapse; }
.pricing-table th {
  background:#f8fafc; padding:13px 18px; font-weight:600;
  font-size:12px; color:#64748b; text-transform:uppercase;
  letter-spacing:0.6px; text-align:left; border-bottom:2px solid #e2e8f0;
}
.pricing-table td { padding:15px 18px; font-size:15px; color:#475569; border-bottom:1px solid #f1f5f9; }
.pricing-table td:first-child { font-weight:600; color:#0f172a; }
.pricing-table tr:last-child td { border-bottom:none; }
.pricing-note { font-size:12px; color:#94a3b8; margin-top:10px; }

/* ─── NOTES ──────────────────────────────────────────────── */
.notes-list { list-style:none; margin-bottom:64px; }
.notes-list li {
  position:relative; padding:13px 16px 13px 40px;
  margin-bottom:6px; font-size:15px; color:#64748b; line-height:1.65;
  background:#fff; border-radius:8px; border:1px solid #f1f5f9;
}
.notes-list li::before { content:'→'; position:absolute; left:16px; color:#38bdf8; font-weight:700; }

/* ─── MAP ────────────────────────────────────────────────── */
.map-container {
  width:100%; height:380px; border-radius:14px; overflow:hidden;
  margin-bottom:64px; background:#e2e8f0;
}
.map-container iframe { width:100%; height:100%; border:none; }

/* ─── GALLERY ────────────────────────────────────────────── */
.gallery-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-bottom:40px; }
.gallery-item {
  border-radius:10px; overflow:hidden; cursor:pointer;
  aspect-ratio:4/3; background:#e2e8f0;
  transition:transform 0.25s, box-shadow 0.25s; contain:layout paint;
}
.gallery-item:hover { transform:translateY(-4px); box-shadow:0 12px 32px rgba(0,0,0,0.13); }
.gallery-item img { width:100%; height:100%; object-fit:cover; display:block; transition:transform 0.5s; }
.gallery-item:hover img { transform:scale(1.06); }

/* ─── FAQ ────────────────────────────────────────────────── */
.faq-list { margin-bottom:64px; }
.faq-item {
  border:1px solid #f1f5f9; border-radius:10px; margin-bottom:6px;
  overflow:hidden; background:#fff; box-shadow:0 1px 3px rgba(0,0,0,0.03);
  transition:border-color 0.2s; contain:layout;
}
.faq-item.active { border-color:#bae6fd; }
.faq-question {
  font-size:15px; font-weight:600; color:#334155; margin:0;
  padding:17px 22px; background:#fff; cursor:pointer;
  display:flex; justify-content:space-between; align-items:center; gap:16px;
  user-select:none; transition:background 0.15s; min-height:58px; touch-action:manipulation;
}
.faq-question:hover { background:#f8fafc; }
.faq-item.active .faq-question { background:#f0f9ff; color:#0284c7; }
.faq-question i { color:#cbd5e1; font-size:13px; flex-shrink:0; transition:transform 0.3s; }
.faq-item.active .faq-question i { transform:rotate(180deg); color:#38bdf8; }
.faq-answer {
  max-height:0; overflow:hidden;
  transition:max-height 0.4s ease, padding 0.3s;
  font-size:15px; color:#475569; line-height:1.85; padding:0 22px; background:#fff; contain:layout style;
}
.faq-item.active .faq-answer { max-height:600px; padding:20px 22px; border-top:1px solid #e0f2fe; }

/* ─── SIDEBAR ────────────────────────────────────────────── */
.tour-sidebar { position:sticky; top:92px; height:fit-content; }
.tour-booking-card {
  background:#fff; padding:36px 32px; border-radius:20px;
  box-shadow:0 4px 24px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04);
  border:1px solid #f1f5f9;
}
.price-label {
  font-size:10px; color:#94a3b8; font-weight:600;
  text-transform:uppercase; letter-spacing:1.5px; margin-bottom:8px;
}
.price-amount {
  font-size:42px; font-weight:900; color:#0c4a6e;
  font-family:'Playfair Display',serif; line-height:1; margin-bottom:28px;
}
.booking-cta { display:flex; flex-direction:column; gap:10px; }
.btn {
  display:flex; align-items:center; justify-content:center; gap:8px;
  padding:14px 20px; border-radius:10px; font-weight:600; font-size:13px;
  text-decoration:none; transition:all 0.2s; text-transform:uppercase;
  letter-spacing:0.5px; min-height:48px; cursor:pointer; touch-action:manipulation;
}
.btn-primary { background:#0c4a6e; color:white; }
.btn-primary:hover { background:#083454; box-shadow:0 4px 16px rgba(12,74,110,0.25); transform:translateY(-1px); }
.btn-outline { background:transparent; border:1.5px solid #25d366; color:#25d366; }
.btn-outline:hover { background:#25d366; color:white; }

/* ─── LIGHTBOX ───────────────────────────────────────────── */
.lightbox { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.96); z-index:10000; justify-content:center; align-items:center; }
.lightbox.active { display:flex; }
.lightbox-content img { max-width:90vw; max-height:90vh; border-radius:10px; }
.lightbox-close,.lightbox-nav { position:absolute; background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.12); color:white; border-radius:50%; cursor:pointer; display:flex; justify-content:center; align-items:center; transition:background 0.2s; min-width:46px; min-height:46px; touch-action:manipulation; }
.lightbox-close { top:20px; right:20px; width:46px; height:46px; font-size:20px; }
.lightbox-nav { top:50%; transform:translateY(-50%); width:46px; height:46px; }
.lightbox-prev { left:20px; } .lightbox-next { right:20px; }
.lightbox-close:hover,.lightbox-nav:hover { background:rgba(255,255,255,0.16); }

/* ─── WHATSAPP FLOAT ─────────────────────────────────────── */
.whatsapp-float {
  position:fixed; bottom:28px; right:28px; z-index:999;
  background:#25d366; color:white; border-radius:50%;
  width:52px; height:52px; display:flex; align-items:center; justify-content:center;
  font-size:24px; box-shadow:0 4px 16px rgba(37,211,102,0.3);
  text-decoration:none; transition:transform 0.2s, background 0.2s; touch-action:manipulation;
}
.whatsapp-float:hover { transform:scale(1.08); background:#1da851; }

/* ─── RESPONSIVE ─────────────────────────────────────────── */
@media (max-width:1100px) {
  .tour-grid-layout { grid-template-columns:1fr; gap:40px; }
  .tour-sidebar { position:static; }
}
@media (max-width:768px) {
  .nav-links {
    position:fixed !important; top:0 !important; right:-100% !important;
    height:100vh !important; width:80% !important; max-width:320px !important;
    background:white !important; flex-direction:column !important;
    padding:90px 32px !important; transition:right 0.35s !important;
    align-items:flex-start !important; box-shadow:-4px 0 24px rgba(0,0,0,0.12) !important;
    z-index:999 !important;
  }
  .nav-links.active { right:0 !important; }
  .menu-toggle { display:flex !important; align-items:center !important; justify-content:center !important; }
  .tour-hero-content h1 { font-size:38px; }
  .inc-exc-container { grid-template-columns:1fr; }
  .gallery-grid { grid-template-columns:repeat(2,1fr); }
  .tour-grid-layout { padding:0 24px; }
  .breadcrumb { padding:14px 24px; }
  .nav-container { padding:0 24px !important; height:60px !important; }
}
@media (max-width:480px) {
  .tour-hero-content h1 { font-size:28px; }
  .tour-hero-content { padding:48px 24px; }
  .gallery-grid { grid-template-columns:1fr; }
  .tour-quick-look { gap:18px; }
}

/* =======================================================
   PELORUS İLHAMLI LÜKS TASARIM GÜNCELLEMESİ (tour.php)
   ======================================================= */

/* 1. SİNEMATİK HERO (Daha büyük ve ortalanmış zarif başlık) */
.tour-detail-hero { min-height: 80vh; }
.tour-hero-content { text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.tour-hero-content h1 { font-size: 64px; text-transform: uppercase; letter-spacing: 4px; font-weight: 400; text-shadow: 0 4px 20px rgba(0,0,0,0.5); }
.tour-badge { background: transparent; border: 1px solid #d4af37; color: #d4af37; letter-spacing: 3px; padding: 8px 24px; border-radius: 0; }
.tour-quick-look { justify-content: center; border-top: none; margin-top: 15px; }

/* 2. ZARİF BAŞLIKLAR (Kalın mavi çizgiyi silip altını çiziyoruz) */
.tour-main h2.section-heading {
    border-left: none; text-align: center; font-size: 34px; padding-left: 0;
    margin-bottom: 50px; margin-top: 40px; position: relative; color: #0c4a6e;
    font-weight: 400; letter-spacing: 1px;
}
.tour-main h2.section-heading::after {
    content: ''; position: absolute; bottom: -15px; left: 50%;
    transform: translateX(-50%); width: 50px; height: 1px; background: #d4af37;
}

/* 3. KUTUSUZ (EDİTORYAL) TUR PROGRAMI (Akordiyon gölgelerini siliyoruz) */
.itinerary-item { border: none; border-bottom: 1px solid #e2e8f0; border-radius: 0; box-shadow: none; margin-bottom: 0; background: transparent; }
.itinerary-item.active { border-color: #d4af37; box-shadow: none; background: transparent; }
.itinerary-day-title { background: transparent !important; padding: 28px 0; font-family: 'Playfair Display', serif; font-size: 24px; color: #1e293b; font-weight: 400; }
.itinerary-day-title:hover { color: #0c4a6e; background: transparent; }
.itinerary-item.active .itinerary-day-title { color: #d4af37; background: transparent; }
.day-badge { background: transparent !important; color: #0c4a6e !important; border: 1px solid #0c4a6e; font-family: 'Inter', sans-serif; font-size: 11px; letter-spacing: 2px; padding: 4px 14px; border-radius: 0; }
.itinerary-item.active .day-badge { color: #d4af37 !important; border-color: #d4af37; }
.itinerary-desc { padding: 0 0 24px 0; background: transparent; font-size: 16px; color: #475569; line-height: 1.9; }
.itinerary-item.active .itinerary-desc { padding: 0 0 35px 0; border-top: none; }

/* 4. MİNİMALİST DAHİL/HARİÇ LİSTESİ */
.inc-exc-box { background: transparent; border: none; box-shadow: none; padding: 0 20px; }
.inc-exc-box h3 { font-family: 'Playfair Display', serif; font-size: 24px; font-weight: 400; border-bottom: 1px solid #e2e8f0; padding-bottom: 15px; margin-bottom: 25px; text-align: center; }

/* 5. ASİMETRİK GALERİ (Dergi Tarzı, Keskin Hatlar) */
.gallery-grid { grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 60px; }
.gallery-item { border-radius: 0; aspect-ratio: auto; height: 400px; box-shadow: none; }
.gallery-item:nth-child(1) { grid-column: span 2; height: 600px; } /* İlk fotoğraf devasa boyutlu */
.gallery-item:hover { transform: scale(1.02); box-shadow: 0 15px 40px rgba(0,0,0,0.15); }

/* 6. TEMİZ REZERVASYON MODÜLÜ (Sağ Taraf) */
.tour-booking-card { background: #fff; border: none; box-shadow: 0 10px 40px rgba(0,0,0,0.05); border-top: 2px solid #0c4a6e; padding: 45px 35px; border-radius: 0; }
.price-amount { color: #0f172a; font-size: 52px; font-weight: 400; letter-spacing: -1px; }
.btn-primary { background: #0c4a6e; border-radius: 0; font-weight: 500; letter-spacing: 2px; }
.btn-primary:hover { background: #d4af37; transform: translateY(-2px); box-shadow: 0 10px 20px rgba(212,175,55,0.2); }
.btn-outline { border-radius: 0; border-color: #1e293b; color: #1e293b; font-weight: 500; letter-spacing: 2px; }
.btn-outline:hover { background: #1e293b; color: #fff; }

/* MOBİL UYUM */
@media (max-width: 768px) {
    .tour-detail-hero { min-height: 60vh; }
    .tour-hero-content h1 { font-size: 42px; }
    .gallery-item { height: 250px; }
    .gallery-item:nth-child(1) { height: 350px; }
}

/* =======================================================
   PELORUS İLHAMLI LÜKS TASARIM GÜNCELLEMESİ
   ======================================================= */
/* 1. Sinematik Hero (Ortalanmış ve büyük) */
.tour-detail-hero { min-height: 75vh; }
.tour-hero-content { text-align: center; }
.tour-hero-content h1 { font-size: 56px; text-transform: uppercase; letter-spacing: 4px; font-weight: 400; text-shadow: 0 4px 20px rgba(0,0,0,0.5); }
.tour-quick-look { justify-content: center; border-top: none; margin-top: 20px; }

/* 2. Tur Programı (Akordiyonları kaldırıp editoryal metin yapıyoruz) */
.itinerary-item { border: none; background: transparent; box-shadow: none; margin-bottom: 40px; }
.itinerary-day-title { background: transparent !important; padding: 0 0 15px 0; font-family: 'Playfair Display', serif; font-size: 28px; color: #0f172a; cursor: default; border-bottom: 1px solid #e2e8f0; pointer-events: none; }
.itinerary-day-title i { display: none; } /* Ok ikonunu tamamen gizliyoruz */
.itinerary-desc { max-height: none !important; padding: 25px 0; font-size: 16.5px; color: #475569; line-height: 1.9; }

/* 3. Araya Giren Dev Fotoğraflar (Dergi Hissi) */
.editorial-image { width: 100%; height: 600px; object-fit: cover; margin: 20px 0 60px 0; border-radius: 0; }

/* 4. Asimetrik (Yapboz) Galeri En Altta */
.gallery-grid { display: grid; grid-template-columns: repeat(3, 1fr); grid-auto-rows: 250px; gap: 15px; margin-bottom: 60px; }
.gallery-item { height: 100%; border-radius: 0; box-shadow: none; transition: transform 0.4s; }
.gallery-item:hover { transform: scale(1.02); z-index: 10; box-shadow: 0 20px 40px rgba(0,0,0,0.2); }
.gallery-item:nth-child(1) { grid-column: span 2; grid-row: span 2; } /* İlk fotoğraf devasa */
.gallery-item:nth-child(4) { grid-column: span 2; } /* Araya giren başka bir büyük fotoğraf */

/* 5. Havada Asılı (Sticky) Rezervasyon Kutusu */
@media (min-width: 1100px) {
    .tour-sidebar { position: sticky; top: 100px; }
    .tour-booking-card { border-radius: 0; border-top: 3px solid #0c4a6e; }
}

</style>
</head>
<body>

<nav id="navbar">
  <div class="nav-container">
    <a href="/" class="logo">
      <img src="/assets/walkabout_travel_logo.jpg"
           alt="WalkAbout Travel Logo" width="38" height="38"
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
    <span class="breadcrumb-current"><?=htmlspecialchars(mb_strimwidth($title,0,55,'…'))?></span>
  </div>
</div>

<div class="tour-detail-hero">
  <?php if($image): ?>
  <img src="<?=htmlspecialchars($image)?>"
       alt="<?=htmlspecialchars($title)?>"
       width="<?=(int)$imgWidth?>" height="<?=(int)$imgHeight?>"
       fetchpriority="high" decoding="async">
  <?php endif; ?>
  <div class="tour-hero-content">
    <span class="tour-badge"><?=htmlspecialchars($tour['category']??'TUR')?></span>
    <h1><?=htmlspecialchars($title)?></h1>
    <div class="tour-quick-look">
      <?php if(!empty($tour['meta'])): ?>
        <?php foreach(['duration'=>'fa-clock','languages'=>'fa-globe','months'=>'fa-calendar-check','availability'=>'fa-user-friends'] as $mk=>$icon): ?>
        <?php if(!empty($tour['meta'][$mk])): ?>
        <div class="quick-item"><i class="fas <?=$icon?>" aria-hidden="true"></i><span><?=htmlspecialchars($tour['meta'][$mk])?></span></div>
        <?php endif; ?>
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
      <?php if(!empty($itinerary)): ?>
      <div class="itinerary-section">
        <?php
        $dayLabel = match($currentLang) {
            'en' => 'Day', 'es' => 'Día', 'pt' => 'Dia', 'ar' => 'اليوم', default => 'Gün'
        };
        $photoIndex = 0; // Galeriden sırayla fotoğraf çekmek için sayaç
        
        foreach ($itinerary as $index => $day):
          $dayTitle = ($currentLang === 'tr')
              ? ($day['title'] ?? '')
              : ($day['title_' . $currentLang] ?? $day['title_en'] ?? $day['title'] ?? '');
          $dayDesc = ($currentLang === 'tr')
              ? ($day['description'] ?? '')
              : ($day['description_' . $currentLang] ?? $day['description_en'] ?? $day['description'] ?? '');
          $dayNum  = htmlspecialchars($day['day'] ?? ($index + 1));
        ?>
        
        <!-- Gün Açıklaması -->
        <div class="itinerary-item active">
          <div class="itinerary-day-title">
            <span style="color:#d4af37; font-weight:700; font-size:13px; text-transform:uppercase; letter-spacing:3px; display:block; margin-bottom:10px; font-family:'Inter', sans-serif;">
                <?= $dayLabel ?> <?= $dayNum ?>
            </span>
            <?= htmlspecialchars($dayTitle) ?>
          </div>
          <div class="itinerary-desc">
            <?= nl2br(htmlspecialchars($dayDesc)) ?>
          </div>
        </div>
        
        <!-- Sihirli Dokunuş: Her 2 günde bir araya galeriden fotoğraf ekle -->
        <?php if ($index % 2 == 0 && isset($gallery[$photoIndex])): ?>
            <img src="<?= htmlspecialchars($gallery[$photoIndex]) ?>" class="editorial-image" alt="<?= htmlspecialchars($title) ?> Manzarası" loading="lazy">
        <?php $photoIndex++; endif; ?>
        
        <?php endforeach; ?>
      </div>
      <?php endif; ?>

      <?php if(!empty($tour['departureReturn'])): ?>
      <table class="info-table">
        <?php foreach($tour['departureReturn'] as $item):
          $parts = explode(':',$item,2); ?>
        <tr>
          <?php if(count($parts)>1): ?>
          <td><?=htmlspecialchars(trim($parts[0]))?></td>
          <td><?=htmlspecialchars(trim($parts[1]))?></td>
          <?php else: ?>
          <td colspan="2"><?=htmlspecialchars($item)?></td>
          <?php endif; ?>
        </tr>
        <?php endforeach; ?>
      </table>
      <?php endif; ?>

      <?php if((is_array($included)&&count($included))||(is_array($notIncluded)&&count($notIncluded))): ?>
      <div class="inc-exc-container">
        <div class="inc-exc-box">
          <h3><?=$L['included']?></h3>
          <ul class="inc-exc-list">
            <?php if(is_array($included)) foreach($included as $item): ?>
            <li><i class="fas fa-check" aria-hidden="true"></i><span><?=htmlspecialchars($item)?></span></li>
            <?php endforeach; ?>
          </ul>
        </div>
        <div class="inc-exc-box">
          <h3><?=$L['excluded']?></h3>
          <ul class="inc-exc-list">
            <?php if(is_array($notIncluded)) foreach($notIncluded as $item): ?>
            <li><i class="fas fa-minus" aria-hidden="true"></i><span><?=htmlspecialchars($item)?></span></li>
            <?php endforeach; ?>
          </ul>
        </div>
      </div>
      <?php endif; ?>

      <?php if(!empty($tour['pricing'])&&(isset($tour['pricing']['economy'])||isset($tour['pricing']['comfort'])||isset($tour['pricing']['luxury']))): ?>
      <div class="pricing-table-container">
        <h2 class="section-heading"><?=$L['pricing']?></h2>
        <table class="pricing-table">
          <thead><tr><th><?=$L['pricingCol1']?></th><th><?=$L['pricingCol2']?></th></tr></thead>
          <tbody>
            <?php if(!empty($tour['pricing']['economy'])): ?><tr><td>Economy</td><td><?=htmlspecialchars($tour['pricing']['economy'])?></td></tr><?php endif; ?>
            <?php if(!empty($tour['pricing']['comfort'])): ?><tr><td>Comfort</td><td style="color:#1d4ed8;"><?=htmlspecialchars($tour['pricing']['comfort'])?></td></tr><?php endif; ?>
            <?php if(!empty($tour['pricing']['luxury'])): ?><tr><td>Luxury</td><td style="color:#a16207;"><?=htmlspecialchars($tour['pricing']['luxury'])?></td></tr><?php endif; ?>
          </tbody>
        </table>
        <p class="pricing-note"><?=$L['pricingNote']?></p>
      </div>
      <?php endif; ?>

      <?php if(is_array($notes)&&count($notes)): ?>
      <div style="margin-bottom:64px;">
        <h2 class="section-heading"><?=$L['notes']?></h2>
        <ul class="notes-list">
          <?php foreach($notes as $n): ?><li><?=htmlspecialchars($n)?></li><?php endforeach; ?>
        </ul>
      </div>
      <?php endif; ?>

      <?php if(!empty($tour['mapUrl'])): ?>
      <div style="margin-bottom:64px;">
        <h2 class="section-heading"><?=$L['map']?></h2>
        <div class="map-container">
          <iframe src="<?=htmlspecialchars($tour['mapUrl'])?>"
                  title="<?=htmlspecialchars($title)?> harita"
                  allowfullscreen loading="lazy"
                  referrerpolicy="no-referrer-when-downgrade"></iframe>
        </div>
      </div>
      <?php endif; ?>

      <?php if(!empty($gallery)): ?>
      <div style="margin-bottom:64px;">
        <h2 class="section-heading"><?=$L['gallery']?></h2>
        <div class="gallery-grid">
          <?php foreach($gallery as $idx=>$img): ?>
          <div class="gallery-item"
               onclick="openLightbox(<?=$idx?>)"
               role="button" tabindex="0"
               aria-label="<?=htmlspecialchars($title)?> <?=$idx+1?>">
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
      <div style="margin-bottom:64px;">
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
                role="button" tabindex="0"
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
             target="_blank" rel="noopener noreferrer"
             aria-label="WhatsApp rezervasyon">
            <i class="fab fa-whatsapp" aria-hidden="true"></i>
            <?=$L['waBtn']?>
          </a>
        </div>
      </div>
    </div>

  </div>
</div>

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
   class="whatsapp-float" target="_blank" rel="noopener noreferrer"
   aria-label="WhatsApp ile iletişim">
  <i class="fab fa-whatsapp" aria-hidden="true"></i>
</a>

<script>
const galleryImages = <?=json_encode($gallery,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES)?>;
let currentImageIndex = 0;

function openLightbox(i) {
  currentImageIndex = i;
  document.getElementById('lightboxImg').src = galleryImages[i];
  document.getElementById('lightbox').classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  document.getElementById('lightbox').classList.remove('active');
  document.body.style.overflow = '';
}
function changeImage(d) {
  currentImageIndex = (currentImageIndex + d + galleryImages.length) % galleryImages.length;
  document.getElementById('lightboxImg').src = galleryImages[currentImageIndex];
}
function toggleAccordion(btn) {
  const item = btn.closest('.itinerary-item');
  const isActive = item.classList.contains('active');
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
function toggleFaq(btn) {
  const item = btn.closest('.faq-item');
  requestAnimationFrame(() => {
    item.classList.toggle('active');
    btn.setAttribute('aria-expanded', item.classList.contains('active') ? 'true' : 'false');
  });
}
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
sessionStorage.setItem('language','<?=$currentLang?>');
</script>
<script src="/i18n.js" defer></script>
<script src="/app.js" defer></script>
</body>
</html>
