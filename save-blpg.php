<?php
// Güvenlik: Sadece belirli bir şifre ile işlem yapılsın (Basit koruma)
$secret_key = "walkabout2025"; // Bunu admin panelinden göndereceğiz

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    // Şifre kontrolü
    if (!isset($_POST['key']) || $_POST['key'] !== $secret_key) {
        echo json_encode(['status' => 'error', 'message' => 'Yetkisiz erişim!']);
        exit;
    }

    // 1. Resmi Kaydet
    $imagePath = "";
    if (isset($_FILES['image']) && $_FILES['image']['error'] === 0) {
        $uploadDir = 'assets/';
        $fileName = 'blog-' . time() . '.webp'; // Benzersiz isim
        $targetFile = $uploadDir . $fileName;
        
        // Resmi yükle
        if (move_uploaded_file($_FILES['image']['tmp_name'], $targetFile)) {
            $imagePath = 'assets/' . $fileName;
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Resim yüklenemedi.']);
            exit;
        }
    }

    // 2. Mevcut JSON'u Oku
    $jsonFile = 'data/blog-posts.json';
    $currentData = file_exists($jsonFile) ? json_decode(file_get_contents($jsonFile), true) : [];

    // 3. Yeni Veriyi Hazırla
    $newPost = [
        'id' => 'blog-' . time(),
        'title' => $_POST['title'],
        'date' => date('d F Y'), // Güncel tarih
        'image' => $imagePath ? $imagePath : 'assets/default.jpg', // Resim yolu
        'summary' => $_POST['summary'],
        'content' => $_POST['content'],
        // Diğer alanlar buraya eklenebilir (kategori vs)
        'category' => $_POST['category']
    ];

    // Yeni yazıyı en başa ekle
    array_unshift($currentData, $newPost);

    // 4. Dosyayı Kaydet
    if (file_put_contents($jsonFile, json_encode($currentData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE))) {
        echo json_encode(['status' => 'success', 'message' => 'Blog yazısı başarıyla yayınlandı!']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Dosya yazılamadı.']);
    }

} else {
    echo json_encode(['status' => 'error', 'message' => 'Sadece POST isteği kabul edilir.']);
}
?>
