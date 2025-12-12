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
    let currentSectionEl = null;

    function shuffle(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    function pickRandom(items, count) {
        return shuffle(items).slice(0, Math.min(count, items.length));
    }

    function buildGalleryItem(data) {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        const img = document.createElement('img');
        img.src = data.src;
        img.alt = data.title || 'Gallery image';
        if (data.objectPosition) {
            img.style.objectPosition = data.objectPosition;
        }
        const overlay = document.createElement('div');
        overlay.className = 'overlay';
        const h3 = document.createElement('h3');
        h3.textContent = data.title || '';
        const p = document.createElement('p');
        p.textContent = data.subtitle || '';
        overlay.appendChild(h3);
        overlay.appendChild(p);
        item.appendChild(img);
        item.appendChild(overlay);
        return item;
    }

    function resolveDataUrl() {
        const { origin, pathname } = window.location;
        const lastSegment = pathname.split('/').pop() || '';
        const hasFileName = /\.[a-zA-Z0-9]+$/.test(lastSegment);
        const basePath = pathname.endsWith('/')
            ? pathname
            : hasFileName
                ? pathname.replace(/[^/]+$/, '')
                : `${pathname}/`;
        const primary = new URL('picture-data.json', origin + basePath).href;
        const fallback = new URL('/picture-data.json', origin).href;
        return { primary, fallback };
    }

    async function fetchPictureData() {
        if (Array.isArray(window.pictureData)) {
            return window.pictureData;
        }
        const { primary, fallback } = resolveDataUrl();
        try {
            const res = await fetch(primary, { cache: 'no-cache' });
            if (!res.ok) throw new Error(`primary fetch failed: ${res.status}`);
            return await res.json();
        } catch (primaryErr) {
            console.warn('Primary picture-data.json fetch failed, retrying with root path', primaryErr);
            const res = await fetch(fallback, { cache: 'no-cache' });
            if (!res.ok) throw new Error(`fallback fetch failed: ${res.status}`);
            return await res.json();
        }
    }

    function renderSection(sectionId, items) {
        const grid = document.querySelector(`#${sectionId} .gallery-grid`);
        if (!grid) return;
        grid.innerHTML = '';
        items.forEach(data => grid.appendChild(buildGalleryItem(data)));
    }

    async function loadGalleries() {
        try {
            let design, artwork;
            
            // Check if preloader already selected images
            if (window.preloadedGalleryData) {
                design = window.preloadedGalleryData.design;
                artwork = window.preloadedGalleryData.artwork;
            } else {
                // Fallback: load and select images ourselves
                const all = await fetchPictureData();
                design = pickRandom(all.filter(x => x.section === 'design'), 6);
                artwork = pickRandom(all.filter(x => x.section === 'artwork'), 6);
            }
            
            renderSection('design', design);
            renderSection('artwork', artwork);
            attachGalleryClickEvents();
        } catch (error) {
            console.error('Failed to load picture data:', error);
            showLoadError();
        }
    }

    function showLoadError() {
        ['design', 'artwork'].forEach((sectionId) => {
            const grid = document.querySelector(`#${sectionId} .gallery-grid`);
            if (grid) {
                grid.innerHTML = '<div class="gallery-error">無法載入圖片資料</div>';
            }
        });
    }
    
    // Initialize gallery images array for a specific section
    function initializeGalleryImages(sectionEl) {
        const galleryItems = sectionEl ? sectionEl.querySelectorAll('.gallery-item') : [];
        allGalleryImages = [];
        
        galleryItems.forEach((item) => {
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
        
        galleryItems.forEach((item) => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const sectionEl = item.closest('section');
                if (!sectionEl) return;
                currentSectionEl = sectionEl;
                initializeGalleryImages(sectionEl);
                const clickedIndex = allGalleryImages.findIndex(img => img.element === item);
                openLightbox(clickedIndex !== -1 ? clickedIndex : 0);
            });
        });
    }
    
    // Load data and then attach events
    loadGalleries();
    
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
