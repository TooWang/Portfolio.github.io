// preloader.js

// Preloader functionality
window.addEventListener('load', function() {
    const preloader = document.getElementById('preloader');
    const body = document.body;
    
    // Add loading class to body
    body.classList.add('loading');
    
    // Minimum display time for preloader (optional)
    const minLoadTime = 1000; // 1 second minimum
    const startTime = Date.now();
    
    function hidePreloader() {
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, minLoadTime - elapsedTime);
        
        setTimeout(() => {
            preloader.classList.add('fade-out');
            body.classList.remove('loading');
            
            // Remove preloader from DOM after fade out
            setTimeout(() => {
                preloader.style.display = 'none';
            }, 600);
        }, remainingTime);
    }
    
    // Hide preloader when everything is loaded
    hidePreloader();
});

// Fallback in case the load event doesn't fire
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        const preloader = document.getElementById('preloader');
        const body = document.body;
        
        if (preloader && !preloader.classList.contains('fade-out')) {
            preloader.classList.add('fade-out');
            body.classList.remove('loading');
            
            setTimeout(() => {
                preloader.style.display = 'none';
            }, 600);
        }
    }, 3000); // Fallback after 3 seconds
});
