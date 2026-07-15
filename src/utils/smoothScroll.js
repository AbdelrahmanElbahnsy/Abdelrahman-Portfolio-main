import Lenis from 'lenis';
import gsap from 'gsap';

let lenisInstance = null;

/**
 * Initializes Lenis smooth scrolling.
 * Tuned for snappy feel — smooth enough to feel premium,
 * fast enough that ScrollTrigger animations fire promptly.
 */
export function initLenis() {
  if (lenisInstance) return lenisInstance;

  lenisInstance = new Lenis({
    duration: 0.6,           // Snappier (was 1.2) — less lag on fast scrolling
    easing: (t) => 1 - Math.pow(1 - t, 3),  // Cubic ease-out — quick start, smooth end
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1.2,    // More responsive wheel (was 1)
    touchMultiplier: 2,
    infinite: false,
  });

  // Integrate Lenis with GSAP's ticker to prevent layout thrashing from dual rAF loops
  gsap.ticker.add((time) => {
    lenisInstance.raf(time * 1000);
  });
  
  gsap.ticker.lagSmoothing(0);

  return lenisInstance;
}

/**
 * Returns the current Lenis instance (or null if not initialized).
 */
export function getLenis() {
  return lenisInstance;
}

/**
 * Destroys the Lenis instance and cleans up.
 */
export function destroyLenis() {
  if (lenisInstance) {
    lenisInstance.destroy();
    lenisInstance = null;
  }
}
