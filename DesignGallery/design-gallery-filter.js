/* ============================================
   DESIGN-GALLERY-FILTER.JS
   Filtering functionality
   ============================================ */

let currentFilter = 'all';

function initFiltering(masonryGrid) {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            currentFilter = this.getAttribute('data-filter');
            
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            createSimpleLayout(masonryGrid, currentFilter);
        });
    });
}
