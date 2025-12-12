/* ============================================
   DESIGN-GALLERY-LAYOUT.JS
   Layout creation and management functions
   ============================================ */

function createImageElement(data) {
    const item = document.createElement('div');
    item.className = 'masonry-item';
    item.setAttribute('data-category', data.category);
    
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
    
    item.addEventListener('click', () => openLightbox(data));
    
    return item;
}

function createOptimizedLayout(masonryGrid, currentFilter) {
    masonryGrid.innerHTML = '';
    
    const filteredImages = imageData.filter(img => 
        currentFilter === 'all' || img.category === currentFilter
    );
    
    const containerWidth = masonryGrid.offsetWidth;
    const rowHeight = window.innerWidth <= 768 ? 150 : 250;
    const gap = 10;
    
    let currentRow = [];
    let currentRowWidth = 0;
    
    filteredImages.forEach((data, index) => {
        const img = new Image();
        img.onload = function() {
            const aspectRatio = this.width / this.height;
            data.aspectRatio = aspectRatio;
            const scaledWidth = rowHeight * aspectRatio;
            
            if (currentRowWidth + scaledWidth + (currentRow.length * gap) > containerWidth && currentRow.length > 0) {
                adjustRowToFit(currentRow, masonryGrid, containerWidth, rowHeight);
                currentRow = [];
                currentRowWidth = 0;
            }
            
            currentRow.push(data);
            currentRowWidth += scaledWidth;
            
            if (index === filteredImages.length - 1) {
                adjustRowToFit(currentRow, masonryGrid, containerWidth, rowHeight);
            }
        };
        img.src = data.src;
    });
}

function adjustRowToFit(rowImages, masonryGrid, containerWidth, baseHeight) {
    if (rowImages.length === 0) return;
    
    const gap = 10;
    const totalGap = (rowImages.length - 1) * gap;
    const availableWidth = containerWidth - totalGap;
    
    let totalWidth = 0;
    rowImages.forEach(img => {
        totalWidth += baseHeight * (img.aspectRatio || 1.5);
    });
    
    const scale = availableWidth / totalWidth;
    const adjustedHeight = baseHeight * scale;
    
    const row = document.createElement('div');
    row.className = 'gallery-row';
    row.style.height = `${adjustedHeight}px`;
    
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

function createSimpleLayout(masonryGrid, currentFilter) {
    masonryGrid.innerHTML = '';
    
    const filteredImages = imageData.filter(img => 
        currentFilter === 'all' || img.category === currentFilter
    );
    
    filteredImages.forEach((data) => {
        const element = createImageElement(data);
        masonryGrid.appendChild(element);
    });
}
