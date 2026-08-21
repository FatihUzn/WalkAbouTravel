<?php
/* ============================================================
   blog.php — Blog listesi (5 dil)
   ============================================================ */
require_once __DIR__ . '/functions.php';

$currentLang = detectLang();
$LP          = $LANG_PREFIXES[$currentLang];
$htmlDir     = $currentLang === 'ar' ? ' dir="rtl"' : '';

$posts        = loadPosts();               // ISO tarihe göre doğru sıralı
$featuredPost = $posts[0] ?? null;
$sidebarPosts = array_slice($posts, 1, 3);

// Kategoriler artık dile göre (category_en / _es / _pt / _ar alanları eklendi)
$categories = [];
foreach ($posts as $p) {
    $c = getLangField($p, 'category', $currentLang);
    if ($c && !in_array($c, $categories, true)) $categories[] = $c;
}

$canonicalBase = SITE_URL . $LP . '/blog/';
$hreflangBlog  = [];
foreach ($LANG_PREFIXES as $lc => $p) $hreflangBlog[$lc] = SITE_URL . $p . '/blog/';

$dict = [
 'tr'=>['home'=>'Ana Sayfa','tours'=>'Turlar','blog'=>'Blog','readMore'=>'Devamını Oku','minRead'=>'dk okuma','blogTitle'=>'Seyahat Blogu','blogDesc'=>'Gezi rehberleri, ipuçları ve ilham verici hikayeler','all'=>'Tümü','featured'=>'Öne Çıkan Yazı','latest'=>'Son Yazılar','none'=>'Sonuç bulunamadı.','soon'=>'Yakında içerik gelecek.'],
 'en'=>['home'=>'Home','tours'=>'Tours','blog'=>'Blog','readMore'=>'Read More','minRead'=>'min read','blogTitle'=>'Travel Blog','blogDesc'=>'Travel guides, tips and inspiring stories','all'=>'All','featured'=>'Featured Post','latest'=>'Latest Posts','none'=>'No results found.','soon'=>'Content coming soon.'],
 'es'=>['home'=>'Inicio','tours'=>'Tours','blog'=>'Blog','readMore'=>'Leer Más','minRead'=>'min lectura','blogTitle'=>'Blog de Viajes','blogDesc'=>'Guías de viaje, consejos e historias inspiradoras','all'=>'Todo','featured'=>'Artículo Destacado','latest'=>'Últimos Artículos','none'=>'No se encontraron resultados.','soon'=>'Contenido próximamente.'],
 'pt'=>['home'=>'Início','tours'=>'Passeios','blog'=>'Blog','readMore'=>'Ler Mais','minRead'=>'min leitura','blogTitle'=>'Blog de Viagens','blogDesc'=>'Guias de viagem, dicas e histórias inspiradoras','all'=>'Tudo','featured'=>'Destaque','latest'=>'Últimas Publicações','none'=>'Nenhum resultado.','soon'=>'Conteúdo em breve.'],
 'ar'=>['home'=>'الرئيسية','tours'=>'جولات','blog'=>'مدونة','readMore'=>'اقرأ المزيد','minRead'=>'دقيقة قراءة','blogTitle'=>'مدونة السفر','blogDesc'=>'أدلة السفر والنصائح والقصص الملهمة','all'=>'الكل','featured'=>'المقال المميز','latest'=>'أحدث المقالات','none'=>'لا توجد نتائج.','soon'=>'المحتوى قريباً.'],
];
$L = $dict[$currentLang] ?? $dict['tr'];

$breadcrumbSchema = json_encode([
  '@context'=>'https://schema.org','@type'=>'BreadcrumbList','itemListElement'=>[
    ['@type'=>'ListItem','position'=>1,'name'=>$L['home'],'item'=>SITE_URL.$LP.'/'],
    ['@type'=>'ListItem','position'=>2,'name'=>$L['blog'],'item'=>$canonicalBase],
  ]], JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);

// Blog listesi yapılandırılmış verisi
$listSchema = json_encode([
  '@context'=>'https://schema.org','@type'=>'Blog',
  'name'=>$L['blogTitle'].' | '.SITE_NAME,'url'=>$canonicalBase,
  'description'=>$L['blogDesc'],
  'publisher'=>['@type'=>'Organization','name'=>SITE_NAME,'url'=>SITE_URL],
], JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);
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
<link rel="icon" type="image/webp" href="/assets/img/walkabout-travel-logo-400.webp">
<script type="application/ld+json"><?=$listSchema?></script>
<meta property="og:site_name" content="<?=e(SITE_NAME)?>">
<meta property="og:locale" content="<?=e($LANG_LOCALES[$currentLang])?>">

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
      <li><a href="<?=$LP?>/"><?=e($L['home'])?></a></li>
      <li><a href="<?=$LP?>/#popular-trips"><?=e($L['tours'])?></a></li>
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
          <a href="<?=e($u)?>" hreflang="<?=e($lc)?>"<?=$lc===$currentLang?' aria-current="true"':''?>><?=e($LANG_NAMES[$lc])?></a>
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
$fTitle   = getLangField($featuredPost,'title',$currentLang);
$fExcerpt = getLangField($featuredPost,'excerpt',$currentLang);
$fImg     = $featuredPost['image'] ?? '';
$fCat     = getLangField($featuredPost,'category',$currentLang);
$fDate    = isset($featuredPost['date']) ? fmtDate($featuredPost['date'] ?? '', $currentLang) : '';
$fRead    = $featuredPost['readTime'] ?? '';
$fUrl     = postUrl($featuredPost, $currentLang);
?>
<!-- MAGAZINE SECTION -->
<section class="magazine-section">
  <div class="magazine-inner">
    <div class="magazine-label"><?=$L['featured']?></div>
    <div class="magazine-grid">

      <!-- Big featured card -->
      <a href="<?=htmlspecialchars($fUrl)?>" class="featured-post">
        <?= imgTag($fImg, $fTitle, '(max-width:1100px) 100vw, 800px',
                   ['loading'=>'eager','fetchpriority'=>'high']) ?>
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
          $spTitle = getLangField($sp,'title',$currentLang);
          $spImg   = $sp['image'] ?? '';
          $spCat   = getLangField($sp,'category',$currentLang);
          $spDate  = isset($sp['date']) ? fmtDate($sp['date'] ?? '', $currentLang) : '';
          $spUrl   = postUrl($sp, $currentLang);
          if(!$spTitle || !$spUrl) continue;
        ?>
        <a href="<?=htmlspecialchars($spUrl)?>" class="recent-post-item">
          <div class="recent-thumb">
            <?= imgTag($spImg, $spTitle, '76px', ['loading'=>'lazy']) ?>
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
        $postTitle   = getLangField($post,'title',$currentLang);
        $postExcerpt = getLangField($post,'excerpt',$currentLang);
        if(!$postExcerpt) $postExcerpt = mb_substr(strip_tags(getLangField($post,'content',$currentLang)),0,140);
        $postImg     = $post['image'] ?? '';
        $postCat     = getLangField($post,'category',$currentLang);
        $postDate    = fmtDate($post['date'] ?? '', $currentLang);
        $postRead    = $post['readTime'] ?? '';
        $postUrl     = postUrl($post, $currentLang);
        if(!$postTitle || !$postUrl) continue;
        $imgLoading  = $postIndex < 3 ? 'eager' : 'lazy';
        $postIndex++;
      ?>
      <article class="blog-card"
               data-category="<?=htmlspecialchars($postCat)?>"
               itemscope itemtype="https://schema.org/BlogPosting">
        <a href="<?=htmlspecialchars($postUrl)?>" class="blog-card-img-wrap" tabindex="-1" aria-hidden="true">
          <?= imgTag($postImg, $postTitle, '(max-width:700px) 100vw, 400px',
                     ['class'=>'blog-card-img','loading'=>$imgLoading,'itemprop'=>'image']) ?>
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
      <p class="no-results" id="noResults"><?=e($L['none'])?></p>
    </div>

    <?php else: ?>
    <p class="blog-empty">
      <i class="fas fa-pen-nib" style="font-size:36px;display:block;margin-bottom:14px;" aria-hidden="true"></i>
      <?=e($L['soon'])?>
    </p>
    <?php endif; ?>

  </div>
</section>

<a href="<?=e(waLink())?>" class="whatsapp-float"
   target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
  <i class="fab fa-whatsapp" aria-hidden="true"></i>
</a>

<!-- Mobil menü + dil menüsü app.js tarafından yönetiliyor (çift dinleyici kaldırıldı) -->
<script src="/i18n.js" defer></script>
<script src="/app.js" defer></script>
<script>
/* Kategori filtresi — kartları yeniden çizmeden göster/gizle */
(function () {
  var filtreler = document.getElementById('categoryFilters');
  var grid      = document.getElementById('blogGrid');
  if (!filtreler || !grid) return;
  var kartlar = Array.prototype.slice.call(grid.querySelectorAll('.blog-card'));
  var bos     = document.getElementById('noResults');
  if (bos) bos.hidden = true;

  filtreler.addEventListener('click', function (e) {
    var b = e.target.closest('.filter-btn');
    if (!b) return;
    var kat = b.dataset.cat;
    var say = 0;
    kartlar.forEach(function (k) {
      var ok = kat === 'all' || k.dataset.category === kat;
      k.hidden = !ok;
      if (ok) say++;
    });
    filtreler.querySelectorAll('.filter-btn').forEach(function (x) {
      x.classList.toggle('active', x === b);
    });
    if (bos) bos.hidden = say > 0;
  });

  try {
    localStorage.setItem('language', '<?=e($currentLang)?>');
    sessionStorage.setItem('language', '<?=e($currentLang)?>');
  } catch (err) {}
})();
</script>
</body>
</html>
