# WalkAbout Travel — Proje Notları

> **Yeni bir sohbete başlarken bu dosyayı ilk okut.**
> Söyleyeceğin cümle: *"PROJE-NOTLARI.md'yi oku, sonra şunu yapalım: …"*
>
> Son güncelleme: 20 Ağustos 2026

---

## 0. Bu proje nedir

Türkiye turu satan bir acentenin sitesi. **PHP + JSON**, veritabanı yok.
- `data/tours.json` → 75 tur · `data/blog-posts.json` → 44 blog yazısı
- 5 dil (tr, en, es, pt, ar) · toplam **605 sayfa**, 4 PHP dosyasından üretiliyor
- `admin.php` panelinden yönetiliyor (şifreli), panel JSON'lara yazıyor
- Sunucu: Natro, cPanel, PHP 8

---

## 1. ⛔ GERİ ALINMAMASI GEREKEN KARARLAR

Bunların hepsi bilinçli. "Eksik" görünüp geri eklenirse **hata geri gelir.**

### 1.1 `aggregateRating` / yıldız puanı YOK — eklemeyin
Verilerde `rating` alanı hiç yoktu ama kod her tur sayfasına uydurma
**"4.9 puan / 10 yorum"** basıyordu (415 sayfada). Bu Google'ın yorum
işaretleme politikasını ihlal eder, manuel işleme yol açabilir. Kaldırıldı.
→ **Gerçek yorum toplanana kadar geri eklenmeyecek.**
⚠ Eski `REHBER-ASAMA3.md` "TouristTrip'e puan ekle" diyor — **o dosya artık geçersiz.**

### 1.2 Dil tercihi hem `localStorage` hem `sessionStorage`'a yazılır
Eski bir performans önerisi (`CWV-REHBER.md` madde 3f) "sessionStorage'a geç"
demişti. Sonuç: ana sayfa `localStorage` okuyor, tur sayfası `sessionStorage`
yazıyordu → **dil sayfalar arası kayboluyordu.** Artık ikisine birden yazılıyor.
→ Tek birine indirmeyin.

### 1.3 SSS şeması duruyor ama zengin sonuç beklentisiyle değil
Google FAQ rich results'ı 2026'da kaldırdı. SSS içeriği **kullanıcı ve yapay zekâ
arama araçları için** değerli olduğundan duruyor. "FAQ schema ekleyelim, snippet
çıkar" gerekçesiyle iş planlamayın.

### 1.4 PHP'de kalınıyor, statik HTML'e geçilmiyor
605 sayfa 4 dosyadan yönetiliyor. Statik HTML = 615 dosya, telefon numarası
değişikliği = 615 dosya düzenleme, panel tamamen ölür.
Ölçüm: sayfa üretimi **2,6 ms** — statikleştirmenin kazancı ölçülemez düzeyde.

### 1.5 İletişim bilgisi SADECE `config.php`'de
Telefon, WhatsApp, e-posta, adres, sosyal medya. Daha önce 7 ayrı yerde,
ikisi birbirinden farklı yazıyordu (biri Arjantin, biri sahte `+90 212 555 1923`).
→ Şablona elle numara yazmayın, `CONTACT_*` sabitlerini kullanın.
→ **Arjantin numarası doğrudur** (müşteri teyit etti). Sahte 555'li numarayı geri getirmeyin.

### 1.6 Görseller `assets/img/` içinden, `srcset` ile
Her görselin 400/800/1600 sürümü var, `data/img-manifest.json` hangisinin
mevcut olduğunu tutuyor. `imgTag()` fonksiyonu kullanılır.
→ `assets/` kökündeki büyük orijinaller **kullanılmıyor** (147 MB). Sunucuya yüklenmez.
→ Yeni görsel eklenince 3 boyutu üretilip manifeste işlenmeli.

### 1.7 `save.php` ve panel oturum zorunlu, CORS kapalı
Eskiden ikisi de tamamen açıktı — adresi bilen herkes 75 turu silebiliyordu.
→ `Access-Control-Allow-Origin` geri eklenmeyecek.
→ `admin.html` doğrudan açılamaz, `admin.php` üzerinden servis edilir.

### 1.8 Mutlak yol kullanılır: `/style.css`, `/app.js`
Göreli yazılırsa (`style.css`) `/en/` sayfasında `/en/style.css` aranır ve
**CSS hiç yüklenmez.** Bu gerçekten yaşandı — 4 dilin tamamı stilsiz açılıyordu.

---

## 2. ⚠ TUZAKLAR — hata gibi görünüp hata olmayanlar

| Görünen | Gerçek |
|---|---|
| `.info-table`, `.faq-section`, `.social-links`, `.blog-empty`, `.post-tags` CSS'i kullanılmıyor | **Koşullu render.** `.info-table` 35 turda çıkıyor, `.social-links` config'e adres girilince. **Silmeyin.** |
| `not_included_en`, `notes_es`, `departureReturn_pt` alanları koda hiç geçmiyor | `getLangField()` anahtarı `$alan.'_'.$dil` diye **dinamik kuruyor.** Otomatik tarama göremez. **Silmeyin.** |
| Blog sayfalarında `<br />` var, PHP uyarısı mı? | Hayır — `nl2br()` çıktısı. İçerik düz metin, paragraflara böldüğümüz için normal. |
| `gelibolu-1600.webp` yok | Orijinal 1024px. Manifest `sizes:[400,800]` diyor, kod sadece mevcudu basıyor. Doğru. |
| Lightbox `<img>`inde `src` yok | Bilerek. Boş `src=""` tarayıcıyı sayfayı yeniden istetiyordu. JS açılışta atıyor. |
| 3 turda "Öne Çıkanlar" bölümü çıkmıyor | O 3 turda `highlights` boş. Doğru davranış. |
| `hero_background.mp4` yerelde 404 | 6 MB, test konteynerine indirilmedi. Sunucuda var. |

---

## 3. Nasıl çalıştırılır / test edilir

**Yerel önizleme:** `baslat-onizleme.bat` → `http://localhost:8000`
(PHP gerekir: windows.php.net/download → ZIP → `C:\php`)

**Sunucuya YÜKLENMEYECEKLER:** `router.php`, `baslat-onizleme.bat`,
`_YEDEK-ORIJINAL`, `_SILINECEK`, `assets/` kökündeki büyük orijinaller.

**Değişiklik sonrası mutlaka:**
1. `php -l` ile tüm PHP dosyaları
2. 605 sayfanın tamamını tara (HTTP 200 + PHP uyarısı + kırık görsel)
3. 390px'te mobil menü aç/kapa (4 sayfa tipi × 3 dil)
4. Yatay taşma kontrolü (`document.documentElement.scrollWidth <= 390`)
5. `/en/` sayfasında CSS yükleniyor mu

> Bunlar geçmişte gerçekten kırıldı. Sadece "sayfa açılıyor mu" yetmez.

---

## 4. Yapılacaklar

**Müşteri tarafı (bekliyor)**
- [ ] Siteyi Natro'ya yükle (önce cPanel'den yedek al)
- [ ] Panel şifresini değiştir — geçici: `walkabout2026`, `config.php` içinde
- [ ] `config.php` → `$SOCIAL` içine Instagram/Facebook adresleri
- [ ] 4 tur için gerçek fotoğraf: **Ağrı Dağı, Bursa, Doğu Karadeniz, Truva**
      (blog için de Bursa, Rize, Nemrut, Safranbolu fotoğrafı yok)
- [ ] Sunucudan sil: `Tours.js`, `Blog.js`, `style-v2.css`, `old-index.html`,
      `htaccess` (noktasız), `error_log`, `*.md` rehberler, eski yedek JSON'lar,
      `assets/` kökündeki ~147 MB orijinal

**Sıradaki iş (öncelik sırasıyla)**
1. **Google Analytics 4 + Search Console** — sitede hiç ölçüm aracı yok.
   Bundan sonraki her karar bu veri olmadan tahmin.
2. **Yasal sayfalar** — KVKK aydınlatma, çerez, gizlilik, mesafeli satış.
   `contact.php` artık kişisel veri topluyor (`data/leads.json`).
   Footer'a **TÜRSAB belge numarası** (sitede "TURSAB certified" yazıyor, numara yok).
3. **Tur açıklamaları** — ortanca **17 kelime**, 75/75 tur 100 kelimenin altında.
   Analitik gelince en çok bakılan 10 turu 800+ kelimeye çıkar.
4. **Destinasyon toplayıcı sayfaları** — İstanbul 25, Kapadokya 19, Pamukkale 16,
   Efes 14 tur var ama `/kapadokya-turlari/` gibi giriş sayfası yok.
5. **Blog** — son yazı 28.11.2025, ortanca 110 kelime. Az ve doyurucu yaz.
6. Panele "Gelen Talepler" sekmesi (`data/leads.json` şu an elle açılıyor)

---

## 5. ❓ Açık sorular — cevabı müşteride

1. **Hedef pazar çelişkisi.** `keyword-arastirma.md` "EN birincil · TR · AR" diyor.
   Ama site ES/PT'ye de tam çevrilmiş ve WhatsApp numarası **Arjantin**.
   Latin Amerika bilinçli bir hedef mi? Cevap, içerik yatırımının hangi dile
   gideceğini belirler. **Bu net değil.**
2. **Search Console kurulu mu?** Kodda doğrulama etiketi yok ama eski rehber
   "Search Console'da sıralanan sorguları bul" diyor. **Bu net değil.**
3. **Prens Adaları fiyatı** 55$ mı 60$ mı? (çift kayıtta iki farklı fiyat vardı,
   düşük olan bırakıldı)
4. **TÜRSAB belge numarası** kaç?

---

## 6. Geçmiş — kısa

- **Aşama 1–2:** kaydı yok, ne olduğu bilinmiyor
- **Aşama 3:** veri şeması + long-tail keyword araştırması (`REHBER-ASAMA3.md`, `keyword-arastirma.md`)
- **Aşama 4:** Core Web Vitals (`CWV-REHBER.md`)
- **18–19 Ağu 2026:** kapsamlı denetim → 51 bulgu + test sırasında 5 yeni hata; hepsi düzeltildi.
  Güvenlik (panel/save.php açıktı), sahte puan, yanlış alan adı, mobil menü,
  fotoğraf–tur eşleştirmesi, görsel boyutlandırma (117 MB → 2,5 MB), ölü kod temizliği.
- **20 Ağu 2026:** 75 tura 5 dilde SSS (2235 soru), 44 bloga fotoğraf,
  çeviri boşlukları kapatıldı, "Öne Çıkanlar" bölümü eklendi (402 madde
  veride duruyordu ama hiç basılmıyordu).

> ⚠ `REHBER-ASAMA3.md` ve `CWV-REHBER.md`'nin bazı tavsiyeleri artık **geçersiz**
> (bkz. bölüm 1.1 ve 1.2). Tarihsel kayıt olarak saklayın, uygulama rehberi olarak kullanmayın.
