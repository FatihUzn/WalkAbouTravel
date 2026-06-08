<?php
// ============================================================
//  blog-post.php — WalkAbout Travel Blog Yazı Detay Sayfası
//  URL: /blog/{slug}/ (TR) | /en/blog/{slug}/ | /es/blog/{slug}/
//  .htaccess: RewriteRule ^blog/([^/]+)/?$ /blog-post.php [L]
//             RewriteRule ^(en|es|ar|pt)/blog/([^/]+)/?$ /blog-post.php [L]
// ============================================================

$_protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$_host     = $_SERVER['HTTP_HOST'] ?? 'localhost';
define('SITE_URL',  $_protocol . '://' . $_host);
define('SITE_NAME', 'WalkAbout Travel');

$LANG_PREFIXES = ['tr'=>'','en'=>'/en','es'=>'/es','ar'=>'/ar','pt'=>'/pt'];
$LANG_NAMES    = ['tr'=>'Türkçe','en'=>'English','es'=>'Español','ar'=>'العربية','pt'=>'Português'];

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

$post = null;
foreach ($allPosts as $p) {
    $ps = $p['slug'] ?? makeSlug($p['title'] ?? '');
    if ($ps === $slug) { $post = $p; break; }
}
if (!$post) { http_response_code(404); die('<h1>404 — Post not found</h1><a href="/blog/">← Blog</a>'); }
if (($post['published'] ?? true) === false) { http_response_code(404); die('<h1>404</h1>'); }

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

$faqKey   = $currentLang === 'tr' ? 'faq' : 'faq_'.$currentLang;
$faqItems = !empty($post[$faqKey]) ? $post[$faqKey]
          : (!empty($post['faq_en']) ? $post['faq_en']
          : ($post['faq'] ?? []));

$canonicalUrl = SITE_URL.$LANG_PREFIXES[$currentLang].'/blog/'.$slug.'/';
$hreflang     = [];
foreach ($LANG_PREFIXES as $lc=>$p2) $hreflang[$lc] = SITE_URL.$p2.'/blog/'.$slug.'/';
$imageAbs     = str_starts_with($image,'http') ? $image : SITE_URL.'/'.ltrim($image,'/');

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

$breadcrumbSchema = json_encode([
    '@context' => 'https://schema.org',
    '@type'    => 'BreadcrumbList',
    'itemListElement' => [
        ['@type'=>'ListItem','position'=>1,'name'=>'Home','item'=>SITE_URL.'/'],
        ['@type'=>'ListItem','position'=>2,'name'=>'Blog','item'=>SITE_URL.$LANG_PREFIXES[$currentLang].'/blog/'],
        ['@type'=>'ListItem','position'=>3,'name'=>$title,'item'=>$canonicalUrl],
    ]
], JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);

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
    'tr' => ['home'=>'Ana Sayfa','tours'=>'Turlar','blog'=>'Blog','backBlog'=>'Blog\'a Dön','by'=>'Yazan','readTime'=>'dk okuma','share'=>'Paylaş','relatedTitle'=>'İlgili Turlar','relatedLabel'=>'Seyahat Fırsatları','faqTitle'=>'Sıkça Sorulan Sorular','inquire'=>'Bilgi Al','whatsapp'=>'WhatsApp'],
    'en' => ['home'=>'Home','tours'=>'Tours','blog'=>'Blog','backBlog'=>'Back to Blog','by'=>'By','readTime'=>'min read','share'=>'Share','relatedTitle'=>'Related Tours','relatedLabel'=>'Travel Opportunities','faqTitle'=>'Frequently Asked Questions','inquire'=>'Inquire Now','whatsapp'=>'WhatsApp'],
    'es' => ['home'=>'Inicio','tours'=>'Tours','blog'=>'Blog','backBlog'=>'Volver al Blog','by'=>'Por','readTime'=>'min lectura','share'=>'Compartir','relatedTitle'=>'Tours Relacionados','relatedLabel'=>'Oportunidades de Viaje','faqTitle'=>'Preguntas Frecuentes','inquire'=>'Consultar','whatsapp'=>'WhatsApp'],
    'pt' => ['home'=>'Início','tours'=>'Passeios','blog'=>'Blog','backBlog'=>'Voltar ao Blog','by'=>'Por','readTime'=>'min leitura','share'=>'Compartilhar','relatedTitle'=>'Tours Relacionados','relatedLabel'=>'Oportunidades de Viagem','faqTitle'=>'Perguntas Frequentes','inquire'=>'Consultar','whatsapp'=>'WhatsApp'],
    'ar' => ['home'=>'الرئيسية','tours'=>'جولات','blog'=>'مدونة','backBlog'=>'العودة للمدونة','by'=>'بقلم','readTime'=>'دقيقة قراءة','share'=>'مشاركة','relatedTitle'=>'جولات ذات صلة','relatedLabel'=>'فرص السفر','faqTitle'=>'الأسئلة الشائعة','inquire'=>'استفسر الآن','whatsapp'=>'واتساب'],
];
$L       = $dict[$currentLang] ?? $dict['tr'];
$htmlDir = $currentLang === 'ar' ? ' dir="rtl"' : '';

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

// HTTP Early Hints
header('Link: </style.css>; rel=preload; as=style', false);
if ($image) header('Link: <'.htmlspecialchars($image).'>; rel=preload; as=image', false);
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

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="dns-prefetch" href="https://cdnjs.cloudflare.com">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;0,900;1,600;1,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">

<link rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      media="print" onload="this.media='all'">
<noscript>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</noscript>

<link rel="stylesheet" href="/style.css">

<style>
/* ─── RESET ─────────────────────────────────────────────── */
*,*::before,*::after { margin:0; padding:0; box-sizing:border-box; }
html { overflow-x:hidden; scroll-behavior:smooth; }
body { font-family:'Inter',sans-serif; background:#f8fafc; color:#1e293b; overflow-x:hidden; }

/* ─── OKUMA PROGRESS ─────────────────────────────────────── */
.reading-progress {
  position:fixed; top:0; left:0; z-index:2001;
  height:3px; width:0%;
  background:linear-gradient(90deg,#0c4a6e,#38bdf8);
  border-radius:0 2px 2px 0;
  transition:width 0.1s linear;
  pointer-events:none;
}

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
.lang-dropdown-btn { background:transparent; border:1px solid #e2e8f0; color:#475569; padding:7px 14px; border-radius:8px; font-weight:500; font-size:13px; cursor:pointer; display:flex; align-items:center; gap:7px; min-height:36px; transition:border-color 0.2s; touch-action:manipulation; }
.lang-dropdown-btn:hover { border-color:#94a3b8; }
.lang-dropdown-content { display:none; position:absolute; right:0; top:calc(100% + 8px); background:white; min-width:150px; box-shadow:0 8px 30px rgba(0,0,0,0.1); border-radius:12px; border:1px solid #f1f5f9; overflow:hidden; z-index:1000; }
.lang-dropdown-content a { color:#475569; padding:11px 16px; text-decoration:none; display:block; font-size:13px; font-weight:500; transition:background 0.15s; }
.lang-dropdown-content a:hover { background:#f8fafc; color:#0c4a6e; }
.lang-dropdown.active .lang-dropdown-content { display:block; }
.menu-toggle { display:none !important; font-size:22px !important; color:#475569 !important; background:none !important; border:none !important; cursor:pointer !important; min-width:44px !important; min-height:44px !important; touch-action:manipulation !important; }

/* ─── BREADCRUMB ─────────────────────────────────────────── */
.breadcrumb { padding:16px 48px; background:#fff; margin-top:64px; border-bottom:1px solid #f1f5f9; min-height:52px; }
.breadcrumb-container { max-width:1200px; margin:0 auto; display:flex; align-items:center; gap:8px; font-size:12px; font-weight:500; text-transform:uppercase; letter-spacing:0.7px; flex-wrap:wrap; }
.breadcrumb a { color:#94a3b8; text-decoration:none; transition:color 0.2s; }
.breadcrumb a:hover { color:#0c4a6e; }
.breadcrumb-separator { color:#e2e8f0; }
.breadcrumb-current { color:#475569; }

/* ─── HERO ───────────────────────────────────────────────── */
.post-hero {
  position:relative;
  height:72vh; min-height:520px; max-height:800px;
  overflow:hidden; display:flex; align-items:flex-end;
  background:#0c4a6e;
}
.post-hero-img {
  position:absolute; inset:0; width:100%; height:100%;
  object-fit:cover; z-index:0;
  transform-origin:center;
  animation:heroZoom 12s ease-out forwards;
}
@keyframes heroZoom {
  from { transform:scale(1.06); }
  to   { transform:scale(1); }
}
.post-hero::before {
  content:''; position:absolute; inset:0; z-index:1;
  background:linear-gradient(
    to bottom,
    rgba(0,0,0,0.0) 0%,
    rgba(0,0,0,0.08) 35%,
    rgba(0,0,0,0.72) 100%
  );
}
.post-hero-content {
  position:relative; z-index:2;
  width:100%; max-width:900px;
  margin:0 auto; padding:0 48px 64px;
  color:white;
  animation:heroFadeUp 0.8s ease-out 0.2s both;
}
@keyframes heroFadeUp {
  from { opacity:0; transform:translateY(20px); }
  to   { opacity:1; transform:translateY(0); }
}
.post-category-badge {
  display:inline-flex; align-items:center; gap:6px;
  background:rgba(56,189,248,0.88);
  backdrop-filter:blur(6px);
  color:white; padding:5px 14px; border-radius:4px;
  font-size:10px; font-weight:700;
  text-transform:uppercase; letter-spacing:1.8px;
  margin-bottom:18px;
}
.post-hero h1 {
  font-family:'Playfair Display',serif;
  font-size:54px; font-weight:900; line-height:1.15;
  text-shadow:0 2px 20px rgba(0,0,0,0.35);
  margin-bottom:24px;
  max-width:800px;
}
.post-meta-bar {
  display:flex; gap:0; flex-wrap:wrap;
  border-top:1px solid rgba(255,255,255,0.15);
  padding-top:20px;
}
.post-meta-item {
  display:flex; align-items:center; gap:7px;
  font-size:13px; color:rgba(255,255,255,0.72);
  padding-right:22px; margin-right:22px;
  border-right:1px solid rgba(255,255,255,0.12);
}
.post-meta-item:last-child { border-right:none; padding-right:0; margin-right:0; }
.post-meta-item i { font-size:12px; color:rgba(56,189,248,0.9); }

/* ─── ARTICLE LAYOUT ─────────────────────────────────────── */
.article-outer {
  background:#fff;
  padding:72px 48px 80px;
}
.article-inner {
  max-width:780px;
  margin:0 auto;
}

/* ─── BACK LINK ──────────────────────────────────────────── */
.back-link {
  display:inline-flex; align-items:center; gap:8px;
  color:#94a3b8; text-decoration:none;
  font-size:12px; font-weight:600;
  text-transform:uppercase; letter-spacing:0.8px;
  margin-bottom:40px;
  transition:color 0.2s;
  padding-bottom:40px;
  border-bottom:1px solid #f1f5f9;
  width:100%;
}
.back-link:hover { color:#0c4a6e; }
.back-link i { font-size:11px; }

/* ─── SHARE BAR ──────────────────────────────────────────── */
.share-bar {
  display:flex; align-items:center; gap:8px;
  margin-bottom:52px;
  padding:14px 18px;
  background:#f8fafc;
  border-radius:10px;
  border:1px solid #f1f5f9;
  flex-wrap:wrap;
}
.share-label {
  font-size:11px; font-weight:700;
  text-transform:uppercase; letter-spacing:1px;
  color:#94a3b8; margin-right:6px;
}
.share-btn {
  display:inline-flex; align-items:center; gap:5px;
  padding:7px 14px; border-radius:7px;
  font-size:12px; font-weight:600;
  text-decoration:none; color:white;
  letter-spacing:0.3px;
  transition:opacity 0.2s, transform 0.15s;
  touch-action:manipulation;
}
.share-btn:hover { opacity:0.85; transform:translateY(-1px); }
.share-btn.twitter  { background:#1da1f2; }
.share-btn.linkedin { background:#0a66c2; }
.share-btn.whatsapp { background:#25d366; }

/* ─── ARTICLE TYPOGRAPHY ─────────────────────────────────── */
.post-content {
  font-size:17.5px;
  line-height:1.95;
  color:#374151;
}
.post-content p { margin-bottom:28px; }

/* Drop cap — ilk paragrafın ilk harfi */
.post-content > p:first-of-type::first-letter {
  font-family:'Playfair Display',serif;
  font-size:4.2em; font-weight:900;
  float:left; line-height:0.82;
  padding:6px 10px 0 0;
  color:#0c4a6e;
}

.post-content h2 {
  font-family:'Playfair Display',serif;
  font-size:30px; font-weight:800;
  color:#0f172a;
  margin:60px 0 22px;
  padding-bottom:16px;
  border-bottom:1px solid #f1f5f9;
  line-height:1.3;
}
.post-content h3 {
  font-size:20px; font-weight:700;
  color:#1e293b;
  margin:44px 0 16px;
}
.post-content ul, .post-content ol {
  margin:0 0 28px 28px;
}
.post-content li { margin-bottom:10px; line-height:1.85; }
.post-content img {
  width:100%; border-radius:12px;
  margin:36px 0; display:block;
  box-shadow:0 8px 32px rgba(0,0,0,0.08);
}
.post-content blockquote {
  border-left:3px solid #38bdf8;
  margin:40px 0;
  padding:22px 30px;
  background:#f0f9ff;
  border-radius:0 12px 12px 0;
  font-style:italic;
  font-family:'Playfair Display',serif;
  color:#0369a1;
  font-size:20px; line-height:1.7;
}
.post-content blockquote::before {
  content:'\201C';
  font-size:3em; line-height:0;
  vertical-align:-0.4em;
  color:#bae6fd; margin-right:6px;
  font-style:normal;
}
.post-content a {
  color:#0284c7;
  text-decoration:underline;
  text-decoration-color:#bae6fd;
  transition:text-decoration-color 0.2s;
}
.post-content a:hover { text-decoration-color:#0284c7; }
.post-content strong { color:#1e293b; font-weight:700; }

/* ─── AUTHOR CARD ────────────────────────────────────────── */
.author-card {
  display:flex; align-items:center; gap:20px;
  margin-top:56px; padding:28px 32px;
  background:#f8fafc;
  border-radius:14px;
  border:1px solid #f1f5f9;
}
.author-avatar {
  width:56px; height:56px; border-radius:50%;
  background:linear-gradient(135deg,#0c4a6e,#38bdf8);
  display:flex; align-items:center; justify-content:center;
  flex-shrink:0; color:white; font-size:22px;
}
.author-meta { flex:1; min-width:0; }
.author-label {
  font-size:10px; font-weight:700;
  text-transform:uppercase; letter-spacing:1.2px;
  color:#94a3b8; margin-bottom:4px;
}
.author-name {
  font-family:'Playfair Display',serif;
  font-size:18px; font-weight:700; color:#0f172a; margin-bottom:2px;
}
.author-org { font-size:13px; color:#64748b; }

/* ─── TAGS ───────────────────────────────────────────────── */
.post-tags {
  display:flex; flex-wrap:wrap; gap:8px;
  margin-top:48px; padding-top:32px;
  border-top:1px solid #f1f5f9;
}
.post-tag {
  background:#f1f5f9; color:#475569;
  padding:7px 15px; border-radius:20px;
  font-size:12px; font-weight:600;
  text-decoration:none; letter-spacing:0.3px;
  transition:background 0.2s, color 0.2s;
}
.post-tag:hover { background:#e0f2fe; color:#0284c7; }

/* ─── FAQ ────────────────────────────────────────────────── */
.faq-section {
  margin-top:72px; padding-top:52px;
  border-top:1px solid #f1f5f9;
}
.faq-section-title {
  font-size:20px; font-family:'Playfair Display',serif;
  color:#0f172a; margin-bottom:28px; font-weight:700;
  padding-left:14px; border-left:3px solid #38bdf8;
}
.faq-item {
  border:1px solid #f1f5f9; border-radius:10px; margin-bottom:6px;
  overflow:hidden; background:#fff;
  box-shadow:0 1px 3px rgba(0,0,0,0.03);
  transition:border-color 0.2s; contain:layout;
}
.faq-item.active { border-color:#bae6fd; }
.faq-question {
  font-size:15px; font-weight:600; color:#334155; margin:0;
  padding:17px 22px; background:#fff; cursor:pointer;
  display:flex; justify-content:space-between; align-items:center; gap:16px;
  user-select:none; transition:background 0.15s;
  min-height:58px; touch-action:manipulation;
}
.faq-question:hover { background:#f8fafc; }
.faq-item.active .faq-question { background:#f0f9ff; color:#0284c7; }
.faq-question i { color:#cbd5e1; font-size:13px; flex-shrink:0; transition:transform 0.3s; }
.faq-item.active .faq-question i { transform:rotate(180deg); color:#38bdf8; }
.faq-answer {
  max-height:0; overflow:hidden;
  transition:max-height 0.4s ease, padding 0.3s;
  font-size:15px; color:#475569; line-height:1.85;
  padding:0 22px; background:#fff; contain:layout style;
}
.faq-item.active .faq-answer { max-height:600px; padding:20px 22px; border-top:1px solid #e0f2fe; }

/* ─── RELATED TOURS ──────────────────────────────────────── */
.related-section {
  background:#f8fafc;
  padding:80px 48px;
  border-top:1px solid #f1f5f9;
}
.related-inner { max-width:1200px; margin:0 auto; }
.related-eyebrow {
  font-size:11px; font-weight:700;
  text-transform:uppercase; letter-spacing:1.8px;
  color:#38bdf8; margin-bottom:8px;
}
.related-heading {
  font-family:'Playfair Display',serif;
  font-size:30px; font-weight:800; color:#0f172a;
  margin-bottom:36px; line-height:1.2;
}
.related-grid {
  display:grid; grid-template-columns:repeat(3,1fr); gap:24px;
}
.related-card {
  background:white; border-radius:14px; overflow:hidden;
  border:1px solid #f1f5f9;
  text-decoration:none; display:block;
  box-shadow:0 2px 8px rgba(0,0,0,0.04);
  transition:transform 0.2s, box-shadow 0.2s;
}
.related-card:hover { transform:translateY(-5px); box-shadow:0 16px 40px rgba(0,0,0,0.1); }
.related-card-img-wrap {
  overflow:hidden; aspect-ratio:16/10;
  background:#e2e8f0;
}
.related-card-img {
  width:100%; height:100%; object-fit:cover;
  display:block; transition:transform 0.45s;
}
.related-card:hover .related-card-img { transform:scale(1.06); }
.related-card-body { padding:20px 22px 22px; }
.related-card-title {
  font-weight:700; font-size:15px; color:#0f172a;
  margin-bottom:8px; line-height:1.4;
}
.related-card-price {
  font-size:14px; font-weight:800; color:#38bdf8;
}

/* ─── WHATSAPP FLOAT ─────────────────────────────────────── */
.whatsapp-float {
  position:fixed; bottom:28px; right:28px; z-index:999;
  background:#25d366; color:white; border-radius:50%;
  width:52px; height:52px;
  display:flex; align-items:center; justify-content:center;
  font-size:24px; box-shadow:0 4px 16px rgba(37,211,102,0.3);
  text-decoration:none; transition:transform 0.2s, background 0.2s;
  touch-action:manipulation;
}
.whatsapp-float:hover { transform:scale(1.08); background:#1da851; }

/* ─── RESPONSIVE ─────────────────────────────────────────── */
@media (max-width:1100px) {
  .related-grid { grid-template-columns:repeat(2,1fr); }
}
@media (max-width:992px) {
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
  .post-hero h1 { font-size:42px; }
}
@media (max-width:768px) {
  .post-hero { height:60vh; min-height:420px; }
  .post-hero-content { padding:0 24px 52px; }
  .post-hero h1 { font-size:34px; }
  .article-outer { padding:52px 24px 64px; }
  .related-section { padding:56px 24px; }
  .related-grid { grid-template-columns:1fr; }
  .breadcrumb { padding:14px 24px; }
  .nav-container { padding:0 24px !important; }
  .post-content { font-size:16.5px; }
  .post-content > p:first-of-type::first-letter { font-size:3.5em; }
}
@media (max-width:480px) {
  .post-hero h1 { font-size:28px; }
  .post-meta-bar { gap:12px; }
  .post-meta-item { padding-right:0; margin-right:0; border-right:none; }
  .author-card { flex-direction:column; text-align:center; }
  .share-bar { gap:6px; }
}
</style>
</head>
<body>

<!-- Okuma ilerleme çubuğu -->
<div class="reading-progress" id="readingProgress" role="progressbar" aria-hidden="true"></div>

<nav id="navbar">
  <div class="nav-container">
    <a href="/" class="logo">
      <img src="/assets/walkabout_travel_logo.jpg"
           alt="WalkAbout Travel Logo"
           width="38" height="38"
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
    <a href="<?=SITE_URL.$LANG_PREFIXES[$currentLang]?>/blog/"><?=$L['blog']?></a>
    <span class="breadcrumb-separator" aria-hidden="true">›</span>
    <span class="breadcrumb-current"><?=htmlspecialchars(mb_strimwidth($title,0,55,'…'))?></span>
  </div>
</div>

<!-- HERO -->
<div class="post-hero">
  <?php if($image): ?>
  <img class="post-hero-img"
       src="<?=htmlspecialchars($image)?>"
       alt="<?=htmlspecialchars($title)?>"
       fetchpriority="high"
       decoding="async">
  <?php endif; ?>
  <div class="post-hero-content">
    <?php if($category): ?>
    <div class="post-category-badge">
      <i class="fas fa-tag" aria-hidden="true"></i>
      <?=htmlspecialchars($category)?>
    </div>
    <?php endif; ?>
    <h1><?=htmlspecialchars($title)?></h1>
    <div class="post-meta-bar">
      <?php if($author): ?>
      <div class="post-meta-item">
        <i class="far fa-user" aria-hidden="true"></i>
        <span><?=$L['by']?> <?=htmlspecialchars($author)?></span>
      </div>
      <?php endif; ?>
      <?php if($dateDisplay): ?>
      <div class="post-meta-item">
        <i class="far fa-calendar-alt" aria-hidden="true"></i>
        <span><?=$dateDisplay?></span>
      </div>
      <?php endif; ?>
      <?php if($readTime): ?>
      <div class="post-meta-item">
        <i class="far fa-clock" aria-hidden="true"></i>
        <span><?=$readTime?> <?=$L['readTime']?></span>
      </div>
      <?php endif; ?>
    </div>
  </div>
</div>

<!-- MAKALE -->
<div class="article-outer">
  <div class="article-inner">

    <a href="<?=SITE_URL.$LANG_PREFIXES[$currentLang]?>/blog/" class="back-link">
      <i class="fas fa-arrow-left" aria-hidden="true"></i>
      <?=$L['backBlog']?>
    </a>

    <!-- Paylaş -->
    <div class="share-bar">
      <span class="share-label"><?=$L['share']?></span>
      <a href="https://twitter.com/intent/tweet?url=<?=urlencode($canonicalUrl)?>&text=<?=urlencode($title)?>"
         target="_blank" rel="noopener noreferrer" class="share-btn twitter">
        <i class="fab fa-x-twitter" aria-hidden="true"></i> X
      </a>
      <a href="https://www.linkedin.com/sharing/share-offsite/?url=<?=urlencode($canonicalUrl)?>"
         target="_blank" rel="noopener noreferrer" class="share-btn linkedin">
        <i class="fab fa-linkedin" aria-hidden="true"></i> LinkedIn
      </a>
      <a href="https://wa.me/?text=<?=urlencode($title.' '.$canonicalUrl)?>"
         target="_blank" rel="noopener noreferrer" class="share-btn whatsapp">
        <i class="fab fa-whatsapp" aria-hidden="true"></i> <?=$L['whatsapp']?>
      </a>
    </div>

    <!-- İçerik -->
    <article class="post-content"
             itemscope itemtype="https://schema.org/BlogPosting">
      <meta itemprop="headline" content="<?=htmlspecialchars($title)?>">
      <meta itemprop="datePublished" content="<?=htmlspecialchars($dateRaw)?>">
      <meta itemprop="author" content="<?=htmlspecialchars($author)?>">
      <div itemprop="articleBody">
        <?= $content ?>
      </div>
    </article>

    <!-- Yazar kartı -->
    <div class="author-card">
      <div class="author-avatar" aria-hidden="true">
        <i class="fas fa-pen-nib"></i>
      </div>
      <div class="author-meta">
        <div class="author-label"><?=$L['by']?></div>
        <div class="author-name"><?=htmlspecialchars($author)?></div>
        <div class="author-org"><?=SITE_NAME?></div>
      </div>
    </div>

    <!-- Etiketler -->
    <?php if(!empty($tags)): ?>
    <div class="post-tags">
      <?php foreach($tags as $tag): ?>
      <a href="<?=SITE_URL.$LANG_PREFIXES[$currentLang]?>/blog/?tag=<?=urlencode($tag)?>"
         class="post-tag"># <?=htmlspecialchars($tag)?></a>
      <?php endforeach; ?>
    </div>
    <?php endif; ?>

    <!-- FAQ -->
    <?php if(!empty($faqItems) && is_array($faqItems)): ?>
    <div class="faq-section" itemscope itemtype="https://schema.org/FAQPage">
      <h2 class="faq-section-title"><?=$L['faqTitle']?></h2>
      <?php foreach($faqItems as $fi=>$faq):
          if(empty($faq['q']) || empty($faq['a'])) continue; ?>
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
    <?php endif; ?>

  </div>
</div><!-- /article-outer -->

<!-- İlgili Turlar -->
<?php if(!empty($relatedTours)): ?>
<section class="related-section">
  <div class="related-inner">
    <div class="related-eyebrow"><?=$L['relatedLabel']?></div>
    <h2 class="related-heading"><?=$L['relatedTitle']?></h2>
    <div class="related-grid">
      <?php foreach($relatedTours as $rt):
          $rtSlug  = tourSlug($rt, $currentLang);
          $rtTitle = $currentLang!=='tr' ? ($rt['title_'.$currentLang]??$rt['title_en']??$rt['title']??'') : ($rt['title']??'');
          $rtImg   = $rt['image'] ?? '';
          $rtPrice = $rt['price'] ?? '';
          $rtUrl   = SITE_URL.$LANG_PREFIXES[$currentLang].'/'.$rtSlug.'/';
      ?>
      <a href="<?=htmlspecialchars($rtUrl)?>" class="related-card">
        <?php if($rtImg): ?>
        <div class="related-card-img-wrap">
          <img class="related-card-img"
               src="<?=htmlspecialchars($rtImg)?>"
               alt="<?=htmlspecialchars($rtTitle)?>"
               loading="lazy" decoding="async">
        </div>
        <?php endif; ?>
        <div class="related-card-body">
          <div class="related-card-title"><?=htmlspecialchars($rtTitle)?></div>
          <?php if($rtPrice): ?>
          <div class="related-card-price"><?=htmlspecialchars($rtPrice)?></div>
          <?php endif; ?>
        </div>
      </a>
      <?php endforeach; ?>
    </div>
  </div>
</section>
<?php endif; ?>

<a href="https://wa.me/902125551923"
   class="whatsapp-float"
   target="_blank" rel="noopener noreferrer"
   aria-label="WhatsApp ile iletişim">
  <i class="fab fa-whatsapp" aria-hidden="true"></i>
</a>

<script>
// ─── Okuma ilerleme çubuğu ────────────────────────────────
const progressBar = document.getElementById('readingProgress');
const article = document.querySelector('.article-outer');
if (progressBar && article) {
  window.addEventListener('scroll', () => {
    const artTop    = article.offsetTop;
    const artHeight = article.offsetHeight;
    const scrolled  = window.scrollY - artTop;
    const pct = Math.min(100, Math.max(0, (scrolled / artHeight) * 100));
    progressBar.style.width = pct + '%';
  }, { passive: true });
}

// ─── FAQ toggle ───────────────────────────────────────────
function toggleFaq(btn) {
  const item = btn.closest('.faq-item');
  requestAnimationFrame(() => {
    item.classList.toggle('active');
    btn.setAttribute('aria-expanded', item.classList.contains('active') ? 'true' : 'false');
  });
}
document.addEventListener('keydown', e => {
  if ((e.key === ' ' || e.key === 'Enter') && e.target.classList.contains('faq-question')) {
    e.preventDefault();
    toggleFaq(e.target);
  }
});

// ─── Nav mobile ───────────────────────────────────────────
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

// ─── Dil dropdown ─────────────────────────────────────────
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
