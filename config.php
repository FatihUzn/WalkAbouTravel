<?php
/* ============================================================
   config.php — WalkAbout Travel merkezi ayarlar
   Telefon, e-posta, adres gibi bilgiler SADECE burada durur.
   Değiştirmek istediğinizde tek dosyaya dokunmanız yeterli.
   ============================================================ */

// ─── KİMLİK ──────────────────────────────────────────────────
define('SITE_NAME',   'WalkAbout Travel');
define('SITE_TAGLINE','Tourism & Travel');
define('FOUNDED_YEAR', 1997);

// ─── İLETİŞİM (tek doğru kaynak) ─────────────────────────────
define('CONTACT_PHONE',      '+54 9 11 3587-0045');  // ekranda görünen
define('CONTACT_PHONE_LINK', '+5491135870045');      // tel: bağlantısı
define('CONTACT_WHATSAPP',   '5491135870045');       // wa.me/ numarası
define('CONTACT_EMAIL',      'info@walkabouttravel.com.tr');
define('CONTACT_ADDRESS_1',  'Kadırga Limanı Cd. 138A');
define('CONTACT_ADDRESS_2',  '34122 Fatih, İstanbul / Türkiye');
define('CONTACT_MAPS',       'https://www.google.com/maps/dir/?api=1&destination=Kad%C4%B1rga+Liman%C4%B1+Cd.+138A%2C+34122+%C4%B0stanbul%2C+Fatih%2C+T%C3%BCrkiye');

// ─── SOSYAL MEDYA (boş bırakılanlar sitede hiç gösterilmez) ──
$SOCIAL = [
    'instagram' => '',   // örn: https://instagram.com/walkabouttravel
    'facebook'  => '',
    'twitter'   => '',
    'linkedin'  => '',
];

// ─── ALAN ADI ────────────────────────────────────────────────
define('PRIMARY_HOST', 'walkabouttravel.com.tr');
$ALLOWED_HOSTS = ['walkabouttravel.com.tr', 'www.walkabouttravel.com.tr',
                  'localhost', '127.0.0.1', 'localhost:8080', '127.0.0.1:8080'];

$_h = $_SERVER['HTTP_HOST'] ?? PRIMARY_HOST;
if (!in_array($_h, $ALLOWED_HOSTS, true)) $_h = PRIMARY_HOST;   // Host header injection koruması
$_isLocal  = str_starts_with($_h, 'localhost') || str_starts_with($_h, '127.0.0.1');
$_protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : ($_isLocal ? 'http' : 'https');
define('SITE_URL', $_protocol . '://' . $_h);

// ─── DİLLER ──────────────────────────────────────────────────
$LANG_PREFIXES = ['tr'=>'', 'en'=>'/en', 'es'=>'/es', 'ar'=>'/ar', 'pt'=>'/pt'];
$LANG_NAMES    = ['tr'=>'Türkçe', 'en'=>'English', 'es'=>'Español', 'ar'=>'العربية', 'pt'=>'Português'];
$LANG_LOCALES  = ['tr'=>'tr_TR', 'en'=>'en_US', 'es'=>'es_ES', 'ar'=>'ar_SA', 'pt'=>'pt_PT'];

// ─── YÖNETİM PANELİ ──────────────────────────────────────────
// Panele giriş şifresi. Aşağıdaki hash'i kendi şifrenizle değiştirin:
//   php -r "echo password_hash('YENİ_ŞİFRENİZ', PASSWORD_DEFAULT);"
// Varsayılan şifre: walkabout2026  (İLK İŞ OLARAK DEĞİŞTİRİN)
define('ADMIN_PASSWORD_HASH', '$2y$12$Ik053kMDhs7TBjqVCXS8L.dzv5pd4b6GhxBwN67UFcsTGpJn8sAcG');
define('ADMIN_SESSION_KEY', 'wat_admin_ok');
