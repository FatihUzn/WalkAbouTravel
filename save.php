<?php
// ============================================================
//  save.php — WalkAbout Travel Admin Panel Kaydetme Scripti
//  Konum: web sitenizin kök dizininde (admin.html ile aynı yerde)
// ============================================================

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://www.walkabouttravel.com');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Sadece POST isteği kabul et
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Sadece POST istekleri kabul edilir.']);
    exit;
}

// İsteği oku
$input = file_get_contents('php://input');
$data  = json_decode($input, true);

if (!$data || !isset($data['file']) || !isset($data['data'])) {
    echo json_encode(['success' => false, 'error' => 'Geçersiz istek formatı.']);
    exit;
}

// Hangi dosyaya yazılacak?
$allowed = [
    'tours' => __DIR__ . '/data/tours.json',
    'blogs' => __DIR__ . '/data/blog-posts.json',
];

$fileKey = $data['file'];

if (!array_key_exists($fileKey, $allowed)) {
    echo json_encode(['success' => false, 'error' => 'İzin verilmeyen dosya: ' . $fileKey]);
    exit;
}

$filePath = $allowed[$fileKey];

// data/ klasörü yoksa oluştur
$dir = dirname($filePath);
if (!is_dir($dir)) {
    if (!mkdir($dir, 0755, true)) {
        echo json_encode(['success' => false, 'error' => 'data/ klasörü oluşturulamadı.']);
        exit;
    }
}

// Yazma izni var mı?
if (file_exists($filePath) && !is_writable($filePath)) {
    echo json_encode(['success' => false, 'error' => $fileKey . ' dosyasına yazma izni yok. cPanel\'den chmod 644 yapın.']);
    exit;
}

// JSON olarak kaydet
// --- Turlar kaydediliyorsa slug'ları otomatik üret ---
if ($fileKey === 'tours' && is_array($data['data'])) {
    $langs = ['tr', 'en', 'es', 'ar', 'pt'];

    foreach ($data['data'] as &$tour) {
        foreach ($langs as $lang) {
            $slugKey = 'slug_' . $lang;

            // Slug zaten varsa dokunma
            if (!empty($tour[$slugKey])) continue;

            // title_en, title_es... veya base title (TR) kullan
            $titleKey = $lang === 'tr' ? 'title' : 'title_' . $lang;
            $title = !empty($tour[$titleKey]) ? $tour[$titleKey]
                   : (!empty($tour['title_en']) ? $tour['title_en']
                   : ($tour['title'] ?? ''));

            if (!empty($title)) {
                $tour[$slugKey] = slugify($title);
            }
        }
    }
    unset($tour);
}

function slugify(string $text): string {
    $tr = ['ş','ğ','ü','ö','ı','ç','Ş','Ğ','Ü','Ö','İ','Ç'];
    $en = ['s','g','u','o','i','c','s','g','u','o','i','c'];
    $text = str_replace($tr, $en, $text);
    $text = strtolower($text);
    $text = preg_replace('/[^a-z0-9\s-]/', '', $text);
    $text = preg_replace('/[\s-]+/', '-', trim($text));
    return $text;
}

$json = json_encode($data['data'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

if ($json === false) {
    echo json_encode(['success' => false, 'error' => 'JSON oluşturulamadı.']);
    exit;
}

$result = file_put_contents($filePath, $json, LOCK_EX);

if ($result === false) {
    echo json_encode(['success' => false, 'error' => 'Dosya yazılamadı.']);
    exit;
}

echo json_encode([
    'success' => true,
    'file'    => $fileKey,
    'count'   => count($data['data']),
    'bytes'   => $result,
]);
