/* ==========================================
   WALKABOUT TRAVEL - ADMIN PANEL SCRIPT (DÜZELTİLMİŞ)
   Blog + Tur Yönetimi
   ========================================== */

// Global değişkenler
let blogPosts = [];
let tours = [];
let currentBlogId = null;
let currentTourId = null;
let currentBlogImageData = null;
let currentBlogImageName = null;
let currentTourImageData = null;
let currentTourImageName = null;

/* ==========================================
   SAYFA YÜKLENİNCE
   ========================================== */
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Admin panel başlatılıyor...');
    
    try {
        loadAllData();
        setupEventListeners();
        updateStats();
        renderBlogList();
        renderTourList();
        console.log('✅ Admin panel başarıyla yüklendi!');
    } catch (error) {
        console.error('❌ Admin panel yükleme hatası:', error);
        showToast('Admin panel başlatılamadı! Konsolu kontrol edin.', 'error');
    }
});

/* ==========================================
   VERİ YÜKLEME
   ========================================== */
function loadAllData() {
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
    
    // Tur formu
    const tourForm = document.getElementById('tour-form');
    if (tourForm) {
        tourForm.addEventListener('submit', handleTourSubmit);
    }
    
    // Görsel yükleme
    setupBlogImageUpload();
    setupTourImageUpload();
}

function setupBlogImageUpload() {
    const uploadZone = document.getElementById('blog-upload-zone');
    const imageInput = document.getElementById('blog-image');
    
    if (!uploadZone || !imageInput) {
        console.warn('⚠️ Blog image upload elements bulunamadı');
        return;
    }
    
    uploadZone.addEventListener('click', () => imageInput.click());
    
    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) handleBlogImageFile(file);
    });
    
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
            handleBlogImageFile(file);
        }
    });
}

function setupTourImageUpload() {
    const uploadZone = document.getElementById('tour-upload-zone');
    const imageInput = document.getElementById('tour-image');
    
    if (!uploadZone || !imageInput) {
        console.warn('⚠️ Tour image upload elements bulunamadı');
        return;
    }
    
    uploadZone.addEventListener('click', () => imageInput.click());
    
    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) handleTourImageFile(file);
    });
    
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
            handleTourImageFile(file);
        }
    });
}

function handleBlogImageFile(file) {
    if (file.size > 5 * 1024 * 1024) {
        showToast('Dosya boyutu 5MB\'dan küçük olmalı!', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
        currentBlogImageData = e.target.result;
        currentBlogImageName = `blog-${Date.now()}.${file.name.split('.').pop()}`;
        
        const preview = document.getElementById('blog-preview');
        if (preview) {
            preview.innerHTML = `<img src="${currentBlogImageData}" alt="Preview">`;
            preview.classList.add('show');
        }
        
        showToast('Görsel yüklendi!', 'success');
    };
    reader.readAsDataURL(file);
}

function handleTourImageFile(file) {
    if (file.size > 5 * 1024 * 1024) {
        showToast('Dosya boyutu 5MB\'dan küçük olmalı!', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
        currentTourImageData = e.target.result;
        currentTourImageName = `tour-${Date.now()}.${file.name.split('.').pop()}`;
        
        const preview = document.getElementById('tour-preview');
        if (preview) {
            preview.innerHTML = `<img src="${currentTourImageData}" alt="Preview">`;
            preview.classList.add('show');
        }
        
        showToast('Görsel yüklendi!', 'success');
    };
    reader.readAsDataURL(file);
}

/* ==========================================
   SAYFA NAVİGASYONU
   ========================================== */
function showPage(pageName) {
    console.log(`📄 Sayfa değiştiriliyor: ${pageName}`);
    
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    const targetPage = document.getElementById(`page-${pageName}`);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const activeMenuItem = document.querySelector(`[data-page="${pageName}"]`);
    if (activeMenuItem) {
        activeMenuItem.classList.add('active');
    }
    
    const titles = {
        'dashboard': 'Dashboard',
        'blog': 'Blog Yazıları',
        'tours': 'Tur Paketleri'
    };
    
    const pageTitle = document.getElementById('page-title');
    if (pageTitle) {
        pageTitle.textContent = titles[pageName] || 'Admin Panel';
    }
}

/* ==========================================
   İSTATİSTİKLER
   ========================================== */
function updateStats() {
    const statBlogs = document.getElementById('stat-blogs');
    const statTours = document.getElementById('stat-tours');
    
    if (statBlogs) statBlogs.textContent = blogPosts.length;
    if (statTours) statTours.textContent = tours.length;
}

/* ==========================================
   BLOG YÖNETİMİ
   ========================================== */
function showBlogForm() {
    const formContainer = document.getElementById('blog-form-container');
    if (formContainer) {
        formContainer.style.display = 'block';
        document.getElementById('blog-form').reset();
        
        const preview = document.getElementById('blog-preview');
        if (preview) {
            preview.innerHTML = '';
            preview.classList.remove('show');
        }
        
        document.getElementById('blog-form-title').textContent = 'Yeni Blog Yazısı';
        currentBlogId = null;
        currentBlogImageData = null;
        currentBlogImageName = null;
        
        formContainer.scrollIntoView({ behavior: 'smooth' });
    }
}

function closeBlogForm() {
    const formContainer = document.getElementById('blog-form-container');
    if (formContainer) {
        formContainer.style.display = 'none';
    }
    currentBlogId = null;
    currentBlogImageData = null;
    currentBlogImageName = null;
}

function handleBlogSubmit(e) {
    e.preventDefault();
    
    if (!currentBlogImageData && !currentBlogId) {
        showToast('Lütfen bir görsel yükleyin!', 'error');
        return;
    }
    
    try {
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
            image: currentBlogImageName ? `assets/${currentBlogImageName}` : (blogPosts.find(b => b.id === currentBlogId)?.image || 'assets/placeholder.jpg')
        };
        
        if (currentBlogId) {
            const index = blogPosts.findIndex(b => b.id === currentBlogId);
            if (index !== -1) {
                blogPosts[index] = blogData;
                showToast('Blog yazısı güncellendi!', 'success');
            }
        } else {
            blogPosts.push(blogData);
            showToast('Blog yazısı eklendi!', 'success');
        }
        
        saveBlogPosts();
        renderBlogList();
        updateStats();
        closeBlogForm();
        
        downloadJSON(blogPosts, 'blog-posts.json');
        showToast('✅ blog-posts.json dosyasını data/ klasörüne yükleyin!', 'info');
    } catch (error) {
        console.error('❌ Blog kayıt hatası:', error);
        showToast('Blog kaydedilirken hata oluştu!', 'error');
    }
}

function saveBlogPosts() {
    try {
        localStorage.setItem('walkabout_blog_posts', JSON.stringify(blogPosts));
        console.log(`✅ ${blogPosts.length} blog LocalStorage'a kaydedildi`);
    } catch (error) {
        console.error('❌ Blog kayıt hatası:', error);
        showToast('Blog verileri kaydedilemedi!', 'error');
    }
}

function renderBlogList() {
    const container = document.getElementById('blog-list');
    if (!container) {
        console.warn('⚠️ blog-list container bulunamadı');
        return;
    }
    
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
    
    const sortedBlogs = [...blogPosts].sort((a, b) => new Date(b.date) - new Date(a.date));
    
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
                </div>
            </div>
            <div class="item-actions">
                <button class="btn btn-danger btn-small" onclick="deleteBlog(${blog.id})">
                    <i class="fas fa-trash"></i>
                    Sil
                </button>
            </div>
        </div>
    `).join('');
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
   TUR YÖNETİMİ
   ========================================== */
function showTourForm() {
    const formContainer = document.getElementById('tour-form-container');
    if (formContainer) {
        formContainer.style.display = 'block';
        document.getElementById('tour-form').reset();
        
        const preview = document.getElementById('tour-preview');
        if (preview) {
            preview.innerHTML = '';
            preview.classList.remove('show');
        }
        
        document.getElementById('tour-form-title').textContent = 'Yeni Tur Paketi';
        currentTourId = null;
        currentTourImageData = null;
        currentTourImageName = null;
        
        formContainer.scrollIntoView({ behavior: 'smooth' });
    }
}

function closeTourForm() {
    const formContainer = document.getElementById('tour-form-container');
    if (formContainer) {
        formContainer.style.display = 'none';
    }
    currentTourId = null;
    currentTourImageData = null;
    currentTourImageName = null;
}

function handleTourSubmit(e) {
    e.preventDefault();
    
    if (!currentTourImageData && !currentTourId) {
        showToast('Lütfen bir görsel yükleyin!', 'error');
        return;
    }
    
    try {
        const tourData = {
            id: currentTourId || `TUR-${Date.now()}`,
            title: document.getElementById('tour-title-tr').value.trim(),
            title_en: document.getElementById('tour-title-en').value.trim(),
            price: document.getElementById('tour-price').value.trim(),
            duration: document.getElementById('tour-duration').value.trim(),
            location: document.getElementById('tour-location').value.trim(),
            area: document.getElementById('tour-area').value.trim(),
            category: document.getElementById('tour-category').value,
            description: document.getElementById('tour-description-tr').value.trim(),
            description_en: document.getElementById('tour-description-en').value.trim(),
            content: document.getElementById('tour-content-tr').value.trim(),
            content_en: document.getElementById('tour-content-en').value.trim(),
            image: currentTourImageName ? `assets/${currentTourImageName}` : (tours.find(t => t.id === currentTourId)?.image || 'assets/placeholder.jpg')
        };
        
        if (currentTourId) {
            const index = tours.findIndex(t => t.id === currentTourId);
            if (index !== -1) {
                tours[index] = tourData;
                showToast('Tur güncellendi!', 'success');
            }
        } else {
            tours.push(tourData);
            showToast('Tur eklendi!', 'success');
        }
        
        saveTours();
        renderTourList();
        updateStats();
        closeTourForm();
        
        downloadJSON(tours, 'tours.json');
        showToast('✅ tours.json dosyasını data/ klasörüne yükleyin!', 'info');
    } catch (error) {
        console.error('❌ Tur kayıt hatası:', error);
        showToast('Tur kaydedilirken hata oluştu!', 'error');
    }
}

function saveTours() {
    try {
        localStorage.setItem('walkabout_tours', JSON.stringify(tours));
        console.log(`✅ ${tours.length} tur LocalStorage'a kaydedildi`);
    } catch (error) {
        console.error('❌ Tur kayıt hatası:', error);
        showToast('Tur verileri kaydedilemedi!', 'error');
    }
}

function renderTourList() {
    const container = document.getElementById('tour-list');
    if (!container) {
        console.warn('⚠️ tour-list container bulunamadı');
        return;
    }
    
    if (tours.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 60px 20px;">
                <i class="fas fa-map-marked-alt" style="font-size: 64px; color: var(--gray-300); margin-bottom: 20px;"></i>
                <p style="color: var(--gray-600); font-size: 18px;">Henüz tur yok</p>
                <button class="btn btn-primary" onclick="showTourForm()" style="margin-top: 20px;">
                    <i class="fas fa-plus"></i>
                    İlk Turunuzu Ekleyin
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = tours.map((tour) => `
        <div class="item-card">
            <div class="item-image">
                <img src="../${tour.image}" 
                     alt="${tour.title}"
                     onerror="this.src='https://placehold.co/120x80/38bdf8/FFF?text=Tour'">
            </div>
            <div class="item-content">
                <div class="item-title">${tour.title}</div>
                <div class="item-meta">
                    <span><i class="fas fa-tag"></i> ${tour.price}</span>
                    <span><i class="fas fa-map-marker-alt"></i> ${tour.location}</span>
                    <span><i class="fas fa-bookmark"></i> ${tour.category}</span>
                </div>
            </div>
            <div class="item-actions">
                <button class="btn btn-danger btn-small" onclick="deleteTour('${tour.id}')">
                    <i class="fas fa-trash"></i>
                    Sil
                </button>
            </div>
        </div>
    `).join('');
}

function deleteTour(tourId) {
    const tour = tours.find(t => t.id === tourId);
    if (!tour) return;
    
    if (confirm(`"${tour.title}" turunu silmek istediğinizden emin misiniz?`)) {
        tours = tours.filter(t => t.id !== tourId);
        saveTours();
        renderTourList();
        updateStats();
        downloadJSON(tours, 'tours.json');
        showToast('Tur silindi!', 'success');
    }
}

/* ==========================================
   YARDIMCI FONKSİYONLAR
   ========================================== */
function downloadJSON(data, filename) {
    try {
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
        
        console.log(`✅ ${filename} indirildi`);
    } catch (error) {
        console.error('❌ JSON indirme hatası:', error);
        showToast('Dosya indirilemedi!', 'error');
    }
}

function exportAllData() {
    try {
        const allData = {
            blogs: blogPosts,
            tours: tours,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        
        const timestamp = new Date().toISOString().split('T')[0];
        downloadJSON(allData, `walkabout-backup-${timestamp}.json`);
        showToast('Tüm veriler indirildi!', 'success');
    } catch (error) {
        console.error('❌ Export hatası:', error);
        showToast('Export başarısız!', 'error');
    }
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) {
        console.warn('⚠️ toast-container bulunamadı');
        console.log(`Toast: [${type}] ${message}`);
        return;
    }
    
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
window.deleteBlog = deleteBlog;
window.showTourForm = showTourForm;
window.closeTourForm = closeTourForm;
window.deleteTour = deleteTour;
window.exportAllData = exportAllData;

console.log('✅ Admin panel hazır!');