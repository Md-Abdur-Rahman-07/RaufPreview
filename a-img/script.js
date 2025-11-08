// Wait for DOM to be ready
document.addEventListener("DOMContentLoaded", ()=> {
    const svg = document.querySelector('svg.squiggle');
    
    if (!svg) return;
    
    // Check parent container and set SVG height to match section height exactly
    const aboutSection = document.querySelector('.about-section');
    if (aboutSection) {
        // Use a function to update SVG height to match section exactly
        const updateSvgHeight = () => {
            // Wait a tick to ensure layout is complete
            requestAnimationFrame(() => {
                const sectionHeight = aboutSection.scrollHeight;
                svg.style.height = `${sectionHeight}px`;
            });
        };
        
        // Set initial height after a short delay to ensure layout is complete
        setTimeout(updateSvgHeight, 100);
        
        // Update height if section content changes (using ResizeObserver for better performance)
        if (window.ResizeObserver) {
            const resizeObserver = new ResizeObserver(() => {
                updateSvgHeight();
            });
            resizeObserver.observe(aboutSection);
        } else {
            // Fallback: update on window resize
            window.addEventListener('resize', updateSvgHeight);
        }
    }
    
    // Get the mask path (original working approach)
    const maskPath = svg.querySelector('#mask-path');
    
    if (!maskPath) return;
    
    const pathLength = maskPath.getTotalLength();
    
    // Set initial stroke dash properties on mask path - start with path fully hidden
    maskPath.setAttribute('stroke-dasharray', pathLength);
    maskPath.setAttribute('stroke-dashoffset', pathLength);
    maskPath.style.strokeDasharray = `${pathLength}`;
    maskPath.style.strokeDashoffset = `${pathLength}`;
    
    // Ensure mask path has white stroke (required for SVG masks to reveal content)
    maskPath.setAttribute('stroke', 'white');
    maskPath.style.stroke = 'white';
    maskPath.style.strokeWidth = '5';
    maskPath.style.fill = 'none';
    
    // Style visible path - black dashed
    const visiblePath = svg.querySelector('#visible-path');
    if (visiblePath) {
        visiblePath.style.stroke = 'black';
        visiblePath.style.strokeWidth = '3';
        visiblePath.style.fill = 'none';
    }
    
    // Check if squiggle is inside about-section
    const isInAboutSection = aboutSection && aboutSection.contains(svg);
    
    // Throttle scroll updates using requestAnimationFrame for better Safari performance
    let rafId = null;
    let lastOffset = pathLength;
    
    const updatePath = () => {
        let distance, totalDistance;
        
        if (isInAboutSection && aboutSection) {
            // Use about-section scroll position
            distance = aboutSection.scrollTop;
            totalDistance = aboutSection.scrollHeight - aboutSection.clientHeight;
        } else {
            // Use window scroll position
            distance = window.scrollY;
            totalDistance = document.body.scrollHeight - window.innerHeight;
        }
        
        // Calculate scroll percentage (0 to 1)
        const percentage = totalDistance > 0 ? Math.min(1, Math.max(0, distance / totalDistance)) : 0;
        
        // Calculate the offset - as we scroll down, reduce offset to reveal more path
        // When percentage is 0 (top), offset is pathLength (fully hidden)
        // When percentage is 1 (bottom), offset is 0 (fully visible)
        const offset = pathLength * (1 - percentage);
        
        // Only update if offset changed significantly (reduces repaints in Safari)
        if (Math.abs(offset - lastOffset) > 0.5) {
            // Use only style update for better Safari performance (avoid setAttribute)
            maskPath.style.strokeDashoffset = `${offset}`;
            lastOffset = offset;
        }
        
        rafId = null;
    };
    
    const scroll = () => {
        // Throttle with requestAnimationFrame for smooth performance
        if (rafId === null) {
            rafId = requestAnimationFrame(updatePath);
        }
    };
    
    // Run the scroll function after a short delay to ensure layout is complete
    setTimeout(() => {
        updatePath();
    }, 300);
    
    // Add the scroll event listener to the appropriate container
    if (isInAboutSection && aboutSection) {
        aboutSection.addEventListener('scroll', scroll, { passive: true });
    } else {
        window.addEventListener('scroll', scroll, { passive: true });
    }
});


window.addEventListener("DOMContentLoaded", () => {
    const elements = document.querySelectorAll('.raul.duplicate');

    elements.forEach(el => {
        const xTo = gsap.quickTo(el, '--xpercent', { duration: 0.4, ease: "back.out(1.7)" });
        const yTo = gsap.quickTo(el, '--ypercent', { duration: 0.4, ease: "back.out(1.7)" });

        let isHovering = false;
        let fadeTimeout;

        document.addEventListener("mousemove", (e) => {
            const rect = el.getBoundingClientRect();
            const isOver = (
                e.clientX >= rect.left - 50 && // small hover zone padding
                e.clientX <= rect.right + 50 &&
                e.clientY >= rect.top - 50 &&
                e.clientY <= rect.bottom + 50
            );

            if (isOver) {
                if (!isHovering) {
                    isHovering = true;
                    clearTimeout(fadeTimeout);
                    el.style.opacity = 1;
                }
                const relX = ((e.clientX - rect.left) / rect.width) * 100;
                const relY = ((e.clientY - rect.top) / rect.height) * 100;
                xTo(relX);
                yTo(relY);
            } else if (isHovering) {
                isHovering = false;
                fadeTimeout = setTimeout(() => {
                    el.style.opacity = 0;
                }, 150); // delay fade-out a bit for smoother feel
            }
        });
    });
});
