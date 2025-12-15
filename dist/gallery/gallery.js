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

        // Group images by section
        const sections = this.groupImagesBySection();

        // Render each section
        Object.keys(sections).forEach((sectionName) => {
            this.renderSection(sectionName, sections[sectionName]);
        });
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
            
            // 設置初始狀態：透明且向上移動
            item.style.opacity = '0';
            item.style.transform = 'translateY(-20px)';
            item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';

            item.innerHTML = '<img src="' + image.src + '" alt="' + image.title + '" loading="lazy" class="gallery-image">' +
                '<div class="gallery-item-overlay">' +
                    '<div class="gallery-item-title">' + image.title + '</div>' +
                    '<div class="gallery-item-subtitle">' + (image.subtitle || '') + '</div>' +
                '</div>';

            // 為圖片添加淡入動畫
            const img = item.querySelector('img');
            img.style.opacity = '0';
            img.style.transition = 'opacity 0.5s ease';
            
            // 當圖片加載完成時執行淡入動畫
            img.addEventListener('load', () => {
                img.style.opacity = '1';
            });
            
            // 處理圖片加載失敗的情況
            img.addEventListener('error', () => {
                img.style.opacity = '1';
            });

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
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '50px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    // 觸發淡入動畫
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe all gallery items - 設置不同的延遲以實現由上到下的效果
        setTimeout(() => {
            let itemIndex = 0;
            document.querySelectorAll('.gallery-item').forEach((item) => {
                // 設置延遲效果
                const delay = itemIndex * 30; // 每個卡片延遲 30ms
                item.style.transitionDelay = delay + 'ms';
                observer.observe(item);
                itemIndex++;
            });
        }, 100);
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
