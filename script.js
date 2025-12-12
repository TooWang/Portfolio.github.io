document.addEventListener('DOMContentLoaded', function() {

    /* ============================================
       UTILITY - Responsive Scroll Tracking
       ============================================ */
    
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
});
