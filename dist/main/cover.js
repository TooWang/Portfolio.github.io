/* ============================================
   COVER.JS - Cover Section Functionality
   ============================================ */

function initCoverSection() {
    const sections = document.querySelectorAll('section');
    let currentSection = 0;
    let isScrolling = false;
    
    function isDesktop() {
        return window.innerWidth > 768;
    }
    
    function scrollToSection(index) {
        if (index >= 0 && index < sections.length && !isScrolling) {
            isScrolling = true;
            sections[index].scrollIntoView({ behavior: 'smooth' });
            currentSection = index;
            
            setTimeout(() => {
                isScrolling = false;
            }, 50);
        }
    }
    
    function handleWheel(e) {
        if (!isDesktop()) return;
        
        e.preventDefault();
        
        const gallery = e.target.closest('.gallery-grid');
        if (gallery) {
            const canScrollUp = gallery.scrollTop > 0;
            const canScrollDown = gallery.scrollTop < gallery.scrollHeight - gallery.clientHeight - 1;
            
            if ((e.deltaY < 0 && canScrollUp) || (e.deltaY > 0 && canScrollDown)) {
                gallery.scrollTop += e.deltaY;
                return;
            }
        }
        
        if (!isScrolling) {
            if (e.deltaY > 0) {
                scrollToSection(currentSection + 1);
            } else {
                scrollToSection(currentSection - 1);
            }
        }
    }
    
    window.addEventListener('wheel', handleWheel, { passive: false });
    
    // Keyboard navigation for page scrolling
    window.addEventListener('keydown', function(e) {
        if (!isDesktop()) return;
        
        // Only handle page navigation if lightbox is not open
        const lightbox = document.getElementById('lightbox');
        if (lightbox && lightbox.style.display === 'block') return;
        
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
    
    return { scrollToSection, currentSection: () => currentSection };
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initCoverSection);
