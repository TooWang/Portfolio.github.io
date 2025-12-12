/* ============================================
   DESIGN-GALLERY-INIT.JS
   Main initialization script
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    const masonryGrid = document.querySelector('.masonry-grid');
    
    // Initialize all components
    createSimpleLayout(masonryGrid, currentFilter);
    initFiltering(masonryGrid);
    initLightbox();
    initInfiniteScroll();
    
    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            createSimpleLayout(masonryGrid, currentFilter);
        }, 300);
    });
});
