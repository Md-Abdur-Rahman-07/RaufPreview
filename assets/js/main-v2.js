// https://css-tricks.com/the-trick-to-viewport-units-on-mobile/

let vh = window.innerHeight * 0.01;
document.documentElement.style.setProperty('--vh', `${vh}px`);

// https://www.notion.so/timothyricks/Anime-js-tricksText-letter-animation-aff4b1da3176445c8b5e4ae892cd006c
// Copyright start
// © Code by T.RICKS, https://www.tricksdesign.com/
// You have the license to use this code in your projects but not redistribute it to others
// Tutorial: https://www.youtube.com/watch?v=xiAqTu4l3-g&ab_channel=TimothyRicks

// Find all text with .tricks class and break each letter into a span
var tricksWord = document.getElementsByClassName("tricks");
for (var i = 0; i < tricksWord.length; i++) {
    var wordWrap = tricksWord.item(i);
    wordWrap.innerHTML = wordWrap.innerHTML.replace(/(^|<\/?[^>]+>|\s+)([^\s<]+)/g, '$1<span class="tricksword">$2</span>');
}

var tricksLetter = document.getElementsByClassName("tricksword");
for (var i = 0; i < tricksLetter.length; i++) {
    var letterWrap = tricksLetter.item(i);
    letterWrap.innerHTML = letterWrap.textContent.replace(/\S/g, "<span class='letter'>$&</span>");
}

// Copyright end


////////


//GSAP 3 introduces advanced stagger values
var grid = [8, 8], //[rows, columns]
    tl = gsap.timeline({
        repeat: 0,
        repeatDelay: 0
    });

function animateBoxes(from, axis, ease) {
    //one stagger call does all the animation:
    tl.from(".grid .flex-col", {
        duration: .75,
        scale: 0.001,
        rotate: 8,
        yPercent: 40,
        ease: "power1.inOut",
        delay: .5,
        stagger: {
            amount: 2,
            grid: grid,
            axis: axis,
            ease: ease,
            from: from,
            yoyo: true,
            repeat: 3,
        },
        onStart: leaveLoad
    });
}

TweenLite.to(".loader-overlay", 0.5, {
    autoAlpha: 0
});

animateBoxes("left");

function leaveLoad() {
    TweenLite.to(".loader", 2, {
        backgroundColor: "rgba(0, 0, 0, 0)",
        delay: 5.5, // was 3.5
        ease: "none"
    });

    TweenLite.to(".loader", 0.25, {
        autoAlpha: 0,
        delay: 5.75, // was 4.75
    });

    TweenLite.from(".video-title h1", 2, {
        letterSpacing: "25vh",
        delay: 5.5, // was 3.5
        ease: "expo.out",
        clearProps: "all"
    });
}


////////

gsap.registerPlugin(ScrollTrigger);

// ScrollTriggers for all Slides
ScrollTrigger.defaults({
    toggleActions: "restart none none reset",
    scroller: ".vertical-slider",
    start: "0% 100%",
    end: "100% 0%",
    markers: false,
});

// SLIDE 0

gsap.to(".video-title", {
    scrollTrigger: {
        trigger: ".vertical-single-slide-0 + .vertical-single-slide",
        start: "0% 100%",
        end: "50% 50%",
        scrub: true,

    },
    scaleX: 0.02,
    duration: .6,
    ease: "power2.out"
});



// Disable GSAP on Mobile
// Source: https://greensock.com/forums/topic/26325-disabling-scrolltrigger-on-mobile-with-mediamatch/
ScrollTrigger.matchMedia({

    // desktop 
    "(min-width: 541px)": function() {

        // Your existing default variables
        var defaultRotate = 0;
        var defaultDuration = 1;
        var defaultEase = "power3.out";
        var defaultY = 200;
        var defaultStagger = 0.03;

        var defaultYH2 = 150;
        var defaultXH2 = 0;
        var defaultRotateH2 = 6;
        var defaultDurationH2 = 0.6;
        var defaultEaseH2 = "power2.out";
        var defaultStaggerH2 = 0.03;

        var defaultYDescription = "2em";
        var defaultRotateDescription = 2;
        var defaultDurationDescription = 0.75;
        var defaultEaseDescription = "power2.inOut";
        var defaultOpacityDescription = 0;

        // START SLIDES

        // SLIDE 1
        // gsap.from(".vertical-single-slide-1 .s-b", {
        //     scrollTrigger: ".vertical-single-slide-1 .slide-content",
        //     yPercent: defaultY,
        //     rotate: defaultRotate,
        //     duration: defaultDuration,
        //     ease: defaultEase,
        //     stagger: defaultStagger,
        //     clearProps: "all",
        // });

        // gsap.from(".vertical-single-slide-1 .tricksword .letter", {
        //     scrollTrigger: ".vertical-single-slide-1 .tricks",
        //     yPercent: defaultYH2,
        //     xPercent: defaultXH2,
        //     rotate: defaultRotateH2,
        //     duration: defaultDurationH2,
        //     ease: defaultEaseH2,
        //     stagger: defaultStaggerH2
        // });

        // gsap.from(".vertical-single-slide-1 .description .d-inner", {
        //     scrollTrigger: ".vertical-single-slide-1 .description",
        //     y: defaultYDescription,
        //     opacity: defaultOpacityDescription,
        //     rotate: defaultRotateDescription,
        //     duration: defaultDurationDescription,
        //     ease: defaultEaseDescription
        // });

        // ALL OTHER SLIDES (2, 3, 4, 5, 6, 7 ETC.)
        function animateSlide(slideNumber) {
            const slideSelector = `.vertical-single-slide-${slideNumber}`;

            gsap.from(`${slideSelector} .s-b`, {
                scrollTrigger: `${slideSelector} .slide-content`,
                yPercent: defaultY,
                rotate: defaultRotate,
                duration: defaultDuration,
                ease: defaultEase,
                stagger: defaultStagger,
                clearProps: "all"
            });

            gsap.from(`${slideSelector} .tricksword .letter`, {
                scrollTrigger: `${slideSelector} .tricks`,
                yPercent: defaultYH2,
                xPercent: defaultXH2,
                rotate: defaultRotateH2,
                duration: defaultDurationH2,
                ease: defaultEaseH2,
                stagger: defaultStaggerH2
            });

            gsap.from(`${slideSelector} .description .d-inner`, {
                scrollTrigger: `${slideSelector} .description`,
                y: defaultYDescription,
                opacity: defaultOpacityDescription,
                rotate: defaultRotateDescription,
                duration: defaultDurationDescription,
                ease: defaultEaseDescription
            });
        }

        const totalSlides = document.querySelectorAll('.vertical-single-slide').length;
        for (let i = 1; i <= 14; i++) { // Start from 2 to exclude slide 1
            animateSlide(i);
        }

        // SLIDE LAST (CONTACT)

        gsap.from(".vertical-single-slide-last .s-b", {
            scrollTrigger: ".vertical-single-slide-last .slide-content",
            yPercent: defaultY,
            rotate: defaultRotate,
            duration: defaultDuration,
            ease: defaultEase,
            stagger: defaultStagger,
            clearProps: "all",
        });

        gsap.from(".vertical-single-slide-last .tricksword .letter", {
            scrollTrigger: ".vertical-single-slide-last .tricks",
            yPercent: defaultYH2,
            xPercent: defaultXH2,
            rotate: defaultRotateH2,
            duration: defaultDurationH2,
            ease: defaultEaseH2,
            stagger: defaultStaggerH2
        });

        gsap.from(".vertical-single-slide-last .footer-link-btn", {
            scrollTrigger: ".vertical-single-slide-last .footer-links-bottom",
            y: defaultYDescription,
            opacity: defaultOpacityDescription,
            rotate: 8,
            duration: defaultDurationDescription,
            ease: defaultEaseDescription,
            stagger: .1
        });

    },

    // mobile
    "(max-width: 540px)": function() {
        return function() {
            gsap.kill();
            // other cleanup code can go here. 
        };
    }

});