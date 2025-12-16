/* ================================================
   WALKABOUT TRAVEL - MAIN APPLICATION SCRIPT
   NOT: Dil değiştirme sistemi i18n.js tarafından yönetiliyor
   ================================================ */

console.log('🚀 app.js yükleniyor...');

// ==================== MOBILE MENU ====================
function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            navLinks.classList.toggle('active');
            menuToggle.classList.toggle('active');
            console.log('📱 Mobil menü toggle:', navLinks.classList.contains('active'));
        });

        // Menü dışına tıklanınca kapat
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav-container')) {
                navLinks.classList.remove('active');
                menuToggle.classList.remove('active');
            }
        });

        console.log('✅ Mobil menü hazır');
    }
}

// ==================== NAVBAR SCROLL ====================
function initNavbarScroll() {
    const navbar = document.getElementById('navbar');
    
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
        console.log('✅ Navbar scroll efekti hazır');
    }
}

// ==================== CONTACT FORM ====================
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('name')?.value || '';
            const email = document.getElementById('email')?.value || '';
            const phone = document.getElementById('phone')?.value || '';
            const message = document.getElementById('message')?.value || '';
            
            console.log('📧 Form gönderiliyor:', { name, email, phone });
            
            const whatsappMessage = `Merhaba! Web sitenizden ulaşıyorum.%0A%0AAdım: ${name}%0AE-posta: ${email}%0ATelefon: ${phone}%0A%0AMesaj:%0A${message}`;
            
            window.open(`https://wa.me/5491135870045?text=${whatsappMessage}`, '_blank');
            
            contactForm.reset();
            alert('✓ Mesajınız WhatsApp üzerinden gönderiliyor...');
        });
        
        console.log('✅ İletişim formu hazır');
    }
}

// ==================== SMOOTH SCROLL ====================
function initSmoothScroll() {
    // Sadece # ile başlayan linkleri yakala
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            
            // Boş # veya #! kontrolü
            if (href === '#' || href === '#!') {
                e.preventDefault();
                return;
            }
            
            const target = document.querySelector(href);
            
            if (target) {
                e.preventDefault();
                
                // Mobil menüyü kapat
                const navLinks = document.querySelector('.nav-links');
                const menuToggle = document.querySelector('.menu-toggle');
                
                if (navLinks) {
                    navLinks.classList.remove('active');
                }
                if (menuToggle) {
                    menuToggle.classList.remove('active');
                }
                
                // Smooth scroll
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    console.log('✅ Smooth scroll hazır');
}

// ==================== LAZY LOADING ====================
function initLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                }
            });
        });

        document.querySelectorAll('img.lazy').forEach(img => {
            imageObserver.observe(img);
        });
        
        console.log('✅ Lazy loading hazır');
    }
}

// ==================== INITIALIZATION ====================
// DOM hazır olduğunda çalıştır
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('📄 DOM yüklendi, app.js başlatılıyor...');
        initMobileMenu();
        initNavbarScroll();
        initContactForm();
        initSmoothScroll();
        initLazyLoading();
        console.log('✅ app.js - Tüm sistemler hazır!');
    });
} else {
    console.log('📄 DOM zaten hazır, app.js başlatılıyor...');
    initMobileMenu();
    initNavbarScroll();
    initContactForm();
    initSmoothScroll();
    initLazyLoading();
    console.log('✅ app.js - Tüm sistemler hazır!');
}