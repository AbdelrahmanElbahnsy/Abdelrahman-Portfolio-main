import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * useScrollVelocityBlur — Applies subtle directional blur when scrolling fast
 *
 * @param {React.RefObject} ref - Element to apply blur to (typically main content wrapper)
 * @param {Object} options
 * @param {number} options.maxBlur - Maximum blur in px, default 2.5
 * @param {number} options.threshold - Min velocity to trigger, default 800
 *
 * Usage:
 *   const mainRef = useRef(null);
 *   useScrollVelocityBlur(mainRef, { maxBlur: 2 });
 */
export function useScrollVelocityBlur(ref, { maxBlur = 2.5, threshold = 800 } = {}) {
    const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    useEffect(() => {
        const el = ref?.current;
        if (!el || prefersReducedMotion) return;

        const st = ScrollTrigger.create({
            trigger: document.body,
            start: 'top top',
            end: 'bottom bottom',
            onUpdate: (self) => {
                const velocity = Math.abs(self.getVelocity());
                const blurAmount = velocity > threshold
                    ? Math.min(maxBlur, ((velocity - threshold) / 2000) * maxBlur)
                    : 0;

                gsap.to(el, {
                    filter: blurAmount > 0.2 ? `blur(${blurAmount}px)` : 'blur(0px)',
                    duration: blurAmount > 0.2 ? 0.1 : 0.4, // Fast on, slow off
                    ease: 'power2.out',
                    overwrite: 'auto',
                });
            },
        });

        return () => st.kill();
    }, [ref, maxBlur, threshold, prefersReducedMotion]);
}

export default useScrollVelocityBlur;
