<?php
// ============================================================
//  sitemap.php — WalkAbout Travel Otomatik Sitemap
//  URL: /sitemap.xml  (.htaccess yönlendirir)
//  tours.json'daki tüm turları × 5 dili Google'a bildirir.
// ============================================================

define('SITE_URL', 'https://www.walkabouttravel.com'); // ← kendi domain'in

$LANG_PREFIXES = [
    'tr' => '',
    'en' => '/en',
    'es' => '/es',
    'ar' => '/ar',
    'pt' => '/pt',
];

function makeSlug(string $text): string {
    $tr = ['ş','ğ','ü','ö','ı','ç','Ş','Ğ','Ü','Ö','İ','Ç'];
    $en = ['s','g','u','o','i','c','s','g','u','o','i','c'];
    $text = str_replace($tr, $en, $text);
    
    $text = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $text);
    
    $text = strtolower($text);
    $text = preg_replace('/[^a-zA-Z0-9\s-]/', '', $text);
    $text = preg_replace('/[\s-]+/', '-', trim($text));
    return $text;
}

function getTourSlug(array $tour, string $lang): string {
    if (!empty($tour['slug_' . $lang])) return $tour['slug_' . $lang];
    if (!empty($tour['slug']))          return $tour['slug'];
    $title = '';
    if (!empty($tour['title_' . $lang])) $title = $tour['title_' . $lang];
    elseif (!empty($tour['title']))       $title = $tour['title'];
    return makeSlug($title);
}

// --- tours.json oku ---
$toursFile = __DIR__ . '/data/tours.json';
$tours = file_exists($toursFile)
    ? (json_decode(file_get_contents($toursFile), true) ?? [])
    : [];

// --- Blog posts (varsa) ---
$blogsFile = __DIR__ . '/data/blog-posts.json';
$blogs = file_exists($blogsFile)
    ? (json_decode(file_get_contents($blogsFile), true) ?? [])
    : [];

// --- XML başlığı ---
header('Content-Type: application/xml; charset=utf-8');
echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">

    <!-- ===== ANA SAYFA — 5 dil ===== -->
<?php foreach ($LANG_PREFIXES as $lang => $prefix): ?>
    <url>
        <loc><?= SITE_URL . $prefix . '/' ?></loc>
        <xhtml:link rel="alternate" hreflang="<?= $lang ?>"
                    href="<?= SITE_URL . $prefix . '/' ?>"/>
        <changefreq>weekly</changefreq>
        <priority>1.0</priority>
    </url>
<?php endforeach; ?>

    <!-- ===== TURLAR — her tur × 5 dil ===== -->
<?php foreach ($tours as $tour):
    // Her dil için slug'ları önceden topla
    $slugs = [];
    foreach ($LANG_PREFIXES as $lang => $prefix) {
        $slugs[$lang] = getTourSlug($tour, $lang);
    }

    foreach ($LANG_PREFIXES as $lang => $prefix):
        $slug = $slugs[$lang];
        if (empty($slug)) continue;
        $url = SITE_URL . $prefix . '/' . $slug . '/';
?>
    <url>
        <loc><?= htmlspecialchars($url) ?></loc>
        <!-- Alternatif dil versiyonları -->
<?php foreach ($LANG_PREFIXES as $altLang => $altPrefix):
    $altSlug = $slugs[$altLang];
    if (empty($altSlug)) continue;
    $altUrl = SITE_URL . $altPrefix . '/' . $altSlug . '/';
?>
        <xhtml:link rel="alternate" hreflang="<?= $altLang ?>"
                    href="<?= htmlspecialchars($altUrl) ?>"/>
<?php endforeach; ?>
        <xhtml:link rel="alternate" hreflang="x-default"
                    href="<?= htmlspecialchars(SITE_URL . '/en/' . $slugs['en'] . '/') ?>"/>
        <changefreq>monthly</changefreq>
        <priority><?= $lang === 'tr' || $lang === 'en' ? '0.9' : '0.7' ?></priority>
    </url>
<?php endforeach; ?>
<?php endforeach; ?>

<?php if (!empty($blogs)): ?>
    <!-- ===== BLOG YAZILARI — her yazı × 5 dil ===== -->
<?php foreach ($blogs as $blog):
    $blogSlug = $blog['slug'] ?? makeSlug($blog['title'] ?? '');
    if (empty($blogSlug)) continue;

    foreach ($LANG_PREFIXES as $lang => $prefix):
        $blogUrl = SITE_URL . $prefix . '/blog/' . $blogSlug . '/';
?>
    <url>
        <loc><?= htmlspecialchars($blogUrl) ?></loc>
<?php foreach ($LANG_PREFIXES as $altLang => $altPrefix):
    $altBlogUrl = SITE_URL . $altPrefix . '/blog/' . $blogSlug . '/';
?>
        <xhtml:link rel="alternate" hreflang="<?= $altLang ?>"
                    href="<?= htmlspecialchars($altBlogUrl) ?>"/>
<?php endforeach; ?>
        <xhtml:link rel="alternate" hreflang="x-default"
                    href="<?= htmlspecialchars(SITE_URL . '/en/blog/' . $blogSlug . '/') ?>"/>
        <changefreq>monthly</changefreq>
        <priority><?= $lang === 'tr' || $lang === 'en' ? '0.7' : '0.5' ?></priority>
    </url>
<?php endforeach; ?>
<?php endforeach; ?>
<?php endif; ?>

</urlset>