// ===== ANIMATIONS.JS - Canvas animations and visual effects =====

// Animation classes and functions
class CanvasAnimation {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width = canvas.offsetWidth;
        this.height = canvas.height = canvas.offsetHeight;
        this.options = { ...this.defaultOptions, ...options };
        this.animationId = null;
        this.isPlaying = false;
        
        this.setupCanvas();
        this.init();
    }
    
    get defaultOptions() {
        return {
            backgroundColor: 'transparent',
            colors: ['#00ffff', '#ff0080', '#00ff80', '#ffffff'],
            speed: 1,
            particleCount: 50
        };
    }
    
    setupCanvas() {
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';
    }
    
    init() {
        // Override in subclasses
    }
    
    start() {
        if (!this.isPlaying) {
            this.isPlaying = true;
            this.animate();
        }
    }
    
    stop() {
        this.isPlaying = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
    
    animate() {
        if (!this.isPlaying) return;
        
        this.clear();
        this.update();
        this.draw();
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }
    
    update() {
        // Override in subclasses
    }
    
    draw() {
        // Override in subclasses
    }
    
    resize() {
        this.width = this.canvas.width = this.canvas.offsetWidth;
        this.height = this.canvas.height = this.canvas.offsetHeight;
    }
}

// ===== HERO BACKGROUND ANIMATION =====
class HeroAnimation extends CanvasAnimation {
    init() {
        this.particles = [];
        this.mouseX = this.width / 2;
        this.mouseY = this.height / 2;
        this.time = 0;
        
        // Create particles
        for (let i = 0; i < this.options.particleCount; i++) {
            this.particles.push(this.createParticle());
        }
        
        // Mouse interaction
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;
        });
    }
    
    createParticle() {
        return {
            x: Math.random() * this.width,
            y: Math.random() * this.height,
            size: Math.random() * 3 + 1,
            speedX: (Math.random() - 0.5) * 0.5,
            speedY: (Math.random() - 0.5) * 0.5,
            color: this.options.colors[Math.floor(Math.random() * this.options.colors.length)],
            alpha: Math.random() * 0.5 + 0.3,
            pulse: Math.random() * Math.PI * 2
        };
    }
    
    update() {
        this.time += 0.01;
        
        this.particles.forEach(particle => {
            // Move particles
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            
            // Mouse attraction
            const dx = this.mouseX - particle.x;
            const dy = this.mouseY - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 100) {
                const force = (100 - distance) / 100;
                particle.x += dx * force * 0.01;
                particle.y += dy * force * 0.01;
            }
            
            // Boundary check
            if (particle.x < 0 || particle.x > this.width) particle.speedX *= -1;
            if (particle.y < 0 || particle.y > this.height) particle.speedY *= -1;
            
            // Keep in bounds
            particle.x = Math.max(0, Math.min(this.width, particle.x));
            particle.y = Math.max(0, Math.min(this.height, particle.y));
            
            // Update pulse
            particle.pulse += 0.02;
        });
    }
    
    draw() {
        // Draw connections
        this.drawConnections();
        
        // Draw particles
        this.particles.forEach(particle => {
            const pulseFactor = Math.sin(particle.pulse) * 0.3 + 0.7;
            
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size * pulseFactor, 0, Math.PI * 2);
            this.ctx.fillStyle = particle.color + Math.floor(particle.alpha * 255).toString(16).padStart(2, '0');
            this.ctx.fill();
            
            // Add glow effect
            this.ctx.shadowColor = particle.color;
            this.ctx.shadowBlur = 10;
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
        });
    }
    
    drawConnections() {
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.strokeStyle = `rgba(0, 255, 255, ${0.2 * (1 - distance / 100)})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.stroke();
                }
            }
        }
    }
}

// ===== FRACTAL ANIMATION =====
class FractalAnimation extends CanvasAnimation {
    init() {
        this.angle = 0;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
    }
    
    update() {
        this.angle += 0.01;
    }
    
    draw() {
        this.drawFractal(this.centerX, this.centerY, 100, 0, 6);
    }
    
    drawFractal(x, y, size, angle, depth) {
        if (depth === 0 || size < 2) return;
        
        const endX = x + Math.cos(angle + this.angle) * size;
        const endY = y + Math.sin(angle + this.angle) * size;
        
        // Draw line
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(endX, endY);
        this.ctx.strokeStyle = `hsl(${(this.angle * 180 / Math.PI + depth * 60) % 360}, 70%, 60%)`;
        this.ctx.lineWidth = depth / 2;
        this.ctx.stroke();
        
        // Recursive calls
        this.drawFractal(endX, endY, size * 0.7, angle - Math.PI / 4, depth - 1);
        this.drawFractal(endX, endY, size * 0.7, angle + Math.PI / 4, depth - 1);
    }
}

// ===== PARTICLE SYSTEM =====
class ParticleSystem extends CanvasAnimation {
    init() {
        this.particles = [];
        this.mouseX = -100;
        this.mouseY = -100;
        
        for (let i = 0; i < 100; i++) {
            this.particles.push(this.createParticle());
        }
        
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;
        });
        
        this.canvas.addEventListener('mouseleave', () => {
            this.mouseX = -100;
            this.mouseY = -100;
        });
    }
    
    createParticle() {
        return {
            x: Math.random() * this.width,
            y: Math.random() * this.height,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            size: Math.random() * 4 + 1,
            color: this.options.colors[Math.floor(Math.random() * this.options.colors.length)],
            life: 1,
            decay: Math.random() * 0.005 + 0.002
        };
    }
    
    update() {
        this.particles.forEach((particle, index) => {
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Mouse interaction
            const dx = this.mouseX - particle.x;
            const dy = this.mouseY - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 50) {
                const force = (50 - distance) / 50;
                particle.vx += dx * force * 0.01;
                particle.vy += dy * force * 0.01;
            }
            
            // Update life
            particle.life -= particle.decay;
            
            // Boundary bounce
            if (particle.x <= 0 || particle.x >= this.width) particle.vx *= -0.8;
            if (particle.y <= 0 || particle.y >= this.height) particle.vy *= -0.8;
            
            // Keep in bounds
            particle.x = Math.max(0, Math.min(this.width, particle.x));
            particle.y = Math.max(0, Math.min(this.height, particle.y));
            
            // Respawn particle
            if (particle.life <= 0) {
                this.particles[index] = this.createParticle();
            }
        });
    }
    
    draw() {
        this.particles.forEach(particle => {
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = particle.color + Math.floor(particle.life * 255).toString(16).padStart(2, '0');
            this.ctx.fill();
        });
    }
}

// ===== WAVE ANIMATION =====
class WaveAnimation extends CanvasAnimation {
    init() {
        this.time = 0;
        this.waves = [];
        
        for (let i = 0; i < 5; i++) {
            this.waves.push({
                amplitude: Math.random() * 50 + 20,
                frequency: Math.random() * 0.02 + 0.01,
                phase: Math.random() * Math.PI * 2,
                speed: Math.random() * 0.05 + 0.02,
                color: this.options.colors[i % this.options.colors.length]
            });
        }
    }
    
    update() {
        this.time += 0.05;
    }
    
    draw() {
        this.waves.forEach((wave, index) => {
            this.ctx.beginPath();
            this.ctx.moveTo(0, this.height / 2);
            
            for (let x = 0; x <= this.width; x += 2) {
                const y = this.height / 2 + Math.sin(x * wave.frequency + this.time * wave.speed + wave.phase) * wave.amplitude;
                this.ctx.lineTo(x, y);
            }
            
            this.ctx.strokeStyle = wave.color + '80';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        });
    }
}

// ===== NOISE ART =====
class NoiseArt extends CanvasAnimation {
    init() {
        this.imageData = this.ctx.createImageData(this.width, this.height);
        this.time = 0;
    }
    
    update() {
        this.time += 0.01;
        this.generateNoise();
    }
    
    generateNoise() {
        const data = this.imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            const x = (i / 4) % this.width;
            const y = Math.floor((i / 4) / this.width);
            
            const noise = this.perlinNoise(x * 0.01, y * 0.01, this.time);
            const value = Math.floor((noise + 1) * 127.5);
            
            data[i] = value * 0.5;     // Red
            data[i + 1] = value;       // Green
            data[i + 2] = value * 1.5; // Blue
            data[i + 3] = 255;         // Alpha
        }
    }
    
    perlinNoise(x, y, z) {
        // Simple noise function - in real implementation, use proper Perlin noise
        return Math.sin(x * 3 + z) * Math.cos(y * 3 + z) * 0.5 + 
               Math.sin(x * 7 + z * 2) * Math.cos(y * 7 + z * 2) * 0.25;
    }
    
    draw() {
        this.ctx.putImageData(this.imageData, 0, 0);
    }
}

// ===== MANDALA GENERATOR =====
class MandalaAnimation extends CanvasAnimation {
    init() {
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
        this.angle = 0;
        this.layers = 8;
    }
    
    update() {
        this.angle += 0.01;
    }
    
    draw() {
        this.ctx.save();
        this.ctx.translate(this.centerX, this.centerY);
        
        for (let layer = 0; layer < this.layers; layer++) {
            const radius = (layer + 1) * 20;
            const points = (layer + 1) * 6;
            
            this.ctx.beginPath();
            for (let i = 0; i <= points; i++) {
                const angle = (i / points) * Math.PI * 2 + this.angle + layer * 0.1;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                
                if (i === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
            }
            
            this.ctx.strokeStyle = this.options.colors[layer % this.options.colors.length] + '80';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        }
        
        this.ctx.restore();
    }
}

// ===== LOADING ANIMATION =====
class LoadingAnimation extends CanvasAnimation {
    init() {
        this.particles = [];
        this.time = 0;
        
        for (let i = 0; i < 50; i++) {
            this.particles.push({
                angle: (i / 50) * Math.PI * 2,
                radius: Math.random() * 50 + 50,
                speed: Math.random() * 0.02 + 0.01,
                size: Math.random() * 3 + 1,
                color: this.options.colors[Math.floor(Math.random() * this.options.colors.length)]
            });
        }
    }
    
    update() {
        this.time += 0.02;
        
        this.particles.forEach(particle => {
            particle.angle += particle.speed;
        });
    }
    
    draw() {
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        
        this.particles.forEach(particle => {
            const x = centerX + Math.cos(particle.angle) * particle.radius;
            const y = centerY + Math.sin(particle.angle) * particle.radius;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = particle.color;
            this.ctx.fill();
            
            // Trail effect
            this.ctx.shadowColor = particle.color;
            this.ctx.shadowBlur = 10;
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
        });
        
        // Central logo placeholder
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, 20, 0, Math.PI * 2);
        this.ctx.fillStyle = '#00ffff';
        this.ctx.fill();
    }
}

// ===== ANIMATION MANAGER =====
class AnimationManager {
    constructor() {
        this.animations = new Map();
        this.initialized = false;
    }
    
    init() {
        if (this.initialized) return;
        
        this.initializeCanvasAnimations();
        this.setupResizeHandler();
        this.initialized = true;
    }
    
    initializeCanvasAnimations() {
        // Hero background
        const heroCanvas = document.getElementById('hero-canvas');
        if (heroCanvas) {
            this.animations.set('hero', new HeroAnimation(heroCanvas, {
                particleCount: 100,
                colors: ['#00ffff', '#ff0080', '#00ff80', '#ffffff']
            }));
        }
        
        // Loading animation
        const loadingCanvas = document.getElementById('loading-canvas');
        if (loadingCanvas) {
            this.animations.set('loading', new LoadingAnimation(loadingCanvas));
        }
        
        // Gallery animations
        this.initializeGalleryAnimations();
        
        // Instagram feed animations
        this.initializeFeedAnimations();
        
        // Start all animations
        this.startAll();
    }
    
    initializeGalleryAnimations() {
        const artCanvases = document.querySelectorAll('.art-canvas');
        
        artCanvases.forEach((canvas, index) => {
            const artType = canvas.getAttribute('data-art');
            let animation;
            
            switch (artType) {
                case 'fractal':
                    animation = new FractalAnimation(canvas);
                    break;
                case 'particles':
                    animation = new ParticleSystem(canvas);
                    break;
                case 'waves':
                    animation = new WaveAnimation(canvas);
                    break;
                case 'noise':
                    animation = new NoiseArt(canvas);
                    break;
                case 'mandala':
                    animation = new MandalaAnimation(canvas);
                    break;
                default:
                    animation = new ParticleSystem(canvas);
            }
            
            this.animations.set(`gallery-${index}`, animation);
        });
    }
    
    initializeFeedAnimations() {
        const feedCanvases = document.querySelectorAll('.feed-canvas');
        const feedTypes = ['spiral', 'grid', 'bloom', 'matrix'];
        
        feedCanvases.forEach((canvas, index) => {
            const artType = canvas.getAttribute('data-art') || feedTypes[index % feedTypes.length];
            let animation;
            
            switch (artType) {
                case 'spiral':
                    animation = new MandalaAnimation(canvas);
                    break;
                case 'grid':
                    animation = new NoiseArt(canvas);
                    break;
                case 'bloom':
                    animation = new FractalAnimation(canvas);
                    break;
                case 'matrix':
                    animation = new ParticleSystem(canvas, { particleCount: 30 });
                    break;
                default:
                    animation = new ParticleSystem(canvas, { particleCount: 20 });
            }
            
            this.animations.set(`feed-${index}`, animation);
        });
    }
    
    setupResizeHandler() {
        window.addEventListener('resize', debounce(() => {
            this.animations.forEach(animation => {
                animation.resize();
            });
        }, 250));
    }
    
    startAll() {
        this.animations.forEach(animation => {
            animation.start();
        });
    }
    
    stopAll() {
        this.animations.forEach(animation => {
            animation.stop();
        });
    }
    
    get(name) {
        return this.animations.get(name);
    }
}

// ===== MORPHING SHAPE ANIMATION =====
function initializeMorphingShape() {
    const morphingShape = document.getElementById('morphing-shape');
    if (!morphingShape) return;
    
    let rotation = 0;
    
    function animateShape() {
        rotation += 0.5;
        morphingShape.style.transform = `rotate(${rotation}deg)`;
        requestAnimationFrame(animateShape);
    }
    
    animateShape();
}

// ===== GLITCH TEXT EFFECTS =====
function initializeGlitchEffects() {
    const glitchElements = document.querySelectorAll('.glitch, .glitch-logo');
    
    glitchElements.forEach(element => {
        let glitchTimeout;
        
        function triggerGlitch() {
            element.style.animation = 'none';
            element.offsetHeight; // Trigger reflow
            element.style.animation = '';
            
            glitchTimeout = setTimeout(triggerGlitch, Math.random() * 5000 + 3000);
        }
        
        // Start random glitching
        triggerGlitch();
        
        // Clean up on page unload
        window.addEventListener('beforeunload', () => {
            clearTimeout(glitchTimeout);
        });
    });
}

// ===== INITIALIZE ALL ANIMATIONS =====
document.addEventListener('DOMContentLoaded', function() {
    const animationManager = new AnimationManager();
    
    // Wait a bit for DOM to be fully ready
    setTimeout(() => {
        animationManager.init();
        initializeMorphingShape();
        initializeGlitchEffects();
    }, 100);
    
    // Make animation manager globally accessible
    window.animationManager = animationManager;
});

// ===== INTERSECTION OBSERVER FOR PERFORMANCE =====
function setupAnimationObserver() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const canvas = entry.target;
            const animationName = canvas.id || canvas.className;
            const animation = window.animationManager?.get(animationName);
            
            if (animation) {
                if (entry.isIntersecting) {
                    animation.start();
                } else {
                    animation.stop();
                }
            }
        });
    }, {
        rootMargin: '50px'
    });
    
    // Observe all canvas elements
    document.querySelectorAll('canvas').forEach(canvas => {
        observer.observe(canvas);
    });
}

// Setup observer when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(setupAnimationObserver, 500);
});
