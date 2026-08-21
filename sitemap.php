<?php
/* ============================================================
   sitemap.php — /sitemap.xml
   Turlar × 5 dil + blog × 5 dil + ana sayfalar
   ============================================================ */
require_once __DIR__ . '/functions.php';

$tours = loadTours();
$posts = loadPosts();

header('Content-Type: application/xml; charset=utf-8');
echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";

/** Bir URL bloğu yazar; alternatifler karşılıklı (reciprocal) listelenir. */
function urlBlok(array $alt, string $self, string $lang, string $freq, string $pri, string $lastmod = ''): void {
    echo "  <url>\n";
    echo "    <loc>" . htmlspecialchars($self) . "</loc>\n";
    if ($lastmod) echo "    <lastmod>" . htmlspecialchars($lastmod) . "</lastmod>\n";
    foreach ($alt as $lc => $u)
        echo '    <xhtml:link rel="alternate" hreflang="' . $lc . '" href="' . htmlspecialchars($u) . "\"/>\n";
    if (isset($alt['en']))
        echo '    <xhtml:link rel="alternate" hreflang="x-default" href="' . htmlspecialchars($alt['en']) . "\"/>\n";
    echo "    <changefreq>$freq</changefreq>\n    <priority>$pri</priority>\n  </url>\n";
}
?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
<?php
$bugun = date('Y-m-d');

/* ── ANA SAYFALAR ── */
$anaAlt = [];
foreach ($LANG_PREFIXES as $lc => $p) $anaAlt[$lc] = SITE_URL . $p . '/';
foreach ($anaAlt as $lc => $u) urlBlok($anaAlt, $u, $lc, 'weekly', '1.0', $bugun);

/* ── BLOG LİSTESİ ── */
$blogAlt = [];
foreach ($LANG_PREFIXES as $lc => $p) $blogAlt[$lc] = SITE_URL . $p . '/blog/';
$sonYazi = $posts[0]['date'] ?? $bugun;
foreach ($blogAlt as $lc => $u) urlBlok($blogAlt, $u, $lc, 'weekly', '0.8', $sonYazi);

/* ── TURLAR ── */
foreach ($tours as $t) {
    $alt = [];
    foreach ($LANG_PREFIXES as $lc => $p) {
        $s = tourSlug($t, $lc);
        if ($s !== '') $alt[$lc] = SITE_URL . $p . '/' . $s . '/';
    }
    foreach ($alt as $lc => $u)
        urlBlok($alt, $u, $lc, 'monthly', in_array($lc, ['tr','en'], true) ? '0.9' : '0.7');
}

/* ── BLOG YAZILARI ── */
foreach ($posts as $b) {
    $alt = [];
    foreach ($LANG_PREFIXES as $lc => $p) {
        $s = postSlug($b, $lc);
        if ($s !== '') $alt[$lc] = SITE_URL . $p . '/blog/' . $s . '/';
    }
    $lm = !empty($b['date']) ? date('Y-m-d', strtotime($b['date'])) : '';
    foreach ($alt as $lc => $u)
        urlBlok($alt, $u, $lc, 'monthly', in_array($lc, ['tr','en'], true) ? '0.7' : '0.5', $lm);
}
?>
</urlset>
