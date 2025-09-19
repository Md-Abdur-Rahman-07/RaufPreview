/**
 * A robust, section-by-section vertical scroller.
 * This script hijacks the native scroll behavior to prevent skipping sections
 * on fast scrolls, while still allowing for internal scrolling within sections.
 */

// --- UTILITY FUNCTIONS ---

/**
 * Counts the number of actual element children in a parent node, ignoring text nodes.
 * @param {HTMLElement} parent The parent element.
 * @param {boolean} getChildrensChildren Whether to count nested children recursively.
 * @returns {number} The total count of element nodes.
 */
window.getCount = function(parent, getChildrensChildren) {
    let relevantChildren = 0;
    const children = parent.childNodes.length;
    for (let i = 0; i < children; i++) {
        if (parent.childNodes[i].nodeType !== 3) { // Node type 3 is a text node
            if (getChildrensChildren) {
                relevantChildren += getCount(parent.childNodes[i], true);
            }
            relevantChildren++;
        }
    }
    return relevantChildren;
};

/**
 * Easing function for smooth animation (quintic easing out).
 * @param {number} x - Unused variable (conventional for easing functions).
 * @param {number} t - Current time (elapsed).
 * @param {number} b - Beginning value (start position).
 * @param {number} c - Change in value (gap to travel).
 * @param {number} d - Duration of the animation.
 * @returns {number} The calculated position for the current frame.
 */
const easingOutQuint = (x, t, b, c, d) =>
    c * ((t = t / d - 1) * t * t * t * t + 1) + b;

/**
 * Checks if the browser supports native smooth scrolling.
 * @returns {boolean} True if native smooth scrolling is supported.
 */
function testSupportsSmoothScroll() {
    let supports = false;
    try {
        const div = document.createElement('div');
        div.scrollTo({
            top: 0,
            get behavior() {
                supports = true;
                return 'smooth';
            }
        });
    } catch (err) {
        // Old browsers might throw an error
    }
    return supports;
}

const hasNativeSmoothScroll = testSupportsSmoothScroll();
const SCROLL_DURATION = 800; // Duration in ms for scroll animations.

/**
 * A polyfill for smooth scrolling for browsers that don't support it natively.
 * @param {HTMLElement} node - The element to scroll.
 * @param {string} key - The property to animate ('scrollTop' or 'scrollLeft').
 * @param {number} target - The target scroll position.
 * @param {function} onComplete - A callback function to run when scrolling is finished.
 */
function smoothScrollPolyfill(node, key, target, onComplete) {
    const startTime = Date.now();
    const offset = node[key];
    const gap = target - offset;
    let interrupt = false;

    const step = () => {
        const elapsed = Date.now() - startTime;
        const percentage = elapsed / SCROLL_DURATION;

        if (interrupt) return;

        if (percentage > 1) {
            node[key] = target; // Ensure it ends exactly at the target
            cleanup();
            if (onComplete) onComplete();
            return;
        }

        node[key] = easingOutQuint(0, elapsed, offset, gap, SCROLL_DURATION);
        requestAnimationFrame(step);
    };

    const cancel = () => {
        interrupt = true;
        cleanup();
    };

    const cleanup = () => {
        node.removeEventListener('wheel', cancel);
        node.removeEventListener('touchstart', cancel);
    };

    node.addEventListener('wheel', cancel, { passive: true });
    node.addEventListener('touchstart', cancel, { passive: true });

    step();
}

/**
 * A wrapper function that uses native smooth scrolling if available, otherwise uses the polyfill.
 * @param {HTMLElement} node - The element to scroll.
 * @param {number} topOrLeft - The target scroll position.
 * @param {boolean} isVertical - True for vertical scrolling, false for horizontal.
 * @param {function} onComplete - A callback function to run when scrolling is finished.
 */
function smoothScroll(node, topOrLeft, isVertical, onComplete) {
    if (hasNativeSmoothScroll) {
        node.scrollTo({
            [isVertical ? 'top' : 'left']: topOrLeft,
            behavior: 'smooth'
        });
        // Native smooth scroll has no reliable 'end' event, so we use a timeout.
        if (onComplete) {
            setTimeout(onComplete, SCROLL_DURATION);
        }
    } else {
        smoothScrollPolyfill(node, isVertical ? 'scrollTop' : 'scrollLeft', topOrLeft, onComplete);
    }
}


// --- MAIN APPLICATION LOGIC ---

document.addEventListener('DOMContentLoaded', () => {
    const scroller = document.getElementById('vertical-slider');
    const indicators = document.querySelectorAll('.indicator-button');
    
    if (!scroller) {
        console.error('Scroller element with ID "vertical-slider" not found.');
        return;
    }

    const slideCount = getCount(scroller, false);
    let currentSlideIndex = 0;
    let isScrolling = false;

    /**
     * Updates the aria-pressed attribute for all indicators for accessibility.
     * @param {number} activeIndex - The index of the currently active slide.
     */
    function setAriaPressed(activeIndex) {
        indicators.forEach((indicator, i) => {
            indicator.setAttribute('aria-pressed', i === activeIndex);
        });
    }
    
    /**
     * Sets the initial aria-labels for each indicator button.
     */
    function setAriaLabels() {
        indicators.forEach((indicator, i) => {
            indicator.setAttribute('aria-label', `Scroll to item #${i + 1}`);
        });
    }

    /**
     * The core navigation function. Scrolls to a specific slide index.
     * @param {number} index - The index of the slide to scroll to.
     */
    function navigateToSlide(index) {
        // Exit if an animation is already running or the index is out of bounds
        if (isScrolling || index < 0 || index >= slideCount) {
            return;
        }

        isScrolling = true;
        currentSlideIndex = index;
        setAriaPressed(currentSlideIndex);

        const targetScrollTop = Math.floor(scroller.scrollHeight * (currentSlideIndex / slideCount));

        smoothScroll(scroller, targetScrollTop, true, () => {
            // Allow the next scroll action only after the animation is complete
            isScrolling = false;
        });
    }

    // --- EVENT LISTENERS ---

    // Handle clicks on the indicator dots
    indicators.forEach((indicator, i) => {
        indicator.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            navigateToSlide(i);
        });
    });

    // Handle mouse wheel scrolling
    scroller.addEventListener('wheel', (e) => {
        if (isScrolling) {
            e.preventDefault();
            return;
        }

        const scrollDirection = e.deltaY > 0 ? 1 : -1;
        let currentElement = e.target;

        // Traverse up the DOM to check for scrollable parents
        while (currentElement && currentElement !== scroller) {
            const overflowY = window.getComputedStyle(currentElement).overflowY;
            const isScrollable = overflowY === 'auto' || overflowY === 'scroll';
            
            if (isScrollable) {
                const canScrollDown = currentElement.scrollTop + currentElement.clientHeight < currentElement.scrollHeight -1; // -1 for tolerance
                const canScrollUp = currentElement.scrollTop > 0;

                // If scrolling down and the element can scroll down, allow native scroll
                if (scrollDirection > 0 && canScrollDown) {
                    return; 
                }
                // If scrolling up and the element can scroll up, allow native scroll
                if (scrollDirection < 0 && canScrollUp) {
                    return;
                }
            }
            currentElement = currentElement.parentElement;
        }
        
        // If we get here, no internal element was scrolled, so we navigate the whole section
        e.preventDefault();
        
        const nextSlideIndex = currentSlideIndex + scrollDirection;
        navigateToSlide(nextSlideIndex);

    }, { passive: false }); // `passive: false` is required to allow `preventDefault()`

    // --- INITIAL SETUP ---
    setAriaLabels();
    setAriaPressed(0);
});

