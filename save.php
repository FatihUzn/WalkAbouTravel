<?php
/* ============================================================
   save.php — Admin panelinden gelen kayıt isteklerini işler
   ⚠ Artık OTURUM ZORUNLU. Giriş yapılmadan kayıt yapılamaz.
   ============================================================ */
session_start();
require_once __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
// CORS başlığı kaldırıldı — panel aynı alan adında, dışarıdan istek kabul edilmez.

function out(array $d, int $code = 200): never {
    http_response_code($code);
    echo json_encode($d, JSON_UNESCAPED_UNICODE);
    exit;
}

// ─── 1. Yetki ────────────────────────────────────────────────
if (empty($_SESSION[ADMIN_SESSION_KEY])) {
    out(['success' => false, 'error' => 'Oturum bulunamadı. Lütfen tekrar giriş yapın.', 'relogin' => true], 401);
}

// ─── 2. Yöntem ───────────────────────────────────────────────
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    out(['success' => false, 'error' => 'Sadece POST istekleri kabul edilir.'], 405);
}

// ─── 3. CSRF (aynı köken kontrolü) ───────────────────────────
$origin = $_SERVER['HTTP_ORIGIN'] ?? ($_SERVER['HTTP_REFERER'] ?? '');
if ($origin !== '') {
    $oh = parse_url($origin, PHP_URL_HOST);
    if ($oh && !in_array($oh, $GLOBALS['ALLOWED_HOSTS'], true)
            && !in_array($oh . ':' . (parse_url($origin, PHP_URL_PORT) ?: ''), $GLOBALS['ALLOWED_HOSTS'], true)) {
        out(['success' => false, 'error' => 'Geçersiz istek kaynağı.'], 403);
    }
}

// ─── 4. Gövde ────────────────────────────────────────────────
$input = file_get_contents('php://input');
if (strlen($input) > 20 * 1024 * 1024) out(['success'=>false,'error'=>'İstek çok büyük.'], 413);

$data = json_decode($input, true);
if (!is_array($data) || !isset($data['file'], $data['data'])) {
    out(['success' => false, 'error' => 'Geçersiz istek formatı.'], 400);
}
if (!is_array($data['data'])) {
    out(['success' => false, 'error' => 'Veri bir dizi olmalı.'], 400);
}

// ─── 5. Hedef dosya (beyaz liste) ────────────────────────────
$allowed = [
    'tours' => 'tours',
    'blogs' => 'blog-posts',
];
$key = (string) $data['file'];
if (!isset($allowed[$key])) out(['success'=>false,'error'=>'İzin verilmeyen dosya: '.$key], 400);

$name     = $allowed[$key];
$filePath = __DIR__ . '/data/' . $name . '.json';
$dir      = dirname($filePath);
if (!is_dir($dir) && !@mkdir($dir, 0755, true)) {
    out(['success' => false, 'error' => 'data/ klasörü oluşturulamadı.'], 500);
}
if (file_exists($filePath) && !is_writable($filePath)) {
    out(['success' => false, 'error' => $key . ' dosyasına yazma izni yok (cPanel > chmod 644).'], 500);
}

// ─── 6. Boş kayıt koruması ───────────────────────────────────
// Dolu bir dosyanın üzerine boş dizi yazılmasını engeller (kaza/saldırı).
if (count($data['data']) === 0 && file_exists($filePath) && filesize($filePath) > 100) {
    out(['success' => false, 'error' => 'Boş liste kaydedilemez. Tüm kayıtları silmek istiyorsanız dosyayı elle düzenleyin.'], 400);
}

// ─── 7. Yedek al, sonra yaz ──────────────────────────────────
if (file_exists($filePath)) {
    @copy($filePath, $dir . '/' . $name . '.bak.json');
}
$json = json_encode($data['data'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
if ($json === false) out(['success'=>false,'error'=>'JSON oluşturulamadı: '.json_last_error_msg()], 500);

$bytes = file_put_contents($filePath, $json, LOCK_EX);
if ($bytes === false) out(['success'=>false,'error'=>'Dosya yazılamadı.'], 500);

// ─── 8. Önbelleği temizle (DOĞRU yol: cache/, data/ değil) ───
@unlink(__DIR__ . '/cache/' . $name . '.php');

out(['success' => true, 'file' => $key, 'count' => count($data['data']), 'bytes' => $bytes]);
