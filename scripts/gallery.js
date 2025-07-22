// ===== GALLERY.JS - Enhanced gallery functionality =====

class GalleryManager {
    constructor() {
        this.currentFilter = 'all';
        this.lightbox = null;
        this.galleryItems = [];
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        
        this.setupGalleryItems();
        this.createLightbox();
        this.setupFilterButtons();
        this.setupItemClickHandlers();
        this.setupKeyboardNavigation();
        
        this.initialized = true;
    }

    setupGalleryItems() {
        this.galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
        
        this.galleryItems.forEach((item, index) => {
            item.dataset.index = index;
            
            // Add loading state
            item.classList.add('loading');
            
            // Simulate loading time
            setTimeout(() => {
                item.classList.remove('loading');
                item.classList.add('loaded');
            }, Math.random() * 1000 + 500);

            // Add hover effects
            this.setupItemHoverEffects(item);
        });
    }

    setupItemHoverEffects(item) {
        const canvas = item.querySelector('.art-canvas');
        let isHovered = false;

        item.addEventListener('mouseenter', () => {
            isHovered = true;
            item.classList.add('hovered');
            
            // Enhance canvas animation on hover
            if (canvas) {
                canvas.style.filter = 'brightness(1.2) saturate(1.3)';
                canvas.style.transform = 'scale(1.05)';
            }
        });

        item.addEventListener('mouseleave', () => {
            isHovered = false;
            item.classList.remove('hovered');
            
            if (canvas) {
                canvas.style.filter = '';
                canvas.style.transform = '';
            }
        });

        // Add tilt effect
        item.addEventListener('mousemove', (e) => {
            if (!isHovered) return;
            
            const rect = item.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / centerY * -10;
            const rotateY = (x - centerX) / centerX * 10;
            
            item.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(20px)`;
        });

        item.addEventListener('mouseleave', () => {
            item.style.transform = '';
        });
    }

    setupFilterButtons() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const filter = btn.dataset.filter;
                this.filterGallery(filter);
                this.updateActiveFilter(btn);
            });
        });
    }

    filterGallery(filter) {
        this.currentFilter = filter;
        
        this.galleryItems.forEach((item, index) => {
            const category = item.dataset.category;
            const shouldShow = filter === 'all' || category === filter;
            
            if (shouldShow) {
                this.showItem(item, index);
            } else {
                this.hideItem(item);
            }
        });

        // Update URL hash
        if (filter !== 'all') {
            history.replaceState(null, null, `#gallery-${filter}`);
        } else {
            history.replaceState(null, null, '#gallery');
        }
    }

    showItem(item, index) {
        item.style.display = 'block';
        item.style.opacity = '0';
        item.style.transform = 'translateY(30px) scale(0.9)';
        
        setTimeout(() => {
            item.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            item.style.opacity = '1';
            item.style.transform = 'translateY(0) scale(1)';
        }, index * 100);
    }

    hideItem(item) {
        item.style.transition = 'all 0.4s ease';
        item.style.opacity = '0';
        item.style.transform = 'translateY(-20px) scale(0.8)';
        
        setTimeout(() => {
            item.style.display = 'none';
        }, 400);
    }

    updateActiveFilter(activeBtn) {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        activeBtn.classList.add('active');
    }

    setupItemClickHandlers() {
        this.galleryItems.forEach(item => {
            const viewBtn = item.querySelector('.view-btn');
            
            if (viewBtn) {
                viewBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.openLightbox(item);
                });
            }

            item.addEventListener('click', () => {
                this.openLightbox(item);
            });
        });
    }

    createLightbox() {
        this.lightbox = document.createElement('div');
        this.lightbox.className = 'gallery-lightbox';
        this.lightbox.innerHTML = `
            <div class="lightbox-overlay"></div>
            <div class="lightbox-content">
                <button class="lightbox-close">
                    <i class="fas fa-times"></i>
                </button>
                <button class="lightbox-prev">
                    <i class="fas fa-chevron-left"></i>
                </button>
                <button class="lightbox-next">
                    <i class="fas fa-chevron-right"></i>
                </button>
                <div class="lightbox-main">
                    <div class="lightbox-canvas-container">
                        <canvas class="lightbox-canvas"></canvas>
                    </div>
                    <div class="lightbox-info">
                        <h2 class="lightbox-title"></h2>
                        <p class="lightbox-category"></p>
                        <div class="lightbox-description">
                            <p>This is an interactive digital art piece created using advanced web technologies and mathematical algorithms.</p>
                            <div class="lightbox-tech">
                                <h4>Technologies Used:</h4>
                                <div class="tech-tags">
                                    <span class="tech-tag">HTML5 Canvas</span>
                                    <span class="tech-tag">JavaScript</span>
                                    <span class="tech-tag">Mathematical Art</span>
                                </div>
                            </div>
                        </div>
                        <div class="lightbox-actions">
                            <button class="action-btn save-btn">
                                <i class="fas fa-download"></i>
                                Save Image
                            </button>
                            <button class="action-btn share-btn">
                                <i class="fas fa-share"></i>
                                Share
                            </button>
                            <button class="action-btn fullscreen-btn">
                                <i class="fas fa-expand"></i>
                                Fullscreen
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(this.lightbox);
        this.setupLightboxEvents();
    }

    setupLightboxEvents() {
        const overlay = this.lightbox.querySelector('.lightbox-overlay');
        const closeBtn = this.lightbox.querySelector('.lightbox-close');
        const prevBtn = this.lightbox.querySelector('.lightbox-prev');
        const nextBtn = this.lightbox.querySelector('.lightbox-next');
        const saveBtn = this.lightbox.querySelector('.save-btn');
        const shareBtn = this.lightbox.querySelector('.share-btn');
        const fullscreenBtn = this.lightbox.querySelector('.fullscreen-btn');

        // Close lightbox
        [overlay, closeBtn].forEach(el => {
            el.addEventListener('click', () => this.closeLightbox());
        });

        // Navigation
        prevBtn.addEventListener('click', () => this.navigateLightbox(-1));
        nextBtn.addEventListener('click', () => this.navigateLightbox(1));

        // Actions
        saveBtn.addEventListener('click', () => this.saveCurrentImage());
        shareBtn.addEventListener('click', () => this.shareCurrentImage());
        fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());

        // Prevent closing when clicking on content
        this.lightbox.querySelector('.lightbox-content').addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    openLightbox(item) {
        this.currentLightboxIndex = parseInt(item.dataset.index);
        this.updateLightboxContent(item);
        
        this.lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Animate in
        setTimeout(() => {
            this.lightbox.classList.add('visible');
        }, 50);
    }

    closeLightbox() {
        this.lightbox.classList.remove('visible');
        
        setTimeout(() => {
            this.lightbox.classList.remove('active');
            document.body.style.overflow = '';
        }, 300);
    }

    updateLightboxContent(item) {
        const title = item.querySelector('.item-overlay h3').textContent;
        const category = item.querySelector('.item-overlay p').textContent;
        const canvas = item.querySelector('.art-canvas');

        // Update text content
        this.lightbox.querySelector('.lightbox-title').textContent = title;
        this.lightbox.querySelector('.lightbox-category').textContent = category;

        // Clone and setup canvas
        const lightboxCanvas = this.lightbox.querySelector('.lightbox-canvas');
        const canvasContainer = this.lightbox.querySelector('.lightbox-canvas-container');
        
        // Copy canvas content
        if (canvas) {
            lightboxCanvas.width = 800;
            lightboxCanvas.height = 600;
            const lightboxCtx = lightboxCanvas.getContext('2d');
            lightboxCtx.drawImage(canvas, 0, 0, lightboxCanvas.width, lightboxCanvas.height);
        }

        // Update tech tags based on art type
        const artType = canvas?.dataset.art || 'particles';
        this.updateTechTags(artType);
    }

    updateTechTags(artType) {
        const techTagsContainer = this.lightbox.querySelector('.tech-tags');
        const tagMap = {
            fractal: ['HTML5 Canvas', 'Recursive Algorithms', 'Mathematical Art'],
            particles: ['Particle Physics', 'Interactive Canvas', 'Mouse Tracking'],
            waves: ['Sine Waves', 'Audio Visualization', 'Mathematical Functions'],
            noise: ['Perlin Noise', 'Procedural Generation', 'Image Processing'],
            mandala: ['Geometric Patterns', 'Rotational Symmetry', 'Sacred Geometry']
        };

        const tags = tagMap[artType] || ['HTML5 Canvas', 'JavaScript', 'Digital Art'];
        
        techTagsContainer.innerHTML = tags.map(tag => 
            `<span class="tech-tag">${tag}</span>`
        ).join('');
    }

    navigateLightbox(direction) {
        const visibleItems = this.galleryItems.filter(item => 
            item.style.display !== 'none' && item.offsetParent !== null
        );
        
        const currentVisibleIndex = visibleItems.findIndex(item => 
            parseInt(item.dataset.index) === this.currentLightboxIndex
        );
        
        let newIndex = currentVisibleIndex + direction;
        
        if (newIndex < 0) newIndex = visibleItems.length - 1;
        if (newIndex >= visibleItems.length) newIndex = 0;
        
        const newItem = visibleItems[newIndex];
        this.currentLightboxIndex = parseInt(newItem.dataset.index);
        this.updateLightboxContent(newItem);
    }

    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (!this.lightbox.classList.contains('active')) return;

            switch (e.key) {
                case 'Escape':
                    this.closeLightbox();
                    break;
                case 'ArrowLeft':
                    this.navigateLightbox(-1);
                    break;
                case 'ArrowRight':
                    this.navigateLightbox(1);
                    break;
            }
        });
    }

    saveCurrentImage() {
        const canvas = this.lightbox.querySelector('.lightbox-canvas');
        const title = this.lightbox.querySelector('.lightbox-title').textContent;
        
        // Create download link
        const link = document.createElement('a');
        link.download = `dats-art-${title.toLowerCase().replace(/\s+/g, '-')}.png`;
        link.href = canvas.toDataURL();
        link.click();

        // Show notification
        this.showNotification('Image saved successfully!', 'success');
    }

    shareCurrentImage() {
        const title = this.lightbox.querySelector('.lightbox-title').textContent;
        const url = window.location.href;
        
        if (navigator.share) {
            navigator.share({
                title: `${title} - Dat's Art`,
                text: 'Check out this amazing digital art piece!',
                url: url
            });
        } else {
            // Fallback - copy URL to clipboard
            navigator.clipboard.writeText(url).then(() => {
                this.showNotification('Link copied to clipboard!', 'info');
            });
        }
    }

    toggleFullscreen() {
        const canvasContainer = this.lightbox.querySelector('.lightbox-canvas-container');
        
        if (!document.fullscreenElement) {
            canvasContainer.requestFullscreen().then(() => {
                canvasContainer.classList.add('fullscreen');
            });
        } else {
            document.exitFullscreen().then(() => {
                canvasContainer.classList.remove('fullscreen');
            });
        }
    }

    showNotification(message, type = 'info') {
        // Use the notification function from main.js
        if (typeof showNotification === 'function') {
            showNotification(message, type);
        }
    }

    // Auto-filter based on URL hash
    checkUrlHash() {
        const hash = window.location.hash;
        if (hash.startsWith('#gallery-')) {
            const filter = hash.replace('#gallery-', '');
            const filterBtn = document.querySelector(`[data-filter="${filter}"]`);
            if (filterBtn) {
                filterBtn.click();
            }
        }
    }
}

// ===== INFINITE SCROLL =====
class InfiniteScroll {
    constructor(gallery) {
        this.gallery = gallery;
        this.isLoading = false;
        this.page = 1;
        this.hasMore = true;
    }

    init() {
        this.setupScrollListener();
    }

    setupScrollListener() {
        window.addEventListener('scroll', throttle(() => {
            if (this.shouldLoadMore()) {
                this.loadMore();
            }
        }, 250));
    }

    shouldLoadMore() {
        if (this.isLoading || !this.hasMore) return false;
        
        const scrollTop = window.pageYOffset;
        const windowHeight = window.innerHeight;
        const docHeight = document.documentElement.offsetHeight;
        
        return scrollTop + windowHeight >= docHeight - 1000;
    }

    async loadMore() {
        this.isLoading = true;
        this.showLoadingIndicator();
        
        try {
            const newItems = await this.fetchMoreItems();
            this.appendItems(newItems);
            this.page++;
        } catch (error) {
            console.error('Failed to load more items:', error);
        } finally {
            this.isLoading = false;
            this.hideLoadingIndicator();
        }
    }

    async fetchMoreItems() {
        // Simulate API call - replace with actual implementation
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(this.generateMockItems(6));
            }, 1000);
        });
    }

    generateMockItems(count) {
        const categories = ['generative', 'interactive', 'ai', 'web'];
        const artTypes = ['fractal', 'particles', 'waves', 'noise', 'mandala'];
        const items = [];

        for (let i = 0; i < count; i++) {
            const category = categories[Math.floor(Math.random() * categories.length)];
            const artType = artTypes[Math.floor(Math.random() * artTypes.length)];
            
            items.push({
                title: `Generated Art ${this.page * 6 + i + 1}`,
                category: category,
                artType: artType,
                description: `${category} art piece`
            });
        }

        return items;
    }

    appendItems(items) {
        const galleryGrid = document.querySelector('.gallery-grid');
        
        items.forEach((item, index) => {
            const itemElement = this.createGalleryItem(item, this.gallery.galleryItems.length + index);
            galleryGrid.appendChild(itemElement);
            
            // Add to gallery manager
            this.gallery.galleryItems.push(itemElement);
            this.gallery.setupItemHoverEffects(itemElement);
        });
    }

    createGalleryItem(item, index) {
        const itemElement = document.createElement('div');
        itemElement.className = 'gallery-item';
        itemElement.dataset.category = item.category;
        itemElement.dataset.index = index;
        
        itemElement.innerHTML = `
            <div class="item-image">
                <canvas class="art-canvas" data-art="${item.artType}"></canvas>
            </div>
            <div class="item-overlay">
                <h3>${item.title}</h3>
                <p>${item.description}</p>
                <button class="view-btn">View Details</button>
            </div>
        `;

        // Initialize canvas animation
        const canvas = itemElement.querySelector('.art-canvas');
        // This would be handled by the animation manager
        
        return itemElement;
    }

    showLoadingIndicator() {
        let indicator = document.querySelector('.loading-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.className = 'loading-indicator';
            indicator.innerHTML = `
                <div class="loading-spinner"></div>
                <p>Loading more art pieces...</p>
            `;
            
            const gallerySection = document.querySelector('.gallery');
            gallerySection.appendChild(indicator);
        }
        indicator.style.display = 'block';
    }

    hideLoadingIndicator() {
        const indicator = document.querySelector('.loading-indicator');
        if (indicator) {
            indicator.style.display = 'none';
        }
    }
}

// ===== MASONRY LAYOUT =====
class MasonryLayout {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            itemSelector: '.gallery-item',
            columnWidth: 350,
            gutter: 20,
            ...options
        };
        this.columns = [];
        this.columnCount = 0;
    }

    init() {
        this.calculateColumns();
        this.setupColumns();
        this.layoutItems();
        this.setupResizeHandler();
    }

    calculateColumns() {
        const containerWidth = this.container.offsetWidth;
        this.columnCount = Math.floor(containerWidth / (this.options.columnWidth + this.options.gutter));
        this.columnCount = Math.max(this.columnCount, 1);
    }

    setupColumns() {
        this.columns = new Array(this.columnCount).fill(0);
    }

    layoutItems() {
        const items = this.container.querySelectorAll(this.options.itemSelector);
        
        items.forEach((item, index) => {
            const columnIndex = this.getShortestColumn();
            const x = columnIndex * (this.options.columnWidth + this.options.gutter);
            const y = this.columns[columnIndex];
            
            item.style.position = 'absolute';
            item.style.left = x + 'px';
            item.style.top = y + 'px';
            item.style.width = this.options.columnWidth + 'px';
            
            // Update column height
            this.columns[columnIndex] += item.offsetHeight + this.options.gutter;
        });
        
        // Set container height
        const maxHeight = Math.max(...this.columns);
        this.container.style.height = maxHeight + 'px';
        this.container.style.position = 'relative';
    }

    getShortestColumn() {
        let shortestIndex = 0;
        let shortestHeight = this.columns[0];
        
        for (let i = 1; i < this.columns.length; i++) {
            if (this.columns[i] < shortestHeight) {
                shortestHeight = this.columns[i];
                shortestIndex = i;
            }
        }
        
        return shortestIndex;
    }

    setupResizeHandler() {
        window.addEventListener('resize', debounce(() => {
            this.calculateColumns();
            this.setupColumns();
            this.layoutItems();
        }, 250));
    }
}

// ===== ADD LIGHTBOX STYLES =====
function addLightboxStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .gallery-lightbox {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            z-index: 9999;
            display: none;
            opacity: 0;
            transition: opacity 0.3s ease;
        }

        .gallery-lightbox.active {
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .gallery-lightbox.visible {
            opacity: 1;
        }

        .lightbox-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            backdrop-filter: blur(10px);
        }

        .lightbox-content {
            position: relative;
            width: 90%;
            max-width: 1200px;
            height: 90%;
            background: rgba(26, 26, 46, 0.9);
            border-radius: 15px;
            border: 1px solid rgba(0, 255, 255, 0.2);
            padding: 2rem;
            transform: scale(0.8);
            transition: transform 0.3s ease;
        }

        .gallery-lightbox.visible .lightbox-content {
            transform: scale(1);
        }

        .lightbox-close {
            position: absolute;
            top: 1rem;
            right: 1rem;
            background: rgba(255, 0, 128, 0.2);
            border: 2px solid #ff0080;
            color: #ff0080;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s ease;
            z-index: 10;
        }

        .lightbox-close:hover {
            background: rgba(255, 0, 128, 0.3);
            box-shadow: 0 0 20px rgba(255, 0, 128, 0.5);
        }

        .lightbox-prev, .lightbox-next {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            background: rgba(0, 255, 255, 0.2);
            border: 2px solid #00ffff;
            color: #00ffff;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 1.2rem;
        }

        .lightbox-prev {
            left: 1rem;
        }

        .lightbox-next {
            right: 1rem;
        }

        .lightbox-prev:hover, .lightbox-next:hover {
            background: rgba(0, 255, 255, 0.3);
            box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
        }

        .lightbox-main {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 2rem;
            height: 100%;
        }

        .lightbox-canvas-container {
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 10px;
            border: 1px solid rgba(0, 255, 255, 0.1);
        }

        .lightbox-canvas {
            max-width: 100%;
            max-height: 100%;
            border-radius: 8px;
        }

        .lightbox-info {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
        }

        .lightbox-title {
            font-family: 'Orbitron', monospace;
            font-size: 2rem;
            color: #00ffff;
            margin: 0;
        }

        .lightbox-category {
            color: rgba(255, 255, 255, 0.7);
            font-size: 1.1rem;
            margin: 0;
        }

        .lightbox-description {
            color: rgba(255, 255, 255, 0.8);
            line-height: 1.6;
        }

        .lightbox-tech h4 {
            color: #ffffff;
            margin: 1rem 0 0.5rem 0;
        }

        .tech-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
        }

        .tech-tag {
            background: rgba(0, 255, 255, 0.1);
            border: 1px solid rgba(0, 255, 255, 0.3);
            color: #00ffff;
            padding: 0.3rem 0.8rem;
            border-radius: 15px;
            font-size: 0.9rem;
        }

        .lightbox-actions {
            display: flex;
            gap: 1rem;
            margin-top: auto;
            flex-wrap: wrap;
        }

        .action-btn {
            background: linear-gradient(135deg, #00ffff, #ff0080);
            color: #000000;
            border: none;
            padding: 0.8rem 1.5rem;
            border-radius: 25px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.9rem;
        }

        .action-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0, 255, 255, 0.3);
        }

        .loading-indicator {
            text-align: center;
            padding: 3rem;
            color: rgba(255, 255, 255, 0.7);
        }

        .loading-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(0, 255, 255, 0.3);
            border-top: 3px solid #00ffff;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 1rem;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
            .lightbox-content {
                width: 95%;
                height: 95%;
                padding: 1rem;
            }

            .lightbox-main {
                grid-template-columns: 1fr;
                gap: 1rem;
            }

            .lightbox-title {
                font-size: 1.5rem;
            }

            .lightbox-actions {
                justify-content: center;
            }

            .action-btn {
                flex: 1;
                min-width: 120px;
            }
        }
    `;
    document.head.appendChild(style);
}

// ===== INITIALIZE GALLERY =====
document.addEventListener('DOMContentLoaded', function() {
    const galleryManager = new GalleryManager();
    
    setTimeout(() => {
        galleryManager.init();
        addLightboxStyles();
        
        // Initialize infinite scroll if needed
        // const infiniteScroll = new InfiniteScroll(galleryManager);
        // infiniteScroll.init();
        
        // Check URL hash on load
        galleryManager.checkUrlHash();
        
        // Listen for hash changes
        window.addEventListener('hashchange', () => {
            galleryManager.checkUrlHash();
        });
        
        // Make gallery manager globally accessible
        window.galleryManager = galleryManager;
    }, 500);
});
