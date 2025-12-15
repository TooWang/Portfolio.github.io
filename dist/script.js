document.addEventListener('DOMContentLoaded', function() {

    /* ============================================
       UTILITY - Page Transition for Navigator
       ============================================ */
    
    const setupPageTransition = () => {
        const navigators = document.querySelectorAll('.gallery-navigator');
        const overlay = document.getElementById('page-transition-overlay');
        
        if (!overlay) return;
        
        navigators.forEach((nav) => {
            nav.addEventListener('click', (e) => {
                e.preventDefault();
                const targetUrl = nav.getAttribute('href');
                
                // Trigger transition overlay
                overlay.classList.add('active');
                
                // Navigate after animation completes
                setTimeout(() => {
                    window.location.href = targetUrl;
                }, 500);
            });
        });
    };
    
    setupPageTransition();

    /* ============================================
       UTILITY - Gallery Navigator Visibility on Scroll
       ============================================ */
    
    // Setup IntersectionObserver for gallery navigators
    const setupGalleryNavigators = () => {
        const navigators = document.querySelectorAll('.gallery-navigator');
        if (navigators.length === 0) return;
        
        const observerOptions = {
            threshold: 0.3,
            rootMargin: '0px 0px -100px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                } else {
                    entry.target.classList.remove('is-visible');
                }
            });
        }, observerOptions);
        
        navigators.forEach((nav) => {
            observer.observe(nav);
        });
    };
    
    setupGalleryNavigators();

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
