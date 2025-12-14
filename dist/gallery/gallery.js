/* ============================================
   MASONRY GALLERY - JavaScript
   ============================================ */

class MasonryGallery {
    constructor() {
        this.allImages = [];
        this.currentIndex = 0;
        this.lightbox = document.getElementById('lightbox');
        this.grid = document.getElementById('masonryGrid');
        this.init();
    }

    async init() {
        // Wait for picture-data.js to load
        if (window.pictureData) {
            this.allImages = window.pictureData;
        } else {
            await this.fetchPictureData();
        }

        this.renderGallery();
        this.setupScrollAnimation();
        this.setupLightbox();
    }

    async fetchPictureData() {
        try {
            const response = await fetch('../picture-data.json');
            if (response.ok) {
                this.allImages = await response.json();
            }
        } catch (error) {
            console.error('Failed to load picture data:', error);
        }
    }

    renderGallery() {
        this.grid.innerHTML = '';
        this.allImages.forEach((image, index) => {
            const item = document.createElement('div');
            item.className = 'gallery-item';
            item.innerHTML = `
                <img src="${image.src}" alt="${image.title}" loading="lazy">
                <div class="gallery-item-info">
                    <div class="gallery-item-title">${image.title}</div>
                    <div class="gallery-item-subtitle">${image.subtitle || ''}</div>
                </div>
            `;
            item.addEventListener('click', () => this.openLightbox(index));
            this.grid.appendChild(item);
        });
    }

    setupScrollAnimation() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '50px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('loaded');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Start observing all gallery items
        document.querySelectorAll('.gallery-item').forEach((item) => {
            observer.observe(item);
        });
    }

    setupLightbox() {
        const closeBtn = this.lightbox.querySelector('.lightbox-close');
        const prevBtn = this.lightbox.querySelector('.lightbox-prev');
        const nextBtn = this.lightbox.querySelector('.lightbox-next');

        closeBtn.addEventListener('click', () => this.closeLightbox());
        prevBtn.addEventListener('click', () => this.previousImage());
        nextBtn.addEventListener('click', () => this.nextImage());

        this.lightbox.addEventListener('click', (e) => {
            if (e.target === this.lightbox) {
                this.closeLightbox();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (!this.lightbox.classList.contains('active')) return;
            if (e.key === 'ArrowLeft') this.previousImage();
            if (e.key === 'ArrowRight') this.nextImage();
            if (e.key === 'Escape') this.closeLightbox();
        });
    }

    openLightbox(index) {
        this.currentIndex = index;
        const image = this.allImages[index];
        document.getElementById('lightbox-img').src = image.src;
        document.getElementById('lightbox-title').textContent = image.title;
        document.getElementById('lightbox-subtitle').textContent = image.subtitle || '';
        this.lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeLightbox() {
        this.lightbox.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    nextImage() {
        this.currentIndex = (this.currentIndex + 1) % this.allImages.length;
        const image = this.allImages[this.currentIndex];
        document.getElementById('lightbox-img').src = image.src;
        document.getElementById('lightbox-title').textContent = image.title;
        document.getElementById('lightbox-subtitle').textContent = image.subtitle || '';
    }

    previousImage() {
        this.currentIndex = (this.currentIndex - 1 + this.allImages.length) % this.allImages.length;
        const image = this.allImages[this.currentIndex];
        document.getElementById('lightbox-img').src = image.src;
        document.getElementById('lightbox-title').textContent = image.title;
        document.getElementById('lightbox-subtitle').textContent = image.subtitle || '';
    }
}

// Initialize gallery when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new MasonryGallery();
});
