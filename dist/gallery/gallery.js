/* ============================================
   JUSTIFIED HORIZONTAL MASONRY GALLERY
   ============================================ */

class JustifiedMasonryGallery {
    constructor() {
        this.allImages = [];
        this.currentIndex = 0;
        this.containerWidth = 0;
        this.targetRowHeight = 280;
        this.minRowHeight = 180;
        this.maxRowHeight = 400;
        
        this.grid = document.getElementById('masonryGrid');
        this.lightbox = document.getElementById('lightbox');
        
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
        this.setupResizeListener();
    }

    async fetchPictureData() {
        try {
            const response = await fetch('../picture-data.js');
            if (response.ok) {
                const text = await response.text();
                // Parse the JavaScript file to extract data
                const match = text.match(/window\.pictureData = (\[[\s\S]*\]);/);
                if (match) {
                    this.allImages = JSON.parse(match[1]);
                }
            }
        } catch (error) {
            console.error('Failed to load picture data:', error);
        }
    }

    renderGallery() {
        this.grid.innerHTML = '';
        this.containerWidth = this.grid.offsetWidth;

        if (!this.containerWidth || this.allImages.length === 0) {
            return;
        }

        // Group images into rows
        const rows = this.createRows();

        // Render each row
        rows.forEach((rowImages) => {
            this.renderRow(rowImages);
        });
    }

    createRows() {
        const rows = [];
        let currentRow = [];
        let currentRowWidth = 0;
        const gap = 12; // px
        const fixedHeight = this.targetRowHeight; // 使用固定高度

        for (let i = 0; i < this.allImages.length; i++) {
            const image = this.allImages[i];
            const aspectRatio = image.aspectRatio || 1.5;
            
            // 計算這張圖片在固定高度下的寬度
            const imageWidth = fixedHeight * aspectRatio;
            
            // 計算加入這張圖片後的總寬度（包括間距）
            const gapWidth = currentRow.length > 0 ? gap : 0;
            const potentialWidth = currentRowWidth + gapWidth + imageWidth;
            
            // 如果加入這張圖片會超過容器寬度，且當前行不是空的，就開始新行
            if (potentialWidth > this.containerWidth && currentRow.length > 0) {
                rows.push([...currentRow]);
                currentRow = [image];
                currentRowWidth = imageWidth;
            } else {
                // 可以加入當前行
                currentRow.push(image);
                currentRowWidth = potentialWidth;
            }
        }

        // 添加最後一行
        if (currentRow.length > 0) {
            rows.push(currentRow);
        }

        return rows;
    }

    renderRow(rowImages) {
        const row = document.createElement('div');
        row.className = 'masonry-row';

        const gap = 12; // px
        const fixedHeight = this.targetRowHeight; // 使用固定高度

        rowImages.forEach((image, index) => {
            const item = document.createElement('div');
            item.className = 'gallery-item';
            
            // 使用固定高度，寬度根據比例計算
            const aspectRatio = image.aspectRatio || 1.5;
            const itemWidth = fixedHeight * aspectRatio;
            
            item.style.width = itemWidth + 'px';
            item.style.height = fixedHeight + 'px';
            item.style.flexShrink = '0';

            item.innerHTML = '<img src="' + image.src + '" alt="' + image.title + '" loading="lazy">' +
                '<div class="gallery-item-overlay">' +
                    '<div class="gallery-item-title">' + image.title + '</div>' +
                    '<div class="gallery-item-subtitle">' + (image.subtitle || '') + '</div>' +
                '</div>';

            item.addEventListener('click', () => {
                this.openLightbox(this.allImages.indexOf(image));
            });

            row.appendChild(item);
        });

        this.grid.appendChild(row);
    }

    setupScrollAnimation() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '50px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe all gallery items
        setTimeout(() => {
            document.querySelectorAll('.gallery-item').forEach((item) => {
                item.style.opacity = '0';
                item.style.transition = 'opacity 0.5s ease';
                observer.observe(item);
            });
        }, 100);
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

    setupResizeListener() {
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                this.renderGallery();
                
                // 如果 lightbox 打開，也調整圖片大小
                if (this.lightbox.classList.contains('active')) {
                    const lightboxImg = document.getElementById('lightbox-img');
                    this.adjustLightboxImageSize(lightboxImg);
                }
            }, 250);
        });
    }

    adjustLightboxImageSize(img) {
        // 獲取圖片原始尺寸
        const naturalWidth = img.naturalWidth;
        const naturalHeight = img.naturalHeight;
        
        if (!naturalWidth || !naturalHeight) return;
        
        // 獲取視窗尺寸（預留邊距）
        const maxWidth = window.innerWidth * 0.9;
        const maxHeight = window.innerHeight * 0.9;
        
        // 計算圖片比例
        const aspectRatio = naturalWidth / naturalHeight;
        const viewportRatio = maxWidth / maxHeight;
        
        let width, height;
        
        // 根據比例決定如何縮放
        if (aspectRatio > viewportRatio) {
            // 圖片較寬，以寬度為準
            width = Math.min(naturalWidth, maxWidth);
            height = width / aspectRatio;
        } else {
            // 圖片較高，以高度為準
            height = Math.min(naturalHeight, maxHeight);
            width = height * aspectRatio;
        }
        
        // 確保不超過最大尺寸
        if (width > maxWidth) {
            width = maxWidth;
            height = width / aspectRatio;
        }
        if (height > maxHeight) {
            height = maxHeight;
            width = height * aspectRatio;
        }
        
        // 應用尺寸
        img.style.width = width + 'px';
        img.style.height = height + 'px';
    }

    openLightbox(index) {
        this.currentIndex = index;
        const image = this.allImages[index];
        
        const lightboxImg = document.getElementById('lightbox-img');
        lightboxImg.src = image.src;
        document.getElementById('lightbox-title').textContent = image.title;
        document.getElementById('lightbox-subtitle').textContent = image.subtitle || '';
        
        // 圖片載入完成後調整大小
        lightboxImg.onload = () => {
            this.adjustLightboxImageSize(lightboxImg);
        };
        
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
        
        const lightboxImg = document.getElementById('lightbox-img');
        lightboxImg.src = image.src;
        document.getElementById('lightbox-title').textContent = image.title;
        document.getElementById('lightbox-subtitle').textContent = image.subtitle || '';
        
        // 圖片載入完成後調整大小
        lightboxImg.onload = () => {
            this.adjustLightboxImageSize(lightboxImg);
        };
    }

    previousImage() {
        this.currentIndex = (this.currentIndex - 1 + this.allImages.length) % this.allImages.length;
        const image = this.allImages[this.currentIndex];
        
        const lightboxImg = document.getElementById('lightbox-img');
        lightboxImg.src = image.src;
        document.getElementById('lightbox-title').textContent = image.title;
        document.getElementById('lightbox-subtitle').textContent = image.subtitle || '';
        
        // 圖片載入完成後調整大小
        lightboxImg.onload = () => {
            this.adjustLightboxImageSize(lightboxImg);
        };
    }
}

// Initialize gallery when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new JustifiedMasonryGallery();
});
