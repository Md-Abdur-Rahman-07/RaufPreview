// Count Children and store in var: countChildren

window.getCount = function(parent, getChildrensChildren) {
    var relevantChildren = 0;
    var children = parent.childNodes.length;
    for (var i = 0; i < children; i++) {
        if (parent.childNodes[i].nodeType != 3) {
            if (getChildrensChildren)
                relevantChildren += getCount(parent.childNodes[i], true);
            relevantChildren++;
        }
    }
    return relevantChildren;
}
var countChildren = getCount(document.getElementById('vertical-slider'), false);

// Source Article: https://nolanlawson.com/2019/02/10/building-a-modern-carousel-with-css-scroll-snap-smooth-scrolling-and-pinch-zoom/

// via https://github.com/tootsuite/mastodon/blob/f59ed3a4fafab776b4eeb92f805dfe1fecc17ee3/app/javascript/mastodon/scroll.js
const easingOutQuint = (x, t, b, c, d) =>
    c * ((t = t / d - 1) * t * t * t * t + 1) + b

function smoothScrollPolyfill(node, key, target) {
    const startTime = Date.now()
    const offset = node[key]
    const gap = target - offset
    const duration = 1000
    let interrupt = false

    const step = () => {
        const elapsed = Date.now() - startTime
        const percentage = elapsed / duration

        if (interrupt) {
            return
        }

        if (percentage > 1) {
            cleanup()
            return
        }

        node[key] = easingOutQuint(0, elapsed, offset, gap, duration)
        requestAnimationFrame(step)
    }

    const cancel = () => {
        interrupt = true
        cleanup()
    }

    const cleanup = () => {
        node.removeEventListener('wheel', cancel)
        node.removeEventListener('touchstart', cancel)
    }

    node.addEventListener('wheel', cancel, {
        passive: true
    })
    node.addEventListener('touchstart', cancel, {
        passive: true
    })

    step()

    return cancel
}

function testSupportsSmoothScroll() {
    let supports = false
    try {
        let div = document.createElement('div')
        div.scrollTo({
            top: 0,
            get behavior() {
                supports = true
                return 'smooth'
            }
        })
    } catch (err) {} // Edge throws an error
    return supports
}

const hasNativeSmoothScroll = testSupportsSmoothScroll()

function smoothScroll(node, topOrLeft, vertical) {
    if (hasNativeSmoothScroll) {
        return node.scrollTo({
            [vertical ? 'top' : 'left']: topOrLeft,
            behavior: 'smooth'
        })
    } else {
        return smoothScrollPolyfill(node, vertical ? 'scrollTop' : 'scrollTop', topOrLeft)
    }
}

function debounce(func, ms) {
    let timeout
    return () => {
        clearTimeout(timeout)
        timeout = setTimeout(() => {
            timeout = null
            func()
        }, ms)
    }
}

const indicators = document.querySelectorAll('.indicator-button')
const scroller = document.querySelector('#vertical-slider')

function setAriaLabels() {
    indicators.forEach((indicator, i) => {
        indicator.setAttribute('aria-label', `Scroll to item #${i + 1}`)
    })
}

function setAriaPressed(index) {
    indicators.forEach((indicator, i) => {
        indicator.setAttribute('aria-pressed', !!(i === index))
    })
}

// I Replaced number of slides with var countChildren
indicators.forEach((indicator, i) => {
    indicator.addEventListener('click', e => {
        e.preventDefault()
        e.stopPropagation()
        setAriaPressed(i)
        const scrollTop = Math.floor(scroller.scrollHeight * (i / countChildren))
        smoothScroll(scroller, scrollTop, true)
    })
})

// I Replaced number of slides with var countChildren
// 5 = delay in of selected Aria
scroller.addEventListener('scroll', debounce(() => {
    let index = Math.round((scroller.scrollTop / scroller.scrollHeight) * countChildren)
    setAriaPressed(index)
}, 5))

setAriaLabels()