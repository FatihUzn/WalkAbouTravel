<?php
/* ============================================================
   tour.php — Tur detay sayfası
   Ortak ayar/fonksiyonlar config.php + functions.php'de.
   ============================================================ */
require_once __DIR__ . '/functions.php';

$currentLang = detectLang();
$uri  = currentPath();
$slug = ($currentLang === 'tr')
      ? ltrim($uri, '/')
      : substr($uri, strlen('/'.$currentLang.'/'));

$tours = loadTours();

// --- Turu bul: önce kendi dilinde, sonra diğer dillerin slug'larında ---
$tour = null;
foreach ($tours as $t) { if (tourSlug($t, $currentLang) === $slug) { $tour = $t; break; } }
if (!$tour) {
    foreach ($tours as $t) {
        foreach (array_keys($LANG_PREFIXES) as $lc) {
            if (tourSlug($t, $lc) === $slug) { $tour = $t; break 2; }
        }
    }
}
if (!$tour) send404();

// --- Kanonik adres kendi dilinin slug'ı olmalı ---
$ownSlug = tourSlug($tour, $currentLang);
if ($ownSlug && $ownSlug !== $slug) {
    header('Location: ' . tourUrl($tour, $currentLang), true, 301); exit;
}
$slug = $ownSlug;

$title       = getLangField($tour,'title',$currentLang);
$description = getLangField($tour,'description',$currentLang);
$price       = $tour['price'] ?? '';
$duration    = getLangField($tour,'duration',$currentLang) ?: ($tour['duration'] ?? '');
$location    = $tour['location'] ?? '';
$image       = $tour['image'] ?? '';

$canonicalUrl = SITE_URL . $LANG_PREFIXES[$currentLang] . '/' . $slug . '/';

// --- hreflang: slug'ı boş olan dil ATLANIR (eskiden /ar// üretiyordu) ---
$hreflang = [];
foreach ($LANG_PREFIXES as $lc => $p) {
    $s = tourSlug($tour, $lc);
    if ($s !== '') $hreflang[$lc] = SITE_URL . $p . '/' . $s . '/';
}

$imageAbs = imgAbs($image);
$heroImg  = imgAttrs($image, '100vw');

// --- SSS ---
$faqKey   = $currentLang === 'tr' ? 'faq' : 'faq_'.$currentLang;
$faqItems = !empty($tour[$faqKey]) ? $tour[$faqKey]
          : (!empty($tour['faq_en']) ? $tour['faq_en'] : ($tour['faq'] ?? []));

// --- Yapılandırılmış veri ---
// NOT: aggregateRating BİLEREK basılmıyor. Gerçek yorum verisi yok;
//      uydurma puan Google'ın yorum işaretleme politikasını ihlal eder.
$shortDesc = mb_substr(strip_tags($description), 0, 160);
$schemaArr = [
    '@context'=>'https://schema.org','@type'=>'TouristTrip',
    'name'=>$title,'description'=>$shortDesc,'url'=>$canonicalUrl,
    'touristType'=>$tour['category'] ?? 'General','duration'=>$duration,
    'provider'=>['@type'=>'TravelAgency','name'=>SITE_NAME,'url'=>SITE_URL,
                 'telephone'=>CONTACT_PHONE,'email'=>CONTACT_EMAIL],
];
if ($imageAbs) $schemaArr['image'] = $imageAbs;
$offer = priceOffer($tour, $canonicalUrl);
if ($offer) $schemaArr['offers'] = $offer;
$schema = json_encode($schemaArr, JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES|JSON_PRETTY_PRINT);

$faqSchema = '';
if (!empty($faqItems) && is_array($faqItems)) {
    $entities = [];
    foreach ($faqItems as $item) {
        if (empty($item['q']) || empty($item['a'])) continue;
        $entities[] = ['@type'=>'Question','name'=>$item['q'],
                       'acceptedAnswer'=>['@type'=>'Answer','text'=>strip_tags($item['a'])]];
    }
    if ($entities) $faqSchema = json_encode(
        ['@context'=>'https://schema.org','@type'=>'FAQPage','mainEntity'=>$entities],
        JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES|JSON_PRETTY_PRINT);
}

$dict = [
    'tr'=>['highlights'=>'Öne Çıkanlar','home'=>'Ana Sayfa','tours'=>'Turlar','whyus'=>'Neden Biz','blog'=>'Blog','contact'=>'İletişim','overview'=>'Tur Hakkında','day'=>'Gün','included'=>'Fiyata Dahil Olanlar','excluded'=>'Fiyata Dahil Olmayanlar','pricing'=>'Başlangıç Fiyatları','notes'=>'Önemli Notlar','map'=>'Tur Rotası','gallery'=>'Fotoğraf Galerisi','priceTitle'=>'BAŞLANGIÇ FİYATI','emailBtn'=>'Bilgi Al','waBtn'=>'WhatsApp Rezervasyon','pricingNote'=>'(*) Belirtilen fiyatlar başlangıç fiyatlarıdır.','pricingCol1'=>'Otel Sınıfı','pricingCol2'=>'Fiyat (Kişi Başı)','faqTitle'=>'Sıkça Sorulan Sorular','seoTourWord'=>'Turu','seoFrom'=>"'dan başlayan fiyatlarla",'seoCta'=>"Hemen WhatsApp'tan bilgi al!",'askPrice'=>'Fiyat için bize ulaşın','waMsg'=>'Merhaba, "%s" turu hakkında bilgi almak istiyorum.','mailSub'=>'%s — Bilgi Talebi'],
    'en'=>['highlights'=>'Tour Highlights','home'=>'Home','tours'=>'Tours','whyus'=>'Why Us','blog'=>'Blog','contact'=>'Contact','overview'=>'Overview','day'=>'Day','included'=>'Included','excluded'=>'Not Included','pricing'=>'Starting Prices','notes'=>'Notes','map'=>'Map','gallery'=>'Gallery','priceTitle'=>'STARTING FROM','emailBtn'=>'Inquire Now','waBtn'=>'Book via WhatsApp','pricingNote'=>'(*) Prices are starting prices. Contact us for exact pricing.','pricingCol1'=>'Hotel Class','pricingCol2'=>'Price (per person)','faqTitle'=>'Frequently Asked Questions','seoTourWord'=>'Tour','seoFrom'=>'from','seoCta'=>'Get instant info on WhatsApp!','askPrice'=>'Contact us for pricing','waMsg'=>'Hello, I would like information about the "%s" tour.','mailSub'=>'%s — Enquiry'],
    'es'=>['highlights'=>'Lo Más Destacado','home'=>'Inicio','tours'=>'Tours','whyus'=>'Por Qué Nosotros','blog'=>'Blog','contact'=>'Contacto','overview'=>'Visión General','day'=>'Día','included'=>'Incluido','excluded'=>'No Incluido','pricing'=>'Precios','notes'=>'Notas','map'=>'Mapa','gallery'=>'Galería','priceTitle'=>'DESDE','emailBtn'=>'Consultar','waBtn'=>'Reservar (WhatsApp)','pricingNote'=>'(*) Precios iniciales.','pricingCol1'=>'Clase de Hotel','pricingCol2'=>'Precio (por persona)','faqTitle'=>'Preguntas Frecuentes','seoTourWord'=>'Tour','seoFrom'=>'desde','seoCta'=>'¡Info al instante por WhatsApp!','askPrice'=>'Consulte el precio','waMsg'=>'Hola, quisiera información sobre el tour "%s".','mailSub'=>'%s — Consulta'],
    'pt'=>['highlights'=>'Destaques','home'=>'Início','tours'=>'Passeios','whyus'=>'Por Que Nós','blog'=>'Blog','contact'=>'Contacto','overview'=>'Visão Geral','day'=>'Dia','included'=>'Incluído','excluded'=>'Não Incluído','pricing'=>'Preços Iniciais','notes'=>'Notas','map'=>'Mapa','gallery'=>'Galeria','priceTitle'=>'A PARTIR DE','emailBtn'=>'Consultar Agora','waBtn'=>'Reservar via WhatsApp','pricingNote'=>'(*) Os preços são iniciais.','pricingCol1'=>'Classe de Hotel','pricingCol2'=>'Preço (por pessoa)','faqTitle'=>'Perguntas Frequentes','seoTourWord'=>'Passeio','seoFrom'=>'a partir de','seoCta'=>'Info instantânea pelo WhatsApp!','askPrice'=>'Consulte o preço','waMsg'=>'Olá, gostaria de informações sobre o passeio "%s".','mailSub'=>'%s — Pedido de Informação'],
    'ar'=>['highlights'=>'أبرز المعالم','home'=>'الرئيسية','tours'=>'جولات','whyus'=>'لماذا نحن','blog'=>'مدونة','contact'=>'اتصل بنا','overview'=>'ملخص','day'=>'يوم','included'=>'مشمول','excluded'=>'غير مشمول','pricing'=>'الأسعار','notes'=>'ملاحظات','map'=>'خريطة','gallery'=>'صالة عرض','priceTitle'=>'يبدأ من','emailBtn'=>'استفسر الآن','waBtn'=>'واتساب','pricingNote'=>'(*) أسعار مبدئية.','pricingCol1'=>'فئة الفندق','pricingCol2'=>'السعر (للشخص)','faqTitle'=>'الأسئلة الشائعة','seoTourWord'=>'جولة','seoFrom'=>'ابتداءً من','seoCta'=>'احصل على معلومات فورية عبر واتساب!','askPrice'=>'اتصل بنا للسعر','waMsg'=>'مرحباً، أود الحصول على معلومات عن جولة "%s".','mailSub'=>'%s — استفسار'],
];
$L  = $dict[$currentLang] ?? $dict['tr'];
$LP = $LANG_PREFIXES[$currentLang];

/* ─── SEO başlık & açıklama ─────────────────────────────── */
$seoTitle = $title;
if ($duration) $seoTitle .= ' | '.$duration.' '.$L['seoTourWord'];
if ($price)    $seoTitle .= ' '.$L['seoFrom'].' '.$price;
$seoTitle = mb_strimwidth($seoTitle, 0, 45, '').' | '.SITE_NAME;   // ~60 karakter sınırı

$bits = [];
if ($duration) $bits[] = $duration;
if ($price)    $bits[] = $L['seoFrom'].' '.$price;
$seoDesc = ($bits ? implode(' • ', $bits).' — ' : '')
         . mb_substr(strip_tags($description), 0, 110).' '.$L['seoCta'];
$seoDesc = mb_strimwidth($seoDesc, 0, 158, '…');

$descContent = $description;
$content     = getLangField($tour,'content',$currentLang);
if (!$descContent && $content) { $descContent = $content; }
$included    = getLangField($tour,'included',$currentLang);
$notIncluded = getLangField($tour,'not_included',$currentLang);
$notes       = getLangField($tour,'notes',$currentLang);
$gallery     = $tour['gallery'] ?? ($image ? [$image] : []);
/* Öne çıkanlar: veride 5 dilde hazır duruyordu ama sayfada hiç basılmıyordu.
   402 madde × 5 dil boşa gidiyordu — tur açıklamaları çok kısa olduğu için
   bu bölüm sayfanın en değerli içeriği. */
$highlights  = getLangField($tour,'highlights',$currentLang);
if (!is_array($highlights)) $highlights = [];

$waMsg    = sprintf($L['waMsg'], $title);
$waHref   = waLink($waMsg);
$mailHref = mailLink(sprintf($L['mailSub'], $title));
$htmlDir  = $currentLang === 'ar' ? ' dir="rtl"' : '';

/* ─── Kırıntı navigasyon (breadcrumb) yapılandırılmış verisi ── */
$breadcrumbSchema = json_encode([
  '@context'=>'https://schema.org','@type'=>'BreadcrumbList','itemListElement'=>[
    ['@type'=>'ListItem','position'=>1,'name'=>$L['home'],  'item'=>SITE_URL.$LP.'/'],
    ['@type'=>'ListItem','position'=>2,'name'=>$L['tours'], 'item'=>SITE_URL.$LP.'/#popular-trips'],
    ['@type'=>'ListItem','position'=>3,'name'=>$title,      'item'=>$canonicalUrl],
  ]], JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);

if ($heroImg) header('Link: <'.$heroImg['full'].'>; rel=preload; as=image; fetchpriority=high', false);
?>
<!DOCTYPE html>
<html lang="<?=htmlspecialchars($currentLang)?>"<?=$htmlDir?>>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title><?=htmlspecialchars($seoTitle)?></title>
<meta name="description" content="<?=htmlspecialchars($seoDesc)?>">
<link rel="canonical" href="<?=htmlspecialchars($canonicalUrl)?>">
<?php foreach($hreflang as $lc=>$u): ?>
<link rel="alternate" hreflang="<?=$lc?>" href="<?=htmlspecialchars($u)?>">
<?php endforeach; ?>
<?php if(isset($hreflang['en'])): ?>
<link rel="alternate" hreflang="x-default" href="<?=e($hreflang['en'])?>">
<?php endif; ?>
<meta property="og:type" content="website">
<meta property="og:url" content="<?=htmlspecialchars($canonicalUrl)?>">
<meta property="og:title" content="<?=htmlspecialchars($seoTitle)?>">
<meta property="og:description" content="<?=htmlspecialchars($seoDesc)?>">
<meta property="og:locale" content="<?=e($LANG_LOCALES[$currentLang] ?? 'tr_TR')?>">
<meta property="og:site_name" content="<?=e(SITE_NAME)?>">
<?php if($imageAbs): ?>
<meta property="og:image" content="<?=e($imageAbs)?>">
<meta property="og:image:width" content="1600">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="<?=e($imageAbs)?>">
<?php endif; ?>
<script type="application/ld+json"><?=$schema?></script>
<script type="application/ld+json"><?=$breadcrumbSchema?></script>
<?php if($faqSchema): ?><script type="application/ld+json"><?=$faqSchema?></script><?php endif; ?>
<link rel="icon" type="image/webp" href="/assets/img/walkabout-travel-logo-400.webp">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="dns-prefetch" href="https://cdnjs.cloudflare.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Inter:wght@400;500;600;700&display=swap" media="print" onload="this.media='all'">
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Inter:wght@400;500;600;700&display=swap"></noscript>


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
  width:100%;            /* ← ZORUNLU: aspect-ratio + min-height birlikte
                              genişliği yükseklikten türetiyordu (16/7 × 75vh
                              = 1447px) ve mobilde sayfa yatay kayıyordu. */
  max-width:100%;
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
  max-width:1400px; margin:0 auto; padding:64px 48px;
  width:100%; min-width:0; flex:1 1 100%;
  color:white;
}
/* style.css'teki genel h1 kuralı mirası eziyordu: başlık koyu renkte
   basılıp koyu fotoğrafın üstünde görünmez oluyordu. */
.tour-hero-content h1,
.tour-hero-content .tour-badge,
.tour-hero-content .quick-item span { color:#fff !important; }
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
/* ─── ÖNE ÇIKANLAR ───────────────────────────────────────── */
.highlights-section { margin-bottom:64px; }
.highlights-list { list-style:none; padding:0; margin:0;
  display:grid; grid-template-columns:1fr 1fr; gap:14px 28px; }
.highlights-list li { display:flex; gap:12px; align-items:flex-start;
  font-size:15px; line-height:1.6; color:#475569; }
.highlights-list li i { color:#d4af37; font-size:13px; margin-top:5px; flex-shrink:0; }
@media (max-width:820px){ .highlights-list { grid-template-columns:1fr; gap:12px; } }

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
.tour-detail-hero { min-height: 75vh; width: 100%; }
@media (max-width: 768px) {
    .tour-detail-hero { min-height: 55vh; max-height: none; aspect-ratio: auto; }
    .tour-hero-content { padding: 32px 20px; }
    .tour-hero-content h1 { font-size: 26px; letter-spacing: 1.5px; }
    .tour-grid-layout { grid-template-columns: 1fr !important; gap: 32px !important; padding: 0 20px !important; }
    .inc-exc-container { grid-template-columns: 1fr !important; }
    .gallery-grid { grid-template-columns: repeat(2, 1fr) !important; grid-auto-rows: 160px !important; }
    .gallery-item:nth-child(1), .gallery-item:nth-child(4) { grid-column: span 2 !important; }
    .editorial-image { height: 240px !important; margin: 12px 0 32px !important; }
}
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

/* Galeri öğesi artık <button> — varsayılan buton stilini sıfırla */
.gallery-item { display:block; padding:0; border:none; background:none; cursor:pointer; width:100%; }
.gallery-item img { width:100%; height:100%; object-fit:cover; display:block; }
.gallery-item:focus-visible { outline:3px solid #38bdf8; outline-offset:2px; }

/* SSS başlığı: <h3> içinde <button> — başlık semantiği korunur */
.faq-question { margin:0; }
.faq-toggle { width:100%; display:flex; justify-content:space-between; align-items:center;
  gap:16px; background:none; border:none; padding:inherit; font:inherit; color:inherit;
  text-align:left; cursor:pointer; }
.faq-toggle:focus-visible { outline:3px solid #38bdf8; outline-offset:2px; }

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
      <img src="/assets/img/walkabout-travel-logo-400.webp"
           alt="<?=e(SITE_NAME)?>" width="38" height="38" fetchpriority="high" decoding="async">
      <div class="logo-text">
        <span class="logo-title">WalkAbout Travel</span>
        <span class="logo-subtitle">TOURISM & TRAVEL</span>
      </div>
    </a>
    <ul class="nav-links" id="navLinks">
      <li><a href="<?=$LP?>/"><?=e($L['home'])?></a></li>
      <li><a href="<?=$LP?>/#popular-trips"><?=e($L['tours'])?></a></li>
      <li><a href="<?=$LP?>/#why-us"><?=e($L['whyus'])?></a></li>
      <li><a href="<?=$LP?>/blog/"><?=e($L['blog'])?></a></li>
      <li><a href="<?=$LP?>/#contact"><?=e($L['contact'])?></a></li>
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
    <a href="<?=$LP?>/"><?=e($L['home'])?></a>
    <span class="breadcrumb-separator" aria-hidden="true">›</span>
    <a href="<?=$LP?>/#popular-trips"><?=e($L['tours'])?></a>
    <span class="breadcrumb-separator" aria-hidden="true">›</span>
    <span class="breadcrumb-current"><?=htmlspecialchars(mb_strimwidth($title,0,55,'…'))?></span>
  </div>
</div>

<div class="tour-detail-hero">
  <?php if($heroImg): ?>
  <img src="<?=e($heroImg['full'])?>"
       srcset="<?=e($heroImg['srcset'])?>" sizes="100vw"
       alt="<?=e($title)?>" width="1600" height="1000"
       fetchpriority="high" decoding="async">
  <?php endif; ?>
  <div class="tour-hero-content">
    <span class="tour-badge"><?=htmlspecialchars($tour['category']??'TUR')?></span>
    <h1><?=htmlspecialchars($title)?></h1>
    <div class="tour-quick-look">
      <?php $meta = getLangField($tour,'meta',$currentLang); ?>
      <?php if(!empty($meta) && is_array($meta)): ?>
        <?php foreach(['duration'=>'fa-clock','languages'=>'fa-globe','months'=>'fa-calendar-check','availability'=>'fa-user-friends'] as $mk=>$icon): ?>
        <?php if(!empty($meta[$mk])): ?>
        <div class="quick-item"><i class="fas <?=$icon?>" aria-hidden="true"></i><span><?=e($meta[$mk])?></span></div>
        <?php endif; ?>
        <?php endforeach; ?>
      <?php else: ?>
        <?php if($duration): ?><div class="quick-item"><i class="fas fa-clock" aria-hidden="true"></i><span><?=htmlspecialchars($duration)?></span></div><?php endif; ?>
        <?php if($location): ?><div class="quick-item"><i class="fas fa-map-marker-alt" aria-hidden="true"></i><span><?=htmlspecialchars($location)?></span></div><?php endif; ?>
        <?php if($price): ?><div class="quick-item"><i class="fas fa-tag" aria-hidden="true"></i><span><?=e($price)?></span></div><?php endif; ?>
      <?php endif; ?>
    </div>
  </div>
</div>

<div class="tour-detail-content">
  <div class="tour-grid-layout">

    <div class="tour-main">

      <?php if($descContent): ?>
      <h2 class="section-heading"><?=e($L['overview'])?></h2>
      <div class="tour-overview"><?=nl2br(is_string($descContent)?htmlspecialchars($descContent):'')?></div>
      <?php endif; ?>

      <?php if($highlights): ?>
      <div class="highlights-section">
        <h2 class="section-heading"><?=e($L['highlights'])?></h2>
        <ul class="highlights-list">
          <?php foreach($highlights as $hl): if(!is_string($hl)||$hl==='') continue; ?>
          <li><i class="fas fa-star" aria-hidden="true"></i><span><?=e($hl)?></span></li>
          <?php endforeach; ?>
        </ul>
      </div>
      <?php endif; ?>

      <?php
      $itinerary = [];
      if (!empty($tour['itinerary'])) $itinerary = $tour['itinerary'];
      elseif (!empty($tour['days']))  $itinerary = $tour['days'];
      ?>
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
            <?= imgTag($gallery[$photoIndex], $title, '(max-width:900px) 100vw, 900px',
                       ['class'=>'editorial-image','loading'=>'lazy']) ?>
        <?php $photoIndex++; endif; ?>
        
        <?php endforeach; ?>
      </div>
      <?php endif; ?>

      <?php $depRet = getLangField($tour,'departureReturn',$currentLang); ?>
      <?php if(!empty($depRet) && is_array($depRet)): ?>
      <table class="info-table">
        <?php foreach($depRet as $item):
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
          <button type="button" class="gallery-item"
               onclick="openLightbox(<?=$idx?>)"
               aria-label="<?=e($title)?> <?=$idx+1?>">
            <?= imgTag($img, $title.' '.($idx+1), '(max-width:700px) 50vw, 400px', ['loading'=>'lazy']) ?>
          </button>
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
          <div class="faq-item<?=$fi===0?' active':''?>">
            <h3 class="faq-question">
              <button type="button" class="faq-toggle" onclick="toggleFaq(this)"
                      aria-expanded="<?=$fi===0?'true':'false'?>">
                <span><?=e($faq['q'])?></span>
                <i class="fas fa-chevron-down" aria-hidden="true"></i>
              </button>
            </h3>
            <div class="faq-answer"><div><?=nl2p($faq['a'])?></div></div>
          </div>
          <?php endforeach; ?>
        </div>
      </div>
      <?php endif; ?>

    </div><!-- /tour-main -->

    <div class="tour-sidebar">
      <div class="tour-booking-card">
        <div class="price-label"><?=e($L['priceTitle'])?></div>
        <div class="price-amount"><?= $price ? e($price) : e($L['askPrice']) ?></div>
        <div class="booking-cta">
          <a href="<?=e($mailHref)?>" class="btn btn-primary">
            <i class="fas fa-envelope" aria-hidden="true"></i>
            <?=e($L['emailBtn'])?>
          </a>
          <a href="<?=e($waHref)?>" class="btn btn-outline"
             target="_blank" rel="noopener noreferrer">
            <i class="fab fa-whatsapp" aria-hidden="true"></i>
            <?=e($L['waBtn'])?>
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
    <!-- src bilerek YOK: boş src="" tarayıcıyı sayfayı yeniden istemeye zorluyor
         ve "kırık görsel" sayılıyor. Kaynağı openLightbox() atıyor. -->
    <img id="lightboxImg" alt="" decoding="async">
  </div>
  <button class="lightbox-nav lightbox-next" aria-label="Sonraki" onclick="event.stopPropagation();changeImage(1)">
    <i class="fas fa-chevron-right" aria-hidden="true"></i>
  </button>
</div>

<a href="<?=e($waHref)?>"
   class="whatsapp-float" target="_blank" rel="noopener noreferrer"
   aria-label="WhatsApp">
  <i class="fab fa-whatsapp" aria-hidden="true"></i>
</a>

<script>
/* Galeri lightbox + SSS açılır kapanır.
   NOT: Mobil menü ve dil menüsü artık SADECE app.js'te yönetiliyor.
   Buradaki kopya dinleyiciler kaldırıldı — iki kez bağlandığı için
   hamburger menü hiç açılmıyordu. */
const galleryImages = <?=json_encode(array_map('imgFull',$gallery),JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES|JSON_HEX_TAG)?>;
let currentImageIndex = 0;
const lb = () => document.getElementById('lightbox');

function openLightbox(i) {
  if (!galleryImages.length) return;
  currentImageIndex = i;
  document.getElementById('lightboxImg').src = galleryImages[i];
  lb().classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  lb().classList.remove('active');
  document.body.style.overflow = '';
}
function changeImage(d) {
  if (!galleryImages.length) return;
  currentImageIndex = (currentImageIndex + d + galleryImages.length) % galleryImages.length;
  document.getElementById('lightboxImg').src = galleryImages[currentImageIndex];
}
function toggleFaq(btn) {
  const item = btn.closest('.faq-item');
  item.classList.toggle('active');
  btn.setAttribute('aria-expanded', item.classList.contains('active') ? 'true' : 'false');
}
document.addEventListener('keydown', e => {
  const box = lb();
  if (!box || !box.classList.contains('active')) return;
  if (e.key === 'Escape')     closeLightbox();
  if (e.key === 'ArrowRight') changeImage(1);
  if (e.key === 'ArrowLeft')  changeImage(-1);
});
sessionStorage.setItem('language','<?=e($currentLang)?>');
localStorage.setItem('language','<?=e($currentLang)?>');
</script>
<script src="/i18n.js" defer></script>
<script src="/app.js" defer></script>
</body>
</html>
