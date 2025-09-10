// Performance Monitoring Script
class PerformanceMonitor {
    constructor() {
        this.isActive = false;
        this.metrics = {
            fps: 0,
            frameTime: 0,
            scrollEvents: 0,
            animationEvents: 0
        };
        this.lastFrameTime = performance.now();
        this.frameCount = 0;
        this.startTime = performance.now();
    }

    init() {
        // Only initialize in development or when explicitly requested
        this.setupKeyboardShortcut();
        this.trackScrollPerformance();
        this.trackAnimationPerformance();
    }

    setupKeyboardShortcut() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+Shift+P to toggle performance monitor
            if (e.ctrlKey && e.shiftKey && e.key === 'P') {
                e.preventDefault();
                this.toggle();
            }
        });
    }

    toggle() {
        this.isActive = !this.isActive;
        
        if (this.isActive) {
            this.show();
            this.startTracking();
        } else {
            this.hide();
            this.stopTracking();
        }
    }

    show() {
        if (this.monitor) return;

        this.monitor = document.createElement('div');
        this.monitor.id = 'performance-monitor';
        this.monitor.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.9);
            color: #00ff00;
            padding: 15px;
            border-radius: 10px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            z-index: 999999;
            line-height: 1.4;
            min-width: 200px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(0, 255, 0, 0.3);
        `;

        document.body.appendChild(this.monitor);
        this.updateDisplay();
    }

    hide() {
        if (this.monitor) {
            this.monitor.remove();
            this.monitor = null;
        }
    }

    startTracking() {
        this.trackingInterval = setInterval(() => {
            this.calculateFPS();
            this.updateDisplay();
        }, 500);
    }

    stopTracking() {
        if (this.trackingInterval) {
            clearInterval(this.trackingInterval);
        }
    }

    calculateFPS() {
        const now = performance.now();
        const elapsed = now - this.startTime;
        
        if (elapsed >= 1000) {
            this.metrics.fps = Math.round((this.frameCount * 1000) / elapsed);
            this.frameCount = 0;
            this.startTime = now;
        }
        
        this.frameCount++;
        this.metrics.frameTime = now - this.lastFrameTime;
        this.lastFrameTime = now;
    }

    trackScrollPerformance() {
        let scrollStartTime = 0;
        let scrollEventCount = 0;

        window.addEventListener('scroll', () => {
            scrollEventCount++;
            
            if (scrollStartTime === 0) {
                scrollStartTime = performance.now();
            }

            // Reset counter every second
            setTimeout(() => {
                if (performance.now() - scrollStartTime >= 1000) {
                    this.metrics.scrollEvents = scrollEventCount;
                    scrollEventCount = 0;
                    scrollStartTime = 0;
                }
            }, 1000);
        }, { passive: true });
    }

    trackAnimationPerformance() {
        const originalRAF = window.requestAnimationFrame;
        let rafCount = 0;

        window.requestAnimationFrame = function(callback) {
            rafCount++;
            return originalRAF.call(window, callback);
        };

        setInterval(() => {
            this.metrics.animationEvents = rafCount;
            rafCount = 0;
        }, 1000);
    }

    updateDisplay() {
        if (!this.monitor) return;

        const memory = performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : 'N/A';
        const timing = performance.timing;
        const loadTime = timing.loadEventEnd - timing.navigationStart;

        this.monitor.innerHTML = `
            <div style="color: #00ffff; font-weight: bold; margin-bottom: 8px;">⚡ Performance Monitor</div>
            <div>FPS: <span style="color: ${this.getFPSColor()}">${this.metrics.fps}</span></div>
            <div>Frame Time: ${this.metrics.frameTime.toFixed(1)}ms</div>
            <div>Memory: ${memory}MB</div>
            <div>Scroll Events/s: ${this.metrics.scrollEvents}</div>
            <div>RAF Calls/s: ${this.metrics.animationEvents}</div>
            <div>Load Time: ${loadTime}ms</div>
            <div style="margin-top: 8px; opacity: 0.7; font-size: 10px;">
                Ctrl+Shift+P to hide
            </div>
        `;
    }

    getFPSColor() {
        if (this.metrics.fps >= 55) return '#00ff00';      // Green for good FPS
        if (this.metrics.fps >= 30) return '#ffff00';      // Yellow for moderate FPS
        return '#ff4444';                                   // Red for low FPS
    }

    // Static method to get basic performance info
    static getBasicMetrics() {
        const memory = performance.memory ? {
            used: Math.round(performance.memory.usedJSHeapSize / 1048576),
            total: Math.round(performance.memory.totalJSHeapSize / 1048576),
            limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576)
        } : null;

        return {
            memory,
            timing: {
                domReady: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
                loadComplete: performance.timing.loadEventEnd - performance.timing.navigationStart,
                firstPaint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-paint')?.startTime || 0
            },
            resources: performance.getEntriesByType('resource').length
        };
    }

    // Method to log performance warnings
    static checkPerformance() {
        const metrics = PerformanceMonitor.getBasicMetrics();
        
        if (metrics.memory && metrics.memory.used > 100) {
            console.warn(`⚠️ High memory usage: ${metrics.memory.used}MB`);
        }
        
        if (metrics.timing.loadComplete > 5000) {
            console.warn(`⚠️ Slow load time: ${metrics.timing.loadComplete}ms`);
        }
        
        if (metrics.resources > 50) {
            console.warn(`⚠️ Many resources loaded: ${metrics.resources}`);
        }
        
        return metrics;
    }
}

// Auto-initialize performance monitoring
const performanceMonitor = new PerformanceMonitor();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    performanceMonitor.init();
    
    // Log performance metrics in development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        setTimeout(() => {
            const metrics = PerformanceMonitor.checkPerformance();
            console.log('📊 Performance Metrics:', metrics);
        }, 3000);
    }
});

// Export for global access
window.performanceMonitor = performanceMonitor;
window.PerformanceMonitor = PerformanceMonitor;
