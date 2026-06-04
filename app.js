/* ================================================
   WALKABOUT TRAVEL - MAIN APPLICATION SCRIPT
   NOT: Dil değiştirme sistemi i18n.js tarafından yönetiliyor
   ================================================ */

// Development mode kontrolü
const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

function log(...args) {
    if (isDev) console.log(...args);
}

log('🚀 app.js yükleniyor...');

// ==================== MOBILE MENU ====================
function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            navLinks.classList.toggle('active');
            
            // Icon değiştirme
            const icon = menuToggle.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-times');
            }
            
            log('📱 Mobil menü toggle:', navLinks.classList.contains('active'));
        });

        // Menü dışına tıklanınca kapat
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav-container')) {
                navLinks.classList.remove('active');
                
                const icon = menuToggle.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });

        // ESC tuşu ile kapat
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                
                const icon = menuToggle.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });

        log('✅ Mobil menü hazır');
    }
}

// ==================== NAVBAR SCROLL ====================
function initNavbarScroll() {
    const navbar = document.getElementById('navbar');
    
    if (navbar) {
        let lastScroll = 0;
        
        window.addEventListener('scroll', () => {
            const currentScroll = window.scrollY;
            
            if (currentScroll > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
            
            lastScroll = currentScroll;
        }, { passive: true });
        
        log('✅ Navbar scroll efekti hazır');
    }
}

// ==================== CONTACT FORM ====================
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Form elemanlarını al
            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('email');
            const phoneInput = document.getElementById('phone');
            const messageInput = document.getElementById('message');
            
            // Değerleri al
            const name = nameInput?.value.trim() || '';
            const email = emailInput?.value.trim() || '';
            const phone = phoneInput?.value.trim() || '';
            const message = messageInput?.value.trim() || '';
            
            // Validation
            if (!name) {
                alert('❌ Lütfen adınızı girin.');
                nameInput?.focus();
                return;
            }
            
            if (!email) {
                alert('❌ Lütfen e-posta adresinizi girin.');
                emailInput?.focus();
                return;
            }
            
            // Email format kontrolü
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('❌ Lütfen geçerli bir e-posta adresi girin.');
                emailInput?.focus();
                return;
            }
            
            if (!message) {
                alert('❌ Lütfen mesajınızı yazın.');
                messageInput?.focus();
                return;
            }
            
            log('📧 Form gönderiliyor:', { name, email, phone });
            
            // WhatsApp mesajı oluştur
            const whatsappMessage = encodeURIComponent(
                `Merhaba! Web sitenizden ulaşıyorum.\n\n` +
                `Adım: ${name}\n` +
                `E-posta: ${email}\n` +
                `Telefon: ${phone}\n\n` +
                `Mesaj:\n${message}`
            );
            
            // WhatsApp'ı aç (Türkiye numarası)
            const whatsappURL = `https://wa.me/902125551923?text=${whatsappMessage}`;
            window.open(whatsappURL, '_blank');
            
            // Formu temizle
            contactForm.reset();
            
            // Başarı mesajı
            alert('✅ Mesajınız WhatsApp üzerinden gönderiliyor...');
        });
        
        log('✅ İletişim formu hazır');
    }
}

// ==================== SMOOTH SCROLL ====================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            
            // Boş # veya #! kontrolü
            if (!href || href === '#' || href === '#!') {
                e.preventDefault();
                return;
            }
            
            const target = document.querySelector(href);
            
            if (target) {
                e.preventDefault();
                
                // Mobil menüyü kapat
                const navLinks = document.querySelector('.nav-links');
                const menuToggle = document.querySelector('.menu-toggle');
                
                if (navLinks && navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                }
                
                if (menuToggle) {
                    const icon = menuToggle.querySelector('i');
                    if (icon) {
                        icon.classList.remove('fa-times');
                        icon.classList.add('fa-bars');
                    }
                }
                
                // Navbar yüksekliğini hesaba kat
                const navbarHeight = document.getElementById('navbar')?.offsetHeight || 0;
                const targetPosition = target.getBoundingClientRect().top + window.scrollY - navbarHeight;
                
                // Smooth scroll
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    log('✅ Smooth scroll hazır');
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
                        img.removeAttribute('data-src');
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                        
                        log('🖼️ Lazy loaded:', img.src);
                    }
                }
            });
        }, {
            rootMargin: '50px' // 50px önden yüklemeye başla
        });

        const lazyImages = document.querySelectorAll('img.lazy, img[data-src]');
        lazyImages.forEach(img => {
            imageObserver.observe(img);
        });
        
        log(`✅ Lazy loading hazır (${lazyImages.length} resim)`);
    } else {
        // Fallback eski tarayıcılar için
        document.querySelectorAll('img[data-src]').forEach(img => {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        });
        
        log('⚠️ IntersectionObserver desteklenmiyor, tüm resimler yüklendi');
    }
}

// ==================== SCROLL TO TOP BUTTON ====================
function initScrollToTop() {
    // Scroll to top butonu oluştur (opsiyonel)
    const scrollBtn = document.createElement('button');
    scrollBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    scrollBtn.className = 'scroll-to-top';
    scrollBtn.setAttribute('aria-label', 'Scroll to top');
    scrollBtn.style.cssText = `
        position: fixed;
        bottom: 100px;
        right: 30px;
        width: 50px;
        height: 50px;
        background: var(--primary);
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 998;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        box-shadow: 0 4px 15px rgba(0, 188, 212, 0.4);
    `;
    
    document.body.appendChild(scrollBtn);
    
    // Scroll event
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            scrollBtn.style.opacity = '1';
            scrollBtn.style.visibility = 'visible';
        } else {
            scrollBtn.style.opacity = '0';
            scrollBtn.style.visibility = 'hidden';
        }
    }, { passive: true });
    scrollBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    log('✅ Scroll to top butonu hazır');
}

// ==================== PERFORMANCE OPTIMIZATION ====================
function optimizePerformance() {
    // Fontlar için preconnect/preload <head>'de statik olarak tanımlandı (tour.php, blog.php, index.html).
    // JS defer sonrası font preload eklemenin LCP'ye faydası yoktur — bu fonksiyon artık boş.
    log('✅ Performance optimizasyonu (no-op)');
}

// ==================== PRELOADER ====================
function initPreloader() {
    const preloader = document.getElementById('preloader');
    if (!preloader) return;

    window.addEventListener('load', () => {
        setTimeout(() => {
            preloader.classList.add('hide');

            // Geçiş bittikten sonra DOM'dan kaldır (performans)
            preloader.addEventListener('transitionend', () => {
                preloader.remove();
            }, { once: true });
        }, 3200);
    });

    log('✅ Preloader hazır');
}

// ==================== INITIALIZATION ====================
function initApp() {
    log('📄 DOM yüklendi, app.js başlatılıyor...');
    
    initPreloader();
    initMobileMenu();
    initNavbarScroll();
    initContactForm();
    initSmoothScroll();
    initLazyLoading();
    initScrollToTop();
    optimizePerformance();
    
    log('✅ app.js - Tüm sistemler hazır!');
}

// DOM hazır olduğunda çalıştır
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// Export fonksiyonlar (diğer scriptler kullanabilsin)
if (typeof window !== 'undefined') {
    window.WalkAboutApp = {
        initPreloader,
        initMobileMenu,
        initNavbarScroll,
        initContactForm,
        initSmoothScroll,
        initLazyLoading
    };
}






























