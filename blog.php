<?php
// ============================================================
//  blog.php — WalkAbout Travel Blog Listesi
//  v3 — 2025-06 — Magazine Layout + Category Filter
// ============================================================

$_protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$_host     = $_SERVER['HTTP_HOST'] ?? 'localhost';
define('SITE_URL',  $_protocol . '://' . $_host);
define('SITE_NAME', 'WalkAbout Travel');

$LANG_PREFIXES = ['tr'=>'','en'=>'/en','es'=>'/es','ar'=>'/ar','pt'=>'/pt'];
$LANG_NAMES    = ['tr'=>'Türkçe','en'=>'English','es'=>'Español','ar'=>'العربية','pt'=>'Português'];

$uri = rtrim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/');
$currentLang = 'tr';
foreach (['en','es','ar','pt'] as $lc) {
    if (str_starts_with($uri, '/'.$lc.'/') || $uri === '/'.$lc) {
        $currentLang = $lc; break;
    }
}

$blogsFile = __DIR__ . '/data/blog-posts.json';
$allPosts  = file_exists($blogsFile)
    ? (json_decode(file_get_contents($blogsFile), true) ?? [])
    : [];

$posts = array_filter($allPosts, fn($p) => ($p['published'] ?? true) !== false);
$posts = array_values($posts);
usort($posts, fn($a,$b) => strcmp($b['date'] ?? '', $a['date'] ?? ''));

function makeSlug(string $t): string {
    $tr = ['ş','ğ','ü','ö','ı','ç','Ş','Ğ','Ü','Ö','İ','Ç'];
    $en = ['s','g','u','o','i','c','s','g','u','o','i','c'];
    $t = str_replace($tr, $en, $t);
    $t = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $t);
    return strtolower(preg_replace('/[\s-]+/', '-', trim(preg_replace('/[^a-zA-Z0-9\s-]/', '', $t))));
}
function getBlogField(array $obj, string $field, string $lang): string {
    $key = $lang !== 'tr' ? $field.'_'.$lang : $field;
    return $obj[$key] ?? $obj[$field.'_en'] ?? $obj[$field] ?? '';
}

// Featured = ilk (en yeni) post; grid = tümü (featured dahil, filtrelenebilir)
$featuredPost = $posts[0] ?? null;
$sidebarPosts = array_slice($posts, 1, 3);

// Tüm kategoriler (filtre için)
$categories = [];
foreach ($posts as $p) {
    $cat = getBlogField($p, 'category', $currentLang);
    if ($cat && !in_array($cat, $categories)) $categories[] = $cat;
}

$canonicalBase = SITE_URL . $LANG_PREFIXES[$currentLang] . '/blog/';
$hreflangBlog  = [];
foreach ($LANG_PREFIXES as $lc => $p) $hreflangBlog[$lc] = SITE_URL.$p.'/blog/';

$breadcrumbSchema = json_encode([
    '@context' => 'https://schema.org',
    '@type'    => 'BreadcrumbList',
    'itemListElement' => [
        ['@type'=>'ListItem','position'=>1,'name'=>'Home','item'=>SITE_URL.'/'],
        ['@type'=>'ListItem','position'=>2,'name'=>'Blog','item'=>$canonicalBase],
    ]
], JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);

$dict = [
    'tr' => ['home'=>'Ana Sayfa','tours'=>'Turlar','blog'=>'Blog','readMore'=>'Devamını Oku','minRead'=>'dk okuma','blogTitle'=>'Seyahat Blogu','blogDesc'=>'Gezi rehberleri, ipuçları ve ilham verici hikayeler','all'=>'Tümü','featured'=>'Öne Çıkan Yazı','latest'=>'Son Yazılar'],
    'en' => ['home'=>'Home','tours'=>'Tours','blog'=>'Blog','readMore'=>'Read More','minRead'=>'min read','blogTitle'=>'Travel Blog','blogDesc'=>'Travel guides, tips and inspiring stories','all'=>'All','featured'=>'Featured Post','latest'=>'Latest Posts'],
    'es' => ['home'=>'Inicio','tours'=>'Tours','blog'=>'Blog','readMore'=>'Leer Más','minRead'=>'min lectura','blogTitle'=>'Blog de Viajes','blogDesc'=>'Guías de viaje, consejos e historias inspiradoras','all'=>'Todo','featured'=>'Artículo Destacado','latest'=>'Últimos Artículos'],
    'pt' => ['home'=>'Início','tours'=>'Passeios','blog'=>'Blog','readMore'=>'Ler Mais','minRead'=>'min leitura','blogTitle'=>'Blog de Viagens','blogDesc'=>'Guias de viagem, dicas e histórias inspiradoras','all'=>'Tudo','featured'=>'Destaque','latest'=>'Últimas Publicações'],
    'ar' => ['home'=>'الرئيسية','tours'=>'جولات','blog'=>'مدونة','readMore'=>'اقرأ المزيد','minRead'=>'دقيقة قراءة','blogTitle'=>'مدونة السفر','blogDesc'=>'أدلة السفر والنصائح والقصص الملهمة','all'=>'الكل','featured'=>'المقال المميز','latest'=>'أحدث المقالات'],
];
$L       = $dict[$currentLang] ?? $dict['tr'];
$htmlDir = $currentLang === 'ar' ? ' dir="rtl"' : '';

header('Link: </style.css>; rel=preload; as=style', false);
?>
<!DOCTYPE html>
<html lang="<?=htmlspecialchars($currentLang)?>"<?=$htmlDir?>>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title><?=$L['blogTitle']?> | <?=SITE_NAME?></title>
<meta name="description" content="<?=htmlspecialchars($L['blogDesc'])?>">
<link rel="canonical" href="<?=htmlspecialchars($canonicalBase)?>">
<?php foreach($hreflangBlog as $lc=>$u): ?>
<link rel="alternate" hreflang="<?=$lc?>" href="<?=htmlspecialchars($u)?>">
<?php endforeach; ?>
<link rel="alternate" hreflang="x-default" href="<?=htmlspecialchars($hreflangBlog['en'])?>">
<meta property="og:type" content="website">
<meta property="og:url" content="<?=htmlspecialchars($canonicalBase)?>">
<meta property="og:title" content="<?=$L['blogTitle']?> | <?=SITE_NAME?>">
<meta property="og:description" content="<?=htmlspecialchars($L['blogDesc'])?>">
<script type="application/ld+json"><?=$breadcrumbSchema?></script>
<link rel="icon" href="/assets/walkabout_travel_logo.jpg">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="dns-prefetch" href="https://cdnjs.cloudflare.com">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;0,900;1,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      media="print" onload="this.media='all'">
<noscript>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</noscript>
<link rel="stylesheet" href="/style.css">

<style>
*,*::before,*::after { margin:0; padding:0; box-sizing:border-box; }
html { overflow-x:hidden; }
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
.nav-container { display:flex !important; align-items:center !important; justify-content:space-between !important; padding:0 48px !important; height:64px !important; max-width:100% !important; margin:0 !important; }
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
.lang-dropdown-btn { background:transparent; border:1px solid #e2e8f0; color:#475569; padding:7px 14px; border-radius:8px; font-weight:500; font-size:13px; cursor:pointer; display:flex; align-items:center; gap:7px; min-height:36px; transition:border-color 0.2s; touch-action:manipulation; }
.lang-dropdown-btn:hover { border-color:#94a3b8; }
.lang-dropdown-content { display:none; position:absolute; right:0; top:calc(100% + 8px); background:white; min-width:150px; box-shadow:0 8px 30px rgba(0,0,0,0.1); border-radius:12px; border:1px solid #f1f5f9; overflow:hidden; z-index:1000; }
.lang-dropdown-content a { color:#475569; padding:11px 16px; text-decoration:none; display:block; font-size:13px; font-weight:500; transition:background 0.15s; }
.lang-dropdown-content a:hover { background:#f8fafc; color:#0c4a6e; }
.lang-dropdown.active .lang-dropdown-content { display:block; }
.menu-toggle { display:none !important; font-size:22px !important; color:#475569 !important; background:none !important; border:none !important; cursor:pointer !important; min-width:44px !important; min-height:44px !important; touch-action:manipulation !important; }

/* ─── BREADCRUMB ─────────────────────────────────────────── */
.breadcrumb { padding:16px 48px; background:#fff; margin-top:64px; border-bottom:1px solid #f1f5f9; min-height:52px; }
.breadcrumb-container { max-width:1280px; margin:0 auto; display:flex; align-items:center; gap:8px; font-size:12px; font-weight:500; text-transform:uppercase; letter-spacing:0.7px; }
.breadcrumb a { color:#94a3b8; text-decoration:none; transition:color 0.2s; }
.breadcrumb a:hover { color:#0c4a6e; }
.breadcrumb-separator { color:#e2e8f0; }
.breadcrumb-current { color:#475569; }

/* ─── BLOG HERO ──────────────────────────────────────────── */
.blog-hero {
  background:#0c4a6e; padding:72px 48px 80px;
  text-align:center; color:white;
  position:relative; overflow:hidden;
}
.blog-hero::before {
  content:''; position:absolute; inset:0;
  background:radial-gradient(ellipse at 70% 50%, rgba(56,189,248,0.15) 0%, transparent 70%);
}
.blog-hero-inner { position:relative; z-index:1; max-width:640px; margin:0 auto; }
.blog-hero h1 {
  font-family:'Playfair Display',serif; font-size:48px; font-weight:900;
  margin-bottom:14px; line-height:1.15;
}
.blog-hero p { font-size:16px; color:rgba(255,255,255,0.7); line-height:1.7; }

/* ─── MAGAZINE SECTION ───────────────────────────────────── */
.magazine-section { background:#fff; padding:64px 48px; border-bottom:1px solid #f1f5f9; }
.magazine-inner { max-width:1280px; margin:0 auto; }
.magazine-label {
  font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:1.5px;
  color:#38bdf8; margin-bottom:28px; display:flex; align-items:center; gap:10px;
}
.magazine-label::after { content:''; flex:1; height:1px; background:#f1f5f9; }
.magazine-grid { display:grid; grid-template-columns:1fr 320px; gap:40px; align-items:start; }

/* Featured post */
.featured-post {
  position:relative; border-radius:16px; overflow:hidden;
  display:block; text-decoration:none; color:inherit;
  background:#e2e8f0; aspect-ratio:16/10;
  transition:box-shadow 0.25s;
}
.featured-post:hover { box-shadow:0 20px 60px rgba(0,0,0,0.15); }
.featured-post img {
  width:100%; height:100%; object-fit:cover; display:block;
  transition:transform 0.5s;
}
.featured-post:hover img { transform:scale(1.03); }
.featured-post::before {
  content:''; position:absolute; inset:0; z-index:1;
  background:linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.85) 100%);
}
.featured-content {
  position:absolute; bottom:0; left:0; right:0; z-index:2;
  padding:36px 32px; color:white;
}
.featured-cat {
  display:inline-block; background:rgba(56,189,248,0.9); color:white;
  padding:4px 12px; border-radius:4px; font-size:10px; font-weight:700;
  text-transform:uppercase; letter-spacing:1.5px; margin-bottom:12px;
}
.featured-title {
  font-family:'Playfair Display',serif; font-size:28px; font-weight:800;
  line-height:1.25; margin-bottom:14px;
}
.featured-meta { font-size:13px; color:rgba(255,255,255,0.7); display:flex; gap:16px; flex-wrap:wrap; }

/* Sidebar recent posts */
.recent-posts-list { display:flex; flex-direction:column; gap:0; }
.recent-post-item {
  display:flex; gap:14px; align-items:flex-start;
  padding:18px 0; border-bottom:1px solid #f1f5f9;
  text-decoration:none; color:inherit;
  transition:opacity 0.2s;
}
.recent-post-item:first-child { padding-top:0; }
.recent-post-item:last-child { border-bottom:none; padding-bottom:0; }
.recent-post-item:hover { opacity:0.75; }
.recent-thumb {
  width:76px; height:60px; border-radius:8px; overflow:hidden;
  background:#e2e8f0; flex-shrink:0;
}
.recent-thumb img { width:100%; height:100%; object-fit:cover; display:block; }
.recent-info { flex:1; min-width:0; }
.recent-cat { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:1px; color:#38bdf8; margin-bottom:5px; }
.recent-title { font-size:14px; font-weight:700; color:#0f172a; line-height:1.4; margin-bottom:5px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
.recent-date { font-size:12px; color:#94a3b8; }

/* ─── FILTER + GRID SECTION ──────────────────────────────── */
.blog-section { padding:64px 48px !important; background:#f8fafc !important; }
.blog-container { max-width:1280px; margin:0 auto; }

/* Category filter — style.css'deki koyu temayı sıfırla */
.category-filters {
  display:flex !important; flex-wrap:wrap !important; gap:8px !important;
  margin-bottom:40px !important; padding:0 !important;
  background:transparent !important; backdrop-filter:none !important;
  position:static !important; border:none !important;
  box-shadow:none !important;
}
.filter-btn {
  padding:9px 20px !important; border-radius:40px !important;
  font-size:13px !important; font-weight:600 !important;
  border:1.5px solid #e2e8f0 !important;
  background:#fff !important; color:#475569 !important;
  cursor:pointer !important; transition:all 0.2s !important;
  touch-action:manipulation !important;
  text-transform:none !important; letter-spacing:0 !important;
  box-shadow:none !important;
}
.filter-btn:hover { border-color:#94a3b8 !important; color:#0c4a6e !important; background:#fff !important; box-shadow:none !important; }
.filter-btn.active { background:#0c4a6e !important; color:white !important; border-color:#0c4a6e !important; }

/* Grid — style.css'deki .blog-grid ve .blog-card'ı sıfırla */
.blog-grid { display:grid !important; grid-template-columns:repeat(3,1fr) !important; gap:28px !important; max-width:none !important; margin:0 !important; }
.blog-card {
  background:#fff !important; border-radius:14px !important; overflow:hidden !important;
  border:1px solid #f1f5f9 !important; box-shadow:0 2px 8px rgba(0,0,0,0.04) !important;
  transition:transform 0.2s, box-shadow 0.2s !important;
  contain:layout paint; cursor:pointer !important;
}
.blog-card:hover { transform:translateY(-5px) !important; box-shadow:0 12px 36px rgba(0,0,0,0.1) !important; border-color:#e2e8f0 !important; }
.blog-card.hidden { display:none !important; }

.blog-card-img-wrap { overflow:hidden; aspect-ratio:16/10; background:#e2e8f0; display:block; }
.blog-card-img { width:100%; height:100%; object-fit:cover; display:block; transition:transform 0.4s; }
.blog-card:hover .blog-card-img { transform:scale(1.05); }

.blog-card-body { padding:24px; }
.blog-card-meta { display:flex; gap:12px; align-items:center; margin-bottom:12px; flex-wrap:wrap; }
.blog-card-category {
  background:#f0f9ff; color:#0284c7; font-size:10px; font-weight:700;
  text-transform:uppercase; letter-spacing:1px; padding:4px 10px; border-radius:20px;
}
.blog-card-date { font-size:12px; color:#94a3b8; }
.blog-card-read { font-size:12px; color:#94a3b8; margin-left:auto; }
.blog-card-title {
  font-family:'Playfair Display',serif; font-size:18px; font-weight:700;
  color:#0f172a; margin-bottom:10px; line-height:1.35;
}
.blog-card-excerpt {
  font-size:14px; color:#64748b; line-height:1.7; margin-bottom:18px;
  display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden;
}
.blog-card-link {
  color:#0284c7; font-weight:600; font-size:13px; text-decoration:none;
  display:inline-flex; align-items:center; gap:5px;
  transition:gap 0.2s; touch-action:manipulation; min-height:40px;
}
.blog-card-link:hover { gap:10px; color:#0c4a6e; }
.blog-empty { text-align:center; padding:60px 20px; color:#94a3b8; font-size:16px; }

/* No results message */
.no-results {
  display:none; text-align:center; padding:48px; color:#94a3b8;
  font-size:15px; grid-column:1/-1;
}

/* ─── WHATSAPP ───────────────────────────────────────────── */
.whatsapp-float {
  position:fixed; bottom:28px; right:28px; z-index:999;
  background:#25d366; color:white; border-radius:50%;
  width:52px; height:52px; display:flex; align-items:center; justify-content:center;
  font-size:24px; box-shadow:0 4px 16px rgba(37,211,102,0.3);
  text-decoration:none; transition:transform 0.2s; touch-action:manipulation;
}
.whatsapp-float:hover { transform:scale(1.08); background:#1da851; }

/* ─── RESPONSIVE ─────────────────────────────────────────── */
@media (max-width:1100px) {
  .blog-grid { grid-template-columns:repeat(2,1fr); }
  .magazine-grid { grid-template-columns:1fr; }
  .recent-posts-list { flex-direction:row; flex-wrap:wrap; gap:0; }
  .recent-post-item { width:50%; border-bottom:1px solid #f1f5f9; }
}
@media (max-width:992px) {
  .nav-links { position:fixed !important; top:0 !important; right:-100% !important; height:100vh !important; width:80% !important; max-width:320px !important; background:white !important; flex-direction:column !important; padding:90px 32px !important; transition:right 0.35s !important; align-items:flex-start !important; box-shadow:-4px 0 24px rgba(0,0,0,0.12) !important; z-index:999 !important; }
  .nav-links.active { right:0 !important; }
  .menu-toggle { display:flex !important; align-items:center !important; justify-content:center !important; }
  .blog-hero h1 { font-size:38px; }
}
@media (max-width:640px) {
  .blog-grid { grid-template-columns:1fr; }
  .blog-hero { padding:56px 24px; }
  .blog-hero h1 { font-size:30px; }
  .magazine-section, .blog-section { padding:48px 24px; }
  .breadcrumb { padding:14px 24px; }
  .nav-container { padding:0 24px !important; }
  .recent-posts-list { flex-direction:column; }
  .recent-post-item { width:100%; }
}
</style>
</head>
<body class="blog-page">

<nav id="navbar">
  <div class="nav-container">
    <a href="/" class="logo">
      <img src="/assets/walkabout_travel_logo.jpg" alt="WalkAbout Travel Logo"
           width="38" height="38" onerror="this.style.display='none'">
      <div class="logo-text">
        <span class="logo-title">WalkAbout Travel</span>
        <span class="logo-subtitle">TOURISM & TRAVEL</span>
      </div>
    </a>
    <ul class="nav-links" id="navLinks">
      <li><a href="/"><?=$L['home']?></a></li>
      <li><a href="/#popular-trips"><?=$L['tours']?></a></li>
      <li><a href="/#why-us">WHY US</a></li>
      <li><a href="<?=SITE_URL.$LANG_PREFIXES[$currentLang]?>/blog/"><?=$L['blog']?></a></li>
      <li><a href="/#contact">CONTACT</a></li>
    </ul>
    <div style="display:flex;align-items:center;">
      <div class="lang-dropdown">
        <button class="lang-dropdown-btn" aria-label="Select language" aria-expanded="false">
          <i class="fas fa-globe" aria-hidden="true"></i>
          <span><?=strtoupper($currentLang)?></span>
          <i class="fas fa-chevron-down" aria-hidden="true"></i>
        </button>
        <div class="lang-dropdown-content">
          <?php foreach($hreflangBlog as $lc=>$u): ?>
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
    <span class="breadcrumb-current"><?=$L['blog']?></span>
  </div>
</div>

<!-- HERO -->
<div class="blog-hero">
  <div class="blog-hero-inner">
    <h1><?=$L['blogTitle']?></h1>
    <p><?=htmlspecialchars($L['blogDesc'])?></p>
  </div>
</div>

<?php if($featuredPost): ?>
<?php
$fSlug    = $featuredPost['slug'] ?? makeSlug($featuredPost['title'] ?? '');
$fTitle   = getBlogField($featuredPost,'title',$currentLang);
$fExcerpt = getBlogField($featuredPost,'excerpt',$currentLang);
$fImg     = $featuredPost['image'] ?? '';
$fCat     = getBlogField($featuredPost,'category',$currentLang);
$fDate    = isset($featuredPost['date']) ? date('d M Y', strtotime($featuredPost['date'])) : '';
$fRead    = $featuredPost['readTime'] ?? '';
$fUrl     = SITE_URL.$LANG_PREFIXES[$currentLang].'/blog/'.$fSlug.'/';
?>
<!-- MAGAZINE SECTION -->
<section class="magazine-section">
  <div class="magazine-inner">
    <div class="magazine-label"><?=$L['featured']?></div>
    <div class="magazine-grid">

      <!-- Big featured card -->
      <a href="<?=htmlspecialchars($fUrl)?>" class="featured-post">
        <?php if($fImg): ?>
        <img src="<?=htmlspecialchars($fImg)?>" alt="<?=htmlspecialchars($fTitle)?>"
             width="800" height="500" loading="eager" fetchpriority="high" decoding="async">
        <?php endif; ?>
        <div class="featured-content">
          <?php if($fCat): ?><span class="featured-cat"><?=htmlspecialchars($fCat)?></span><?php endif; ?>
          <h2 class="featured-title"><?=htmlspecialchars($fTitle)?></h2>
          <div class="featured-meta">
            <?php if($fDate): ?><span><i class="far fa-calendar-alt"></i> <?=$fDate?></span><?php endif; ?>
            <?php if($fRead): ?><span><i class="far fa-clock"></i> <?=$fRead?> <?=$L['minRead']?></span><?php endif; ?>
          </div>
        </div>
      </a>

      <!-- Sidebar: son 3 yazı -->
      <?php if(!empty($sidebarPosts)): ?>
      <aside class="recent-posts-list">
        <?php foreach($sidebarPosts as $sp):
          $spSlug  = $sp['slug'] ?? makeSlug($sp['title'] ?? '');
          $spTitle = getBlogField($sp,'title',$currentLang);
          $spImg   = $sp['image'] ?? '';
          $spCat   = getBlogField($sp,'category',$currentLang);
          $spDate  = isset($sp['date']) ? date('d M Y', strtotime($sp['date'])) : '';
          $spUrl   = SITE_URL.$LANG_PREFIXES[$currentLang].'/blog/'.$spSlug.'/';
          if(!$spTitle||!$spSlug) continue;
        ?>
        <a href="<?=htmlspecialchars($spUrl)?>" class="recent-post-item">
          <div class="recent-thumb">
            <?php if($spImg): ?>
            <img src="<?=htmlspecialchars($spImg)?>" alt="<?=htmlspecialchars($spTitle)?>"
                 width="76" height="60" loading="lazy" decoding="async">
            <?php endif; ?>
          </div>
          <div class="recent-info">
            <?php if($spCat): ?><div class="recent-cat"><?=htmlspecialchars($spCat)?></div><?php endif; ?>
            <div class="recent-title"><?=htmlspecialchars($spTitle)?></div>
            <?php if($spDate): ?><div class="recent-date"><?=$spDate?></div><?php endif; ?>
          </div>
        </a>
        <?php endforeach; ?>
      </aside>
      <?php endif; ?>

    </div>
  </div>
</section>
<?php endif; ?>

<!-- FILTER + GRID -->
<section class="blog-section">
  <div class="blog-container">

    <?php if(!empty($posts)): ?>
    <!-- Category filter -->
    <div class="category-filters" id="categoryFilters">
      <button class="filter-btn active" data-cat="all"><?=$L['all']?></button>
      <?php foreach($categories as $cat): ?>
      <button class="filter-btn" data-cat="<?=htmlspecialchars($cat)?>">
        <?=htmlspecialchars($cat)?>
      </button>
      <?php endforeach; ?>
    </div>

    <!-- Blog grid -->
    <div class="blog-grid" id="blogGrid">
      <?php
      $postIndex = 0;
      foreach($posts as $post):
        $postSlug    = $post['slug'] ?? makeSlug($post['title'] ?? '');
        $postTitle   = getBlogField($post,'title',$currentLang);
        $postExcerpt = getBlogField($post,'excerpt',$currentLang);
        if(!$postExcerpt) $postExcerpt = mb_substr(strip_tags(getBlogField($post,'content',$currentLang)),0,140);
        $postImg     = $post['image'] ?? '';
        $postCat     = getBlogField($post,'category',$currentLang);
        $postDate    = isset($post['date']) ? date('d M Y', strtotime($post['date'])) : '';
        $postRead    = $post['readTime'] ?? '';
        $postUrl     = SITE_URL.$LANG_PREFIXES[$currentLang].'/blog/'.$postSlug.'/';
        if(!$postTitle||!$postSlug) continue;
        $imgLoading  = $postIndex < 3 ? 'eager' : 'lazy';
        $postIndex++;
      ?>
      <article class="blog-card"
               data-category="<?=htmlspecialchars($postCat)?>"
               itemscope itemtype="https://schema.org/BlogPosting">
        <a href="<?=htmlspecialchars($postUrl)?>" class="blog-card-img-wrap" tabindex="-1" aria-hidden="true">
          <?php if($postImg): ?>
          <img class="blog-card-img"
               src="<?=htmlspecialchars($postImg)?>"
               alt="<?=htmlspecialchars($postTitle)?>"
               width="400" height="250"
               loading="<?=$imgLoading?>" decoding="async"
               itemprop="image">
          <?php endif; ?>
        </a>
        <div class="blog-card-body">
          <div class="blog-card-meta">
            <?php if($postCat): ?><span class="blog-card-category"><?=htmlspecialchars($postCat)?></span><?php endif; ?>
            <?php if($postDate): ?><span class="blog-card-date"><i class="far fa-calendar-alt" aria-hidden="true"></i> <?=$postDate?></span><?php endif; ?>
            <?php if($postRead): ?><span class="blog-card-read"><i class="far fa-clock" aria-hidden="true"></i> <?=$postRead?> <?=$L['minRead']?></span><?php endif; ?>
          </div>
          <h2 class="blog-card-title" itemprop="headline">
            <a href="<?=htmlspecialchars($postUrl)?>" style="text-decoration:none;color:inherit;"><?=htmlspecialchars($postTitle)?></a>
          </h2>
          <p class="blog-card-excerpt" itemprop="description"><?=htmlspecialchars($postExcerpt)?></p>
          <a href="<?=htmlspecialchars($postUrl)?>" class="blog-card-link">
            <?=$L['readMore']?> <i class="fas fa-arrow-right" aria-hidden="true"></i>
          </a>
        </div>
      </article>
      <?php endforeach; ?>
      <p class="no-results" id="noResults">Sonuç bulunamadı.</p>
    </div>

    <?php else: ?>
    <p class="blog-empty">
      <i class="fas fa-pen-nib" style="font-size:36px;display:block;margin-bottom:14px;" aria-hidden="true"></i>
      Yakında içerik gelecek.
    </p>
    <?php endif; ?>

  </div>
</section>

<a href="https://wa.me/902125551923" class="whatsapp-float"
   target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
  <i class="fab fa-whatsapp" aria-hidden="true"></i>
</a>

<script>
// ─── Category filter ─────────────────────────────────────
const filterBtns = document.querySelectorAll('.filter-btn');
const cards      = document.querySelectorAll('.blog-card');
const noResults  = document.getElementById('noResults');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const cat = btn.dataset.cat;
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    let visible = 0;
    cards.forEach(card => {
      const cardCat = card.dataset.category || '';
      if (cat === 'all' || cardCat === cat) {
        card.classList.remove('hidden');
        visible++;
      } else {
        card.classList.add('hidden');
      }
    });
    if (noResults) noResults.style.display = visible === 0 ? 'block' : 'none';
  });
});

// ─── Nav ─────────────────────────────────────────────────
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
