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
});
