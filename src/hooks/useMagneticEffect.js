import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * useMagneticEffect — Makes an element magnetically attract toward the cursor
 *
 * @param {React.RefObject} ref - Element ref to apply the effect to
 * @param {Object} options
 * @param {number} options.strength - Pull strength (0-1), default 0.3
 * @param {number} options.radius - Activation radius in px, default 100
 * @param {boolean} options.disabled - Force disable
 *
 * Usage:
 *   const btnRef = useRef(null);
 *   useMagneticEffect(btnRef, { strength: 0.4 });
 */
export function useMagneticEffect(ref, { strength = 0.3, radius = 100, disabled = false } = {}) {
    const isTouchDevice =
        typeof window !== 'undefined' &&
        ('ontouchstart' in window || navigator.maxTouchPoints > 0);

    useEffect(() => {
        const el = ref?.current;
        if (!el || disabled || isTouchDevice) return;

        const handleMouseMove = (e) => {
            const rect = el.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const dx = e.clientX - centerX;
            const dy = e.clientY - centerY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const maxDist = Math.max(rect.width, rect.height) / 2 + radius;

            if (dist < maxDist) {
                const pull = (1 - dist / maxDist) * strength;
                gsap.to(el, {
                    x: dx * pull,
                    y: dy * pull,
                    duration: 0.4,
                    ease: 'power3.out',
                    overwrite: 'auto',
                });
            }
        };

        const handleMouseLeave = () => {
            gsap.to(el, {
                x: 0,
                y: 0,
                duration: 0.6,
                ease: 'elastic.out(1, 0.4)',
                overwrite: 'auto',
            });
        };

        el.addEventListener('mousemove', handleMouseMove, { passive: true });
        el.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            el.removeEventListener('mousemove', handleMouseMove);
            el.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [ref, strength, radius, disabled, isTouchDevice]);
}

export default useMagneticEffect;
