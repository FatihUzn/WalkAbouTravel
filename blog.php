<?php
// ============================================================
//  blog.php — WalkAbout Travel Blog Listesi
//  ✅ Core Web Vitals Optimized (LCP · CLS · INP)  v2 — 2025-06
// ============================================================

define('SITE_URL',  'https://www.walkabouttravel.com');
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
usort($posts, fn($a,$b) => strcmp($b['date'] ?? '', $a['date'] ?? ''));

function makeSlug(string $t): string {
    $t = str_replace(['ş','ğ','ü','ö','ı','ç','Ş','Ğ','Ü','Ö','İ','Ç'],
                     ['s','g','u','o','i','c','s','g','u','o','i','c'], $t);
    return strtolower(preg_replace('/[\s-]+/','-',trim(preg_replace('/[^a-z0-9\s-]/','', $t))));
}
function getBlogField(array $obj, string $field, string $lang): string {
    $key = $lang !== 'tr' ? $field.'_'.$lang : $field;
    return $obj[$key] ?? $obj[$field.'_en'] ?? $obj[$field] ?? '';
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
    'tr' => ['home'=>'Ana Sayfa','tours'=>'Turlar','blog'=>'Blog','readMore'=>'Devamını Oku','minRead'=>'dk okuma','blogTitle'=>'Seyahat Blogu','blogDesc'=>'Gezi rehberleri, ipuçları ve ilham verici hikayeler'],
    'en' => ['home'=>'Home','tours'=>'Tours','blog'=>'Blog','readMore'=>'Read More','minRead'=>'min read','blogTitle'=>'Travel Blog','blogDesc'=>'Travel guides, tips and inspiring stories'],
    'es' => ['home'=>'Inicio','tours'=>'Tours','blog'=>'Blog','readMore'=>'Leer Más','minRead'=>'min lectura','blogTitle'=>'Blog de Viajes','blogDesc'=>'Guías de viaje, consejos e historias inspiradoras'],
    'pt' => ['home'=>'Início','tours'=>'Passeios','blog'=>'Blog','readMore'=>'Ler Mais','minRead'=>'min leitura','blogTitle'=>'Blog de Viagens','blogDesc'=>'Guias de viagem, dicas e histórias inspiradoras'],
    'ar' => ['home'=>'الرئيسية','tours'=>'جولات','blog'=>'مدونة','readMore'=>'اقرأ المزيد','minRead'=>'دقيقة قراءة','blogTitle'=>'مدونة السفر','blogDesc'=>'أدلة السفر والنصائح والقصص الملهمة'],
];
$L       = $dict[$currentLang] ?? $dict['tr'];
$htmlDir = $currentLang === 'ar' ? ' dir="rtl"' : '';

// HTTP Early Hints
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

<!-- CWV: preconnect + async Font Awesome -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="dns-prefetch" href="https://cdnjs.cloudflare.com">

<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;900&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">

<!-- Font Awesome async -->
<link rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      media="print" onload="this.media='all'">
<noscript>
  <link rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</noscript>

<link rel="stylesheet" href="/style.css">

<style>
*,*::before,*::after { margin:0; padding:0; box-sizing:border-box; }
html { overflow-x:hidden; }
body { font-family:'Inter',sans-serif; background:#ffffff; color:#1e293b; overflow-x:hidden; }

/* CLS: nav sabit yükseklik */
nav {
  position:fixed !important; top:0 !important; left:0 !important; right:0 !important;
  z-index:1000 !important; min-height:61px !important;
  background:rgba(255,255,255,0.98) !important;
  backdrop-filter:blur(10px) !important;
  border-bottom:1px solid rgba(0,0,0,0.08) !important;
  box-shadow:0 1px 3px rgba(0,0,0,0.05) !important;
  will-change:transform;
  contain:layout style;
}
.header-top-row { display:none !important; }
.nav-container { display:flex !important; align-items:center !important; justify-content:space-between !important; padding:10px 40px !important; max-width:100% !important; margin:0 !important; }
.logo { display:flex !important; align-items:center !important; gap:12px !important; text-decoration:none !important; }
/* CLS: logo img sabit boyut */
.logo img { height:40px !important; width:40px !important; border-radius:8px !important; object-fit:cover !important; }
.logo-text { display:flex !important; flex-direction:column !important; }
.logo-title { font-family:'Playfair Display',serif !important; font-size:20px !important; font-weight:700 !important; color:#0c4a6e !important; line-height:1 !important; }
.logo-subtitle { font-size:10px !important; color:#64748b !important; letter-spacing:1.5px !important; text-transform:uppercase !important; margin-top:2px !important; }
.nav-links { display:flex !important; gap:40px !important; align-items:center !important; flex:1 !important; justify-content:center !important; list-style:none !important; }
.nav-links li { display:inline !important; }
.nav-links a { color:#0c4a6e !important; text-decoration:none !important; font-weight:600 !important; font-size:14px !important; transition:color 0.3s !important; text-transform:uppercase; }
.nav-links a:hover { color:#38bdf8 !important; }
.lang-dropdown { position:relative; margin-left:20px; }
.lang-dropdown-btn { background:transparent; border:1px solid #cbd5e1; color:#0c4a6e; padding:8px 15px; border-radius:8px; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:8px; min-height:38px; touch-action:manipulation; }
.lang-dropdown-content { display:none; position:absolute; right:0; top:100%; margin-top:5px; background:white; min-width:150px; box-shadow:0 10px 25px rgba(0,0,0,0.1); border-radius:12px; border:1px solid #e2e8f0; overflow:hidden; z-index:1000; }
.lang-dropdown-content a { color:#475569; padding:12px 16px; text-decoration:none; display:block; font-size:14px; font-weight:500; transition:background 0.2s; }
.lang-dropdown-content a:hover { background:#f8fafc; color:#38bdf8; }
.lang-dropdown.active .lang-dropdown-content { display:block; }
.menu-toggle { display:none !important; font-size:24px !important; color:#0c4a6e !important; background:none !important; border:none !important; cursor:pointer !important; min-width:44px !important; min-height:44px !important; touch-action:manipulation !important; }

/* CLS: breadcrumb margin-top = nav min-height */
.breadcrumb { padding:25px 40px; background:#f8fafc; margin-top:61px; border-bottom:1px solid #e2e8f0; min-height:64px; }
.breadcrumb-container { max-width:1200px; margin:0 auto; display:flex; align-items:center; gap:10px; font-size:13px; font-weight:500; text-transform:uppercase; letter-spacing:0.5px; }
.breadcrumb a { color:#64748b; text-decoration:none; transition:color 0.3s; }
.breadcrumb a:hover { color:#38bdf8; }
.breadcrumb-separator { color:#cbd5e1; }
.breadcrumb-current { color:#0c4a6e; font-weight:700; }

/* LCP: blog-hero — CSS gradient, hızlı boyama */
.blog-hero { background:linear-gradient(135deg,#0c4a6e 0%,#0284c7 100%); padding:80px 40px; text-align:center; color:white; }
.blog-hero h1 { font-family:'Playfair Display',serif; font-size:52px; font-weight:900; margin-bottom:16px; }
.blog-hero p { font-size:18px; color:rgba(255,255,255,0.8); max-width:600px; margin:0 auto; }

.blog-section { padding:80px 40px; background:#f8fafc; }
.blog-container { max-width:1200px; margin:0 auto; }
.blog-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:32px; }

/* CLS: blog-card — contain ile izole */
.blog-card {
  background:white; border-radius:16px; overflow:hidden;
  box-shadow:0 4px 20px rgba(0,0,0,0.06);
  transition:transform 0.2s ease, box-shadow 0.2s ease; /* INP: kısa */
  border:1px solid #e2e8f0;
  contain:layout paint;
}
.blog-card:hover { transform:translateY(-6px); box-shadow:0 12px 40px rgba(0,0,0,0.12); }

/* CLS: kart görseli — aspect-ratio ile yer rezervasyonu */
.blog-card-img-wrap { overflow:hidden; aspect-ratio:16/9; background:#e2e8f0; display:block; }
.blog-card-img {
  width:100%; height:100%; object-fit:cover; display:block;
  transition:transform 0.4s ease; /* INP: kısa */
}
.blog-card:hover .blog-card-img { transform:scale(1.05); }

.blog-card-body { padding:28px; }
.blog-card-meta { display:flex; gap:16px; align-items:center; margin-bottom:14px; flex-wrap:wrap; }
.blog-card-category { background:#f0f9ff; color:#0284c7; font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:1px; padding:5px 12px; border-radius:20px; }
.blog-card-date { font-size:13px; color:#94a3b8; }
.blog-card-read { font-size:13px; color:#94a3b8; margin-left:auto; }
.blog-card-title { font-family:'Playfair Display',serif; font-size:20px; font-weight:700; color:#0f172a; margin-bottom:12px; line-height:1.3; }
.blog-card-excerpt { font-size:14px; color:#64748b; line-height:1.7; margin-bottom:20px; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden; }
.blog-card-link {
  color:#0284c7; font-weight:700; font-size:14px; text-decoration:none;
  display:inline-flex; align-items:center; gap:6px;
  transition:gap 0.2s; /* INP: kısa */
  touch-action:manipulation; /* INP */
  min-height:44px; /* INP: dokunma hedefi */
}
.blog-card-link:hover { gap:10px; color:#0c4a6e; }
.blog-empty { text-align:center; padding:60px 20px; color:#94a3b8; font-size:18px; }

/* WhatsApp float */
.whatsapp-float {
  position:fixed; bottom:30px; right:30px; z-index:999;
  background:#25d366; color:white; border-radius:50%;
  width:56px; height:56px;
  display:flex; align-items:center; justify-content:center;
  font-size:26px; box-shadow:0 4px 15px rgba(37,211,102,0.4);
  text-decoration:none; transition:transform 0.2s, background-color 0.2s;
  touch-action:manipulation; will-change:transform;
}
.whatsapp-float:hover { transform:scale(1.1); background:#1da851; }

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
  .blog-grid { grid-template-columns:repeat(2,1fr); }
  .blog-hero h1 { font-size:40px; }
}
@media (max-width:576px) {
  .blog-grid { grid-template-columns:1fr; }
  .blog-hero { padding:60px 20px; }
  .blog-hero h1 { font-size:32px; }
  .blog-section { padding:40px 20px; }
  .breadcrumb { padding:15px 20px; }
  .nav-container { padding:10px 20px !important; }
}
</style>
</head>
<body>

<nav id="navbar">
    <div class="nav-container">
        <a href="/" class="logo">
            <!-- CLS: width + height zorunlu -->
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

<div class="blog-hero">
    <h1><?=$L['blogTitle']?></h1>
    <p><?=htmlspecialchars($L['blogDesc'])?></p>
</div>

<section class="blog-section">
    <div class="blog-container">
        <?php if(empty($posts)): ?>
        <p class="blog-empty">
            <i class="fas fa-pen-nib" style="font-size:40px;display:block;margin-bottom:16px;" aria-hidden="true"></i>
            Yakında içerik gelecek.
        </p>
        <?php else: ?>
        <div class="blog-grid">
            <?php
            $postIndex = 0;
            foreach($posts as $post):
                $postSlug    = $post['slug'] ?? makeSlug($post['title'] ?? '');
                $postTitle   = getBlogField($post,'title',$currentLang);
                $postExcerpt = getBlogField($post,'excerpt',$currentLang);
                if(!$postExcerpt) $postExcerpt = mb_substr(strip_tags(getBlogField($post,'content',$currentLang)),0,160);
                $postImg     = $post['image'] ?? '';
                $postCat     = getBlogField($post,'category',$currentLang);
                $postDate    = isset($post['date']) ? date('d M Y', strtotime($post['date'])) : '';
                $postRead    = $post['readTime'] ?? '';
                $postUrl     = SITE_URL.$LANG_PREFIXES[$currentLang].'/blog/'.$postSlug.'/';
                if(!$postTitle||!$postSlug) continue;
                // LCP: ilk 3 kart eager, geri kalanlar lazy
                $imgLoading  = $postIndex < 3 ? 'eager' : 'lazy';
                $postIndex++;
            ?>
            <article class="blog-card" itemscope itemtype="https://schema.org/BlogPosting">
                <a href="<?=htmlspecialchars($postUrl)?>" class="blog-card-img-wrap" tabindex="-1" aria-hidden="true">
                    <?php if($postImg): ?>
                    <!-- CLS: width+height attribute zorunlu -->
                    <img class="blog-card-img"
                         src="<?=htmlspecialchars($postImg)?>"
                         alt="<?=htmlspecialchars($postTitle)?>"
                         width="400" height="225"
                         loading="<?=$imgLoading?>"
                         decoding="async"
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
        </div>
        <?php endif; ?>
    </div>
</section>

<a href="https://wa.me/902125551923"
   class="whatsapp-float"
   target="_blank"
   rel="noopener noreferrer"
   aria-label="WhatsApp ile iletişim">
    <i class="fab fa-whatsapp" aria-hidden="true"></i>
</a>

<script>
// INP: event delegation + rAF
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
        const dd   = btn.closest('.lang-dropdown');
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
