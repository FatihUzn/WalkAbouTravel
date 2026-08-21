<?php
/* ============================================================
   index.php — Ana sayfa (5 dil, sunucu taraflı)
   Ortak ayarlar config.php, yardımcılar functions.php içinde.
   ============================================================ */
require_once __DIR__ . '/functions.php';

$currentLang = detectLang();
$LP          = $LANG_PREFIXES[$currentLang];
$htmlDir     = $currentLang === 'ar' ? ' dir="rtl"' : '';

/* ─── VERİ ─────────────────────────────────────────────────── */
$posts        = loadPosts();                        // ISO tarihe göre doğru sıralı
$featuredPost = $posts[0] ?? null;
$sidebarPosts = array_slice($posts, 1, 3);

$allTours     = loadTours();
$popularTours = array_values(array_filter($allTours, fn($t) => !empty($t['featured'])));
if (!$popularTours) $popularTours = $allTours;
$popularTours = array_slice($popularTours, 0, 3);

/* ─── DİL SÖZLÜĞÜ (sunucu tarafı) ─────────────────────────── */
$D = [
 'tr'=>['title'=>'Türkiye Turları — Kapadokya, İstanbul, Efes Paketleri',
        'desc'=>'WalkAbout Travel ile Kapadokya balon turu, İstanbul şehir turları, Efes ve Pamukkale gezileri. 1997’den beri güvenle planlanan tur paketleri.',
        'ogtitle'=>'WalkAbout Travel — Türkiye Tur Paketleri',
        'readMore'=>'TÜM YAZILARI GÖR','minRead'=>'dk okuma','from'=>'Başlangıç Fiyatı',
        'details'=>'Detayları İncele','dayDefault'=>'1 Gün','askPrice'=>'Fiyat için sorunuz',
        'dirs'=>'Yol Tarifi','skip'=>'İçeriğe geç'],
 'en'=>['title'=>'Turkey Tours — Cappadocia, Istanbul & Ephesus Packages',
        'desc'=>'Cappadocia balloon rides, Istanbul city tours, Ephesus and Pamukkale day trips. Expert-guided Turkey tour packages since 1997.',
        'ogtitle'=>'WalkAbout Travel — Turkey Tours & Travel Packages',
        'readMore'=>'READ ALL POSTS','minRead'=>'min read','from'=>'Starting From',
        'details'=>'Details','dayDefault'=>'1 Day','askPrice'=>'Ask for price',
        'dirs'=>'Get Directions','skip'=>'Skip to content'],
 'es'=>['title'=>'Tours en Turquía — Capadocia, Estambul y Éfeso',
        'desc'=>'Vuelos en globo en Capadocia, tours por Estambul, excursiones a Éfeso y Pamukkale. Paquetes turísticos guiados desde 1997.',
        'ogtitle'=>'WalkAbout Travel — Tours y Paquetes en Turquía',
        'readMore'=>'VER TODOS LOS ARTÍCULOS','minRead'=>'min lectura','from'=>'Desde',
        'details'=>'Detalles','dayDefault'=>'1 Día','askPrice'=>'Consulte el precio',
        'dirs'=>'Cómo llegar','skip'=>'Ir al contenido'],
 'pt'=>['title'=>'Passeios na Turquia — Capadócia, Istambul e Éfeso',
        'desc'=>'Balão na Capadócia, passeios por Istambul, excursões a Éfeso e Pamukkale. Pacotes turísticos guiados desde 1997.',
        'ogtitle'=>'WalkAbout Travel — Passeios e Pacotes na Turquia',
        'readMore'=>'VER TODAS AS PUBLICAÇÕES','minRead'=>'min leitura','from'=>'A partir de',
        'details'=>'Detalhes','dayDefault'=>'1 Dia','askPrice'=>'Consulte o preço',
        'dirs'=>'Como chegar','skip'=>'Ir para o conteúdo'],
 'ar'=>['title'=>'جولات تركيا — كابادوكيا وإسطنبول وأفسس',
        'desc'=>'رحلات المنطاد في كابادوكيا، جولات إسطنبول، ورحلات أفسس وباموكالي. باقات سياحية منذ عام 1997.',
        'ogtitle'=>'WalkAbout Travel — باقات جولات تركيا',
        'readMore'=>'عرض جميع المقالات','minRead'=>'دقيقة قراءة','from'=>'ابتداء من',
        'details'=>'تفاصيل','dayDefault'=>'يوم واحد','askPrice'=>'اتصل بنا للسعر',
        'dirs'=>'الاتجاهات','skip'=>'تخطي إلى المحتوى'],
];
$T = $D[$currentLang] ?? $D['tr'];

/* Geriye dönük uyumluluk için eski değişken adları */
$readMoreText = $T['readMore'];  $minReadText = $T['minRead'];
$startingFromText = $T['from'];  $detailsText = $T['details'];
$tourDurationDefaultText = $T['dayDefault'];

/* ─── SEO ──────────────────────────────────────────────────── */
$canonicalUrl = SITE_URL . $LP . '/';
$hreflang = [];
foreach ($LANG_PREFIXES as $lc => $p) $hreflang[$lc] = SITE_URL . $p . '/';

$heroPoster = imgAttrs('turizm-seyahat-ana-hero');
$ogImage    = $heroPoster ? SITE_URL . $heroPoster['full'] : '';

/* ─── Kurumsal yapılandırılmış veri (yerel SEO) ────────────── */
$orgSchema = json_encode(array_filter([
  '@context'=>'https://schema.org','@type'=>'TravelAgency',
  '@id'=>SITE_URL.'/#organization',
  'name'=>SITE_NAME,'url'=>SITE_URL,
  'logo'=>SITE_URL.'/assets/img/walkabout-travel-logo-400.webp',
  'image'=>$ogImage ?: null,
  'description'=>$T['desc'],
  'telephone'=>CONTACT_PHONE,'email'=>CONTACT_EMAIL,
  'foundingDate'=>(string)FOUNDED_YEAR,
  'address'=>['@type'=>'PostalAddress','streetAddress'=>CONTACT_ADDRESS_1,
              'addressLocality'=>'Fatih','addressRegion'=>'İstanbul',
              'postalCode'=>'34122','addressCountry'=>'TR'],
  'areaServed'=>['@type'=>'Country','name'=>'Türkiye'],
  'sameAs'=>array_values(array_filter($SOCIAL)) ?: null,
]), JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);

$bcSchema = json_encode([
  '@context'=>'https://schema.org','@type'=>'BreadcrumbList','itemListElement'=>[
    ['@type'=>'ListItem','position'=>1,'name'=>SITE_NAME,'item'=>$canonicalUrl]]],
  JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);

if ($heroPoster) header('Link: <'.$heroPoster['full'].'>; rel=preload; as=image; fetchpriority=high', false);
?>
<!DOCTYPE html>
<html lang="<?=e($currentLang)?>"<?=$htmlDir?>>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?=e($T['title'])?> | <?=e(SITE_NAME)?></title>

    <meta name="description" content="<?=e($T['desc'])?>">
    <link rel="canonical" href="<?=e($canonicalUrl)?>">
    <link rel="icon" type="image/webp" href="/assets/img/walkabout-travel-logo-400.webp">

    <!-- Hreflang — 5 dil, karşılıklı -->
<?php foreach($hreflang as $lc=>$u): ?>
    <link rel="alternate" hreflang="<?=e($lc)?>" href="<?=e($u)?>">
<?php endforeach; ?>
    <link rel="alternate" hreflang="x-default" href="<?=e($hreflang['en'])?>">

    <!-- Open Graph -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="<?=e($canonicalUrl)?>">
    <meta property="og:title" content="<?=e($T['ogtitle'])?>">
    <meta property="og:description" content="<?=e($T['desc'])?>">
<?php if($ogImage): ?>
    <meta property="og:image" content="<?=e($ogImage)?>">
    <meta property="og:image:width" content="1600">
<?php endif; ?>
    <meta property="og:locale" content="<?=e($LANG_LOCALES[$currentLang])?>">
    <meta property="og:site_name" content="<?=e(SITE_NAME)?>">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="<?=e($T['ogtitle'])?>">
    <meta name="twitter:description" content="<?=e($T['desc'])?>">
<?php if($ogImage): ?>
    <meta name="twitter:image" content="<?=e($ogImage)?>"><?php endif; ?>

    <script type="application/ld+json"><?=$orgSchema?></script>
    <script type="application/ld+json"><?=$bcSchema?></script>
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=Montserrat:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- Font Awesome -->
    <link rel="preload" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
    <noscript><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"></noscript>
    
    <!-- Main CSS -->
    <link rel="stylesheet" href="/style.css">

    <style>
    /* Home Magazine Layout Stilleri */
    .magazine-grid { display: grid; grid-template-columns: 1fr 360px; gap: 40px; align-items: start; }
    .featured-post { position: relative; border-radius: 16px; overflow: hidden; display: block; text-decoration: none; aspect-ratio: 16/10; box-shadow: var(--shadow-md); border: 1px solid rgba(197,160,89,0.1); }
    .featured-post img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.6s ease; }
    .featured-post:hover img { transform: scale(1.04); }
    .featured-post::before { content: ''; position: absolute; inset: 0; z-index: 1; background: linear-gradient(to bottom, transparent 30%, rgba(10,15,30,0.9) 100%); }
    .featured-content { position: absolute; bottom: 0; left: 0; right: 0; z-index: 2; padding: 40px 35px; color: white; text-align: left; }
    .featured-cat { display: inline-block; background: var(--primary); color: white; padding: 5px 12px; border-radius: 6px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 15px; }
    .featured-title { font-family: 'Playfair Display', serif; font-size: 30px; font-weight: 800; line-height: 1.3; margin-bottom: 15px; color: #ffffff !important; background: none; -webkit-text-fill-color: initial; }
    .featured-meta { font-size: 13px; color: rgba(255,255,255,0.75); display: flex; gap: 16px; font-weight: 500; }
    .recent-posts-list { display: flex; flex-direction: column; gap: 0; background: #ffffff; border-radius: 16px; padding: 25px; box-shadow: var(--shadow-sm); border: 1px solid rgba(0,0,0,0.06); text-align: left; }
    .recent-post-item { display: flex; gap: 16px; align-items: flex-start; padding: 20px 0; border-bottom: 1px solid #f1f5f9; text-decoration: none; transition: transform 0.3s ease; }
    .recent-post-item:first-child { padding-top: 0; }
    .recent-post-item:last-child { border-bottom: none; padding-bottom: 0; }
    .recent-post-item:hover { transform: translateX(5px); }
    .recent-thumb { width: 95px; height: 75px; border-radius: 10px; overflow: hidden; flex-shrink: 0; background: #e2e8f0; }
    .recent-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .recent-info { flex: 1; min-width: 0; }
    .recent-cat { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: var(--accent); margin-bottom: 6px; }
    .recent-title { font-size: 14.5px; font-weight: 700; color: var(--text-dark); line-height: 1.4; margin-bottom: 6px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; font-family: 'Playfair Display', serif; }
    .recent-date { font-size: 12px; color: var(--text-light-gray); }
    @media (max-width: 1100px) {
        .magazine-grid { grid-template-columns: 1fr; }
        .recent-posts-list { background: transparent; padding: 0; border: none; box-shadow: none; }
        .recent-post-item { background: #ffffff; padding: 20px; border-radius: 14px; border: 1px solid #f1f5f9; box-shadow: var(--shadow-sm); margin-bottom: 12px; }
        .recent-post-item:last-child { margin-bottom: 0; }
    }
    /* ── Hero: poster anında görünür, video hazır olunca üstüne biner ── */
    .hero { position: relative; overflow: hidden; }
    /* style.css'teki ".hero img { height:auto }" kuralını yenmek için
       özgüllüğü artırıyoruz — aksi hâlde poster hero'yu doldurmuyor. */
    .hero img.hero-poster, .hero video.hero-video {
        position: absolute !important; inset: 0 !important;
        width: 100% !important; height: 100% !important;
        max-width: none !important; max-height: none !important;
        object-fit: cover !important; z-index: 0;
    }
    .hero-poster { opacity: 1; transition: opacity .6s ease; }
    body.video-hazir .hero-poster { opacity: 0; }
    .hero-video { opacity: 0; transition: opacity .6s ease; }
    body.video-hazir .hero-video { opacity: 1; }
    @media (max-width: 768px) { .hero-video { display: none; } }

    /* ── Kategori kartları artık <button> ── */
    .category-image-card {
        position: relative; display: block; padding: 0; border: none;
        background: none; cursor: pointer; width: 100%; overflow: hidden;
        border-radius: 14px;
    }
    .category-image-card img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .category-image-card .category-overlay {
        position: absolute; inset: 0; display: flex; align-items: flex-end;
        justify-content: center; padding: 18px;
        background: linear-gradient(to top, rgba(0,0,0,.75), transparent 60%);
    }
    .category-image-card.active { outline: 3px solid var(--primary, #0c4a6e); outline-offset: 2px; }
    .category-image-card:focus-visible { outline: 3px solid #38bdf8; outline-offset: 2px; }

    /* ── Kart başlıkları artık <a> içeriyor ── */
    .tour-card h3 a, .trip-card-title a { color: inherit; text-decoration: none; }
    .tour-card h3 a::after, .trip-card-title a::after {
        content: ''; position: absolute; inset: 0; z-index: 1;   /* tüm kart tıklanabilir */
    }
    .tour-card, .popular-trip-card { position: relative; }
    .tour-card .tour-link, .popular-trip-card .trip-card-button { position: relative; z-index: 2; }
    </style>
</head>
<body>

    <div id="preloader">
  <div class="preloader-content">
    <div class="pl-eyebrow">Premium Travel Experience</div>
    <div class="pl-line-top"></div>

    <div class="pl-logo-wrap">
      <span class="pl-char">W</span>
      <span class="pl-char">A</span>
      <span class="pl-char">L</span>
      <span class="pl-char">K</span>
      <span class="pl-char">A</span>
      <span class="pl-char">B</span>
      <span class="pl-char">O</span>
      <span class="pl-char">U</span>
      <span class="pl-char">T</span>
    </div>

    <div class="pl-sub-wrap">
      <span class="pl-sub-char">T</span>
      <span class="pl-sub-char">R</span>
      <span class="pl-sub-char">A</span>
      <span class="pl-sub-char">V</span>
      <span class="pl-sub-char">E</span>
      <span class="pl-sub-char">L</span>
    </div>

    <div class="pl-dot"></div>
    <div class="pl-tagline">Discover · Explore · Experience</div>
    <div class="pl-line-bottom"></div>
  </div>
</div>

    <!-- NAVBAR -->
    <nav id="navbar">
        <div class="header-top-row">
            <div class="top-bar-left">
                <a href="tel:<?=e(CONTACT_PHONE_LINK)?>">
                    <i class="fas fa-phone" aria-hidden="true"></i> <span><?=e(CONTACT_PHONE)?></span>
                </a>
                <a href="<?=e(mailLink('Web sitenizden ulaşıyorum'))?>">
                    <i class="fas fa-envelope" aria-hidden="true"></i> <span><?=e(CONTACT_EMAIL)?></span>
                </a>
            </div>
            <div class="top-bar-right">
                <a href="<?=e(CONTACT_MAPS)?>" target="_blank" rel="noopener noreferrer">
                    <i class="fas fa-map-marker-alt" aria-hidden="true"></i> <span data-i18n="nav_get_directions"><?=e($T['dirs'])?></span>
                </a>
            </div>
        </div>
        
        <div class="nav-container">
            <a href="<?=$LP?>/" class="logo">
                <img src="/assets/img/walkabout-travel-logo-400.webp" alt="<?=e(SITE_NAME)?>" width="48" height="38" fetchpriority="high" decoding="async">
                <div class="logo-text">
                    <span class="logo-title">WalkAbout Travel</span>
                    <span class="logo-subtitle">TOURISM & TRAVEL</span>
                </div>
            </a>

            <div class="nav-links" id="navLinks">
                <a href="<?=$LP?>/#home" data-i18n="nav_home">HOME</a>
                <a href="<?=$LP?>/#popular-trips" data-i18n="nav_tours">TOURS</a>
                <a href="<?=$LP?>/#why-us" data-i18n="nav_why_us">WHY US</a>
                <a href="<?=$LP?>/#blog" data-i18n="nav_blog">BLOG</a>
                <a href="<?=$LP?>/#contact" data-i18n="nav_contact">CONTACT</a>
            </div>

            <div class="lang-dropdown">
    <button class="lang-dropdown-btn">
        <i class="fas fa-globe"></i> <span class="current-lang-text"><?=strtoupper($currentLang)?></span> <i class="fas fa-chevron-down"></i>
    </button>
    <div class="lang-dropdown-content">
<?php foreach($LANG_NAMES as $lc=>$nm): ?>
        <a href="<?=e($hreflang[$lc])?>" hreflang="<?=e($lc)?>"<?=$lc===$currentLang?' aria-current="true"':''?>><?=e($nm)?> (<?=strtoupper($lc)?>)</a>
<?php endforeach; ?>
    </div>
</div>

            <button class="menu-toggle" id="menuToggle">
                <i class="fas fa-bars"></i>
            </button>
        </div>
    </nav>

    <!-- HERO -->
    <section id="home" class="hero">
        <!-- Poster anında görünür (LCP), video sonradan yüklenir; mobilde hiç yüklenmez. -->
        <img class="hero-poster" src="<?=e($heroPoster['full'] ?? '')?>"
             srcset="<?=e($heroPoster['srcset'] ?? '')?>" sizes="100vw"
             alt="" width="1600" height="1000" fetchpriority="high" decoding="async" aria-hidden="true">
        <video class="hero-video" muted loop playsinline webkit-playsinline
               preload="none" disablePictureInPicture
               data-src="/assets/hero_background.mp4"
               x5-playsinline x5-video-player-type="h5" x5-video-player-fullscreen="false"></video>
        <div class="hero-overlay"></div>
        <div class="hero-content">
            <span class="hero-badge" data-i18n="hero_badge">SINCE 1997</span>
            <h1>
                <span data-i18n="hero_title">Discover the Adventure</span><br>
                <span class="hero-gradient">WalkAboutTravel</span>
            </h1>
            <p data-i18n="hero_description">Unforgettable journeys to the world's most beautiful destinations with professional guidance.</p>
            
            <div class="hero-links-container">
                <a href="<?=$LP?>/#travel-categories" class="btn-hero-link">
                    <i class="fas fa-compass"></i> <span data-i18n="hero_explore">Explore Tours</span>
                </a>
                <a href="<?=$LP?>/#blog" class="btn-hero-link">
                    <i class="fas fa-blog"></i> <span data-i18n="hero_blog">Blog</span>
                </a>
                <a href="<?=$LP?>/#contact" class="btn-hero-link">
                    <i class="fas fa-envelope"></i> <span data-i18n="hero_contact">Contact Us</span>
                </a>
            </div>
        </div>
    </section>

    <!-- HOW DO YOU TRAVEL -->
    <section id="travel-categories" class="travel-categories-section">
        <div class="travel-categories-header">
            <h2 data-i18n="categories_title">KEŞFETMEYE BAŞLAYIN</h2> 
        </div>

        <?php
        // Kategoriler artık sunucuda basılıyor: JS kapalıyken de görünür,
        // görseller srcset ile küçük iniyor. Kategori adları tours.json ile birebir eşleşiyor.
        $KATS = [
          ['key'=>'Türkiye',      'img'=>'kapadokya-balon-turu-3',
           'ad'=>['tr'=>'TÜRKİYE TURLARI','en'=>'TURKEY TOURS','es'=>'TOURS EN TURQUÍA','pt'=>'PASSEIOS NA TURQUIA','ar'=>'جولات تركيا']],
          ['key'=>'Günübirlik',   'img'=>'pamukkale-traverten-dogal-1',
           'ad'=>['tr'=>'GÜNÜBİRLİK','en'=>'DAY TRIPS','es'=>'EXCURSIONES DE UN DÍA','pt'=>'BATE-VOLTA','ar'=>'رحلات يومية']],
          ['key'=>'Grup Turları', 'img'=>'antalya-koy-gezisi-1',
           'ad'=>['tr'=>'GRUP TURLARI','en'=>'GROUP TOURS','es'=>'TOURS EN GRUPO','pt'=>'PASSEIOS EM GRUPO','ar'=>'جولات جماعية']],
          ['key'=>'__all',        'img'=>'turizm-seyahat-ana-hero',
           'ad'=>['tr'=>'TÜM TURLAR','en'=>'ALL TOURS','es'=>'TODOS LOS TOURS','pt'=>'TODOS OS PASSEIOS','ar'=>'كل الجولات']],
        ];
        ?>
        <div class="categories-grid" id="categoriesGrid">
        <?php foreach($KATS as $k): $ad = $k['ad'][$currentLang] ?? $k['ad']['tr']; ?>
          <button type="button" class="category-image-card" data-category="<?=e($k['key'])?>">
            <?= imgTag($k['img'], $ad, '(max-width:900px) 50vw, 300px', ['loading'=>'lazy']) ?>
            <span class="category-overlay"><span class="category-name"><?=e($ad)?></span></span>
          </button>
        <?php endforeach; ?>
        </div>
        
        <div class="view-more-container">
            <a href="<?=$LP?>/#popular-trips" class="view-more-btn">
                <span data-i18n="categories_view_more">VIEW MORE</span> <i class="fas fa-arrow-down"></i>
            </a>
        </div>
    </section>

    <!-- POPULAR TRIPS (SUNUCU TARAFLI - ADIM 3) -->
    <section id="popular-trips" class="popular-trips-section">
        <div class="popular-trips-header">
            <span class="section-badge" data-i18n="popular_badge">FEATURED TOURS</span>
            <h2 data-i18n="popular_title">OUR MOST POPULAR TRIPS</h2>
            <p data-i18n="popular_subtitle">The trips our travellers are booking right now</p>
        </div>

        <div class="popular-trips-grid" id="popularTripsGrid">
            <?php foreach($popularTours as $i => $tour):
                $tTitle = getLangField($tour, 'title', $currentLang);
                $tUrl   = tourUrl($tour, $currentLang);
                $tDuration = getLangField($tour,'duration',$currentLang) ?: ($tour['duration'] ?? $T['dayDefault']);
            ?>
                <article class="popular-trip-card">
                    <div class="card-image-wrap">
                        <?= imgTag($tour['image'] ?? '', $tTitle, '(max-width:700px) 100vw, 400px',
                                   ['loading'=>$i===0?'eager':'lazy','fetchpriority'=>$i===0?'high':'']) ?>
                        <div class="trip-nights-badge"><?=e($tDuration)?></div>
                    </div>
                    <div class="trip-card-content">
                        <h3 class="trip-card-title"><a href="<?=e($tUrl)?>"><?=e($tTitle)?></a></h3>
                        <?php if(!empty($tour['location'])): ?>
                            <div class="trip-card-meta"><i class="fas fa-map-marker-alt" aria-hidden="true"></i> <?=e($tour['location'])?></div>
                        <?php endif; ?>
                        <div class="trip-card-footer">
                            <div class="trip-card-price-block">
                                <span class="trip-price-label"><?=e($T['from'])?></span>
                                <span class="trip-price-value"><?= !empty($tour['price']) ? e($tour['price']) : e($T['askPrice']) ?></span>
                            </div>
                            <a href="<?=e($tUrl)?>" class="trip-card-button">
                                <?=e($T['details'])?> <i class="fas fa-arrow-right" aria-hidden="true"></i>
                            </a>
                        </div>
                    </div>
                </article>
            <?php endforeach; ?>
        </div>
    </section>

    <!-- TOURS (SUNUCU TARAFLI - ADIM 3) -->
    <section id="tours" class="tours-section">
        <div class="section-header">
            <span class="section-badge" data-i18n="tours_badge">ALL ROUTES</span>
            <h2 data-i18n="tours_title">Featured Tours</h2>
            <p data-i18n="tours_subtitle">Discover our most preferred destinations</p>
        </div>
        <div class="tours-grid">
            <?php foreach($allTours as $tour):
                $tTitle = getLangField($tour, 'title', $currentLang);
                $tDesc  = strip_tags(getLangField($tour, 'description', $currentLang));
                $tShortDesc = mb_substr($tDesc, 0, 100) . (mb_strlen($tDesc) > 100 ? '…' : '');
                $tUrl   = tourUrl($tour, $currentLang);
                $tDuration = getLangField($tour,'duration',$currentLang) ?: ($tour['duration'] ?? $T['dayDefault']);
            ?>
                <?php
                  $cats = $tour['categories'] ?? [];
                  $dataAttr = ' data-cat="'.e($tour['category'] ?? '').'"';
                  if (!empty($cats['traveller'])) $dataAttr .= ' data-trav="'.e(implode(' ', (array)$cats['traveller'])).'"';
                ?>
                <article class="tour-card"<?=$dataAttr?>>
                    <div class="tour-image">
                        <?= imgTag($tour['image'] ?? '', $tTitle, '(max-width:700px) 100vw, 400px', ['loading'=>'lazy']) ?>
                        <div class="tour-badge"><?=e($tDuration)?></div>
                    </div>
                    <div class="tour-content">
                        <h3><a href="<?=e($tUrl)?>"><?=e($tTitle)?></a></h3>
                        <p><?=e($tShortDesc)?></p>
                        <div class="tour-features">
                            <?php if(!empty($tour['location'])): ?>
                                <span class="feature-tag"><i class="fas fa-map-marker-alt" aria-hidden="true"></i> <?=e($tour['location'])?></span>
                            <?php endif; ?>
                            <?php if(!empty($tour['category'])): ?>
                                <span class="feature-tag"><i class="fas fa-compass" aria-hidden="true"></i> <?=e($tour['category'])?></span>
                            <?php endif; ?>
                        </div>
                        <div class="tour-card-footer">
                            <div class="tour-price-block">
                                <span class="tour-price-label"><?=e($T['from'])?></span>
                                <span class="tour-price-value"><?= !empty($tour['price']) ? e($tour['price']) : e($T['askPrice']) ?></span>
                            </div>
                            <a href="<?=e($tUrl)?>" class="tour-link">
                                <?=e($T['details'])?> <i class="fas fa-arrow-right" aria-hidden="true"></i>
                            </a>
                        </div>
                    </div>
                </article>
            <?php endforeach; ?>
        </div>
        <p id="toursEmpty" hidden style="text-align:center;color:#64748b;padding:40px 0;">
            <?=e($currentLang==='tr'?'Bu kategoride tur bulunamadı.':'No tours found in this category.')?>
        </p>
    </section>

    <!-- WHY US -->
    <section id="why-us" class="why-us-section">
        <div class="section-header">
            <span class="section-badge" data-i18n="why_badge">WHY WalkAbout Travel?</span>
            <h2 data-i18n="why_title">Reasons to Choose Us</h2>
            <p data-i18n="why_subtitle">Safe and unforgettable journeys with our 28 years of experience</p>
        </div>

        <div class="features-grid">
            <div class="feature-card">
                <div class="feature-icon"><i class="fas fa-shield-alt"></i></div>
                <h3 data-i18n="why_feature1_title">Safe Travel</h3>
                <p data-i18n="why_feature1_desc">Full security with TURSAB certified, insurance guaranteed and licensed guides.</p>
            </div>
            <div class="feature-card">
                <div class="feature-icon"><i class="fas fa-star"></i></div>
                <h3 data-i18n="why_feature2_title">28 Years of Experience</h3>
                <p data-i18n="why_feature2_desc">We have served thousands of happy customers since 1997.</p>
            </div>
            <div class="feature-card">
                <div class="feature-icon"><i class="fas fa-headset"></i></div>
                <h3 data-i18n="why_feature3_title">24/7 Support</h3>
                <p data-i18n="why_feature3_desc">We are with you at every moment of your trip.</p>
            </div>
            <div class="feature-card">
                <div class="feature-icon"><i class="fas fa-money-bill-wave"></i></div>
                <h3 data-i18n="why_feature4_title">Best Price Guarantee</h3>
                <p data-i18n="why_feature4_desc">We offer quality service at the most affordable prices.</p>
            </div>
        </div>
    </section>

    <!-- BLOG SECTION -->
    <section id="blog" class="blog-section">
        <div class="section-header">
            <span class="section-badge" data-i18n="blog_badge">TRAVEL DIARY</span>
            <h2 data-i18n="blog_title">Blog & Travel Guide</h2>
            <p data-i18n="blog_subtitle">Get inspired by our experiences</p>
        </div>
        
        <div class="blog-container" style="max-width: 1300px; margin: 0 auto;">
            <?php if($featuredPost): ?>
            <div class="magazine-grid">
                <?php
                $fTitle = getLangField($featuredPost, 'title', $currentLang);
                $fCat   = getLangField($featuredPost, 'category', $currentLang);
                $fDate  = fmtDate($featuredPost['date'] ?? '', $currentLang);
                $fRead  = $featuredPost['readTime'] ?? '';
                $fUrl   = postUrl($featuredPost, $currentLang);
                ?>
                <a href="<?=e($fUrl)?>" class="featured-post">
                    <?= imgTag($featuredPost['image'] ?? '', $fTitle, '(max-width:1100px) 100vw, 760px', ['loading'=>'lazy']) ?>
                    <div class="featured-content">
                        <?php if($fCat): ?><span class="featured-cat"><?=e($fCat)?></span><?php endif; ?>
                        <h3 class="featured-title"><?=e($fTitle)?></h3>
                        <div class="featured-meta">
                            <?php if($fDate): ?><span><i class="far fa-calendar-alt" aria-hidden="true"></i> <?=e($fDate)?></span><?php endif; ?>
                            <?php if($fRead): ?><span><i class="far fa-clock" aria-hidden="true"></i> <?=e($fRead)?> <?=e($T['minRead'])?></span><?php endif; ?>
                        </div>
                    </div>
                </a>

                <aside class="recent-posts-list">
                    <?php foreach($sidebarPosts as $sp):
                        $spTitle = getLangField($sp, 'title', $currentLang);
                        $spCat   = getLangField($sp, 'category', $currentLang);
                        $spDate  = fmtDate($sp['date'] ?? '', $currentLang);
                        $spUrl   = postUrl($sp, $currentLang);
                    ?>
                    <a href="<?=e($spUrl)?>" class="recent-post-item">
                        <div class="recent-thumb">
                            <?= imgTag($sp['image'] ?? '', $spTitle, '95px', ['loading'=>'lazy']) ?>
                        </div>
                        <div class="recent-info">
                            <?php if($spCat): ?><div class="recent-cat"><?=e($spCat)?></div><?php endif; ?>
                            <div class="recent-title"><?=e($spTitle)?></div>
                            <div class="recent-date"><?=e($spDate)?></div>
                        </div>
                    </a>
                    <?php endforeach; ?>
                </aside>
            </div>
            <?php else: ?>
            <p style="text-align:center; color:#64748b;">Yakında içerik gelecek.</p>
            <?php endif; ?>

            <div class="view-more-container" style="margin-top: 50px;">
                <a href="<?=$LP?>/blog/" class="view-more-btn">
                    <?=e($T['readMore'])?> <i class="fas fa-arrow-right" aria-hidden="true"></i>
                </a>
            </div>
        </div>
    </section>

    <!-- CONTACT -->
    <section id="contact" class="contact-section">
        <div class="section-header">
            <span class="section-badge" data-i18n="contact_badge">CONTACT US</span>
            <h2 data-i18n="contact_title">Let's Plan Your Holiday</h2>
            <p data-i18n="contact_subtitle">Our expert team is ready to help you</p>
        </div>

        <div class="contact-container">
            <!-- Form artık contact.php'ye gönderiliyor: e-posta atılıyor VE data/leads.json'a kaydediliyor.
                 JS kapalı olsa bile çalışır. -->
            <form class="contact-form" id="contactForm" method="post" action="/contact.php">
                <input type="hidden" name="lang" value="<?=e($currentLang)?>">
                <div class="form-group">
                    <label for="name" data-i18n="contact_name_label">Full Name *</label>
                    <input type="text" id="name" name="name" required autocomplete="name" maxlength="120"
                           data-i18n="contact_name_placeholder" placeholder="<?=e($currentLang==='tr'?'Ad Soyad':'Full Name')?>">
                </div>
                <div class="form-group">
                    <label for="email" data-i18n="contact_email_label">Email Address *</label>
                    <input type="email" id="email" name="email" required autocomplete="email" maxlength="180"
                           data-i18n="contact_email_placeholder" placeholder="<?=e($currentLang==='tr'?'ornek@eposta.com':'you@email.com')?>">
                </div>
                <div class="form-group">
                    <label for="phone" data-i18n="contact_phone_label">Phone Number</label>
                    <input type="tel" id="phone" name="phone" autocomplete="tel" maxlength="40"
                           data-i18n="contact_phone_placeholder" placeholder="+90 5xx xxx xx xx">
                </div>
                <div class="form-group">
                    <label for="message" data-i18n="contact_message_label">Your Message *</label>
                    <textarea id="message" name="message" required maxlength="4000"
                              data-i18n="contact_message_placeholder" placeholder="<?=e($currentLang==='tr'?'Hangi turla ilgileniyorsunuz?':'Which tour are you interested in?')?>"></textarea>
                </div>
                <div class="gorsel-gizli" aria-hidden="true">
                    <label>Web sitesi<input type="text" name="website" tabindex="-1" autocomplete="off"></label>
                </div>
                <button type="submit" class="submit-btn">
                    <i class="fas fa-paper-plane" aria-hidden="true"></i> <span data-i18n="contact_send_button">Send</span>
                </button>
            </form>

            <div class="contact-info">
                <div class="info-item">
                    <i class="fas fa-map-marker-alt"></i>
                    <h4 data-i18n="contact_info_address_title">Our Address</h4>
                    <p><?=e(CONTACT_ADDRESS_1)?><br><?=e(CONTACT_ADDRESS_2)?></p>
                </div>
                <div class="info-item">
                    <i class="fas fa-phone"></i>
                    <h4 data-i18n="contact_info_phone_title">Phone</h4>
                    <p><a href="tel:<?=e(CONTACT_PHONE_LINK)?>"><?=e(CONTACT_PHONE)?></a></p>
                </div>
                <div class="info-item">
                    <i class="fas fa-envelope"></i>
                    <h4 data-i18n="contact_info_email_title">Email</h4>
                    <p><a href="<?=e(mailLink())?>"><?=e(CONTACT_EMAIL)?></a></p>
                </div>
            </div>
        </div>
    </section>

    <!-- FOOTER -->
    <footer>
        <div class="footer-content">
            <div class="footer-brand">
                <div class="footer-logo">
                    <img src="/assets/img/walkabout-travel-logo-400.webp" alt="<?=e(SITE_NAME)?>" width="48" height="38" loading="lazy" decoding="async">
                    <div class="logo-text">
                        <span class="logo-title">WalkAbout Travel</span>
                        <span class="logo-subtitle">Tourism & Travel</span>
                    </div>
                </div>
                <p data-i18n="footer_tagline">Journeys planned with confidence since 1997.</p>
                <?php
                // Boş bırakılan hesaplar hiç gösterilmez — "#" giden ölü ikon kalmasın.
                $iconMap = ['facebook'=>'fa-facebook-f','instagram'=>'fa-instagram',
                            'twitter'=>'fa-x-twitter','linkedin'=>'fa-linkedin-in'];
                $aktif = array_filter($SOCIAL);
                ?>
                <?php if($aktif): ?>
                <div class="social-links">
                    <?php foreach($aktif as $k=>$url): ?>
                    <a href="<?=e($url)?>" target="_blank" rel="noopener noreferrer" aria-label="<?=e(ucfirst($k))?>">
                        <i class="fab <?=e($iconMap[$k] ?? 'fa-link')?>" aria-hidden="true"></i>
                    </a>
                    <?php endforeach; ?>
                </div>
                <?php endif; ?>
            </div>

            <div class="footer-column">
                <h4 data-i18n="footer_quick_links">Quick Links</h4>
                <ul class="footer-links">
                    <li><a href="<?=$LP?>/#home" data-i18n="nav_home">Home</a></li>
                    <li><a href="<?=$LP?>/#popular-trips" data-i18n="nav_tours">Tours</a></li>
                    <li><a href="<?=$LP?>/#why-us" data-i18n="nav_why_us">Why Us</a></li>
                    <li><a href="<?=$LP?>/#blog" data-i18n="nav_blog">Blog</a></li>
                    <li><a href="<?=$LP?>/#contact" data-i18n="nav_contact">Contact</a></li>
                </ul>
            </div>

            <div class="footer-column">
                <h4 data-i18n="footer_categories">Categories</h4>
                <ul class="footer-links">
                    <!-- Bu 5 bağlantı daha önce sunucuda olmayan .html dosyalarına gidiyordu
                         (ölü link). Var olan tur bölümüne yönlendirildi. -->
                    <li><a href="<?=$LP?>/#tours" data-i18n="footer_cat_family">Family Tours</a></li>
                    <li><a href="<?=$LP?>/#tours" data-i18n="footer_cat_couples">Couples Tours</a></li>
                    <li><a href="<?=$LP?>/#tours" data-i18n="footer_cat_groups">Group Tours</a></li>
                    <li><a href="<?=$LP?>/#tours" data-i18n="footer_cat_honeymoon">Honeymoon Tours</a></li>
                    <li><a href="<?=$LP?>/#tours" data-i18n="footer_cat_solo">Solo Tours</a></li>
                </ul>
            </div>

            <div class="footer-column">
                <h4 data-i18n="footer_services">Services</h4>
                <ul class="footer-links">
                    <li><a href="<?=$LP?>/#why-us" data-i18n="footer_service_visa">Visa Consultancy</a></li>
                    <li><a href="<?=$LP?>/#contact" data-i18n="footer_service_hotel">Hotel Reservation</a></li>
                    <li><a href="<?=$LP?>/#contact" data-i18n="footer_service_flight">Flight Ticket</a></li>
                    <li><a href="<?=$LP?>/#contact" data-i18n="footer_service_transfer">Transfer Service</a></li>
                </ul>
            </div>
        </div>

        <div class="footer-bottom">
            <p data-i18n="footer_copyright">© 2025 WalkAbout Travel. All rights reserved.</p>
        </div>
    </footer>

    <a href="<?=e(waLink('Merhaba, '.SITE_NAME.' web sitenizden ulaşıyorum. Turlarınız hakkında bilgi almak istiyorum.'))?>"
       class="whatsapp-float" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
        <i class="fab fa-whatsapp" aria-hidden="true"></i>
    </a>

    <script src="/i18n.js" defer></script>
    <script src="/app.js" defer></script>
    <script>
    /* ============================================================
       Ana sayfa betiği — sadeleştirildi.
       KALDIRILANLAR ve nedenleri:
       · Tours.js               → PHP'nin bastığı 75 kartı silip 1,2 MB JSON'u
                                  tekrar indiriyordu. Artık sunucu çıktısı kullanılıyor.
       · allToursData (1,2 MB)  → HTML'e gömülüydü ama hiç kullanılmıyordu.
       · Inline mobil menü      → app.js'teki ile çakışıp menüyü hiç açtırmıyordu.
       · Inline navbar scroll   → app.js'te zaten var (passive dinleyiciyle).
       · handleContactSubmit    → form artık contact.php'ye gerçekten POST ediyor.
       · Dil menüsü JS'i        → menü artık gerçek /en/ /es/ ... bağlantıları kullanıyor.
       ============================================================ */
    (function () {
      'use strict';

      /* ── Kategori filtresi: kartları yeniden çizmeden göster/gizle ── */
      const grid  = document.getElementById('categoriesGrid');
      const cards = Array.from(document.querySelectorAll('.tours-grid .tour-card'));
      if (grid && cards.length) {
        grid.addEventListener('click', function (ev) {
          const btn = ev.target.closest('.category-image-card');
          if (!btn) return;
          const key = btn.dataset.category;
          let gorunen = 0;
          cards.forEach(c => {
            const ok = key === '__all' || c.dataset.cat === key;
            c.hidden = !ok;
            if (ok) gorunen++;
          });
          grid.querySelectorAll('.category-image-card')
              .forEach(b => b.classList.toggle('active', b === btn));
          const bos = document.getElementById('toursEmpty');
          if (bos) bos.hidden = gorunen > 0;
          const hedef = document.getElementById('tours');
          if (hedef) hedef.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      }

      /* ── Hero videosu: boşta kalınca ve sadece masaüstünde yükle ── */
      const video = document.querySelector('.hero-video');
      if (video && window.matchMedia('(min-width: 769px)').matches
                && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const basla = () => {
          if (video.dataset.src && !video.src) {
            video.src = video.dataset.src;
            video.load();
            const p = video.play();
            if (p) p.catch(() => {});                 // engellenirse poster görünmeye devam eder
            video.addEventListener('playing',
              () => document.body.classList.add('video-hazir'), { once: true });
          }
        };
        if ('requestIdleCallback' in window) requestIdleCallback(basla, { timeout: 2500 });
        else setTimeout(basla, 1200);
      }

      /* ── Dil: sunucu hangi dili sunduysa tarayıcı deposunu ona eşitle ── */
      const LANG = '<?=e($currentLang)?>';
      try { localStorage.setItem('language', LANG); sessionStorage.setItem('language', LANG); } catch (e) {}
      const initI18n = () => { if (window.i18n) window.i18n.init(LANG); };
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initI18n);
      else initI18n();
    })();
    </script>
</body>
</html>