// Optimized Scroll Animations - Lightweight Version
class OptimizedScrollAnimations {
    constructor() {
        this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.isInitialized = false;
        this.observer = null;

        // Only initialize if not reduced motion and not already handled by main.js
        if (!this.isReducedMotion && !window.mainScrollHandlerExists) {
            this.init();
        }
    }

    init() {
        if (this.isInitialized) return;

        this.setupIntersectionObserver();
        this.setupInitialStates();
        this.isInitialized = true;

        // Mark that scroll animations are handled
        window.scrollAnimationsActive = true;
    }

    setupIntersectionObserver() {
        // Single intersection observer for all scroll animations
        const options = {
            threshold: [0.1, 0.3, 0.5],
            rootMargin: '0px 0px -20px 0px'
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.intersectionRatio >= 0.1) {
                    this.activateElement(entry.target);
                    // Unobserve after activation for better performance
                    this.observer.unobserve(entry.target);
                }
            });
        }, options);
    }

    setupInitialStates() {
        // Setup elements with lightweight approach
        const elements = document.querySelectorAll('.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-scale');

        elements.forEach((element, _index) => {
            // Set initial state
            element.style.opacity = '0';
            element.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';

            // Different initial transforms based on class
            if (element.classList.contains('scroll-reveal-left')) {
                element.style.transform = 'translateX(-30px)';
            } else if (element.classList.contains('scroll-reveal-right')) {
                element.style.transform = 'translateX(30px)';
            } else if (element.classList.contains('scroll-scale')) {
                element.style.transform = 'scale(0.9)';
            } else {
                element.style.transform = 'translateY(20px)';
            }

            // Observe element
            this.observer.observe(element);
        });

        // Handle stagger containers separately
        this.setupStaggerContainers();
    }

    setupStaggerContainers() {
        const staggerContainers = document.querySelectorAll('.stagger-container');

        staggerContainers.forEach((container, index) => {
            const children = Array.from(container.children);

            children.forEach((child, _childIndex) => {
                child.style.opacity = '0';
                child.style.transform = 'translateY(15px)';
                child.style.transition = `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.1}s`;
            });

            // Observe container
            this.observer.observe(container);
        });
    }

    activateElement(element) {
        if (element.classList.contains('stagger-container')) {
            // Activate all children
            const children = Array.from(element.children);
            children.forEach(child => {
                child.style.opacity = '1';
                child.style.transform = 'translateY(0)';
            });
        } else {
            // Activate single element
            element.style.opacity = '1';
            element.style.transform = 'translateY(0) translateX(0) scale(1)';
            element.classList.add('scroll-revealed');
        }
    }

    destroy() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
        this.isInitialized = false;
        window.scrollAnimationsActive = false;
    }
}

// Only initialize if main scroll handler doesn't exist
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit to see if main.js handles scroll animations
    setTimeout(() => {
        if (!window.mainScrollHandlerExists && !window.scrollAnimationsActive) {
            new OptimizedScrollAnimations();
        }
    }, 100);
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.scrollAnimationsInstance) {
        window.scrollAnimationsInstance.destroy();
    }
});
