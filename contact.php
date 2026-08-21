<?php
/* ============================================================
   contact.php — İletişim formunu GERÇEKTEN işler
   · e-posta gönderir            (info@walkabouttravel.com.tr)
   · data/leads.json'a kaydeder  (mail gitmezse bile talep kaybolmaz)
   · JS kapalıyken de çalışır
   ============================================================ */
require_once __DIR__ . '/functions.php';

$lang = in_array($_POST['lang'] ?? '', array_keys($LANG_PREFIXES), true) ? $_POST['lang'] : 'tr';
$LP   = $LANG_PREFIXES[$lang];

$M = [
 'tr'=>['ok'=>'Mesajınız bize ulaştı. En kısa sürede dönüş yapacağız.',
        'err'=>'Mesaj gönderilemedi. Lütfen WhatsApp veya telefonla ulaşın.',
        'inv'=>'Lütfen zorunlu alanları eksiksiz doldurun.',
        'back'=>'Ana sayfaya dön','title'=>'İletişim'],
 'en'=>['ok'=>'Your message has been received. We will get back to you shortly.',
        'err'=>'Could not send your message. Please reach us on WhatsApp or by phone.',
        'inv'=>'Please fill in all required fields.',
        'back'=>'Back to home','title'=>'Contact'],
 'es'=>['ok'=>'Hemos recibido su mensaje. Le responderemos en breve.',
        'err'=>'No se pudo enviar el mensaje. Contáctenos por WhatsApp o teléfono.',
        'inv'=>'Por favor complete los campos obligatorios.',
        'back'=>'Volver al inicio','title'=>'Contacto'],
 'pt'=>['ok'=>'Recebemos a sua mensagem. Responderemos em breve.',
        'err'=>'Não foi possível enviar a mensagem. Contacte-nos por WhatsApp ou telefone.',
        'inv'=>'Preencha todos os campos obrigatórios.',
        'back'=>'Voltar ao início','title'=>'Contacto'],
 'ar'=>['ok'=>'تم استلام رسالتك. سنعود إليك قريباً.',
        'err'=>'تعذّر إرسال الرسالة. يرجى التواصل عبر واتساب أو الهاتف.',
        'inv'=>'يرجى ملء جميع الحقول المطلوبة.',
        'back'=>'العودة إلى الرئيسية','title'=>'اتصل بنا'],
];
$L = $M[$lang] ?? $M['tr'];

$durum = 'err';
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {

    // Spam tuzağı: bot bu gizli alanı doldurur, insan dolduramaz
    if (!empty($_POST['website'])) { $durum = 'ok'; goto ciktı; }

    $ad   = trim(mb_substr($_POST['name']    ?? '', 0, 120));
    $mail = trim(mb_substr($_POST['email']   ?? '', 0, 180));
    $tel  = trim(mb_substr($_POST['phone']   ?? '', 0, 40));
    $msj  = trim(mb_substr($_POST['message'] ?? '', 0, 4000));

    if ($ad === '' || $msj === '' || !filter_var($mail, FILTER_VALIDATE_EMAIL)) {
        $durum = 'inv'; goto ciktı;
    }
    // Başlık enjeksiyonu koruması
    $ad   = str_replace(["\r", "\n"], ' ', $ad);
    $mail = str_replace(["\r", "\n"], '', $mail);
    $tel  = str_replace(["\r", "\n"], ' ', $tel);

    $kayit = [
        'tarih' => date('c'),
        'dil'   => $lang,
        'ad'    => $ad, 'eposta' => $mail, 'telefon' => $tel, 'mesaj' => $msj,
        'ip'    => substr($_SERVER['REMOTE_ADDR'] ?? '', 0, 45),
    ];

    // 1) Her hâlükârda diske yaz — mail sunucusu çalışmasa bile talep kaybolmaz
    $f = __DIR__ . '/data/leads.json';
    $fh = @fopen($f, 'c+');
    if ($fh) {
        flock($fh, LOCK_EX);
        $mevcut = json_decode(stream_get_contents($fh) ?: '[]', true) ?: [];
        $mevcut[] = $kayit;
        ftruncate($fh, 0); rewind($fh);
        fwrite($fh, json_encode($mevcut, JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE));
        flock($fh, LOCK_UN); fclose($fh);
        $durum = 'ok';
    }

    // 2) E-posta gönder
    $konu  = 'Web sitesi iletişim formu — ' . $ad;
    $govde = "Yeni bir iletişim talebi geldi.\n\n"
           . "Ad Soyad : $ad\n"
           . "E-posta  : $mail\n"
           . "Telefon  : " . ($tel ?: '-') . "\n"
           . "Dil      : $lang\n"
           . "Tarih    : " . date('d.m.Y H:i') . "\n\n"
           . "Mesaj:\n$msj\n";
    $baslik = "From: " . SITE_NAME . " <noreply@" . PRIMARY_HOST . ">\r\n"
            . "Reply-To: $ad <$mail>\r\n"
            . "Content-Type: text/plain; charset=UTF-8\r\n";
    if (@mail(CONTACT_EMAIL, '=?UTF-8?B?' . base64_encode($konu) . '?=', $govde, $baslik)) {
        $durum = 'ok';
    }
}
ciktı:
$htmlDir = $lang === 'ar' ? ' dir="rtl"' : '';
?>
<!DOCTYPE html><html lang="<?=e($lang)?>"<?=$htmlDir?>><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title><?=e($L['title'])?> · <?=e(SITE_NAME)?></title>
<style>
body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;
 background:#f8fafc;font-family:system-ui,-apple-system,"Segoe UI",sans-serif;padding:24px}
.k{background:#fff;padding:40px 36px;border-radius:16px;max-width:460px;text-align:center;
 box-shadow:0 10px 40px rgba(0,0,0,.08);border:1px solid #f1f5f9}
.i{font-size:46px;line-height:1;margin-bottom:16px}
h1{font-size:19px;margin:0 0 10px;color:#0f172a}
p{margin:0 0 24px;color:#64748b;font-size:14.5px;line-height:1.6}
a.b{display:inline-block;background:#0c4a6e;color:#fff;padding:11px 22px;border-radius:9px;
 text-decoration:none;font-weight:600;font-size:14.5px}
a.w{display:block;margin-top:14px;color:#0284c7;text-decoration:none;font-size:13.5px}
</style></head><body>
<div class="k">
  <div class="i"><?= $durum==='ok' ? '✅' : ($durum==='inv' ? '⚠️' : '❌') ?></div>
  <h1><?=e(SITE_NAME)?></h1>
  <p><?=e($L[$durum])?></p>
  <a class="b" href="<?=$LP?>/"><?=e($L['back'])?></a>
  <?php if($durum!=='ok'): ?>
    <a class="w" href="<?=e(waLink())?>" target="_blank" rel="noopener">WhatsApp: <?=e(CONTACT_PHONE)?></a>
  <?php endif; ?>
</div>
</body></html>
