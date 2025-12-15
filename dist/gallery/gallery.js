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
        this.scrollObserver = null;
        
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

        // Group images by section
        const sections = this.groupImagesBySection();

        // Render each section
        Object.keys(sections).forEach((sectionName) => {
            this.renderSection(sectionName, sections[sectionName]);
        });

        this.setupScrollAnimation();
    }

    groupImagesBySection() {
        const sections = {};
        
        this.allImages.forEach((image) => {
            const section = image.section || 'other';
            if (!sections[section]) {
                sections[section] = [];
            }
            sections[section].push(image);
        });
        
        return sections;
    }

    renderSection(sectionName, sectionImages) {
        // Create section container
        const sectionDiv = document.createElement('section');
        sectionDiv.className = 'gallery-section';
        sectionDiv.setAttribute('data-section', sectionName);
        
        // Create section title
        const sectionTitle = document.createElement('h2');
        sectionTitle.className = 'section-title';
        sectionTitle.textContent = sectionName.charAt(0).toUpperCase() + sectionName.slice(1);
        sectionDiv.appendChild(sectionTitle);
        
        // Create section grid
        const sectionGrid = document.createElement('div');
        sectionGrid.className = 'section-grid';
        
        // Group images into rows for this section
        const rows = this.createRowsForSection(sectionImages);
        
        rows.forEach((rowImages) => {
            this.renderRow(rowImages, sectionGrid);
        });
        
        sectionDiv.appendChild(sectionGrid);
        this.grid.appendChild(sectionDiv);
    }

    createRowsForSection(sectionImages) {
        const rows = [];
        let currentRow = [];
        let currentRowWidth = 0;
        const gap = 12; // px
        const fixedHeight = this.targetRowHeight; // 使用固定高度

        for (let i = 0; i < sectionImages.length; i++) {
            const image = sectionImages[i];
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

    renderRow(rowImages, container) {
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

            item.innerHTML = '<img src="' + image.src + '" alt="' + image.title + '" loading="lazy" class="gallery-image">' +
                '<div class="gallery-item-overlay">' +
                    '<div class="gallery-item-title">' + image.title + '</div>' +
                    '<div class="gallery-item-subtitle">' + (image.subtitle || '') + '</div>' +
                '</div>';

            item.addEventListener('click', () => {
                this.openLightbox(this.allImages.indexOf(image));
            });

            row.appendChild(item);
        });

        // If container is provided, append to it; otherwise append to grid
        if (container) {
            container.appendChild(row);
        } else {
            this.grid.appendChild(row);
        }
    }

    setupScrollAnimation() {
        if (!this.grid) return;

        // Disconnect previous observer to avoid duplicate callbacks
        if (this.scrollObserver) {
            this.scrollObserver.disconnect();
        }

        const options = {
            threshold: 0.2,
            rootMargin: '40px 0px'
        };

        this.scrollObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    this.scrollObserver.unobserve(entry.target);
                }
            });
        }, options);

        const items = this.grid.querySelectorAll('.gallery-item');
        items.forEach((item, index) => {
            item.classList.remove('is-visible');
            const delay = Math.min(index * 50, 600); // stagger top-to-bottom
            item.style.transitionDelay = `${delay}ms`;
            this.scrollObserver.observe(item);
        });
    }

    setupLightbox() {
        const closeBtn = this.lightbox.querySelector('.lightbox-close');

        closeBtn.addEventListener('click', () => this.closeLightbox());

        this.lightbox.addEventListener('click', (e) => {
            if (e.target === this.lightbox) {
                this.closeLightbox();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (!this.lightbox.classList.contains('active')) return;
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
