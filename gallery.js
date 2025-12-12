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

    function renderSection(sectionId, items) {
        const grid = document.querySelector(`#${sectionId} .gallery-grid`);
        if (!grid) return;
        grid.innerHTML = '';
        items.forEach(data => grid.appendChild(buildGalleryItem(data)));
    }

    const fallbackData = [
        { id: 'design-1', section: 'design', title: 'Mon3tr CG二創', subtitle: '排版練習', src: 'https://pub-c8fcb62ea5604841ae8b588759ae3d38.r2.dev/gallery/Mon3tr.png', aspectRatio: 1.33 },
        { id: 'design-2', section: 'design', title: '萊茵生命', subtitle: '光影合成練習', src: 'https://pub-c8fcb62ea5604841ae8b588759ae3d38.r2.dev/gallery/Rhine.png', aspectRatio: 1.33 },
        { id: 'design-3', section: 'design', title: '2024年度總結', subtitle: '2024個人年度總結', src: 'https://pub-c8fcb62ea5604841ae8b588759ae3d38.r2.dev/gallery/Summary2024.png', aspectRatio: 1.78, objectPosition: '50% 60%' },
        { id: 'design-4', section: 'design', title: '寄術杯#4', subtitle: '明日方舟繁中服非官方肉鴿比賽"寄術杯"美術包裝', src: 'https://pub-c8fcb62ea5604841ae8b588759ae3d38.r2.dev/gallery/SBC4.png', aspectRatio: 1.33 },
        { id: 'design-5', section: 'design', title: '終末地"全面測試"直播封面', subtitle: '', src: 'https://pub-c8fcb62ea5604841ae8b588759ae3d38.r2.dev/gallery/endfield_Cover.png', aspectRatio: 1.33 },
        { id: 'design-6', section: 'design', title: '幹員文本自動化工具', subtitle: '泰拉旅社語音解包工作流', src: 'https://pub-c8fcb62ea5604841ae8b588759ae3d38.r2.dev/gallery/VoiceToTextTool.png', aspectRatio: 1.33 },
        { id: 'design-7', section: 'design', title: '終始機制解析', subtitle: '啊?戈爾舟遊籌措會 薩米系列攻略影片封面', src: 'https://pub-c8fcb62ea5604841ae8b588759ae3d38.r2.dev/gallery/Sami.png', aspectRatio: 1.33 },
        { id: 'design-8', section: 'design', title: '虛無之偶攻略', subtitle: '啊?戈爾舟遊籌措會 薩米系列攻略影片封面', src: 'https://pub-c8fcb62ea5604841ae8b588759ae3d38.r2.dev/gallery/Sami2.png', aspectRatio: 1.33 },
        { id: 'art-1', section: 'artwork', title: 'Artwork Title 1', subtitle: 'Medium: Digital Art', src: 'https://pub-c8fcb62ea5604841ae8b588759ae3d38.r2.dev/artwork/Greythroat1.png', aspectRatio: 1.33, objectPosition: '50% 10%' },
        { id: 'art-2', section: 'artwork', title: 'Artwork Title 2', subtitle: 'Medium: Oil Painting', src: 'https://pub-c8fcb62ea5604841ae8b588759ae3d38.r2.dev/artwork/Greythroat2.png', aspectRatio: 1.33, objectPosition: '50% 10%' },
        { id: 'art-3', section: 'artwork', title: 'Artwork Title 3', subtitle: 'Medium: Watercolor', src: 'https://pub-c8fcb62ea5604841ae8b588759ae3d38.r2.dev/artwork/Greythroat3.png', aspectRatio: 1.33, objectPosition: '50% 20%' },
        { id: 'art-4', section: 'artwork', title: 'Artwork Title 4', subtitle: 'Medium: Mixed Media', src: 'https://pub-c8fcb62ea5604841ae8b588759ae3d38.r2.dev/artwork/Greythroat4.png', aspectRatio: 1.33, objectPosition: '50% 10%' },
        { id: 'art-5', section: 'artwork', title: 'Artwork Title 5', subtitle: 'Medium: Pencil Sketch', src: 'https://via.placeholder.com/400x300', aspectRatio: 1.33 },
        { id: 'art-6', section: 'artwork', title: 'Artwork Title 6', subtitle: 'Medium: Digital Illustration', src: 'https://via.placeholder.com/400x300', aspectRatio: 1.33 }
    ];

    async function loadGalleries() {
        try {
            const response = await fetch('./picture-data.json', { cache: 'no-cache' });
            if (!response.ok) throw new Error('Failed to fetch picture data');
            const all = await response.json();
            const design = pickRandom(all.filter(x => x.section === 'design'), 6);
            const artwork = pickRandom(all.filter(x => x.section === 'artwork'), 6);
            renderSection('design', design);
            renderSection('artwork', artwork);
            attachGalleryClickEvents();
        } catch (error) {
            console.error('Failed to load picture data, using fallback set:', error);
            const design = pickRandom(fallbackData.filter(x => x.section === 'design'), 6);
            const artwork = pickRandom(fallbackData.filter(x => x.section === 'artwork'), 6);
            renderSection('design', design);
            renderSection('artwork', artwork);
            attachGalleryClickEvents();
        }
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
