// ============================================
// CYBERSECURITY PORTFOLIO - JAVASCRIPT
// ============================================

// ===== NAVIGATION & ROUTING =====
const pages = document.querySelectorAll('.page');
const navLinks = document.querySelectorAll('.nav-link');
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

// Router function
function navigateToPage(pageId) {
    // Hide all pages
    pages.forEach(page => page.classList.remove('active'));
    
    // Show target page
    const targetPage = document.getElementById(`${pageId}-page`);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // Update active nav link
    navLinks.forEach(link => link.classList.remove('active'));
    const activeLink = document.querySelector(`[data-page="${pageId}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
    
    // Close mobile menu
    navMenu.classList.remove('active');
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Update URL hash
    window.location.hash = pageId;
}

// Handle navigation clicks
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const pageId = link.getAttribute('data-page');
        navigateToPage(pageId);
    });
});

// Handle CTA button clicks
document.querySelectorAll('[data-page]').forEach(button => {
    if (!button.classList.contains('nav-link')) {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = button.getAttribute('data-page');
            navigateToPage(pageId);
        });
    }
});

// Mobile menu toggle
navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
});

// Handle initial page load based on URL hash
window.addEventListener('load', () => {
    const hash = window.location.hash.substring(1);
    if (hash && document.getElementById(`${hash}-page`)) {
        navigateToPage(hash);
    } else {
        navigateToPage('about');
    }
});

// Handle browser back/forward buttons
window.addEventListener('hashchange', () => {
    const hash = window.location.hash.substring(1);
    if (hash && document.getElementById(`${hash}-page`)) {
        navigateToPage(hash);
    } else {
        navigateToPage('about');
    }
});

// ===== NAVBAR SCROLL EFFECT =====
const navbar = document.getElementById('navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
});

// ===== SCROLL ANIMATIONS =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all elements with data-scroll attribute
const scrollElements = document.querySelectorAll('[data-scroll]');
scrollElements.forEach(el => observer.observe(el));

// Re-observe elements when page changes
function reinitializeScrollAnimations() {
    const newScrollElements = document.querySelectorAll('[data-scroll]:not(.visible)');
    newScrollElements.forEach(el => observer.observe(el));
}

// Call reinitialize when navigating
window.addEventListener('hashchange', () => {
    setTimeout(reinitializeScrollAnimations, 100);
});

// ===== SMOOTH SCROLL FOR ANCHOR LINKS =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href.length > 1) {
            const targetElement = document.querySelector(href);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// ===== PARALLAX EFFECT FOR HERO =====
const heroBackground = document.querySelector('.hero-bg-image');
if (heroBackground) {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const heroSection = document.querySelector('.hero');
        
        if (heroSection && scrolled < heroSection.offsetHeight) {
            heroBackground.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
    });
}

// ===== TERMINAL CURSOR EFFECT (optional enhancement) =====
function createTerminalEffect() {
    const roles = document.querySelector('.hero-roles');
    if (!roles) return;
    
    const originalText = roles.textContent;
    let isVisible = true;
    
    setInterval(() => {
        if (isVisible) {
            roles.style.opacity = '0.7';
        } else {
            roles.style.opacity = '1';
        }
        isVisible = !isVisible;
    }, 800);
}

// Initialize terminal effect
createTerminalEffect();

// ===== PERFORMANCE: Lazy load images =====
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            }
        });
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// ===== CONSOLE MESSAGE =====
console.log(
    '%c👋 Welcome to my portfolio!',
    'font-size: 20px; font-weight: bold; color: #DAFF01;'
);
console.log(
    '%cInterested in the code? Check out the network tab to see the architecture.',
    'font-size: 14px; color: #DADADA;'
);

// ===== PAGE VISIBILITY =====
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        document.title = '👋 Come back! - Naga Vignesh';
    } else {
        document.title = 'Naga Vignesh Marneni - Cybersecurity & Network Engineer';
    }
});