<?php
// GÜVENLİK ANAHTARI (Admin panelindeki JS koduyla aynı olmalı)
$secret_key = "walkabout2025"; 

header('Content-Type: application/json; charset=utf-8');

// Sadece POST isteği kabul et
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['status' => 'error', 'message' => 'Hatalı istek türü.']);
    exit;
}

// Güvenlik kontrolü
if (!isset($_POST['key']) || $_POST['key'] !== $secret_key) {
    echo json_encode(['status' => 'error', 'message' => 'Yetkisiz erişim! Anahtar hatalı.']);
    exit;
}

try {
    // 1. RESİM YÜKLEME İŞLEMİ
    $imagePath = 'assets/default-blog.jpg'; // Varsayılan resim
    
    if (isset($_FILES['image']) && $_FILES['image']['error'] === 0) {
        $uploadDir = 'assets/';
        
        // Klasör yoksa oluştur (Garanti olsun)
        if (!file_exists($uploadDir)) { mkdir($uploadDir, 0755, true); }
        
        // Benzersiz isim oluştur (Çakışmayı önler)
        $fileExtension = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
        $fileName = 'blog-' . time() . '.' . $fileExtension;
        $targetFile = $uploadDir . $fileName;
        
        if (move_uploaded_file($_FILES['image']['tmp_name'], $targetFile)) {
            $imagePath = $targetFile;
        } else {
            throw new Exception("Resim yüklenirken sunucu hatası oluştu.");
        }
    }

    // 2. JSON DOSYASINI GÜNCELLEME
    $jsonFile = 'data/blog-posts.json';
    
    // Mevcut veriyi oku
    $currentData = file_exists($jsonFile) ? json_decode(file_get_contents($jsonFile), true) : [];
    if (!is_array($currentData)) $currentData = [];

    // Tarih formatı (Türkçe)
    setlocale(LC_TIME, 'tr_TR.UTF-8');
    $dateStr = strftime('%d %B %Y'); // Örn: 10 Aralık 2025

    // Yeni veri objesi
    $newPost = [
        'id' => 'blog-' . time(),
        'title' => $_POST['title'] ?? 'Başlıksız',
        'date' => $dateStr,
        'image' => $imagePath,
        'summary' => $_POST['summary'] ?? '',
        'category' => $_POST['category'] ?? 'Genel',
        'content' => $_POST['content'] ?? '',
        // Çoklu dil desteği için (Admin paneline input eklenirse burası açılabilir)
        'title_en' => $_POST['title'], 
        'description_en' => $_POST['summary'],
        'content_en' => $_POST['content']
    ];

    // Yeni yazıyı en başa ekle
    array_unshift($currentData, $newPost);

    // Dosyayı kaydet
    if (file_put_contents($jsonFile, json_encode($currentData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE))) {
        echo json_encode(['status' => 'success', 'message' => 'Yazı başarıyla yayınlandı!']);
    } else {
        throw new Exception("Veri dosyasına yazılamadı. Klasör izinlerini (777) kontrol edin.");
    }

} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
