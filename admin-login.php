<?php
session_start();
require_once __DIR__ . '/config.php';

$err = '';
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {
    // basit kaba kuvvet yavaşlatması
    $n = (int)($_SESSION['login_try'] ?? 0);
    if ($n > 5) { sleep(min($n, 8)); }
    if (password_verify($_POST['password'] ?? '', ADMIN_PASSWORD_HASH)) {
        session_regenerate_id(true);
        $_SESSION[ADMIN_SESSION_KEY] = true;
        $_SESSION['login_try'] = 0;
        header('Location: /admin.html'); exit;
    }
    $_SESSION['login_try'] = $n + 1;
    $err = 'Şifre hatalı.';
}
if (isset($_GET['logout'])) { session_destroy(); header('Location: /admin-login.php'); exit; }
?>
<!DOCTYPE html><html lang="tr"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>Yönetim Girişi · <?=SITE_NAME?></title>
<style>
*{box-sizing:border-box}
body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;
 background:#0c4a6e;font-family:system-ui,-apple-system,"Segoe UI",sans-serif;color:#0f172a}
.box{background:#fff;padding:40px 36px;border-radius:16px;width:100%;max-width:380px;
 box-shadow:0 20px 60px rgba(0,0,0,.3)}
h1{margin:0 0 6px;font-size:20px}
p.s{margin:0 0 26px;color:#64748b;font-size:13.5px}
label{display:block;font-size:12px;font-weight:700;letter-spacing:.6px;
 text-transform:uppercase;color:#64748b;margin-bottom:7px}
input{width:100%;padding:12px 14px;border:1px solid #cbd5e1;border-radius:9px;font-size:15px}
input:focus{outline:none;border-color:#0284c7;box-shadow:0 0 0 3px rgba(2,132,199,.15)}
button{width:100%;margin-top:18px;padding:12px;background:#0c4a6e;color:#fff;border:none;
 border-radius:9px;font-size:15px;font-weight:600;cursor:pointer}
button:hover{background:#075985}
.err{background:#fef2f2;border:1px solid #fecaca;color:#b91c1c;padding:10px 12px;
 border-radius:8px;font-size:13.5px;margin-bottom:16px}
</style></head><body>
<form class="box" method="post" autocomplete="off">
  <h1><?=SITE_NAME?></h1>
  <p class="s">Yönetim paneline devam etmek için şifrenizi girin.</p>
  <?php if($err): ?><div class="err"><?=htmlspecialchars($err)?></div><?php endif; ?>
  <label for="password">Şifre</label>
  <input id="password" name="password" type="password" required autofocus>
  <button type="submit">Giriş Yap</button>
</form>
</body></html>
