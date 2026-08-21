<?php
/* ============================================================
   router.php — SADECE YEREL ÖNİZLEME İÇİN
   PHP'nin dahili sunucusu .htaccess okumaz. Bu dosya
   .htaccess'teki yönlendirme kurallarını taklit eder.
   ⚠ Bu dosyayı SUNUCUYA YÜKLEME. Sadece bilgisayarında çalışır.
   ============================================================ */
$u = rtrim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/');
$f = __DIR__ . $u;

// Gerçek dosya varsa (css, js, görsel) doğrudan sun
if ($u !== '' && is_file($f)) return false;

if ($u === '' || $u === '/index.php')                              { require 'index.php'; return; }
if (preg_match('#^/sitemap\.xml$#', $u))                           { require 'sitemap.php'; return; }
if (preg_match('#^/(en|es|ar|pt)$#', $u))                          { require 'index.php'; return; }
if (preg_match('#^(/(en|es|ar|pt))?/blog$#', $u))                  { require 'blog.php'; return; }
if (preg_match('#^(/(en|es|ar|pt))?/blog/[a-z0-9-]+$#', $u))       { require 'blog-post.php'; return; }
if (preg_match('#^/(en|es|pt|ar)/[^/]+$#', $u))                    { require 'tour.php'; return; }
if (preg_match('#^/(admin-login|admin|save|contact|admin-data)\.php$#', $u)) { require ltrim($u,'/'); return; }
if (preg_match('#^/[^/]+$#', $u))                                  { require 'tour.php'; return; }

http_response_code(404); readfile(__DIR__ . '/404.html');
