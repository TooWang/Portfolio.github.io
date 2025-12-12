/* ============================================
   DESIGN-GALLERY-LIGHTBOX.JS
   Lightbox modal functionality
   ============================================ */

function openLightbox(data) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxTitle = document.getElementById('lightbox-title');
    const lightboxDescription = document.getElementById('lightbox-description');
    
    lightboxImg.src = data.src;
    lightboxTitle.textContent = data.title;
    lightboxDescription.textContent = data.description;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightboxFunc() {
    const lightbox = document.getElementById('lightbox');
    lightbox.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const closeLightbox = document.querySelector('.close-lightbox');
    
    closeLightbox.addEventListener('click', closeLightboxFunc);
    
    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) {
            closeLightboxFunc();
        }
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            closeLightboxFunc();
        }
    });
}
