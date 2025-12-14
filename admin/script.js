/* ==========================================
   WALKABOUT TRAVEL - ADMIN PANEL SCRIPT
   ========================================== */

// Global değişkenler
let blogPosts = [];
let tours = [];
let currentBlogId = null;
let currentImageData = null;
let currentImageName = null;

/* ==========================================
   SAYFA YÜKLENİNCE
   ========================================== */
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Admin panel başlatılıyor...');
    
    loadAllData();
    setupEventListeners();
    updateStats();
    renderBlogList();
});

/* ==========================================
   VERİ YÜKLEME
   ========================================== */
function loadAllData() {
    // LocalStorage'dan yükle
    const savedBlogs = localStorage.getItem('walkabout_blog_posts');
    const savedTours = localStorage.getItem('walkabout_tours');
    
    if (savedBlogs) {
        try {
            blogPosts = JSON.parse(savedBlogs);
            console.log(`✅ ${blogPosts.length} blog yazısı yüklendi`);
        } catch (error) {
            console.error('❌ Blog verileri yüklenemedi:', error);
            blogPosts = [];
        }
    }
    
    if (savedTours) {
        try {
            tours = JSON.parse(savedTours);
            console.log(`✅ ${tours.length} tur yüklendi`);
        } catch (error) {
            console.error('❌ Tur verileri yüklenemedi:', error);
            tours = [];
        }
    }
}

/* ==========================================
   EVENT LİSTENER'LAR
   ========================================== */
function setupEventListeners() {
    // Menü navigasyonu
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.getAttribute('data-page');
            showPage(page);
        });
    });
    
    // Blog formu
    const blogForm = document.getElementById('blog-form');
    if (blogForm) {
        blogForm.addEventListener('submit', handleBlogSubmit);
    }
    
    // Görsel yükleme
    setupImageUpload();
}

function setupImageUpload() {
    const uploadZone = document.getElementById('blog-upload-zone');
    const imageInput = document.getElementById('blog-image');
    
    if (!uploadZone || !imageInput) return;
    
    // Tıklama ile yükleme
    uploadZone.addEventListener('click', () => {
        imageInput.click();
    });
    
    // Dosya seçildiğinde
    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) handleImageFile(file);
    });
    
    // Drag & Drop
    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('dragover');
    });
    
    uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('dragover');
    });
    
    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('dragover');
        
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleImageFile(file);
        } else {
            showToast('Lütfen geçerli bir resim dosyası seçin!', 'error');
        }
    });
}

function handleImageFile(file) {
    // Dosya boyutu kontrolü (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showToast('Dosya boyutu 5MB\'dan küçük olmalı!', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
        currentImageData = e.target.result;
        currentImageName = `blog-${Date.now()}.${file.name.split('.').pop()}`;
        
        // Önizleme göster
        const preview = document.getElementById('blog-preview');
        preview.innerHTML = `<img src="${currentImageData}" alt="Preview">`;
        preview.classList.add('show');
        
        showToast('Görsel yüklendi!', 'success');
    };
    reader.readAsDataURL(file);
}

/* ==========================================
   SAYFA NAVİGASYONU
   ========================================== */
function showPage(pageName) {
    // Tüm sayfaları gizle
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Seçili sayfayı göster
    const targetPage = document.getElementById(`page-${pageName}`);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // Menü aktif durumu
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const activeMenuItem = document.querySelector(`[data-page="${pageName}"]`);
    if (activeMenuItem) {
        activeMenuItem.classList.add('active');
    }
    
    // Sayfa başlığı
    const titles = {
        'dashboard': 'Dashboard',
        'blog': 'Blog Yazıları',
        'tours': 'Tur Paketleri'
    };
    
    document.getElementById('page-title').textContent = titles[pageName] || 'Admin Panel';
}

/* ==========================================
   İSTATİSTİKLER
   ========================================== */
function updateStats() {
    document.getElementById('stat-blogs').textContent = blogPosts.length;
    document.getElementById('stat-tours').textContent = tours.length;
}

/* ==========================================
   BLOG YÖNETİMİ
   ========================================== */
function showBlogForm() {
    document.getElementById('blog-form-container').style.display = 'block';
    document.getElementById('blog-form').reset();
    document.getElementById('blog-preview').innerHTML = '';
    document.getElementById('blog-preview').classList.remove('show');
    document.getElementById('blog-form-title').textContent = 'Yeni Blog Yazısı';
    currentBlogId = null;
    currentImageData = null;
    currentImageName = null;
    
    // Forma scroll
    document.getElementById('blog-form-container').scrollIntoView({ behavior: 'smooth' });
}

function closeBlogForm() {
    document.getElementById('blog-form-container').style.display = 'none';
    currentBlogId = null;
    currentImageData = null;
    currentImageName = null;
}

function handleBlogSubmit(e) {
    e.preventDefault();
    
    // Görsel kontrolü
    if (!currentImageData && !currentBlogId) {
        showToast('Lütfen bir görsel yükleyin!', 'error');
        return;
    }
    
    // Form verilerini al
    const blogData = {
        id: currentBlogId || Date.now(),
        title: document.getElementById('blog-title-tr').value.trim(),
        title_en: document.getElementById('blog-title-en').value.trim(),
        category: document.getElementById('blog-category').value,
        description: document.getElementById('blog-summary-tr').value.trim(),
        description_en: document.getElementById('blog-summary-en').value.trim(),
        fullContent: document.getElementById('blog-content-tr').value.trim(),
        content_en: document.getElementById('blog-content-en').value.trim(),
        date: new Date().toISOString().split('T')[0],
        image: currentImageName ? `assets/${currentImageName}` : (blogPosts.find(b => b.id === currentBlogId)?.image || 'assets/placeholder.jpg')
    };
    
    if (currentBlogId) {
        // Güncelleme
        const index = blogPosts.findIndex(b => b.id === currentBlogId);
        if (index !== -1) {
            blogPosts[index] = blogData;
            showToast('Blog yazısı güncellendi!', 'success');
        }
    } else {
        // Yeni ekleme
        blogPosts.push(blogData);
        showToast('Blog yazısı eklendi!', 'success');
    }
    
    // Kaydet
    saveBlogPosts();
    
    // Listeyi güncelle
    renderBlogList();
    updateStats();
    closeBlogForm();
    
    // JSON dosyasını indir
    downloadJSON(blogPosts, 'blog-posts.json');
    
    showToast('✅ blog-posts.json dosyasını data/ klasörüne yükleyin!', 'info');
}

function saveBlogPosts() {
    try {
        localStorage.setItem('walkabout_blog_posts', JSON.stringify(blogPosts));
        console.log('✅ Blog verileri kaydedildi');
    } catch (error) {
        console.error('❌ Kaydetme hatası:', error);
        showToast('Veriler kaydedilirken hata oluştu!', 'error');
    }
}

function renderBlogList() {
    const container = document.getElementById('blog-list');
    if (!container) return;
    
    if (blogPosts.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 60px 20px;">
                <i class="fas fa-inbox" style="font-size: 64px; color: var(--gray-300); margin-bottom: 20px;"></i>
                <p style="color: var(--gray-600); font-size: 18px;">Henüz blog yazısı yok</p>
                <button class="btn btn-primary" onclick="showBlogForm()" style="margin-top: 20px;">
                    <i class="fas fa-plus"></i>
                    İlk Blog Yazınızı Ekleyin
                </button>
            </div>
        `;
        return;
    }
    
    // Tarihe göre sırala (yeniden eskiye)
    const sortedBlogs = [...blogPosts].sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    });
    
    container.innerHTML = sortedBlogs.map((blog) => `
        <div class="item-card">
            <div class="item-image">
                <img src="../${blog.image}" 
                     alt="${blog.title}"
                     onerror="this.src='https://placehold.co/120x80/38bdf8/FFF?text=Blog'">
            </div>
            <div class="item-content">
                <div class="item-title">${blog.title}</div>
                <div class="item-meta">
                    <span><i class="fas fa-calendar"></i> ${blog.date}</span>
                    <span><i class="fas fa-tag"></i> ${blog.category}</span>
                    <span><i class="fas fa-eye"></i> ${blog.description.substring(0, 50)}...</span>
                </div>
            </div>
            <div class="item-actions">
                <button class="btn btn-primary btn-small" onclick="editBlog(${blog.id})">
                    <i class="fas fa-edit"></i>
                    Düzenle
                </button>
                <button class="btn btn-danger btn-small" onclick="deleteBlog(${blog.id})">
                    <i class="fas fa-trash"></i>
                    Sil
                </button>
            </div>
        </div>
    `).join('');
}

function editBlog(blogId) {
    const blog = blogPosts.find(b => b.id === blogId);
    if (!blog) return;
    
    currentBlogId = blogId;
    
    // Formu doldur
    document.getElementById('blog-title-tr').value = blog.title;
    document.getElementById('blog-title-en').value = blog.title_en || '';
    document.getElementById('blog-category').value = blog.category;
    document.getElementById('blog-summary-tr').value = blog.description;
    document.getElementById('blog-summary-en').value = blog.description_en || '';
    document.getElementById('blog-content-tr').value = blog.fullContent;
    document.getElementById('blog-content-en').value = blog.content_en || '';
    
    // Mevcut görseli göster
    if (blog.image) {
        const preview = document.getElementById('blog-preview');
        preview.innerHTML = `<img src="../${blog.image}" alt="${blog.title}">`;
        preview.classList.add('show');
        currentImageName = blog.image.split('/').pop();
    }
    
    // Form başlığını değiştir
    document.getElementById('blog-form-title').textContent = 'Blog Yazısını Düzenle';
    
    // Formu göster
    showBlogForm();
}

function deleteBlog(blogId) {
    const blog = blogPosts.find(b => b.id === blogId);
    if (!blog) return;
    
    if (confirm(`"${blog.title}" başlıklı blog yazısını silmek istediğinizden emin misiniz?`)) {
        blogPosts = blogPosts.filter(b => b.id !== blogId);
        saveBlogPosts();
        renderBlogList();
        updateStats();
        downloadJSON(blogPosts, 'blog-posts.json');
        showToast('Blog yazısı silindi!', 'success');
    }
}

/* ==========================================
   YARDIMCI FONKSİYONLAR
   ========================================== */
function downloadJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { 
        type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function exportAllData() {
    const allData = {
        blogs: blogPosts,
        tours: tours,
        exportDate: new Date().toISOString(),
        version: '1.0'
    };
    
    const timestamp = new Date().toISOString().split('T')[0];
    downloadJSON(allData, `walkabout-backup-${timestamp}.json`);
    showToast('Tüm veriler indirildi!', 'success');
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle'
    };
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="fas ${icons[type]}"></i>
        <span class="toast-message">${message}</span>
    `;
    
    container.appendChild(toast);
    
    // 5 saniye sonra kaldır
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100px)';
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

// Global fonksiyonları window'a ekle
window.showPage = showPage;
window.showBlogForm = showBlogForm;
window.closeBlogForm = closeBlogForm;
window.editBlog = editBlog;
window.deleteBlog = deleteBlog;
window.exportAllData = exportAllData;

console.log('✅ Admin panel hazır!');
