<?php
session_start();
require_once __DIR__ . '/config.php';
if (empty($_SESSION[ADMIN_SESSION_KEY])) { header('Location: /admin-login.php'); exit; }
header('X-Robots-Tag: noindex, nofollow');
header('Cache-Control: no-store');
readfile(__DIR__ . '/admin.html');
