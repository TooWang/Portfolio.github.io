// preloader.js

// Progress Bar Preloader
class ProgressPreloader {
    constructor() {
        this.preloader = document.getElementById('preloader');
        this.progressBar = null;
        this.progressText = null;
        this.progressLabel = null;
        this.loaderStatus = null;
        this.currentProgress = 0;
        this.targetProgress = 0;
        this.isComplete = false;
        this.minLoadTime = 1500; // Minimum 1.5 seconds for preloader to show
        this.startTime = Date.now();
        this.coverBgLoaded = false;
        this.galleryImagesLoaded = false;
        this.totalGalleryImages = 0;
        this.loadedGalleryImages = 0;
        
        this.init();
    }
    
    init() {
        // Create progress bar HTML
        this.createProgressBar();
        
        // Load cover background image
        this.loadCoverBackground();
        
        // Load gallery images
        this.loadGalleryImages();
        
        // Simulate loading progress
        this.simulateProgress();
        
        // Wait for page to fully load
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.onPageReady());
        } else {
            this.onPageReady();
        }
        
        // Fallback timeout
        setTimeout(() => {
            if (!this.isComplete) {
                this.setProgress(100);
            }
        }, 5000);
    }
    
    createProgressBar() {
        const loaderContent = this.preloader.querySelector('.loader-content');
        loaderContent.innerHTML = `
            <div class="progress-bar-container">
                <div class="progress-bar-fill"></div>
            </div>
            <div class="progress-text">0%</div>
            <div class="progress-label">Loading</div>
            <div class="loader-status"></div>
        `;
        
        this.progressBar = this.preloader.querySelector('.progress-bar-fill');
        this.progressText = this.preloader.querySelector('.progress-text');
        this.progressLabel = this.preloader.querySelector('.progress-label');
        this.loaderStatus = this.preloader.querySelector('.loader-status');
    }
    
    loadCoverBackground() {
        const bgUrl = 'https://pub-c8fcb62ea5604841ae8b588759ae3d38.r2.dev/BG.png';
        const img = new Image();
        
        img.onload = () => {
            this.coverBgLoaded = true;
            this.targetProgress = Math.max(this.targetProgress, 30); // Jump to at least 30% when bg loads
        };
        
        img.onerror = () => {
            this.coverBgLoaded = true; // Continue even if image fails
            console.warn('Cover background failed to load');
        };
        
        img.src = bgUrl;
    }
    
    async loadGalleryImages() {
        try {
            const response = await fetch('./picture-data.json', { cache: 'no-cache' });
            if (!response.ok) throw new Error('Failed to fetch');
            const all = await response.json();
            
            // Pick 6 random from each section (same logic as gallery.js)
            const shuffle = arr => {
                const a = [...arr];
                for (let i = a.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [a[i], a[j]] = [a[j], a[i]];
                }
                return a;
            };
            
            const design = shuffle(all.filter(x => x.section === 'design')).slice(0, 6);
            const artwork = shuffle(all.filter(x => x.section === 'artwork')).slice(0, 6);
            const allImages = [...design, ...artwork];
            
            // Store selected images for gallery.js to use
            window.preloadedGalleryData = { design, artwork };
            
            this.totalGalleryImages = allImages.length;
            this.loadedGalleryImages = 0;
            
            // Preload all images
            allImages.forEach(data => {
                const img = new Image();
                img.onload = () => {
                    this.loadedGalleryImages++;
                    const loadPercent = (this.loadedGalleryImages / this.totalGalleryImages) * 100;
                    this.targetProgress = Math.max(this.targetProgress, 30 + loadPercent * 0.5); // 30-80%
                    
                    if (this.loadedGalleryImages >= this.totalGalleryImages) {
                        this.galleryImagesLoaded = true;
                    }
                };
                img.onerror = () => {
                    this.loadedGalleryImages++;
                    if (this.loadedGalleryImages >= this.totalGalleryImages) {
                        this.galleryImagesLoaded = true;
                    }
                };
                img.src = data.src;
            });
        } catch (error) {
            console.warn('Failed to preload gallery images:', error);
            this.galleryImagesLoaded = true; // Continue anyway
        }
    }
    
    simulateProgress() {
        // Progressive loading simulation
        const intervals = [
            { delay: 200, increment: 5 },   // Start: 0-5%
            { delay: 400, increment: 8 },   // Early: 5-13%
            { delay: 600, increment: 12 },  // Mid: 13-25%
            { delay: 900, increment: 15 },  // Progress: 25-40%
            { delay: 1200, increment: 10 }, // Slower: 40-50%
            { delay: 1500, increment: 8 },  // Even slower: 50-58%
        ];
        
        let currentIncrement = 0;
        
        const progressInterval = setInterval(() => {
            if (this.isComplete) {
                clearInterval(progressInterval);
                return;
            }
            
            if (currentIncrement < intervals.length) {
                setTimeout(() => {
                    this.targetProgress += intervals[currentIncrement].increment;
                    this.targetProgress = Math.min(this.targetProgress, 99); // Cap at 99%
                    currentIncrement++;
                }, intervals[currentIncrement].delay);
            } else if (this.targetProgress < 90) {
                // Slow down further as we approach completion
                this.targetProgress = Math.min(this.targetProgress + Math.random() * 2, 99);
            }
            
            // Smoothly animate to target
            if (this.currentProgress < this.targetProgress) {
                this.currentProgress += (this.targetProgress - this.currentProgress) * 0.1;
                this.updateProgressBar();
            }
        }, 100);
    }
    
    onPageReady() {
        // Page is ready, rush to 95%
        this.targetProgress = 95;
        
        const waitForComplete = setInterval(() => {
            // Wait for page ready, cover background AND all gallery images loaded
            if (this.currentProgress >= 93 && this.coverBgLoaded && this.galleryImagesLoaded) {
                clearInterval(waitForComplete);
                this.completeLoading();
            } else if (this.currentProgress < this.targetProgress) {
                this.currentProgress += (this.targetProgress - this.currentProgress) * 0.15;
                this.updateProgressBar();
            }
        }, 50);
    }
    
    setProgress(value) {
        this.targetProgress = Math.min(value, 100);
        
        const progressInterval = setInterval(() => {
            if (this.currentProgress >= this.targetProgress) {
                clearInterval(progressInterval);
                return;
            }
            
            this.currentProgress += (this.targetProgress - this.currentProgress) * 0.2;
            this.updateProgressBar();
        }, 30);
    }
    
    updateProgressBar() {
        const progress = Math.min(Math.round(this.currentProgress), 100);
        this.progressBar.style.width = progress + '%';
        this.progressText.textContent = progress + '%';
        
        // Update status text based on progress
        if (progress < 25) {
            this.loaderStatus.textContent = 'Initializing...';
        } else if (progress < 50) {
            this.loaderStatus.textContent = 'Loading images...';
        } else if (progress < 75) {
            this.loaderStatus.textContent = `Loading gallery (${this.loadedGalleryImages}/${this.totalGalleryImages})...`;
        } else if (progress < 95) {
            this.loaderStatus.textContent = 'Finalizing...';
        } else {
            this.loaderStatus.textContent = '';
        }
    }
    
    completeLoading() {
        const elapsedTime = Date.now() - this.startTime;
        const remainingTime = Math.max(0, this.minLoadTime - elapsedTime);
        
        setTimeout(() => {
            // Quick final push to 100%
            this.currentProgress = 100;
            this.progressBar.style.width = '100%';
            this.progressText.textContent = '100%';
            this.loaderStatus.textContent = 'Complete!';
            
            // Fade out after a brief moment
            setTimeout(() => {
                this.fadeOut();
            }, 300);
        }, remainingTime);
    }
    
    fadeOut() {
        this.isComplete = true;
        this.preloader.classList.add('fade-out');
        document.body.classList.remove('loading');
        
        // Remove preloader from DOM after fade out
        setTimeout(() => {
            this.preloader.style.display = 'none';
        }, 600);
    }
}

// Initialize preloader when script loads
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('preloader')) {
        new ProgressPreloader();
    }
});

// Fallback if DOMContentLoaded already fired
if (document.readyState === 'interactive' || document.readyState === 'complete') {
    if (document.getElementById('preloader')) {
        new ProgressPreloader();
    }
}
