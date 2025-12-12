/* ============================================
   DESIGN-GALLERY-LOADING.JS
   Dynamic loading and infinite scroll
   ============================================ */

let isLoading = false;

function generateMoreImages(count) {
    const masonryGrid = document.querySelector('.masonry-grid');
    
    for (let i = 0; i < count; i++) {
        const aspectRatio = 1.3 + Math.random() * 0.7;
        const width = Math.floor(300 * aspectRatio);
        const newImage = {
            src: `https://picsum.photos/${width}/300?random=${Date.now() + i}`,
            title: `動態圖片 ${imageData.length + i + 1}`,
            category: ['design', 'artwork', 'photo'][Math.floor(Math.random() * 3)],
            description: '動態加載的圖片',
            aspectRatio: aspectRatio
        };
        imageData.push(newImage);
        
        // 只追加新圖片，不重新渲染整個佈局
        if (currentFilter === 'all' || newImage.category === currentFilter) {
            const element = createImageElement(newImage);
            masonryGrid.appendChild(element);
        }
    }
}

function initInfiniteScroll() {
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
}
