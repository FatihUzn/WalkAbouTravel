<?php
// ============================================================
//  save.php — WalkAbout Travel Admin Panel Kaydetme Scripti
//  Konum: web sitenizin kök dizininde (admin.html ile aynı yerde)
// ============================================================

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type, X-Admin-Token');

// ── Güvenlik: Gizli token kontrolü ──────────────────────────
// admin.html'de fetch isteğine headers: { 'X-Admin-Token': 'BURAYA_TOKEN_YAZ' } ekle
// Aşağıdaki token'ı değiştir ve admin.html'e aynısını yaz
define('ADMIN_TOKEN', 'WAT_2025_secret_change_me');

$receivedToken = $_SERVER['HTTP_X_ADMIN_TOKEN'] ?? '';
if ($receivedToken !== ADMIN_TOKEN) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Yetkisiz erişim.']);
    exit;
}

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

// Cache dosyasını sil — bir sonraki istekte yeniden oluşturulsun
$cacheFile = __DIR__ . '/data/' . $fileKey . '.cache.php';
if (file_exists($cacheFile)) {
    @unlink($cacheFile);
}

echo json_encode([
    'success' => true,
    'file'    => $fileKey,
    'count'   => count($data['data']),
    'bytes'   => $result,
]);
