// script.js
document.addEventListener('DOMContentLoaded', function() {
    // Full page scroll functionality for desktop only
    const sections = document.querySelectorAll('section');
    let currentSection = 0;
    let isScrolling = false;
    
    // Check if device is desktop (screen width > 768px)
    function isDesktop() {
        return window.innerWidth > 768;
    }
    
    // Scroll to specific section
    function scrollToSection(index) {
        if (index >= 0 && index < sections.length && !isScrolling) {
            isScrolling = true;
            sections[index].scrollIntoView({ behavior: 'smooth' });
            currentSection = index;
            
            // Reset scrolling flag after animation
            setTimeout(() => {
                isScrolling = false;
            }, 1000);
        }
    }
    
    // Handle wheel events for desktop
    function handleWheel(e) {
        if (!isDesktop()) return;
        
        e.preventDefault();
        
        // Check if scrolling inside gallery
        const gallery = e.target.closest('.gallery-grid');
        if (gallery) {
            // Check if gallery can scroll
            const canScrollUp = gallery.scrollTop > 0;
            const canScrollDown = gallery.scrollTop < gallery.scrollHeight - gallery.clientHeight - 1;
            
            if ((e.deltaY < 0 && canScrollUp) || (e.deltaY > 0 && canScrollDown)) {
                // Let gallery scroll normally
                gallery.scrollTop += e.deltaY;
                return;
            }
        }
        
        // Otherwise, do full page scroll
        if (!isScrolling) {
            if (e.deltaY > 0) {
                // Scroll down
                scrollToSection(currentSection + 1);
            } else {
                // Scroll up
                scrollToSection(currentSection - 1);
            }
        }
    }
    
    // Add wheel event listener with passive: false to allow preventDefault
    window.addEventListener('wheel', handleWheel, { passive: false });
    
    // Handle keyboard navigation
    window.addEventListener('keydown', function(e) {
        if (!isDesktop()) return;
        
        if (e.key === 'ArrowDown' || e.key === 'PageDown') {
            e.preventDefault();
            scrollToSection(currentSection + 1);
        } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
            e.preventDefault();
            scrollToSection(currentSection - 1);
        }
    });
    
    // Update current section on window resize
    window.addEventListener('resize', function() {
        // Find which section is currently in view
        const windowHeight = window.innerHeight;
        const scrollPosition = window.scrollY + windowHeight / 2;
        
        sections.forEach((section, index) => {
            const sectionTop = section.offsetTop;
            const sectionBottom = sectionTop + section.offsetHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                currentSection = index;
            }
        });
    });
    
    // Set initial section based on scroll position
    const initialScrollPosition = window.scrollY + window.innerHeight / 2;
    sections.forEach((section, index) => {
        const sectionTop = section.offsetTop;
        const sectionBottom = sectionTop + section.offsetHeight;
        
        if (initialScrollPosition >= sectionTop && initialScrollPosition < sectionBottom) {
            currentSection = index;
        }
    });
    
    // Gallery item click functionality
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    galleryItems.forEach(item => {
        item.addEventListener('click', function() {
            console.log('Gallery item clicked');
        });
    });
    
    // Add page transition effects
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe all sections
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });

    // Lightbox functionality
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const closeBtn = document.querySelector('.close-lightbox');
    const prevBtn = document.querySelector('.lightbox-prev');
    const nextBtn = document.querySelector('.lightbox-next');
    
    // Store all gallery images
    let allGalleryImages = [];
    let currentImageIndex = 0;
    
    // Initialize gallery images array
    function initializeGalleryImages() {
        const galleryItems = document.querySelectorAll('.gallery-item');
        allGalleryImages = [];
        
        galleryItems.forEach((item, index) => {
            const img = item.querySelector('img');
            const title = item.querySelector('.overlay h3')?.textContent || '';
            const description = item.querySelector('.overlay p')?.textContent || '';
            
            allGalleryImages.push({
                src: img.src,
                alt: img.alt,
                title: title,
                description: description,
                element: item
            });
        });
    }
    
    // Open lightbox
    function openLightbox(index) {
        currentImageIndex = index;
        const imageData = allGalleryImages[index];
        
        lightbox.style.display = 'block';
        lightboxImg.src = imageData.src;
        lightboxImg.alt = imageData.alt;
        lightboxCaption.innerHTML = `<strong>${imageData.title}</strong><br>${imageData.description}`;
        
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
    
    // Navigate to previous image
    function showPrevImage() {
        currentImageIndex = (currentImageIndex - 1 + allGalleryImages.length) % allGalleryImages.length;
        openLightbox(currentImageIndex);
    }
    
    // Navigate to next image
    function showNextImage() {
        currentImageIndex = (currentImageIndex + 1) % allGalleryImages.length;
        openLightbox(currentImageIndex);
    }
    
    // Event listeners
    closeBtn.addEventListener('click', closeLightbox);
    prevBtn.addEventListener('click', showPrevImage);
    nextBtn.addEventListener('click', showNextImage);
    
    // Close on background click
    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (lightbox.style.display === 'block') {
            if (e.key === 'Escape') {
                closeLightbox();
            } else if (e.key === 'ArrowLeft') {
                showPrevImage();
            } else if (e.key === 'ArrowRight') {
                showNextImage();
            }
        }
    });
    
    // Add click event to gallery items
    function attachGalleryClickEvents() {
        const galleryItems = document.querySelectorAll('.gallery-item');
        
        galleryItems.forEach((item, index) => {
            item.addEventListener('click', function() {
                initializeGalleryImages();
                // Find the correct index for this item
                const clickedIndex = allGalleryImages.findIndex(img => img.element === item);
                openLightbox(clickedIndex !== -1 ? clickedIndex : index);
            });
        });
    }
    
    // Initialize
    attachGalleryClickEvents();
    
    // Touch gestures for mobile
    let touchStartX = 0;
    let touchEndX = 0;
    
    lightbox.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    lightbox.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });
    
    function handleSwipe() {
        if (touchEndX < touchStartX - 50) {
            showNextImage();
        }
        if (touchEndX > touchStartX + 50) {
            showPrevImage();
        }
    }
});
