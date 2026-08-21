<?php
/* ============================================================
   functions.php — Tüm sayfaların ortak yardımcı fonksiyonları
   Daha önce her dosyada ayrı ayrı (ve birbirinden farklı)
   yazılmış olan mantık burada birleştirildi.
   ============================================================ */

require_once __DIR__ . '/config.php';

/* ─── Dil algılama ────────────────────────────────────────── */
function detectLang(): string {
    global $LANG_PREFIXES;
    $uri = rtrim(parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?? '/', '/');
    foreach (array_keys($LANG_PREFIXES) as $lc) {
        if ($lc === 'tr') continue;
        if (str_starts_with($uri, '/'.$lc.'/') || $uri === '/'.$lc) return $lc;
    }
    return 'tr';
}
function currentPath(): string {
    return rtrim(parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?? '/', '/');
}

/* ─── Slug ────────────────────────────────────────────────── */
function makeSlug(string $t): string {
    $tr = ['ş','ğ','ü','ö','ı','ç','Ş','Ğ','Ü','Ö','İ','Ç','â','î','û'];
    $en = ['s','g','u','o','i','c','s','g','u','o','i','c','a','i','u'];
    $t  = str_replace($tr, $en, $t);
    $t  = @iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $t) ?: $t;
    $t  = strtolower($t);
    $t  = preg_replace('/[^a-z0-9\s-]/', '', $t);
    return trim(preg_replace('/[\s-]+/', '-', trim($t)), '-');
}

/** Tur slug'ı — index.php ve tour.php artık AYNI mantığı kullanıyor. */
function tourSlug(array $tour, string $lang): string {
    if (!empty($tour['slug_'.$lang])) return $tour['slug_'.$lang];
    if (!empty($tour['slug']))        return $tour['slug'];
    $f = $lang === 'tr' ? 'title' : 'title_'.$lang;
    return makeSlug($tour[$f] ?? $tour['title_en'] ?? $tour['title'] ?? '');
}
function tourUrl(array $tour, string $lang): string {
    global $LANG_PREFIXES;
    $s = tourSlug($tour, $lang);
    return $s ? ($LANG_PREFIXES[$lang] ?? '') . '/' . $s . '/' : '';
}
function postSlug(array $post, string $lang): string {
    if (!empty($post['slug_'.$lang])) return $post['slug_'.$lang];
    if (!empty($post['slug']))        return $post['slug'];
    $f = $lang === 'tr' ? 'title' : 'title_'.$lang;
    return makeSlug($post[$f] ?? $post['title'] ?? '');
}
function postUrl(array $post, string $lang): string {
    global $LANG_PREFIXES;
    $s = postSlug($post, $lang);
    return $s ? ($LANG_PREFIXES[$lang] ?? '') . '/blog/' . $s . '/' : '';
}

/* ─── Çok dilli alan okuma ────────────────────────────────── */
function getLangField(array $obj, string $field, string $lang) {
    if (isset($obj[$field]) && is_array($obj[$field]) && !array_is_list($obj[$field]))
        return $obj[$field][$lang] ?? $obj[$field]['en'] ?? $obj[$field]['tr'] ?? '';
    if ($lang !== 'tr') {
        if (!empty($obj[$field.'_'.$lang])) return $obj[$field.'_'.$lang];
        if (!empty($obj[$field.'_en']))     return $obj[$field.'_en'];
    }
    return $obj[$field] ?? '';
}

/* ─── Veri yükleme (önbellekli) ───────────────────────────── */
function loadJsonCached(string $name): array {
    $json  = __DIR__ . '/data/' . $name . '.json';
    $cache = __DIR__ . '/cache/' . $name . '.php';
    if (!is_file($json)) return [];
    if (is_file($cache) && filemtime($cache) >= filemtime($json)) {
        $d = @include $cache;
        if (is_array($d)) return $d;
    }
    $d = json_decode(file_get_contents($json), true) ?? [];
    if (!is_dir(dirname($cache))) @mkdir(dirname($cache), 0755, true);
    @file_put_contents($cache, '<?php return ' . var_export($d, true) . ';', LOCK_EX);
    return $d;
}
function loadTours(): array { return loadJsonCached('tours'); }
function loadPosts(): array {
    $p = loadJsonCached('blog-posts');
    $p = array_values(array_filter($p, fn($x) => ($x['published'] ?? true) !== false));
    usort($p, fn($a,$b) => strcmp($b['date'] ?? '', $a['date'] ?? ''));  // artık ISO tarih
    return $p;
}

/* ─── GÖRSELLER — responsive srcset ───────────────────────── */
function imgManifest(): array {
    static $m = null;
    if ($m === null) {
        $f = __DIR__ . '/data/img-manifest.json';
        $m = is_file($f) ? (json_decode(file_get_contents($f), true) ?? []) : [];
    }
    return $m;
}
/**
 * Responsive <img> etiketi üretir.
 * $ref  : tours.json'daki görsel referansı (taban ad veya eski assets/... yolu)
 * $sizes: CSS sizes özniteliği
 * $opts : ['class','loading','fetchpriority','decoding','style','id']
 */
function imgTag(string $ref, string $alt, string $sizes = '100vw', array $opts = []): string {
    $a = imgAttrs($ref, $sizes);
    if (!$a) return '';
    $h = 'src="'.htmlspecialchars($a['src']).'"';
    if ($a['srcset']) $h .= ' srcset="'.htmlspecialchars($a['srcset']).'" sizes="'.htmlspecialchars($sizes).'"';
    $h .= ' alt="'.htmlspecialchars($alt).'"';
    if ($a['w']) $h .= ' width="'.$a['w'].'" height="'.$a['h'].'"';
    $h .= ' loading="'.($opts['loading'] ?? 'lazy').'" decoding="'.($opts['decoding'] ?? 'async').'"';
    if (!empty($opts['fetchpriority'])) $h .= ' fetchpriority="'.$opts['fetchpriority'].'"';
    if (!empty($opts['class'])) $h .= ' class="'.htmlspecialchars($opts['class']).'"';
    if (!empty($opts['style'])) $h .= ' style="'.htmlspecialchars($opts['style']).'"';
    if (!empty($opts['itemprop'])) $h .= ' itemprop="'.htmlspecialchars($opts['itemprop']).'"';
    return '<img ' . $h . '>';
}
/** imgTag'in ham verisi: ['src','srcset','w','h','full'] */
function imgAttrs(string $ref, string $sizes = '100vw'): ?array {
    if ($ref === '') return null;
    if (str_starts_with($ref, 'http')) return ['src'=>$ref,'srcset'=>'','w'=>0,'h'=>0,'full'=>$ref];
    $base = basename($ref);
    $base = preg_replace('/\.(webp|jpe?g|png|gif)$/i', '', $base);
    $man  = imgManifest();
    if (!isset($man[$base])) {                                 // manifestte yoksa eski yolu bozmadan kullan
        $p = '/' . ltrim($ref, '/');
        return ['src'=>$p,'srcset'=>'','w'=>0,'h'=>0,'full'=>$p];
    }
    $e = $man[$base];
    $ws = $e['sizes'];  sort($ws);
    $set = [];
    foreach ($ws as $w) $set[] = "/assets/img/{$base}-{$w}.webp {$w}w";
    $small  = $ws[0];
    $largest = end($ws);
    $ratio  = ($e['h'] && $e['w']) ? $e['h'] / $e['w'] : 0.625;
    return [
        'src'    => "/assets/img/{$base}-{$small}.webp",
        'srcset' => implode(', ', $set),
        'w'      => $small,
        'h'      => (int) round($small * $ratio),
        'full'   => "/assets/img/{$base}-{$largest}.webp",
    ];
}
function imgFull(string $ref): string { $a = imgAttrs($ref); return $a ? $a['full'] : ''; }
function imgAbs(string $ref): string {
    $u = imgFull($ref);
    return $u === '' ? '' : (str_starts_with($u,'http') ? $u : SITE_URL . $u);
}

/* ─── Fiyat ───────────────────────────────────────────────── */
/** Schema.org offers bloğu — fiyat sayısal değilse null döner (uydurma "0" basılmaz). */
function priceOffer(array $tour, string $url): ?array {
    if (!isset($tour['priceAmount']) || $tour['priceAmount'] === null) return null;
    return ['@type'=>'Offer',
            'price'=>(string)$tour['priceAmount'],
            'priceCurrency'=>$tour['priceCurrency'] ?? 'USD',
            'availability'=>'https://schema.org/InStock',
            'url'=>$url];
}

/* ─── Tarih ───────────────────────────────────────────────── */
function fmtDate(string $iso, string $lang): string {
    $ts = strtotime($iso);
    if (!$ts) return '';
    $ay = [
      'tr'=>['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'],
      'en'=>['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
      'es'=>['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'],
      'pt'=>['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],
      'ar'=>['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'],
    ];
    $m = $ay[$lang] ?? $ay['tr'];
    return date('d', $ts) . ' ' . $m[(int)date('n', $ts) - 1] . ' ' . date('Y', $ts);
}

/* ─── WhatsApp / e-posta bağlantıları ─────────────────────── */
function waLink(string $msg = ''): string {
    return 'https://wa.me/' . CONTACT_WHATSAPP . ($msg ? '?text=' . rawurlencode($msg) : '');
}
function mailLink(string $subject = '', string $body = ''): string {
    $q = [];
    if ($subject) $q[] = 'subject=' . rawurlencode($subject);
    if ($body)    $q[] = 'body=' . rawurlencode($body);
    return 'mailto:' . CONTACT_EMAIL . ($q ? '?' . implode('&', $q) : '');
}

/* ─── 404 ─────────────────────────────────────────────────── */
function send404(): void {
    http_response_code(404);
    $f = __DIR__ . '/404.html';
    if (is_file($f)) readfile($f);
    else echo '<h1>404</h1><a href="/">&larr; ' . SITE_NAME . '</a>';
    exit;
}

/* ─── Güvenli çıktı kısaltmaları ──────────────────────────── */
function e($s): string { return htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8'); }
function nl2p($s): string { return nl2br(htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8')); }
