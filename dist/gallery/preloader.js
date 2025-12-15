// Gallery Page Preloader and Transition Handler with Image Preloading

class GalleryPreloader {
    constructor() {
        this.preloader = document.getElementById('preloader');
        this.overlay = document.getElementById('page-transition-overlay');
        this.progressBar = null;
        this.progressText = null;
        this.progressLabel = null;
        this.currentProgress = 0;
        this.targetProgress = 0;
        this.minLoadTime = 800; // Minimum preloader display time
        this.startTime = Date.now();
        this.totalImages = 0;
        this.loadedImages = 0;
        this.imagesLoaded = false;
        
        this.init();
    }
    
    init() {
        this.progressBar = this.preloader?.querySelector('.progress-bar-fill');
        this.progressText = this.preloader?.querySelector('.progress-text');
        this.progressLabel = this.preloader?.querySelector('.progress-label');
        
        // Start fade-out of page transition overlay
        if (this.overlay) {
            setTimeout(() => {
                this.overlay.classList.add('fade-out');
            }, 100);
        }
        
        // Start loading images
        this.loadGalleryImages();
        
        // Wait for images and minimum time
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.checkCompletion());
        } else {
            this.checkCompletion();
        }
    }
    
    async loadGalleryImages() {
        try {
            // Use pictureData from window
            if (!window.pictureData || !Array.isArray(window.pictureData)) {
                console.warn('Picture data not available');
                this.imagesLoaded = true;
                this.targetProgress = 90;
                this.updateProgress();
                return;
            }
            
            const allImages = window.pictureData;
            this.totalImages = allImages.length;
            this.loadedImages = 0;
            
            if (this.totalImages === 0) {
                this.imagesLoaded = true;
                this.targetProgress = 90;
                this.updateProgress();
                return;
            }
            
            // Preload all images
            const imagePromises = allImages.map((data) => {
                return new Promise((resolve) => {
                    const img = new Image();
                    
                    const onLoadComplete = () => {
                        this.loadedImages++;
                        // Progress from 0% to 90% based on loaded images
                        const progress = (this.loadedImages / this.totalImages) * 90;
                        this.targetProgress = progress;
                        this.updateProgress();
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
            
            // Wait for all images
            await Promise.all(imagePromises);
            this.imagesLoaded = true;
            
        } catch (error) {
            console.warn('Failed to preload gallery images:', error);
            this.imagesLoaded = true;
            this.targetProgress = 90;
            this.updateProgress();
        }
    }
    
    updateProgress() {
        // Smooth progress animation
        const diff = this.targetProgress - this.currentProgress;
        this.currentProgress += diff * 0.15;
        
        if (this.progressBar) {
            this.progressBar.style.width = this.currentProgress + '%';
        }
        
        if (this.progressText) {
            this.progressText.textContent = Math.round(this.currentProgress) + '%';
        }
        
        if (Math.abs(diff) > 0.5) {
            requestAnimationFrame(() => this.updateProgress());
        }
    }
    
    checkCompletion() {
        const checkInterval = setInterval(() => {
            if (this.imagesLoaded) {
                clearInterval(checkInterval);
                
                const elapsedTime = Date.now() - this.startTime;
                const remainingTime = Math.max(0, this.minLoadTime - elapsedTime);
                
                setTimeout(() => {
                    this.targetProgress = 100;
                    this.updateProgress();
                    
                    setTimeout(() => {
                        this.completeLoading();
                    }, 400);
                }, remainingTime);
            }
        }, 100);
        
        // Fallback timeout
        setTimeout(() => {
            clearInterval(checkInterval);
            if (!this.imagesLoaded) {
                this.completeLoading();
            }
        }, 8000);
    }
    
    completeLoading() {
        if (this.preloader) {
            this.preloader.classList.add('fade-out');
            
            setTimeout(() => {
                this.preloader.style.display = 'none';
            }, 600);
        }
    }
}

// Initialize preloader when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new GalleryPreloader();
    });
} else {
    new GalleryPreloader();
}
