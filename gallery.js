/* ============================================
   GALLERY.JS - Gallery & Lightbox Functionality
   ============================================ */

function initGallerySection() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = document.querySelector('.close-lightbox');
    const prevBtn = document.querySelector('.lightbox-prev');
    const nextBtn = document.querySelector('.lightbox-next');
    
    let allGalleryImages = [];
    let currentImageIndex = 0;
    
    // Initialize gallery images array
    function initializeGalleryImages() {
        const galleryItems = document.querySelectorAll('.gallery-item');
        allGalleryImages = [];
        
        galleryItems.forEach((item, index) => {
            const img = item.querySelector('img');
            const title = item.querySelector('.overlay h3')?.textContent || '';
            
            allGalleryImages.push({
                src: img.src,
                alt: img.alt,
                title: title,
                element: item
            });
        });
    }
    
    // Open lightbox
    function openLightbox(index) {
        currentImageIndex = index;
        const imageData = allGalleryImages[index];
        
        lightbox.style.display = 'block';
        
        // Start with image hidden
        lightboxImg.classList.add('loading');
        
        // Load new image
        const tempImg = new Image();
        tempImg.onload = function() {
            lightboxImg.src = imageData.src;
            lightboxImg.alt = imageData.alt;
            
            // Fade in the image
            setTimeout(() => {
                lightboxImg.classList.remove('loading');
            }, 50);
        };
        tempImg.src = imageData.src;
        
        // Hide navigation if only one image
        if (allGalleryImages.length <= 1) {
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'none';
        } else {
            prevBtn.style.display = 'block';
            nextBtn.style.display = 'block';
        }
        
        // Prevent body scroll when lightbox is open
        document.body.style.overflow = 'hidden';
    }
    
    // Close lightbox
    function closeLightbox() {
        lightbox.style.display = 'none';
        document.body.style.overflow = '';
    }
    
    // Switch image with smooth transition
    function switchImage(newIndex) {
        const imageData = allGalleryImages[newIndex];
        
        // Fade out current image
        lightboxImg.classList.add('loading');
        
        // Wait for fade out, then load new image
        setTimeout(() => {
            const tempImg = new Image();
            tempImg.onload = function() {
                lightboxImg.src = imageData.src;
                lightboxImg.alt = imageData.alt;
                currentImageIndex = newIndex;
                
                // Fade in new image
                setTimeout(() => {
                    lightboxImg.classList.remove('loading');
                }, 50);
            };
            tempImg.src = imageData.src;
        }, 300);
    }
    
    // Navigate to previous image
    function showPrevImage() {
        const newIndex = (currentImageIndex - 1 + allGalleryImages.length) % allGalleryImages.length;
        switchImage(newIndex);
    }
    
    // Navigate to next image
    function showNextImage() {
        const newIndex = (currentImageIndex + 1) % allGalleryImages.length;
        switchImage(newIndex);
    }
    
    // Event listeners for lightbox controls
    if (closeBtn) {
        closeBtn.addEventListener('click', closeLightbox);
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', showPrevImage);
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', showNextImage);
    }
    
    // Close on background click
    if (lightbox) {
        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
    }
    
    // Keyboard navigation for lightbox
    document.addEventListener('keydown', function(e) {
        if (lightbox && lightbox.style.display === 'block') {
            if (e.key === 'Escape') {
                closeLightbox();
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                showPrevImage();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                showNextImage();
            }
        }
    });
    
    // Add click event to gallery items
    function attachGalleryClickEvents() {
        const galleryItems = document.querySelectorAll('.gallery-item');
        
        galleryItems.forEach((item, index) => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                initializeGalleryImages();
                const clickedIndex = allGalleryImages.findIndex(img => img.element === item);
                openLightbox(clickedIndex !== -1 ? clickedIndex : index);
            });
        });
    }
    
    // Initialize gallery click events
    attachGalleryClickEvents();
    
    // Touch gestures for mobile
    let touchStartX = 0;
    let touchEndX = 0;
    
    if (lightbox) {
        lightbox.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        lightbox.addEventListener('touchend', function(e) {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });
    }
    
    function handleSwipe() {
        if (touchEndX < touchStartX - 50) {
            showNextImage();
        }
        if (touchEndX > touchStartX + 50) {
            showPrevImage();
        }
    }
    
    return { openLightbox, closeLightbox, initializeGalleryImages };
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initGallerySection);
