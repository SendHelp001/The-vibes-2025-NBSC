// scrollEffects.js

document.addEventListener('DOMContentLoaded', () => {
    // 1. Check for Dependencies
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.warn("GSAP or ScrollTrigger not loaded. Skipping global scroll effects.");
        return;
    }

    // --- Services Grid Specific Animation (Staggered Cards) ---
    const serviceCards = gsap.utils.toArray(".service-card");

    serviceCards.forEach((card, index) => {
        // Initial State
        gsap.set(card, {
            y: 80, 
            opacity: 0,
            scale: 0.95
        });

        ScrollTrigger.create({
            trigger: card,
            start: "top 90%",
            
            onEnter: () => {
                gsap.to(card, {
                    y: 0,
                    opacity: 1,
                    scale: 1,
                    duration: 1.0,
                    delay: index * 0.1, // Staggered delay
                    ease: "back.out(1.7)"
                });
            },
            once: true 
        });
    });

    // --- General Section Float-Up Effect ---
    // Targets: Highlights section, CTA section, and the Footer content
    const sectionsToAnimate = gsap.utils.toArray(
        "#highlights, #contact-cta, .site-footer"
    );

    sectionsToAnimate.forEach(section => {
        // Find the main content container within the section
        const content = section.querySelector('*:first-child'); 
        const target = content || section;

        // Initial State (slightly lower and invisible)
        gsap.set(target, {
            y: 50,    
            opacity: 0
        });

        // Create the ScrollTrigger
        ScrollTrigger.create({
            trigger: section,
            start: "top 80%",
            
            onEnter: () => {
                gsap.to(target, {
                    y: 0,
                    opacity: 1,
                    duration: 1.2,
                    ease: "power2.out"
                });
            },
            
            onEnterBack: () => {
                 gsap.to(target, {
                    y: 0, 
                    opacity: 1,   
                    duration: 1.2,
                    ease: "power2.out"
                });
            },
        });
    });
});