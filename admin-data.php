<?php
/* admin-data.php — Panel için veri okuma ucu.
   /data/ klasörü dışarıya kapatıldığı için panel JSON'ları buradan alır. */
session_start();
require_once __DIR__ . '/config.php';
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
if (empty($_SESSION[ADMIN_SESSION_KEY])) { http_response_code(401); echo '[]'; exit; }
$map = ['tours' => 'tours.json', 'blogs' => 'blog-posts.json', 'leads' => 'leads.json'];
$k = $_GET['f'] ?? '';
if (!isset($map[$k])) { http_response_code(400); echo '[]'; exit; }
$p = __DIR__ . '/data/' . $map[$k];
echo is_file($p) ? file_get_contents($p) : '[]';
