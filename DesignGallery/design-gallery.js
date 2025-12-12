// pinterest.js

document.addEventListener('DOMContentLoaded', function() {
    // 圖片數據（你可以替換成你的圖片）
    const imageData = [
        {
            src: 'https://pub-c8fcb62ea5604841ae8b588759ae3d38.r2.dev/gallery/Mon3tr.png',
            title: '排版練習_Mon3tr',
            category: 'design',
            description: '設計練習作品'
        },
        {
            src: 'https://pub-c8fcb62ea5604841ae8b588759ae3d38.r2.dev/gallery/Rhine.png',
            title: '光影合成練習_萊茵生命',
            category: 'design',
            description: '光影效果練習'
        },
        {
            src: 'https://pub-c8fcb62ea5604841ae8b588759ae3d38.r2.dev/gallery/Summary2024.png',
            title: '2024年度總結',
            category: 'design',
            description: '年度總結設計'
        },
        {
            src: 'https://pub-c8fcb62ea5604841ae8b588759ae3d38.r2.dev/gallery/SBC4.png',
            title: '寄術杯#4',
            category: 'design',
            description: '活動海報設計'
        },
        // 添加更多圖片數據...
        // 你可以使用 placeholder 來測試
        {
            src: 'https://picsum.photos/300/400?random=1',
            title: '示例圖片 1',
            category: 'photo',
            description: '隨機圖片'
        },
        {
            src: 'https://picsum.photos/300/500?random=2',
            title: '示例圖片 2',
            category: 'artwork',
            description: '隨機圖片'
        },
        {
            src: 'https://picsum.photos/300/350?random=3',
            title: '示例圖片 3',
            category: 'photo',
            description: '隨機圖片'
        },
        // 繼續添加更多...
    ];
    
    const masonryGrid = document.querySelector('.masonry-grid');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxTitle = document.getElementById('lightbox-title');
    const lightboxDescription = document.getElementById('lightbox-description');
    const closeLightbox = document.querySelector('.close-lightbox');
    
    // 創建圖片元素
    function createImageElement(data, index) {
        const item = document.createElement('div');
        item.className = 'masonry-item';
        item.setAttribute('data-category', data.category);
        
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
    
    // 載入所有圖片
    function loadImages() {
        masonryGrid.innerHTML = '';
        imageData.forEach((data, index) => {
            const element = createImageElement(data, index);
            masonryGrid.appendChild(element);
        });
    }
    
    // 過濾功能
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            
            // 更新按鈕狀態
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // 過濾圖片
            const items = document.querySelectorAll('.masonry-item');
            items.forEach(item => {
                if (filter === 'all' || item.getAttribute('data-category') === filter) {
                    item.classList.remove('hidden');
                    item.style.display = 'block';
                } else {
                    item.classList.add('hidden');
                    setTimeout(() => {
                        if (item.classList.contains('hidden')) {
                            item.style.display = 'none';
                        }
                    }, 300);
                }
            });
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
    
    // 動態加載更多圖片（如果需要）
    function generateMoreImages(count) {
        for (let i = 0; i < count; i++) {
            const randomHeight = Math.floor(Math.random() * 200) + 300;
            const newImage = {
                src: `https://picsum.photos/300/${randomHeight}?random=${Date.now() + i}`,
                title: `動態圖片 ${i + 1}`,
                category: ['design', 'artwork', 'photo'][Math.floor(Math.random() * 3)],
                description: '動態加載的圖片'
            };
            imageData.push(newImage);
        }
        loadImages();
    }
    
    // 初始化
    loadImages();
    
    // 如果需要無限滾動加載
    let isLoading = false;
    window.addEventListener('scroll', function() {
        if (isLoading) return;
        
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 1000) {
            isLoading = true;
            setTimeout(() => {
                generateMoreImages(10); // 加載10張新圖片
                isLoading = false;
            }, 500);
        }
    });
});
