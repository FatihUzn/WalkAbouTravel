<?php
// ============================================================
//  blog-post.php — WalkAbout Travel Blog Yazı Detay Sayfası
//  URL: /blog/{slug}/ (TR) | /en/blog/{slug}/ | /es/blog/{slug}/
//  .htaccess: RewriteRule ^blog/([^/]+)/?$ /blog-post.php [L]
//             RewriteRule ^(en|es|ar|pt)/blog/([^/]+)/?$ /blog-post.php [L]
// ============================================================

// SITE_URL: otomatik tespit — hangi domain'de çalışıyorsa o kullanılır
$_protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$_host     = $_SERVER['HTTP_HOST'] ?? 'localhost';
define('SITE_URL',  $_protocol . '://' . $_host);
define('SITE_NAME', 'WalkAbout Travel');

$LANG_PREFIXES = ['tr'=>'','en'=>'/en','es'=>'/es','ar'=>'/ar','pt'=>'/pt'];
$LANG_NAMES    = ['tr'=>'Türkçe','en'=>'English','es'=>'Español','ar'=>'العربية','pt'=>'Português'];

// Dil ve slug tespiti
$uri         = rtrim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/');
$currentLang = 'tr';
$slug        = '';
foreach (['en','es','ar','pt'] as $lc) {
    if (str_starts_with($uri, '/'.$lc.'/blog/')) {
        $currentLang = $lc;
        $slug = substr($uri, strlen('/'.$lc.'/blog/'));
        break;
    }
}
if ($currentLang === 'tr' && str_starts_with($uri, '/blog/')) {
    $slug = substr($uri, strlen('/blog/'));
}

// Blog yazılarını oku
$blogsFile = __DIR__ . '/data/blog-posts.json';
$allPosts  = file_exists($blogsFile)
    ? (json_decode(file_get_contents($blogsFile), true) ?? [])
    : [];

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

// Makaleyi bul
$post = null;
foreach ($allPosts as $p) {
    $ps = $p['slug'] ?? makeSlug($p['title'] ?? '');
    if ($ps === $slug) { $post = $p; break; }
}
if (!$post) { http_response_code(404); die('<h1>404 — Post not found</h1><a href="/blog/">← Blog</a>'); }
if (($post['published'] ?? true) === false) { http_response_code(404); die('<h1>404</h1>'); }

// Alanları çek
$title      = getBlogField($post,'title',$currentLang);
$content    = getBlogField($post,'content',$currentLang);
$excerpt    = getBlogField($post,'excerpt',$currentLang) ?: mb_substr(strip_tags($content),0,160);
$image      = $post['image'] ?? '';
$category   = getBlogField($post,'category',$currentLang);
$author     = $post['author'] ?? SITE_NAME;
$dateRaw    = $post['date'] ?? date('Y-m-d');
$dateDisplay= date('d M Y', strtotime($dateRaw));
$readTime   = $post['readTime'] ?? '';
$tags       = $post['tags'] ?? [];

// FAQ (blog yazılarında da desteklenir)
$faqKey   = $currentLang === 'tr' ? 'faq' : 'faq_'.$currentLang;
$faqItems = !empty($post[$faqKey]) ? $post[$faqKey]
          : (!empty($post['faq_en']) ? $post['faq_en']
          : ($post['faq'] ?? []));

// Canonical & hreflang
$canonicalUrl = SITE_URL.$LANG_PREFIXES[$currentLang].'/blog/'.$slug.'/';
$hreflang     = [];
foreach ($LANG_PREFIXES as $lc=>$p2) $hreflang[$lc] = SITE_URL.$p2.'/blog/'.$slug.'/';
$imageAbs     = str_starts_with($image,'http') ? $image : SITE_URL.'/'.ltrim($image,'/');

// Article schema
$articleSchema = json_encode([
    '@context'        => 'https://schema.org',
    '@type'           => 'BlogPosting',
    'headline'        => $title,
    'description'     => $excerpt,
    'image'           => $imageAbs ?: null,
    'datePublished'   => $dateRaw,
    'dateModified'    => $post['dateModified'] ?? $dateRaw,
    'author'          => ['@type'=>'Person','name'=>$author],
    'publisher'       => ['@type'=>'Organization','name'=>SITE_NAME,'url'=>SITE_URL,
                          'logo'=>['@type'=>'ImageObject','url'=>SITE_URL.'/assets/walkabout_travel_logo.jpg']],
    'url'             => $canonicalUrl,
    'mainEntityOfPage'=> ['@type'=>'WebPage','@id'=>$canonicalUrl],
    'keywords'        => implode(', ', $tags),
], JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES|JSON_PRETTY_PRINT);

// Breadcrumb schema
$breadcrumbSchema = json_encode([
    '@context' => 'https://schema.org',
    '@type'    => 'BreadcrumbList',
    'itemListElement' => [
        ['@type'=>'ListItem','position'=>1,'name'=>'Home','item'=>SITE_URL.'/'],
        ['@type'=>'ListItem','position'=>2,'name'=>'Blog','item'=>SITE_URL.$LANG_PREFIXES[$currentLang].'/blog/'],
        ['@type'=>'ListItem','position'=>3,'name'=>$title,'item'=>$canonicalUrl],
    ]
], JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);

// FAQ schema
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
        JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES|JSON_PRETTY_PRINT
    );
}

$dict = [
    'tr' => ['home'=>'Ana Sayfa','tours'=>'Turlar','blog'=>'Blog','backBlog'=>'← Blog\'a Dön','by'=>'Yazan','readTime'=>'dk okuma','share'=>'Paylaş','relatedTitle'=>'İlgili Turlar','faqTitle'=>'Sıkça Sorulan Sorular','inquire'=>'Bilgi Al','whatsapp'=>'WhatsApp'],
    'en' => ['home'=>'Home','tours'=>'Tours','blog'=>'Blog','backBlog'=>'← Back to Blog','by'=>'By','readTime'=>'min read','share'=>'Share','relatedTitle'=>'Related Tours','faqTitle'=>'Frequently Asked Questions','inquire'=>'Inquire Now','whatsapp'=>'WhatsApp'],
    'es' => ['home'=>'Inicio','tours'=>'Tours','blog'=>'Blog','backBlog'=>'← Volver al Blog','by'=>'Por','readTime'=>'min lectura','share'=>'Compartir','relatedTitle'=>'Tours Relacionados','faqTitle'=>'Preguntas Frecuentes','inquire'=>'Consultar','whatsapp'=>'WhatsApp'],
    'pt' => ['home'=>'Início','tours'=>'Passeios','blog'=>'Blog','backBlog'=>'← Voltar ao Blog','by'=>'Por','readTime'=>'min leitura','share'=>'Compartilhar','relatedTitle'=>'Tours Relacionados','faqTitle'=>'Perguntas Frequentes','inquire'=>'Consultar','whatsapp'=>'WhatsApp'],
    'ar' => ['home'=>'الرئيسية','tours'=>'جولات','blog'=>'مدونة','backBlog'=>'← العودة للمدونة','by'=>'بقلم','readTime'=>'دقيقة قراءة','share'=>'مشاركة','relatedTitle'=>'جولات ذات صلة','faqTitle'=>'الأسئلة الشائعة','inquire'=>'استفسر الآن','whatsapp'=>'واتساب'],
];
$L       = $dict[$currentLang] ?? $dict['tr'];
$htmlDir = $currentLang === 'ar' ? ' dir="rtl"' : '';

// İlgili turlar (blog yazısına tag eşleşmesiyle)
$toursFile = __DIR__.'/data/tours.json';
$tours = file_exists($toursFile) ? (json_decode(file_get_contents($toursFile), true) ?? []) : [];
function tourSlug(array $t, string $lang): string {
    if (!empty($t['slug_'.$lang])) return $t['slug_'.$lang];
    if (!empty($t['slug']))        return $t['slug'];
    $f = $lang==='tr' ? 'title' : 'title_'.$lang;
    return makeSlug($t[$f] ?? $t['title_en'] ?? $t['title'] ?? '');
}
$relatedTours = array_slice(
    array_filter($tours, fn($t) => !empty(array_intersect($tags, $t['tags'] ?? []))),
    0, 3
);
?>
<!DOCTYPE html>
<html lang="<?=htmlspecialchars($currentLang)?>"<?=$htmlDir?>>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title><?=htmlspecialchars($title)?> | <?=SITE_NAME?></title>
<meta name="description" content="<?=htmlspecialchars($excerpt)?>">
<link rel="canonical" href="<?=htmlspecialchars($canonicalUrl)?>">
<?php foreach($hreflang as $lc=>$u): ?>
<link rel="alternate" hreflang="<?=$lc?>" href="<?=htmlspecialchars($u)?>">
<?php endforeach; ?>
<link rel="alternate" hreflang="x-default" href="<?=htmlspecialchars($hreflang['en'])?>">
<meta property="og:type" content="article">
<meta property="og:url" content="<?=htmlspecialchars($canonicalUrl)?>">
<meta property="og:title" content="<?=htmlspecialchars($title)?> | <?=SITE_NAME?>">
<meta property="og:description" content="<?=htmlspecialchars($excerpt)?>">
<?php if($image): ?><meta property="og:image" content="<?=htmlspecialchars($imageAbs)?>"><?php endif; ?>
<meta property="article:published_time" content="<?=htmlspecialchars($dateRaw)?>">
<meta property="article:author" content="<?=htmlspecialchars($author)?>">
<script type="application/ld+json"><?=$articleSchema?></script>
<script type="application/ld+json"><?=$breadcrumbSchema?></script>
<?php if($faqSchema): ?><script type="application/ld+json"><?=$faqSchema?></script><?php endif; ?>
<link rel="icon" href="/assets/walkabout_travel_logo.jpg">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;900&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/style.css">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { margin: 0 !important; padding: 0 !important; overflow-x: hidden; }
body { font-family: 'Inter', sans-serif; background: #ffffff; color: #1e293b; }
nav { position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; z-index: 1000 !important; background: rgba(255,255,255,0.98) !important; backdrop-filter: blur(10px) !important; border-bottom: 1px solid rgba(0,0,0,0.08) !important; box-shadow: 0 1px 3px rgba(0,0,0,0.05) !important; }
.header-top-row { display: none !important; }
.nav-container { display: flex !important; align-items: center !important; justify-content: space-between !important; padding: 10px 40px !important; max-width: 100% !important; margin: 0 !important; }
.logo { display: flex !important; align-items: center !important; gap: 12px !important; text-decoration: none !important; }
.logo img { height: 40px !important; border-radius: 8px !important; }
.logo-text { display: flex !important; flex-direction: column !important; }
.logo-title { font-family: 'Playfair Display',serif !important; font-size: 20px !important; font-weight: 700 !important; color: #0c4a6e !important; line-height: 1 !important; }
.logo-subtitle { font-size: 10px !important; color: #64748b !important; letter-spacing: 1.5px !important; text-transform: uppercase !important; margin-top: 2px !important; }
.nav-links { display: flex !important; gap: 40px !important; align-items: center !important; flex: 1 !important; justify-content: center !important; list-style: none !important; }
.nav-links li { display: inline !important; }
.nav-links a { color: #0c4a6e !important; text-decoration: none !important; font-weight: 600 !important; font-size: 14px !important; transition: color 0.3s !important; text-transform: uppercase; }
.nav-links a:hover { color: #38bdf8 !important; }
.lang-dropdown { position: relative; margin-left: 20px; }
.lang-dropdown-btn { background: transparent; border: 1px solid #cbd5e1; color: #0c4a6e; padding: 8px 15px; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; }
.lang-dropdown-content { display: none; position: absolute; right: 0; top: 100%; margin-top: 5px; background: white; min-width: 150px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; z-index: 1000; }
.lang-dropdown-content a { color: #475569; padding: 12px 16px; text-decoration: none; display: block; font-size: 14px; font-weight: 500; transition: background 0.2s; }
.lang-dropdown-content a:hover { background: #f8fafc; color: #38bdf8; }
.lang-dropdown.active .lang-dropdown-content { display: block; }
.menu-toggle { display: none !important; font-size: 24px !important; color: #0c4a6e !important; background: none !important; border: none !important; cursor: pointer !important; }
.breadcrumb { padding: 25px 40px; background: #f8fafc; margin-top: 61px; border-bottom: 1px solid #e2e8f0; }
.breadcrumb-container { max-width: 860px; margin: 0 auto; display: flex; align-items: center; gap: 10px; font-size: 13px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; flex-wrap: wrap; }
.breadcrumb a { color: #64748b; text-decoration: none; transition: color 0.3s; }
.breadcrumb a:hover { color: #38bdf8; }
.breadcrumb-separator { color: #cbd5e1; }
.breadcrumb-current { color: #0c4a6e; font-weight: 700; }
/* Hero */
.post-hero { position: relative; height: 55vh; min-height: 400px; overflow: hidden; display: flex; align-items: flex-end; }
.post-hero img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0; }
.post-hero::before { content:''; position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.8) 100%); z-index: 1; }
.post-hero-content { position: relative; z-index: 2; max-width: 860px; margin: 0 auto; padding: 50px 40px; width: 100%; color: white; }
.post-category { display: inline-block; background: #38bdf8; color: white; padding: 6px 16px; border-radius: 20px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px; }
.post-hero-content h1 { font-family: 'Playfair Display',serif; font-size: 46px; font-weight: 900; line-height: 1.2; text-shadow: 0 3px 20px rgba(0,0,0,0.5); margin-bottom: 20px; }
.post-meta { display: flex; gap: 24px; flex-wrap: wrap; font-size: 14px; color: rgba(255,255,255,0.8); }
.post-meta span { display: flex; align-items: center; gap: 6px; }
/* Article */
.post-wrapper { max-width: 860px; margin: 0 auto; padding: 60px 40px; }
.post-content { font-size: 17px; line-height: 1.85; color: #334155; }
.post-content h2 { font-family: 'Playfair Display',serif; font-size: 28px; font-weight: 800; color: #0f172a; margin: 48px 0 20px; padding-bottom: 12px; border-bottom: 2px solid #e2e8f0; }
.post-content h3 { font-size: 22px; font-weight: 700; color: #0f172a; margin: 36px 0 16px; }
.post-content p { margin-bottom: 24px; }
.post-content ul, .post-content ol { margin: 0 0 24px 28px; }
.post-content li { margin-bottom: 10px; }
.post-content img { width: 100%; border-radius: 12px; margin: 32px 0; }
.post-content blockquote { border-left: 4px solid #38bdf8; margin: 32px 0; padding: 20px 28px; background: #f0f9ff; border-radius: 0 12px 12px 0; font-style: italic; color: #0284c7; font-size: 18px; }
.post-content a { color: #0284c7; text-decoration: underline; }
/* Tags */
.post-tags { display: flex; flex-wrap: wrap; gap: 10px; margin: 48px 0 0; padding-top: 32px; border-top: 1px solid #e2e8f0; }
.post-tag { background: #f1f5f9; color: #475569; padding: 6px 16px; border-radius: 20px; font-size: 13px; font-weight: 600; text-decoration: none; transition: background 0.2s; }
.post-tag:hover { background: #e0f2fe; color: #0284c7; }
/* Share */
.share-bar { display: flex; align-items: center; gap: 12px; margin: 32px 0; padding: 20px 24px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; flex-wrap: wrap; }
.share-bar strong { font-size: 14px; color: #0f172a; margin-right: 4px; }
.share-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 700; text-decoration: none; transition: opacity 0.2s; color: white; }
.share-btn:hover { opacity: 0.85; }
.share-btn.twitter { background: #1da1f2; }
.share-btn.linkedin { background: #0a66c2; }
.share-btn.whatsapp { background: #25d366; }
/* FAQ */
.faq-section { margin: 60px 0 0; }
.faq-list { }
.faq-item { border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 12px; overflow: hidden; background: #fff; }
.faq-item.active { border-color: #38bdf8; }
.faq-question { font-size: 16px; font-weight: 700; color: #0f172a; margin: 0; padding: 20px 24px; background: #f8fafc; cursor: pointer; display: flex; justify-content: space-between; align-items: center; gap: 16px; user-select: none; }
.faq-question:hover { background: #f1f5f9; }
.faq-item.active .faq-question { background: #f0f9ff; color: #0284c7; }
.faq-question i { color: #94a3b8; font-size: 14px; flex-shrink: 0; transition: transform 0.35s; }
.faq-item.active .faq-question i { transform: rotate(180deg); color: #38bdf8; }
.faq-answer { max-height: 0; overflow: hidden; transition: max-height 0.4s ease, padding 0.4s; font-size: 15px; color: #475569; line-height: 1.8; padding: 0 24px; }
.faq-item.active .faq-answer { max-height: 600px; padding: 20px 24px; border-top: 1px solid #e0f2fe; }
/* Related tours */
.related-section { background: #f8fafc; padding: 60px 40px; border-top: 1px solid #e2e8f0; }
.related-inner { max-width: 1200px; margin: 0 auto; }
.related-inner h2 { font-family: 'Playfair Display',serif; font-size: 32px; font-weight: 800; color: #0f172a; margin-bottom: 32px; }
.related-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 24px; }
.related-card { background: white; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; text-decoration: none; transition: transform 0.3s, box-shadow 0.3s; display: block; }
.related-card:hover { transform: translateY(-4px); box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
.related-card img { width: 100%; height: 160px; object-fit: cover; display: block; }
.related-card-body { padding: 20px; }
.related-card-title { font-weight: 700; font-size: 16px; color: #0f172a; margin-bottom: 8px; }
.related-card-price { color: #38bdf8; font-weight: 800; font-size: 15px; }
/* Back link */
.back-link { display: inline-flex; align-items: center; gap: 8px; color: #64748b; text-decoration: none; font-weight: 600; font-size: 14px; padding: 0 0 40px; transition: color 0.2s; }
.back-link:hover { color: #0284c7; }
@media (max-width: 992px) {
    .nav-links { position: fixed !important; top: 0 !important; right: -100% !important; height: 100vh !important; width: 80% !important; max-width: 350px !important; background: white !important; flex-direction: column !important; padding: 100px 40px !important; transition: right 0.4s ease !important; align-items: flex-start !important; box-shadow: -5px 0 30px rgba(0,0,0,0.15) !important; z-index: 999 !important; }
    .nav-links.active { right: 0 !important; }
    .menu-toggle { display: block !important; }
    .related-grid { grid-template-columns: repeat(2,1fr); }
    .post-hero-content h1 { font-size: 36px; }
}
@media (max-width: 576px) {
    .post-wrapper { padding: 40px 20px; }
    .post-hero-content { padding: 30px 20px; }
    .post-hero-content h1 { font-size: 28px; }
    .related-grid { grid-template-columns: 1fr; }
    .related-section { padding: 40px 20px; }
    .breadcrumb { padding: 15px 20px; }
}
</style>
</head>
<body>

<nav id="navbar">
    <div class="nav-container">
        <a href="/" class="logo">
            <img src="/assets/walkabout_travel_logo.jpg" alt="WalkAbout Travel Logo" onerror="this.style.display='none'">
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
                <button class="lang-dropdown-btn">
                    <i class="fas fa-globe"></i>
                    <span><?=strtoupper($currentLang)?></span>
                    <i class="fas fa-chevron-down"></i>
                </button>
                <div class="lang-dropdown-content">
                    <?php foreach($hreflang as $lc=>$u): ?>
                    <a href="<?=htmlspecialchars($u)?>"><?=$LANG_NAMES[$lc]?></a>
                    <?php endforeach; ?>
                </div>
            </div>
            <button class="menu-toggle" id="menuToggle"><i class="fas fa-bars"></i></button>
        </div>
    </div>
</nav>

<div class="breadcrumb">
    <div class="breadcrumb-container">
        <a href="/"><?=$L['home']?></a>
        <span class="breadcrumb-separator">›</span>
        <a href="<?=SITE_URL.$LANG_PREFIXES[$currentLang]?>/blog/"><?=$L['blog']?></a>
        <span class="breadcrumb-separator">›</span>
        <span class="breadcrumb-current"><?=htmlspecialchars(mb_strimwidth($title,0,50,'…'))?></span>
    </div>
</div>

<div class="post-hero">
    <?php if($image): ?><img src="<?=htmlspecialchars($image)?>" alt="<?=htmlspecialchars($title)?>"><?php endif; ?>
    <div class="post-hero-content">
        <?php if($category): ?><span class="post-category"><?=htmlspecialchars($category)?></span><?php endif; ?>
        <h1><?=htmlspecialchars($title)?></h1>
        <div class="post-meta">
            <span><i class="far fa-user"></i> <?=$L['by']?> <?=htmlspecialchars($author)?></span>
            <span><i class="far fa-calendar-alt"></i> <?=$dateDisplay?></span>
            <?php if($readTime): ?><span><i class="far fa-clock"></i> <?=$readTime?> <?=$L['readTime']?></span><?php endif; ?>
        </div>
    </div>
</div>

<div class="post-wrapper" itemscope itemtype="https://schema.org/BlogPosting">
    <meta itemprop="headline" content="<?=htmlspecialchars($title)?>">
    <meta itemprop="datePublished" content="<?=htmlspecialchars($dateRaw)?>">
    <meta itemprop="author" content="<?=htmlspecialchars($author)?>">

    <a href="<?=SITE_URL.$LANG_PREFIXES[$currentLang]?>/blog/" class="back-link">
        <i class="fas fa-arrow-left"></i> <?=$L['backBlog']?>
    </a>

    <!-- Share bar -->
    <div class="share-bar">
        <strong><?=$L['share']?>:</strong>
        <a href="https://twitter.com/intent/tweet?url=<?=urlencode($canonicalUrl)?>&text=<?=urlencode($title)?>"
           target="_blank" rel="noopener" class="share-btn twitter">
            <i class="fab fa-x-twitter"></i> X
        </a>
        <a href="https://www.linkedin.com/sharing/share-offsite/?url=<?=urlencode($canonicalUrl)?>"
           target="_blank" rel="noopener" class="share-btn linkedin">
            <i class="fab fa-linkedin"></i> LinkedIn
        </a>
        <a href="https://wa.me/?text=<?=urlencode($title.' '.$canonicalUrl)?>"
           target="_blank" rel="noopener" class="share-btn whatsapp">
            <i class="fab fa-whatsapp"></i> <?=$L['whatsapp']?>
        </a>
    </div>

    <!-- İçerik -->
    <article class="post-content" itemprop="articleBody">
        <?= $content /* HTML içerik — admin'de zaten sanitize edilmiş olmalı */ ?>
    </article>

    <!-- Etiketler -->
    <?php if(!empty($tags)): ?>
    <div class="post-tags">
        <?php foreach($tags as $tag): ?>
        <a href="<?=SITE_URL.$LANG_PREFIXES[$currentLang]?>/blog/?tag=<?=urlencode($tag)?>"
           class="post-tag"># <?=htmlspecialchars($tag)?></a>
        <?php endforeach; ?>
    </div>
    <?php endif; ?>

    <!-- FAQ bölümü -->
    <?php if(!empty($faqItems)&&is_array($faqItems)): ?>
    <div class="faq-section" itemscope itemtype="https://schema.org/FAQPage">
        <h2 style="font-family:'Playfair Display',serif;font-size:28px;font-weight:800;color:#0f172a;margin:60px 0 24px;padding-bottom:12px;border-bottom:2px solid #e2e8f0;">
            <?=$L['faqTitle']?>
        </h2>
        <div class="faq-list">
            <?php foreach($faqItems as $fi=>$faq):
                if(empty($faq['q'])||empty($faq['a'])) continue; ?>
            <div class="faq-item<?=$fi===0?' active':''?>" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
                <h3 class="faq-question" itemprop="name" onclick="this.parentElement.classList.toggle('active')">
                    <span><?=htmlspecialchars($faq['q'])?></span>
                    <i class="fas fa-chevron-down"></i>
                </h3>
                <div class="faq-answer" itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
                    <div itemprop="text"><?=nl2br(htmlspecialchars($faq['a']))?></div>
                </div>
            </div>
            <?php endforeach; ?>
        </div>
    </div>
    <?php endif; ?>

</div><!-- /post-wrapper -->

<?php if(!empty($relatedTours)): ?>
<section class="related-section">
    <div class="related-inner">
        <h2><?=$L['relatedTitle']?></h2>
        <div class="related-grid">
            <?php foreach($relatedTours as $rt):
                $rtSlug  = tourSlug($rt, $currentLang);
                $rtTitle = $currentLang!=='tr' ? ($rt['title_'.$currentLang]??$rt['title_en']??$rt['title']??'') : ($rt['title']??'');
                $rtImg   = $rt['image'] ?? '';
                $rtPrice = $rt['price'] ?? '';
                $rtUrl   = SITE_URL.$LANG_PREFIXES[$currentLang].'/'.$rtSlug.'/';
            ?>
            <a href="<?=htmlspecialchars($rtUrl)?>" class="related-card">
                <?php if($rtImg): ?><img src="<?=htmlspecialchars($rtImg)?>" alt="<?=htmlspecialchars($rtTitle)?>" loading="lazy"><?php endif; ?>
                <div class="related-card-body">
                    <div class="related-card-title"><?=htmlspecialchars($rtTitle)?></div>
                    <?php if($rtPrice): ?><div class="related-card-price"><?=htmlspecialchars($rtPrice)?></div><?php endif; ?>
                </div>
            </a>
            <?php endforeach; ?>
        </div>
    </div>
</section>
<?php endif; ?>

<a href="https://wa.me/902125551923" class="whatsapp-float" target="_blank"><i class="fab fa-whatsapp"></i></a>

<script>
document.getElementById('menuToggle').addEventListener('click',e=>{e.stopPropagation();const l=document.getElementById('navLinks'),ic=document.getElementById('menuToggle').querySelector('i');l.classList.toggle('active');ic.classList.toggle('fa-bars');ic.classList.toggle('fa-times');});
document.addEventListener('click',e=>{if(e.target.closest('.lang-dropdown-btn')){e.target.closest('.lang-dropdown').classList.toggle('active');return;}document.querySelectorAll('.lang-dropdown.active').forEach(d=>d.classList.remove('active'));});
sessionStorage.setItem('language','<?=$currentLang?>');
</script>
<script src="/i18n.js" defer></script>
<script src="/app.js" defer></script>
</body>
</html>
