/**
 * Slideshow functionality for index.html
 */
(function() {
    'use strict';
    
    var slideIndex = 1;
    
    // Initialize slideshow
    function init() {
        showSlides(slideIndex);
    }
    
    // Navigate slides
    function plusSlides(n) {
        showSlides(slideIndex += n);
    }
    
    // Go to specific slide
    function currentSlide(n) {
        showSlides(slideIndex = n);
    }
    
    // Show slides
    function showSlides(n) {
        var i;
        var slides = document.getElementsByClassName("mySlides");
        var dots = document.getElementsByClassName("dot");
        
        if (n > slides.length) {
            slideIndex = 1;
        }
        if (n < 1) {
            slideIndex = slides.length;
        }
        
        for (i = 0; i < slides.length; i++) {
            slides[i].style.display = "none";
        }
        
        for (i = 0; i < dots.length; i++) {
            dots[i].className = dots[i].className.replace(" active1", "");
        }
        
        if (slides[slideIndex - 1]) {
            slides[slideIndex - 1].style.display = "block";
        }
        
        if (dots[slideIndex - 1]) {
            dots[slideIndex - 1].className += " active1";
        }
    }
    
    // Make functions globally available
    window.plusSlides = plusSlides;
    window.currentSlide = currentSlide;
    
    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

