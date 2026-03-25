// src/utils/smoothScroll.js
// Initialize Lenis + GSAP ScrollTrigger integration
// Call initSmoothScroll() once in your App.jsx or main.jsx

import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

let lenis = null;

export function initSmoothScroll() {
  // Create Lenis instance
  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo easing
    direction: "vertical",
    gestureDirection: "vertical",
    smooth: true,
    smoothTouch: false,
    touchMultiplier: 2,
  });

  // Connect Lenis to GSAP ticker for ScrollTrigger compatibility
  lenis.on("scroll", ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);

  return lenis;
}

export function destroySmoothScroll() {
  if (lenis) {
    lenis.destroy();
    lenis = null;
  }
}

export function getLenis() {
  return lenis;
}

// Helper: smoothly scroll to an element
export function scrollTo(target, options = {}) {
  if (!lenis) return;
  lenis.scrollTo(target, { offset: -80, ...options });
}
