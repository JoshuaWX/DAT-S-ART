// ===== MAIN.JS - Core functionality and interactions =====

// Global variables
let isLoading = true;
let customCursor = null;
let scrollProgress = 0;
let lastScrollTime = 0;
let scrollThrottle = 16; // ~60fps
let isScrolling = false;
let scrollEndTimer = null;

// Mark that main scroll handler exists to prevent conflicts
window.mainScrollHandlerExists = true;

// Performance optimizations
const performanceOptimizer = {
    rafId: null,
    isRafScheduled: false,
    
    scheduleUpdate(callback) {
        if (!this.isRafScheduled) {
            this.isRafScheduled = true;
            this.rafId = requestAnimationFrame(() => {
                callback();
                this.isRafScheduled = false;
            });
        }
    },
    
    cancelUpdate() {
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.isRafScheduled = false;
        }
    }
};

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
    initializeStatCounters();
    initializeSubscribeSection();
    initializePerformanceMonitoring();
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
    elements.subscribeForm = document.querySelector('.subscribe-form');
    elements.subscribeEmail = document.getElementById('subscribe-email');
}

// ===== CUSTOM CURSOR ===== (DISABLED FOR PERFORMANCE)
function initializeCustomCursor() {
    // Custom cursor disabled to improve performance
    document.body.style.cursor = 'auto';
    return;
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

    // Optimized navbar background on scroll with RAF
    let navbarUpdateScheduled = false;
    
    window.addEventListener('scroll', () => {
        if (!navbarUpdateScheduled) {
            navbarUpdateScheduled = true;
            performanceOptimizer.scheduleUpdate(() => {
                const scrolled = window.pageYOffset;
                
                if (scrolled > 100) {
                    elements.navbar.style.background = 'linear-gradient(135deg, rgba(10, 10, 10, 0.95) 0%, rgba(26, 26, 46, 0.95) 50%, rgba(22, 33, 62, 0.95) 100%)';
                    elements.navbar.style.backdropFilter = 'blur(30px) saturate(150%)';
                    elements.navbar.style.borderColor = 'rgba(135, 206, 235, 0.4)';
                } else {
                    elements.navbar.style.background = 'linear-gradient(135deg, rgba(10, 10, 10, 0.9) 0%, rgba(26, 26, 46, 0.9) 50%, rgba(22, 33, 62, 0.9) 100%)';
                    elements.navbar.style.backdropFilter = 'blur(25px) saturate(130%)';
                    elements.navbar.style.borderColor = 'rgba(135, 206, 235, 0.2)';
                }

                updateScrollProgress();
                updateActiveNavLink();
                navbarUpdateScheduled = false;
            });
        }
    }, { passive: true });

    // Scroll progress indicator
    function updateScrollProgress() {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        scrollProgress = (winScroll / height) * 100;
    }

    // Optimized active navigation link update with intersection observer
    const sections = document.querySelectorAll('section[id]');
    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
                const sectionId = entry.target.getAttribute('id');
                const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
                
                // Remove active class from all links
                elements.navLinks.forEach(link => link.classList.remove('active'));
                
                // Add active class to current link
                if (navLink) navLink.classList.add('active');
            }
        });
    }, { threshold: 0.5 });

    // Observe all sections
    sections.forEach(section => navObserver.observe(section));
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
    // High-performance intersection observer for scroll animations
    const observerOptions = {
        threshold: [0.1, 0.5],
        rootMargin: '0px 0px -50px 0px'
    };

    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                // Unobserve after animation to improve performance
                scrollObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements for animation with better performance
    const animateElements = document.querySelectorAll('.section-header, .gallery-item, .tech-category, .story-block');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        scrollObserver.observe(el);
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

    // Optimized parallax effect with performance throttling
    let parallaxScheduled = false;
    const parallaxElements = document.querySelectorAll('.hero-bg');
    
    if (parallaxElements.length > 0) {
        window.addEventListener('scroll', () => {
            if (!parallaxScheduled) {
                parallaxScheduled = true;
                performanceOptimizer.scheduleUpdate(() => {
                    const scrolled = window.pageYOffset;
                    
                    parallaxElements.forEach(element => {
                        const speed = 0.5;
                        element.style.transform = `translate3d(0, ${scrolled * speed}px, 0)`;
                    });
                    
                    parallaxScheduled = false;
                });
            }
        }, { passive: true });
    }
}

// ===== GALLERY FILTER =====
function initializeGalleryFilter() {
    if (!elements.filterBtns || !elements.galleryItems) return;

    // Use DocumentFragment for better performance
    elements.filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filterValue = btn.getAttribute('data-filter');

            // Update active button
            elements.filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Optimized filter with requestAnimationFrame
            performanceOptimizer.scheduleUpdate(() => {
                filterGalleryItems(filterValue);
            });
        });
    });
}

function filterGalleryItems(filterValue) {
    elements.galleryItems.forEach((item, index) => {
        const category = item.getAttribute('data-category');
        const shouldShow = filterValue === 'all' || category === filterValue;
        
        if (shouldShow) {
            item.style.display = 'block';
            item.style.opacity = '0';
            item.style.transform = 'scale(0.8)';
            
            // Stagger animations for better visual appeal
            setTimeout(() => {
                item.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                item.style.opacity = '1';
                item.style.transform = 'scale(1)';
            }, index * 50); // Reduced delay for faster animations
        } else {
            item.style.transition = 'all 0.4s ease';
            item.style.opacity = '0';
            item.style.transform = 'scale(0.8)';
            
            setTimeout(() => {
                item.style.display = 'none';
            }, 400);
        }
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

// ===== FEATURED ART FUNCTIONS =====

// Show preview message function
function showPreviewMessage(artName) {
    showNotification(`This is a preview of "${artName}". To purchase the full high-resolution version, use the Buy Now button below.`);
}

// WhatsApp buy function
function buyArt(artName) {
    const phoneNumber = '2348023088491'; // Updated WhatsApp number
    const message = `Hi! I'm interested in buying "${artName}". Could you please provide more details about pricing and high-resolution files?`;
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
}

// Image protection - Disable right-click on art images
document.addEventListener('DOMContentLoaded', function() {
    const artImages = document.querySelectorAll('.art-image');
    
    artImages.forEach(img => {
        img.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            showNotification('Image download is not allowed. Please use the Buy Now button to purchase.');
        });
        
        img.addEventListener('dragstart', function(e) {
            e.preventDefault();
        });
    });
});

// Show notification function
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'download-notification';
    notification.textContent = message;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        z-index: 10001;
        font-weight: 500;
        box-shadow: 0 10px 25px rgba(37, 211, 102, 0.3);
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Animate out and remove
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// ===== ANIMATED STAT COUNTERS =====
function initializeStatCounters() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    const animateCounter = (element, target) => {
        let current = 0;
        const increment = target / 50; // Animation duration control
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            
            // Format number display
            if (target >= 1000) {
                element.textContent = Math.floor(current / 1000) + 'K+';
            } else {
                element.textContent = Math.floor(current) + '+';
            }
        }, 50);
    };
    
    // Intersection Observer for triggering animation
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const target = parseInt(element.dataset.target);
                animateCounter(element, target);
                observer.unobserve(element); // Only animate once
            }
        });
    }, {
        threshold: 0.5
    });
    
    // Observe all stat numbers
    statNumbers.forEach(stat => {
        observer.observe(stat);
    });
}

// ===== SUBSCRIBE SECTION =====
function initializeSubscribeSection() {
    if (!elements.subscribeForm) return;
    
    // Animate subscriber count on load
    animateSubscriberCount();
    
    // Handle form submission
    elements.subscribeForm.addEventListener('submit', handleSubscribeSubmit);
    
    // Orbital icon animation
    initializeOrbitalAnimation();
}

function animateSubscriberCount() {
    const countElement = document.querySelector('.count-number');
    if (!countElement) return;
    
    const target = parseInt(countElement.dataset.target) || 250;
    let current = 0;
    const increment = target / 100;
    
    const counter = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(counter);
        }
        countElement.textContent = Math.floor(current);
    }, 20);
}

function handleSubscribeSubmit(e) {
    e.preventDefault();
    
    const email = elements.subscribeEmail.value;
    const submitBtn = elements.subscribeForm.querySelector('.subscribe-btn');
    const originalText = submitBtn.querySelector('span').textContent;
    
    // Basic email validation
    if (!isValidEmail(email)) {
        showSubscribeMessage('Please enter a valid email address', 'error');
        return;
    }
    
    // Update button state
    submitBtn.querySelector('span').textContent = 'Subscribing...';
    submitBtn.style.opacity = '0.7';
    submitBtn.disabled = true;
    
    // Simulate subscription process
    setTimeout(() => {
        showSubscribeMessage('Thank you for subscribing! 🎨', 'success');
        elements.subscribeEmail.value = '';
        
        // Reset button
        submitBtn.querySelector('span').textContent = originalText;
        submitBtn.style.opacity = '1';
        submitBtn.disabled = false;
        
        // Update subscriber count
        updateSubscriberCount();
    }, 1500);
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showSubscribeMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `subscribe-message ${type}`;
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? 'rgba(46, 204, 113, 0.9)' : 'rgba(231, 76, 60, 0.9)'};
        color: white;
        border-radius: 10px;
        font-weight: 500;
        z-index: 10000;
        backdrop-filter: blur(10px);
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(messageDiv);
    setTimeout(() => {
        messageDiv.remove();
    }, 4000);
}

function updateSubscriberCount() {
    const countElement = document.querySelector('.count-number');
    if (countElement) {
        const current = parseInt(countElement.textContent);
        countElement.textContent = current + 1;
    }
}

function initializeOrbitalAnimation() {
    const orbitIcons = document.querySelectorAll('.orbit-icon');
    orbitIcons.forEach((icon, index) => {
        icon.style.animationDelay = `${index * 2}s`;
    });
}

// ===== PERFORMANCE MONITORING =====
function initializePerformanceMonitoring() {
    // Performance monitor (Ctrl+P to toggle)
    let performanceMonitor = null;
    let isMonitorVisible = false;
    
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'p') {
            e.preventDefault();
            togglePerformanceMonitor();
        }
    });
    
    function togglePerformanceMonitor() {
        if (isMonitorVisible) {
            hidePerformanceMonitor();
        } else {
            showPerformanceMonitor();
        }
    }
    
    function showPerformanceMonitor() {
        if (performanceMonitor) return;
        
        performanceMonitor = document.createElement('div');
        performanceMonitor.id = 'performance-monitor';
        performanceMonitor.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            background: rgba(0, 0, 0, 0.8);
            color: #00ff00;
            padding: 1rem;
            border-radius: 10px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            z-index: 10000;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(135, 206, 235, 0.3);
        `;
        
        document.body.appendChild(performanceMonitor);
        updatePerformanceStats();
        isMonitorVisible = true;
    }
    
    function hidePerformanceMonitor() {
        if (performanceMonitor) {
            performanceMonitor.remove();
            performanceMonitor = null;
            isMonitorVisible = false;
        }
    }
    
    function updatePerformanceStats() {
        if (!performanceMonitor) return;
        
        const stats = {
            fps: Math.round(1000 / 16), // Approximate
            memory: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : 'N/A',
            scrollEvents: 'Throttled (16ms)',
            animations: 'GPU Accelerated'
        };
        
        performanceMonitor.innerHTML = `
            <div>🚀 Performance Monitor</div>
            <div>FPS: ~${stats.fps}</div>
            <div>Memory: ${stats.memory}MB</div>
            <div>Scroll: ${stats.scrollEvents}</div>
            <div>Animations: ${stats.animations}</div>
            <div style="margin-top: 8px; opacity: 0.7;">Press Ctrl+P to hide</div>
        `;
        
        if (isMonitorVisible) {
            setTimeout(updatePerformanceStats, 1000);
        }
    }
}

// ===== THROTTLED SCROLL EFFECTS =====
function initializeScrollEffects() {
    // High-performance intersection observer for scroll animations
    const observerOptions = {
        threshold: [0.1, 0.5],
        rootMargin: '0px 0px -50px 0px'
    };

    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                // Unobserve after animation to improve performance
                scrollObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements for animation with better performance
    const animateElements = document.querySelectorAll('.section-header, .gallery-item, .tech-category, .story-block');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        scrollObserver.observe(el);
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

    // Optimized parallax effect with performance throttling
    let parallaxScheduled = false;
    const parallaxElements = document.querySelectorAll('.hero-bg');
    
    if (parallaxElements.length > 0) {
        window.addEventListener('scroll', () => {
            if (!parallaxScheduled) {
                parallaxScheduled = true;
                performanceOptimizer.scheduleUpdate(() => {
                    const scrolled = window.pageYOffset;
                    
                    parallaxElements.forEach(element => {
                        const speed = 0.5;
                        element.style.transform = `translate3d(0, ${scrolled * speed}px, 0)`;
                    });
                    
                    parallaxScheduled = false;
                });
            }
        }, { passive: true });
    }
}

// Centralized scroll handler for maximum performance
function handleThrottledScroll() {
    const now = Date.now();
    if (now - lastScrollTime < scrollThrottle) return;
    
    lastScrollTime = now;
    
    // Mark scrolling state
    isScrolling = true;
    clearTimeout(scrollEndTimer);
    
    performanceOptimizer.scheduleUpdate(() => {
        handleNavbarScroll();
        handleParallaxScroll();
        
        // Reset scrolling state after delay
        scrollEndTimer = setTimeout(() => {
            isScrolling = false;
        }, 150);
    });
}

function handleNavbarScroll() {
    if (!elements.navbar) return;
    
    const scrolled = window.pageYOffset > 50;
    elements.navbar.classList.toggle('scrolled', scrolled);
}

function handleParallaxScroll() {
    // Only update if currently visible and scrolling
    if (!isScrolling) return;
    
    const scrolled = window.pageYOffset;
    const rate = scrolled * -0.3; // Reduced parallax intensity for better performance
    
    // Apply parallax to hero background only if in viewport
    const heroCanvas = document.getElementById('hero-canvas');
    if (heroCanvas && scrolled < window.innerHeight * 2) {
        heroCanvas.style.transform = `translate3d(0, ${rate}px, 0)`;
    }
}

// Initialize optimized parallax elements
function initializeParallaxElements(elements) {
    elements.forEach(element => {
        const speed = element.dataset.parallax || 0.5;
        // Use transform3d for hardware acceleration
        element.style.transform = `translate3d(0, 0, 0)`;
        element.style.willChange = 'transform';
        element.style.backfaceVisibility = 'hidden';
    });
}

// Scroll to top function for footer button
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Make scrollToTop globally available
window.scrollToTop = scrollToTop;
