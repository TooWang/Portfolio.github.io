// Gallery Page Preloader and Transition Handler

class GalleryPreloader {
    constructor() {
        this.preloader = document.getElementById('preloader');
        this.overlay = document.getElementById('page-transition-overlay');
        this.progressBar = null;
        this.progressText = null;
        this.currentProgress = 0;
        this.targetProgress = 0;
        this.minLoadTime = 800; // Minimum preloader display time
        this.startTime = Date.now();
        
        this.init();
    }
    
    init() {
        this.progressBar = this.preloader?.querySelector('.progress-bar-fill');
        this.progressText = this.preloader?.querySelector('.progress-text');
        
        // Start fade-out of page transition overlay
        if (this.overlay) {
            setTimeout(() => {
                this.overlay.classList.add('fade-out');
            }, 100);
        }
        
        // Simulate loading progress
        this.simulateLoading();
        
        // Wait for images and minimum time
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.checkCompletion());
        } else {
            this.checkCompletion();
        }
    }
    
    simulateLoading() {
        const interval = setInterval(() => {
            if (this.targetProgress < 90) {
                this.targetProgress += Math.random() * 15;
                this.targetProgress = Math.min(this.targetProgress, 90);
            }
            this.updateProgress();
            
            if (this.targetProgress >= 90) {
                clearInterval(interval);
            }
        }, 200);
    }
    
    updateProgress() {
        // Smooth progress animation
        this.currentProgress += (this.targetProgress - this.currentProgress) * 0.1;
        
        if (this.progressBar) {
            this.progressBar.style.width = this.currentProgress + '%';
        }
        
        if (this.progressText) {
            this.progressText.textContent = Math.round(this.currentProgress) + '%';
        }
        
        if (this.currentProgress < this.targetProgress) {
            requestAnimationFrame(() => this.updateProgress());
        }
    }
    
    checkCompletion() {
        const elapsedTime = Date.now() - this.startTime;
        const remainingTime = Math.max(0, this.minLoadTime - elapsedTime);
        
        setTimeout(() => {
            this.targetProgress = 100;
            this.updateProgress();
            
            setTimeout(() => {
                this.completeLoading();
            }, 300);
        }, remainingTime);
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
