// ===== MAIN.JS - Core functionality and interactions =====

// Global variables
let isLoading = true;
let customCursor = null;
let scrollProgress = 0;

// DOM Elements
const elements = {};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeElements();
    initializeCustomCursor();
    initializeNavigation();
    initializeScrollEffects();
    initializeContactForm();
    initializeLoadingScreen();
    initializeMobileMenu();
    initializeGalleryFilter();
});

// Initialize DOM elements
function initializeElements() {
    elements.loadingScreen = document.getElementById('loading-screen');
    elements.navbar = document.querySelector('.navbar');
    elements.navLinks = document.querySelectorAll('.nav-link');
    elements.hamburger = document.querySelector('.hamburger');
    elements.navMenu = document.querySelector('.nav-menu');
    elements.heroTitle = document.querySelector('.hero-title');
    elements.contactForm = document.querySelector('.contact-form');
    elements.galleryItems = document.querySelectorAll('.gallery-item');
    elements.filterBtns = document.querySelectorAll('.filter-btn');
    elements.ctaButtons = document.querySelectorAll('.cta-button');
}

// ===== CUSTOM CURSOR =====
function initializeCustomCursor() {
    // Check if device supports custom cursor (not mobile)
    if (window.innerWidth <= 768 || 'ontouchstart' in window) {
        document.body.classList.add('no-custom-cursor');
        document.body.style.cursor = 'auto';
        return;
    }

    customCursor = {
        dot: document.querySelector('.cursor-dot'),
        trail: document.querySelector('.cursor-trail')
    };

    if (!customCursor.dot || !customCursor.trail) {
        console.warn('Custom cursor elements not found');
        document.body.classList.add('no-custom-cursor');
        document.body.style.cursor = 'auto';
        return;
    }

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let trailX = mouseX;
    let trailY = mouseY;

    // Initialize cursor position
    customCursor.dot.style.left = mouseX + 'px';
    customCursor.dot.style.top = mouseY + 'px';
    customCursor.trail.style.left = mouseX + 'px';
    customCursor.trail.style.top = mouseY + 'px';

    // Update cursor position
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        customCursor.dot.style.left = mouseX + 'px';
        customCursor.dot.style.top = mouseY + 'px';
    });

    // Animate trail with smooth following
    function animateTrail() {
        trailX += (mouseX - trailX) * 0.1;
        trailY += (mouseY - trailY) * 0.1;
        
        customCursor.trail.style.left = trailX + 'px';
        customCursor.trail.style.top = trailY + 'px';
        
        requestAnimationFrame(animateTrail);
    }
    animateTrail();

    // Cursor hover effects
    const hoverElements = document.querySelectorAll('a, button, .gallery-item, .instagram-post');
    hoverElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            customCursor.dot.style.transform = 'translate(-50%, -50%) scale(2)';
            customCursor.trail.style.transform = 'translate(-50%, -50%) scale(1.5)';
        });

        element.addEventListener('mouseleave', () => {
            customCursor.dot.style.transform = 'translate(-50%, -50%) scale(1)';
            customCursor.trail.style.transform = 'translate(-50%, -50%) scale(1)';
        });
    });

    console.log('Custom cursor initialized successfully');
}

// ===== NAVIGATION =====
function initializeNavigation() {
    // Smooth scrolling for navigation links
    elements.navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                // Adjust offset for mobile devices
                const isMobile = window.innerWidth <= 768;
                const offsetTop = targetSection.offsetTop - (isMobile ? 80 : 100);
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                elements.navMenu.classList.remove('active');
                elements.hamburger.classList.remove('active');
            }
        });
    });

    // Navbar background on scroll
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        
        if (scrolled > 100) {
            elements.navbar.style.background = 'rgba(255, 255, 255, 0.15)';
            elements.navbar.style.backdropFilter = 'blur(30px) saturate(200%) brightness(120%)';
            elements.navbar.style.borderColor = 'rgba(135, 206, 235, 0.4)';
        } else {
            elements.navbar.style.background = 'rgba(255, 255, 255, 0.08)';
            elements.navbar.style.backdropFilter = 'blur(25px) saturate(180%)';
            elements.navbar.style.borderColor = 'rgba(255, 255, 255, 0.15)';
        }

        updateScrollProgress();
        updateActiveNavLink();
    });

    // Scroll progress indicator
    function updateScrollProgress() {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        scrollProgress = (winScroll / height) * 100;
    }

    // Update active navigation link based on scroll position
    function updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.pageYOffset + 150; // Account for floating navbar

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                elements.navLinks.forEach(link => link.classList.remove('active'));
                if (navLink) navLink.classList.add('active');
            }
        });
    }
}

// ===== MOBILE MENU =====
function initializeMobileMenu() {
    if (!elements.hamburger || !elements.navMenu) return;

    elements.hamburger.addEventListener('click', () => {
        elements.hamburger.classList.toggle('active');
        elements.navMenu.classList.toggle('active');
    });

    // Close menu when clicking on a link
    elements.navLinks.forEach(link => {
        link.addEventListener('click', () => {
            elements.hamburger.classList.remove('active');
            elements.navMenu.classList.remove('active');
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!elements.hamburger.contains(e.target) && !elements.navMenu.contains(e.target)) {
            elements.hamburger.classList.remove('active');
            elements.navMenu.classList.remove('active');
        }
    });
}

// ===== LOADING SCREEN =====
function initializeLoadingScreen() {
    if (!elements.loadingScreen) return;

    // Simulate loading time
    setTimeout(() => {
        elements.loadingScreen.classList.add('loaded');
        isLoading = false;
        
        // Remove loading screen from DOM after animation
        setTimeout(() => {
            elements.loadingScreen.style.display = 'none';
        }, 1000);

        // Start hero animations
        animateHeroText();
    }, 2500);
}

// ===== HERO ANIMATIONS =====
function animateHeroText() {
    if (!elements.heroTitle) return;

    const lines = elements.heroTitle.querySelectorAll('span');
    lines.forEach((line, index) => {
        line.style.opacity = '0';
        line.style.transform = 'translateY(50px)';
        line.style.transition = 'all 0.8s ease';
        
        setTimeout(() => {
            line.style.opacity = '1';
            line.style.transform = 'translateY(0)';
        }, index * 200);
    });
}

// ===== SCROLL EFFECTS =====
function initializeScrollEffects() {
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll('.section-header, .gallery-item, .tech-category, .story-block');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.8s ease';
        observer.observe(el);
    });

    // Add CSS for animate-in class
    const style = document.createElement('style');
    style.textContent = `
        .animate-in {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);

    // Parallax effect for hero background
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.hero-bg');
        
        parallaxElements.forEach(element => {
            const speed = 0.5;
            element.style.transform = `translateY(${scrolled * speed}px)`;
        });
    });
}

// ===== GALLERY FILTER =====
function initializeGalleryFilter() {
    if (!elements.filterBtns || !elements.galleryItems) return;

    elements.filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filterValue = btn.getAttribute('data-filter');

            // Update active button
            elements.filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Filter gallery items
            elements.galleryItems.forEach(item => {
                const category = item.getAttribute('data-category');
                
                if (filterValue === 'all' || category === filterValue) {
                    item.style.display = 'block';
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.8)';
                    
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    }, 100);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.8)';
                    
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
}

// ===== CONTACT FORM =====
function initializeContactForm() {
    if (!elements.contactForm) return;

    elements.contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = new FormData(elements.contactForm);
        const formObject = {};
        
        formData.forEach((value, key) => {
            formObject[key] = value;
        });

        // Simulate form submission
        showNotification('Message sent successfully! We\'ll get back to you soon.', 'success');
        elements.contactForm.reset();
    });

    // Form field animations
    const formInputs = elements.contactForm.querySelectorAll('input, select, textarea');
    formInputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.classList.add('focused');
        });

        input.addEventListener('blur', () => {
            if (!input.value) {
                input.parentElement.classList.remove('focused');
            }
        });

        // Check if fields have values on load
        if (input.value) {
            input.parentElement.classList.add('focused');
        }
    });
}

// ===== UTILITY FUNCTIONS =====

// Smooth scroll to section
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        // Adjust offset for mobile devices
        const isMobile = window.innerWidth <= 768;
        const offsetTop = section.offsetTop - (isMobile ? 80 : 100);
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? 'rgba(0, 255, 128, 0.9)' : 'rgba(135, 206, 235, 0.9)'};
        color: #000;
        padding: 1rem 2rem;
        border-radius: 8px;
        font-weight: 600;
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        box-shadow: 0 10px 30px rgba(135, 206, 235, 0.3),
                    inset 0 1px 0 rgba(255, 255, 255, 0.3);
        backdrop-filter: blur(10px);
    `;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    // Remove after delay
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

// Throttle function for performance
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Add smooth scrolling to CTA buttons
document.addEventListener('DOMContentLoaded', () => {
    elements.ctaButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            // Add ripple effect
            const ripple = document.createElement('span');
            const rect = button.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            button.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
});

// Add ripple effect CSS
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    .cta-button {
        position: relative;
        overflow: hidden;
    }
    
    .ripple {
        position: absolute;
        background: rgba(255, 255, 255, 0.4);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(rippleStyle);
