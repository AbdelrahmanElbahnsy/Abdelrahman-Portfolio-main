import { useRef, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

/* ─── Accessibility ──────────────────────────────────────────────────────── */

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ─── 1. useScrollReveal ─────────────────────────────────────────────────── */
/**
 * Fades up child elements on scroll.
 * @param {React.RefObject} containerRef - Ref to the scrollable container
 * @param {object} options
 * @param {string}  options.selector   - CSS selector for children to animate (default: '.reveal')
 * @param {number}  options.y          - Start offset Y (default: 40)
 * @param {number}  options.duration   - Tween duration (default: 0.9)
 * @param {number}  options.stagger    - Stagger between children (default: 0.12)
 * @param {string}  options.ease       - GSAP ease (default: 'power4.out')
 * @param {string}  options.start      - ScrollTrigger start (default: 'top 85%')
 * @param {boolean} options.once       - Only animate once (default: true)
 */
export function useScrollReveal(containerRef, options = {}) {
  const {
    selector = '.reveal',
    y = 40,
    duration = 0.9,
    stagger = 0.12,
    ease = 'power4.out',
    start = 'top 85%',
    once = true,
  } = options;

  useGSAP(
    () => {
      if (prefersReducedMotion() || !containerRef.current) return;

      const targets = containerRef.current.querySelectorAll(selector);
      if (!targets.length) return;

      gsap.set(targets, { opacity: 0, y });

      gsap.to(targets, {
        opacity: 1,
        y: 0,
        duration,
        stagger,
        ease,
        scrollTrigger: {
          trigger: containerRef.current,
          start,
          toggleActions: once ? 'play none none none' : 'play none none reverse',
        },
      });
    },
    { scope: containerRef, dependencies: [] },
  );
}

/* ─── 2. useStaggerReveal ────────────────────────────────────────────────── */
/**
 * Stagger-reveals children of a container with customizable from-values.
 * @param {React.RefObject} containerRef
 * @param {string} selector - Child selector
 * @param {object} fromVars - GSAP from vars (e.g. { opacity: 0, scale: 0.8 })
 * @param {object} toVars   - GSAP to vars (merged with defaults)
 */
export function useStaggerReveal(containerRef, selector, fromVars = {}, toVars = {}) {
  useGSAP(
    () => {
      if (prefersReducedMotion() || !containerRef.current) return;

      const targets = containerRef.current.querySelectorAll(selector);
      if (!targets.length) return;

      const defaults = { opacity: 0, y: 30, ...fromVars };
      gsap.set(targets, defaults);

      gsap.to(targets, {
        opacity: 1,
        y: 0,
        scale: 1,
        ...toVars,
        duration: toVars.duration || 0.8,
        stagger: toVars.stagger || 0.1,
        ease: toVars.ease || 'power4.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: toVars.start || 'top 85%',
          toggleActions: 'play none none none',
        },
      });
    },
    { scope: containerRef, dependencies: [] },
  );
}

/* ─── 3. useParallax ─────────────────────────────────────────────────────── */
/**
 * Applies a parallax scroll effect to an element.
 * @param {React.RefObject} ref   - Element ref
 * @param {number} speed          - Parallax speed multiplier (default: 0.3)
 * @param {string} direction      - 'y' or 'x' (default: 'y')
 */
export function useParallax(ref, speed = 0.3, direction = 'y') {
  useGSAP(
    () => {
      if (prefersReducedMotion() || !ref.current) return;

      gsap.to(ref.current, {
        [direction]: () => speed * 100,
        ease: 'none',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      });
    },
    { scope: ref, dependencies: [] },
  );
}

/* ─── 4. useTextReveal ───────────────────────────────────────────────────── */
/**
 * Splits text into characters and animates them in.
 * @param {React.RefObject} ref - Element containing the text
 * @param {object} options
 */
export function useTextReveal(ref, options = {}) {
  const { duration = 0.6, stagger = 0.03, ease = 'power4.out', delay = 0 } = options;

  useGSAP(
    () => {
      if (prefersReducedMotion() || !ref.current) return;

      const el = ref.current;
      const text = el.textContent;
      el.innerHTML = '';
      el.style.visibility = 'visible';

      // Wrap each character in a span
      [...text].forEach((char) => {
        const span = document.createElement('span');
        span.style.display = 'inline-block';
        span.style.opacity = '0';
        span.textContent = char === ' ' ? '\u00A0' : char;
        el.appendChild(span);
      });

      gsap.to(el.children, {
        opacity: 1,
        y: 0,
        duration,
        stagger,
        ease,
        delay,
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
          toggleActions: 'play none none none',
        },
      });
    },
    { scope: ref, dependencies: [] },
  );
}

/* ─── 5. useCountUp ──────────────────────────────────────────────────────── */
/**
 * Animates a number from 0 to a target value.
 * @param {React.RefObject} ref    - Element to display the count
 * @param {number} target          - Target number
 * @param {object} options
 */
export function useCountUp(ref, target, options = {}) {
  const { duration = 1.5, ease = 'power2.out', suffix = '' } = options;

  useGSAP(
    () => {
      if (prefersReducedMotion() || !ref.current) {
        if (ref.current) ref.current.textContent = `${target}${suffix}`;
        return;
      }

      const obj = { value: 0 };

      gsap.to(obj, {
        value: target,
        duration,
        ease,
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 90%',
          toggleActions: 'play none none none',
        },
        onUpdate: () => {
          if (ref.current) {
            ref.current.textContent = `${Math.round(obj.value)}${suffix}`;
          }
        },
      });
    },
    { scope: ref, dependencies: [target] },
  );
}

/* ─── 6. useMagneticHover ────────────────────────────────────────────────── */
/**
 * Creates a magnetic hover effect where an element moves toward the cursor.
 * @param {React.RefObject} ref      - Element ref
 * @param {number} strength          - Pull strength (default: 0.3)
 */
export function useMagneticHover(ref, strength = 0.3) {
  const xTo = useRef(null);
  const yTo = useRef(null);

  useGSAP(
    () => {
      if (prefersReducedMotion() || !ref.current) return;

      xTo.current = gsap.quickTo(ref.current, 'x', { duration: 0.4, ease: 'power3.out' });
      yTo.current = gsap.quickTo(ref.current, 'y', { duration: 0.4, ease: 'power3.out' });
    },
    { scope: ref, dependencies: [] },
  );

  const handleMouseMove = useCallback(
    (e) => {
      if (!ref.current || !xTo.current) return;
      const rect = ref.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      xTo.current((e.clientX - cx) * strength);
      yTo.current((e.clientY - cy) * strength);
    },
    [strength, ref],
  );

  const handleMouseLeave = useCallback(() => {
    if (!xTo.current) return;
    xTo.current(0);
    yTo.current(0);
  }, []);

  return { onMouseMove: handleMouseMove, onMouseLeave: handleMouseLeave };
}

/* ─── 7. useHeroTimeline ─────────────────────────────────────────────────── */
/**
 * Creates and returns a GSAP timeline for hero entrance animations.
 * The caller can chain .to() / .from() calls on the returned timeline.
 * @param {React.RefObject} containerRef
 * @param {object} options
 * @returns {{ timeline: gsap.core.Timeline | null }}
 */
export function useHeroTimeline(containerRef, options = {}) {
  const tlRef = useRef(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      tlRef.current = gsap.timeline({
        defaults: {
          ease: options.ease || 'power4.out',
          duration: options.duration || 0.9,
        },
        delay: options.delay || 0,
      });
    },
    { scope: containerRef, dependencies: [] },
  );

  return tlRef;
}

/* ─── 8. use3DTilt ───────────────────────────────────────────────────────── */
/**
 * Adds a 3D tilt effect on hover.
 * @param {React.RefObject} ref - Card element ref
 * @param {number} maxTilt - Maximum tilt in degrees (default: 8)
 */
export function use3DTilt(ref, maxTilt = 8) {
  const handleMouseMove = useCallback(
    (e) => {
      if (prefersReducedMotion() || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      gsap.to(ref.current, {
        rotateY: x * maxTilt,
        rotateX: -y * maxTilt,
        transformPerspective: 800,
        duration: 0.4,
        ease: 'power2.out',
      });
    },
    [maxTilt, ref],
  );

  const handleMouseLeave = useCallback(() => {
    if (!ref.current) return;
    gsap.to(ref.current, {
      rotateY: 0,
      rotateX: 0,
      duration: 0.6,
      ease: 'elastic.out(1, 0.5)',
    });
  }, [ref]);

  return { onMouseMove: handleMouseMove, onMouseLeave: handleMouseLeave };
}
