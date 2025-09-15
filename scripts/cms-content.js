// CMS Content Manager
class CMSContentManager {
    constructor() {
        this.galleryData = [];
        this.featuredData = [];
        this.settings = {};
    }

    // Load all CMS content
    async loadContent() {
        try {
            await Promise.all([
                this.loadGalleryContent(),
                this.loadFeaturedContent(),
                this.loadSettings()
            ]);
            this.renderContent();
        } catch (error) {
            console.error('Error loading CMS content:', error);
            // Fallback to hardcoded content if CMS fails
            this.renderFallbackContent();
        }
    }

    // Load gallery content from API
    async loadGalleryContent() {
        try {
            const response = await fetch('/api/collections?collection=gallery');
            if (response.ok) {
                this.galleryData = await response.json();
            }
        } catch (error) {
            console.warn('Could not load gallery content from API:', error);
            // Fallback to individual file loading
            await this.loadGalleryContentFallback();
        }
    }

    // Fallback method for loading gallery content
    async loadGalleryContentFallback() {
        const galleryFiles = [
            'digital-vision.md',
            'neon-dreams.md', 
            'tech-fusion.md',
            'pixel-paradise.md'
        ];

        for (const file of galleryFiles) {
            try {
                const response = await fetch(`/api/cms-content?collection=gallery&file=${file}`);
                if (response.ok) {
                    const data = await response.json();
                    this.galleryData.push(data);
                }
            } catch (error) {
                console.warn(`Could not load gallery file: ${file}`, error);
            }
        }

        // Sort by order
        this.galleryData.sort((a, b) => (a.order || 0) - (b.order || 0));
    }

    // Load featured content from API
    async loadFeaturedContent() {
        try {
            const response = await fetch('/api/collections?collection=featured');
            if (response.ok) {
                this.featuredData = await response.json();
            }
        } catch (error) {
            console.warn('Could not load featured content from API:', error);
            // Fallback to individual file loading
            await this.loadFeaturedContentFallback();
        }
    }

    // Fallback method for loading featured content
    async loadFeaturedContentFallback() {
        const featuredFiles = [
            'digital-harmony.md',
            'urban-dreams.md'
        ];

        for (const file of featuredFiles) {
            try {
                const response = await fetch(`/api/cms-content?collection=featured&file=${file}`);
                if (response.ok) {
                    const data = await response.json();
                    this.featuredData.push(data);
                }
            } catch (error) {
                console.warn(`Could not load featured file: ${file}`, error);
            }
        }

        // Sort by order
        this.featuredData.sort((a, b) => (a.order || 0) - (b.order || 0));
    }

    // Load site settings
    async loadSettings() {
        try {
            const response = await fetch('/api/settings');
            if (response.ok) {
                this.settings = await response.json();
            }
        } catch (error) {
            console.warn('Could not load settings', error);
        }
    }

    // Parse markdown front matter
    parseMarkdownFrontMatter(content) {
        const frontMatterRegex = /^---\s*\n([\s\S]*?)\n---/;
        const match = content.match(frontMatterRegex);
        
        if (match) {
            return this.parseYAML(match[1]);
        }
        return {};
    }

    // Simple YAML parser for front matter
    parseYAML(yamlContent) {
        const lines = yamlContent.split('\n');
        const data = {};
        
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#')) {
                const colonIndex = trimmed.indexOf(':');
                if (colonIndex > -1) {
                    const key = trimmed.substring(0, colonIndex).trim();
                    let value = trimmed.substring(colonIndex + 1).trim();
                    
                    // Remove quotes
                    if ((value.startsWith('"') && value.endsWith('"')) || 
                        (value.startsWith("'") && value.endsWith("'"))) {
                        value = value.slice(1, -1);
                    }
                    
                    // Convert boolean and number values
                    if (value === 'true') value = true;
                    else if (value === 'false') value = false;
                    else if (!isNaN(value) && value !== '') value = Number(value);
                    
                    data[key] = value;
                }
            }
        }
        
        return data;
    }

    // Render gallery content
    renderGalleryContent() {
        const galleryGrid = document.querySelector('.gallery-grid');
        if (!galleryGrid || this.galleryData.length === 0) return;

        galleryGrid.innerHTML = '';

        this.galleryData.forEach((item) => {
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';
            
            const imageName = item.image ? item.image.split('/').pop() : 'placeholder.jpg';
            
            galleryItem.innerHTML = `
                <div class="gallery-image">
                    <img src="${item.image || '/images/placeholder.jpg'}" alt="${item.title || 'Gallery Artwork'}" class="gallery-img" loading="lazy">
                    <div class="gallery-title-overlay">
                        <h4>${item.title || 'Untitled'}</h4>
                    </div>
                    <div class="gallery-overlay">
                        <div class="gallery-info">
                            <h3>${item.title || 'Untitled'}</h3>
                            <p>${item.description || item.category || 'Digital Art'}</p>
                        </div>
                        <div class="gallery-actions">
                            <button class="gallery-btn view-btn" onclick="viewGalleryArt('${imageName}')">
                                <i class="fas fa-eye"></i>
                                <span>View</span>
                            </button>
                            <button class="gallery-btn download-btn" onclick="downloadGalleryArt('${imageName}', '${item.title || 'Artwork'}')">
                                <i class="fas fa-download"></i>
                                <span>Download</span>
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            galleryGrid.appendChild(galleryItem);
        });
    }

    // Render featured content
    renderFeaturedContent() {
        const featuredGrid = document.querySelector('.featured-grid');
        if (!featuredGrid || this.featuredData.length === 0) return;

        featuredGrid.innerHTML = '';

        this.featuredData.forEach((item) => {
            if (!item.available) return; // Skip unavailable items

            const featuredItem = document.createElement('div');
            featuredItem.className = 'featured-item';
            
            featuredItem.innerHTML = `
                <div class="featured-image">
                    <img src="${item.image || '/images/placeholder.jpg'}" alt="${item.title || 'Featured Artwork'}" class="art-image">
                    <div class="image-overlay">
                        <div class="preview-notice" onclick="showPreviewMessage('${item.title || 'Untitled'}')">
                            <i class="fas fa-eye"></i>
                            <span>Preview Only</span>
                        </div>
                    </div>
                </div>
                <div class="featured-info">
                    <h3>${item.title || 'Untitled'}</h3>
                    <p class="art-description">${item.description || 'Digital artwork created with passion and technology.'}</p>
                    <div class="art-details">
                        <span class="art-type">${item.art_type || 'Digital Art'}</span>
                        <span class="art-size">${item.resolution || '4K Resolution'}</span>
                    </div>
                    <div class="featured-actions">
                        <button class="buy-btn" onclick="buyArt('${item.title || 'Untitled'}')">
                            <i class="fab fa-whatsapp"></i>
                            <span>Buy Now</span>
                        </button>
                    </div>
                </div>
            `;
            
            featuredGrid.appendChild(featuredItem);
        });
    }

    // Render all content
    renderContent() {
        this.renderGalleryContent();
        this.renderFeaturedContent();
    }

    // Fallback to original hardcoded content
    renderFallbackContent() {
        console.log('Using fallback content - CMS content could not be loaded');
        // The original hardcoded content will remain if CMS fails
    }

    // Get API for fetching markdown files (GitHub API)
    async fetchFromGitHub(path) {
        // This would be used if we need to fetch directly from GitHub
        // For now, we'll rely on the files being accessible via HTTP
        try {
            const response = await fetch(path);
            return response.ok ? await response.text() : null;
        } catch (error) {
            console.error('Error fetching from GitHub:', error);
            return null;
        }
    }
}

// Initialize CMS content manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const cmsManager = new CMSContentManager();
    
    // Load content after other scripts have initialized
    setTimeout(() => {
        cmsManager.loadContent();
    }, 1000);
    
    // Make it globally available for debugging
    window.cmsManager = cmsManager;
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CMSContentManager;
}