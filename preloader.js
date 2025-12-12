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
            this.currentProgress = Math.max(this.currentProgress, 10);
            this.targetProgress = Math.max(this.targetProgress, 10);
            this.updateProgressBar();
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
            
            if (this.totalGalleryImages === 0) {
                this.galleryImagesLoaded = true;
                return;
            }
            
            // Preload all images using Promise.all for reliability
            const imagePromises = allImages.map((data) => {
                return new Promise((resolve) => {
                    const img = new Image();
                    
                    const onLoadComplete = () => {
                        this.loadedGalleryImages++;
                        // Progress from 10% to 90% based on loaded images
                        const progress = 10 + (this.loadedGalleryImages / this.totalGalleryImages) * 80;
                        this.currentProgress = progress;
                        this.targetProgress = progress;
                        this.updateProgressBar();
                    };
                    
                    img.onload = () => {
                        onLoadComplete();
                        resolve();
                    };
                    
                    img.onerror = () => {
                        console.warn('Failed to load image:', data.src);
                        onLoadComplete();
                        resolve();
                    };
                    
                    img.src = data.src;
                });
            });
            
            // Wait for all images to load
            await Promise.all(imagePromises);
            this.galleryImagesLoaded = true;
            
        } catch (error) {
            console.warn('Failed to preload gallery images:', error);
            this.galleryImagesLoaded = true; // Continue anyway
        }
    }
    
    simulateProgress() {
        // No simulation needed - progress is controlled by actual loading events
    }
    
    onPageReady() {
        // Check completion status
        const checkCompletion = setInterval(() => {
            if (this.isComplete) {
                clearInterval(checkCompletion);
                return;
            }
            
            // All assets loaded, move to 95%
            if (this.coverBgLoaded && this.galleryImagesLoaded) {
                clearInterval(checkCompletion);
                this.currentProgress = 95;
                this.targetProgress = 95;
                this.updateProgressBar();
                this.completeLoading();
            }
        }, 100);
    }
    
    setProgress(value) {
        this.currentProgress = Math.min(value, 100);
        this.targetProgress = this.currentProgress;
        this.updateProgressBar();
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
