// pinterest.js - 固定高度橫向排版

document.addEventListener('DOMContentLoaded', function() {
    // 圖片數據
    const imageData = [
        {
            src: 'https://pub-c8fcb62ea5604841ae8b588759ae3d38.r2.dev/gallery/Mon3tr.png',
            title: '排版練習_Mon3tr',
            category: 'design',
            description: '設計練習作品',
            aspectRatio: 1.5 // 寬高比（可選）
        },
        {
            src: 'https://pub-c8fcb62ea5604841ae8b588759ae3d38.r2.dev/gallery/Rhine.png',
            title: '光影合成練習_萊茵生命',
            category: 'design',
            description: '光影效果練習',
            aspectRatio: 1.5
        },
        {
            src: 'https://pub-c8fcb62ea5604841ae8b588759ae3d38.r2.dev/gallery/Summary2024.png',
            title: '2024年度總結',
            category: 'design',
            description: '年度總結設計',
            aspectRatio: 1.78
        },
        {
            src: 'https://pub-c8fcb62ea5604841ae8b588759ae3d38.r2.dev/gallery/SBC4.png',
            title: '寄術杯#4',
            category: 'design',
            description: '活動海報設計',
            aspectRatio: 1.5
        },
        // 測試用的橫向圖片
        {
            src: 'https://picsum.photos/400/300?random=1',
            title: '橫向示例 1',
            category: 'photo',
            description: '隨機橫向圖片',
            aspectRatio: 1.33
        },
        {
            src: 'https://picsum.photos/500/300?random=2',
            title: '橫向示例 2',
            category: 'artwork',
            description: '隨機橫向圖片',
            aspectRatio: 1.67
        },
        {
            src: 'https://picsum.photos/600/300?random=3',
            title: '橫向示例 3',
            category: 'photo',
            description: '隨機橫向圖片',
            aspectRatio: 2
        },
        {
            src: 'https://picsum.photos/400/300?random=4',
            title: '橫向示例 4',
            category: 'design',
            description: '隨機橫向圖片',
            aspectRatio: 1.33
        },
        // 添加更多圖片...
    ];
    
    const masonryGrid = document.querySelector('.masonry-grid');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxTitle = document.getElementById('lightbox-title');
    const lightboxDescription = document.getElementById('lightbox-description');
    const closeLightbox = document.querySelector('.close-lightbox');
    
    let currentFilter = 'all';
    let loadedImages = [];
    
    // 創建圖片元素
    function createImageElement(data) {
        const item = document.createElement('div');
        item.className = 'masonry-item';
        item.setAttribute('data-category', data.category);
        
        // 如果有 aspectRatio，設置寬度
        if (data.aspectRatio) {
            const height = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--row-height') || '250');
            const width = height * data.aspectRatio;
            item.style.width = `${width}px`;
            item.style.flexGrow = data.aspectRatio;
        }
        
        item.innerHTML = `
            <img src="${data.src}" alt="${data.title}" loading="lazy">
            <div class="item-overlay">
                <h3 class="item-title">${data.title}</h3>
                <p class="item-category">${data.category}</p>
            </div>
        `;
        
        // 點擊打開 lightbox
        item.addEventListener('click', () => openLightbox(data));
        
        return item;
    }
    
    // 創建行並填充圖片
    function createOptimizedLayout() {
        masonryGrid.innerHTML = '';
        
        // 篩選圖片
        const filteredImages = imageData.filter(img => 
            currentFilter === 'all' || img.category === currentFilter
        );
        
        // 獲取容器寬度
        const containerWidth = masonryGrid.offsetWidth;
        const rowHeight = window.innerWidth <= 768 ? 150 : 250;
        const gap = 10;
        
        let currentRow = [];
        let currentRowWidth = 0;
        
        filteredImages.forEach((data, index) => {
            const img = new Image();
            img.onload = function() {
                // 計算圖片在固定高度下的寬度
                const aspectRatio = this.width / this.height;
                data.aspectRatio = aspectRatio;
                const scaledWidth = rowHeight * aspectRatio;
                
                // 如果當前行加上這張圖片會超出容器寬度，就創建新行
                if (currentRowWidth + scaledWidth + (currentRow.length * gap) > containerWidth && currentRow.length > 0) {
                    // 調整當前行的圖片以填滿寬度
                    adjustRowToFit(currentRow, containerWidth, rowHeight);
                    currentRow = [];
                    currentRowWidth = 0;
                }
                
                currentRow.push(data);
                currentRowWidth += scaledWidth;
                
                // 如果是最後一張圖片，處理最後一行
                if (index === filteredImages.length - 1) {
                    adjustRowToFit(currentRow, containerWidth, rowHeight);
                }
            };
            img.src = data.src;
        });
    }
    
    // 調整行內圖片以完全填滿寬度
    function adjustRowToFit(rowImages, containerWidth, baseHeight) {
        if (rowImages.length === 0) return;
        
        const gap = 10;
        const totalGap = (rowImages.length - 1) * gap;
        const availableWidth = containerWidth - totalGap;
        
        // 計算縮放比例
        let totalWidth = 0;
        rowImages.forEach(img => {
            totalWidth += baseHeight * (img.aspectRatio || 1.5);
        });
        
        const scale = availableWidth / totalWidth;
        const adjustedHeight = baseHeight * scale;
        
        // 創建行容器
        const row = document.createElement('div');
        row.className = 'gallery-row';
        row.style.height = `${adjustedHeight}px`;
        
        // 添加圖片到行
        rowImages.forEach(data => {
            const item = createImageElement(data);
            const width = adjustedHeight * (data.aspectRatio || 1.5);
            item.style.width = `${width}px`;
            item.style.height = `${adjustedHeight}px`;
            item.style.flexGrow = '0';
            item.style.flexShrink = '0';
            row.appendChild(item);
        });
        
        masonryGrid.appendChild(row);
    }
    
    // 簡單佈局方法（不需要等待圖片加載）
    function createSimpleLayout() {
        masonryGrid.innerHTML = '';
        
        const filteredImages = imageData.filter(img => 
            currentFilter === 'all' || img.category === currentFilter
        );
        
        filteredImages.forEach((data) => {
            const element = createImageElement(data);
            masonryGrid.appendChild(element);
        });
    }
    
    // 過濾功能
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            currentFilter = this.getAttribute('data-filter');
            
            // 更新按鈕狀態
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // 重新排列圖片
            createSimpleLayout(); // 使用簡單佈局，或使用 createOptimizedLayout() 獲得更好的效果
        });
    });
    
    // Lightbox 功能
    function openLightbox(data) {
        lightboxImg.src = data.src;
        lightboxTitle.textContent = data.title;
        lightboxDescription.textContent = data.description;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    function closeLightboxFunc() {
        lightbox.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
    
    closeLightbox.addEventListener('click', closeLightboxFunc);
    
    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) {
            closeLightboxFunc();
        }
    });
    
    // ESC 鍵關閉 lightbox
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            closeLightboxFunc();
        }
    });
    
    // 動態加載更多圖片
    function generateMoreImages(count) {
        for (let i = 0; i < count; i++) {
            const aspectRatio = 1.3 + Math.random() * 0.7; // 1.3 到 2.0 之間
            const width = Math.floor(300 * aspectRatio);
            const newImage = {
                src: `https://picsum.photos/${width}/300?random=${Date.now() + i}`,
                title: `動態圖片 ${imageData.length + i + 1}`,
                category: ['design', 'artwork', 'photo'][Math.floor(Math.random() * 3)],
                description: '動態加載的圖片',
                aspectRatio: aspectRatio
            };
            imageData.push(newImage);
        }
        createSimpleLayout();
    }
    
    // 初始化
    createSimpleLayout(); // 或使用 createOptimizedLayout() 
    
    // 視窗大小改變時重新排列
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            createSimpleLayout();
        }, 300);
    });
    
    // 無限滾動加載
    let isLoading = false;
    window.addEventListener('scroll', function() {
        if (isLoading) return;
        
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 1000) {
            isLoading = true;
            setTimeout(() => {
                generateMoreImages(8);
                isLoading = false;
            }, 500);
        }
    });
});
