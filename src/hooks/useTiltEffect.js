import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * useTiltEffect — 3D tilt + spotlight glare on hover
 *
 * @param {React.RefObject} ref - Card element ref
 * @param {Object} options
 * @param {number} options.maxTilt - Max tilt angle in degrees, default 8
 * @param {boolean} options.glare - Show spotlight glare, default true
 * @param {boolean} options.disabled - Force disable
 *
 * Usage:
 *   const cardRef = useRef(null);
 *   useTiltEffect(cardRef, { maxTilt: 10 });
 */
export function useTiltEffect(ref, { maxTilt = 8, glare = true, disabled = false } = {}) {
    const glareElRef = useRef(null);

    const isTouchDevice =
        typeof window !== 'undefined' &&
        ('ontouchstart' in window || navigator.maxTouchPoints > 0);

    useEffect(() => {
        const el = ref?.current;
        if (!el || disabled || isTouchDevice) return;

        // Set perspective on parent for 3D effect
        el.style.transformStyle = 'preserve-3d';

        // Create glare overlay if enabled
        let glareEl = null;
        if (glare) {
            glareEl = document.createElement('div');
            glareEl.style.cssText = `
                position: absolute;
                inset: 0;
                border-radius: inherit;
                pointer-events: none;
                opacity: 0;
                background: radial-gradient(circle at 50% 50%, rgba(255,255,255,0.12), transparent 60%);
                transition: opacity 0.3s;
                z-index: 10;
            `;
            el.style.position = el.style.position || 'relative';
            el.style.overflow = 'hidden';
            el.appendChild(glareEl);
            glareElRef.current = glareEl;
        }

        const handleMouseMove = (e) => {
            const rect = el.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;  // 0-1
            const y = (e.clientY - rect.top) / rect.height;   // 0-1

            const rotateX = (0.5 - y) * maxTilt * 2;
            const rotateY = (x - 0.5) * maxTilt * 2;

            gsap.to(el, {
                rotateX: rotateX,
                rotateY: rotateY,
                transformPerspective: 800,
                duration: 0.4,
                ease: 'power2.out',
                overwrite: 'auto',
            });

            // Move glare spotlight to cursor position
            if (glareEl) {
                glareEl.style.opacity = '1';
                glareEl.style.background = `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(255,255,255,0.1), transparent 55%)`;
            }
        };

        const handleMouseLeave = () => {
            gsap.to(el, {
                rotateX: 0,
                rotateY: 0,
                duration: 0.6,
                ease: 'elastic.out(1, 0.5)',
                overwrite: 'auto',
            });

            if (glareEl) {
                glareEl.style.opacity = '0';
            }
        };

        el.addEventListener('mousemove', handleMouseMove, { passive: true });
        el.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            el.removeEventListener('mousemove', handleMouseMove);
            el.removeEventListener('mouseleave', handleMouseLeave);
            if (glareEl && el.contains(glareEl)) {
                el.removeChild(glareEl);
            }
        };
    }, [ref, maxTilt, glare, disabled, isTouchDevice]);
}

export default useTiltEffect;
